import type { JSX } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

type SearchFilterProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function SearchFilter({ label, value, onChange }: SearchFilterProps): JSX.Element {
  return (
    <div className="space-y-1">
      <Label htmlFor="search" className="text-xs text-muted-foreground">
        {label}
      </Label>
      <div className="relative">
        <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
        <Input
          id="search"
          type="text"
          placeholder="Email..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-8"
        />
      </div>
    </div>
  );
}

