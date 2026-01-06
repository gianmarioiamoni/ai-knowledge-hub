// components/dashboard/ResourceUsageCard.tsx
import type { JSX } from "react";
import { Card } from "@/components/ui/card";
import type { ResourceUsage } from "@/lib/server/resourceUsage";
import { FileText, MessageSquare, FileCheck2, Users, Eye } from "lucide-react";

type ResourceUsageCardProps = {
  usage: ResourceUsage;
  labels: {
    title: string;
    documents: string;
    conversations: string;
    procedures: string;
    contributors: string;
    viewers: string;
    of: string;
  };
};

type ResourceItemProps = {
  icon: JSX.Element;
  label: string;
  current: number;
  limit: number;
  ofLabel: string;
};

function ResourceItem({ icon, label, current, limit, ofLabel }: ResourceItemProps): JSX.Element {
  const percentage = limit > 0 ? (current / limit) * 100 : 0;
  const isNearLimit = percentage >= 80;
  const isAtLimit = current >= limit;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <div className="text-muted-foreground">{icon}</div>
          <span className="font-medium text-foreground">{label}</span>
        </div>
        <span className={`font-semibold ${isAtLimit ? "text-destructive" : isNearLimit ? "text-orange-600" : "text-foreground"}`}>
          {current} {ofLabel} {limit}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-border">
        <div
          className={`h-full transition-all ${
            isAtLimit
              ? "bg-destructive"
              : isNearLimit
              ? "bg-orange-500"
              : "bg-primary"
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

export function ResourceUsageCard({ usage, labels }: ResourceUsageCardProps): JSX.Element {
  return (
    <Card className="border border-white/40 bg-white/70 p-6 backdrop-blur dark:border-white/10 dark:bg-white/5">
      <h2 className="mb-4 text-lg font-semibold text-foreground">{labels.title}</h2>
      <div className="space-y-4">
        <ResourceItem
          icon={<FileText className="size-4" />}
          label={labels.documents}
          current={usage.documents.current}
          limit={usage.documents.limit}
          ofLabel={labels.of}
        />
        <ResourceItem
          icon={<MessageSquare className="size-4" />}
          label={labels.conversations}
          current={usage.conversations.current}
          limit={usage.conversations.limit}
          ofLabel={labels.of}
        />
        <ResourceItem
          icon={<FileCheck2 className="size-4" />}
          label={labels.procedures}
          current={usage.procedures.current}
          limit={usage.procedures.limit}
          ofLabel={labels.of}
        />
        <ResourceItem
          icon={<Users className="size-4" />}
          label={labels.contributors}
          current={usage.contributors.current}
          limit={usage.contributors.limit}
          ofLabel={labels.of}
        />
        <ResourceItem
          icon={<Eye className="size-4" />}
          label={labels.viewers}
          current={usage.viewers.current}
          limit={usage.viewers.limit}
          ofLabel={labels.of}
        />
      </div>
    </Card>
  );
}


