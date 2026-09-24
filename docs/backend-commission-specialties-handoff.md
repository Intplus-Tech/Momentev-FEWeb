# Backend Change: Frontend Handoff

**Date:** 2026-09-23  
**Backend:** Momentev, `dev` branch

## Commissions Now Come From Specialties

The platform commission is no longer one rate per vendor. Each service specialty has its own commission, and a booking is charged at the rate of the specialty that was booked. The web and mobile apps need the following changes.

## At a Glance

| Change | Priority |
| --- | --- |
| Accept commission agreement request | Required |
| Vendor commission display | Required |
| Custom-quote bookings need a specialty | Required |
| Client-side commission maths | Check |
| New error messages | Check |
| Booking responses include the specialty | No action |

## Accepting the Commission Agreement

**Priority:** Required  
**Endpoint:** `POST /api/v1/vendors/{vendorId}/commission-agreement/accept`

Vendors no longer send their own rate. The server works out the vendor's commissions from the specialties they offer, so the request body is now just an optional agreement version.

### Before

```json
{
  "version": "v1",
  "commissionType": "percentage",
  "commissionAmount": 10,
  "currency": "GBP"
}
```

### After

```json
{
  "version": "v1"
}
```

Frontend changes:

- Remove form fields where the vendor enters or confirms a rate.
- Show the list from `commissionAgreement.commissions` as the terms the vendor is agreeing to. This list is already available on the vendor before acceptance.

## Vendor Commission Display

**Priority:** Required

Vendor responses no longer have `commissionType`, `commissionAmount`, or `currency` directly on `commissionAgreement`. Instead, `commissionAgreement.commissions` contains one entry for each specialty the vendor offers.

### Vendor Response: `commissionAgreement`

```json
{
  "commissionAgreement": {
    "accepted": true,
    "acceptedAt": "2026-09-23T10:00:00.000Z",
    "version": "v1",
    "commissions": [
      {
        "serviceSpecialty": "64f0c2f7a2b6c1a9b3d2e111",
        "serviceSpecialtyName": "wedding photography",
        "commission": "64f0c2f7a2b6c1a9b3d2e222",
        "commissionType": "percentage",
        "commissionAmount": 5,
        "currency": "GBP"
      },
      {
        "serviceSpecialty": "64f0c2f7a2b6c1a9b3d2e333",
        "serviceSpecialtyName": "dj services",
        "commission": "64f0c2f7a2b6c1a9b3d2e444",
        "commissionType": "flat_rate",
        "commissionAmount": 25,
        "currency": "GBP"
      }
    ]
  }
}
```

Frontend changes:

- Any screen that shows a single commission, such as the onboarding payment step, vendor settings, or admin vendor detail, should show this list instead. Examples:
  - `Wedding photography: 5%`
  - `DJ services: £25 per booking`
- `commissionAmount` is a percentage when `commissionType` is `percentage`.
- For `flat_rate`, `commissionAmount` is a fixed amount in normal currency units, such as pounds, not pence.
- The list updates when the vendor adds or removes specialties, or when an admin changes a rate. Re-fetch the vendor after specialty changes.
- Vendors created before this change may have `commissions: []` until a backfill runs or they edit a specialty. Show an empty state, not an error.

## Custom-Quote Bookings Need a Specialty

**Priority:** Required  
**Endpoint:** `POST /api/v1/bookings/unified`

`vendorSpecialtyId` is now required for every `pricingType`, including `custom_quotes`. It must be one of that vendor's specialties because its commission is the one charged.

### Custom-Quote Request Body

```json
{
  "vendorId": "64f0c2f7a2b6c1a9b3d2e555",
  "serviceCategoryId": "64f0c2f7a2b6c1a9b3d2e666",
  "pricingType": "custom_quotes",
  "budget": 1500,
  "vendorSpecialtyId": "64f0c2f7a2b6c1a9b3d2e777",
  "eventDetails": { "...": "unchanged" },
  "location": { "addressText": "123 Grand Hall, London" }
}
```

Frontend changes:

- Add a specialty picker to the custom-quote flow if it does not have one yet.
- Without `vendorSpecialtyId`, validation fails with:

  `vendorSpecialtyId is required for custom_quotes pricing type`

- A specialty that is not offered by the vendor returns:

  `Invalid specialty for this vendor`

## Client-Side Commission Maths

**Priority:** Check

Commission is now calculated per booked specialty, so it can differ from the vendor's old single rate.

If the app calculates commission or vendor payout itself, such as in payout previews or invoice summaries, remove that calculation and use `amounts.commission` from the booking response instead. It is set when the vendor sends the invoice and again at checkout.

## New Error Messages

**Priority:** Check

These errors can be returned as validation errors from:

- `POST /api/v1/bookings/{bookingId}/unified-send-invoice`
- `POST /api/v1/bookings/{bookingId}/payment-intent`

| Message | When it happens |
| --- | --- |
| `No commission is configured for specialty "<name>"` | An admin has not linked a commission to that specialty. Tell the user to contact support. |
| `Booking has no selected specialty; commission cannot be determined` | An hourly or custom-quote booking was created before this change and has no selected specialty. |
| `One or more booked specialties could not be found for this vendor` | The vendor deleted a specialty that was booked. |

`Vendor must accept commission agreement before taking payments` is unchanged.

## Booking Responses Include the Specialty

**Priority:** No action

Unified bookings of every pricing type now include:

```json
{
  "budgetAllocations": [
    {
      "vendorSpecialtyId": "...",
      "budgetedAmount": 0
    }
  ]
}
```

Nothing needs to change, but the app can use `budgetAllocations` to show which specialty was booked.
