"use client";

import { useFormState } from "react-dom";
import { submitContact } from "@/app/[locale]/contact/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type TopicOption = { value: string; label: string };

type ContactFormProps = {
  defaultEmail?: string | null;
  locale: string;
  topics: TopicOption[];
  labels: {
    title: string;
    subtitle: string;
    topic: string;
    selectTopic: string;
    message: string;
    email: string;
    phone: string;
    submit: string;
    success: string;
    error: string;
    note: string;
    subject: string;
  };
};

function ContactForm({ defaultEmail, locale, topics, labels }: ContactFormProps): JSX.Element {
  const [state, formAction] = useFormState(submitContact, {});

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-6 py-12">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{labels.title}</p>
        <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">{labels.subtitle}</h1>
        <p className="text-sm text-muted-foreground">{labels.note}</p>
      </div>

      <Card className="p-6">
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="locale" value={locale} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="topic">{labels.topic}</Label>
              <select
                id="topic"
                name="topic"
                className={cn(
                  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                )}
                defaultValue={topics[0]?.value}
              >
                <option value="" disabled>
                  {labels.selectTopic}
                </option>
                {topics.map((topic) => (
                  <option key={topic.value} value={topic.value}>
                    {topic.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="subject">{labels.subject}</Label>
              <Input id="subject" name="title" required placeholder={labels.subject} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="message">{labels.message}</Label>
            <Textarea id="message" name="message" required rows={5} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">{labels.email}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                defaultValue={defaultEmail ?? ""}
                placeholder="you@example.com"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">{labels.phone}</Label>
              <Input id="phone" name="phone" type="tel" placeholder="+39..." />
            </div>
          </div>

          {state?.success ? (
            <p className="text-sm font-semibold text-green-600">{labels.success}</p>
          ) : null}
          {state?.error ? <p className="text-sm font-semibold text-destructive">{labels.error}</p> : null}

          <Button type="submit" className="self-start">
            {labels.submit}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export { ContactForm };


