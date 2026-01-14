"use client"

import { AuthProvider } from "@/components/providers/auth-provider"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { useAuth } from "@/components/providers/auth-provider"
import LogoStorm from "@/components/LogoSstorm"

function PrivateShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) return null

  if (!user) {
    // eslint-disable-next-line react-hooks/immutability
    window.location.href = "/login"
    return null
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />

        <SidebarInset className="flex flex-col w-full">
          <header className="flex h-16 items-center justify-center border-b px-6">
            <SidebarTrigger className="cursor-pointer dark:hover:bg-primary hover:bg-primary" />
            <LogoStorm />
          </header>

          <main className="flex-1 overflow-y-auto p-6 bg-muted/10">
            {children}
          </main>

          <Toaster richColors position="top-right" />
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <PrivateShell>{children}</PrivateShell>
    </AuthProvider>
  )
}
