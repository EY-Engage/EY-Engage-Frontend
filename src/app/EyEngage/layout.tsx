"use client";
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/ui/sidebar';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, LogOut, User, Bell, CalendarIcon, LayoutDashboard, UsersIcon, Users, BarChart, Calendar, MessageSquare, Settings } from 'lucide-react';
import { useState } from 'react';
import { RocketLaunchIcon } from '@heroicons/react/24/solid';
import { useSidebar } from '@/providers/sidebar-provider';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { SkeletonLoader } from "@/components/SkeletonLoader";

interface NotificationItem {
  id: number;
  text: string;
  read: boolean;
  avatar: string;
}

const menuItems = [
  { label: "Tableau de bord", href: "/EyEngage/EmployeeDashboard", icon: <LayoutDashboard className="h-5 w-5" />, roles: ["EmployeeEY", "SuperAdmin", "Admin", "AgentEY"] },
  { label: "Événements", href: "/EyEngage/EmployeeDashboard/events", icon: <CalendarIcon className="h-5 w-5" />, roles: ["EmployeeEY","SuperAdmin", "Admin", "AgentEY"] },
  { label: "Réseau Social", href: "/EyEngage/EmployeeDashboard/social", icon: <UsersIcon className="h-5 w-5" />, roles: ["EmployeeEY", "SuperAdmin", "Admin", "AgentEY"] },
  { label: "Carrière", href: "/EyEngage/EmployeeDashboard/career", icon: <RocketLaunchIcon className="h-5 w-5" />, roles: ["EmployeeEY", "SuperAdmin", "Admin", "AgentEY"] },
  { label: "Dashboard", href: "/EyEngage/SupervisorDashboard", icon: <LayoutDashboard className="h-5 w-5" />, roles: ["SuperAdmin", "Admin", "AgentEY"] },
  { label: "Utilisateurs", href: "/EyEngage/SupervisorDashboard/users", icon: <Users className="h-5 w-5" />, roles: ["SuperAdmin"] },
  { label: "Événements", href: "/EyEngage/SupervisorDashboard/events/manage", icon: <Calendar className="h-5 w-5" />, roles: ["AgentEY", "Admin"] },
  { label: "Analytiques", href: "/EyEngage/SupervisorDashboard/events/analytics", icon: <BarChart className="h-5 w-5" />, roles: ["SuperAdmin", "Admin"] },
  { label: "Modération", href: "/EyEngage/SupervisorDashboard/social/moderation", icon: <MessageSquare className="h-5 w-5" />, roles: ["Admin", "AgentEY"] },
  { label: "Paramètres", href: "/EyEngage/SupervisorDashboard/settings", icon: <Settings className="h-5 w-5" />, roles: ["SuperAdmin", "Admin"] },
];

export default function EyEngageLayout({ children }: { children: React.ReactNode }) {
  const { logout, userRole, isLoading, isLoggingIn } = useAuth();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { toggle } = useSidebar();
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: 1, text: "Nouveau commentaire sur votre post", read: false, avatar: "/user1.jpg" },
    { id: 2, text: "Votre demande a été approuvée", read: false, avatar: "/user2.jpg" },
    { id: 3, text: "Mise à jour disponible", read: true, avatar: "/update-icon.png" },
  ]);

  const filteredMenuItems = menuItems.filter(item => 
    item.roles?.includes("*") || 
    (userRole && item.roles?.includes(userRole))
  );

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  if (isLoading || isLoggingIn) {
    return <SkeletonLoader />;
  }
  return (
    <div className="flex flex-col md:flex-row h-screen bg-ey-light-gray">
      {/* Sidebar Desktop */}
      <div className="hidden md:flex w-64">
        <Sidebar>
          <div className="flex h-full flex-col bg-ey-black border-r border-ey-dark-gray">
            <div className="p-6 flex items-center gap-3 border-b border-ey-dark-gray">
              <svg width="40" height="40" viewBox="0 0 69 70" fill="none">
                <path fill="currentColor" d="M11.09 61.4H28.46V69.32H0.67V34.9H20.37L24.98 42.82H11.1V48.5H23.66V55.72H11.1V61.4H11.09ZM46.94 34.9L41.04 46.13L35.16 34.9H23.64L35.77 55.72V69.32H46.17V55.72L58.3 34.9H46.94Z"/>
                <path fill="#FFE600" d="M68.67 12.81V0L0 24.83L68.67 12.81Z"/>
              </svg>
              <span className="text-ey-yellow font-bold text-xl">EY Engage</span>
            </div>

            <nav className="flex-1 p-4 space-y-1">
              {filteredMenuItems.map((item, index) => (
                <Button 
                  key={index} 
                  variant="ghost" 
                  className="w-full justify-start text-ey-white hover:bg-ey-dark-gray/50 hover:text-ey-yellow rounded-lg px-4 py-3 transition-all" 
                  onClick={() => router.push(item.href)}
                >
                  {item.icon}
                  <span className="ml-3 font-medium">{item.label}</span>
                </Button>
              ))}
            </nav>

            <div className="p-4 border-t border-ey-dark-gray bg-ey-dark-gray/20">
              <Button 
                variant="ghost" 
                className="w-full flex justify-between items-center text-ey-white hover:bg-ey-dark-gray/50 rounded-lg p-3" 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <div className="flex items-center">
                  <User className="h-5 w-5 text-ey-yellow mr-2" />
                  <span>Profil Utilisateur</span>
                </div>
              </Button>

              {isProfileOpen && (
                <div className="mt-2 ml-8 space-y-2">
                  <Button 
                    variant="link" 
                    className="w-full justify-start text-ey-white/80 hover:text-ey-yellow px-0" 
                    onClick={() => router.push('/EyEngage/profile')}
                  >
                    <User className="h-4 w-4 mr-2" /> Profil
                  </Button>
                  <Button 
                    variant="link" 
                    className="w-full justify-start text-ey-white/80 hover:text-ey-yellow px-0" 
                    onClick={() => setIsNotificationsOpen(true)}
                  >
                    <Bell className="h-4 w-4 mr-2" /> Notifications
                  </Button>
                  <Button 
                    variant="link" 
                    className="w-full justify-start text-ey-white/80 hover:text-ey-yellow px-0" 
                    onClick={logout}
                  >
                    <LogOut className="h-4 w-4 mr-2" /> Déconnexion
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Sidebar>
      </div>

      {/* Sidebar Mobile */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="fixed top-4 left-4 z-50 bg-ey-yellow text-black hover:bg-ey-dark-yellow md:hidden rounded-full" onClick={toggle}>
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="bg-ey-black p-0 border-r border-ey-dark-gray">
          <div className="h-full flex flex-col">
            {filteredMenuItems.map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start text-ey-white hover:bg-ey-dark-gray/50 hover:text-ey-yellow rounded-lg px-4 py-3 transition-all"
                onClick={() => router.push(item.href)}
              >
                {item.icon}
                <span className="ml-3 font-medium">{item.label}</span>
              </Button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Contenu Principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-4 md:p-8 bg-gradient-to-b from-ey-light-gray/30 to-white">
          <div className="max-w-5xl mx-auto space-y-8">{children}</div>
        </main>
        
        {/* Footer */}
        <footer className="bg-ey-black text-ey-white/80 p-4 border-t border-ey-dark-gray text-center text-sm">
          <span className="text-ey-yellow font-semibold">EY Engage</span> • Plateforme collaborative © {new Date().getFullYear()} Ernst & Young
        </footer>
      </div>

      {/* Modal Notifications */}
      <Dialog open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
        <DialogContent className="bg-ey-black border-ey-dark-gray text-ey-white max-h-[80vh] overflow-y-auto">
          <DialogHeader className="text-2xl font-bold border-b border-ey-dark-gray p-4">
            Notifications
          </DialogHeader>
          <div className="space-y-4 p-4">
            {notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`p-3 rounded-lg ${
                  !notif.read ? "bg-ey-dark-gray/50" : "bg-ey-dark-gray/20"
                } transition-colors`}
              >
                <div className="flex items-center gap-4">
                  <img 
                    src={notif.avatar} 
                    alt="Avatar" 
                    className="w-8 h-8 rounded-full border border-ey-yellow/50"
                  />
                  <span className="flex-1 text-sm">{notif.text}</span>
                  {!notif.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-ey-yellow hover:bg-ey-dark-gray/50"
                      onClick={() => markAsRead(notif.id)}
                    >
                      Marquer comme lu
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="text-center text-ey-white/50 py-8">
                Aucune notification
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}