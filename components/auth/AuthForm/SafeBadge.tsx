import { JSX } from "react";

function SafeBadge(): JSX.Element {
  return (
    <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary ring-1 ring-primary/30">
      <span className="size-2 rounded-full bg-primary shadow-[0_0_0_6px_rgba(79,70,229,0.12)]" />
      Accesso sicuro Supabase
    </div>
  );
}

export { SafeBadge };

