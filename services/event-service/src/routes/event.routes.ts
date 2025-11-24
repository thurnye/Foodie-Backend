import { Router } from 'express';
import EventController from '../controllers/EventController';

const router = Router();

// ==================== EVENT ROUTES ====================
router.get('/', EventController.getAllEvents);
router.get('/my-events', EventController.getMyEvents);
router.get('/organized', EventController.getOrganizedEvents);
router.get('/:eventId', EventController.getEventById);
router.post('/', EventController.createEvent);
router.put('/:eventId', EventController.updateEvent);
router.delete('/:eventId', EventController.deleteEvent);

// Event Registration
router.post('/:eventId/register', EventController.registerForEvent);
router.delete('/:eventId/register', EventController.cancelRegistration);

export default router;
