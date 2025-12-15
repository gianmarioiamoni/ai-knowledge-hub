import { Metadata } from "next";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "AI Knowledge Hub | Login",
  description: "Accedi o registrati per gestire i tuoi contenuti.",
};

export default function LoginPage(): JSX.Element {
  return (
    <div className="relative min-h-screen overflow-hidden px-6 py-12 sm:py-16">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -left-32 -top-24 h-[36rem] w-[36rem] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-[-18rem] right-[-12rem] h-[32rem] w-[32rem] rounded-full bg-accent/25 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.22)_1px,transparent_0)] bg-[size:42px_42px] mix-blend-screen dark:opacity-20" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex items-center gap-2 self-start rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-foreground shadow-sm ring-1 ring-border/60 backdrop-blur dark:bg-white/10">
            <ShieldCheck className="size-4 text-primary" />
            Multi-tenant RAG protetto
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_0_6px_rgba(79,70,229,0.15)]" />
            Supabase Auth · Storage sicuro · SOP generation
          </div>
        </div>

        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                AI Knowledge Hub
              </p>
              <h1 className="text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
                Una control room{" "}
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  iper-moderna
                </span>{" "}
                per gestire e attivare il tuo capitale informativo.
              </h1>
              <p className="max-w-2xl text-lg text-muted-foreground">
                Upload, estrazione, chunking e RAG end-to-end: crea procedure operative e risposte
                contestuali con un&apos;esperienza pensata per team enterprise.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "Documenti indicizzati", value: "1.2k", hint: "pgvector + RLS" },
                { label: "Conversazioni al mese", value: "38k", hint: "GPT-4.1 + caching" },
                { label: "SOP generate", value: "640", hint: "Template operativi" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/50 bg-white/60 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5"
                >
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="mt-1 text-2xl font-semibold text-foreground">{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.hint}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-foreground">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-2 text-primary ring-1 ring-primary/30">
                <ArrowUpRight className="size-4" />
                Onboarding espresso
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-2 text-accent-foreground ring-1 ring-accent/30">
                Pipeline ingestion pronta
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-secondary/20 px-3 py-2 text-secondary-foreground ring-1 ring-secondary/50">
                UI Shadcn + Tailwind 4
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 -z-10 scale-105 rounded-[28px] bg-gradient-to-br from-primary/20 via-accent/15 to-secondary/40 blur-3xl" />
            <div className="rounded-[28px] border border-white/40 bg-white/70 p-1 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <AuthForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

