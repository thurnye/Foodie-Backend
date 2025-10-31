import { Router } from 'express';
import {
  createCookbook,
  getCookbookById,
  getMyCookbooks,
  getPublicCookbooks,
  updateCookbook,
  deleteCookbook,
  generateCookbook,
  getCookbookStatus,
} from '../controllers/CookbookController';
import { validate } from '@foodie/libs';
import { createCookbookSchema, updateCookbookSchema } from '../utils/validators';

const router = Router();

// POST /api/cookbook - Create new cookbook (authenticated) - MUST BE BEFORE /:id
router.post('/', validate(createCookbookSchema), createCookbook);

// GET /api/cookbook/my-cookbooks - Get current user's cookbooks (authenticated) - MUST BE BEFORE /:id
router.get('/my-cookbooks', getMyCookbooks);

// GET /api/cookbook/public - Get public cookbooks - MUST BE BEFORE /:id
router.get('/public', getPublicCookbooks);

// POST /api/cookbook/:id/generate - Generate PDF for cookbook (authenticated)
router.post('/:id/generate', generateCookbook);

// GET /api/cookbook/:id/status - Get cookbook generation status (authenticated)
router.get('/:id/status', getCookbookStatus);

// GET /api/cookbook/:id - Get cookbook by ID
router.get('/:id', getCookbookById);

// PATCH /api/cookbook/:id - Update cookbook (authenticated)
router.patch('/:id', validate(updateCookbookSchema), updateCookbook);

// DELETE /api/cookbook/:id - Delete cookbook (authenticated, soft delete)
router.delete('/:id', deleteCookbook);

export default router;
