import { Router } from 'express';
import {
  createProfile,
  getProfile,
  editProfile,
  deleteProfile,
  getUsers,
} from '../controllers/UserController';
import { validate } from '@foodie/libs';
import { createProfileSchema, editProfileSchema } from '../utils/validators';

const router = Router();

// POST /create - Create new user profile
router.post('/create', validate(createProfileSchema), createProfile);

// POST /edit - Update user profile (authenticated)
router.post('/edit', validate(editProfileSchema), editProfile);

// GET /:id - Get user profile by ID
router.get('/:id', getProfile);

// DELETE / - Delete user profile (authenticated)
router.delete('/', deleteProfile);

// GET / - Get all users (with pagination)
router.get('/', getUsers);

export default router;
