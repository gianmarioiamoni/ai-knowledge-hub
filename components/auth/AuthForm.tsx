// components/auth/AuthForm.tsx
"use client";

import { JSX, useActionState, useMemo, useState } from "react";
import { signInWithGoogle, signInWithPassword, signUpWithPassword } from "@/app/actions/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CredentialForm } from "./AuthForm/CredentialForm";
import { Divider } from "./AuthForm/Divider";
import { InfoBox } from "./AuthForm/InfoBox";
import { ModeSwitch } from "./AuthForm/ModeSwitch";
import { ProviderButton } from "./AuthForm/ProviderButton";
import { SafeBadge } from "./AuthForm/SafeBadge";
import type { AuthFormState, Mode } from "./AuthForm/types";

const initialState: AuthFormState = {
  error: "",
};

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
    <Card className="relative w-full max-w-xl overflow-hidden border border-white/25 bg-white/80 shadow-2xl backdrop-blur-lg transition duration-300 hover:shadow-[0_25px_80px_-35px_rgba(32,58,110,0.45)] dark:border-white/10 dark:bg-white/5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(79,70,229,0.12),transparent_38%),radial-gradient(circle_at_90%_10%,rgba(236,72,153,0.12),transparent_36%)]" />
      <CardHeader className="relative space-y-3 text-center">
        <SafeBadge />
        <CardTitle className="text-2xl font-semibold text-foreground sm:text-3xl">
          {mode === "signin" ? "Benvenuto nel tuo hub" : "Crea il tuo spazio"}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {mode === "signin"
            ? "Autenticati con email/password oppure prosegui con Google."
            : "Configura subito l&apos;account e inizia a caricare i tuoi contenuti."}
        </CardDescription>
      </CardHeader>
      <CardContent className="relative space-y-6">
        <ModeSwitch mode={mode} onChange={setMode} />

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
          <div className="space-y-3 sm:col-span-2">
            <CredentialForm
              mode={mode}
              modeLabel={modeLabel}
              error={currentError}
              action={mode === "signin" ? signInAction : signUpAction}
            />
          </div>

          <div className="sm:col-span-2">
            <Divider />
          </div>

          <div className="sm:col-span-2">
            <ProviderButton action={signInWithGoogle} />
          </div>
        </div>

        <InfoBox />
      </CardContent>
    </Card>
  );
}

export { AuthForm };

