import { JSX } from "react";

type HeaderBarProps = {
  title: string;
  headline: string;
  actionSlot: JSX.Element;
};

function HeaderBar({ title, headline, actionSlot }: HeaderBarProps): JSX.Element {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-zinc-500">{title}</p>
        <h1 className="text-2xl font-semibold text-zinc-900">{headline}</h1>
      </div>
      {actionSlot}
    </div>
  );
}

export { HeaderBar };

