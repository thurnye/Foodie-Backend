"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildEventFilters = buildEventFilters;
exports.buildSortQuery = buildSortQuery;
exports.populateOrganizer = populateOrganizer;
exports.populateRegisteredAttendees = populateRegisteredAttendees;
exports.formatEventWithUsers = formatEventWithUsers;
const libs_1 = require("@foodie/libs");
const userClient_1 = require("./userClient");
function buildEventFilters(filters) {
    const { search, category, tags, location, startDate, endDate, status } = filters;
    const query = {};
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
        ];
    }
    if (category)
        query.category = category;
    if (status)
        query.status = status;
    if (tags) {
        query.tags = { $in: tags.split(',') };
    }
    if (location) {
        query.$or = [
            { 'location.city': { $regex: location, $options: 'i' } },
            { 'location.venueName': { $regex: location, $options: 'i' } },
        ];
    }
    if (startDate)
        query.startDate = { $gte: new Date(startDate) };
    if (endDate)
        query.endDate = { $lte: new Date(endDate) };
    return query;
}
function buildSortQuery(sort = "upcoming") {
    const mapping = {
        popular: { attendeeCount: -1, startDate: 1 },
        oldest: { createdAt: 1 },
        upcoming: { startDate: 1 },
        newest: { createdAt: -1 },
    };
    return mapping[sort] || mapping["newest"];
}
async function populateOrganizer(organizerId) {
    try {
        return await (0, userClient_1.fetchUserData)(organizerId);
    }
    catch (error) {
        libs_1.logger.error(`Failed to fetch organizer data: ${error}`);
        return organizerId;
    }
}
async function populateRegisteredAttendees(attendees) {
    const registered = attendees.filter((a) => a.attendanceStatus === 'registered');
    return Promise.all(registered.map(async (attendee) => {
        try {
            const userData = await (0, userClient_1.fetchUserData)(attendee.user.toString());
            return { ...attendee, user: userData };
        }
        catch (error) {
            libs_1.logger.error(`Failed to fetch attendee user data: ${error}`);
            return attendee;
        }
    }));
}
async function formatEventWithUsers(event) {
    const organizer = await populateOrganizer(event.organizer.toString());
    const attendees = await populateRegisteredAttendees(event.attendees);
    return {
        ...event,
        organizer,
        attendees,
    };
}
//# sourceMappingURL=event.service.helpers.js.map