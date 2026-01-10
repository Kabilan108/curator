# Convex - Database Schema

## Defining a Schema

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
  }),
  messages: defineTable({
    author: v.id("users"),
    body: v.string(),
    channel: v.id("channels"),
  }),
  channels: defineTable({
    name: v.string(),
  }),
});
```

## Value Validators

```typescript
import { v } from "convex/values";

// Primitives
v.string()              // string
v.number()              // number (float64)
v.boolean()             // boolean
v.int64()               // 64-bit integer
v.float64()             // 64-bit float
v.bytes()               // ArrayBuffer

// Special
v.id("tableName")       // Document ID reference
v.null()                // null value
v.any()                 // any value (avoid if possible)

// Optional
v.optional(v.string())  // string | undefined

// Compound
v.array(v.string())                      // string[]
v.object({ name: v.string() })           // { name: string }
v.union(v.string(), v.number())          // string | number
v.literal("active")                      // "active"
```

## Indexes

Indexes speed up queries on specific fields.

```typescript
export default defineSchema({
  messages: defineTable({
    author: v.id("users"),
    body: v.string(),
    channel: v.id("channels"),
    createdAt: v.number(),
  })
    .index("by_channel", ["channel"])
    .index("by_channel_created", ["channel", "createdAt"])
    .index("by_author", ["author"]),
});
```

### Using Indexes in Queries

```typescript
// Query using an index
const messages = await ctx.db
  .query("messages")
  .withIndex("by_channel", (q) => q.eq("channel", channelId))
  .order("desc")
  .take(50);
```

## Search Indexes

Full-text search on string fields.

```typescript
export default defineSchema({
  articles: defineTable({
    title: v.string(),
    body: v.string(),
    category: v.string(),
  }).searchIndex("search_body", {
    searchField: "body",
    filterFields: ["category"],
  }),
});
```

### Using Search

```typescript
const results = await ctx.db
  .query("articles")
  .withSearchIndex("search_body", (q) =>
    q.search("body", "convex database").eq("category", "tech")
  )
  .take(10);
```

## Vector Indexes

For similarity search with embeddings.

```typescript
export default defineSchema({
  documents: defineTable({
    embedding: v.array(v.number()),
    text: v.string(),
    metadata: v.any(),
  }).vectorIndex("by_embedding", {
    vectorField: "embedding",
    dimensions: 1536,
  }),
});
```

## Generated Types

After defining schema, Convex generates types in `convex/_generated/dataModel.d.ts`:

```typescript
// Use in your functions
import { Doc, Id } from "./_generated/dataModel";

// Doc<"tableName"> - full document type with _id and _creationTime
type User = Doc<"users">;

// Id<"tableName"> - document ID type
type UserId = Id<"users">;
```

## Common Patterns

### Timestamps

```typescript
// Convex auto-adds _creationTime, but for custom timestamps:
messages: defineTable({
  body: v.string(),
  createdAt: v.number(),  // Date.now()
  updatedAt: v.optional(v.number()),
}),

// In mutation
await ctx.db.insert("messages", {
  body: args.body,
  createdAt: Date.now(),
});
```

### Soft Delete

```typescript
items: defineTable({
  name: v.string(),
  deletedAt: v.optional(v.number()),
}).index("by_deleted", ["deletedAt"]),

// Query only non-deleted
const items = await ctx.db
  .query("items")
  .withIndex("by_deleted", (q) => q.eq("deletedAt", undefined))
  .collect();
```

### Enums with Unions

```typescript
tasks: defineTable({
  title: v.string(),
  status: v.union(
    v.literal("pending"),
    v.literal("in_progress"),
    v.literal("completed")
  ),
}),
```

### Nested Objects

```typescript
users: defineTable({
  name: v.string(),
  address: v.object({
    street: v.string(),
    city: v.string(),
    zip: v.string(),
    country: v.optional(v.string()),
  }),
}),
```

### Relations via IDs

```typescript
// One-to-many: Post has many comments
posts: defineTable({
  title: v.string(),
  body: v.string(),
}),
comments: defineTable({
  postId: v.id("posts"),
  body: v.string(),
}).index("by_post", ["postId"]),

// Many-to-many: Users and Tags through junction table
users: defineTable({ name: v.string() }),
tags: defineTable({ name: v.string() }),
userTags: defineTable({
  userId: v.id("users"),
  tagId: v.id("tags"),
})
  .index("by_user", ["userId"])
  .index("by_tag", ["tagId"]),
```

---
*Generated from Exa search on 2026-01-09*
