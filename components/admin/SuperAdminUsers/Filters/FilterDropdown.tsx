import type { JSX, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

type FilterOption = {
  value: string;
  label: string | ReactNode;
};

type FilterDropdownProps = {
  label: string;
  currentLabel: string;
  options: FilterOption[];
  onSelect: (value: string) => void;
};

export function FilterDropdown({
  label,
  currentLabel,
  options,
  onSelect,
}: FilterDropdownProps): JSX.Element {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            {currentLabel}
            <ChevronDown className="ml-2 size-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          {options.map((option) => (
            <DropdownMenuItem key={option.value} onClick={() => onSelect(option.value)}>
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

