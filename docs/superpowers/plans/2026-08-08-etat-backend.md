# État du backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the Kommit frontend (strict minimum) and ship a single page with two buttons — "Check serveur" and "Check BDD" — that call the backend and show the result as a toast notification.

**Architecture:** Vite + React + TypeScript SPA, no router yet (one page). TanStack Query drives the two checks as mutations; the fetch + result-formatting logic is pure and lives in `src/logic/`, tested with Vitest. shadcn/ui (Base UI flavor) supplies Button, Card, and Toast.

**Tech Stack:** Vite, React 19, TypeScript, Tailwind CSS v4, shadcn/ui (Base UI), TanStack Query, Vitest, pnpm.

## Global Constraints

- Package manager is **pnpm** everywhere — never `npm`/`yarn`, never touch `package-lock.json`/`yarn.lock`.
- Import alias **`@/` = `src/`** for any cross-folder import; `./` only for a same-folder neighbor; never `../`.
- **One component per file**, default export, file named after the component.
- Icons, if any are needed, come **only from `lucide-react`** — no hand-written SVG, no emoji.
- Business logic lives in **`src/logic/`, pure functions, zero React imports**, tested with **Vitest**, colocated as `<name>.test.ts`.
- No RTL component test for the button→toast wiring in this iteration — it's the page's critical path, so it's covered by a Playwright e2e later, not a component test now.
- After `pnpm dlx shadcn@latest add <component>`, the component lands in `src/components/ui/` and belongs to us — restyle from design tokens if it looks generic (not required for this plan's minimal UI, but don't leave obviously wrong colors).
- Install only what this plan needs: Vite, React, TypeScript, Tailwind, shadcn/ui (Button, Card, Toast), TanStack Query, Vitest. Do **not** add Zod, React Router, Playwright, or any CI/CD config — out of scope for this iteration.

---

### Task 1: Scaffold the Vite + React + TypeScript project with Tailwind v4

**Files:**
- Create: `package.json`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`, `src/vite-env.d.ts`
- Modify: `.gitignore` (already has `node_modules/`, `dist/`, `build/`, `.env`, `.env.local` — no change expected, just confirm after scaffold)

**Interfaces:**
- Produces: a working `pnpm dev` dev server, and the `@/*` → `./src/*` path alias every later task's imports rely on.

- [ ] **Step 1: Scaffold with Vite's React + TypeScript template**

Run from the repo root (`kommit-frontend/`, which already has `.git`, `.claude`, `.vscode`, `.gitignore` — Vite's scaffolder only refuses on *visible* files, so this is safe):

```bash
pnpm create vite@latest . -- --template react-ts
```

If prompted about the directory not being empty, confirm to proceed.

- [ ] **Step 2: Install dependencies**

```bash
pnpm install
```

- [ ] **Step 3: Install Tailwind CSS v4**

```bash
pnpm add tailwindcss @tailwindcss/vite
```

Replace the full contents of `src/index.css` with:

```css
@import "tailwindcss";
```

- [ ] **Step 4: Configure the `@/` path alias**

Edit `tsconfig.json` to this exact content:

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Add to the `compilerOptions` block of `tsconfig.app.json`:

```json
"baseUrl": ".",
"paths": {
  "@/*": ["./src/*"]
}
```

- [ ] **Step 5: Wire the alias into Vite**

```bash
pnpm add -D @types/node
```

Replace `vite.config.ts` with:

```typescript
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

- [ ] **Step 6: Verify the dev server boots**

Run: `pnpm dev`
Expected: Vite prints a local URL (e.g. `http://localhost:5173/`); loading it in a browser shows the default Vite+React starter page with no console errors. Stop the server (Ctrl+C) once confirmed.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite + React + TypeScript project with Tailwind v4"
```

---

### Task 2: Initialize shadcn/ui and add Button, Card, Toast

**Files:**
- Create: `components.json`, `src/lib/utils.ts`, `src/components/ui/button.tsx`, `src/components/ui/card.tsx`, `src/components/ui/toast.tsx` (exact filenames are whatever the `shadcn` CLI generates — record the real paths after running it)

**Interfaces:**
- Consumes: the `@/*` alias from Task 1.
- Produces: `Button` (`@/components/ui/button`), `Card`/`CardHeader`/`CardTitle`/`CardDescription`/`CardContent` (`@/components/ui/card`), `Toaster` and `toast` (`@/components/ui/toast`) — these exact import paths are what Task 5 uses.

- [ ] **Step 1: Initialize shadcn/ui**

```bash
pnpm dlx shadcn@latest init
```

When prompted, accept the defaults (this repo's `components.json` already declares `lucide` as the icon library per `.claude/rules/icones.md` — keep that choice if asked).

- [ ] **Step 2: Add the three components this feature needs**

```bash
pnpm dlx shadcn@latest add button card toast
```

- [ ] **Step 3: Verify the project still builds**

Run: `pnpm build`
Expected: build completes with no TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: add shadcn/ui button, card, and toast components"
```

---

### Task 3: Add TanStack Query and Vitest

**Files:**
- Modify: `package.json` (new deps + `test` script), `src/App.tsx` (wrap in `QueryClientProvider`)
- Create: `vitest.config.ts`

**Interfaces:**
- Produces: `pnpm test` runner (Vitest); a `QueryClientProvider` wrapping the app tree that Task 5's `useMutation` calls rely on.

- [ ] **Step 1: Install TanStack Query**

```bash
pnpm add @tanstack/react-query
```

- [ ] **Step 2: Install Vitest**

```bash
pnpm add -D vitest
```

Create `vitest.config.ts`:

```typescript
import path from "path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
  },
})
```

Add to the `"scripts"` object in `package.json`:

```json
"test": "vitest run"
```

- [ ] **Step 3: Wrap the app in a QueryClientProvider**

Replace the contents of `src/App.tsx` with:

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen items-center justify-center p-4" />
    </QueryClientProvider>
  )
}
```

- [ ] **Step 4: Verify test runner and build both work**

Run: `pnpm test`
Expected: Vitest reports "no test files found" (exit code non-zero is fine here — no tests exist yet) without crashing on config.

Run: `pnpm build`
Expected: build completes with no errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: add TanStack Query and Vitest"
```

---

### Task 4: TDD the pure backend-check logic

**Files:**
- Create: `src/logic/backendStatus.ts`
- Test: `src/logic/backendStatus.test.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks (pure module, only depends on the global `fetch` type).
- Produces (exact names Task 5 imports):
  - `type CheckResult = { ok: true; latencyMs: number } | { ok: false; message: string }`
  - `checkServer(baseUrl: string, fetchImpl?: typeof fetch): Promise<CheckResult>`
  - `checkDb(baseUrl: string, fetchImpl?: typeof fetch): Promise<CheckResult>`
  - `type ToastContent = { type: "success" | "error"; title: string; description: string }`
  - `buildToast(kind: "server" | "db", result: CheckResult): ToastContent`

- [ ] **Step 1: Write the failing tests**

Create `src/logic/backendStatus.test.ts`:

```typescript
import { describe, expect, it, vi } from "vitest"
import { buildToast, checkDb, checkServer } from "./backendStatus"

function fakeFetch(response: Partial<Response> & { ok: boolean; status: number }) {
  return vi.fn().mockResolvedValue(response as Response)
}

function throwingFetch(error: Error) {
  return vi.fn().mockRejectedValue(error)
}

describe("checkServer", () => {
  it("returns ok with a latency when the server responds 200", async () => {
    const result = await checkServer("http://localhost:3000", fakeFetch({ ok: true, status: 200 }))
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(typeof result.latencyMs).toBe("number")
      expect(result.latencyMs).toBeGreaterThanOrEqual(0)
    }
  })

  it("returns not ok when the server responds with a non-2xx status", async () => {
    const result = await checkServer("http://localhost:3000", fakeFetch({ ok: false, status: 500 }))
    expect(result).toEqual({ ok: false, message: "Le serveur a répondu avec le statut 500" })
  })

  it("returns not ok when the request throws (server unreachable)", async () => {
    const result = await checkServer("http://localhost:3000", throwingFetch(new Error("network down")))
    expect(result).toEqual({ ok: false, message: "Le serveur est injoignable" })
  })
})

describe("checkDb", () => {
  it("returns ok with a latency when db-health responds 200", async () => {
    const result = await checkDb("http://localhost:3000", fakeFetch({ ok: true, status: 200 }))
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(typeof result.latencyMs).toBe("number")
    }
  })

  it("returns not ok when db-health responds 503", async () => {
    const result = await checkDb("http://localhost:3000", fakeFetch({ ok: false, status: 503 }))
    expect(result).toEqual({ ok: false, message: "La base de données ne répond pas (statut 503)" })
  })

  it("returns not ok when the request throws (db unreachable)", async () => {
    const result = await checkDb("http://localhost:3000", throwingFetch(new Error("network down")))
    expect(result).toEqual({ ok: false, message: "La base de données est injoignable" })
  })
})

describe("buildToast", () => {
  it("builds a success toast for the server check", () => {
    expect(buildToast("server", { ok: true, latencyMs: 42 })).toEqual({
      type: "success",
      title: "Serveur opérationnel",
      description: "Répond en 42ms",
    })
  })

  it("builds a success toast for the db check", () => {
    expect(buildToast("db", { ok: true, latencyMs: 156 })).toEqual({
      type: "success",
      title: "Base de données opérationnelle",
      description: "Répond en 156ms",
    })
  })

  it("builds an error toast for the server check", () => {
    expect(buildToast("server", { ok: false, message: "Le serveur est injoignable" })).toEqual({
      type: "error",
      title: "Panne du serveur",
      description: "Le serveur est injoignable",
    })
  })

  it("builds an error toast for the db check", () => {
    expect(buildToast("db", { ok: false, message: "La base de données ne répond pas (statut 503)" })).toEqual({
      type: "error",
      title: "Panne de la base de données",
      description: "La base de données ne répond pas (statut 503)",
    })
  })
})
```

- [ ] **Step 2: Run the tests and verify they fail**

Run: `pnpm test`
Expected: FAIL — `src/logic/backendStatus.ts` does not exist yet ("Cannot find module './backendStatus'" or similar).

- [ ] **Step 3: Implement the minimal logic to pass**

Create `src/logic/backendStatus.ts`:

```typescript
export type CheckResult = { ok: true; latencyMs: number } | { ok: false; message: string }

export type ToastContent = { type: "success" | "error"; title: string; description: string }

async function timedCheck(
  url: string,
  fetchImpl: typeof fetch,
  unreachableMessage: string,
  errorMessage: (status: number) => string,
): Promise<CheckResult> {
  const start = performance.now()
  try {
    const response = await fetchImpl(url)
    const latencyMs = Math.round(performance.now() - start)
    if (!response.ok) {
      return { ok: false, message: errorMessage(response.status) }
    }
    return { ok: true, latencyMs }
  } catch {
    return { ok: false, message: unreachableMessage }
  }
}

export function checkServer(baseUrl: string, fetchImpl: typeof fetch = fetch): Promise<CheckResult> {
  return timedCheck(
    `${baseUrl}/`,
    fetchImpl,
    "Le serveur est injoignable",
    (status) => `Le serveur a répondu avec le statut ${status}`,
  )
}

export function checkDb(baseUrl: string, fetchImpl: typeof fetch = fetch): Promise<CheckResult> {
  return timedCheck(
    `${baseUrl}/db-health`,
    fetchImpl,
    "La base de données est injoignable",
    (status) => `La base de données ne répond pas (statut ${status})`,
  )
}

export function buildToast(kind: "server" | "db", result: CheckResult): ToastContent {
  if (result.ok) {
    return {
      type: "success",
      title: kind === "server" ? "Serveur opérationnel" : "Base de données opérationnelle",
      description: `Répond en ${result.latencyMs}ms`,
    }
  }
  return {
    type: "error",
    title: kind === "server" ? "Panne du serveur" : "Panne de la base de données",
    description: result.message,
  }
}
```

- [ ] **Step 4: Run the tests and verify they pass**

Run: `pnpm test`
Expected: PASS — all 10 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/logic/backendStatus.ts src/logic/backendStatus.test.ts
git commit -m "feat: add pure backend status check logic"
```

---

### Task 5: Build the BackendStatusCard page and wire it up

**Files:**
- Create: `src/components/BackendStatusCard.tsx`, `.env.example`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `checkServer`, `checkDb`, `buildToast`, `CheckResult` from `@/logic/backendStatus` (Task 4); `Button` from `@/components/ui/button`, `Card`/`CardHeader`/`CardTitle`/`CardDescription`/`CardContent` from `@/components/ui/card`, `Toaster`/`toast` from `@/components/ui/toast` (Task 2); `QueryClientProvider` already wired in `App.tsx` (Task 3).
- Produces: the finished page — no later task depends on this one.

- [ ] **Step 1: Add the API base URL env var**

Create `.env.example`:

```
VITE_API_URL=http://localhost:3000
```

- [ ] **Step 2: Create the card component**

Create `src/components/BackendStatusCard.tsx`:

```tsx
import { useMutation } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/toast"
import { buildToast, checkDb, checkServer } from "@/logic/backendStatus"

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000"

export default function BackendStatusCard() {
  const serverCheck = useMutation({
    mutationFn: () => checkServer(API_BASE_URL),
    onSuccess: (result) => toast.add(buildToast("server", result)),
  })

  const dbCheck = useMutation({
    mutationFn: () => checkDb(API_BASE_URL),
    onSuccess: (result) => toast.add(buildToast("db", result)),
  })

  return (
    <Card className="mx-auto w-full max-w-xl text-center">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Kommit</CardTitle>
        <CardDescription>État du backend</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center gap-2">
        <Button onClick={() => serverCheck.mutate()} disabled={serverCheck.isPending}>
          Check serveur
        </Button>
        <Button variant="outline" onClick={() => dbCheck.mutate()} disabled={dbCheck.isPending}>
          Check BDD
        </Button>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 3: Wire it into App.tsx**

Replace the contents of `src/App.tsx` with:

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import BackendStatusCard from "@/components/BackendStatusCard"
import { Toaster } from "@/components/ui/toast"

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen items-center justify-center p-4">
        <BackendStatusCard />
      </div>
      <Toaster />
    </QueryClientProvider>
  )
}
```

- [ ] **Step 4: Run the checks**

Run: `pnpm test` — expected: still all green (no new tests added, none broken).
Run: `pnpm build` — expected: no TypeScript errors.

- [ ] **Step 5: Manual verification against the backend**

1. Copy the env file: `cp .env.example .env.local`
2. In the backend repo (`kommit-backend/`, sibling of this repo), start the dev server: `pnpm dev` (needs a `.env` there with a valid `DATABASE_URL` for `/db-health` to succeed) so `http://localhost:3000` responds.
3. In this repo, run `pnpm dev` and open the printed URL.
4. Click "Check serveur" → expect a green success toast ("Serveur opérationnel", "Répond en …ms").
5. Click "Check BDD" → expect a green success toast ("Base de données opérationnelle", "Répond en …ms").
6. Stop the backend server, click both buttons again → expect red error toasts ("Panne du serveur" / "Panne de la base de données").
7. Compare the toast's position/colors against the mockup (`Image #2` from the design spec) — if the default Toaster position doesn't match (mockup shows bottom-right), adjust the `Toaster` placement via its className/props per the installed Base UI Toast API before moving on.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add backend status check page with server and db buttons"
```

---

## Out of scope (do not add in this plan)

Zod, React Router, Playwright e2e, CI/CD (Vercel/Render/GitHub Actions config). Add each only when a later task actually needs it.
