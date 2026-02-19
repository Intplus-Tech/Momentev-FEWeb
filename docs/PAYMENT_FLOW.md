# Payment Flow (Stripe)

This document explains the end-to-end payment flow implemented in the Momentiv backend using Stripe.

It is written for frontend developers integrating Stripe.js and for admins/vendors using Stripe Connect.

## TL;DR (Happy Path)

1. Vendor connects Stripe (Connect Express) and completes onboarding.
2. Customer creates a booking and requests a PaymentIntent from the backend.
3. Frontend confirms the payment with Stripe.js using the returned `clientSecret`.
4. Frontend calls the backend to confirm and persist the latest Stripe status.
5. If using `split_payout`, an admin later releases the vendor payout via Stripe Transfer.

---

## Actors

- **Customer (Frontend)**: Uses Stripe.js to confirm a PaymentIntent.
- **Vendor (Frontend)**: Completes Stripe Connect onboarding; manages payout methods.
- **Admin (Frontend/Admin tools)**: Releases payouts and performs refunds.
- **Backend API**: Creates/retrieves Stripe objects and persists booking/payment state.
- **Stripe**: Payment processor + Connect platform.

---

## Stripe Objects Used

- **Customer**: A Stripe Customer linked to a platform user (`User.stripeCustomerId`).
- **PaymentIntent**: A Stripe PaymentIntent created for a booking.
- **Connected Account**: A Stripe Connect Express account linked to a vendor (`Vendor.paymentAccountId`).
- **Transfer**: A Stripe Transfer used in `split_payout` to send funds to the vendor account.
- **Refund**: A Stripe Refund created against a PaymentIntent.

---

## Environment & Configuration

Backend relies on these Stripe-related environment variables (names may differ depending on your `env` loader):

- `STRIPE_SECRET_KEY` (required): Platform secret key (test or live).
- `STRIPE_DEFAULT_COUNTRY` (optional): Used when creating Connect accounts.
- `STRIPE_CONNECT_RETURN_URL` / `STRIPE_CONNECT_REFRESH_URL` (required for onboarding links).

Important operational note:

- **Test vs Live keys must match your stored Stripe IDs.** If your database contains a `cus_...` created under Stripe test mode but the server runs with a live key (or vice versa), Stripe will respond with errors like “No such customer”.

---

## Vendor Stripe Connect Onboarding (Vendors)

### Goal

Create a Stripe Connect Express account for the vendor and complete onboarding so Stripe enables capabilities (especially `transfers`).

### Endpoints

- Create/ensure vendor connected account:
  - `POST /api/v1/vendors/{vendorId}/stripe-account`
- Get connected account status flags:
  - `GET /api/v1/vendors/{vendorId}/stripe-account`
- Get onboarding link (redirect vendor to Stripe):
  - `GET /api/v1/vendors/{vendorId}/stripe-onboarding`
- Get dashboard login link (optional convenience):
  - `GET /api/v1/vendors/{vendorId}/stripe-dashboard`

### Typical UI Flow

1. Call `POST /vendors/{vendorId}/stripe-account` (idempotent-ish). Backend creates/returns `stripeAccountId`.
2. Call `GET /vendors/{vendorId}/stripe-onboarding` and redirect vendor to the returned `url`.
3. After vendor returns, poll `GET /vendors/{vendorId}/stripe-account` until:
   - `detailsSubmitted` is `true`
   - `payoutsEnabled` is `true` (as applicable)
   - And (critically for destination charges/transfers) Stripe has enabled `transfers` capability.

### Vendor payout methods (external accounts)

- Add payout method (bank/card token created with Stripe.js):
  - `POST /api/v1/vendors/{vendorId}/payment-methods`
- List payout methods:
  - `GET /api/v1/vendors/{vendorId}/payment-methods`
- Set default payout method:
  - `PUT /api/v1/vendors/{vendorId}/payment-methods/{externalAccountId}/default`

---

## Booking Payment Flow (Customer)

### 1) Create PaymentIntent (Server)

**Endpoint**

- `POST /api/v1/bookings/{bookingId}/payment-intent`

**What it does**

- Ensures caller has access to the booking.
- Computes booking totals in minor units (e.g. pence/cents).
- Ensures the customer has a Stripe Customer ID.
  - If the stored `User.stripeCustomerId` is missing/deleted or belongs to a different Stripe mode, backend will recreate it and persist the new id.
- Creates a Stripe PaymentIntent with `automatic_payment_methods` enabled.
- Persists booking payment fields and sets booking status to `PENDING_PAYMENT`.

**Response**

- Returns:
  - `clientSecret` (used only by Stripe.js on the frontend)
  - `paymentIntentId`
  - `bookingId`

### 2) Confirm on Client (Stripe.js)

Using the returned `clientSecret`, the frontend confirms the payment with Stripe.js.

- Example (conceptual):
  - `stripe.confirmPayment({ clientSecret, ... })`

Notes:

- The backend does not confirm the payment on Stripe for you; Stripe.js does.
- Depending on payment method, Stripe may require redirects / 3DS authentication.

### 3) Confirm on Server (Persist authoritative Stripe status)

**Endpoint**

- `POST /api/v1/bookings/{bookingId}/confirm-payment`

**What it does**

- Retrieves the PaymentIntent from Stripe using `booking.payment.paymentIntentId`.
- Updates booking payment fields based on Stripe status.
- If Stripe status is `succeeded`, marks booking as `PAID` and sets `paidAt`.

### 4) Read payment status (optional polling)

**Endpoint**

- `GET /api/v1/bookings/{bookingId}/payment-status`

**Behavior**

- If no PaymentIntent exists yet → returns `NOT_STARTED`.
- Otherwise retrieves the PaymentIntent from Stripe and returns the latest status + amount/currency.

---

## Payment Models: `upfront_payout` vs `split_payout`

Vendors can be configured with a payment model.

### `upfront_payout`

- Backend attempts a **destination charge** by creating the PaymentIntent with:
  - `application_fee_amount` (platform commission)
  - `transfer_data.destination = vendor.paymentAccountId`

This requires the vendor’s connected account to be properly onboarded and transfer-capable.

### `split_payout`

- Customer pays the platform first.
- Later, an admin releases payout via Stripe Transfer.

### Automatic fallback behavior

If a vendor is configured for `upfront_payout` but their connected account is not transfer-enabled (Stripe capability missing), Stripe rejects destination charges with errors like:

- “Your destination account needs to have at least one of the following capabilities enabled: transfers, ...”

In this case the backend will **fallback to `split_payout`** for that booking’s PaymentIntent creation so the customer can still pay.

Implication:

- Payment can succeed, but payout must be released later (admin) once vendor finishes onboarding.

---

## Payout Release (Admin)

There are two payout-related patterns in the codebase:

### A) Admin payout release for `split_payout` (recommended flow)

**Endpoint**

- `POST /api/v1/admin/bookings/{bookingId}/release-payout`

**What it does**

- Validates booking is `SPLIT_PAYOUT`.
- Validates the PaymentIntent has `succeeded`.
- Validates vendor has a connected Stripe account with `transfers` capability active.
- Creates a Stripe Transfer to the vendor for:

  $$\text{vendorAmount} = \max(0, \text{total} - \text{commission})$$

- Persists `transferId` and marks booking completed.

### B) Booking route payout endpoint

There is also a booking-scoped route:

- `POST /api/v1/bookings/{bookingId}/release-payment`

It is intended as an admin-only action in practice (see authorization in service layer). Prefer the admin endpoint for operational clarity.

---

## Refunds (Admin)

### Create refund

**Endpoint**

- `POST /api/v1/admin/bookings/{bookingId}/refund`

**Behavior**

- Creates a Stripe Refund against the booking’s PaymentIntent.
- If `amount` is omitted → full refund.
- If `amount` is provided → partial refund.

### List refunds

**Endpoint**

- `GET /api/v1/bookings/{bookingId}/refunds`

Returns refunds for the booking’s PaymentIntent (or empty list if none).

---

## Webhooks (Stripe → Backend)

**Endpoint**

- `POST /api/v1/webhooks/stripe`

**Important**

- Must receive **raw request body** for Stripe signature verification using the `stripe-signature` header.

**Current implementation status**

- The controller currently acknowledges receipt (`{ received: true }`) and does not yet process events.

**Recommended events to configure in Stripe (future-ready)**

- PaymentIntents:
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `payment_intent.canceled`
- Connect accounts:
  - `account.updated`
- Transfers/Payouts:
  - `transfer.created`
  - `payout.paid`

---

## Common Errors & What They Mean

### “No such customer: 'cus_...'”

Usually indicates:

- The stored `stripeCustomerId` was created under a different Stripe account (or test vs live mismatch).
- The customer was deleted in Stripe.

Backend behavior:

- Backend will recreate the Stripe Customer when it detects this condition, persist the new id, and continue.

### “Destination account needs capabilities enabled: transfers ...”

Indicates:

- Vendor’s connected account has not completed onboarding or Stripe has not enabled transfer capability.

Backend behavior:

- During PaymentIntent creation, backend falls back from `upfront_payout` to `split_payout`.
- During payout release, backend blocks and returns a validation error until transfers capability is active.

---

## Reference: Code Locations

- Booking payment orchestration:
  - `src/services/BookingPaymentService.ts`
- Vendor Stripe Connect management:
  - `src/services/VendorPaymentService.ts`
- Route docs (Swagger JSDoc):
  - `src/routes/booking.routes.ts`
  - `src/routes/vendor.routes.ts`
  - `src/routes/admin.routes.ts`
  - `src/routes/webhook.routes.ts`
