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
    <Card className="w-full max-w-md border-zinc-200 bg-white shadow-sm">
      <CardHeader className="space-y-2">
        <CardTitle className="text-xl font-semibold text-zinc-900">
          {mode === "signin" ? "Benvenuto" : "Crea il tuo account"}
        </CardTitle>
        <CardDescription className="text-sm text-zinc-600">
          {mode === "signin"
            ? "Accedi con email/password o continua con Google."
            : "Registrati con email/password o continua con Google."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-zinc-100 p-1 text-sm font-medium text-zinc-700">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`rounded-md px-3 py-2 transition ${
              mode === "signin" ? "bg-white shadow-sm" : "bg-transparent"
            }`}
          >
            Accedi
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`rounded-md px-3 py-2 transition ${
              mode === "signup" ? "bg-white shadow-sm" : "bg-transparent"
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
              <p className="text-sm font-medium text-red-600">{currentError}</p>
            ) : null}
            <Button type="submit" className="w-full">
              {modeLabel}
            </Button>
          </form>

          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-zinc-200" />
            <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">oppure</span>
            <span className="h-px flex-1 bg-zinc-200" />
          </div>

          <form action={signInWithGoogle}>
            <Button
              type="submit"
              variant="outline"
              className="flex w-full items-center justify-center gap-2"
            >
              <span>Continua con Google</span>
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}

export { AuthForm };


