"use client";

import { useState } from "react";
import type { Plan } from "./types";

type UsePlanSelectionArgs = {
  defaultPlan?: Plan["id"];
  onSelect?: (planId: Plan["id"]) => Promise<void>;
};

type UsePlanSelectionResult = {
  selected: Plan["id"] | null;
  message: string | null;
  handleSelect: (planId: Plan["id"]) => Promise<void>;
};

const usePlanSelection = ({ defaultPlan = "trial", onSelect }: UsePlanSelectionArgs): UsePlanSelectionResult => {
  const [selected, setSelected] = useState<Plan["id"] | null>(defaultPlan);
  const [message, setMessage] = useState<string | null>(null);

  const handleSelect = async (planId: Plan["id"]) => {
    setSelected(planId);
    if (onSelect) {
      setMessage(null);
      try {
        await onSelect(planId);
        setMessage("ok");
      } catch {
        setMessage("error");
      }
    }
  };

  return { selected, message, handleSelect };
};

export { usePlanSelection };

