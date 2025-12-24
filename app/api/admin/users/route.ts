import { NextResponse } from "next/server";
import { z } from "zod";
import { isSuperAdmin, requireSessionUser } from "@/lib/server/auth";
import { listAllUsers, updateUserRole, setUserBan, deleteUserWithCascade } from "@/lib/server/adminUsers";
import { logError } from "@/lib/server/logger";

export const dynamic = "force-dynamic";

const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("list") }),
  z.object({ action: z.literal("promote"), userId: z.string().uuid() }),
  z.object({ action: z.literal("demote"), userId: z.string().uuid() }),
  z.object({ action: z.literal("disable"), userId: z.string().uuid() }),
  z.object({ action: z.literal("enable"), userId: z.string().uuid() }),
  z.object({ action: z.literal("delete"), userId: z.string().uuid() }),
]);

export async function POST(request: Request) {
  const user = await requireSessionUser();
  if (!isSuperAdmin(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const payload = parsed.data;

  try {
    switch (payload.action) {
      case "list": {
        const users = await listAllUsers();
        return NextResponse.json({ users });
      }
      case "promote": {
        await updateUserRole(payload.userId, "ORG_ADMIN");
        return NextResponse.json({ ok: true });
      }
      case "demote": {
        await updateUserRole(payload.userId, null);
        return NextResponse.json({ ok: true });
      }
      case "disable": {
        await setUserBan(payload.userId, true);
        return NextResponse.json({ ok: true });
      }
      case "enable": {
        await setUserBan(payload.userId, false);
        return NextResponse.json({ ok: true });
      }
      case "delete": {
        await deleteUserWithCascade(payload.userId);
        return NextResponse.json({ ok: true });
      }
      default:
        return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
    }
  } catch (error) {
    logError("admin.users.action failed", { error: (error as Error).message });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

