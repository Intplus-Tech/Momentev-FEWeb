# Frontend Booking Status Patch

This document records the temporary client-side filtering and pagination patch currently running in production. This patch was implemented to improve the user experience by grouping confusing backend statuses into simple UI "Phases", but it must be removed once the backend supports multi-status filtering.

## The UI Phases
To simplify the dashboard, we mapped 9 backend database statuses into 6 client-facing "Phases".
The mapping currently running in `app/client/(dashboard)/bookings/page.tsx` and `app/vendor/(dashboard)/bookings/_components/confirmed-bookings-table.tsx` is:

- **Awaiting Vendor:** `["pending", "reviewing"]`
- **Payment Required:** `["awaiting_payment", "pending_payment"]`
- **Processing:** `["paid"]`
- **Confirmed:** `["booked", "confirmed"]`
- **Completed:** `["completed"]`
- **Cancelled/Rejected:** `["cancelled", "rejected"]`

## The Temporary Patch (Tech Debt)
Because the backend API endpoints (`GET /api/v1/bookings`) do not currently support querying by multiple statuses at once, we cannot send `?status=booked,confirmed` to get a paginated list of all confirmed events.

To get around this without breaking pagination, the frontend is doing the following:
1. Fetching the API's maximum allowed limit of bookings upfront (`const API_LIMIT = 100;`).
2. Receiving the massive array of data and ignoring the backend's `total` value for pagination.
3. Running a `.filter()` on the entire array in the browser based on the selected Phase mapping.
4. Using `.slice()` to manually chunk the array into pages of 5 or 10 items to feed to the `Pagination` component.

*Warning: If a user has more than 100 bookings, bookings past 100 will never be loaded or filtered.*

## Reversion Instructions (When Backend is Ready)

Once the backend team implements array-based or phase-based query parameters (see `backend-booking-status-issues.md`), a frontend developer must revert this patch:

**Step 1: Revert Client Bookings Page (`app/client/(dashboard)/bookings/page.tsx`)**
- Remove `API_LIMIT = 100` and restore `PAGE_LIMIT = 10`.
- Change `fetchBookings(1, API_LIMIT)` back to `fetchBookings(currentPage, PAGE_LIMIT)`.
- Remove the local `.slice(startIndex, endIndex)` pagination hack.
- Remove the hardcoded `statusMap` block and rely on passing the selected filter phase directly to the backend.

**Step 2: Revert Vendor Bookings Page (`app/vendor/(dashboard)/bookings/page.tsx`)**
- Change `fetchVendorBookings(1, 100)` back to `fetchVendorBookings(1, 50)`.

**Step 3: Revert Vendor Table (`confirmed-bookings-table.tsx`)**
- Either pass the filtering logic up to the server side (like the client page), or keep it client-side but ensure the backend sends pre-filtered pages.

**Step 4: Keep the UI Filters**
- DO NOT revert the dropdown items in `bookings-filter.tsx` or `confirmed-bookings-table.tsx`. The users should continue to see the grouped "Phases" (Awaiting Vendor, Confirmed, etc.), but the data fetching should be handled by the backend.
