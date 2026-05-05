const STORAGE_KEY = "vendor_onboarding_stage_override";
const OVERRIDE_TTL_MS = 2 * 60 * 1000;

type OnboardingStageOverride = {
  stage: number;
  setAt: number;
};

export function setOnboardingStageOverride(stage: number) {
  if (typeof window === "undefined") return;

  const payload: OnboardingStageOverride = {
    stage,
    setAt: Date.now(),
  };

  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function getOnboardingStageOverride(): number | null {
  if (typeof window === "undefined") return null;

  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as OnboardingStageOverride;
    if (!parsed || typeof parsed.stage !== "number" || typeof parsed.setAt !== "number") {
      window.sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }

    if (Date.now() - parsed.setAt > OVERRIDE_TTL_MS) {
      window.sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return parsed.stage;
  } catch {
    window.sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function clearOnboardingStageOverride() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(STORAGE_KEY);
}
