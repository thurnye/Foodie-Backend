/**
 * Build MongoDB filter query from request parameters
 */
export const buildRecipeFilter = (queryParams: any) => {
  const filter: any = {};

  // Text search on recipe name
  if (queryParams.search) {
    filter.$or = [
      { 'basicInfo.recipeName': { $regex: queryParams.search, $options: 'i' } },
      { $text: { $search: queryParams.search } },
    ];
  }

  // Filter by categories (support both 'category' and 'categories')
  const categoryParam = queryParams.category || queryParams.categories;
  if (categoryParam) {
    const categories = Array.isArray(categoryParam)
      ? categoryParam
      : [categoryParam];
    filter['basicInfo.categories.value'] = { $in: categories };
  }

  // Filter by tags
  if (queryParams.tags) {
    const tags = Array.isArray(queryParams.tags)
      ? queryParams.tags
      : [queryParams.tags];
    filter['basicInfo.tags.value'] = { $in: tags };
  }

  // Filter by difficulty level
  if (queryParams.level) {
    filter['basicInfo.level.value'] = queryParams.level;
  }

  // Filter by minimum rating
  if (queryParams.minRating !== undefined) {
    filter.averageRating = { $gte: parseFloat(queryParams.minRating) };
  }

  // Filter by author
  if (queryParams.author) {
    filter.author = queryParams.author;
  }

  return filter;
};

/**
 * Build sort options from request parameters
 */
export const buildSortOptions = (sortBy: string = 'createdAt', sortOrder: string = 'desc') => {
  const sort: any = {};

  if (sortBy === 'recipeName') {
    sort['basicInfo.recipeName'] = sortOrder === 'asc' ? 1 : -1;
  } else if (sortBy === 'averageRating') {
    sort.averageRating = sortOrder === 'asc' ? 1 : -1;
  } else {
    sort.createdAt = sortOrder === 'asc' ? 1 : -1;
  }

  return sort;
};

/**
 * Calculate pagination metadata
 */
export const getPaginationMeta = (page: number, limit: number, total: number) => {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};
