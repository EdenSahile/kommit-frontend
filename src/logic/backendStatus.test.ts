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
    const fetchImpl = fakeFetch({ ok: true, status: 200 })
    const result = await checkServer("http://localhost:3000", fetchImpl)
    expect(fetchImpl).toHaveBeenCalledWith("http://localhost:3000/")
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
    const fetchImpl = fakeFetch({ ok: true, status: 200 })
    const result = await checkDb("http://localhost:3000", fetchImpl)
    expect(fetchImpl).toHaveBeenCalledWith("http://localhost:3000/db-health")
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
