---
globs: ["*.ts", "*.tsx"]
---

## Linting

After writing TypeScript/TSX code:
1. Run `bun run lint`
2. Review output for errors/warnings
3. Fix all issues
4. Repeat steps 1-3 until clean

## Pushing to Main

Before pushing to `main`:
1. Run `bun run build`
2. Fix any build errors
3. Ensure build completes successfully
4. Only then push to `main`

**Note:** Pushing to `main` triggers automatic deployment to Vercel.
