import { ICookbook, ICookbookPopulated, CookbookStatus, CookbookTheme, CookbookLayout } from '../Types/cookbook.types';
import { Types } from 'mongoose';
import { Errors, logger } from '@foodie/libs';
import Cookbook from '../db/Cookbook';
import { fetchUserData } from '../utils/userClient';

interface CreateCookbookData {
  title: string;
  description?: string;
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
   * Create a new cookbook
   */
  async createCookbook(userId: string, data: CreateCookbookData): Promise<ICookbook> {
    try {
      // Create cookbook (books will be added separately via Book API)
      const cookbook = new Cookbook({
        author: new Types.ObjectId(userId),
        title: data.title,
        description: data.description,
        books: [], // Empty books array, books added via Book API
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
      }).populate({
        path: 'books',
        match: { isActive: true },
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

      // Fetch author data from user service
      const authorData = await fetchUserData(cookbook.author.toString());

      // Convert to plain object and attach author data
      const cookbookObj = cookbook.toObject();
      if (authorData) {
        cookbookObj.author = authorData as any;
      }

      logger.info('Cookbook retrieved', {
        cookbookId: cookbook._id,
        bookCount: cookbook.books?.length || 0,
        authorPopulated: !!authorData,
      });

      return cookbookObj;
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

      // Get cookbooks and populate books
      const cookbooks = await Cookbook.find(filter)
        .populate({
          path: 'books',
          match: { isActive: true },
        })
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit);

      // Fetch author data for each cookbook
      const cookbooksWithAuthors = await Promise.all(
        cookbooks.map(async (cookbook) => {
          const cookbookObj = cookbook.toObject();
          const authorData = await fetchUserData(cookbook.author.toString());
          if (authorData) {
            cookbookObj.author = authorData as any;
          }
          return cookbookObj;
        })
      );

      return {
        cookbooks: cookbooksWithAuthors as any,
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

      // Get cookbooks and populate books
      const cookbooks = await Cookbook.find(filter)
        .populate({
          path: 'books',
          match: { isActive: true, isPublic: true }, // Only show public books for public cookbooks
        })
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit);

      // Fetch author data for each cookbook
      const cookbooksWithAuthors = await Promise.all(
        cookbooks.map(async (cookbook) => {
          const cookbookObj = cookbook.toObject();
          const authorData = await fetchUserData(cookbook.author.toString());
          if (authorData) {
            cookbookObj.author = authorData as any;
          }
          return cookbookObj;
        })
      );

      return {
        cookbooks: cookbooksWithAuthors as any,
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

      // Update fields (books are managed via Book API)
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
      if (updates.theme || updates.layout) {
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

  // Extra page methods removed - extra pages are now stored in books, not cookbooks
  // Use BookService.addPage(), BookService.updatePage(), and BookService.deletePage() instead
}

export default new CookbookService();
