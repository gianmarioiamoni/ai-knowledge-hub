"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { JSX } from "react";
import { handleUploadWithState } from "@/app/[locale]/documents/actions";

type FormState = {
  error?: string;
  success?: string;
};

type UploadFormProps = {
  locale: string;
  labels: {
    uploadLabel: string;
    uploadButton: string;
    hintFormats: string;
    hintSecurity: string;
    uploading: string;
  };
};

function SubmitButton({ labels }: { labels: UploadFormProps["labels"] }): JSX.Element {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-60"
    >
      {pending ? labels.uploading : labels.uploadButton}
    </button>
  );
}

function UploadForm({ locale, labels }: UploadFormProps): JSX.Element {
  const [state, formAction] = useActionState<FormState>(handleUploadWithState, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />
      <label className="text-sm font-medium text-foreground">
        {labels.uploadLabel}
        <input
          required
          name="file"
          type="file"
          accept="application/pdf"
          className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary/90"
        />
      </label>
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {labels.hintFormats} · {labels.hintSecurity}
        </p>
        <SubmitButton labels={labels} />
      </div>
      {state?.error ? <p className="text-xs text-rose-600">{state.error}</p> : null}
      {state?.success ? <p className="text-xs text-emerald-700">{state.success}</p> : null}
    </form>
  );
}

export { UploadForm };

