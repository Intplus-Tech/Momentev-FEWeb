# Current Booking Flow (Client ↔ Vendor Integration)

This report describes the **current front-end integration** for bookings, including the UI entry points, backend endpoints, and the data types/validation used throughout the flow.

## 1. High-level flow (end-to-end)

1. **Client initiates a booking**
   - From vendor search: `app\(home)\search\_vendor-components\BookingModal.tsx`
   - From a quote: `app\client\(dashboard)\requests\quotes\_components\convert-quote-modal.tsx`
2. **Booking is created** via `POST /api/v1/bookings` or `POST /api/v1/bookings/from-quote/{quoteId}`.
3. **Client views bookings** on `/client/bookings` and can open a booking detail page.
4. **Payment (if required)** happens from booking detail via Stripe.
5. **Vendor views bookings** on `/vendor/bookings` and can confirm/reject after payment.

## 2. UI entry points and client actions

### 2.1 Create booking (from vendor search)
**File:** `app\(home)\search\_vendor-components\BookingModal.tsx`

- Uses `useCreateBooking()` (React Query) → `createBooking(payload)` in `lib\actions\booking.ts`.
- Uses `createBookingSchema()` from `validation\booking.ts` for client-side validation.
- Payload assembled from:
  - `vendorId`
  - `eventDetails` (title, startDate, endDate, guestCount, description)
  - `budgetAllocations` (specialty + budgetedAmount)
  - `location.addressText`
  - `currency` (default: `GBP`)
- On success, redirects to `/client/bookings/{bookingId}`.

### 2.2 Create booking (from quote conversion)
**File:** `app\client\(dashboard)\requests\quotes\_components\convert-quote-modal.tsx`

- If quote status is `sent`, the client first **accepts the quote**:
  - `POST /api/v1/quotes/{quoteId}/respond` via `respondToQuote()` (`lib\actions\client-quotes.ts`)
- Then creates booking from quote:
  - `POST /api/v1/bookings/from-quote/{quoteId}`
  - Optional location override:
    ```json
    { "location": { "addressText": "..." } }
    ```
- Redirects to `/client/bookings` after creation.

## 3. Booking API integration (endpoints)

| Purpose | Client Function | Endpoint | Notes |
|---|---|---|---|
| Create booking | `createBooking` | `POST /api/v1/bookings` | Requires auth token |
| Create from quote | `createBookingFromQuote` | `POST /api/v1/bookings/from-quote/{quoteId}` | Optional location override |
| List client bookings | `fetchBookings` | `GET /api/v1/bookings?page=&limit=` | Used on `/client/bookings` |
| Get booking by id | `fetchBookingById` | `GET /api/v1/bookings/{id}` | Client + vendor detail pages |
| Cancel booking | `cancelBooking` | `POST /api/v1/bookings/{id}/cancel` | Client cancels from detail page |
| List vendor bookings | `fetchVendorBookings` | `GET /api/v1/bookings/vendor/me?page=&limit=` | Used on `/vendor/bookings` |
| Vendor decision | `decideVendorBooking` | `POST /api/v1/bookings/{id}/vendor/decision` | `decision`: `confirmed` or `rejected` |

## 4. Data types and validation

### 4.1 Booking payload and response types
**File:** `types\booking.ts`

**CreateBookingPayload**
```ts
{
  vendorId: string;
  eventDetails: {
    title: string;
    startDate: string;
    endDate: string;
    guestCount: number;
    description: string;
  };
  budgetAllocations: Array<{
    vendorSpecialtyId: string | PopulatedVendorSpecialty;
    budgetedAmount: number;
  }>;
  location: { addressText: string };
  currency: string;
}
```

**BookingResponse**
```ts
{
  _id: string;
  customerId: string | PopulatedCustomer;
  vendorId: string | PopulatedVendor;
  eventDetails: BookingEventDetails;
  budgetAllocations: BookingBudgetAllocation[];
  location: BookingLocation;
  currency: string;
  amounts: { subtotal: number; fees: number; commission: number; total: number; };
  paymentModel: string;
  status: BookingStatus;
  payment?: { provider: string; status: string; paymentIntentId?: string; };
  createdAt: string;
  updatedAt: string;
}
```

**BookingStatus**
`pending | pending_payment | paid | confirmed | cancelled | completed | rejected`

### 4.2 Client-side validation
**File:** `validation\booking.ts`

Key rules:
- `eventDetails.startDate` must be a valid future date and respect vendor lead time.
- `eventDetails.endDate` must be after `startDate`.
- `guestCount` must be a positive integer (max 10,000).
- `budgetAllocations` must have at least one item, each with positive `budgetedAmount`.
- `location.addressText` and `currency` are required.

## 5. Booking detail experiences

### 5.1 Client booking detail
**File:** `app\client\(dashboard)\bookings\[id]\page.tsx`

- Fetches booking by id and displays:
  - Event details, location, budget allocations.
  - Vendor public profile (`getVendorPublicProfile`).
- Actions (component `BookingDetailActions`):
  - **Cancel booking** when status is `pending_payment`.
  - **Pay now** when status is `pending_payment`.
  - **Dispute** when status is `paid | confirmed | completed`.
  - **Message vendor** via chat (creates or opens conversation).

### 5.2 Vendor booking detail
**File:** `app\vendor\(dashboard)\bookings\[id]\page.tsx`

- Fetches booking by id and displays:
  - Event details + client info.
  - Service allocations + totals.
  - Payment model + payment status (if present).

## 6. Payment flow (booking confirmation)

**UI:** `app\client\(dashboard)\bookings\_components\PaymentModal.tsx`

### 6.1 Backend endpoints

| Purpose | Client Function | Endpoint |
|---|---|---|
| Create payment intent | `createPaymentIntent` | `POST /api/v1/bookings/{bookingId}/payment-intent` |
| Confirm payment | `confirmBookingPayment` | `POST /api/v1/bookings/{bookingId}/confirm-payment` |
| Get saved methods | `getCustomerPaymentMethods` | `GET /api/v1/customers/{customerId}/payment-methods` |

### 6.2 Stripe integration flow (client)
1. Fetch saved payment methods + create payment intent.
2. If paying with a **new card**:
   - `stripe.confirmPayment(...)` → then `confirmBookingPayment(...)`.
3. If paying with a **saved card**:
   - `stripe.confirmCardPayment(clientSecret, { payment_method: selectedMethod })`
   - then `confirmBookingPayment(...)`.
4. On success, modal shows confirmation and refreshes booking data.

## 7. Vendor decision workflow

**File:** `app\vendor\(dashboard)\bookings\_components\confirmed-bookings-table.tsx`

- Vendor actions are shown only when `booking.status === "paid"`.
- Vendor decision:
  - **Confirm booking** → `POST /api/v1/bookings/{id}/vendor/decision` with `{ decision: "confirmed" }`
  - **Reject booking** → same endpoint with `{ decision: "rejected" }`

## 8. Bookings list surfaces

### 8.1 Client bookings list
**File:** `app\client\(dashboard)\bookings\page.tsx`

- Fetches `GET /api/v1/bookings?page=1&limit=50`.
- Supports status filter via query param.
- Displays upcoming vs past (past is `completed | cancelled | rejected` or endDate in past).

### 8.2 Vendor bookings list
**File:** `app\vendor\(dashboard)\bookings\page.tsx`

- Fetches `GET /api/v1/bookings/vendor/me`.
- Displays stats, today’s schedule, and full table.

## 9. Auth and routing constraints

- All booking APIs require **Bearer auth** (access token from `getAccessToken()`).
- Protected routes under `/client/*` and `/vendor/*` require auth; enforced in `proxy.ts`.

