// app/providers.tsx
"use client"

import { SidebarProvider } from "@/providers/sidebar-provider"
import { AuthProvider } from "@/context/AuthContext"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SidebarProvider>
        {children}
      </SidebarProvider>
    </AuthProvider>
  )
}