// app/providers.tsx
"use client"
import { AuthProvider } from "@/context/AuthContext"
import { SidebarProvider } from "@/providers/sidebar-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SidebarProvider>
        {children}
      </SidebarProvider>
    </AuthProvider>
  )
}