import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  Rocket, 
  Settings,
  BarChart3,
  MessageSquare,
  Shield,
  ChevronRight,
  ChevronDown,
  Home,
  Briefcase,
  UserCheck,
  Award
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  subItems?: SubMenuItem[];
}

interface SubMenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  roles: string[];
}

const menuStructure: MenuItem[] = [
  {
    id: 'employee-section',
    label: 'Espace Employé',
    icon: <Home className="h-6 w-6" />, // Icône agrandie
    subItems: [
      {
        id: 'employee-dashboard',
        label: 'Vue d\'ensemble',
        icon: <LayoutDashboard className="h-5 w-5" />, // Icône agrandie
        href: '/EyEngage/EmployeeDashboard',
        roles: ['EmployeeEY', 'SuperAdmin', 'Admin', 'AgentEY']
      },
      {
        id: 'employee-events',
        label: 'Événements',
        icon: <CalendarDays className="h-5 w-5" />, // Icône agrandie
        href: '/EyEngage/EmployeeDashboard/events',
        roles: ['EmployeeEY', 'SuperAdmin', 'Admin', 'AgentEY']
      },
      {
        id: 'employee-social',
        label: 'Réseau Social',
        icon: <Users className="h-5 w-5" />, // Icône agrandie
        href: '/EyEngage/EmployeeDashboard/social',
        roles: ['EmployeeEY', 'SuperAdmin', 'Admin', 'AgentEY']
      },
      {
        id: 'employee-career',
        label: 'Carrière',
        icon: <Rocket className="h-5 w-5" />, // Icône agrandie
        href: '/EyEngage/EmployeeDashboard/career',
        roles: ['EmployeeEY', 'SuperAdmin', 'Admin', 'AgentEY']
      }
    ]
  },
  {
    id: 'supervisor-section',
    label: 'Administration',
    icon: <Shield className="h-6 w-6" />, // Icône agrandie
    subItems: [
      {
        id: 'supervisor-dashboard',
        label: 'Tableau de bord',
        icon: <LayoutDashboard className="h-5 w-5" />, // Icône agrandie
        href: '/EyEngage/SupervisorDashboard',
        roles: ['SuperAdmin', 'Admin', 'AgentEY'] // Seulement pour SuperAdmin
      },
      {
        id: 'user-management',
        label: 'Gestion Utilisateurs',
        icon: <UserCheck className="h-5 w-5" />, // Icône agrandie
        href: '/EyEngage/SupervisorDashboard/users',
        roles: ['SuperAdmin'] // Seulement pour SuperAdmin
      },
      {
        id: 'event-management',
        label: 'Gestion Événements',
        icon: <Settings className="h-5 w-5" />, // Icône agrandie
        href: '/EyEngage/SupervisorDashboard/events/manage',
        roles: ['Admin', 'AgentEY'] // Seulement pour Admin & AgentEY (PAS SuperAdmin)
      },
      {
        id: 'event-analytics',
        label: 'Analytiques Événements',
        icon: <BarChart3 className="h-5 w-5" />, // Icône agrandie
        href: '/EyEngage/SupervisorDashboard/events/analytics',
        roles: ['Admin', 'AgentEY'] // Seulement pour Admin & AgentEY (PAS SuperAdmin)
      },
      {
        id: 'career-management',
        label: 'Gestion Carrières',
        icon: <Briefcase className="h-5 w-5" />, // Icône agrandie
        href: '/EyEngage/SupervisorDashboard/career',
        roles: ['Admin', 'AgentEY'] // Seulement pour Admin & AgentEY (PAS SuperAdmin)
      },
      {
        id: 'social-moderation',
        label: 'Modération Sociale',
        icon: <MessageSquare className="h-5 w-5" />, // Icône agrandie
        href: '/EyEngage/SupervisorDashboard/social',
        roles: ['Admin', 'AgentEY'] // Seulement pour Admin & AgentEY (PAS SuperAdmin)
      }
    ]
  }
];

interface ImprovedSidebarProps {
  userRoles: string[];
  onClose?: () => void;
}

export default function ImprovedSidebar({ userRoles, onClose }: ImprovedSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<string[]>(['employee-section', 'supervisor-section']);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleNavigation = (href: string) => {
    router.push(href);
    if (onClose) onClose();
  };

  const isItemActive = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + '/');
  };

  const hasAccess = (roles: string[]) => {
    return roles.some(role => userRoles.includes(role));
  };

  // Fonction pour filtrer le menu selon les rôles
  const filterMenu = (menu: MenuItem[]): MenuItem[] => {
    return menu
      .map(item => {
        const newItem = { ...item };
        
        if (newItem.subItems) {
          // Filtrer les sous-items selon les rôles
          newItem.subItems = newItem.subItems.filter(subItem => 
            hasAccess(subItem.roles)
          );
        }
        
        return newItem;
      })
      .filter(item => {
        // Garder seulement les sections qui ont au moins un sous-item accessible
        if (item.subItems) {
          return item.subItems.length > 0;
        }
        return false;
      });
  };

  // Obtenir le menu filtré
  const filteredMenu = filterMenu(menuStructure);

  // Debug: Afficher les rôles actuels et les items visibles
  console.log('Rôles actuels:', userRoles);
  console.log('Menu filtré:', filteredMenu);

  const renderSection = (section: MenuItem) => {
    const isExpanded = expandedSections.includes(section.id);
    
    return (
      <div key={section.id} className="mb-4"> {/* Espacement augmenté */}
        {/* Bouton de la section principale */}
        <button
          onClick={() => toggleSection(section.id)}
          className={`
            w-full flex items-center justify-between px-5 py-4 rounded-lg /* Padding augmenté */
            transition-all duration-200 group
            text-gray-300 hover:bg-gray-800 hover:text-yellow-400
          `}
        >
          <div className="flex items-center gap-4"> {/* Espacement augmenté */}
            <span className="text-yellow-400 group-hover:text-yellow-300">
              {section.icon}
            </span>
            <span className="font-semibold text-lg"> {/* Taille de police augmentée */}
              {section.label}
            </span>
          </div>
          <span className="text-gray-500">
            {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />} {/* Icônes agrandies */}
          </span>
        </button>

        {/* Sous-items */}
        {isExpanded && section.subItems && (
          <div className="mt-2 ml-6 space-y-2"> {/* Espacement augmenté */}
            {section.subItems.map(subItem => (
              <button
                key={subItem.id}
                onClick={() => subItem.href && handleNavigation(subItem.href)}
                className={`
                  w-full flex items-center gap-4 px-5 py-3 rounded-lg /* Padding augmenté */
                  transition-all duration-200 group text-base /* Taille de police augmentée */
                  ${isItemActive(subItem.href) 
                    ? 'bg-yellow-400 text-gray-900 font-semibold shadow-md' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-yellow-400'
                  }
                `}
              >
                <span className={`
                  ${isItemActive(subItem.href) 
                    ? 'text-gray-900' 
                    : 'text-yellow-400 group-hover:text-yellow-300'
                  }
                `}>
                  {subItem.icon}
                </span>
                <span>{subItem.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header - Taille augmentée */}
      <div className="p-7 border-b border-gray-800"> {/* Padding augmenté */}
        <div className="flex items-center gap-4"> {/* Espacement augmenté */}
          <div className="w-14 h-14 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg"> {/* Taille augmentée */}
            <span className="text-gray-900 font-bold text-2xl">EY</span> {/* Taille de police augmentée */}
          </div>
          <div>
            <h2 className="text-yellow-400 font-bold text-2xl">EY Engage</h2> {/* Taille de police augmentée */}
            <p className="text-gray-400 text-sm">Plateforme collaborative</p> {/* Taille de police légèrement augmentée */}
          </div>
        </div>
      </div>

      {/* Navigation - Padding augmenté */}
      <nav className="flex-1 overflow-y-auto p-5 space-y-4"> {/* Padding et espacement augmentés */}
        {filteredMenu.map(section => renderSection(section))}
      </nav>

      {/* Footer - Taille augmentée */}
      <div className="p-5 border-t border-gray-800"> {/* Padding augmenté */}
        <div className="flex items-center gap-3 px-4 py-3 text-gray-400 text-sm"> {/* Taille et espacement augmentés */}
          <Award className="h-5 w-5 text-yellow-400" /> {/* Icône agrandie */}
          <span>© {new Date().getFullYear()} Ernst & Young</span>
        </div>
      </div>
    </div>
  );
}