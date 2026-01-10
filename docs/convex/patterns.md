# Convex - Common Patterns

## Authentication with Clerk

### Setup

```bash
npm install @clerk/clerk-react
```

### Provider Configuration

```tsx
// src/main.tsx
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      <App />
    </ConvexProviderWithClerk>
  </ClerkProvider>
);
```

### Auth in Functions

```typescript
// convex/messages.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const send = mutation({
  args: { body: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("messages", {
      body: args.body,
      author: identity.subject, // Clerk user ID
      authorName: identity.name,
    });
  },
});

export const getForCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    return await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("author"), identity.subject))
      .collect();
  },
});
```

### React Auth Components

```tsx
import { Authenticated, Unauthenticated } from "convex/react";
import { SignInButton, UserButton } from "@clerk/clerk-react";

function App() {
  return (
    <>
      <Authenticated>
        <UserButton />
        <MainContent />
      </Authenticated>
      <Unauthenticated>
        <SignInButton />
      </Unauthenticated>
    </>
  );
}
```

## File Storage

### Upload from Client

```typescript
// convex/files.ts
import { mutation } from "./_generated/server";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
```

```tsx
// React component
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

function FileUpload() {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const saveFile = useMutation(api.files.saveFile);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Get upload URL
    const uploadUrl = await generateUploadUrl();

    // Upload file
    const result = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });

    const { storageId } = await result.json();

    // Save reference in database
    await saveFile({ storageId, name: file.name });
  };

  return <input type="file" onChange={handleUpload} />;
}
```

### Store File Reference

```typescript
// convex/files.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const saveFile = mutation({
  args: {
    storageId: v.id("_storage"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("files", {
      storageId: args.storageId,
      name: args.name,
    });
  },
});

export const getFileUrl = query({
  args: { fileId: v.id("files") },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.fileId);
    if (!file) return null;
    return await ctx.storage.getUrl(file.storageId);
  },
});
```

### Store from Action

```typescript
// convex/images.ts
import { action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const downloadAndStore = action({
  args: { imageUrl: v.string() },
  handler: async (ctx, args) => {
    const response = await fetch(args.imageUrl);
    const blob = await response.blob();
    const storageId = await ctx.storage.store(blob);

    await ctx.runMutation(internal.images.saveImage, { storageId });
    return storageId;
  },
});

export const saveImage = internalMutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    await ctx.db.insert("images", { storageId: args.storageId });
  },
});
```

## Cron Jobs

```typescript
// convex/crons.ts
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Every minute
crons.interval(
  "cleanup old data",
  { minutes: 1 },
  internal.cleanup.removeOldRecords
);

// Every hour
crons.interval(
  "sync external data",
  { hours: 1 },
  internal.sync.fetchExternalData
);

// Daily at midnight UTC
crons.daily(
  "daily report",
  { hourUTC: 0, minuteUTC: 0 },
  internal.reports.generateDaily
);

// Monthly on the 1st at 9am UTC
crons.monthly(
  "monthly invoice",
  { day: 1, hourUTC: 9, minuteUTC: 0 },
  internal.billing.sendInvoices
);

// Cron expression (every weekday at 9am)
crons.cron(
  "weekday reminder",
  "0 9 * * 1-5",
  internal.notifications.sendReminder
);

export default crons;
```

## HTTP Endpoints

```typescript
// convex/http.ts
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// Webhook handler
http.route({
  path: "/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();

    await ctx.runMutation(api.webhooks.process, { data: body });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// API endpoint
http.route({
  path: "/api/items",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const items = await ctx.runQuery(api.items.list);

    return new Response(JSON.stringify(items), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }),
});

// Path parameters
http.route({
  pathPrefix: "/api/items/",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const id = url.pathname.replace("/api/items/", "");

    const item = await ctx.runQuery(api.items.get, { id });

    if (!item) {
      return new Response("Not found", { status: 404 });
    }

    return new Response(JSON.stringify(item), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
```

## Scheduled Functions

```typescript
// convex/orders.ts
import { mutation, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const create = mutation({
  args: { items: v.array(v.string()) },
  handler: async (ctx, args) => {
    const orderId = await ctx.db.insert("orders", {
      items: args.items,
      status: "pending",
    });

    // Send confirmation immediately
    await ctx.scheduler.runAfter(0, internal.orders.sendConfirmation, {
      orderId,
    });

    // Check payment in 1 hour
    await ctx.scheduler.runAfter(
      60 * 60 * 1000,
      internal.orders.checkPayment,
      { orderId }
    );

    // Cancel if not paid in 24 hours
    const cancelId = await ctx.scheduler.runAfter(
      24 * 60 * 60 * 1000,
      internal.orders.cancelUnpaid,
      { orderId }
    );

    // Store scheduled function ID to cancel later if needed
    await ctx.db.patch(orderId, { cancelJobId: cancelId });

    return orderId;
  },
});

export const markPaid = mutation({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");

    // Cancel the scheduled cancellation
    if (order.cancelJobId) {
      await ctx.scheduler.cancel(order.cancelJobId);
    }

    await ctx.db.patch(args.orderId, { status: "paid" });
  },
});
```

## Environment Variables

```bash
# Set via CLI
npx convex env set API_KEY "secret-key"
npx convex env set --prod API_KEY "prod-secret-key"

# List variables
npx convex env list
```

```typescript
// Access in functions
export const callExternalApi = action({
  handler: async () => {
    const apiKey = process.env.API_KEY;
    const response = await fetch("https://api.example.com", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    return response.json();
  },
});
```

## Error Handling

```typescript
// Custom error class
class ConvexError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConvexError";
  }
}

export const createItem = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    if (!args.name.trim()) {
      throw new ConvexError("Name cannot be empty");
    }

    const existing = await ctx.db
      .query("items")
      .filter((q) => q.eq(q.field("name"), args.name))
      .first();

    if (existing) {
      throw new ConvexError("Item already exists");
    }

    return await ctx.db.insert("items", { name: args.name });
  },
});
```

```tsx
// Handle in React
function CreateItem() {
  const create = useMutation(api.items.createItem);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (name: string) => {
    try {
      await create({ name });
      setError(null);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      }
    }
  };

  return (
    <div>
      <form onSubmit={...}>...</form>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
```

---
*Generated from Exa search on 2026-01-09*
