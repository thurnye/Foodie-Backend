import { Router } from 'express';
import { generateCookbook, getCookbookStatus } from '../controllers/CookbookController';

const router = Router();

// POST /api/recipe/generateCookBook/:userId - Generate cookbook PDF
router.post('/generateCookBook/:userId', generateCookbook);

// GET /api/recipe/cookbook/:pdfId - Get cookbook status
router.get('/cookbook/:pdfId', getCookbookStatus);

export default router;
