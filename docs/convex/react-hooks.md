# Convex - React Hooks

## useQuery

Subscribes to real-time data. Re-renders when data changes.

```tsx
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

function MessageList({ channelId }: { channelId: Id<"channels"> }) {
  // Returns undefined while loading, then the data
  const messages = useQuery(api.messages.getByChannel, { channelId });

  if (messages === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <ul>
      {messages.map((msg) => (
        <li key={msg._id}>{msg.body}</li>
      ))}
    </ul>
  );
}
```

### Conditional Queries

```tsx
// Skip query when condition is false
const messages = useQuery(
  api.messages.getByChannel,
  channelId ? { channelId } : "skip"
);

// Skip when user not authenticated
const profile = useQuery(
  api.users.getProfile,
  userId ? { userId } : "skip"
);
```

## useMutation

Returns a function to call mutations.

```tsx
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

function CreateMessage({ channelId }: { channelId: Id<"channels"> }) {
  const createMessage = useMutation(api.messages.create);
  const [text, setText] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMessage({ body: text, channelId });
    setText("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button type="submit">Send</button>
    </form>
  );
}
```

### With Error Handling

```tsx
function CreateMessage() {
  const createMessage = useMutation(api.messages.create);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    try {
      await createMessage({ body: text, channelId });
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button type="submit" disabled={isPending}>
        {isPending ? "Sending..." : "Send"}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
```

## useAction

For calling actions (external API calls).

```tsx
import { useAction } from "convex/react";
import { api } from "../convex/_generated/api";

function AIChat() {
  const generateResponse = useAction(api.ai.generateResponse);
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateResponse({ prompt: "Hello AI" });
      setResponse(result);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? "Generating..." : "Generate"}
      </button>
      {response && <p>{response}</p>}
    </div>
  );
}
```

## useConvex

Direct access to the Convex client for imperative calls.

```tsx
import { useConvex } from "convex/react";
import { api } from "../convex/_generated/api";

function SearchComponent() {
  const convex = useConvex();
  const [results, setResults] = useState([]);

  const handleSearch = async (query: string) => {
    // One-off query, not subscribed
    const data = await convex.query(api.search.find, { query });
    setResults(data);
  };

  return <input onChange={(e) => handleSearch(e.target.value)} />;
}
```

## Authentication Helpers

```tsx
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";

function App() {
  return (
    <>
      <AuthLoading>
        <div>Loading auth...</div>
      </AuthLoading>
      <Authenticated>
        <MainApp />
      </Authenticated>
      <Unauthenticated>
        <LoginPage />
      </Unauthenticated>
    </>
  );
}
```

### useConvexAuth

```tsx
import { useConvexAuth } from "convex/react";

function Header() {
  const { isLoading, isAuthenticated } = useConvexAuth();

  if (isLoading) return <div>Loading...</div>;

  return (
    <header>
      {isAuthenticated ? <UserMenu /> : <LoginButton />}
    </header>
  );
}
```

## usePaginatedQuery

For paginated data loading.

```tsx
import { usePaginatedQuery } from "convex/react";
import { api } from "../convex/_generated/api";

function MessageList() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.messages.listPaginated,
    {},
    { initialNumItems: 20 }
  );

  return (
    <div>
      {results.map((msg) => (
        <div key={msg._id}>{msg.body}</div>
      ))}
      {status === "CanLoadMore" && (
        <button onClick={() => loadMore(20)}>Load More</button>
      )}
      {status === "LoadingMore" && <div>Loading...</div>}
      {status === "Exhausted" && <div>No more messages</div>}
    </div>
  );
}
```

### Paginated Query Backend

```typescript
// convex/messages.ts
import { paginationOptsValidator } from "convex/server";

export const listPaginated = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});
```

## TanStack Query Integration

For more control over caching and loading states.

```tsx
import { useQuery, useMutation } from "@tanstack/react-query";
import { useConvexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "../convex/_generated/api";

function Component() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["messages", channelId],
    queryFn: useConvexQuery(api.messages.getByChannel, { channelId }),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: useConvexMutation(api.messages.create),
  });

  return (
    <div>
      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      {data?.map((msg) => <div key={msg._id}>{msg.body}</div>)}
      <button onClick={() => mutate({ body: "Hello" })} disabled={isPending}>
        Send
      </button>
    </div>
  );
}
```

## Common Patterns

### Loading State Helper

```tsx
function useQueryWithLoading<T>(query: T | undefined) {
  return {
    data: query,
    isLoading: query === undefined,
    isReady: query !== undefined,
  };
}

// Usage
const { data: messages, isLoading } = useQueryWithLoading(
  useQuery(api.messages.list)
);
```

### Optimistic Updates

```tsx
function TaskItem({ task }: { task: Doc<"tasks"> }) {
  const toggleComplete = useMutation(api.tasks.toggleComplete);
  const [optimisticComplete, setOptimisticComplete] = useState<boolean | null>(null);

  const handleToggle = async () => {
    const newValue = !task.isCompleted;
    setOptimisticComplete(newValue);
    try {
      await toggleComplete({ id: task._id });
    } catch {
      setOptimisticComplete(null); // Revert on error
    }
  };

  const isCompleted = optimisticComplete ?? task.isCompleted;

  return (
    <div onClick={handleToggle}>
      {isCompleted ? "✓" : "○"} {task.text}
    </div>
  );
}
```

### Debounced Search

```tsx
function Search() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const results = useQuery(
    api.search.find,
    debouncedQuery ? { query: debouncedQuery } : "skip"
  );

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      {results?.map((r) => <div key={r._id}>{r.title}</div>)}
    </div>
  );
}
```

---
*Generated from Exa search on 2026-01-09*
