import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/utils";

function Label(
  {
    className,
    ...props
  }: React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>,
  ref: React.Ref<Element>,
): JSX.Element {
  return (
    <LabelPrimitive.Root
      ref={ref}
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className,
      )}
      {...props}
    />
  );
}

const ForwardedLabel = React.forwardRef(Label);
ForwardedLabel.displayName = "Label";

export { ForwardedLabel as Label };


