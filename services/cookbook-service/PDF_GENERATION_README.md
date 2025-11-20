# PDF Generation System

This document describes the PDF generation system for cookbook books using Playwright to render frontend templates.

## Overview

The PDF generation system uses **Playwright** (headless browser) to render React + MUI templates from the frontend and generate PDFs. This approach allows us to:

- Use existing frontend templates exactly as they are
- Maintain consistent styling between web and PDF
- Leverage React components for complex layouts
- Easy maintenance with separation of concerns

## Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌────────────────────┐
│                 │      │                  │      │                    │
│  PDF Request    │─────▶│  Backend         │─────▶│  Frontend Renderer │
│  (API Call)     │      │  (Playwright)    │      │  (React Templates) │
│                 │      │                  │      │                    │
└─────────────────┘      └──────────────────┘      └────────────────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │                  │
                         │  Generated PDF   │
                         │                  │
                         └──────────────────┘
```

## File Structure

### Backend

```
cookbook-service/
├── src/
│   ├── services/
│   │   └── PdfGenerationService.ts    # Core PDF generation logic
│   ├── controllers/
│   │   └── PdfController.ts           # HTTP request handlers
│   └── routes/
│       └── pdf.routes.ts              # API routes
```

### Frontend

```
Foodie_FrontEnd/
└── src/
    └── features/
        └── CookBook/
            ├── pages/
            │   └── BookRenderer.tsx   # Hidden route for rendering pages
            └── components/
                └── templates/         # Template components
                    ├── cover/
                    ├── intro/
                    ├── toc/
                    ├── backCover/
                    └── recipe/
```

## API Endpoints

### 1. Generate Full Book PDF

```http
POST /api/cookbook/pdf/generate-book/:bookId
```

**Description:** Generates a complete PDF for the entire book including all pages in order.

**Request Body (Optional):**
```json
{
  "format": "A4",           // or "Letter"
  "orientation": "portrait", // or "landscape"
  "margin": {
    "top": "0",
    "right": "0",
    "bottom": "0",
    "left": "0"
  }
}
```

**Response:** PDF file (application/pdf)

**Page Order:**
1. Cover
2. Intro
3. Table of Contents
4. Front Extra Pages (sorted by position)
5. Recipe Pages (sorted by position)
6. Back Extra Pages (sorted by position)
7. Back Cover

---

### 2. Generate Single Page PDF

```http
POST /api/cookbook/pdf/generate-page/:bookId/:pageId
```

**Description:** Generates a PDF for a single page.

**Request Body:**
```json
{
  "pageType": "cover",      // Required: cover, intro, toc, back-cover, recipe, extra
  "format": "A4",           // Optional
  "orientation": "portrait", // Optional
  "margin": {               // Optional
    "top": "0",
    "right": "0",
    "bottom": "0",
    "left": "0"
  }
}
```

**Response:** PDF file (application/pdf)

---

### 3. Get PDF Generation Status

```http
GET /api/cookbook/pdf/status/:bookId
```

**Description:** Check if a book is ready for PDF generation.

**Response:**
```json
{
  "success": true,
  "data": {
    "bookId": "...",
    "status": "ready",
    "message": "Book is ready for PDF generation"
  }
}
```

## Frontend Renderer

### Route

```
http://localhost:5173/book-renderer?bookId={bookId}&pageId={pageId}&pageType={pageType}
```

### Query Parameters

- `bookId` (required): ID of the book
- `pageId` (required): ID of the specific page
- `pageType` (required): Type of page (cover, intro, toc, back-cover, recipe, extra)

### How It Works

1. **BookRenderer** component receives query params
2. Fetches book data from backend
3. Renders the appropriate template based on `pageType`
4. Sets `data-pdf-ready="true"` attribute when fully loaded
5. Playwright waits for this attribute before generating PDF

### Template Selection

The renderer automatically selects the correct template based on:

- **Page Type:** cover, intro, toc, back-cover, recipe, extra
- **Layout:** For recipes, uses the layout field to determine which template (layout-one, layout-two, layout-three)

## How PDF Generation Works

### Step-by-Step Process

1. **Request Received:** API receives PDF generation request
2. **Fetch Book Data:** BookService retrieves book data from database
3. **Initialize Browser:** Playwright launches headless Chromium browser
4. **For Each Page:**
   - Navigate to `/book-renderer` with query params
   - Wait for `data-pdf-ready="true"` attribute
   - Wait additional 1 second for fonts/images
   - Generate PDF using browser.pdf()
5. **Return PDF:** Send generated PDF to client

### Current Limitations

- ⚠️ **Single Page Only:** Currently returns only the first page
- 🔧 **TODO:** Implement PDF merging using `pdf-lib` or similar library

## Environment Variables

Add to `.env` file:

```env
FRONTEND_URL=http://localhost:5173
```

In production, update to your frontend URL:
```env
FRONTEND_URL=https://your-frontend-domain.com
```

## Dependencies

### Backend
```json
{
  "playwright": "^1.x.x"
}
```

### Browser Installation

Playwright requires browsers to be installed:

```bash
npx playwright install chromium
```

## Usage Examples

### Example 1: Generate Full Book PDF (cURL)

```bash
curl -X POST \
  http://localhost:3004/api/cookbook/pdf/generate-book/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "format": "A4",
    "orientation": "portrait"
  }' \
  --output book.pdf
```

### Example 2: Generate Single Page PDF (cURL)

```bash
curl -X POST \
  http://localhost:3004/api/cookbook/pdf/generate-page/507f1f77bcf86cd799439011/cover \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pageType": "cover",
    "format": "A4"
  }' \
  --output cover.pdf
```

### Example 3: Generate Full Book PDF (JavaScript)

```javascript
const response = await fetch('/api/cookbook/pdf/generate-book/507f1f77bcf86cd799439011', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    format: 'A4',
    orientation: 'portrait',
  }),
});

const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'book.pdf';
a.click();
```

## Performance Considerations

### Browser Lifecycle

- Browser instance is created on first use
- Reused for subsequent requests
- Closed manually using `PdfGenerationService.closeBrowser()`

### Optimization Tips

1. **Keep Browser Alive:** Reuse browser instance for multiple PDFs
2. **Parallel Pages:** Generate multiple pages concurrently (future enhancement)
3. **Cache Templates:** Frontend templates are cached by browser
4. **Image Optimization:** Optimize images in templates for faster loading

## Troubleshooting

### Common Issues

#### 1. "ECONNREFUSED" Error

**Problem:** Backend can't reach frontend

**Solution:**
- Ensure frontend is running on the correct port
- Check `FRONTEND_URL` environment variable
- Verify no firewall blocking localhost connections

#### 2. Timeout Waiting for data-pdf-ready

**Problem:** Template never sets ready attribute

**Solution:**
- Check browser console for errors in BookRenderer
- Verify book data loads correctly
- Increase timeout in PdfGenerationService (line 73)

#### 3. Missing Fonts or Styles

**Problem:** PDF looks different from web

**Solution:**
- Ensure fonts are embedded or use web-safe fonts
- Use `printBackground: true` in PDF options (already set)
- Check CSS `@media print` rules

#### 4. Images Not Loading

**Problem:** Images appear broken in PDF

**Solution:**
- Use absolute URLs for images
- Increase wait time after `data-pdf-ready`
- Check image CORS settings

## Future Enhancements

### 1. PDF Merging

Implement multi-page PDF generation using `pdf-lib`:

```bash
npm install pdf-lib
```

Then merge all pages into a single PDF.

### 2. Background Job Queue

For large books, use a job queue (Bull, BullMQ):

```bash
npm install bull
```

Process PDF generation asynchronously.

### 3. Caching

Cache generated PDFs:

```javascript
const cacheKey = `pdf:${bookId}:${lastUpdated}`;
// Check cache before generating
```

### 4. Progress Tracking

Implement WebSocket to send progress updates:

```javascript
socket.emit('pdf:progress', {
  bookId,
  current: 5,
  total: 20,
  page: 'Recipe 3',
});
```

### 5. Custom Templates

Allow users to upload custom templates.

## Security Considerations

### 1. Authentication

All PDF generation endpoints require authentication. The `userId` is extracted from the JWT token.

### 2. Authorization

Users can only generate PDFs for their own books. Authorization is checked in the service layer.

### 3. Rate Limiting

Consider implementing rate limiting to prevent abuse:

```javascript
import rateLimit from 'express-rate-limit';

const pdfLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 PDFs per window
});

router.post('/generate-book/:bookId', pdfLimiter, PdfController.generateBookPdf);
```

### 4. Resource Limits

Playwright can consume significant resources. Consider:

- Limiting concurrent PDF generations
- Setting memory limits
- Implementing timeouts

## Deployment

### Production Checklist

- [ ] Install Playwright browsers on server
- [ ] Set `FRONTEND_URL` to production frontend URL
- [ ] Configure proper CORS settings
- [ ] Implement PDF caching
- [ ] Set up monitoring and logging
- [ ] Add rate limiting
- [ ] Configure resource limits
- [ ] Test with large books
- [ ] Set up error alerting

### Docker Deployment

Add to Dockerfile:

```dockerfile
# Install Playwright browsers
RUN npx playwright install --with-deps chromium
```

## Support

For issues or questions:
1. Check this documentation
2. Review console logs in both backend and frontend
3. Test the `/book-renderer` route manually in a browser
4. Check Playwright documentation: https://playwright.dev
