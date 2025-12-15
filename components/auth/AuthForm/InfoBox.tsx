import { JSX } from "react";

function InfoBox(): JSX.Element {
  return (
    <div className="rounded-xl bg-muted/50 px-4 py-3 text-sm text-muted-foreground ring-1 ring-border/70">
      Protezione multi-tenant attiva: RLS, Supabase Auth e storage sicuro per i tuoi dati.
    </div>
  );
}

export { InfoBox };

