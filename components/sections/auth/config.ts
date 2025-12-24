export type Audience = "client" | "vendor";

export type AuthScreenType =
  | "sign-up"
  | "log-in"
  | "email-verification"
  | "verification-successful"
  | "password-reset";

export type AudienceInfo = {
  label: string;
  badge: string;
  heroHeadline: string;
  heroCopy: string;
  heroImage: string;
  color: string;
  perks: string[];
  stats: { label: string; value: string }[];
};

export const audienceInfo: Record<Audience, AudienceInfo> = {
  client: {
    label: "Client",
    badge: "Client experience",
    heroHeadline: "Design unforgettable experiences",
    heroCopy:
      "Plan premium celebrations, onboard internal teams, and keep curated vendors accountable in a single client-ready workspace.",
    heroImage:
      "https://images.unsplash.com/photo-1520854220072-3da5fb6d82c0?auto=format&fit=crop&w=1200&q=80",
    color: "from-sky-500 via-indigo-500 to-blue-600",
    perks: ["Vision briefs", "Budget dashboards", "White-glove support"],
    stats: [
      { label: "Events fulfilled", value: "2,480+" },
      { label: "Avg. vendor replies", value: "<4 hrs" },
    ],
  },
  vendor: {
    label: "Vendor",
    badge: "Vendor network",
    heroHeadline: "Scale your creative studio",
    heroCopy:
      "Showcase services, collaborate on briefs, and get paid faster with automated contracts, invoices, and verifications.",
    heroImage:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80",
    color: "from-amber-400 via-orange-500 to-rose-500",
    perks: ["Instant leads", "Automated compliance", "Vaulted payouts"],
    stats: [
      { label: "Studios onboarded", value: "1,120" },
      { label: "Avg. project size", value: "$18k" },
    ],
  },
};

export const audienceContent: Record<Audience, { label: string; mainText: string; subText: string }> = {
  client: {
    label: audienceInfo.client.label,
    mainText: audienceInfo.client.heroHeadline,
    subText: audienceInfo.client.heroCopy,
  },
  vendor: {
    label: audienceInfo.vendor.label,
    mainText: audienceInfo.vendor.heroHeadline,
    subText: audienceInfo.vendor.heroCopy,
  },
};

type AuthField = {
  name: string;
  label: string;
  type: string;
  autoComplete?: string;
  placeholder?: string;
};

type AuthScreenConfig = {
  title: string;
  description: string;
  fields?: AuthField[];
  actionLabel: string;
  helperText?: string;
  layout?: "form" | "status";
  statusIcon?: "success";
  actionHref?: (audience: Audience) => string;
  footerLink: (audience: Audience) => {
    text: string;
    href: string;
    linkLabel: string;
  };
  secondaryLink?: {
    label: string;
    href: (audience: Audience) => string;
  };
  highlight?: string;
};

export const screenConfig: Record<AuthScreenType, AuthScreenConfig> = {
  "sign-up": {
    title: "Create your workspace",
    description:
      "Introduce your brand, invite collaborators, and unlock guided onboarding tailored to your role.",
    actionLabel: "Sign up",
    fields: [
      {
        name: "name",
        label: "Full name",
        type: "text",
        autoComplete: "name",
        placeholder: "Jonas Khanwald",
      },
      {
        name: "email",
        label: "Work email",
        type: "email",
        autoComplete: "email",
        placeholder: "you@studio.com",
      },
      {
        name: "password",
        label: "Password",
        type: "password",
        autoComplete: "new-password",
        placeholder: "Create a secure password",
      },
    ],
    footerLink: (audience) => ({
      text: "Already have an account?",
      linkLabel: "Log in",
      href: `/${audience}/log-in`,
    }),
  },
  "log-in": {
    title: "Welcome back",
    description:
      "Pick up where you left off with saved briefs and vendor threads.",
    actionLabel: "Log in",
    fields: [
      {
        name: "email",
        label: "Email",
        type: "email",
        autoComplete: "email",
        placeholder: "you@momentev.com",
      },
      {
        name: "password",
        label: "Password",
        type: "password",
        autoComplete: "current-password",
        placeholder: "Enter your password",
      },
    ],
    helperText: "Forgot your password? Reset it below.",
    footerLink: (audience) => ({
      text: "New to Momentev?",
      linkLabel: "Create an account",
      href: `/${audience}/sign-up`,
    }),
    secondaryLink: {
      label: "Reset password",
      href: (audience) => `/${audience}/password-reset`,
    },
  },
  "email-verification": {
    title: "Verify your email",
    description: "Enter the 6-digit code we just emailed to confirm ownership.",
    actionLabel: "Verify email",
    fields: [
      {
        name: "code",
        label: "Verification code",
        type: "text",
        autoComplete: "one-time-code",
        placeholder: "123456",
      },
    ],
    helperText:
      "Didn’t see the email yet? It may take up to a minute to arrive.",
    secondaryLink: {
      label: "Resend code",
      href: (audience) => `/${audience}/email-verification`,
    },
    footerLink: (audience) => ({
      text: "Already verified?",
      linkLabel: "Continue to login",
      href: `/${audience}/log-in`,
    }),
  },
  "verification-successful": {
    title: "You’re verified 🎉",
    description:
      "Your workspace is ready. You can now invite collaborators and connect services.",
    actionLabel: "Go to login",
    layout: "status",
    statusIcon: "success",
    actionHref: (audience) => `/${audience}/log-in`,
    footerLink: (audience) => ({
      text: "Need another workspace?",
      linkLabel: "Create a new account",
      href: `/${audience}/sign-up`,
    }),
  },
  "password-reset": {
    title: "Reset your password",
    description:
      "We’ll email a secure link so you can create a new password for your workspace.",
    actionLabel: "Send reset link",
    fields: [
      {
        name: "email",
        label: "Work email",
        type: "email",
        autoComplete: "email",
        placeholder: "you@company.com",
      },
    ],
    helperText:
      "You’ll receive a message within a few minutes. The link expires in 20 minutes.",
    footerLink: (audience) => ({
      text: "Remembered it?",
      linkLabel: "Back to login",
      href: `/${audience}/log-in`,
    }),
  },
};
