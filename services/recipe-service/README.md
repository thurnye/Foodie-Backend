# Recipe Service - Foodie Backend

Fully functional Recipe CRUD service with reviews and cookbook generation for the Foodie Blog platform.

## Features

- ✅ **Recipe CRUD Operations**
  - Create, read, update, delete recipes
  - Rich recipe schema with ingredients, methods, nutritional facts
  - Support for multimedia content (images, videos)
  - Categories and tags for organization

- ✅ **Advanced Search & Filtering**
  - Full-text search on recipe names
  - Filter by categories, tags, difficulty level
  - Filter by minimum rating
  - Pagination support
  - Sort by date, rating, or name

- ✅ **Review System**
  - Add reviews with ratings (1-5 stars)
  - Automatic average rating calculation
  - One review per user per recipe
  - Update and delete reviews
  - Review pagination

- ✅ **Cookbook Generation**
  - Generate PDF cookbook stub
  - Compiles user's recipes into downloadable format
  - Returns simulated PDF URL

## API Endpoints

### Recipes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/recipe/add/:userId` | Create new recipe | No* |
| POST | `/api/recipe` | List recipes with filters | No |
| POST | `/api/recipe/query` | Advanced search | No |
| POST | `/api/recipe/user/:userId` | Get user's recipes | No |
| GET | `/api/recipe/:id` | Get recipe by ID | No |
| PATCH | `/api/recipe/:id` | Update recipe | Yes |
| DELETE | `/api/recipe/:id` | Delete recipe | Yes |

*Can be protected by checking authenticated user matches `:userId`

### Reviews

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/review/recipe` | Add review | Yes |
| GET | `/api/review/recipe/:recipeId` | Get recipe reviews | No |
| GET | `/api/review/user/:recipeId` | Get user's review | Yes |
| PATCH | `/api/review/:reviewId` | Update review | Yes |
| DELETE | `/api/review/:reviewId` | Delete review | Yes |

### Cookbook

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/recipe/generateCookBook/:userId` | Generate cookbook PDF | No* |
| GET | `/api/recipe/cookbook/:pdfId` | Get cookbook status | No |

## Recipe Schema

```typescript
{
  basicInfo: {
    recipeName: string;
    duration: { value: string; label: string };
    level: { value: string; label: string };
    serving: { value: string; label: string };
    tags: Array<{ value: string; label: string }>;
    categories: Array<{ value: string; label: string }>;
  };
  details: {
    thumbnail: string;
    about: Array<{
      type: 'text' | 'image' | 'video';
      value: any;
      isUnsplash?: boolean;
      isMultiple?: boolean;
    }>;
    faqs: Array<{ ques: string; ans: string }>;
  };
  nutritionalFacts: Array<{
    name: string;
    amount: string;
    unit: string;
  }>;
  directions: {
    methods: Array<{
      step: Array<ContentBlock>;
    }>;
    ingredients: Array<{
      name: string;
      type: 'main' | 'dressing';
    }>;
  };
  author: ObjectId;
  averageRating: number;
  totalReviews: number;
}
```

## Example Requests

### Create Recipe

```bash
curl -X POST http://localhost:3003/api/recipe/add/USER_ID \
  -H "Content-Type: application/json" \
  -d '{
    "basicInfo": {
      "recipeName": "Chocolate Chip Cookies",
      "duration": { "value": "30", "label": "30 minutes" },
      "level": { "value": "easy", "label": "Easy" },
      "serving": { "value": "12", "label": "12 cookies" },
      "tags": [
        { "value": "dessert", "label": "Dessert" },
        { "value": "cookies", "label": "Cookies" }
      ],
      "categories": [
        { "value": "baking", "label": "Baking" }
      ]
    },
    "details": {
      "thumbnail": "https://example.com/cookie.jpg",
      "about": [
        {
          "type": "text",
          "value": "Classic chocolate chip cookies that are crispy on the outside and chewy on the inside."
        }
      ],
      "faqs": []
    },
    "nutritionalFacts": [
      { "name": "Calories", "amount": "150", "unit": "kcal" }
    ],
    "directions": {
      "methods": [
        {
          "step": [
            { "type": "text", "value": "Preheat oven to 375°F" }
          ]
        }
      ],
      "ingredients": [
        { "name": "Flour", "type": "main" },
        { "name": "Chocolate chips", "type": "main" }
      ]
    }
  }'
```

### List Recipes with Filters

```bash
curl -X POST http://localhost:3003/api/recipe \
  -H "Content-Type: application/json" \
  -d '{
    "page": 1,
    "limit": 10,
    "categories": ["baking"],
    "minRating": 4,
    "sortBy": "averageRating",
    "sortOrder": "desc"
  }'
```

### Add Review

```bash
curl -X POST http://localhost:3003/api/review/recipe \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "recipeId": "RECIPE_ID",
    "review": "Amazing recipe! The cookies turned out perfect.",
    "rating": 5
  }'
```

### Generate Cookbook

```bash
curl -X POST http://localhost:3003/api/recipe/generateCookBook/USER_ID
```

## Environment Variables

```env
PORT=3003
MONGODB_URI=mongodb://localhost:27017/FoodieBlog
JWT_ACCESS_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=info
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Integration with Existing Data

This service is compatible with your existing MongoDB recipe data. The schema matches the structure from your `Foodie_Backend/Model/recipe.js` with additional enhancements:

- `averageRating` field for quick access to rating
- `totalReviews` counter
- Improved indexes for better query performance
- TypeScript types for type safety

## Notes

- The cookbook generation is currently a stub that returns a simulated PDF URL
- To implement actual PDF generation, integrate libraries like `puppeteer` or `pdfkit`
- Reviews are limited to one per user per recipe
- Average ratings are automatically calculated when reviews are added/updated/deleted
- All routes support both `/api/recipe/*` and `/recipe/*` prefixes for backward compatibility

## Architecture

- **Models**: TypeScript Mongoose schemas with proper typing
- **Services**: Business logic layer (RecipeService, ReviewService, CookbookService)
- **Controllers**: Request handlers with validation
- **Routes**: Express route definitions
- **Validators**: Joi schemas for input validation
- **Filters**: Query building and pagination helpers

## Testing

Use the provided test scripts or tools like Postman to test endpoints. Make sure MongoDB is running and the service is started before testing.
