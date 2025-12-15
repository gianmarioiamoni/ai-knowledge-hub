import { JSX } from "react";
import { Button } from "@/components/ui/button";
import type { ProviderAction } from "./types";

type ProviderButtonProps = {
  action: ProviderAction;
};

function ProviderButton({ action }: ProviderButtonProps): JSX.Element {
  return (
    <form action={action}>
      <Button
        type="submit"
        variant="outline"
        className="flex w-full items-center justify-center gap-2 border-foreground/10 bg-white/70 font-semibold text-foreground backdrop-blur transition hover:-translate-y-[1px] hover:border-primary/40 hover:bg-white/90 dark:bg-white/10"
      >
        <span>Continua con Google</span>
      </Button>
    </form>
  );
}

export { ProviderButton };

