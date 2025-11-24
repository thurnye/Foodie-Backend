import { logger } from '@foodie/libs';
import { EventWithUser, GetEventsFilters } from '../types/event.services.types';
import { fetchUserData } from './userClient';
import { SortOrder } from 'mongoose';

/** Build Mongo query filters */
export function buildEventFilters(filters: GetEventsFilters) {
  const { search, category, tags, location, startDate, endDate, status } =
    filters;

  const query: any = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  if (category) query.category = category;
  if (status) query.status = status;

  if (tags) {
    query.tags = { $in: tags.split(',') };
  }

  if (location) {
    query.$or = [
      { 'location.city': { $regex: location, $options: 'i' } },
      { 'location.venueName': { $regex: location, $options: 'i' } },
    ];
  }

  if (startDate) query.startDate = { $gte: new Date(startDate) };
  if (endDate) query.endDate = { $lte: new Date(endDate) };

  return query;
}

/** Build sorting logic */
type SortObject = Record<string, SortOrder>;

export function buildSortQuery(sort = "upcoming"): SortObject {
  const mapping: Record<string, SortObject> = {
    popular: { attendeeCount: -1, startDate: 1 },
    oldest: { createdAt: 1 },
    upcoming: { startDate: 1 },
    newest: { createdAt: -1 },
  };

  return mapping[sort] || mapping["newest"];
}

/** Fetch organizer data safely */
export async function populateOrganizer(organizerId: string) {
  try {
    return await fetchUserData(organizerId);
  } catch (error) {
    logger.error(`Failed to fetch organizer data: ${error}`);
    return organizerId;
  }
}

/** Return full attendee details (only registered) */
export async function populateRegisteredAttendees(attendees: any[]) {
  const registered = attendees.filter(
    (a) => a.attendanceStatus === 'registered'
  );

  return Promise.all(
    registered.map(async (attendee) => {
      try {
        const userData = await fetchUserData(attendee.user.toString());
        return { ...attendee, user: userData };
      } catch (error) {
        logger.error(`Failed to fetch attendee user data: ${error}`);
        return attendee;
      }
    })
  );
}

/** Final formatter for event output */
export async function formatEventWithUsers(event: any): Promise<EventWithUser> {
  const organizer = await populateOrganizer(event.organizer.toString());
  const attendees = await populateRegisteredAttendees(event.attendees);

  return {
    ...event,
    organizer,
    attendees,
  };
}
