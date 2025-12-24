"use client";

import { useState } from "react";
import type { Plan } from "./types";

type UsePlanSelectionArgs = {
  defaultPlan?: Plan["id"];
  currentPlan?: { planId: Plan["id"]; billingCycle?: "monthly" | "annual" };
  onSelect?: (planId: Plan["id"], billingCycle: "monthly" | "annual") => Promise<void>;
};

type UsePlanSelectionResult = {
  selected: Plan["id"] | null;
  message: string | null;
  billingCycle: Record<Plan["id"], "monthly" | "annual">;
  setBillingCycle: (planId: Plan["id"], cycle: "monthly" | "annual") => void;
  handleSelect: (planId: Plan["id"], cycle?: "monthly" | "annual") => Promise<void>;
};

const usePlanSelection = ({
  defaultPlan = "trial",
  currentPlan,
  onSelect,
}: UsePlanSelectionArgs): UsePlanSelectionResult => {
  const initialPlan = currentPlan?.planId ?? defaultPlan;
  const [selected, setSelected] = useState<Plan["id"] | null>(initialPlan);
  const [message, setMessage] = useState<string | null>(null);
  const [billingCycle, setBillingCycleState] = useState<Record<Plan["id"], "monthly" | "annual">>({
    trial: currentPlan?.planId === "trial" && currentPlan.billingCycle ? currentPlan.billingCycle : "monthly",
    smb: currentPlan?.planId === "smb" && currentPlan.billingCycle ? currentPlan.billingCycle : "monthly",
    enterprise:
      currentPlan?.planId === "enterprise" && currentPlan.billingCycle ? currentPlan.billingCycle : "monthly",
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

