import { JSX } from "react";

type InfoBoxProps = {
  message: string;
};

function InfoBox({ message }: InfoBoxProps): JSX.Element {
  return (
    <div className="rounded-xl bg-muted/50 px-4 py-3 text-sm text-muted-foreground ring-1 ring-border/70">
      {message}
    </div>
  );
}

export { InfoBox };

