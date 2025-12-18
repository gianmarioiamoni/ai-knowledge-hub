import { JSX } from "react";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/documents/StatusBadge";

type IngestionCardProps = {
  title: string;
  ingestedLabel: string;
  processingLabel: string;
  lastIngestedLabel: string;
  notAvailableLabel: string;
  ingestedCount: number;
  processingCount: number;
  lastIngestedAt?: string;
  locale: string;
};

function IngestionCard({
  title,
  ingestedLabel,
  processingLabel,
  lastIngestedLabel,
  notAvailableLabel,
  ingestedCount,
  processingCount,
  lastIngestedAt,
  locale,
}: IngestionCardProps): JSX.Element {
  return (
    <Card className="border border-white/40 bg-white/70 p-5 backdrop-blur dark:border-white/10 dark:bg-white/5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <StatusBadge status="ingested" label={`${ingestedCount} ${ingestedLabel}`} />
        <StatusBadge status="processing" label={`${processingCount} ${processingLabel}`} />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        {lastIngestedLabel}: {formatDate(lastIngestedAt, locale, notAvailableLabel)}
      </p>
    </Card>
  );
}

const formatDate = (value: string | undefined, locale: string, fallback: string): string => {
  if (!value) return fallback;
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

export type { IngestionCardProps };
export { IngestionCard };

