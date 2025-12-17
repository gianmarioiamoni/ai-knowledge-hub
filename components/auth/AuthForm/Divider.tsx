import { JSX } from "react";

type DividerProps = {
  label: string;
};

function Divider({ label }: DividerProps): JSX.Element {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px flex-1 bg-border" />
      <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

export { Divider };

