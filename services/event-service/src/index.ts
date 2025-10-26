/**
 * Event Service - Phase 2 Implementation
 *
 * TODO: Implement the following features:
 *
 * 1. Event CRUD Operations:
 *    - POST /api/event - Create new event
 *    - POST /api/event/query - List/search events
 *    - POST /api/event/user/:userId - Get user's events
 *    - GET /api/event/:id - Get event details
 *    - PUT /api/event/:id - Update event
 *    - DELETE /api/event/:id - Delete event
 *
 * 2. Event Participation:
 *    - POST /api/event/:id/join - Join an event
 *    - POST /api/event/:id/leave - Leave an event
 *    - GET /api/event/:id/participants - Get event participants
 *    - POST /api/event/:id/invite - Invite users to event
 *
 * 3. Database Models:
 *    - Event schema (title, description, date, location, capacity, etc.)
 *    - EventParticipant schema (userId, eventId, status)
 *    - EventCategory schema
 *
 * 4. Features to implement:
 *    - Event types (cooking class, food festival, meetup, etc.)
 *    - Event location (physical address or virtual/online)
 *    - Event capacity and RSVP management
 *    - Event images and media
 *    - Event reminders and notifications
 *    - Event calendar integration
 *    - Event search by location, date, category
 *    - Featured/promoted events
 *    - Past events archive
 *
 * 5. Validation:
 *    - Event date validation (must be future date)
 *    - Capacity validation
 *    - Location validation
 *
 * 6. Authorization:
 *    - Event creators can edit/delete their events
 *    - Participants can join/leave events
 *    - Admin can moderate all events
 *
 * 7. Notifications:
 *    - Notify participants of event updates
 *    - Reminder notifications before events
 *    - Cancellation notifications
 */

import express from 'express';
import { logger } from '@foodie/libs';

const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'event-service', message: 'TODO: Phase 2 implementation' });
});

app.all('*', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Event service not yet implemented - Phase 2',
  });
});

app.listen(PORT, () => {
  logger.info(`Event service (stub) running on port ${PORT}`);
});

export default app;
