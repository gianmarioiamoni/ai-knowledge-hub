// components/admin/DemoDataControl/useDemoDataControl.ts
"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { seedDemoDataAction, resetDemoDataAction, getDemoDataStatusAction } from "@/app/[locale]/admin/users/demoActions";
import type { DemoDataStatus, DemoDataControlLabels } from "./types";

export function useDemoDataControl(locale: string, labels: DemoDataControlLabels) {
  const [status, setStatus] = useState<DemoDataStatus>({
    hasData: false,
    documentCount: 0,
    conversationCount: 0,
    procedureCount: 0,
    chunkCount: 0,
    messageCount: 0,
  });
  const [isPending, startTransition] = useTransition();

  const refreshStatus = () => {
    startTransition(async () => {
      const newStatus = await getDemoDataStatusAction(locale);
      setStatus(newStatus);
    });
  };

  const handleSeed = () => {
    startTransition(async () => {
      const result = await seedDemoDataAction(locale);
      
      if (result.success) {
        toast.success(labels.seedSuccess, {
          description: `${result.documentsCreated} docs, ${result.conversationsCreated} chats, ${result.proceduresCreated} SOPs`,
        });
        refreshStatus();
      } else {
        toast.error(labels.seedError, {
          description: result.error,
        });
      }
    });
  };

  const handleReset = () => {
    startTransition(async () => {
      const result = await resetDemoDataAction(locale);
      
      if (result.success) {
        toast.success(labels.resetSuccess, {
          description: `Reset complete: ${result.recreated.documentsCreated} docs, ${result.recreated.conversationsCreated} chats, ${result.recreated.proceduresCreated} SOPs`,
        });
        refreshStatus();
      } else {
        toast.error(labels.resetError, {
          description: result.error,
        });
      }
    });
  };

  return {
    status,
    isPending,
    refreshStatus,
    handleSeed,
    handleReset,
  };
}

