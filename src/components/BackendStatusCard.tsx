import { useMutation } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/toast"
import { buildToast, checkDb, checkServer } from "@/logic/backendStatus/backendStatus"

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
