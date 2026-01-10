# Convex - Getting Started with Vite + React

## Installation

```bash
# Create new Vite + React + Convex project
npm create convex@latest

# Or add to existing Vite project
npm install convex
npx convex init
```

## Setup with Bun

```bash
# Install dependencies
bun install convex

# Initialize Convex
bunx convex init

# Start dev server
bunx convex dev
```

## Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
```

## Environment Variables

```bash
# .env.local
VITE_CONVEX_URL=https://your-project.convex.cloud
```

## Provider Setup

```tsx
// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import App from "./App";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConvexProvider client={convex}>
      <App />
    </ConvexProvider>
  </React.StrictMode>
);
```

## Basic Schema

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tasks: defineTable({
    text: v.string(),
    isCompleted: v.boolean(),
  }),
});
```

## Basic Query

```typescript
// convex/tasks.ts
import { query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tasks").collect();
  },
});
```

## Basic Mutation

```typescript
// convex/tasks.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tasks", {
      text: args.text,
      isCompleted: false,
    });
  },
});
```

## Using in React Component

```tsx
// src/App.tsx
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

function App() {
  const tasks = useQuery(api.tasks.list);
  const createTask = useMutation(api.tasks.create);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    await createTask({ text: formData.get("text") as string });
    form.reset();
  };

  if (tasks === undefined) return <div>Loading...</div>;

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input name="text" placeholder="New task..." />
        <button type="submit">Add</button>
      </form>
      <ul>
        {tasks.map((task) => (
          <li key={task._id}>{task.text}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
```

## Development Workflow

```bash
# Terminal 1: Run Convex dev server
npx convex dev

# Terminal 2: Run Vite dev server
npm run dev
```

The Convex dev server:
- Watches `convex/` directory for changes
- Syncs schema and functions to the cloud
- Generates TypeScript types in `convex/_generated/`

---
*Generated from Exa search on 2026-01-09*
