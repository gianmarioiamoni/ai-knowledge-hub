import { JSX } from "react";

type HeaderBarProps = {
  title: string;
  headline: string;
  actionSlot: JSX.Element;
};

function HeaderBar({ title, headline, actionSlot }: HeaderBarProps): JSX.Element {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 sm:flex-nowrap">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-zinc-500">{title}</p>
        <h1 className="text-2xl font-semibold text-zinc-900">{headline}</h1>
      </div>
      <div className="flex-shrink-0">{actionSlot}</div>
    </div>
  );
}

export { HeaderBar };

