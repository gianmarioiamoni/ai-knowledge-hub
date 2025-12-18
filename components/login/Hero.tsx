import { JSX } from "react";

type HeroProps = {
  title: string;
  highlight: string;
  suffix: string;
  description: string;
};

function Hero({ title, highlight, suffix, description }: HeroProps): JSX.Element {
  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
        AI Knowledge Hub
      </p>
      <h1 className="text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
        {title}{" "}
        <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          {highlight}
        </span>{" "}
        {suffix}
      </h1>
      <p className="max-w-2xl text-lg text-muted-foreground">{description}</p>
    </div>
  );
}

export { Hero };

