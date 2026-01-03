import { JSX } from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { signOut } from "@/app/actions/auth";

type LogoutButtonProps = {
  label: string;
  variant?: "default" | "outline" | "ghost";
  showIcon?: boolean;
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
};

export function LogoutButton({ 
  label, 
  variant = "outline", 
  showIcon = false,
  size = "default",
  className = ""
}: LogoutButtonProps): JSX.Element {
  return (
    <form action={signOut} className={`flex items-center ${className}`}>
      <Button variant={variant} size={size} type="submit" className="flex items-center gap-2">
        {showIcon && <LogOut className="size-4" />}
        {label}
      </Button>
    </form>
  );
}
