import { ICookbook, ICookbookPopulated, CookbookStatus, CookbookTheme, CookbookLayout } from '../Types/cookbook.types';
import { Types } from 'mongoose';
import { Errors, logger } from '@foodie/libs';
import axios from 'axios';
import Cookbook from '../db/Cookbook';

const RECIPE_SERVICE_URL = process.env.RECIPE_SERVICE_URL || 'http://localhost:3003';

interface CreateCookbookData {
  title: string;
  description?: string;
  recipes: string[];
  theme?: CookbookTheme;
  layout?: CookbookLayout;
  coverImage?: string;
  customColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
  authorBio?: string;
  authorImage?: string;
  isPublic?: boolean;
}

interface UpdateCookbookData {
  title?: string;
  description?: string;
  recipes?: string[];
  theme?: CookbookTheme;
  layout?: CookbookLayout;
  coverImage?: string;
  customColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
  authorBio?: string;
  authorImage?: string;
  isPublic?: boolean;
}

interface ListCookbooksQuery {
  page?: number;
  limit?: number;
  status?: CookbookStatus;
  isPublic?: boolean;
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}

class CookbookService {
  /**
   * Fetch recipe details from recipe service
   */
  private async fetchRecipeDetails(recipeIds: string[], userId: string): Promise<any[]> {
    if (!recipeIds || recipeIds.length === 0) {
      return [];
    }

    logger.info('fetchRecipeDetails called::::::--------------------------', {
      recipeCount: recipeIds.length,
      recipeServiceUrl: RECIPE_SERVICE_URL,
      userId
    });

    try {
      const recipePromises = recipeIds.map(async (recipeId) => {
        try {
          const url = `${RECIPE_SERVICE_URL}/api/recipe/${recipeId}`;
          logger.info('Fetching recipe :::-----------------------------------', { recipeId, url, userId });

          const response = await axios.get(url, {
            headers: {
              'x-user-id': userId,
            },
          });

          logger.info('Recipe fetch response', {
            recipeId,
            status: response.status,
            hasData: !!response.data,
            dataKeys: response.data ? Object.keys(response.data) : []
          });

          // Extract the actual recipe data from the API response wrapper
          // Response format: { success: true, data: <recipe>, message: "..." }
          // console.log('RESPONSE:::========================', response.data)
          const recipeData = response.data?.data || null;

          if (!recipeData) {
            logger.warn('Recipe data is null after extraction', {
              recipeId,
              responseData: response.data
            });
          }

          return recipeData;
        } catch (error: any) {
          logger.warn(`Failed to fetch recipe ${recipeId}`, {
            error: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText
          });
          return null;
        }
      });

      const recipes = await Promise.all(recipePromises);
      const validRecipes = recipes.filter((recipe) => recipe !== null);

      logger.info('Recipe fetch complete', {
        totalRequested: recipeIds.length,
        successfullyFetched: validRecipes.length,
        failed: recipeIds.length - validRecipes.length
      });

      return validRecipes;
    } catch (error) {
      logger.error('Error fetching recipe details', { error });
      return [];
    }
  }

  /**
   * Validate recipes exist and are accessible by fetching from recipe service
   */
  private async validateRecipes(recipeIds: string[], userId: string): Promise<void> {
    try {
      // Make requests to recipe service to validate each recipe exists and is accessible
      const validationPromises = recipeIds.map(async (recipeId) => {
        try {
          const response = await axios.get(`${RECIPE_SERVICE_URL}/api/recipe/${recipeId}`, {
            headers: {
              'x-user-id': userId,
            },
          });
          return response.status === 200;
        } catch (error: any) {
          // If 404 or 403, recipe doesn't exist or not accessible
          if (error.response?.status === 404 || error.response?.status === 403) {
            return false;
          }
          throw error;
        }
      });

      const results = await Promise.all(validationPromises);
      const allValid = results.every((valid) => valid === true);

      if (!allValid) {
        throw Errors.badRequest(
          'Some recipes do not exist or you do not have permission to access them'
        );
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('do not exist')) {
        throw error;
      }
      logger.error('Error validating recipes with recipe service', { error });
      throw Errors.internalServer('Failed to validate recipes');
    }
  }

  /**
   * Create a new cookbook
   */
  async createCookbook(userId: string, data: CreateCookbookData): Promise<ICookbook> {
    try {
      // Validate recipes if provided
      let recipeIds: Types.ObjectId[] = [];

      if (data.recipes && data.recipes.length > 0) {
        if (data.recipes.length > 100) {
          throw Errors.badRequest('A cookbook cannot contain more than 100 recipes');
        }

        // Verify all recipes exist and are accessible via recipe service
        await this.validateRecipes(data.recipes, userId);
        recipeIds = data.recipes.map((id) => new Types.ObjectId(id));
      }

      // Create cookbook
      const cookbook = new Cookbook({
        author: new Types.ObjectId(userId),
        title: data.title,
        description: data.description,
        recipes: recipeIds,
        theme: data.theme || CookbookTheme.MODERN,
        layout: data.layout || CookbookLayout.SINGLE_COLUMN,
        coverImage: data.coverImage,
        customColors: data.customColors,
        authorBio: data.authorBio,
        authorImage: data.authorImage,
        isPublic: data.isPublic || false,
        status: CookbookStatus.DRAFT,
      });

      await cookbook.save();

      logger.info('Cookbook created', { cookbookId: cookbook._id, userId });

      return cookbook;
    } catch (error) {
      logger.error('Error creating cookbook', { error, userId });
      throw error;
    }
  }

  /**
   * Get cookbook by ID
   */
  async getCookbookById(cookbookId: string, userId?: string): Promise<ICookbook | ICookbookPopulated> {
    try {
      const cookbook = await Cookbook.findOne({
        _id: cookbookId,
        isActive: true,
      });

      if (!cookbook) {
        throw Errors.notFound('Cookbook not found');
      }

      // Check permissions: must be author or cookbook must be public
      if (userId) {
        const isAuthor = cookbook.author.toString() === userId;
        if (!isAuthor && !cookbook.isPublic) {
          throw Errors.forbidden('You do not have permission to access this cookbook');
        }
      } else if (!cookbook.isPublic) {
        throw Errors.forbidden('This cookbook is private');
      }

      // Populate recipes from recipe service
      if (cookbook.recipes && cookbook.recipes.length > 0) {
        const recipeIds = cookbook.recipes.map((id) => id.toString());
        // Use authenticated userId if available, otherwise use cookbook author's ID
        // The author must have access to these recipes since they added them
        const fetchUserId = userId || cookbook.author.toString();

        logger.info('Fetching recipe details for cookbook', {
          cookbookId: cookbook._id,
          recipeCount: recipeIds.length,
          fetchUserId,
          isAuthenticated: !!userId
        });

        console.log('USERID:::', fetchUserId);
        const recipes = await this.fetchRecipeDetails(recipeIds, fetchUserId);
        console.log('RECIPES FETCHED:::======================', recipes.length, 'recipes')

        logger.info('Fetched recipes', {
          cookbookId: cookbook._id,
          fetchedCount: recipes.length,
          expectedCount: recipeIds.length
        });

        // Convert Mongoose document to plain object to allow recipe population
        const cookbookObject = cookbook.toObject();
        cookbookObject.recipes = recipes;

        console.log("cookbook with recipes==============", cookbookObject.recipes.length)

        return cookbookObject as ICookbookPopulated;
      }

      console.log("cookbook (no recipes)==============", cookbook)

      return cookbook;
    } catch (error) {
      logger.error('Error fetching cookbook', { error, cookbookId });
      throw error;
    }
  }

  /**
   * Get user's cookbooks
   */
  async getMyCookbooks(userId: string, query: ListCookbooksQuery = {}): Promise<{
    cookbooks: (ICookbook | ICookbookPopulated)[];
    pagination: {
      page: number;
      limit: number;
      totalPages: number;
      totalCookbooks: number;
    };
  }> {
    try {
      const page = query.page || 1;
      const limit = query.limit || 10;
      const skip = (page - 1) * limit;
      const sortBy = query.sortBy || 'createdAt';
      const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

      // Build filter
      const filter: any = {
        author: userId,
        isActive: true,
      };

      if (query.status) {
        filter.status = query.status;
      }

      if (query.isPublic !== undefined) {
        filter.isPublic = query.isPublic;
      }

      // Get total count
      const totalCookbooks = await Cookbook.countDocuments(filter);

      // Get cookbooks
      const cookbooks = await Cookbook.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit);

      // Populate recipes for each cookbook
      const cookbooksWithRecipes = await Promise.all(
        cookbooks.map(async (cookbook) => {
          if (cookbook.recipes && cookbook.recipes.length > 0) {
            const recipeIds = cookbook.recipes.map((id) => id.toString());
            const recipes = await this.fetchRecipeDetails(recipeIds, userId);
            return {
              ...cookbook.toObject(),
              recipes,
            };
          }
          return cookbook.toObject();
        })
      );

      return {
        cookbooks: cookbooksWithRecipes as any,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(totalCookbooks / limit),
          totalCookbooks,
        },
      };
    } catch (error) {
      logger.error('Error fetching user cookbooks', { error, userId });
      throw error;
    }
  }

  /**
   * Get public cookbooks
   */
  async getPublicCookbooks(query: ListCookbooksQuery = {}): Promise<{
    cookbooks: (ICookbook | ICookbookPopulated)[];
    pagination: {
      page: number;
      limit: number;
      totalPages: number;
      totalCookbooks: number;
    };
  }> {
    try {
      const page = query.page || 1;
      const limit = query.limit || 10;
      const skip = (page - 1) * limit;
      const sortBy = query.sortBy || 'createdAt';
      const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

      // Build filter
      const filter: any = {
        isPublic: true,
        isActive: true,
        status: CookbookStatus.COMPLETED, // Only show completed cookbooks publicly
      };

      // Get total count
      const totalCookbooks = await Cookbook.countDocuments(filter);

      // Get cookbooks
      const cookbooks = await Cookbook.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit);

      // Populate recipes for each cookbook (using a generic user context for public access)
      const cookbooksWithRecipes = await Promise.all(
        cookbooks.map(async (cookbook) => {
          if (cookbook.recipes && cookbook.recipes.length > 0) {
            const recipeIds = cookbook.recipes.map((id) => id.toString());
            // For public cookbooks, we fetch recipes without user context (public recipes only)
            const recipes = await this.fetchRecipeDetails(recipeIds, cookbook.author.toString());
            return {
              ...cookbook.toObject(),
              recipes,
            };
          }
          return cookbook.toObject();
        })
      );

      return {
        cookbooks: cookbooksWithRecipes as any,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(totalCookbooks / limit),
          totalCookbooks,
        },
      };
    } catch (error) {
      logger.error('Error fetching public cookbooks', { error });
      throw error;
    }
  }

  /**
   * Update cookbook
   */
  async updateCookbook(
    cookbookId: string,
    userId: string,
    updates: UpdateCookbookData
  ): Promise<ICookbook> {
    try {
      const cookbook = await Cookbook.findOne({
        _id: cookbookId,
        isActive: true,
      });

      if (!cookbook) {
        throw Errors.notFound('Cookbook not found');
      }

      // Check if user is the author
      if (cookbook.author.toString() !== userId) {
        throw Errors.forbidden('You can only update your own cookbooks');
      }

      // Cannot update if currently generating
      if (cookbook.status === CookbookStatus.GENERATING) {
        throw Errors.badRequest('Cannot update cookbook while it is being generated');
      }

      // Validate recipes if provided
      if (updates.recipes !== undefined) {
        if (updates.recipes.length > 100) {
          throw Errors.badRequest('A cookbook cannot contain more than 100 recipes');
        }

        if (updates.recipes.length > 0) {
          // Verify all recipes exist and are accessible via recipe service
          await this.validateRecipes(updates.recipes, userId);
        }

        const recipeIds = updates.recipes.map((id) => new Types.ObjectId(id));
        cookbook.recipes = recipeIds;
      }

      // Update fields
      if (updates.title !== undefined) cookbook.title = updates.title;
      if (updates.description !== undefined) cookbook.description = updates.description;
      if (updates.theme !== undefined) cookbook.theme = updates.theme;
      if (updates.layout !== undefined) cookbook.layout = updates.layout;
      if (updates.coverImage !== undefined) cookbook.coverImage = updates.coverImage;
      if (updates.customColors !== undefined) cookbook.customColors = updates.customColors;
      if (updates.authorBio !== undefined) cookbook.authorBio = updates.authorBio;
      if (updates.authorImage !== undefined) cookbook.authorImage = updates.authorImage;
      if (updates.isPublic !== undefined) cookbook.isPublic = updates.isPublic;

      // Reset status to draft if content changed
      if (updates.recipes || updates.theme || updates.layout) {
        cookbook.status = CookbookStatus.DRAFT;
        cookbook.pdfUrl = undefined;
        cookbook.generationProgress = 0;
      }

      await cookbook.save();

      logger.info('Cookbook updated', { cookbookId, userId });

      return cookbook;
    } catch (error) {
      logger.error('Error updating cookbook', { error, cookbookId });
      throw error;
    }
  }

  /**
   * Delete cookbook (soft delete)
   */
  async deleteCookbook(cookbookId: string, userId: string): Promise<void> {
    try {
      const cookbook = await Cookbook.findOne({
        _id: cookbookId,
        isActive: true,
      });

      if (!cookbook) {
        throw Errors.notFound('Cookbook not found');
      }

      // Check if user is the author
      if (cookbook.author.toString() !== userId) {
        throw Errors.forbidden('You can only delete your own cookbooks');
      }

      // Soft delete
      cookbook.isActive = false;
      await cookbook.save();

      logger.info('Cookbook deleted', { cookbookId, userId });
    } catch (error) {
      logger.error('Error deleting cookbook', { error, cookbookId });
      throw error;
    }
  }

  /**
   * Update cookbook generation status
   */
  async updateGenerationStatus(
    cookbookId: string,
    status: CookbookStatus,
    progress?: number,
    pdfUrl?: string,
    errorMessage?: string,
    pageCount?: number,
    fileSize?: number
  ): Promise<ICookbook> {
    try {
      const cookbook = await Cookbook.findOne({
        _id: cookbookId,
        isActive: true,
      });

      if (!cookbook) {
        throw Errors.notFound('Cookbook not found');
      }

      cookbook.status = status;

      if (progress !== undefined) {
        cookbook.generationProgress = progress;
      }

      if (pdfUrl) {
        cookbook.pdfUrl = pdfUrl;
        cookbook.lastGeneratedAt = new Date();
      }

      if (errorMessage) {
        cookbook.errorMessage = errorMessage;
      }

      if (pageCount) {
        cookbook.pageCount = pageCount;
      }

      if (fileSize) {
        cookbook.fileSize = fileSize;
      }

      await cookbook.save();

      logger.info('Cookbook generation status updated', {
        cookbookId,
        status,
        progress,
      });

      return cookbook;
    } catch (error) {
      logger.error('Error updating generation status', { error, cookbookId });
      throw error;
    }
  }
}

export default new CookbookService();
