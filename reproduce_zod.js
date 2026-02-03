const { z } = require("zod");

const AddressSchema = z
  .object({
    _id: z.string().optional(),
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
  })
  .optional();

const WorkdaySchema = z.object({
  dayOfWeek: z.string(),
  open: z.string(),
  close: z.string(),
});

const VendorDetailsSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  portfolioGallery: z.array(z.string()).optional().default([]),
  rate: z.number().optional().default(0),
  paymentAccountProvider: z.string().optional(),
  paymentModel: z.string().optional(),
  isActive: z.boolean().optional().default(true),
  onBoardingStage: z.number().optional().default(0),
  onBoarded: z.boolean().optional().default(false),
  socialMediaLinks: z
    .array(
      z.object({
        name: z.string(),
        link: z.string(),
      }),
    )
    .optional()
    .default([]),
  commissionAgreement: z
    .object({
      accepted: z.boolean().optional().default(false),
    })
    .optional()
    .default({ accepted: false }),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  __v: z.number().optional().default(0),
  businessProfile: z
    .object({
      _id: z.string(),
      businessName: z.string().optional(),
      yearInBusiness: z.string().optional(),
      businessRegType: z.string().optional(),
      businessDescription: z.string().optional(),
      workdays: z
        .array(
          z.object({
            dayOfWeek: z.string(),
            open: z.string(),
            close: z.string(),
          }),
        )
        .optional(),
      contactInfo: z
        .object({
          primaryContactName: z.string().optional(),
          emailAddress: z.string().optional(),
          phoneNumber: z.string().optional(),
          addressId: AddressSchema,
        })
        .optional(),
      serviceArea: z
        .object({
          areaNames: z
            .array(
              z.object({
                city: z.string(),
                state: z.string(),
                country: z.string(),
              }),
            )
            .optional(),
          travelDistance: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
  onboardedAt: z.string().optional(),
  reviewCount: z.number().optional().default(0),
  id: z.string().optional(),
  profilePhoto: z.string().nullable().optional(),
  coverPhoto: z.string().nullable().optional(),
});

const data = {
  _id: "697779df0181188b4835ef3d",
  userId: "697779de0181188b4835ef3b",
  portfolioGallery: [],
  rate: 4.5,
  paymentAccountProvider: "stripe",
  paymentModel: "upfront_payout",
  isActive: true,
  onBoardingStage: 2,
  onBoarded: true,
  socialMediaLinks: [
    {
      name: "instagram",
      link: "https://instagram.com/acme_vendor",
    },
  ],
  commissionAgreement: {
    accepted: false,
  },
  createdAt: "2026-01-26T14:27:43.678Z",
  updatedAt: "2026-02-01T05:57:17.851Z",
  __v: 0,
  businessProfile: {
    _id: "69777f240181188b4835f013",
    contactInfo: {
      primaryContactName: "don alabai",
      emailAddress: "mcmorgan6560@gmail.com",
      phoneNumber: "+2348037377580",
      addressId: {
        _id: "69777bc20181188b4835ef62",
        street: "Port-harcourt, Rivers state",
        city: "port-harcourt",
        state: "ny",
        postalCode: "500211",
        country: "NIGERIA",
      },
    },
    businessName: "Dengi  Incorperated",
    yearInBusiness: "6_to_12_years",
    businessRegType: "partnership",
    businessDescription: "This is my business description",
    workdays: [
      {
        dayOfWeek: "monday",
        open: "09:00",
        close: "17:00",
      },
      {
        dayOfWeek: "tuesday",
        open: "09:00",
        close: "17:00",
      },
      {
        dayOfWeek: "wednesday",
        open: "09:00",
        close: "17:00",
      },
      {
        dayOfWeek: "thursday",
        open: "09:00",
        close: "17:00",
      },
    ],
    serviceArea: {
      areaNames: [
        {
          city: "london",
          state: "greater london",
          country: "UNITED KINGDOM",
        },
        {
          city: "birmingham",
          state: "west midlands",
          country: "UNITED KINGDOM",
        },
      ],
      travelDistance: "50 miles",
    },
  },
  onboardedAt: "2026-01-16T12:00:00.000Z",
  reviewCount: 0,
  id: "697779df0181188b4835ef3d",
  profilePhoto: null,
  coverPhoto: null,
};

const parsed = VendorDetailsSchema.safeParse(data);

if (parsed.success) {
  console.log("Validation Successful");
  console.log(
    "Parsed contactInfo:",
    JSON.stringify(parsed.data.businessProfile?.contactInfo, null, 2),
  );
} else {
  console.log(
    "Validation Failed:",
    JSON.stringify(parsed.error.format(), null, 2),
  );
}
