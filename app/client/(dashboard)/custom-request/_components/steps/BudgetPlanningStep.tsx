"use client";

import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { useCustomRequestStore } from "../../_store/customRequestStore";
import { useState, useEffect, useMemo, useCallback } from "react";

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

  const selectedSpecialties = vendorNeeds?.selectedSpecialties || [];

  const [budgetPerSpecialty, setBudgetPerSpecialty] = useState<
    Record<string, number>
  >(budgetPlanning?.budgetPerSpecialty || {});

  const [inputValues, setInputValues] = useState<Record<string, string>>(() => {
    const initial = budgetPlanning?.budgetPerSpecialty || {};
    return Object.fromEntries(
      Object.entries(initial).map(([id, amount]) => [
        id,
        amount ? formatGBP(amount) : "",
      ]),
    );
  });

  // Memoize total budget instead of computing on every render
  const totalBudget = useMemo(
    () =>
      Object.values(budgetPerSpecialty).reduce(
        (sum, val) => sum + (val || 0),
        0,
      ),
    [budgetPerSpecialty],
  );

  useEffect(() => {
    const allHaveBudget = selectedSpecialties.every(
      (s) => (budgetPerSpecialty[s._id] || 0) > 0,
    );
    setIsBudgetPlanningValid(selectedSpecialties.length > 0 && allHaveBudget);
  }, [selectedSpecialties, budgetPerSpecialty, setIsBudgetPlanningValid]);

  const handleBudgetChange = useCallback(
    (specialtyId: string, rawValue: string) => {
      const numericValue = parseGBP(rawValue);
      const newBudget = { ...budgetPerSpecialty, [specialtyId]: numericValue };

      setInputValues((prev) => ({ ...prev, [specialtyId]: rawValue }));
      setBudgetPerSpecialty(newBudget);

      const newTotal = Object.values(newBudget).reduce(
        (sum, val) => sum + (val || 0),
        0,
      );

      setBudgetPlanning({
        budgetPerSpecialty: newBudget,
        totalBudget: newTotal,
      });
    },
    [budgetPerSpecialty, setBudgetPlanning],
  );

  const handleBudgetBlur = useCallback(
    (specialtyId: string, rawValue: string) => {
      const numericValue = parseGBP(rawValue);
      setInputValues((prev) => ({
        ...prev,
        [specialtyId]: numericValue ? formatGBP(numericValue) : "",
      }));
    },
    [],
  );

  return (
    <div className="space-y-4">
      {/* Section 1: Allocate Budget per Specialty */}
      <div className="rounded-lg overflow-hidden border border-primary/20">
        <div className="bg-primary/10 px-4 py-2">
          <span className="text-sm font-semibold text-primary">
            Allocate Budget per Service
          </span>
        </div>
        <div className="p-4">
          {selectedSpecialties.length > 0 ? (
            <div className="space-y-1">
              {/* Header */}
              <div className="grid grid-cols-2 gap-4 py-2 border-b">
                <span className="text-sm font-medium text-muted-foreground">
                  Service
                </span>
                <span className="text-sm font-medium text-muted-foreground">
                  Budget
                </span>
              </div>

              {/* Rows */}
              {selectedSpecialties.map((specialty) => (
                <div
                  key={specialty._id}
                  className="grid grid-cols-2 gap-4 py-3 items-center"
                >
                  <span className="text-sm">{specialty.name}</span>
                  <FloatingLabelInput
                    label="Amount (GBP)"
                    type="text"
                    inputMode="numeric"
                    value={inputValues[specialty._id] || ""}
                    onChange={(e) =>
                      handleBudgetChange(specialty._id, e.target.value)
                    }
                    onBlur={(e) =>
                      handleBudgetBlur(specialty._id, e.target.value)
                    }
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
              No services selected. Please go back to Step 2.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
