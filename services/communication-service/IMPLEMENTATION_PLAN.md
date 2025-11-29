# Communication Service Implementation Plan

## Overview
This document outlines the complete backend implementation for the Communication feature based on the frontend requirements.

## Models Created
✅ Team.ts
✅ Channel.ts
✅ Message.ts
✅ Conversation.ts

## Models Remaining
- Meeting.ts
- Notification.ts

## API Endpoints Needed

### Teams API (`/api/teams`)
- POST `/` - Create team
- GET `/` - Get all teams for user
- GET `/:id` - Get team by ID
- PUT `/:id` - Update team
- DELETE `/:id` - Delete team
- POST `/:id/members` - Add members to team
- DELETE `/:id/members/:userId` - Remove member from team

### Channels API (`/api/channels`)
- POST `/` - Create channel
- GET `/team/:teamId` - Get channels for team
- GET `/:id` - Get channel by ID
- PUT `/:id` - Update channel
- DELETE `/:id` - Delete channel
- POST `/:id/members` - Add members to channel
- DELETE `/:id/members/:userId` - Remove member from channel

### Messages API (`/api/messages`)
- POST `/` - Send message (channel or DM)
- GET `/channel/:channelId` - Get channel messages
- GET `/conversation/:conversationId` - Get DM messages
- PUT `/:id` - Edit message
- DELETE `/:id` - Delete message
- POST `/:id/reactions` - Add reaction
- DELETE `/:id/reactions` - Remove reaction

### Conversations API (`/api/conversations`)
- POST `/` - Create conversation
- GET `/` - Get all conversations for user
- GET `/:id` - Get conversation by ID
- GET `/:id/messages` - Get messages for conversation

### Meetings API (`/api/meetings`)
- POST `/` - Create meeting
- GET `/` - Get meetings for user
- GET `/:id` - Get meeting by ID
- PUT `/:id` - Update meeting
- DELETE `/:id` - Cancel meeting
- GET `/calendar` - Get calendar events

### Notifications API (`/api/notifications`)
- GET `/` - Get notifications for user
- PUT `/:id/read` - Mark notification as read
- PUT `/read-all` - Mark all as read

## WebSocket Events

### Client → Server
- `join-team` - Join team room
- `leave-team` - Leave team room
- `join-channel` - Join channel room
- `leave-channel` - Leave channel room
- `join-conversation` - Join DM room
- `send-message` - Send message
- `typing-start` - User starts typing
- `typing-stop` - User stops typing
- `user-status-change` - Update user status

### Server → Client
- `message-received` - New message
- `message-edited` - Message edited
- `message-deleted` - Message deleted
- `reaction-added` - Reaction added
- `reaction-removed` - Reaction removed
- `user-typing` - User is typing
- `user-status-changed` - User status updated
- `notification` - New notification

## File Structure
```
communication-service/
├── src/
│   ├── models/
│   │   ├── Team.ts ✅
│   │   ├── Channel.ts ✅
│   │   ├── Message.ts ✅
│   │   ├── Conversation.ts ✅
│   │   ├── Meeting.ts
│   │   └── Notification.ts
│   ├── controllers/
│   │   ├── team.controller.ts
│   │   ├── channel.controller.ts
│   │   ├── message.controller.ts
│   │   ├── conversation.controller.ts
│   │   ├── meeting.controller.ts
│   │   └── notification.controller.ts
│   ├── services/
│   │   ├── team.service.ts
│   │   ├── channel.service.ts
│   │   ├── message.service.ts
│   │   ├── conversation.service.ts
│   │   ├── meeting.service.ts
│   │   └── notification.service.ts
│   ├── routes/
│   │   ├── team.routes.ts
│   │   ├── channel.routes.ts
│   │   ├── message.routes.ts
│   │   ├── conversation.routes.ts
│   │   ├── meeting.routes.ts
│   │   ├── notification.routes.ts
│   │   └── index.ts
│   ├── socket/
│   │   ├── index.ts
│   │   └── handlers/
│   │       ├── message.handler.ts
│   │       ├── typing.handler.ts
│   │       └── status.handler.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── userContext.ts
│   ├── types/
│   │   └── index.ts
│   └── index.ts
├── package.json
└── tsconfig.json
```

## Implementation Order
1. ✅ Create models (Team, Channel, Message, Conversation)
2. Create remaining models (Meeting, Notification)
3. Implement Teams API
4. Implement Channels API
5. Implement Messages API
6. Implement Conversations API
7. Implement Meetings API
8. Implement Notifications API
9. Set up WebSocket
10. Add routes to API Gateway

## Next Steps
Would you like me to continue implementing:
1. The remaining models (Meeting, Notification)?
2. The controllers and services?
3. The routes?
4. The WebSocket setup?
5. All of the above?

Let me know how you'd like to proceed!
