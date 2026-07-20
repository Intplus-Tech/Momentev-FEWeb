"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Info, Check, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { StepSection } from "./StepSection";
import { ProgressBar } from "./ProgressBar";
import { useVendorSetupStore } from "../_store/vendorSetupStore";
import { SubmissionOverlay } from "./SubmissionOverlay";
import { StripeCreateAccountModal } from "@/components/shared/stripe-create-account-modal";
import {
  setPaymentModel,
  createStripeAccount,
  acceptCommission,
  type PaymentActionResponse,
} from "@/lib/actions/payment";
import { updateVendorOnboardingStage } from "@/lib/actions/vendor-profile";
import { FormFieldLabel } from "./FormFieldLabel";
import { setOnboardingStageOverride } from "../_utils/onboardingStageOverride";
import { useStripeAccount } from "@/hooks/api/use-stripe-account";
import { useStripeCountries } from "@/hooks/api/use-stripe-countries";

export function PaymentConfigurationForm() {
  const router = useRouter();

  // Global State (Zustand)
  const expandedSection = useVendorSetupStore((state) => state.expandedSection);
  const completedSections = useVendorSetupStore(
    (state) => state.completedSections,
  );
  const isSubmitting = useVendorSetupStore((state) => state.isSubmitting);

  const toggleSection = useVendorSetupStore((state) => state.toggleSection);
  const setExpandedSection = useVendorSetupStore(
    (state) => state.setExpandedSection,
  );
  const markSectionComplete = useVendorSetupStore(
    (state) => state.markSectionComplete,
  );
  const setIsSubmitting = useVendorSetupStore((state) => state.setIsSubmitting);
  const setErrors = useVendorSetupStore((state) => state.setErrors);

  // Local State
  const [paymentModel, setLocalPaymentModel] = useState<string>("split");
  const [stripeConnected, setStripeConnected] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const [commissionAgreed, setCommissionAgreed] = useState(false);
  const [paymentsProtected, setPaymentsProtected] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [stripeActionError, setStripeActionError] = useState<string | null>(null);
  const {
    data: stripeAccount,
    isLoading: isStripeAccountLoading,
    isError: isStripeAccountError,
    error: stripeAccountError,
    refetch: refetchStripeAccount,
    isFetching: isStripeAccountRefreshing,
  } = useStripeAccount();

  const {
    data: stripeCountries,
    isLoading: isCountriesLoading,
    isError: isCountriesError,
  } = useStripeCountries();

  // Initial Setup: Always start at Section 1 for this step
  useEffect(() => {
    setExpandedSection(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Step 1: Payment Model ---
  const handleSavePaymentModel = async () => {
    if (!paymentModel) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const model =
        paymentModel === "upfront" ? "upfront_payout" : "split_payout";

      // Explicitly typed response
      const result: PaymentActionResponse = await setPaymentModel(model);

      if (!result.success) {
        throw new Error(result.error || "Failed to set payment model");
      }

      toast.success("Payment model saved");

      markSectionComplete(3, 1); // Step 3, Section 1
      setExpandedSection(2); // Move to next section
    } catch (error) {
      console.error(error);
      const msg =
        error instanceof Error ? error.message : "An unexpected error occurred";
      setErrors({ general: msg });
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Step 2: Stripe Connect ---
  const handleConfirmStripeConnect = async (country: string) => {
    setIsConnecting(true);
    setStripeActionError(null);

    try {
      const result: PaymentActionResponse<{ stripeAccountId: string }> =
        await createStripeAccount(country);

      if (!result.success) {
        throw new Error(result.error || "Failed to connect Stripe");
      }

      setStripeConnected(true);
      setShowSuccessModal(true);

      // Auto-advance after success modal
      setTimeout(() => {
        setShowSuccessModal(false);
        markSectionComplete(3, 2); // Step 3, Section 2
        setExpandedSection(3); // Move to next section
      }, 3000);
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "Failed to connect Stripe";
      setStripeActionError(message);
      toast.error(message);
    } finally {
      setIsConnecting(false);
      setShowCreateDialog(false);
    }
  };

  const handleContinueToCommission = () => {
    setStripeActionError(null);
    markSectionComplete(3, 2); // Step 3, Section 2
    setExpandedSection(3); // Move to commission agreement
  };

  const handleSkipStripeForNow = () => {
    setStripeActionError(null);
    markSectionComplete(3, 2); // Step 3, Section 2
    setExpandedSection(3); // Move to commission agreement
    toast.info("You can set up Stripe later from the dashboard.");
  };

  const handleRetryStripeStatus = async () => {
    setStripeActionError(null);

    try {
      const result = await refetchStripeAccount();

      if (result.data?.stripeAccountId) {
        handleContinueToCommission();
        return;
      }

      if (result.isError) {
        throw new Error(
          (result.error as Error)?.message || "Unable to refresh Stripe status",
        );
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to refresh Stripe status";
      setStripeActionError(message);
      toast.error(message);
    }
  };

  // --- Step 3: Commission & Final Save ---
  const canProceedStep3 = commissionAgreed && paymentsProtected && termsAgreed;

  const handleSaveAndContinue = async () => {
    // Only allow save if we are at the final section and it's valid, OR if we are just navigating through
    // functionality already completed. But usually "Save & Continue" implies finishing the current view.

    // Logic: If I am on Step 3 (Commission), I must finish it.
    if (expandedSection === 3) {
      if (!canProceedStep3) {
        toast.error("Please agree to all terms");
        return;
      }

      setIsSubmitting(true);
      try {
        const result: PaymentActionResponse = await acceptCommission();

        if (!result.success) {
          throw new Error(
            result.error || "Failed to accept commission agreement",
          );
        }

        // Update onboarding stage to 3 (Profile Setup)
        const stageUpdateResult = await updateVendorOnboardingStage(3);

        if (!stageUpdateResult.success) {
          console.warn('⚠️ [Step 3 Submission] Warning: Failed to update onboarding stage:', stageUpdateResult.error);
          // Continue anyway - stage update is secondary to payment setup submission
        }

        markSectionComplete(3, 3); // Step 3, Section 3
        setOnboardingStageOverride(3);
        router.push("/vendor/profile-setup"); // Navigate to next page/step
      } catch (error) {
        console.error("❌ Failed to save:", error);
        toast.error("Failed to save. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // If user clicks generic "Save & Continue" while in earlier sections,
      // we might want to trigger the specific section handler.
      if (expandedSection === 1) handleSavePaymentModel();
      // Section 2 doesn't have a generic save button, it has "Connect".
    }
  };

  // Helper to check if a section is locked (requires previous section completion)
  const isSection2Locked = !completedSections.has("step3-section1");
  const isSection3Locked = !completedSections.has("step3-section2");

  const getButtonText = () => {
    if (isSubmitting) return "Saving...";
    if (expandedSection === 3) return "Save & Continue to Step 4";
    return "Save & Continue";
  };

  // Validation for the main button state
  const isMainButtonDisabled = () => {
    if (isSubmitting) return true;
    if (expandedSection === 1) return !paymentModel;
    if (expandedSection === 2) return !stripeConnected && !stripeAccount?.stripeAccountId; // Force connect before continue when Stripe is available
    if (expandedSection === 3) return !canProceedStep3;
    return false;
  };

  const stripeStatusIssue =
    isStripeAccountError || Boolean(stripeActionError);
  const stripeStatusMessage =
    stripeActionError ||
    (isStripeAccountError
      ? (stripeAccountError as Error)?.message ||
      "We could not check Stripe right now. You can retry or continue and finish it later in the dashboard."
      : "");

  return (
    <>
      <SubmissionOverlay
        isVisible={isSubmitting}
        message="Submitting payment configuration..."
      />
      <div className="space-y-6 flex flex-col min-h-[70vh]">
        {/* Header */}
        <div>
          <h2 className="text-lg sm:text-xl font-semibold">Payment Setup</h2>
          <h2 className="text-sm sm:text-base font-medium text-muted-foreground">
            Get paid securely and choose your payment terms
          </h2>
        </div>

        {/* Sections Container */}
        <div className="space-y-4 mt-6">
          {/* --- Section 1: Payment Model --- */}
          <div className="border-2 rounded-lg">
            <StepSection
              number={1}
              title="Payment Model Selection"
              isCompleted={completedSections.has("step3-section1")}
              isExpanded={expandedSection === 1}
              onToggle={() => toggleSection(1)}
            />
            {expandedSection === 1 && (
              <div className="px-6 pb-6 space-y-4">
                <div className="bg-primary/5 px-4 py-3 -mx-6 mb-4">
                  <h3 className="text-sm font-medium">
                    <FormFieldLabel label="Choose Your Payment Model" isRequired />
                  </h3>
                </div>

                <TooltipProvider>
                  <RadioGroup
                    value={paymentModel}
                    onValueChange={setLocalPaymentModel}
                  >
                    {/* Option A */}
                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                      <RadioGroupItem value="upfront" id="upfront" />
                      <Label
                        htmlFor="upfront"
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            OPTION A: 100% Upfront Payout
                          </span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <ul className="text-sm space-y-1 list-disc pl-4">
                                <li>Client pays full amount upfront</li>
                                <li>
                                  Your payout held in escrow until after event
                                </li>
                                <li>Best for established businesses</li>
                              </ul>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </Label>
                    </div>

                    {/* Option B */}
                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                      <RadioGroupItem value="split" id="split" />
                      <Label htmlFor="split" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            OPTION B: Split Payout (Recommended)
                          </span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <ul className="text-sm space-y-1 list-disc pl-4">
                                <li>
                                  Client pays deposit upfront (you choose %)
                                </li>
                                <li>You receive deposit advance immediately</li>
                                <li>
                                  Balance held in escrow until after event
                                </li>
                                <li>Better cash flow for growing businesses</li>
                              </ul>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </TooltipProvider>

                <Button
                  onClick={handleSavePaymentModel}
                  disabled={!paymentModel || isSubmitting}
                  className="w-full sm:w-auto mt-4"
                >
                  Save & Continue
                </Button>
              </div>
            )}
          </div>

          {/* --- Section 2: Stripe Connect --- */}
          <div className="border-2 rounded-lg">
            <StepSection
              number={2}
              title="Stripe Connect Integration"
              isCompleted={completedSections.has("step3-section2")}
              isExpanded={expandedSection === 2}
              onToggle={() => !isSection2Locked && toggleSection(2)}
              isLocked={isSection2Locked}
            />
            {expandedSection === 2 && (
              <div className="px-6 pb-6">
                <div className="bg-primary/5 px-4 py-3 -mx-6 mb-4">
                  <h3 className="text-sm font-medium">
                    <FormFieldLabel label="Connect Your Bank Account" isRequired />
                  </h3>
                </div>

                <div className="space-y-5">
                  <p className="text-sm text-muted-foreground">
                    Stripe is optional during onboarding. You can connect it now or finish it later from the dashboard.
                  </p>

                  {isStripeAccountLoading ? (
                    <Button disabled className="w-full sm:w-auto">
                      Checking Stripe status...
                    </Button>
                  ) : stripeStatusIssue ? (
                    <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                      <p className="text-sm text-amber-900">{stripeStatusMessage}</p>
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleRetryStripeStatus}
                          disabled={isStripeAccountRefreshing}
                          className="w-full sm:w-auto"
                        >
                          {isStripeAccountRefreshing ? "Retrying..." : "Retry Stripe"}
                        </Button>
                        <Button
                          type="button"
                          onClick={handleSkipStripeForNow}
                          className="w-full sm:w-auto"
                        >
                          Skip for now
                        </Button>
                      </div>
                    </div>
                  ) : stripeAccount?.stripeAccountId ? (
                    <div className="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                      <p className="text-sm text-emerald-800">
                        Stripe account detected. You can continue to commission now and finish setup later in the dashboard.
                      </p>
                      <Button
                        type="button"
                        onClick={handleContinueToCommission}
                        className="w-full sm:w-auto"
                      >
                        Continue to commission
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Country selector for creating a Stripe account */}
                      {isCountriesLoading ? (
                        <div className="text-sm text-muted-foreground">Loading countries...</div>
                      ) : isCountriesError ? (
                        <div className="text-sm text-destructive">Unable to load supported countries</div>
                      )}

                      <div className="flex flex-col gap-3 sm:flex-row">
                        <Button
                          onClick={() => setShowCreateDialog(true)}
                          disabled={stripeConnected || isConnecting}
                          className="w-full sm:w-auto"
                        >
                          {isConnecting ? (
                            <>
                              <span className="animate-spin mr-2">⚡</span>
                              Connecting...
                            </>
                          ) : stripeConnected ? (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Connected
                            </>
                          ) : (
                            "Connect with Stripe"
                          )}
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleSkipStripeForNow}
                          className="w-full sm:w-auto"
                        >
                          Skip for now
                        </Button>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        Stripe is optional here. You can finish it later in the dashboard.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* --- Section 3: Commission --- */}
          <div className="border-2 rounded-lg">
            <StepSection
              number={3}
              title="Commission Agreement"
              isCompleted={completedSections.has("step3-section3")}
              isExpanded={expandedSection === 3}
              onToggle={() => !isSection3Locked && toggleSection(3)}
              isLocked={isSection3Locked}
            />
            {expandedSection === 3 && (
              <div className="px-6 pb-6 space-y-6">
                <div className="bg-primary/5 px-4 py-3 -mx-6 mb-4">
                  <h3 className="text-sm font-medium"><FormFieldLabel label="Momentev Commission" isRequired /></h3>
                </div>

                <p className="text-sm">
                  Our platform fee is 10% of your booking value
                </p>

                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <p className="text-sm font-medium">Example: £1,000 booking</p>
                  <ul className="text-sm space-y-1 list-none">
                    <li>• You receive: £900</li>
                    <li>• Momentev commission: £100</li>
                  </ul>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="commission"
                      checked={commissionAgreed}
                      onCheckedChange={(c) => setCommissionAgreed(c as boolean)}
                    />
                    <label
                      htmlFor="commission"
                      className="text-sm cursor-pointer leading-relaxed"
                    >
                      I agree to Momentev's 10% commission on all bookings
                    </label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="escrow"
                      checked={paymentsProtected}
                      onCheckedChange={(c) =>
                        setPaymentsProtected(c as boolean)
                      }
                    />
                    <label
                      htmlFor="escrow"
                      className="text-sm cursor-pointer leading-relaxed"
                    >
                      I understand payments are protected by escrow
                    </label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="terms"
                      checked={termsAgreed}
                      onCheckedChange={(c) => setTermsAgreed(c as boolean)}
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm cursor-pointer leading-relaxed"
                    >
                      I agree to the Terms of Service
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-10 mt-auto md:justify-between">
          <ProgressBar currentStep={3} />

          <div className="flex flex-col gap-3 sm:flex-row sm:gap-3">
            <Button
              onClick={handleSaveAndContinue}
              disabled={isMainButtonDisabled()}
              className="w-full sm:w-auto"
            >
              {getButtonText()}
            </Button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Congratulations!</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center py-6">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-10 w-10 text-white" />
                </div>
              </div>
              <div className="absolute -top-2 -right-2 text-2xl">🎉</div>
              <div className="absolute -bottom-2 -left-2 text-2xl">✨</div>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-6">
              Your Stripe account is added successfully!
              <br />
              <span className="text-xs">
                You will be automatically directed in 3 sec
              </span>
            </p>
          </div>
        </DialogContent>
      </Dialog>

        <StripeCreateAccountModal
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          countries={stripeCountries}
          isLoadingCountries={isCountriesLoading}
          isCreating={isConnecting}
          onConfirm={handleConfirmStripeConnect}
        />
    </>
  );
}
