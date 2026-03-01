**Issue Report for Backend Team: Missing `budgetAllocations` in Booking from Quote**

Hi team,

When a client accepts a quote and a new booking is generated via the `POST /api/v1/bookings/from-quote/{quoteId}` endpoint, the returned booking document is missing the `budgetAllocations` array.

Currently, it appears the backend is creating the booking but not mapping over the line-items or budget info from the accepted quote into the new booking document. This causes `budgetAllocations` to be `undefined` when the frontend receives the payload.

We've temporarily added a fallback (`allocations = booking.budgetAllocations || []`) on the frontend to prevent UI crashes on the Bookings page when mapping or calculating lengths.

Could you please update the `from-quote` endpoint to ensure the generated booking inherits and includes the proper `budgetAllocations` array from the quote data?

Thanks!
