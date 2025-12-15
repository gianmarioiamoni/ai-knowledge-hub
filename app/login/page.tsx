import { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "AI Knowledge Hub | Login",
  description: "Accedi o registrati per gestire i tuoi contenuti.",
};

export default function LoginPage(): JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-zinc-100 px-4 py-12">
      <div className="w-full max-w-lg">
        <AuthForm />
      </div>
    </div>
  );
}


