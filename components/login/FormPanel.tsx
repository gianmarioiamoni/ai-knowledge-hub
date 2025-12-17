import { JSX, ReactNode } from "react";

type FormPanelProps = {
  children: ReactNode;
};

function FormPanel({ children }: FormPanelProps): JSX.Element {
  return (
    <div className="relative w-full max-w-xl lg:ml-auto">
      <div className="absolute inset-0 -z-10 scale-105 rounded-[28px] bg-gradient-to-br from-primary/20 via-accent/15 to-secondary/40 blur-3xl" />
      <div className="rounded-[28px] border border-white/40 bg-white/70 p-1 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
        {children}
      </div>
    </div>
  );
}

export { FormPanel };

