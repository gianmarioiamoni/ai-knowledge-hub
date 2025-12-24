import { JSX } from "react";
import { Link } from "@/i18n/navigation";

type HeaderBarProps = {
  title: string;
  headline?: string;
  headlinePrefix?: string;
  headlineLinkLabel?: string;
  headlineTooltip?: string;
  headlineHref?: string;
  actionSlot: JSX.Element;
};

function HeaderBar({
  title,
  headline,
  headlinePrefix,
  headlineLinkLabel,
  headlineTooltip,
  headlineHref,
  actionSlot,
}: HeaderBarProps): JSX.Element {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 sm:flex-nowrap">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-zinc-500">{title}</p>
        {headlineLinkLabel && headlineHref ? (
          <div className="flex items-baseline gap-2">
            {headlinePrefix ? <span className="text-2xl font-semibold text-zinc-900">{headlinePrefix}</span> : null}
            <Link
              href={headlineHref}
              className="text-2xl font-semibold text-primary hover:underline"
              title={headlineTooltip}
            >
              {headlineLinkLabel}
            </Link>
          </div>
        ) : headlineHref && headline ? (
          <Link href={headlineHref} className="text-2xl font-semibold text-primary hover:underline">
            {headline}
          </Link>
        ) : (
          <h1 className="text-2xl font-semibold text-zinc-900">{headline}</h1>
        )}
      </div>
      <div className="flex-shrink-0">{actionSlot}</div>
    </div>
  );
}

export { HeaderBar };

