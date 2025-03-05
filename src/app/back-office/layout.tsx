"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import NotificationsPage from "./notifications/page"
import {
  Sheet,
  SheetContent,
  SheetTrigger
} from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Users,
  Calendar,
  BarChart,
  MessageSquare,
  Settings,
  Menu,
  LogOut,
  User as UserIcon,
  User
} from "lucide-react";
import { useSidebar } from "@/providers/sidebar-provider";
import { cn } from "@/lib/utils";

const menuItems = [
  { label: "Dashboard", href: "/back-office", icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: "Utilisateurs", href: "/back-office/users", icon: <Users className="h-5 w-5" />, roles: ["SuperAdmin"] },
  { label: "Événements", href: "/back-office/events/manage", icon: <Calendar className="h-5 w-5" /> },
  { label: "Analytiques", href: "/back-office/events/analytics", icon: <BarChart className="h-5 w-5" />, roles: ["SuperAdmin", "Admin"] },
  { label: "Modération", href: "/back-office/social/moderation", icon: <MessageSquare className="h-5 w-5" />, roles: ["Admin", "AgentEY"] },
  { label: "Paramètres", href: "/back-office/settings", icon: <Settings className="h-5 w-5" /> },
];

export default function BackOfficeLayout({ children }: { children: React.ReactNode }) {
  const { userRole, logout } = useAuth();
  const router = useRouter();
  const { isOpen, toggle } = useSidebar();

  return (
    <div className="flex h-screen">
      {/* Sidebar Desktop */}
      <div className={cn(
        "hidden md:block bg-ey-black text-white transition-all duration-300 ease-in-out",
        isOpen ? "w-64" : "w-20"
      )}>
        <div className="flex h-full flex-col">
          {/* Logo Section */}
          <div className="p-4 flex items-center space-x-2">
            <svg width="69" height="70" viewBox="0 0 69 70" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_682_22287)">
                <path fillRule="evenodd" clipRule="evenodd" d="M11.09 61.4H28.46V69.32H0.669983V34.9H20.37L24.98 42.82H11.1V48.5H23.66V55.72H11.1V61.4H11.09ZM46.94 34.9L41.04 46.13L35.16 34.9H23.64L35.77 55.72V69.32H46.17V55.72L58.3 34.9H46.94Z" fill="white"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M68.67 12.81V0L0 24.83L68.67 12.81Z" fill="#FFE600"/>
              </g>
            </svg>
            {isOpen && <span className="text-ey-yellow text-xl font-bold">EY Engage</span>}
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 px-2">
            {menuItems.map(
              (item, index) =>
                (!item.roles || item.roles.includes(userRole as string)) && (
                  <Button
                    key={index}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-white hover:bg-gray-700",
                      isOpen ? "px-4" : "px-2"
                    )}
                    onClick={() => router.push(item.href)}
                  >
                    {item.icon}
                    {isOpen && <span className="ml-2">{item.label}</span>}
                  </Button>
                )
            )}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-ey-black border-b border-ey-light-gray p-4 flex items-center justify-end">
          <div className="flex items-center gap-4">
            <NotificationsPage />
            <Button 
              onClick={() => router.push("/back-office/profile")}
              variant="ghost"
              className="text-ey-white hover:bg-ey-dark-gray hover:text-ey-yellow"
            >
              <User className="h-4 w-4 mr-2" />
              Profil
            </Button>
            <Button 
              onClick={logout}
              className="bg-ey-yellow hover:bg-ey-dark-yellow text-black"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6 bg-ey-light-gray">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-ey-black text-white py-4">
          <div className="text-center">
            <p>&copy; 2025 EY Engage. Tous droits réservés.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}