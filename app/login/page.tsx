import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "AI Knowledge Hub | Login",
  description: "Accedi o registrati per gestire i tuoi contenuti.",
};

export default function LoginPage(): never {
  redirect("/en/login");
}

