# Momentiv Review System — Master Specification

## 1. System Overview & Core Rules

This document describes the architecture for the Momentiv Review System. The system allows customers to rate vendors, automatically updates vendor profiles, and provides moderation tools for administrators.

### Immutable Business Logic

- **Eligibility:** Only authenticated customers can leave a review.
- **State Constraint:** A review can only be created if the associated `bookingId` has a status of exactly `completed`. Return `403 Forbidden` otherwise.
- **Uniqueness:** A customer may leave only one review per booking. Return `409 Conflict` for duplicate attempts.
- **Vendor Impact:** Vendors cannot edit or reply to reviews. On every create/update/delete action, recalculate the vendor's average `rate` (float between 1–5) and `reviewCount`.

## 2. Data Models (TypeScript Interfaces)

```ts
// ------------------------------------------
// 1. Core Review Object (Database / Response)
// ------------------------------------------
export interface Review {
  _id: string;
  vendorId: string; // Ref to Vendor
  bookingId: string; // Ref to Booking
  reviewerUserId: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string; // URL to profile photo
  };
  rating: number; // Integer 1-5
  comment?: string;
  isEdited: boolean; // Auto-set to true if customer updates it
  isFlagged: boolean; // Auto-set to true if admin flags it
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

// ------------------------------------------
// 2. Input Payloads (Mutations)
// ------------------------------------------
export interface CreateReviewInput {
  vendorId: string;
  bookingId: string;
  rating: number; // Min 1, Max 5
  comment?: string;
}

export interface UpdateReviewInput {
  rating?: number; // Min 1, Max 5
  comment?: string;
}

export interface FlagReviewInput {
  isFlagged: boolean;
}

// ------------------------------------------
// 3. Admin Query Parameters
// ------------------------------------------
export interface AdminReviewQueryParams {
  page?: number;
  limit?: number;
  vendorId?: string;
  reviewerUserId?: string;
  minRating?: number;
  maxRating?: number;
  isFlagged?: boolean;
}
```

## 3. API Endpoints & Data Flow

All customer endpoints require a Customer Bearer Token. All admin endpoints require an Admin Bearer Token.

### A. Customer Endpoints (Self-Service)

- **Create Review**
  - Endpoint: `POST /api/v1/reviews`
  - Payload: `CreateReviewInput`
  - Side-effects: Recalculate vendor rate, increment `reviewCount`, trigger `review.created` notification to vendor.

- **Update Review**
  - Endpoint: `PATCH /api/v1/reviews/{reviewId}`
  - Payload: `UpdateReviewInput`
  - Side-effects: Set `isEdited: true`, recalculate vendor rate.

- **Delete Review**
  - Endpoint: `DELETE /api/v1/reviews/{reviewId}`
  - Side-effects: Recalculate vendor rate, decrement `reviewCount`.

### B. Admin Endpoints (Moderation)

- **Get All Reviews**
  - Endpoint: `GET /api/v1/admin/reviews`
  - Query: `AdminReviewQueryParams`
  - Response: Paginated list of `Review` objects.

- **Flag Review**
  - Endpoint: `PATCH /api/v1/admin/reviews/{reviewId}/flag`
  - Payload: `FlagReviewInput`
  - Behavior: Marks review for internal tracking. Does *not* hide it from public view.

- **Delete Review (Moderator Action)**
  - Endpoint: `DELETE /api/v1/admin/reviews/{reviewId}`
  - Behavior: Hard delete for TOS violations and recalculate vendor rate.

## 4. System Triggers & Notification Flow

The prompt to leave a review is triggered when a booking reaches the `completed` state.

### 1. The Event Trigger

When a booking status changes to `completed` (e.g., admin releases payout or a scheduled job detects the event date has passed), the backend fires a `booking.completed` event.

### 2. Multi-Channel Delivery

- Push Notification: send FCM/APNs payload.
- Deep link: `momentiv://app/interaction/{bookingId}?action=review`.
- Email: transactional HTML email with 1–5 clickable stars as magic links.
- In-App Notification: add a record to the `GET /api/v1/notifications` feed.

### 3. Frontend UI State Reactivity

In the Unified Inbox, if `booking.status === 'completed'` AND `hasReviewed === false`, the primary card action becomes **Leave a Review**. Clicking the action (or following a deep link) opens the `ReviewModal` over the booking detail page.

## 5. Implementation Directives for AI Agent

When implementing, follow this order:

1. Types & Schema: create strict TypeScript interfaces in `types/review.ts` (use the interfaces above).
2. API Services: implement fetch/axios wrappers in `lib/actions/reviews.ts` and `lib/actions/admin-reviews.ts`, attaching auth headers.
3. Frontend Modal (Customer): build `ReviewModal` using React Hook Form; ensure star-rating input only accepts integers between `1` and `5`.
4. Admin Table: create `/admin/reviews` dashboard with columns: Vendor, Reviewer, Rating, Date, Flag Status, Delete action.
5. State Management: after successful mutation (`POST`, `PATCH`, `DELETE`) call `queryClient.invalidateQueries()` for the vendor profile, the user's unified inbox, and the reviews list to reflect state changes immediately.

---

If you want, I can also:

- Create `types/review.ts` with these interfaces.
- Scaffold `lib/actions/reviews.ts` and `lib/actions/admin-reviews.ts`.

Tell me which of the above you'd like me to implement next.