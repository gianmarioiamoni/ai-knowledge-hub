"use client";

import { useState } from "react";
import type { Plan } from "./types";

type UsePlanSelectionArgs = {
  defaultPlan?: Plan["id"];
  onSelect?: (planId: Plan["id"], billingCycle: "monthly" | "annual") => Promise<void>;
};

type UsePlanSelectionResult = {
  selected: Plan["id"] | null;
  message: string | null;
  billingCycle: Record<Plan["id"], "monthly" | "annual">;
  setBillingCycle: (planId: Plan["id"], cycle: "monthly" | "annual") => void;
  handleSelect: (planId: Plan["id"], cycle?: "monthly" | "annual") => Promise<void>;
};

const usePlanSelection = ({ defaultPlan = "trial", onSelect }: UsePlanSelectionArgs): UsePlanSelectionResult => {
  const [selected, setSelected] = useState<Plan["id"] | null>(defaultPlan);
  const [message, setMessage] = useState<string | null>(null);
  const [billingCycle, setBillingCycleState] = useState<Record<Plan["id"], "monthly" | "annual">>({
    trial: "monthly",
    smb: "monthly",
    enterprise: "monthly",
  });

  const setBillingCycle = (planId: Plan["id"], cycle: "monthly" | "annual") => {
    setBillingCycleState((prev) => ({ ...prev, [planId]: cycle }));
  };

  const handleSelect = async (planId: Plan["id"], cycle?: "monthly" | "annual") => {
    setSelected(planId);
    if (onSelect) {
      setMessage(null);
      try {
        const effectiveCycle = cycle ?? billingCycle[planId] ?? "monthly";
        await onSelect(planId, effectiveCycle);
        setMessage("ok");
      } catch {
        setMessage("error");
      }
    }
  };

  return { selected, message, billingCycle, setBillingCycle, handleSelect };
};

export { usePlanSelection };

