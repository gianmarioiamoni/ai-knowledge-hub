// components/branding/Logo.tsx
import Link from "next/link";
import { JSX } from "react";

type LogoProps = {
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  showText?: boolean;
  href?: string;
  className?: string;
};

const sizeClasses = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-10 w-10",
  xl: "h-12 w-12",
  "2xl": "h-14 w-14",
};

const textSizeClasses = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
  xl: "text-3xl",
  "2xl": "text-2xl", // Large icon, but same text size as "lg"
};

function LogoIcon({ size = "md" }: { size?: "sm" | "md" | "lg" | "xl" | "2xl" }): JSX.Element {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={sizeClasses[size]}
      aria-hidden="true"
    >
      {/* Book/Knowledge Base */}
      <path
        d="M10 8C10 6.89543 10.8954 6 12 6H36C37.1046 6 38 6.89543 38 8V40C38 41.1046 37.1046 42 36 42H12C10.8954 42 10 41.1046 10 40V8Z"
        fill="currentColor"
        className="text-primary"
        opacity="0.2"
      />
      <path
        d="M14 10H34V38H14V10Z"
        fill="currentColor"
        className="text-primary/10"
      />
      
      {/* AI Neural Network Nodes */}
      {/* Top layer */}
      <circle cx="24" cy="14" r="2.5" fill="currentColor" className="text-primary" />
      
      {/* Middle layer */}
      <circle cx="18" cy="24" r="2" fill="currentColor" className="text-primary" />
      <circle cx="30" cy="24" r="2" fill="currentColor" className="text-primary" />
      
      {/* Bottom layer */}
      <circle cx="24" cy="34" r="2.5" fill="currentColor" className="text-primary" />
      
      {/* Connection lines (neural network) */}
      <path
        d="M24 16.5 L18 22 M24 16.5 L30 22 M18 26 L24 31.5 M30 26 L24 31.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="text-primary"
        opacity="0.5"
      />
      
      {/* Book outline */}
      <rect
        x="10"
        y="6"
        width="28"
        height="36"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        className="text-primary"
      />
      
      {/* Book spine lines */}
      <line x1="14" y1="10" x2="14" y2="38" stroke="currentColor" strokeWidth="1.5" className="text-primary" opacity="0.3" />
      <line x1="34" y1="10" x2="34" y2="38" stroke="currentColor" strokeWidth="1.5" className="text-primary" opacity="0.3" />
    </svg>
  );
}

function LogoContent({ size = "md", showText = true }: Pick<LogoProps, "size" | "showText">): JSX.Element {
  const subtitleSize = 
    size === "sm" ? "text-xs" : 
    size === "md" ? "text-sm" : 
    size === "lg" ? "text-base" : 
    size === "xl" ? "text-lg" :
    "text-base"; // 2xl - large icon, same text as "lg"
  
  return (
    <div className="flex items-center gap-3">
      <LogoIcon size={size} />
      {showText ? (
        <div className="flex flex-col leading-none">
          <span className={`font-bold tracking-tight text-foreground ${textSizeClasses[size]}`}>
            AI Knowledge
          </span>
          <span className={`font-medium tracking-wide text-muted-foreground ${subtitleSize}`}>
            Hub
          </span>
        </div>
      ) : null}
    </div>
  );
}

export function Logo({ size = "md", showText = true, href, className = "" }: LogoProps): JSX.Element {
  if (href) {
    return (
      <Link
        href={href}
        className={`inline-flex items-center transition-opacity hover:opacity-80 ${className}`}
        aria-label="AI Knowledge Hub Home"
      >
        <LogoContent size={size} showText={showText} />
      </Link>
    );
  }

  return (
    <div className={`inline-flex items-center ${className}`}>
      <LogoContent size={size} showText={showText} />
    </div>
  );
}

export { LogoIcon };

