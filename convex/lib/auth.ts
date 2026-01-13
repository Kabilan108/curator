import type { QueryCtx, MutationCtx } from "../_generated/server";

export async function getAuthUserId(
  ctx: QueryCtx | MutationCtx,
): Promise<string | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  return identity.subject;
}

export async function requireAuthUserId(
  ctx: QueryCtx | MutationCtx,
): Promise<string> {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Not authenticated");
  }
  return userId;
}
