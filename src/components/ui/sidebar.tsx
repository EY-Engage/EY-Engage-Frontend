// components/ui/sidebar.tsx
"use client"

import { useSidebar } from "@/providers/sidebar-provider";

export function Sidebar({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar();

  return (
    <aside className={`${isOpen ? "w-64" : "w-20"} transition-all duration-300 fixed h-full`}>
      {children}
    </aside>
  );
}