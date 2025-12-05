"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const libs_1 = require("@foodie/libs");
const Event_model_1 = require("../models/Event.model");
const event_service_helpers_1 = require("../utils/event.service.helpers");
class EventService {
    async getAllEvents(filters = {}) {
        try {
            const { sort = 'upcoming', page = 1, limit = 20 } = filters;
            const query = (0, event_service_helpers_1.buildEventFilters)(filters);
            const sortQuery = (0, event_service_helpers_1.buildSortQuery)(sort);
            const events = await Event_model_1.Event.find(query)
                .sort(sortQuery)
                .skip((page - 1) * limit)
                .limit(limit)
                .lean();
            return Promise.all(events.map(event_service_helpers_1.formatEventWithUsers));
        }
        catch (error) {
            libs_1.logger.error(`Error getting all events: ${error}`);
            throw libs_1.Errors.internalServer();
        }
    }
    async getEventById(eventId) {
        try {
            const event = await Event_model_1.Event.findById(eventId).lean();
            if (!event)
                throw libs_1.Errors.notFound('Event not found');
            return await (0, event_service_helpers_1.formatEventWithUsers)(event);
        }
        catch (error) {
            libs_1.logger.error(`Error fetching event: ${error}`);
            throw libs_1.Errors.internalServer();
        }
    }
    async createEvent(userId, data) {
        try {
            const event = new Event_model_1.Event({ ...data, organizer: userId });
            await event.save();
            const eventObj = event.toObject();
            return await (0, event_service_helpers_1.formatEventWithUsers)(eventObj);
        }
        catch (error) {
            libs_1.logger.error(`Error creating event: ${error}`);
            if (error instanceof Error && error.name === 'ValidationError') {
                throw libs_1.Errors.badRequest(error.message);
            }
            throw libs_1.Errors.internalServer();
        }
    }
    async updateEvent(eventId, userId, data) {
        try {
            const event = await Event_model_1.Event.findById(eventId);
            if (!event)
                throw libs_1.Errors.notFound('Event not found');
            if (event.organizer.toString() !== userId)
                throw libs_1.Errors.forbidden('Only organizer can update event');
            Object.assign(event, data);
            await event.save();
            return await (0, event_service_helpers_1.formatEventWithUsers)(event.toObject());
        }
        catch (error) {
            libs_1.logger.error(`Error updating event: ${error}`);
            throw error;
        }
    }
    async deleteEvent(eventId, userId) {
        try {
            const event = await Event_model_1.Event.findById(eventId);
            if (!event)
                throw libs_1.Errors.notFound('Event not found');
            if (event.organizer.toString() !== userId)
                throw libs_1.Errors.forbidden('Only organizer can delete');
            await Event_model_1.Event.findByIdAndDelete(eventId);
        }
        catch (error) {
            libs_1.logger.error(`Error deleting event: ${error}`);
            throw error;
        }
    }
    async registerForEvent(eventId, userId, ticketTierId) {
        try {
            const event = await Event_model_1.Event.findById(eventId);
            if (!event)
                throw libs_1.Errors.notFound('Event not found');
            if (event.status !== 'published')
                throw libs_1.Errors.badRequest('Cannot register for unpublished event');
            if (new Date(event.endDate) < new Date())
                throw libs_1.Errors.badRequest('Cannot register for past event');
            const existing = event.attendees.find(a => a.user.toString() === userId);
            if (!existing) {
                if (event.attendeeCount >= event.capacity)
                    throw libs_1.Errors.badRequest('Event is full');
                const tier = event.ticketTiers.find(t => t._id?.toString() === ticketTierId);
                if (!tier)
                    throw libs_1.Errors.notFound('Ticket tier not found');
                if (tier.quantitySold >= tier.quantity)
                    throw libs_1.Errors.badRequest('Ticket tier is sold out');
                const now = new Date();
                if (now < new Date(tier.salesStartDate) || now > new Date(tier.salesEndDate))
                    throw libs_1.Errors.badRequest('Ticket sales not open');
                event.attendees.push({
                    user: new mongoose_1.Types.ObjectId(userId),
                    ticketTier: tier.name,
                    registeredAt: new Date(),
                    attendanceStatus: 'registered',
                });
                tier.quantitySold += 1;
            }
            else if (existing.attendanceStatus === 'cancelled') {
                existing.attendanceStatus = 'registered';
                existing.registeredAt = new Date();
                const tier = event.ticketTiers.find(t => t.name === existing.ticketTier);
                if (tier)
                    tier.quantitySold += 1;
            }
            await event.save();
            return await (0, event_service_helpers_1.formatEventWithUsers)(event.toObject());
        }
        catch (error) {
            libs_1.logger.error(`Error registering for event: ${error}`);
            throw error;
        }
    }
    async cancelRegistration(eventId, userId) {
        try {
            const event = await Event_model_1.Event.findById(eventId);
            if (!event)
                throw libs_1.Errors.notFound('Event not found');
            const attendee = event.attendees.find(a => a.user.toString() === userId && a.attendanceStatus !== 'cancelled');
            if (!attendee)
                throw libs_1.Errors.notFound('Registration not found');
            attendee.attendanceStatus = 'cancelled';
            const tier = event.ticketTiers.find(t => t.name === attendee.ticketTier);
            if (tier)
                tier.quantitySold = Math.max(0, tier.quantitySold - 1);
            await event.save();
            return await (0, event_service_helpers_1.formatEventWithUsers)(event.toObject());
        }
        catch (error) {
            libs_1.logger.error(`Error cancelling: ${error}`);
            throw error;
        }
    }
    async getMyEvents(userId) {
        try {
            const events = await Event_model_1.Event.find({
                'attendees.user': userId,
                'attendees.attendanceStatus': { $ne: 'cancelled' },
            }).lean();
            return Promise.all(events.map(event_service_helpers_1.formatEventWithUsers));
        }
        catch (error) {
            libs_1.logger.error(`Error getting my events: ${error}`);
            throw libs_1.Errors.internalServer();
        }
    }
    async getOrganizedEvents(userId, filters = {}) {
        try {
            const { sort = 'upcoming', page = 1, limit = 20 } = filters;
            const query = (0, event_service_helpers_1.buildEventFilters)(filters);
            const sortQuery = (0, event_service_helpers_1.buildSortQuery)(sort);
            const events = await Event_model_1.Event.find({ organizer: userId, ...query })
                .sort(sortQuery)
                .skip((page - 1) * limit)
                .limit(limit)
                .lean();
            return Promise.all(events.map(event_service_helpers_1.formatEventWithUsers));
        }
        catch (error) {
            libs_1.logger.error(`Error getting organized events: ${error}`);
            throw libs_1.Errors.internalServer();
        }
    }
}
exports.default = new EventService();
//# sourceMappingURL=EventService.js.map