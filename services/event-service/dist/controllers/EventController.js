"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventController = void 0;
const libs_1 = require("@foodie/libs");
const EventService_1 = __importDefault(require("../services/EventService"));
class EventController {
    async getAllEvents(req, res) {
        try {
            const { search, category, tags, location, startDate, endDate, status, sort, page, limit, } = req.query;
            const events = await EventService_1.default.getAllEvents({
                search: search,
                category: category,
                tags: tags,
                location: location,
                startDate: startDate,
                endDate: endDate,
                status: status,
                sort: sort,
                page: page ? parseInt(page) : undefined,
                limit: limit ? parseInt(limit) : undefined,
            });
            res.json({ success: true, data: events });
        }
        catch (error) {
            libs_1.logger.error('Error fetching events', { error: error.message });
            res
                .status(500)
                .json({ success: false, message: 'Failed to fetch events' });
        }
    }
    async getEventById(req, res) {
        try {
            const { eventId } = req.params;
            const event = await EventService_1.default.getEventById(eventId);
            res.json({ success: true, data: event });
        }
        catch (error) {
            libs_1.logger.error('Error fetching event', {
                error: error.message,
                eventId: req.params.eventId,
            });
            if (error.isOperational) {
                res
                    .status(error.statusCode)
                    .json({ success: false, message: error.message });
                return;
            }
            res
                .status(500)
                .json({ success: false, message: 'Failed to fetch event' });
        }
    }
    async createEvent(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                throw libs_1.Errors.unauthorized('User not authenticated');
            }
            const eventData = req.body;
            const event = await EventService_1.default.createEvent(userId, eventData);
            res.status(201).json({ success: true, data: event });
        }
        catch (error) {
            libs_1.logger.error('Error creating event', { error: error.message });
            if (error.isOperational) {
                res
                    .status(error.statusCode)
                    .json({ success: false, message: error.message });
                return;
            }
            res
                .status(500)
                .json({ success: false, message: 'Failed to create event' });
        }
    }
    async updateEvent(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                throw libs_1.Errors.unauthorized('User not authenticated');
            }
            const { eventId } = req.params;
            const updates = req.body;
            const event = await EventService_1.default.updateEvent(eventId, userId, updates);
            res.json({ success: true, data: event });
        }
        catch (error) {
            libs_1.logger.error('Error updating event', {
                error: error.message,
                eventId: req.params.eventId,
            });
            if (error.isOperational) {
                res
                    .status(error.statusCode)
                    .json({ success: false, message: error.message });
                return;
            }
            res
                .status(500)
                .json({ success: false, message: 'Failed to update event' });
        }
    }
    async deleteEvent(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                throw libs_1.Errors.unauthorized('User not authenticated');
            }
            const { eventId } = req.params;
            await EventService_1.default.deleteEvent(eventId, userId);
            res.json({ success: true, message: 'Event deleted successfully' });
        }
        catch (error) {
            libs_1.logger.error('Error deleting event', {
                error: error.message,
                eventId: req.params.eventId,
            });
            if (error.isOperational) {
                res
                    .status(error.statusCode)
                    .json({ success: false, message: error.message });
                return;
            }
            res
                .status(500)
                .json({ success: false, message: 'Failed to delete event' });
        }
    }
    async registerForEvent(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                throw libs_1.Errors.unauthorized('User not authenticated');
            }
            const { eventId } = req.params;
            const { ticketTierId } = req.body;
            const event = await EventService_1.default.registerForEvent(eventId, userId, ticketTierId);
            res.json({ success: true, data: event });
        }
        catch (error) {
            libs_1.logger.error('Error registering for event', {
                error: error.message,
                eventId: req.params.eventId,
            });
            if (error.isOperational) {
                res
                    .status(error.statusCode)
                    .json({ success: false, message: error.message });
                return;
            }
            res
                .status(500)
                .json({ success: false, message: 'Failed to register for event' });
        }
    }
    async cancelRegistration(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                throw libs_1.Errors.unauthorized('User not authenticated');
            }
            const { eventId } = req.params;
            const event = await EventService_1.default.cancelRegistration(eventId, userId);
            res.json({ success: true, data: event });
        }
        catch (error) {
            libs_1.logger.error('Error cancelling registration', {
                error: error.message,
                eventId: req.params.eventId,
            });
            if (error.isOperational) {
                res
                    .status(error.statusCode)
                    .json({ success: false, message: error.message });
                return;
            }
            res
                .status(500)
                .json({ success: false, message: 'Failed to cancel registration' });
        }
    }
    async getMyEvents(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                throw libs_1.Errors.unauthorized('User not authenticated');
            }
            const events = await EventService_1.default.getMyEvents(userId);
            res.json({ success: true, data: events });
        }
        catch (error) {
            libs_1.logger.error('Error fetching user events', { error: error.message });
            if (error.isOperational) {
                res
                    .status(error.statusCode)
                    .json({ success: false, message: error.message });
                return;
            }
            res
                .status(500)
                .json({ success: false, message: 'Failed to fetch your events' });
        }
    }
    async getOrganizedEvents(req, res) {
        try {
            const { search, category, tags, location, startDate, endDate, status, sort, page, limit, } = req.query;
            const userId = req.headers['x-user-id'];
            if (!userId) {
                throw libs_1.Errors.unauthorized('User not authenticated');
            }
            const events = await EventService_1.default.getOrganizedEvents(userId, { search: search,
                category: category,
                tags: tags,
                location: location,
                startDate: startDate,
                endDate: endDate,
                status: status,
                sort: sort,
                page: page ? parseInt(page) : undefined,
                limit: limit ? parseInt(limit) : undefined, });
            res.json({ success: true, data: events });
        }
        catch (error) {
            libs_1.logger.error('Error fetching organized events', { error: error.message });
            if (error.isOperational) {
                res
                    .status(error.statusCode)
                    .json({ success: false, message: error.message });
                return;
            }
            res
                .status(500)
                .json({ success: false, message: 'Failed to fetch organized events' });
        }
    }
}
exports.EventController = EventController;
exports.default = new EventController();
//# sourceMappingURL=EventController.js.map