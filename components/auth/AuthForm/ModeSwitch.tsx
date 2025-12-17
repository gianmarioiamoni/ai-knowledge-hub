import { JSX } from "react";
import type { Mode } from "./types";

type ModeSwitchProps = {
  mode: Mode;
  onChange: (mode: Mode) => void;
  labels: {
    signin: string;
    signup: string;
  };
};

function ModeSwitch({ mode, onChange, labels }: ModeSwitchProps): JSX.Element {
  return (
    <div className="flex w-full rounded-full bg-muted/70 p-1 text-sm font-semibold text-foreground shadow-inner ring-1 ring-border/70">
      {(["signin", "signup"] as const).map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          className={`flex-1 rounded-full px-4 py-2 transition ${
            mode === value
              ? "bg-white text-foreground shadow-md ring-1 ring-border/60"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {value === "signin" ? labels.signin : labels.signup}
        </button>
      ))}
    </div>
  );
}

export { ModeSwitch };

