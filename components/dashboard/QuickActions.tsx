import { JSX } from "react";
import { ArrowUpRight, Bot, MessageCircle, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";

type QuickActionsProps = {
  labels: {
    upload: string;
    chat: string;
    sop: string;
  };
};

function QuickActions({ labels }: QuickActionsProps): JSX.Element {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button asChild className="group">
        <a href="/documents" className="inline-flex items-center gap-2">
          <UploadCloud className="size-4" />
          {labels.upload}
          <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
      </Button>
      <Button asChild variant="outline" className="group border-foreground/20">
        <a href="/chat" className="inline-flex items-center gap-2">
          <MessageCircle className="size-4" />
          {labels.chat}
          <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
      </Button>
      <Button asChild variant="ghost" className="text-primary hover:bg-primary/10">
        <a href="/procedures" className="inline-flex items-center gap-2">
          <Bot className="size-4" />
          {labels.sop}
        </a>
      </Button>
    </div>
  );
}

export { QuickActions };

