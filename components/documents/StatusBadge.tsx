import { JSX } from "react";

type Status = "pending" | "processing" | "ingested" | "failed";

const styles: Record<Status, string> = {
  pending: "bg-amber-50 text-amber-800 ring-amber-200",
  processing: "bg-blue-50 text-blue-800 ring-blue-200",
  ingested: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  failed: "bg-rose-50 text-rose-800 ring-rose-200",
};

type StatusBadgeProps = {
  status: Status;
  label: string;
};

function StatusBadge({ status, label }: StatusBadgeProps): JSX.Element {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${styles[status]}`}
    >
      <span className="h-2 w-2 rounded-full bg-current opacity-80" />
      {label}
    </span>
  );
}

export type { StatusBadgeProps, Status };
export { StatusBadge };

