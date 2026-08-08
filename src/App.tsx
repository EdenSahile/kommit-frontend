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
