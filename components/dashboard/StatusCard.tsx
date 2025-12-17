import { JSX, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StatusCardProps = {
  title: string;
  children: ReactNode;
};

function StatusCard({ title, children }: StatusCardProps): JSX.Element {
  return (
    <Card className="border-zinc-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-zinc-900">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-zinc-700">{children}</CardContent>
    </Card>
  );
}

export { StatusCard };

