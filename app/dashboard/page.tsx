import { redirect } from "next/navigation";
import type { JSX } from "react";
import {
  ArrowUpRight,
  FileSpreadsheet,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { BadgePills } from "@/components/dashboard/BadgePills";
import { HeaderBar } from "@/components/dashboard/HeaderBar";
import { ProgressCard } from "@/components/dashboard/ProgressCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { StatusCard } from "@/components/dashboard/StatusCard";
import { createSupabaseServerClient } from "@/lib/server/supabaseUser";

export const dynamic = "force-dynamic";

export default async function DashboardPage(): Promise<JSX.Element> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/login");
  }

  const email = data.user.email ?? "Utente";

  const stats = [
    { label: "Documenti indicizzati", value: "128", delta: "+12 questa settimana" },
    { label: "Conversazioni RAG", value: "3.4k", delta: "+8.2% trend" },
    { label: "SOP generate", value: "640", delta: "Pronte per export" },
    { label: "Utenti attivi", value: "42", delta: "RLS attiva" },
  ];

  const pipeline = [
    {
      title: "Upload & parsing",
      desc: "PDF, docx, policy aziendali salvate in Supabase Storage.",
    },
    { title: "Chunking + embeddings", desc: "Split semantico + pgvector pronto alla ricerca." },
    { title: "Chat RAG", desc: "Context top-k, GPT-4.1 e persistenza conversazioni." },
    { title: "SOP generator", desc: "Template operativi con checklist e avvisi." },
  ];

  const nextActions = [
    "Carica nuovi manuali o procedure interne.",
    "Apri il thread RAG e valida le risposte con il team.",
    "Genera una SOP partendo da una conversazione salvata.",
  ];

  const logoutButton = (
    <form action={signOut} className="flex items-center justify-end">
      <Button variant="outline">Logout</Button>
    </form>
  );

  return (
    <div className="relative min-h-screen overflow-hidden px-6 py-12">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -left-28 -top-32 h-[36rem] w-[36rem] rounded-full bg-primary/18 blur-[120px]" />
        <div className="absolute right-[-18rem] top-[-12rem] h-[28rem] w-[28rem] rounded-full bg-accent/18 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.18)_1px,transparent_0)] bg-[size:44px_44px] mix-blend-screen dark:opacity-20" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-8">
        <HeaderBar title="" headline={email} actionSlot={logoutButton} />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <BadgePills
            showBadge={false}
            title=""
            headline={email}
            subtitle="Controlla carichi, ingestion e conversazioni."
            pills={[
              { label: "Multi-tenant" },
              { label: "RAG ready" },
              { label: "SOP generator" },
            ]}
          />
        </div>

        <StatusCard title="Operativita immediata">
          <QuickActions
            labels={{
              upload: "Vai a Documenti",
              chat: "Apri Chat",
              sop: "Genera SOP",
            }}
          />
        </StatusCard>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <StatusCard key={item.label} title={item.label}>
              <div className="flex flex-col gap-1">
                <span className="text-3xl font-semibold text-foreground">{item.value}</span>
                <span className="text-sm text-muted-foreground">{item.delta}</span>
              </div>
            </StatusCard>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.9fr]">
          <StatusCard title="Pipeline ingestion & RAG">
            <p className="text-sm text-muted-foreground">
              Dallo storage al retrieval: ogni fase è pronta e monitorabile.
            </p>
            <div className="space-y-4">
              {pipeline.map((item, idx) => (
                <div
                  key={item.title}
                  className="flex items-start gap-4 rounded-2xl border border-white/40 bg-white/70 p-4 shadow-inner backdrop-blur dark:border-white/10 dark:bg-white/5"
                >
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary ring-1 ring-primary/20">
                    {idx + 1}
                  </div>
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </StatusCard>

          <StatusCard title="Azioni consigliate">
            <p className="text-sm text-muted-foreground">
              Mantieni la knowledge base aggiornata e pronta per il team.
            </p>
            <div className="space-y-3">
              {nextActions.map((action) => (
                <div
                  key={action}
                  className="flex items-start gap-3 rounded-2xl border border-white/40 bg-white/70 p-4 text-sm font-semibold text-foreground shadow-inner backdrop-blur dark:border-white/10 dark:bg-white/5"
                >
                  <span className="mt-0.5 size-2 rounded-full bg-primary shadow-[0_0_0_6px_rgba(79,70,229,0.14)]" />
                  {action}
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-3 rounded-2xl border border-white/40 bg-gradient-to-br from-primary/10 via-secondary/20 to-accent/10 p-4 text-sm text-foreground shadow-md backdrop-blur dark:border-white/10 dark:from-primary/20 dark:via-secondary/10 dark:to-accent/10">
              <div className="flex items-center gap-2 font-semibold">
                <FileSpreadsheet className="size-4" />
                KPI in arrivo
              </div>
              <p className="text-sm text-muted-foreground">
                In questa sezione mostreremo metriche live: latenza media, hit rate, qualita delle
                risposte e stato delle sincronizzazioni.
              </p>
            </div>
          </StatusCard>
        </div>

        <StatusCard title="Integrita dataset">
          <ProgressCard
            title="Integrita dataset"
            subtitle="Sorgenti sincronizzate"
            progress={88}
            syncedLabel="12/14"
          />
        </StatusCard>
      </div>
    </div>
  );
}
