# Convex - Functions (Queries, Mutations, Actions)

## Function Types

| Type | Read DB | Write DB | External APIs | Real-time |
|------|---------|----------|---------------|-----------|
| Query | Yes | No | No | Yes |
| Mutation | Yes | Yes | No | No |
| Action | Via runQuery | Via runMutation | Yes | No |

## Queries

Read-only functions that automatically subscribe to real-time updates.

```typescript
// convex/messages.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("messages").order("desc").take(100);
  },
});

export const getByChannel = query({
  args: { channelId: v.id("channels") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_channel", (q) => q.eq("channel", args.channelId))
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("messages") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
```

## Mutations

Read-write functions that modify the database.

```typescript
// convex/messages.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    body: v.string(),
    channelId: v.id("channels"),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      body: args.body,
      channel: args.channelId,
      createdAt: Date.now(),
    });
    return messageId;
  },
});

export const update = mutation({
  args: {
    id: v.id("messages"),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { body: args.body });
  },
});

export const remove = mutation({
  args: { id: v.id("messages") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
```

## Actions

Can call external APIs and run async operations.

```typescript
// convex/ai.ts
import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const generateResponse = action({
  args: { prompt: v.string() },
  handler: async (ctx, args) => {
    // Call external API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{ role: "user", content: args.prompt }],
      }),
    });

    const data = await response.json();
    const text = data.choices[0].message.content;

    // Save result via mutation
    await ctx.runMutation(api.messages.create, {
      body: text,
      channelId: args.channelId,
    });

    return text;
  },
});
```

## Internal Functions

Functions only callable from other server functions (not from client).

```typescript
// convex/internal.ts
import { internalQuery, internalMutation, internalAction } from "./_generated/server";
import { v } from "convex/values";

export const getSecretData = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const processPayment = internalMutation({
  args: { orderId: v.id("orders"), amount: v.number() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, { paid: true, amount: args.amount });
  },
});
```

### Calling Internal Functions

```typescript
import { internal } from "./_generated/api";

// From action
await ctx.runMutation(internal.payments.processPayment, { orderId, amount });
await ctx.runQuery(internal.users.getSecretData, { userId });

// From scheduled function
ctx.scheduler.runAfter(0, internal.jobs.processItem, { itemId });
```

## Database Operations

```typescript
// Insert
const id = await ctx.db.insert("messages", { body: "Hello" });

// Get by ID
const message = await ctx.db.get(messageId);

// Update (partial)
await ctx.db.patch(messageId, { body: "Updated" });

// Replace (full)
await ctx.db.replace(messageId, { body: "Replaced", author: userId });

// Delete
await ctx.db.delete(messageId);

// Query all
const all = await ctx.db.query("messages").collect();

// Query with filter
const filtered = await ctx.db
  .query("messages")
  .filter((q) => q.eq(q.field("author"), userId))
  .collect();

// Query with index
const indexed = await ctx.db
  .query("messages")
  .withIndex("by_channel", (q) => q.eq("channel", channelId))
  .order("desc")
  .take(50);

// First match
const first = await ctx.db
  .query("messages")
  .withIndex("by_author", (q) => q.eq("author", userId))
  .first();

// Unique (throws if multiple)
const unique = await ctx.db
  .query("users")
  .withIndex("by_email", (q) => q.eq("email", email))
  .unique();
```

## Context Object

```typescript
// Query/Mutation context
ctx.db              // Database access
ctx.auth            // Authentication info
ctx.storage         // File storage

// Action context (different - no direct db)
ctx.runQuery()      // Call a query
ctx.runMutation()   // Call a mutation
ctx.runAction()     // Call another action
ctx.storage         // File storage
ctx.auth            // Authentication info

// Mutation context extras
ctx.scheduler       // Schedule functions
```

## Scheduling Functions

```typescript
import { mutation } from "./_generated/server";
import { internal } from "./_generated/api";

export const createOrder = mutation({
  args: { items: v.array(v.string()) },
  handler: async (ctx, args) => {
    const orderId = await ctx.db.insert("orders", { items: args.items });

    // Run immediately (after this mutation completes)
    await ctx.scheduler.runAfter(0, internal.orders.sendConfirmation, { orderId });

    // Run in 1 hour
    await ctx.scheduler.runAfter(60 * 60 * 1000, internal.orders.checkPayment, { orderId });

    // Run at specific time
    const tomorrow = Date.now() + 24 * 60 * 60 * 1000;
    await ctx.scheduler.runAt(tomorrow, internal.orders.sendReminder, { orderId });

    return orderId;
  },
});
```

## Helper Patterns

### Reusable Query Logic

```typescript
// convex/lib/queries.ts
import { QueryCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export async function getUserOrThrow(ctx: QueryCtx, userId: Id<"users">) {
  const user = await ctx.db.get(userId);
  if (!user) throw new Error("User not found");
  return user;
}

// Usage in query
export const getProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await getUserOrThrow(ctx, args.userId);
  },
});
```

### Type-safe Args

```typescript
// Define reusable validators
const messageArgs = {
  body: v.string(),
  channelId: v.id("channels"),
};

export const create = mutation({
  args: messageArgs,
  handler: async (ctx, args) => {
    // args is typed as { body: string; channelId: Id<"channels"> }
  },
});
```

---
*Generated from Exa search on 2026-01-09*
