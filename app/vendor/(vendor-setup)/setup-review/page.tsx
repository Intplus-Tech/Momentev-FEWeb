"use client";

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";
import { StepGuard } from "../_components/StepGuard";

export default function SetupReviewPage() {
  const handleSubmit = () => {
    // Final submission - could redirect to dashboard or show success message
    console.log("🎉 Final submission complete!");
    // TODO: Navigate to vendor dashboard
    window.location.href = "/vendor/dashboard";
  };

  return (
    <StepGuard requiredStep={5}>
      <div className="min-h-screen bg-background flex p-4">
        <div className="max-w-2xl w-full space-y-8">
          <div className="bg-card  space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">
                Your setup is complete! Here's what you've configured:
              </h2>

              <div className="space-y-3">
                <Link
                  href="/vendor/business-setup"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-primary hover:underline">
                    Business Information Complete
                  </span>
                </Link>

                <Link
                  href="/vendor/service-setup"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-primary hover:underline">
                    Services Configured
                  </span>
                </Link>

                <Link
                  href="/vendor/payment-setup"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-primary hover:underline">
                    Payment Method Connected
                  </span>
                </Link>

                <Link
                  href="/vendor/profile-setup"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-primary hover:underline">
                    Profile Media Uploaded
                  </span>
                </Link>
              </div>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold mb-3">
                Next Steps After Submission:
              </h2>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li>1. Our team reviews your application (24-48 hours)</li>
                <li>2. You'll receive an email when approved</li>
                <li>3. Start receiving quote requests immediately!</li>
              </ol>
            </div>

            <Button onClick={handleSubmit} className="w-full" size="lg">
              Submit
            </Button>
          </div>
        </div>
      </div>
    </StepGuard>
  );
}
