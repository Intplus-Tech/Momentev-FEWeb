# Backend Booking Status & Filtering Issues

This document outlines current discrepancies and missing features regarding the booking lifecycle and filtering on the backend. It serves as a formal request to the backend team for updates that will improve the frontend user experience and fix pagination bugs.

## 1. Discrepancy: `pending_payment` vs `awaiting_payment`
**The Issue:** 
When converting a custom quote to a booking (`POST /api/v1/bookings/from-quote/{quoteId}`), the backend initializes the booking with the status `pending_payment`. However, in the Unified Booking Flow (`POST /api/v1/bookings/{bookingId}/unified-send-invoice`), the backend transitions the status to `awaiting_payment`.
**Impact:** 
This caused a deadlock on the frontend where the "Pay Now" button was only programmed to look for `awaiting_payment`, causing quote-generated bookings to hide the payment button.
**Proposed Fix:** 
Standardize on a single payment-pending status across all flows (e.g., exclusively use `awaiting_payment`), or ensure the documentation explicitly states both are used in active flows.

## 2. Redundancy: `paid` vs `booked` vs `confirmed`
**The Issue:** 
- In the standard flow, after payment, the status becomes `paid` and awaits explicit vendor confirmation to become `confirmed`.
- In the Unified flow, after payment, the status skips `paid` and becomes `booked` (because the vendor pre-approved the invoice).
**Impact:** 
Exposing 9 raw database states to the client is confusing. The frontend has temporarily grouped `booked` and `confirmed` under a single UI "Phase" called **"Confirmed"**.
**Proposed Fix:** 
Consider unifying `booked` and `confirmed` on the backend if they serve the identical business purpose (finalized event). If they must remain separate for admin reconciliation, see point 3 below.

## 3. Missing Feature: Multi-Status / Phase Filtering for Pagination
**The Issue:** 
Currently, endpoints like `GET /api/v1/bookings` and `GET /api/v1/bookings/vendor/me` only accept a single `status` string (e.g., `?status=paid`). Because the frontend now groups multiple statuses into a single UI phase (e.g., "Confirmed" = `booked` OR `confirmed`), the frontend cannot request all "Confirmed" bookings from the server.
**Impact:** 
The frontend currently has to use a temporary, highly inefficient patch: it requests the maximum limit (`100`) of bookings, ignores server pagination, and filters the array locally in the browser. This will break if a user has more than 100 bookings.
**Proposed Fix:** 
Update the `GET` bookings endpoints to support one of the following:
1. **Array Filtering:** Allow `?status=booked,confirmed` or `?status[]=booked&status[]=confirmed`.
2. **Phase Filtering:** Introduce a `phase` query parameter where `?phase=confirmed` automatically maps to `status IN ('booked', 'confirmed')` in the database query.
