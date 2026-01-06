// components/admin/AdminStats/TopOrganizations.tsx
import type { JSX } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TopOrganization } from "./types";

type TopOrganizationsProps = {
  title: string;
  organizations: TopOrganization[];
  labels: {
    orgName: string;
    membersLabel: string;
    docs: string;
    chats: string;
    sops: string;
    plan: string;
    total: string;
  };
  noDataLabel: string;
};

export function TopOrganizations({
  title,
  organizations,
  labels,
  noDataLabel,
}: TopOrganizationsProps): JSX.Element {
  if (organizations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground">{noDataLabel}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">{labels.orgName}</TableHead>
                <TableHead className="text-right">{labels.membersLabel}</TableHead>
                <TableHead className="text-right">{labels.docs}</TableHead>
                <TableHead className="text-right">{labels.chats}</TableHead>
                <TableHead className="text-right">{labels.sops}</TableHead>
                <TableHead className="text-right">{labels.total}</TableHead>
                <TableHead>{labels.plan}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organizations.map((org) => {
                const total = org.documentCount + org.conversationCount + org.procedureCount;
                return (
                  <TableRow key={org.id}>
                    <TableCell className="font-medium">{org.name}</TableCell>
                    <TableCell className="text-right">{org.memberCount}</TableCell>
                    <TableCell className="text-right">{org.documentCount}</TableCell>
                    <TableCell className="text-right">{org.conversationCount}</TableCell>
                    <TableCell className="text-right">{org.procedureCount}</TableCell>
                    <TableCell className="text-right font-semibold">{total}</TableCell>
                    <TableCell>
                      <span className="inline-flex rounded-full bg-muted px-2 py-1 text-xs">
                        {org.plan}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

