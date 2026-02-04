"use client";

import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { useCustomRequestStore } from "../../_store/customRequestStore";
import { useState, useEffect } from "react";

const formatGBP = (value: number) =>
  value ? `£${value.toLocaleString("en-GB")}` : "";

const parseGBP = (value: string) => {
  const numeric = value.replace(/[^0-9]/g, "");
  return numeric ? parseInt(numeric, 10) : 0;
};

export function BudgetPlanningStep() {
  const budgetPlanning = useCustomRequestStore((state) => state.budgetPlanning);
  const vendorNeeds = useCustomRequestStore((state) => state.vendorNeeds);
  const setBudgetPlanning = useCustomRequestStore(
    (state) => state.setBudgetPlanning,
  );
  const setIsBudgetPlanningValid = useCustomRequestStore(
    (state) => state.setIsBudgetPlanningValid,
  );

  const selectedCategories = vendorNeeds?.selectedCategories || [];

  const [budgetPerVendor, setBudgetPerVendor] = useState<
    Record<string, number>
  >(budgetPlanning?.budgetPerVendor || {});

  const [inputValues, setInputValues] = useState<Record<string, string>>(() => {
    const initial = budgetPlanning?.budgetPerVendor || {};
    return Object.fromEntries(
      Object.entries(initial).map(([category, amount]) => [
        category,
        amount ? formatGBP(amount) : "",
      ]),
    );
  });

  const totalBudget = Object.values(budgetPerVendor).reduce(
    (sum, val) => sum + (val || 0),
    0,
  );

  useEffect(() => {
    setIsBudgetPlanningValid(selectedCategories.length > 0 && totalBudget > 0);
  }, [selectedCategories, totalBudget, setIsBudgetPlanningValid]);

  const handleBudgetChange = (category: string, rawValue: string) => {
    const numericValue = parseGBP(rawValue);
    const newBudget = { ...budgetPerVendor, [category]: numericValue };

    setInputValues((prev) => ({ ...prev, [category]: rawValue }));
    setBudgetPerVendor(newBudget);

    const newTotal = Object.values(newBudget).reduce(
      (sum, val) => sum + (val || 0),
      0,
    );

    setBudgetPlanning({
      budgetPerVendor: newBudget,
      totalBudget: newTotal,
    });
  };

  const handleBudgetBlur = (category: string, rawValue: string) => {
    const numericValue = parseGBP(rawValue);
    setInputValues((prev) => ({
      ...prev,
      [category]: numericValue ? formatGBP(numericValue) : "",
    }));
  };

  return (
    <div className="space-y-4">
      {/* Section 1: Allocate Budget per Vendor */}
      <div className="rounded-lg overflow-hidden border border-primary/20">
        <div className="bg-primary/10 px-4 py-2">
          <span className="text-sm font-semibold text-primary">
            Allocate Budget per Vendor
          </span>
        </div>
        <div className="p-4">
          {selectedCategories.length > 0 ? (
            <div className="space-y-1">
              {/* Header */}
              <div className="grid grid-cols-2 gap-4 py-2 border-b">
                <span className="text-sm font-medium text-muted-foreground">
                  Vendor
                </span>
                <span className="text-sm font-medium text-muted-foreground">
                  Budget
                </span>
              </div>

              {/* Rows */}
              {selectedCategories.map((category) => (
                <div
                  key={category}
                  className="grid grid-cols-2 gap-4 py-3 items-center"
                >
                  <span className="text-sm">{category}</span>
                  <FloatingLabelInput
                    label="Amount (GBP)"
                    type="text"
                    inputMode="numeric"
                    value={inputValues[category] || ""}
                    onChange={(e) =>
                      handleBudgetChange(category, e.target.value)
                    }
                    onBlur={(e) => handleBudgetBlur(category, e.target.value)}
                  />
                </div>
              ))}

              {/* Total */}
              {totalBudget > 0 && (
                <div className="grid grid-cols-2 gap-4 py-3 border-t mt-2">
                  <span className="text-sm font-semibold">Total Budget</span>
                  <span className="text-lg font-bold text-primary">
                    £{totalBudget.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No vendor categories selected. Please go back to Step 2.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
