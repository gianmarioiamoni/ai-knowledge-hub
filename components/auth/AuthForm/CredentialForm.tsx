import { JSX } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { BoundAuthAction, Mode } from "./types";

type CredentialFormProps = {
  mode: Mode;
  modeLabel: string;
  error?: string;
  action: BoundAuthAction;
  labels: {
    email: string;
    password: string;
  };
};

function CredentialForm({
  mode,
  modeLabel,
  error,
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
      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">
          {error}
        </p>
      ) : null}
      <Button type="submit" className="w-full">
        {modeLabel}
      </Button>
    </form>
  );
}

export { CredentialForm };

