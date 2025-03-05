"use client"
import NotificationMenu from "./NotifcationMenu/page";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, User, LogOut, Menu, Bell } from "lucide-react";  // Add Bell icon for notifications
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { CalendarIcon, ChatBubbleLeftEllipsisIcon, UsersIcon, RocketLaunchIcon } from "@heroicons/react/24/solid";

// Liste des items du menu, incluant maintenant les fonctionnalités
const menuItems = [
  { label: "Tableau de bord", href: "/front-office", icon: <LayoutDashboard className="h-5 w-5" /> },
  { 
    label: "Événements", 
    href: "/front-office/events", 
    icon: <CalendarIcon className="h-5 w-5" />,
  },
  { 
    label: "Réseau Social", 
    href: "/front-office/social", 
    icon: <UsersIcon className="h-5 w-5" />,
  },
  { 
    label: "Carrière", 
    href: "/front-office/career", 
    icon: <RocketLaunchIcon className="h-5 w-5" />,
  },
];

export default function FrontOfficeLayout({ children }: { children: React.ReactNode }) {
  const { userRole, logout } = useAuth();
  const router = useRouter();

  return (
    <div className="flex h-screen bg-ey-light-gray">
      {/* Sidebar for desktop */}
      <div className={cn("hidden md:block bg-ey-black text-white transition-all duration-300 ease-in-out w-64")}>
        <div className="flex h-full flex-col">
          <div className="p-4 flex items-center space-x-2">
            <div className="w-10 h-10">{/* SVG Logo */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="currentColor" className="text-ey-yellow">
                <path d="M10 80 L90 20 L80 10 L10 70 Z" />
              </svg>
            </div>
            <span className="text-ey-yellow text-xl font-bold">EY Engage</span>
          </div>

          <nav className="flex-1 space-y-2 px-2">
            {menuItems.map((item, index) => (
              <Button 
                key={index} 
                variant="ghost" 
                className={`w-full justify-start text-ey-white hover:bg-ey-dark-gray hover:text-ey-yellow `}
                onClick={() => router.push(item.href)}
              >
                {item.icon}
                <span className="ml-2">{item.label}</span>
              </Button>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="outline" size="icon" className="fixed top-4 left-4 z-50 bg-ey-yellow text-black hover:bg-ey-dark-yellow">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="bg-ey-black text-white">
          <div className="p-4 flex items-center space-x-2">
            <div className="w-10 h-10">{/* SVG Logo */}
            <svg width="69" height="70" viewBox="0 0 69 70" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_682_22287)">
                <path fillRule="evenodd" clipRule="evenodd" d="M11.09 61.4H28.46V69.32H0.669983V34.9H20.37L24.98 42.82H11.1V48.5H23.66V55.72H11.1V61.4H11.09ZM46.94 34.9L41.04 46.13L35.16 34.9H23.64L35.77 55.72V69.32H46.17V55.72L58.3 34.9H46.94Z" fill="white"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M68.67 12.81V0L0 24.83L68.67 12.81Z" fill="#FFE600"/>
              </g>
            </svg>
            </div>
            <span className="text-ey-yellow text-xl font-bold">EY Engage</span>
          </div>
          <nav className="flex flex-col space-y-4 mt-8">
            {menuItems.map((item, index) => (
              <Button 
                key={index} 
                variant="ghost" 
                className={`justify-start text-ey-white hover:bg-ey-dark-gray hover:text-ey-yellow `}
                onClick={() => router.push(item.href)}
              >
                {item.icon}
                <span className="ml-2">{item.label}</span>
              </Button>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-ey-black border-b border-ey-light-gray p-4 flex items-center justify-end gap-4">
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => router.push("/front-office/profile")}
              variant="ghost"
              className="text-ey-white hover:bg-ey-dark-gray hover:text-ey-yellow"
            >
              <User className="h-4 w-4 mr-2" />
              Profil
            </Button>
            {/* Notification Icon Button */}
            <NotificationMenu />
            <Button 
              onClick={logout}
              className="bg-ey-yellow hover:bg-ey-dark-yellow text-black"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6 bg-ey-light-gray">{children}</main>

        {/* Footer */}
        <footer className="bg-ey-black text-ey-white p-4 border-t border-ey-light-gray">
          <div className="container mx-auto text-center text-sm">
            <span className="text-ey-yellow font-semibold">EY Engage</span> • Plateforme collaborative © {new Date().getFullYear()} EY
          </div>
        </footer>
      </div>
    </div>
  );
}
