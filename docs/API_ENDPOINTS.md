# Momentev Frontend - Consumed API Endpoints

> **Last Updated:** 2026-02-14

This document lists all the backend API endpoints consumed by the Momentev frontend application, organized by module.

**Base URL**: `${BACKEND_URL}/api/v1`

---

## Changelog (2026-02-14)

### Missing Endpoints Added

- **Bookings** — 4 endpoints (`POST /bookings`, `GET /bookings`, `GET /bookings/{bookingId}`, `POST /bookings/{bookingId}/cancel`) were implemented in `lib/actions/booking.ts` but completely absent from docs.
- **Custom Requests** — 8 endpoints for the customer-request lifecycle (`submit`, `drafts`, `submit draft`, `update draft`, `get by ID`, `list mine`, `delete`, `cancel`) were implemented in `lib/actions/custom-request.ts` but completely absent from docs.
- **Vendor Profile Update** — `PATCH /vendors/{vendorId}` for vendor media/profile updates was implemented in `lib/actions/vendor-profile.ts` but missing from docs.
- **Service Category by ID** — `GET /service-categories/{id}` was implemented in `lib/actions/service-category-by-id.ts` but missing from docs.

### Discrepancies Fixed

- **`GET /service-categories`** — Doc previously listed Auth Required ✅. Code sends **no** `Authorization` header. Fixed to ❌.
- **`GET /chats/{conversationId}/messages`** — Query params `limit` (default 30) and `before` (cursor-based pagination) were undocumented. Added.
- **`GET /vendors/{vendorId}/reviews`** — Query params `page` and `limit` were undocumented. Added.
- **`GET /vendors/search`** — Query params `search`, `service`, `specialty`, `sort`, `page`, `limit` were undocumented. Added.
- **`GET /vendors/nearby`** — Query params `lat`, `long`, `maxDistanceKm`, `search`, `service`, `specialty`, `page`, `limit` were undocumented. Added.
- **`GET /vendor-specialties`** — Query params `page`, `limit`, `vendorId` were undocumented. Added.
- **`GET /customer-profile-management/{customerId}/reviews`** — Query params `page` and `limit` were undocumented. Added.
- **Summary table counts** were incorrect across multiple categories. All corrected.

---

## 🔐 Authentication

| Method  | Endpoint                          | Description                             | Auth | Params / Body                                              | Source File                  |
| ------- | --------------------------------- | --------------------------------------- | ---- | ---------------------------------------------------------- | ---------------------------- |
| `POST`  | `/auth/register`                  | Register a new user                     | ❌   | **Body:** `{ firstName, lastName, email, password, role }` | `lib/actions/auth.ts`        |
| `POST`  | `/auth/login`                     | Login with email and password           | ❌   | **Body:** `{ email, password }`                            | `lib/actions/auth.ts`        |
| `POST`  | `/auth/resend-verification-email` | Resend email verification link          | ❌   | **Body:** `{ email }`                                      | `lib/actions/auth.ts`        |
| `GET`   | `/auth/verify-email/{token}`      | Verify email with token                 | ❌   | **Path:** `token`                                          | `lib/actions/auth.ts`        |
| `GET`   | `/auth/google/auth-url`           | Get Google OAuth authorization URL      | ❌   | —                                                          | `lib/actions/auth.ts`        |
| `GET`   | `/auth/google/callback`           | Handle Google OAuth callback            | ❌   | **Query:** `code`, `role` (optional)                       | `lib/actions/auth.ts`        |
| `POST`  | `/auth/refresh-token`             | Refresh access token                    | ❌   | **Body:** `{ refreshToken }`                               | `lib/session.ts`, `proxy.ts` |
| `POST`  | `/auth/set-password`              | Set password for Google OAuth users     | ✅   | **Body:** `{ password }`                                   | `lib/actions/user.ts`        |
| `PATCH` | `/auth/change-password`           | Change password for authenticated users | ✅   | **Body:** `{ currentPassword, newPassword }`               | `lib/actions/user.ts`        |

---

## 👤 User Profile Management

| Method   | Endpoint                | Description                | Auth | Params / Body                                                                                   | Source File           |
| -------- | ----------------------- | -------------------------- | ---- | ----------------------------------------------------------------------------------------------- | --------------------- |
| `GET`    | `/users/profile`        | Get current user's profile | ✅   | —                                                                                               | `lib/actions/user.ts` |
| `PUT`    | `/users/profile/update` | Update user profile        | ✅   | **Body:** `{ firstName?, lastName?, phoneNumber?, dateOfBirth?, gender?, avatar?, addressId? }` | `lib/actions/user.ts` |
| `DELETE` | `/users/profile`        | Delete user account        | ✅   | —                                                                                               | `lib/actions/user.ts` |

---

## 📍 Address Management

| Method  | Endpoint          | Description                | Auth | Params / Body                                                                  | Source File              |
| ------- | ----------------- | -------------------------- | ---- | ------------------------------------------------------------------------------ | ------------------------ |
| `GET`   | `/addresses/{id}` | Get address by ID          | ✅   | **Path:** `id`                                                                 | `lib/actions/address.ts` |
| `POST`  | `/addresses`      | Create a new address       | ✅   | **Body:** `{ street, city, state, postalCode, country }`                       | `lib/actions/address.ts` |
| `PATCH` | `/addresses/{id}` | Update an existing address | ✅   | **Path:** `id` · **Body:** `{ street?, city?, state?, postalCode?, country? }` | `lib/actions/address.ts` |

---

## 🏪 Vendor Management

### Vendor Profile & Setup

| Method  | Endpoint              | Description                                     | Auth | Params / Body                                                                                                                                                                                                                                                                               | Source File                                                 |
| ------- | --------------------- | ----------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `GET`   | `/vendors/{vendorId}` | Get public vendor profile                       | ❌   | **Path:** `vendorId`                                                                                                                                                                                                                                                                        | `lib/actions/chat.ts`, `app/(home)/search/_data/actions.ts` |
| `PATCH` | `/vendors/{vendorId}` | Update vendor profile media & onboarding status | ✅   | **Path:** `vendorId` · **Body:** `{ profilePhoto, coverPhoto, portfolioGallery, socialMediaLinks?, isActive, onBoardingStage, onBoarded }`                                                                                                                                                  | `lib/actions/vendor-profile.ts`                             |
| `POST`  | `/business-profiles`  | Create/update business profile                  | ✅   | **Body:** `{ vendorId, contactInfo: { primaryContactName, emailAddress, phoneNumber, meansOfIdentification, addressId }, businessName, yearInBusiness, companyRegNo, businessRegType, businessDescription, serviceArea: { travelDistance, areaNames[] }, workdays[], businessDocuments[] }` | `lib/actions/vendor-setup.ts`                               |

### Vendor Staff Management

| Method   | Endpoint                              | Description                      | Auth | Params / Body                                                                              | Source File           |
| -------- | ------------------------------------- | -------------------------------- | ---- | ------------------------------------------------------------------------------------------ | --------------------- |
| `GET`    | `/vendors/permissions`                | Get supported vendor permissions | ✅   | —                                                                                          | `lib/actions/user.ts` |
| `GET`    | `/vendors/{vendorId}/staff`           | Get vendor staff list            | ✅   | **Path:** `vendorId`                                                                       | `lib/actions/user.ts` |
| `POST`   | `/vendors/{vendorId}/staff`           | Add new vendor staff member      | ✅   | **Path:** `vendorId` · **Body:** `{ firstName, lastName, email, permissions[], isActive }` | `lib/actions/user.ts` |
| `PATCH`  | `/vendors/{vendorId}/staff/{staffId}` | Update vendor staff member       | ✅   | **Path:** `vendorId`, `staffId` · **Body:** `{ permissions?, isActive? }`                  | `lib/actions/user.ts` |
| `DELETE` | `/vendors/{vendorId}/staff/{staffId}` | Delete vendor staff member       | ✅   | **Path:** `vendorId`, `staffId`                                                            | `lib/actions/user.ts` |

### Vendor Search & Discovery (Public)

| Method | Endpoint                          | Description                         | Auth | Params / Body                                                                                          | Source File                          |
| ------ | --------------------------------- | ----------------------------------- | ---- | ------------------------------------------------------------------------------------------------------ | ------------------------------------ |
| `GET`  | `/vendors/search`                 | Search vendors with filters         | ❌   | **Query:** `search`, `service` (category ID), `specialty` (ID), `sort` (`rate_desc`), `page`, `limit`  | `app/(home)/search/_data/actions.ts` |
| `GET`  | `/vendors/nearby`                 | Get nearby vendors (location-based) | ❌   | **Query:** `lat`, `long`, `maxDistanceKm`, `search`, `service` (ID), `specialty` (ID), `page`, `limit` | `app/(home)/search/_data/actions.ts` |
| `GET`  | `/vendors/{vendorId}/services`    | Get vendor's services               | ❌   | **Path:** `vendorId`                                                                                   | `app/(home)/search/_data/actions.ts` |
| `GET`  | `/vendors/{vendorId}/specialties` | Get vendor's specialties            | ❌   | **Path:** `vendorId`                                                                                   | `app/(home)/search/_data/actions.ts` |
| `GET`  | `/vendors/{vendorId}/reviews`     | Get vendor's reviews                | ❌   | **Path:** `vendorId` · **Query:** `page`, `limit`                                                      | `app/(home)/search/_data/actions.ts` |

---

## 📅 Bookings

| Method | Endpoint                       | Description                         | Auth | Params / Body                                                                                                                                                                                   | Source File              |
| ------ | ------------------------------ | ----------------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| `POST` | `/bookings`                    | Create a booking                    | ✅   | **Body:** `{ vendorId, eventDetails: { title, startDate, endDate, guestCount, description }, budgetAllocations: [{ vendorSpecialtyId, budgetedAmount }], location: { addressText }, currency }` | `lib/actions/booking.ts` |
| `GET`  | `/bookings`                    | Fetch bookings for the current user | ✅   | **Query:** `page` (default 1), `limit` (default 10)                                                                                                                                             | `lib/actions/booking.ts` |
| `GET`  | `/bookings/{bookingId}`        | Fetch a single booking by ID        | ✅   | **Path:** `bookingId`                                                                                                                                                                           | `lib/actions/booking.ts` |
| `POST` | `/bookings/{bookingId}/cancel` | Cancel a booking                    | ✅   | **Path:** `bookingId`                                                                                                                                                                           | `lib/actions/booking.ts` |

---

## 📋 Custom Requests

| Method   | Endpoint                         | Description                          | Auth | Params / Body                                                                                                                                                                                                            | Source File                     |
| -------- | -------------------------------- | ------------------------------------ | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------- |
| `POST`   | `/customer-requests/submit`      | Submit a custom request              | ✅   | **Body:** `{ customerId, serviceCategoryId?, eventDetails: { title, description, startDate, endDate?, guestCount, location }, vendorNeeds?, budgetAllocations: [{ serviceSpecialtyId, budgetedAmount }], attachments? }` | `lib/actions/custom-request.ts` |
| `POST`   | `/customer-requests/drafts`      | Save a custom request as draft       | ✅   | **Body:** same as submit                                                                                                                                                                                                 | `lib/actions/custom-request.ts` |
| `POST`   | `/customer-requests/submit/{id}` | Submit an existing draft             | ✅   | **Path:** `id`                                                                                                                                                                                                           | `lib/actions/custom-request.ts` |
| `PATCH`  | `/customer-requests/drafts/{id}` | Update an existing draft (partial)   | ✅   | **Path:** `id` · **Body:** `Partial<CustomRequestPayload>`                                                                                                                                                               | `lib/actions/custom-request.ts` |
| `GET`    | `/customer-requests/{id}`        | Fetch a single custom request by ID  | ✅   | **Path:** `id` · **Query:** `populate=serviceCategoryId,budgetAllocations.serviceSpecialtyId`                                                                                                                            | `lib/actions/custom-request.ts` |
| `GET`    | `/customer-requests/me`          | Fetch current user's custom requests | ✅   | **Query:** `page`, `limit`, `serviceCategoryId?`, `status?`, `dateFrom?`, `dateTo?`, `search?`                                                                                                                           | `lib/actions/custom-request.ts` |
| `DELETE` | `/customer-requests/{id}`        | Delete a custom request              | ✅   | **Path:** `id`                                                                                                                                                                                                           | `lib/actions/custom-request.ts` |
| `PATCH`  | `/customer-requests/{id}/cancel` | Cancel a custom request              | ✅   | **Path:** `id`                                                                                                                                                                                                           | `lib/actions/custom-request.ts` |

---

## 💳 Payment & Stripe

| Method | Endpoint                                          | Description                     | Auth | Params / Body                                                                                | Source File              |
| ------ | ------------------------------------------------- | ------------------------------- | ---- | -------------------------------------------------------------------------------------------- | ------------------------ |
| `PUT`  | `/vendors/{vendorId}/payment-model`               | Set vendor payment model        | ✅   | **Path:** `vendorId` · **Body:** `{ paymentModel }` (`"upfront_payout"` \| `"split_payout"`) | `lib/actions/payment.ts` |
| `POST` | `/vendors/{vendorId}/stripe-account`              | Create Stripe connected account | ✅   | **Path:** `vendorId` · **Body:** `{}`                                                        | `lib/actions/payment.ts` |
| `POST` | `/vendors/{vendorId}/commission-agreement/accept` | Accept commission agreement     | ✅   | **Path:** `vendorId` · **Body:** `{ version, commissionType, commissionAmount, currency }`   | `lib/actions/payment.ts` |

---

## 💬 Chat & Messaging

| Method | Endpoint                           | Description                            | Auth | Params / Body                                                                                              | Source File           |
| ------ | ---------------------------------- | -------------------------------------- | ---- | ---------------------------------------------------------------------------------------------------------- | --------------------- |
| `GET`  | `/chats`                           | Get all conversations                  | ✅   | —                                                                                                          | `lib/actions/chat.ts` |
| `POST` | `/chats/vendor/{vendorId}`         | Get or create conversation with vendor | ✅   | **Path:** `vendorId`                                                                                       | `lib/actions/chat.ts` |
| `GET`  | `/chats/{conversationId}/messages` | Get messages for a conversation        | ✅   | **Path:** `conversationId` · **Query:** `limit` (default 30), `before?` (message ID for cursor pagination) | `lib/actions/chat.ts` |
| `POST` | `/chats/{conversationId}/messages` | Send a message                         | ✅   | **Path:** `conversationId` · **Body:** `CreateMessageRequest`                                              | `lib/actions/chat.ts` |
| `POST` | `/chats/{conversationId}/read`     | Mark conversation as read              | ✅   | **Path:** `conversationId`                                                                                 | `lib/actions/chat.ts` |

---

## ⭐ Reviews (Customer)

| Method | Endpoint                                            | Description          | Auth | Params / Body                                       | Source File              |
| ------ | --------------------------------------------------- | -------------------- | ---- | --------------------------------------------------- | ------------------------ |
| `GET`  | `/customer-profile-management/{customerId}/reviews` | Get customer reviews | ✅   | **Path:** `customerId` · **Query:** `page`, `limit` | `lib/actions/reviews.ts` |

---

## 🛠️ Services & Categories

### Service Categories

| Method | Endpoint                                          | Description                     | Auth | Params / Body                                       | Source File                             |
| ------ | ------------------------------------------------- | ------------------------------- | ---- | --------------------------------------------------- | --------------------------------------- |
| `GET`  | `/service-categories`                             | Fetch all service categories    | ❌   | **Query:** `page` (default 1), `limit` (default 50) | `lib/actions/service-categories.ts`     |
| `GET`  | `/service-categories/{id}`                        | Get service category by ID      | ✅   | **Path:** `id`                                      | `lib/actions/service-category-by-id.ts` |
| `GET`  | `/service-categories/{categoryId}/suggested-tags` | Get suggested tags for category | ✅   | **Path:** `categoryId`                              | `lib/actions/service-categories.ts`     |

### Service Specialties

| Method | Endpoint                                        | Description                 | Auth | Params / Body          | Source File                          |
| ------ | ----------------------------------------------- | --------------------------- | ---- | ---------------------- | ------------------------------------ |
| `GET`  | `/service-specialties/{id}`                     | Get service specialty by ID | ✅   | **Path:** `id`         | `lib/actions/service-specialties.ts` |
| `GET`  | `/service-specialties/by-category/{categoryId}` | Get specialties by category | ✅   | **Path:** `categoryId` | `lib/actions/service-categories.ts`  |

### Vendor Services & Specialties

| Method   | Endpoint                   | Description                            | Auth Required | Source File                         |
| -------- | -------------------------- | -------------------------------------- | ------------- | ----------------------------------- |
| `POST`   | `/vendor-services`         | Create vendor service                  | ✅            | `lib/actions/service.ts`            |
| `PUT`    | `/vendor-services/{id}`    | Update vendor service (tags, fees)     | ✅            | `lib/actions/vendor-services.ts`    |
| `DELETE` | `/vendor-services/{id}`    | Delete vendor service                  | ✅            | `lib/actions/vendor-services.ts`    |
| `POST`   | `/vendor-specialties`      | Create vendor specialty                | ✅            | `lib/actions/vendor-specialties.ts` |
| `GET`    | `/vendor-specialties`      | Get vendor specialties with pagination | ✅            | `lib/actions/vendor-specialties.ts` |
| `PUT`    | `/vendor-specialties/{id}` | Update vendor specialty pricing        | ✅            | `lib/actions/vendor-specialties.ts` |
| `DELETE` | `/vendor-specialties/{id}` | Delete vendor specialty                | ✅            | `lib/actions/vendor-specialties.ts` |

---

## 📤 File Upload

| Method | Endpoint        | Description            | Auth | Params / Body                                                                                    | Source File             |
| ------ | --------------- | ---------------------- | ---- | ------------------------------------------------------------------------------------------------ | ----------------------- |
| `POST` | `/uploads`      | Upload file (max 10MB) | ✅   | **Body:** `FormData` (multipart file upload — no explicit `Content-Type`, browser sets boundary) | `lib/actions/upload.ts` |
| `GET`  | `/uploads/{id}` | Get file details by ID | ✅   | **Path:** `id`                                                                                   | `lib/actions/upload.ts` |

---

## 🆘 Support

| Method | Endpoint            | Description            | Auth          | Params / Body                                                                                             | Source File              |
| ------ | ------------------- | ---------------------- | ------------- | --------------------------------------------------------------------------------------------------------- | ------------------------ |
| `POST` | `/support-requests` | Create support request | ❌ (optional) | **Body:** `{ firstName, lastName, email, message }` · Sends `Authorization: Bearer` if token is available | `lib/actions/support.ts` |

---

## 📊 Summary

| Category              | Endpoints Count |
| --------------------- | --------------- |
| Authentication        | 9               |
| User Profile          | 3               |
| Address               | 3               |
| Vendor Management     | 15              |
| Bookings              | 4               |
| Custom Requests       | 8               |
| Payment & Stripe      | 3               |
| Chat & Messaging      | 5               |
| Reviews               | 1               |
| Services & Categories | 10              |
| File Upload           | 1               |
| Support               | 1               |
| **Total**             | **43**          |

---

## 🔑 Authentication Notes

- All protected endpoints use `Authorization: Bearer {accessToken}` header
- Token refresh is handled automatically via `tryRefreshToken()` on 401 responses
- Access tokens stored in HTTP-only cookies (`auth-token`)
- Refresh tokens stored in HTTP-only cookies (`refresh-token`)
- `POST /auth/refresh-token` accepts `{ refreshToken }` in the request body

## 📁 Source Files Reference

All server actions are located in:

- `lib/actions/` - Main server actions directory
- `app/(home)/search/_data/actions.ts` - Search-specific actions (public vendor endpoints)

Related files:

- `lib/session.ts` - Session management and token handling
- `proxy.ts` - Middleware for route protection and token refresh
- `hooks/api/` - React Query wrappers around the server actions above
- `types/` - TypeScript interfaces for request/response payloads
