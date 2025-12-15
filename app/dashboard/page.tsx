import { redirect } from "next/navigation";
import {
  ArrowUpRight,
  Bot,
  FileSpreadsheet,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/server/supabaseUser";

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

  return (
    <div className="relative min-h-screen overflow-hidden px-6 py-12">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -left-28 -top-32 h-[36rem] w-[36rem] rounded-full bg-primary/18 blur-[120px]" />
        <div className="absolute right-[-18rem] top-[-12rem] h-[28rem] w-[28rem] rounded-full bg-accent/18 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.18)_1px,transparent_0)] bg-[size:44px_44px] mix-blend-screen dark:opacity-20" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-foreground shadow-sm ring-1 ring-border/60 backdrop-blur dark:bg-white/10">
              <Sparkles className="size-4 text-primary" />
              Control room RAG
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Dashboard
              </p>
              <h1 className="text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
                Ciao, {email}. Tutto cio che serve per orchestrare conoscenza e AI.
              </h1>
              <p className="max-w-3xl text-base text-muted-foreground">
                Monitor, azioni rapide e stato della pipeline ingestion → retrieval → SOP. Multi-tenant
                sicuro con Supabase Auth, Storage e RLS.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-foreground">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-primary ring-1 ring-primary/30">
                <ShieldCheck className="size-4" />
                Tenant isolato
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-secondary/30 px-3 py-1.5 text-secondary-foreground ring-1 ring-secondary/40">
                pgvector live
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1.5 text-accent-foreground ring-1 ring-accent/30">
                SOP generator
              </span>
            </div>
          </div>
          <form action={signOut} className="flex items-center justify-end">
            <Button variant="outline">Logout</Button>
          </form>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-white/30 bg-white/70 p-8 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.12),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(236,72,153,0.12),transparent_42%)]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <p className="text-sm font-semibold text-muted-foreground">
                Operativita immediata: upload → embeddings → chat → SOP
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button asChild className="group">
                  <a href="/documents" className="inline-flex items-center gap-2">
                    <UploadCloud className="size-4" />
                    Carica documento
                    <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </Button>
                <Button asChild variant="outline" className="group border-foreground/20">
                  <a href="/chat" className="inline-flex items-center gap-2">
                    <MessageCircle className="size-4" />
                    Apri chat RAG
                    <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </Button>
                <Button asChild variant="ghost" className="text-primary hover:bg-primary/10">
                  <a href="/procedures" className="inline-flex items-center gap-2">
                    <Bot className="size-4" />
                    Genera SOP
                  </a>
                </Button>
              </div>
            </div>
            <div className="grid gap-3 rounded-2xl border border-white/30 bg-white/70 px-5 py-4 text-sm shadow-inner backdrop-blur dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Integrita dataset</span>
                <span className="text-xs text-muted-foreground">88%</span>
              </div>
              <div className="h-2 rounded-full bg-border">
                <div className="h-full w-[88%] rounded-full bg-gradient-to-r from-primary via-accent to-primary shadow-[0_10px_50px_-25px_rgba(79,70,229,0.8)]" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Sorgenti sincronizzate</span>
                <span className="font-semibold text-foreground">12/14</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <Card
              key={item.label}
              className="border-white/50 bg-white/70 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5"
            >
              <CardHeader className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-secondary/30 px-2 py-1 text-[11px] font-semibold text-secondary-foreground ring-1 ring-secondary/50">
                  <span className="size-2 rounded-full bg-primary" />
                  {item.label}
                </div>
                <CardTitle className="text-3xl font-semibold text-foreground">
                  {item.value}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{item.delta}</p>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.9fr]">
          <Card className="border-white/50 bg-white/70 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
            <CardHeader className="space-y-2">
              <CardTitle className="text-xl font-semibold text-foreground">
                Pipeline ingestion & RAG
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Dallo storage al retrieval: ogni fase e pronta e monitorabile.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>

          <Card className="border-white/50 bg-white/70 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
            <CardHeader className="space-y-2">
              <CardTitle className="text-xl font-semibold text-foreground">
                Azioni consigliate
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Mantieni la knowledge base aggiornata e pronta per il team.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
