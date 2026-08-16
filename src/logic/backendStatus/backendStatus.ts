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
