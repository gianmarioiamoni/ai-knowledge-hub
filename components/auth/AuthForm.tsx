// components/auth/AuthForm.tsx
"use client";

import { useActionState, useMemo, useState } from "react";
import { signInWithGoogle, signInWithPassword, signUpWithPassword } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type AuthFormState = {
  error?: string;
};

const initialState: AuthFormState = {
  error: "",
};

type Mode = "signin" | "signup";

function AuthForm(): JSX.Element {
  const [mode, setMode] = useState<Mode>("signin");
  const [signInState, signInAction] = useActionState(signInWithPassword, initialState);
  const [signUpState, signUpAction] = useActionState(signUpWithPassword, initialState);

  const currentError = useMemo(
    () => (mode === "signin" ? signInState.error : signUpState.error),
    [mode, signInState.error, signUpState.error]
  );

  const modeLabel = mode === "signin" ? "Accedi" : "Crea account";

  return (
    <Card className="relative w-full max-w-md overflow-hidden border border-white/30 bg-white/80 shadow-2xl backdrop-blur-lg transition duration-300 hover:shadow-[0_25px_80px_-35px_rgba(32,58,110,0.45)] dark:border-white/10 dark:bg-white/5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.14),transparent_40%),radial-gradient(circle_at_85%_0%,rgba(236,72,153,0.14),transparent_38%)]" />
      <CardHeader className="relative space-y-3">
        <div className="inline-flex items-center gap-2 self-start rounded-full bg-secondary/80 px-3 py-1 text-xs font-semibold text-secondary-foreground shadow-sm ring-1 ring-border/50">
          <span className="size-2 rounded-full bg-primary shadow-[0_0_0_6px_rgba(79,70,229,0.12)]" />
          Accesso sicuro Supabase
        </div>
        <CardTitle className="text-2xl font-semibold text-foreground">
          {mode === "signin" ? "Benvenuto nel tuo hub" : "Crea il tuo spazio"}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {mode === "signin"
            ? "Autenticati con email/password oppure prosegui con Google."
            : "Configura subito l&apos;account e inizia a caricare i tuoi contenuti."}
        </CardDescription>
      </CardHeader>
      <CardContent className="relative space-y-6">
        <div className="grid grid-cols-2 gap-2 rounded-full bg-muted/70 p-1 text-sm font-semibold text-foreground shadow-inner ring-1 ring-border/70">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`rounded-full px-4 py-2 transition ${
              mode === "signin"
                ? "bg-white text-foreground shadow-md ring-1 ring-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Accedi
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`rounded-full px-4 py-2 transition ${
              mode === "signup"
                ? "bg-white text-foreground shadow-md ring-1 ring-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Registrati
          </button>
        </div>

        <div className="space-y-4">
          <form
            action={mode === "signin" ? signInAction : signUpAction}
            className="space-y-3"
          >
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-800" htmlFor="email">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@company.com"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-800" htmlFor="password">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                minLength={6}
                required
                placeholder="••••••••"
              />
            </div>
            {currentError ? (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">
                {currentError}
              </p>
            ) : null}
            <Button type="submit" className="w-full">
              {modeLabel}
            </Button>
          </form>

          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              oppure
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <form action={signInWithGoogle}>
            <Button
              type="submit"
              variant="outline"
              className="flex w-full items-center justify-center gap-2 border-foreground/10 bg-white/60 font-semibold text-foreground backdrop-blur transition hover:-translate-y-[1px] hover:border-primary/40 hover:bg-white/80 dark:bg-white/10"
            >
              <span>Continua con Google</span>
            </Button>
          </form>

          <p className="text-xs text-muted-foreground">
            Protezione multi-tenant attiva: RLS, Supabase Auth e storage sicuro per i tuoi dati.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export { AuthForm };

