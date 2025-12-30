import { JSX } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { BoundAuthAction, Mode } from "./types";

type CredentialFormProps = {
  mode: Mode;
  modeLabel: string;
  error?: string;
  success?: string;
  action: BoundAuthAction;
  labels: {
    email: string;
    password: string;
    organization?: string;
    verifyNotice?: string;
  };
};

function CredentialForm({
  mode,
  modeLabel,
  error,
  success,
  action,
  labels,
}: CredentialFormProps): JSX.Element {
  return (
    <form action={action} className="space-y-3">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground" htmlFor="email">
          {labels.email}
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
        <label className="block text-sm font-medium text-foreground" htmlFor="password">
          {labels.password}
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
      {mode === "signup" && labels.organization ? (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground" htmlFor="organization">
            {labels.organization}
          </label>
          <Input
            id="organization"
            name="organization"
            type="text"
            required
            minLength={2}
            placeholder="Acme Inc."
            autoComplete="organization"
          />
        </div>
      ) : null}
      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">
          {error}
        </p>
      ) : null}
      {success && mode === "signup" ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
          {labels.verifyNotice ?? success}
        </p>
      ) : null}
      <Button type="submit" className="w-full">
        {modeLabel}
      </Button>
    </form>
  );
}

export { CredentialForm };

