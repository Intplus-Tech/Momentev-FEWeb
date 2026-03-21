# Vendor Setup — Backend API Reference & Requests

**From:** Frontend Team
**Date:** 2026-03-18
**Purpose:** Document all API endpoints consumed by the vendor onboarding wizard, and request new endpoints to support "Save & Continue Later" functionality.

---

## Authentication

All endpoints require:
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

Access tokens are JWT, 1 hour expiry. Refresh tokens are 7–30 days. Token refresh is handled automatically by the frontend.

---

## Part 1 — Existing Endpoints (Vendor Setup Wizard)

### Pre-Step: Get User Profile

Called before every step to retrieve `vendorId` and check onboarding status.

**`GET /api/v1/users/profile`**

Response fields used by the frontend:
```jsonc
{
  "data": {
    "vendor": {
      "_id": "vendorId",           // used in all subsequent requests
      "onBoardingStage": 0,        // 0=new, 1=business done, 2=service done, 3=payment done, 4=profile done
      "onBoarded": false,          // true only after Step 4 final submission
      "isActive": false,           // true after admin approves
      "paymentModel": "string",
      "businessProfile": {
        "contactInfo": {
          "addressId": "string"    // checked to avoid duplicate address creation
        }
      }
    },
    "addressId": "string"          // fallback personal address
  }
}
```

---

### Step 1 — Business Setup

#### 1a. Upload Documents

**`POST /api/v1/uploads`** — called up to 3 times (identification, registration, license)

Content-Type: `multipart/form-data`

Response:
```json
{
  "data": {
    "_id": "fileId",
    "url": "https://...",
    "originalName": "passport.jpg",
    "mimeType": "image/jpeg",
    "size": 204800,
    "provider": "string"
  }
}
```
- Max file size: **10MB** (return `413` if exceeded)
- Accepted: JPG, PNG, WebP

---

#### 1b. Create Address

**`POST /api/v1/addresses`**

Request:
```json
{
  "street": "123 High Street",
  "city": "London",
  "state": "England",
  "postalCode": "EC1A 1BB",
  "country": "GB"
}
```

Response: `{ "data": { "_id": "addressId", ... } }`

---

#### 1c. Update Address (if one already exists)

**`PATCH /api/v1/addresses/{addressId}`**

Request: same shape as POST above (partial update supported)

---

#### 1d. Submit Business Information

**`POST /api/v1/business-profiles`**

Request:
```json
{
  "vendorId": "string",
  "contactInfo": {
    "primaryContactName": "Jane Smith",
    "emailAddress": "jane@example.com",
    "phoneNumber": "+447911123456",
    "meansOfIdentification": "passport",
    "addressId": "addressId"
  },
  "businessName": "Acme Events Ltd",
  "yearInBusiness": "5",
  "companyRegNo": "12345678",
  "businessRegType": "limited_company",
  "businessDescription": "string",
  "serviceArea": {
    "travelDistance": "50 miles",
    "areaNames": [
      { "city": "london", "state": "england", "country": "GB" }
    ]
  },
  "workdays": [
    { "dayOfWeek": "monday", "open": "09:00", "close": "18:00" }
  ],
  "businessDocuments": [
    { "docName": "Identification", "file": "fileId" },
    { "docName": "Registration", "file": "fileId" },
    { "docName": "License", "file": "fileId" }
  ]
}
```

> **Field name note:** Frontend form uses `yearsInBusiness` → sent to API as `yearInBusiness`. Form uses `companyRegistrationNumber` → sent as `companyRegNo`.

Expected success response: `200` or `201`

> ⚠️ **Known issue:** Currently returns `409 Conflict` if called a second time (e.g., vendor refreshes page mid-setup). Frontend has no recovery path for this. See [Part 3 — Requested Fixes](#part-3--requested-fixes--issues).

---

### Step 2 — Service Setup

#### 2a. Create Vendor Service

**`POST /api/v1/vendor-services`**

Request:
```json
{
  "vendorId": "string",
  "serviceCategory": "categoryId",
  "tags": ["wedding", "corporate"],
  "minimumBookingDuration": "4 hours",
  "leadTimeRequired": "2 weeks",
  "maximumEventSize": 500,
  "additionalFees": [
    { "name": "Transport Fee (Flat)", "price": "50", "feeCategory": "travel" },
    { "name": "Setup Fee", "price": "100", "feeCategory": "other" }
  ]
}
```

> ⚠️ **Known issue:** No idempotency — re-submitting creates duplicate service records. See [Part 3](#part-3--requested-fixes--issues).

---

#### 2b. Create Vendor Specialty

**`POST /api/v1/vendor-specialties`** — called once per specialty, all in parallel

Request:
```json
{
  "vendorId": "string",
  "serviceSpecialty": "specialtyId",
  "priceCharge": "hourly_rate",
  "price": "150"
}
```

`priceCharge` values: `"hourly_rate"` | `"custom_quote"`
`price`: `"0"` when `priceCharge` is `"custom_quote"`

> ⚠️ **Known issue:** No idempotency — re-submitting creates duplicate specialty records. See [Part 3](#part-3--requested-fixes--issues).

---

### Step 3 — Payment Setup

Three separate API calls, each tied to a UI section.

#### 3a. Set Payment Model

**`PUT /api/v1/vendors/{vendorId}/payment-model`**

Request:
```json
{ "paymentModel": "upfront_payout" }
```

`paymentModel` values: `"upfront_payout"` | `"split_payout"`

---

#### 3b. Create Stripe Connected Account

**`POST /api/v1/vendors/{vendorId}/stripe-account`**

Request: `{}` (empty body — vendorId in path is sufficient)

Response:
```json
{
  "data": { "stripeAccountId": "acct_xxx" }
}
```

---

#### 3c. Get Stripe Account Status

**`GET /api/v1/vendors/{vendorId}/stripe-account`**

Response:
```json
{
  "data": {
    "vendorId": "string",
    "stripeAccountId": "acct_xxx",
    "chargesEnabled": true,
    "payoutsEnabled": true,
    "detailsSubmitted": true
  }
}
```

---

#### 3d. Get Stripe Onboarding Link

**`GET /api/v1/vendors/{vendorId}/stripe-onboarding`**

Response:
```json
{
  "data": {
    "vendorId": "string",
    "url": "https://connect.stripe.com/setup/...",
    "expiresAt": "2026-03-18T11:30:00.000Z"
  }
}
```

---

#### 3e. Accept Commission Agreement

**`POST /api/v1/vendors/{vendorId}/commission-agreement/accept`**

Request (hardcoded by frontend — do not change without coordinating):
```json
{
  "version": "v1",
  "commissionType": "percentage",
  "commissionAmount": 10,
  "currency": "GBP"
}
```

---

### Step 4 — Profile Setup

#### 4a. Upload Media Files

**`POST /api/v1/uploads`** — called multiple times (profile photo, cover photo, portfolio images ×5 minimum)

Same endpoint and response shape as Step 1 uploads.

---

#### 4b. Submit Vendor Profile & Complete Onboarding

**`PATCH /api/v1/vendors/{vendorId}`**

Request:
```json
{
  "profilePhoto": "uploadId",
  "coverPhoto": "uploadId",
  "portfolioGallery": ["uploadId", "uploadId", "uploadId", "uploadId", "uploadId"],
  "socialMediaLinks": [
    { "name": "Instagram", "link": "https://instagram.com/example" }
  ],
  "isActive": false,
  "onBoardingStage": 4,
  "onBoarded": true
}
```

This is the **final onboarding submission**. After this:
- `onBoarded` becomes `true`
- `isActive` is set to `false` (pending admin review)
- Vendor is redirected to an "Account Under Review" screen

Response:
```json
{
  "data": {
    "_id": "vendorId",
    "profilePhoto": { "url": "https://..." },
    "coverPhoto": { "url": "https://..." },
    "portfolioGallery": [{ "url": "https://..." }],
    "isActive": false,
    "onBoardingStage": 4,
    "updatedAt": "ISO date"
  }
}
```

> ⚠️ **Issue:** Response returns `{ url }` for photos but no `_id`. The frontend needs the file `_id` to allow vendors to resume setup and recognise already-uploaded files. See [Part 3](#part-3--requested-fixes--issues).

---

## Part 2 — New Endpoints Requested (Save & Continue Later)

We want vendors to be able to save progress mid-setup, log out, and resume on any device. We need 3 new endpoints tied to the vendor record.

### Context

Currently, form state is stored only in browser localStorage. If a vendor clears their browser or switches devices, all in-progress data is lost. The backend already tracks `onBoardingStage` for fully submitted steps, but has no way to store partial data within a step.

### Proposed: Vendor Setup Draft

Store a single JSON document per vendor. No schema validation needed on the contents — the frontend owns all validation. Backend simply stores and returns the blob.

---

#### New Endpoint 1 — Save Draft

**`PUT /api/v1/vendors/{vendorId}/setup-draft`**

Auth: Required. Vendor may only access their own draft.

Request body (full draft blob — store as-is):
```json
{
  "currentStep": 2,
  "expandedSection": 1,
  "completedSections": ["step1-section1", "step1-section2"],
  "businessInfo": {
    "businessName": "Acme Events",
    "primaryContactName": "Jane Smith",
    "emailAddress": "jane@acme.com",
    "phoneNumber": "+447911123456",
    "yearsInBusiness": "5",
    "companyRegistrationNumber": "12345678",
    "businessRegistrationType": "limited_company",
    "businessDescription": "string",
    "street": "123 High St",
    "city": "London",
    "state": "England",
    "postalCode": "EC1A 1BB",
    "country": "GB",
    "serviceLocations": [{ "city": "London", "state": "England", "country": "GB" }],
    "maximumTravelDistance": "50",
    "workingDays": { "monday": true, "tuesday": true, "wednesday": false },
    "workingHoursStart": "09:00",
    "workingHoursEnd": "18:00",
    "meansOfIdentification": "passport"
  },
  "serviceCategories": null,
  "pricingStructure": null,
  "paymentConfiguration": null,
  "profileCompletion": null,
  "documents": {
    "identification": [{ "id": "fileId1", "url": "https://...", "name": "passport.jpg" }],
    "registration": [],
    "license": []
  },
  "profilePhoto": null,
  "coverPhoto": null,
  "portfolioImages": [],
  "socialMediaLinks": [],
  "isBusinessInfoValid": true,
  "isDocumentsValid": false,
  "isServiceCategoriesValid": false,
  "isPricingStructureValid": false,
  "isPaymentConfigurationValid": false,
  "isProfileCompletionValid": false
}
```

Response `200 OK`:
```json
{
  "message": "Draft saved successfully",
  "data": {
    "vendorId": "string",
    "updatedAt": "2026-03-18T10:30:00.000Z"
  }
}
```

Error responses: `401 Unauthorized`, `403 Forbidden` (wrong vendor), `400 Bad Request`

---

#### New Endpoint 2 — Get Draft

**`GET /api/v1/vendors/{vendorId}/setup-draft`**

Auth: Required. Vendor may only access their own draft.

Response `200 OK`:
```json
{
  "message": "Draft retrieved successfully",
  "data": {
    "vendorId": "string",
    "updatedAt": "2026-03-18T10:30:00.000Z",
    "draft": { }
  }
}
```

`draft` contains the same shape as the PUT request body.

Response `404 Not Found` (no draft exists yet):
```json
{ "message": "No draft found" }
```

Error responses: `401 Unauthorized`, `403 Forbidden`

---

#### New Endpoint 3 — Delete Draft

**`DELETE /api/v1/vendors/{vendorId}/setup-draft`**

Called by the frontend when Step 4 is completed (onboarding finished).

Auth: Required. Vendor may only access their own draft.

Response `200 OK`:
```json
{ "message": "Draft deleted successfully" }
```

Response `404 Not Found` if no draft exists (idempotent delete preferred).

Error responses: `401 Unauthorized`, `403 Forbidden`

---

### Implementation Notes

| Note | Detail |
|---|---|
| **Storage** | Store as a single field on the Vendor document: `vendor.setupDraft: { data: Object, updatedAt: Date }` |
| **One draft per vendor** | PUT always overwrites. No history needed. |
| **Auto-delete on completion** | When `PATCH /api/v1/vendors/{id}` receives `onBoarded: true`, automatically clear `vendor.setupDraft` if it exists |
| **No content validation** | Frontend owns all form validation. Backend stores/returns the blob as-is. |
| **Authorization** | `vendorId` in the URL must match the authenticated vendor's ID |
| **Draft size** | Expected max ~50KB |

---

## Part 3 — Requested Fixes / Issues

| Priority | Endpoint | Issue | Requested Fix |
|---|---|---|---|
| 🔴 High | `POST /api/v1/business-profiles` | Returns `409 Conflict` if vendor resubmits (e.g., browser refresh mid-setup). Frontend has no recovery path. | Support upsert: if a business profile already exists for this vendor, update it instead of rejecting. Or return `200` with the existing record on conflict. |
| 🔴 High | `POST /api/v1/vendor-specialties` | Each call creates a new record. Re-submitting Step 2 creates duplicate specialties. | Upsert by `(vendorId, serviceSpecialty)`. If that combination already exists, update it rather than inserting a duplicate. |
| 🔴 High | `POST /api/v1/vendor-services` | Same duplicate issue — re-submission creates another service record. | Upsert by `vendorId`. A vendor should have at most one service record during setup. |
| 🟡 Medium | `PATCH /api/v1/vendors/{id}` response | `portfolioGallery` returns `[{ url }]` without `_id`. Frontend needs the file `_id` to identify already-uploaded files when resuming setup. | Include `_id` in each item: `[{ "_id": "fileId", "url": "..." }]`. Same for `profilePhoto` and `coverPhoto`. |
| 🟡 Medium | `POST /api/v1/business-profiles` | Unclear whether this endpoint increments `vendor.onBoardingStage` to `1`. The login redirect logic relies on this value to know which step to send the vendor to after login. | Confirm and ensure `onBoardingStage` is set to `1` after a successful business profile submission. |
