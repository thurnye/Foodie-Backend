"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaginationMeta = exports.buildSortOptions = exports.buildRecipeFilter = void 0;
const buildRecipeFilter = (queryParams) => {
    const filter = {};
    if (queryParams.search) {
        filter.$or = [
            { 'basicInfo.recipeName': { $regex: queryParams.search, $options: 'i' } },
            { $text: { $search: queryParams.search } },
        ];
    }
    const categoryParam = queryParams.category || queryParams.categories;
    if (categoryParam) {
        const categories = Array.isArray(categoryParam)
            ? categoryParam
            : [categoryParam];
        filter['basicInfo.categories.value'] = { $in: categories };
    }
    if (queryParams.tags) {
        const tags = Array.isArray(queryParams.tags)
            ? queryParams.tags
            : [queryParams.tags];
        filter['basicInfo.tags.value'] = { $in: tags };
    }
    if (queryParams.level) {
        filter['basicInfo.level.value'] = queryParams.level;
    }
    if (queryParams.minRating !== undefined) {
        filter.averageRating = { $gte: parseFloat(queryParams.minRating) };
    }
    if (queryParams.author) {
        filter.author = queryParams.author;
    }
    return filter;
};
exports.buildRecipeFilter = buildRecipeFilter;
const buildSortOptions = (sortBy = 'createdAt', sortOrder = 'desc') => {
    const sort = {};
    if (sortBy === 'recipeName') {
        sort['basicInfo.recipeName'] = sortOrder === 'asc' ? 1 : -1;
    }
    else if (sortBy === 'averageRating') {
        sort.averageRating = sortOrder === 'asc' ? 1 : -1;
    }
    else {
        sort.createdAt = sortOrder === 'asc' ? 1 : -1;
    }
    return sort;
};
exports.buildSortOptions = buildSortOptions;
const getPaginationMeta = (page, limit, total) => {
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
exports.getPaginationMeta = getPaginationMeta;
//# sourceMappingURL=filters.js.map