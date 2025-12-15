import { redirect } from "next/navigation";
import { signOut } from "@/app/actions/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/server/supabaseUser";

export default async function DashboardPage(): Promise<JSX.Element> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/login");
  }

  const email = data.user.email ?? "Utente";

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-12">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500">Dashboard</p>
            <h1 className="text-2xl font-semibold text-zinc-900">Ciao, {email}</h1>
          </div>
          <form action={signOut}>
            <Button variant="outline">Logout</Button>
          </form>
        </div>

        <Card className="border-zinc-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-zinc-900">
              Stato account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-zinc-700">
            <p>Autenticato con Supabase Auth.</p>
            <p>Presto qui mostreremo documenti, conversazioni e metriche.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


