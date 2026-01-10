# Convex - Backend as a Service

Convex is a reactive backend platform that provides a database, serverless functions, and real-time subscriptions out of the box. It's designed for TypeScript-first development with end-to-end type safety.

## Quick Reference

```bash
# Create new project
npm create convex@latest

# Start dev server (runs alongside your frontend)
npx convex dev

# Deploy to production
npx convex deploy

# Set environment variables
npx convex env set MY_VAR "value"

# Run a function manually
npx convex run myModule:myFunction
```

## Project Structure

```
my-app/
├── convex/
│   ├── _generated/       # Auto-generated types and API
│   │   ├── api.d.ts
│   │   ├── dataModel.d.ts
│   │   └── server.d.ts
│   ├── schema.ts         # Database schema definition
│   ├── functions.ts      # Your queries, mutations, actions
│   └── http.ts           # HTTP endpoints (optional)
├── src/
│   └── ...               # Your React app
└── convex.json           # Convex configuration
```

## Core Concepts

| Concept | Description |
|---------|-------------|
| **Query** | Read-only function, subscribes to real-time updates |
| **Mutation** | Read-write function, modifies database |
| **Action** | Can call external APIs, run async code |
| **Schema** | TypeScript-defined database structure |
| **Index** | Speed up queries on specific fields |

## Key Imports

```typescript
// Server-side (convex/ directory)
import { query, mutation, action, internalQuery, internalMutation, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { defineSchema, defineTable } from "convex/server";
import { Doc, Id } from "./_generated/dataModel";
import { api, internal } from "./_generated/api";

// Client-side (React)
import { useQuery, useMutation, useAction } from "convex/react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { api } from "../convex/_generated/api";
```

## Links

- [Official Docs](https://docs.convex.dev)
- [Stack (Blog)](https://stack.convex.dev)
- [Discord](https://convex.dev/community)

---
*Generated from Exa search on 2026-01-09*
