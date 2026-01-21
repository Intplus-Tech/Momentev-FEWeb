"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { StepSection } from "./StepSection";
import { ProgressBar } from "./ProgressBar";
import { ArrowLeft, Check } from "lucide-react";
import { useVendorSetupStore } from "../_store/vendorSetupStore";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FloatingLabelSelect } from "@/components/ui/floating-label-select";
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
import { Info } from "lucide-react";

export function PaymentConfigurationForm() {
  const router = useRouter();

  // Zustand selective subscriptions
  const expandedSection = useVendorSetupStore((state) => state.expandedSection);
  const completedSections = useVendorSetupStore(
    (state) => state.completedSections,
  );
  const isSubmitting = useVendorSetupStore((state) => state.isSubmitting);

  // Actions
  const toggleSection = useVendorSetupStore((state) => state.toggleSection);
  const setExpandedSection = useVendorSetupStore(
    (state) => state.setExpandedSection,
  );
  const markSectionComplete = useVendorSetupStore(
    (state) => state.markSectionComplete,
  );
  const setIsSubmitting = useVendorSetupStore((state) => state.setIsSubmitting);
  const setErrors = useVendorSetupStore((state) => state.setErrors);

  const [paymentModel, setPaymentModel] = useState<string>("upfront");
  const [depositPercentage, setDepositPercentage] = useState<string>("50");
  const [stripeConnected, setStripeConnected] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [commissionAgreed, setCommissionAgreed] = useState(false);
  const [paymentsProtected, setPaymentsProtected] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);

  // Auto-expand Section 1 on mount (always reset to section 1 for this step)
  useEffect(() => {
    setExpandedSection(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty - we want this to run only once on mount

  const handlePaymentModelSelect = (value: string) => {
    setPaymentModel(value);
  };

  const handleSavePaymentModel = () => {
    markSectionComplete(3, 1); // Step 3, Section 1
    setExpandedSection(2);
  };

  const handleStripeConnect = async () => {
    setIsConnecting(true);

    // Mock Stripe connection - simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setStripeConnected(true);
    setIsConnecting(false);
    setShowSuccessModal(true);

    // Auto-close modal after 3 seconds
    setTimeout(() => {
      setShowSuccessModal(false);
      markSectionComplete(3, 2); // Step 3, Section 2
      setExpandedSection(3);
    }, 3000);
  };

  // Save as draft
  const saveAsDraft = () => {
    toast.success("Draft saved successfully");
    console.log("✅ Draft auto-saved to localStorage");
  };

  // Handle final save and continue to next step
  const handleSaveAndContinue = async () => {
    if (expandedSection === null) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      if (expandedSection === 3) {
        if (!canProceed()) {
          toast.error("Please agree to all terms");
          setIsSubmitting(false);
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 500));
        console.log("🎉 Step 3 Complete - Navigating to Step 4");
        markSectionComplete(3, 3); // Step 3, Section 3
        router.push("/vendor/profile-setup");
      }
    } catch (error) {
      console.error("❌ Failed to save:", error);
      setErrors({ general: "Failed to save. Please try again." });
      toast.error("Failed to save. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    if (expandedSection === 1) return !!paymentModel;
    if (expandedSection === 2) return stripeConnected;
    if (expandedSection === 3)
      return commissionAgreed && paymentsProtected && termsAgreed;
    return false;
  };

  const getButtonText = () => {
    if (isSubmitting) return "Saving...";
    if (expandedSection === 3) return "Save & Continue to Step 4";
    return "Save & Continue";
  };

  const isSection2Locked = !completedSections.has("step3-section1");
  const isSection3Locked = !completedSections.has("step3-section2");

  return (
    <>
      <div className="space-y-6 flex flex-col min-h-[70vh]">
        <div className="">
          {/* Step Title */}
          <div>
            <h2 className="text-lg sm:text-xl font-semibold">Payment Setup</h2>
            <h2 className="text-sm sm:text-base font-medium text-muted-foreground">
              Get paid securely and choose your payment terms
            </h2>
          </div>

          {/* Sections */}
          <div className="space-y-4 mt-6">
            {/* Section 1: Payment Model Selection */}
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
                      Choose Your Payment Model
                    </h3>
                  </div>

                  <TooltipProvider>
                    <RadioGroup
                      value={paymentModel}
                      onValueChange={handlePaymentModelSelect}
                    >
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
                      <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                        <RadioGroupItem value="split" id="split" />
                        <Label
                          htmlFor="split"
                          className="flex-1 cursor-pointer"
                        >
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
                                  <li>
                                    You receive deposit advance immediately
                                  </li>
                                  <li>
                                    Balance held in escrow until after event
                                  </li>
                                  <li>
                                    Better cash flow for growing businesses
                                  </li>
                                </ul>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </TooltipProvider>

                  {/* Deposit Percentage Dropdown - Only show for Split Payout */}
                  {paymentModel === "split" && (
                    <div className="mt-4 pl-8">
                      <FloatingLabelSelect
                        label="Deposit Percentage*"
                        options={[
                          { value: "20", label: "20%" },
                          { value: "30", label: "30%" },
                          { value: "40", label: "40%" },
                          { value: "50", label: "50%" },
                          { value: "60", label: "60%" },
                          { value: "70", label: "70%" },
                          { value: "80", label: "80%" },
                          { value: "90", label: "90%" },
                        ]}
                        value={depositPercentage}
                        onValueChange={setDepositPercentage}
                      />
                    </div>
                  )}

                  <Button
                    onClick={handleSavePaymentModel}
                    disabled={!paymentModel}
                    className="w-full sm:w-auto mt-4"
                  >
                    Save & Continue
                  </Button>
                </div>
              )}
            </div>

            {/* Section 2: Stripe Connect Integration */}
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
                <div className="px-6 pb-6 space-y-4">
                  <div className="bg-primary/5 px-4 py-3 -mx-6 mb-4">
                    <h3 className="text-sm font-medium">
                      Connect Your Bank Account
                    </h3>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    We use Stripe for secure, compliant payments
                  </p>

                  <Button
                    onClick={handleStripeConnect}
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

                  <div className="mt-6">
                    <p className="text-sm font-medium mb-3">Once connected:</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>Bank account verified</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>Payouts enabled</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>Secure payment processing</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mt-4">
                    Your bank details are never stored on our servers
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Payouts arrive in 1-2 business days
                  </p>
                </div>
              )}
            </div>

            {/* Section 3: Commission Agreement */}
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
                    <h3 className="text-sm font-medium">Momentev Commission</h3>
                  </div>

                  <p className="text-sm">
                    Our platform fee is 10% of your booking value
                  </p>

                  <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                    <p className="text-sm font-medium">
                      Example: £1,000 booking
                    </p>
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
                        onCheckedChange={(checked) =>
                          setCommissionAgreed(checked as boolean)
                        }
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
                        onCheckedChange={(checked) =>
                          setPaymentsProtected(checked as boolean)
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
                        onCheckedChange={(checked) =>
                          setTermsAgreed(checked as boolean)
                        }
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
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-10 mt-auto md:justify-between">
          <ProgressBar currentStep={3} />

          <div className="flex flex-col gap-3 sm:flex-row sm:gap-3">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="gap-2 w-full sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <Button
              variant="outline"
              onClick={saveAsDraft}
              className="w-full sm:w-auto"
            >
              Save As Draft
            </Button>
            <Button
              onClick={handleSaveAndContinue}
              disabled={isSubmitting || !canProceed()}
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
    </>
  );
}
