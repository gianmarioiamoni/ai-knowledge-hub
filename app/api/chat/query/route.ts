import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServiceClient } from "@/lib/server/supabaseService";
import { createSupabaseServerClient } from "@/lib/server/supabaseUser";
import { embedQuery, searchSimilarChunks } from "@/lib/server/rag";

const bodySchema = z.object({
  query: z.string().min(4, "Query too short"),
});

export async function POST(request: Request): Promise<NextResponse> {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }

  const supabase = createSupabaseServerClient(false);
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const service = createSupabaseServiceClient();
  const { data: membership } = await service
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userData.user.id)
    .limit(1)
    .maybeSingle();

  if (!membership?.organization_id) {
    return NextResponse.json({ error: "No organization found" }, { status: 403 });
  }

  const embedding = await embedQuery(parsed.data.query);
  const chunks = await searchSimilarChunks(membership.organization_id, embedding, 6);

  return NextResponse.json({ chunks });
}

