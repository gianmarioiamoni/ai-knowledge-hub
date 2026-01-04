"use client";

import { JSX, useActionState, useEffect, useRef, useTransition } from "react";
import { toast } from "sonner";
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
  action?: typeof handleUploadWithState;
};

type SubmitButtonProps = {
  labels: UploadFormProps["labels"];
  pending: boolean;
};

function SubmitButton({ labels, pending }: SubmitButtonProps): JSX.Element {
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

function UploadForm({ locale, labels, action = handleUploadWithState }: UploadFormProps): JSX.Element {
  const [state, formAction] = useActionState<FormState, FormData>(action, {});
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.success);
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state?.error, state?.success]);

  const handleSubmit = (formData: FormData) => {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      toast.error("Please select a file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large. Max 10MB.");
      return;
    }
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />
      <label className="text-sm font-medium text-foreground">
        {labels.uploadLabel}
        <input
          required
          name="file"
          type="file"
          accept="application/pdf"
          ref={fileRef}
          className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary/90"
        />
      </label>
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {labels.hintFormats} · {labels.hintSecurity}
        </p>
        <SubmitButton labels={labels} pending={pending} />
      </div>
    </form>
  );
}

export { UploadForm };

