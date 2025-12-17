import { JSX } from "react";
import { ArrowUpRight } from "lucide-react";

type SellingPoint = {
  label: string;
  tone?: "primary" | "accent" | "secondary";
  icon?: boolean;
};

type SellingPointsProps = {
  items: SellingPoint[];
};

const toneClasses: Record<NonNullable<SellingPoint["tone"]>, string> = {
  primary: "bg-primary/10 text-primary ring-primary/30",
  accent: "bg-accent/10 text-accent-foreground ring-accent/30",
  secondary: "bg-secondary/20 text-secondary-foreground ring-secondary/50",
};

function SellingPoints({ items }: SellingPointsProps): JSX.Element {
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-foreground">
      {items.map((item) => (
        <span
          key={item.label}
          className={`inline-flex items-center gap-2 rounded-full px-3 py-2 ring-1 ${
            item.tone ? toneClasses[item.tone] : "bg-muted text-foreground ring-border"
          }`}
        >
          {item.icon ? <ArrowUpRight className="size-4" /> : null}
          {item.label}
        </span>
      ))}
    </div>
  );
}

export type { SellingPoint };
export { SellingPoints };

