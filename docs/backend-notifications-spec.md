# Backend Notifications API — Specification

This document defines the data models, REST endpoints, and Socket.io events the backend must implement to support the Momentev notification system.

---

## Data Model

### Notification Schema

```
Notification {
  _id           String          // MongoDB ObjectId
  recipientId   String          // userId of the recipient
  recipientRole "CUSTOMER" | "VENDOR"
  type          NotificationType
  title         String          // Short headline, pre-formatted in English
  message       String          // Body text, pre-formatted in English
  entityId      String?         // ID of the related entity (bookingId, quoteId, disputeId, etc.)
  entityType    "booking" | "quote" | "quote_request" | "dispute" | "review" | "message" | null
  isRead        Boolean         // default: false
  createdAt     DateTime
  updatedAt     DateTime
}
```

### NotificationType Enum

| Value | Recipient | Triggered When |
|---|---|---|
| `new_booking` | VENDOR | Client creates a booking |
| `booking_confirmed` | CUSTOMER | Vendor confirms a booking |
| `booking_rejected` | CUSTOMER | Vendor rejects a booking |
| `booking_cancelled` | VENDOR | Client cancels a booking |
| `booking_paid` | VENDOR | Client completes payment for a booking |
| `quote_received` | CUSTOMER | Vendor sends a quote |
| `quote_revised` | CUSTOMER | Vendor revises a sent quote |
| `quote_withdrawn` | CUSTOMER | Vendor withdraws a quote |
| `quote_accepted` | VENDOR | Client accepts a quote |
| `quote_declined` | VENDOR | Client declines a quote |
| `new_request` | VENDOR | Client submits a custom request matching vendor's services |
| `new_dispute` | VENDOR | Client opens a dispute on a booking |
| `dispute_update` | CUSTOMER | Admin updates dispute status |
| `new_review` | VENDOR | Client submits a review |
| `new_message` | CUSTOMER / VENDOR | Other party sends a message (optional — chat already has its own badge) |

### Title & Message Copy (English)

The backend is responsible for generating these strings. Reference copy:

| type | title | message |
|---|---|---|
| `new_booking` | "New Booking Request" | "{clientName} has requested a booking for {eventTitle}." |
| `booking_confirmed` | "Booking Confirmed" | "Your booking for {eventTitle} has been confirmed by {vendorName}." |
| `booking_rejected` | "Booking Rejected" | "Your booking for {eventTitle} was not accepted by {vendorName}." |
| `booking_cancelled` | "Booking Cancelled" | "{clientName} has cancelled their booking for {eventTitle}." |
| `booking_paid` | "Payment Received" | "Payment for {eventTitle} has been completed by {clientName}." |
| `quote_received` | "New Quote Received" | "{vendorName} sent you a quote for {eventTitle}." |
| `quote_revised` | "Quote Revised" | "{vendorName} has revised their quote for {eventTitle}." |
| `quote_withdrawn` | "Quote Withdrawn" | "{vendorName} has withdrawn their quote for {eventTitle}." |
| `quote_accepted` | "Quote Accepted" | "{clientName} accepted your quote for {eventTitle}." |
| `quote_declined` | "Quote Declined" | "{clientName} declined your quote for {eventTitle}." |
| `new_request` | "New Service Request" | "A new request matching your services has been posted." |
| `new_dispute` | "Dispute Opened" | "{clientName} has opened a dispute for {eventTitle}." |
| `dispute_update` | "Dispute Update" | "Your dispute for {eventTitle} has been updated." |
| `new_review` | "New Review" | "{clientName} left you a {rating}-star review." |
| `new_message` | "New Message" | "{senderName} sent you a message." |

---

## REST API Endpoints

All endpoints require authentication (`Authorization: Bearer <token>`).

---

### GET `/api/v1/notifications`

Fetch paginated notifications for the authenticated user.

**Query Parameters:**

| Param | Type | Default | Description |
|---|---|---|---|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page (max 50) |
| `isRead` | boolean | — | Filter by read status (optional) |

**Response `200`:**
```json
{
  "message": "Notifications fetched successfully",
  "data": {
    "notifications": [
      {
        "_id": "64a1b2c3d4e5f6a7b8c9d0e1",
        "type": "booking_confirmed",
        "title": "Booking Confirmed",
        "message": "Your booking for Summer Wedding has been confirmed by Elegant Events Co.",
        "entityId": "64a1b2c3d4e5f6a7b8c9d0e2",
        "entityType": "booking",
        "isRead": false,
        "createdAt": "2025-03-21T10:30:00.000Z",
        "updatedAt": "2025-03-21T10:30:00.000Z"
      }
    ],
    "total": 24,
    "page": 1,
    "limit": 20,
    "unreadCount": 5
  }
}
```

> **Important:** `unreadCount` must reflect the total unread count across ALL pages, not just the current page. The frontend uses this field directly for the bell badge.

**Response `401`:** Session expired.

---

### PATCH `/api/v1/notifications/:id/read`

Mark a single notification as read.

**Path Params:** `id` — notification `_id`

**Response `200`:**
```json
{
  "message": "Notification marked as read",
  "data": {
    "updated": true
  }
}
```

**Response `404`:** Notification not found or does not belong to the authenticated user.

---

### PATCH `/api/v1/notifications/read-all`

Mark all notifications for the authenticated user as read.

**Response `200`:**
```json
{
  "message": "All notifications marked as read",
  "data": {
    "updatedCount": 5
  }
}
```

---

## Socket.io Events

The existing Socket.io connection (used for chat) should also deliver notification events. No new connection or authentication is needed — use the same authenticated socket.

---

### Server → Client: `notification`

Emitted to the authenticated user's private socket room whenever a new notification is created for them.

**When to emit:** Immediately after inserting the notification document in the database (same transaction or right after).

**Payload:**
```json
{
  "data": {
    "_id": "64a1b2c3d4e5f6a7b8c9d0e1",
    "type": "booking_confirmed",
    "title": "Booking Confirmed",
    "message": "Your booking for Summer Wedding has been confirmed by Elegant Events Co.",
    "entityId": "64a1b2c3d4e5f6a7b8c9d0e2",
    "entityType": "booking",
    "isRead": false,
    "createdAt": "2025-03-21T10:30:00.000Z",
    "updatedAt": "2025-03-21T10:30:00.000Z"
  }
}
```

**Delivery scope:** The event must be emitted only to the recipient's private socket room (identified by their `userId`). It must NOT be broadcast to other users.

**Example (server-side pseudo-code):**
```js
// When a booking is confirmed:
const notification = await Notification.create({ ... });
io.to(`user:${notification.recipientId}`).emit('notification', { data: notification });
```

**User room join (on socket connect):**
The backend should join each authenticated socket to a user-scoped room on connect:
```js
socket.on('connect', () => {
  socket.join(`user:${socket.data.userId}`);
});
```

---

## Business Logic Rules

1. **Do not notify the actor.** If a client cancels a booking, only the vendor is notified — not the client.
2. **Deduplicate.** Do not create duplicate notifications for the same event. Use the `entityId` + `type` combination to check before inserting.
3. **Notification retention.** Notifications should be retained for at least 90 days. Older read notifications can be purged via a scheduled job.
4. **`unreadCount` accuracy.** The `unreadCount` in the list response must be a database count (e.g., `Notification.countDocuments({ recipientId, isRead: false })`), not derived from the current page.
5. **`read-all` scope.** The `PATCH /read-all` endpoint must only mark notifications belonging to the authenticated user as read — never other users' notifications.
6. **`new_message` notifications.** This type is optional. The chat system already provides an unread badge via the conversations API. Avoid double-notifying if the messaging feature is considered sufficient.

---

## Notification Triggers by Existing Endpoint

| Existing Endpoint | Event | Create Notification For |
|---|---|---|
| `POST /api/v1/bookings` | Client creates booking | Vendor: `new_booking` |
| `POST /api/v1/bookings/from-quote/:quoteId` | Client books from quote | Vendor: `new_booking` |
| `POST /api/v1/bookings/:id/vendor/decision` (confirmed) | Vendor confirms | Client: `booking_confirmed` |
| `POST /api/v1/bookings/:id/vendor/decision` (rejected) | Vendor rejects | Client: `booking_rejected` |
| `POST /api/v1/bookings/:id/cancel` | Client cancels | Vendor: `booking_cancelled` |
| `POST /api/v1/bookings/:id/confirm-payment` | Client pays | Vendor: `booking_paid` |
| `POST /api/v1/quotes/:id/send` | Vendor sends quote | Client: `quote_received` |
| `POST /api/v1/quotes/:id/revise` | Vendor revises quote | Client: `quote_revised` |
| `POST /api/v1/quotes/:id/withdraw` | Vendor withdraws | Client: `quote_withdrawn` |
| `POST /api/v1/quotes/:id/respond` (accept) | Client accepts | Vendor: `quote_accepted` |
| `POST /api/v1/quotes/:id/respond` (decline) | Client declines | Vendor: `quote_declined` |
| `POST /api/v1/customer-requests/submit` | Client submits request | Matched vendors: `new_request` |
| `POST /api/v1/customer-requests/submit/:id` | Client submits draft | Matched vendors: `new_request` |
| `POST /api/v1/disputes` | Client opens dispute | Vendor: `new_dispute` |
| Dispute status change (admin) | Admin updates dispute | Client: `dispute_update` |
| `POST /api/v1/reviews` | Client leaves review | Vendor: `new_review` |

---

## Frontend Contract Summary

The frontend expects:

- `notifications[].isRead` — boolean (not a timestamp)
- `notifications[].entityId` — optional string ID used to build deep-link URLs
- `notifications[].type` — exact string values from the enum above
- `data.unreadCount` — total unread across all pages (not paginated)
- Socket event name: `"notification"` (singular, lowercase)
- Socket payload wrapper: `{ data: Notification }` (matches the chat pattern `{ data: ChatMessage }`)
