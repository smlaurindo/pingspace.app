# Routes

🟣 Endpoint for Frontend  
🟪 Endpoint for API consumption

## Auth (/v1/auth)

- 🟣 POST /v1/auth/sign-up (Register)
- 🟣 POST /v1/auth/sign-in (Login)

## Spaces (/v1/spaces)

### Space CRUD

- [x] 🟣 POST /v1/spaces (Create space)
- [ ] 🟣 PUT /v1/spaces (Edit space)
- [x] 🟣 DELETE /v1/spaces/:spaceId (Delete space)

### Space API Keys Management

- [x] 🟣 POST /v1/spaces/:spaceId/api-keys (Generate API Key)
- [x] 🟣 GET /v1/spaces/:spaceId/api-keys?cursor&type&limit (Paginate API Keys)
- [ ] 🟣 PUT /v1/spaces/:spaceId/api-key (Edit API Key permissions)
- [ ] 🟣 DELETE /spaces/:spaceId/api-key/:apiKeyId (Remove API Key)

### Space Topics Management

- [x] 🟣 POST /v1/spaces/:spaceId/topics (Create topic)
- [ ] 🟣 GET /v1/spaces/:spaceId/topics (List space topics)
- [x] 🟣 GET /v1/spaces/:spaceId/topics/:topicId (Get topic info)
- [ ] 🟣 PATCH /v1/spaces/:spaceId/topics/:topicId/subscribe (Subscribe to topic for messages/notifications)
- [ ] 🟣 PATCH /v1/spaces/:spaceId/topics/:topicId/unsubscribe (Unsubscribe from topic to stop receiving messages/notifications)
- [ ] 🟣 PUT /v1/spaces/:spaceId/topics (Edit topic info)
- [x] 🟣 DELETE /v1/spaces/:spaceId/topics/:topicId (Delete topic)

- [ ] 🟪 GET /v1/topics (List space topics)
- [ ] 🟪 POST /v1/topics (Create topic)

#### Manage messages of a space topic

- [x] 🟣 GET /v1/spaces/:spaceId/topics/:topicId/pings?cursor&limit (Paginate messages of a space topic)
- [ ] 🟣 GET /v1/spaces/:spaceId/topics/:topicId/pings/:pingId/reads (View members who read the message)
- [ ] 🟣 GET /v1/spaces/:spaceId/topics/:topicId/pings/:pingId/notified (View members who were notified of the message)
- [ ] 🟣 GET /v1/spaces/:spaceId/topics/:topicId/pings/stream (Open SSE stream to receive messages)
- [x] 🟣 PATCH /v1/spaces/:spaceId/topics/:topicId/pings/read (Mark topic messages as read)
- [ ] 🟣 POST /v1/spaces/:spaceId/topics/:topicId/webhook (Create webhook to listen for topic events)

- [ ] 🟪 GET /v1/topics/:topicSlug/pings?cursor&limit (Paginate messages of a space topic)
- [ ] 🟪 GET /v1/topics/:topicSlug/pings/sse (Open SSE stream to receive messages)
- [x] 🟪 POST /v1/topics/:topicSlug/pings (Create message in topic)

### Space Members Management

- [ ] 🟣 GET /v1/spaces/:spaceId/members (List space members)
- [ ] 🟣 GET /v1/spaces/:spaceId/members/:memberId/details (View member details)
- [ ] 🟣 POST /v1/spaces/:spaceId/members (Invite member to space)
- [ ] 🟣 PUT /v1/spaces/:spaceId/members/:memberId (Manage space member)
- [ ] 🟣 DELETE /v1/spaces/:spaceId/members/:memberId (Remove member from space)

## User Actions

- [ ] 🟣 GET /me/topics (List topics the user is subscribed to)
- [ ] 🟣 GET /me/spaces (List spaces the user is a member of)
- [ ] 🟣 PUT /me (Update user information)
- [ ] 🟣 DELETE /me/delete (Delete account)
