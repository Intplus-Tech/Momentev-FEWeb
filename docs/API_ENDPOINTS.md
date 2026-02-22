# Momentev Frontend - Consumed API Endpoints

> **Last Updated:** 2026-02-05

This document lists all the backend API endpoints consumed by the Momentev frontend application, organized by module.

**Base URL**: `${BACKEND_URL}/api/v1`

---

## 🔐 Authentication

| Method  | Endpoint                                        | Description                              | Auth Required | Source File                  |
| ------- | ----------------------------------------------- | ---------------------------------------- | ------------- | ---------------------------- |
| `POST`  | `/auth/register`                                | Register a new user (customer or vendor) | ❌            | `lib/actions/auth.ts`        |
| `POST`  | `/auth/login`                                   | Login with email and password            | ❌            | `lib/actions/auth.ts`        |
| `POST`  | `/auth/resend-verification-email`               | Resend email verification link           | ❌            | `lib/actions/auth.ts`        |
| `GET`   | `/auth/verify-email/{token}`                    | Verify email with token                  | ❌            | `lib/actions/auth.ts`        |
| `GET`   | `/auth/google/auth-url`                         | Get Google OAuth authorization URL       | ❌            | `lib/actions/auth.ts`        |
| `GET`   | `/auth/google/callback?code={code}&role={role}` | Handle Google OAuth callback             | ❌            | `lib/actions/auth.ts`        |
| `POST`  | `/auth/refresh-token`                           | Refresh access token                     | ❌            | `lib/session.ts`, `proxy.ts` |
| `POST`  | `/auth/set-password`                            | Set password for Google OAuth users      | ✅            | `lib/actions/user.ts`        |
| `PATCH` | `/auth/change-password`                         | Change password for authenticated users  | ✅            | `lib/actions/user.ts`        |

---

## 👤 User Profile Management

| Method   | Endpoint                | Description                | Auth Required | Source File           |
| -------- | ----------------------- | -------------------------- | ------------- | --------------------- |
| `GET`    | `/users/profile`        | Get current user's profile | ✅            | `lib/actions/user.ts` |
| `PUT`    | `/users/profile/update` | Update user profile        | ✅            | `lib/actions/user.ts` |
| `DELETE` | `/users/profile`        | Delete user account        | ✅            | `lib/actions/user.ts` |

---

## 📍 Address Management

| Method  | Endpoint          | Description                | Auth Required | Source File              |
| ------- | ----------------- | -------------------------- | ------------- | ------------------------ |
| `GET`   | `/addresses/{id}` | Get address by ID          | ✅            | `lib/actions/address.ts` |
| `POST`  | `/addresses`      | Create a new address       | ✅            | `lib/actions/address.ts` |
| `PATCH` | `/addresses/{id}` | Update an existing address | ✅            | `lib/actions/address.ts` |

---

## 🏪 Vendor Management

### Vendor Profile & Setup

| Method | Endpoint              | Description                    | Auth Required | Source File                   |
| ------ | --------------------- | ------------------------------ | ------------- | ----------------------------- |
| `GET`  | `/vendors/{vendorId}` | Get public vendor profile      | ❌            | `lib/actions/chat.ts`         |
| `POST` | `/business-profiles`  | Create/update business profile | ✅            | `lib/actions/vendor-setup.ts` |

### Vendor Staff Management

| Method   | Endpoint                              | Description                      | Auth Required | Source File           |
| -------- | ------------------------------------- | -------------------------------- | ------------- | --------------------- |
| `GET`    | `/vendors/permissions`                | Get supported vendor permissions | ✅            | `lib/actions/user.ts` |
| `GET`    | `/vendors/{vendorId}/staff`           | Get vendor staff list            | ✅            | `lib/actions/user.ts` |
| `POST`   | `/vendors/{vendorId}/staff`           | Add new vendor staff member      | ✅            | `lib/actions/user.ts` |
| `PATCH`  | `/vendors/{vendorId}/staff/{staffId}` | Update vendor staff member       | ✅            | `lib/actions/user.ts` |
| `DELETE` | `/vendors/{vendorId}/staff/{staffId}` | Delete vendor staff member       | ✅            | `lib/actions/user.ts` |

### Vendor Search & Formatting (Public)

| Method | Endpoint                          | Description                         | Auth Required | Source File                          |
| ------ | --------------------------------- | ----------------------------------- | ------------- | ------------------------------------ |
| `GET`  | `/vendors/search`                 | Search vendors with filters         | ❌            | `app/(home)/search/_data/actions.ts` |
| `GET`  | `/vendors/nearby`                 | Get nearby vendors (location-based) | ❌            | `app/(home)/search/_data/actions.ts` |
| `GET`  | `/vendors/{vendorId}/services`    | Get vendor's services               | ❌            | `app/(home)/search/_data/actions.ts` |
| `GET`  | `/vendors/{vendorId}/specialties` | Get vendor's specialties            | ❌            | `app/(home)/search/_data/actions.ts` |
| `GET`  | `/vendors/{vendorId}/reviews`     | Get vendor's reviews                | ❌            | `app/(home)/search/_data/actions.ts` |

---

## 💳 Payment & Stripe

| Method | Endpoint                                          | Description                     | Auth Required | Source File              |
| ------ | ------------------------------------------------- | ------------------------------- | ------------- | ------------------------ |
| `PUT`  | `/vendors/{vendorId}/payment-model`               | Set vendor payment model        | ✅            | `lib/actions/payment.ts` |
| `POST` | `/vendors/{vendorId}/stripe-account`              | Create Stripe connected account | ✅            | `lib/actions/payment.ts` |
| `POST` | `/vendors/{vendorId}/commission-agreement/accept` | Accept commission agreement     | ✅            | `lib/actions/payment.ts` |

---

## 💬 Chat & Messaging

| Method | Endpoint                           | Description                            | Auth Required | Source File           |
| ------ | ---------------------------------- | -------------------------------------- | ------------- | --------------------- |
| `GET`  | `/chats`                           | Get all conversations                  | ✅            | `lib/actions/chat.ts` |
| `POST` | `/chats/vendor/{vendorId}`         | Get or create conversation with vendor | ✅            | `lib/actions/chat.ts` |
| `GET`  | `/chats/{conversationId}/messages` | Get messages for a conversation        | ✅            | `lib/actions/chat.ts` |
| `POST` | `/chats/{conversationId}/messages` | Send a message                         | ✅            | `lib/actions/chat.ts` |
| `POST` | `/chats/{conversationId}/read`     | Mark conversation as read              | ✅            | `lib/actions/chat.ts` |

---

## ⭐ Reviews (Customer)

| Method | Endpoint                                            | Description          | Auth Required | Source File              |
| ------ | --------------------------------------------------- | -------------------- | ------------- | ------------------------ |
| `GET`  | `/customer-profile-management/{customerId}/reviews` | Get customer reviews | ✅            | `lib/actions/reviews.ts` |

---

## 🛠️ Services & Categories

### Service Categories

| Method | Endpoint                                          | Description                     | Auth Required | Source File                         |
| ------ | ------------------------------------------------- | ------------------------------- | ------------- | ----------------------------------- |
| `GET`  | `/service-categories`                             | Fetch all service categories    | ✅            | `lib/actions/service-categories.ts` |
| `GET`  | `/service-categories/{categoryId}/suggested-tags` | Get suggested tags for category | ✅            | `lib/actions/service-categories.ts` |

### Service Specialties

| Method | Endpoint                                        | Description                 | Auth Required | Source File                          |
| ------ | ----------------------------------------------- | --------------------------- | ------------- | ------------------------------------ |
| `GET`  | `/service-specialties/{id}`                     | Get service specialty by ID | ✅            | `lib/actions/service-specialties.ts` |
| `GET`  | `/service-specialties/by-category/{categoryId}` | Get specialties by category | ✅            | `lib/actions/service-categories.ts`  |

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

| Method | Endpoint        | Description            | Auth Required | Source File             |
| ------ | --------------- | ---------------------- | ------------- | ----------------------- |
| `POST` | `/uploads`      | Upload file (max 10MB) | ✅            | `lib/actions/upload.ts` |
| `GET`  | `/uploads/{id}` | Get file details by ID | ✅            | `lib/actions/upload.ts` |

---

## 🆘 Support

| Method | Endpoint            | Description            | Auth Required | Source File              |
| ------ | ------------------- | ---------------------- | ------------- | ------------------------ |
| `POST` | `/support-requests` | Create support request | ❌ (optional) | `lib/actions/support.ts` |

---

## 📊 Summary

| Category              | Endpoints Count |
| --------------------- | --------------- |
| Authentication        | 8               |
| User Profile          | 3               |
| Address               | 3               |
| Vendor Management     | 8               |
| Payment & Stripe      | 3               |
| Chat & Messaging      | 5               |
| Reviews               | 1               |
| Services & Categories | 10              |
| File Upload           | 1               |
| Support               | 1               |
| **Total**             | **43**          |

---

## 🔑 Authentication Notes

- Most protected endpoints use Bearer token authentication
- Token refresh is handled automatically via `tryRefreshToken()` on 401 responses
- Access tokens stored in HTTP-only cookies (`auth-token`)
- Refresh tokens stored in HTTP-only cookies (`refresh-token`)

## 📁 Source Files Reference

All server actions are located in:

- `lib/actions/` - Main server actions directory
- `app/(home)/search/_data/actions.ts` - Search-specific actions

Related files:

- `lib/session.ts` - Session management and token handling
- `proxy.ts` - Middleware for route protection and token refresh
