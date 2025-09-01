// components/admin/AdminDashboard.tsx - Dashboard principal moderne avec navigation améliorée
'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Flag, 
  Users, 
  FileText, 
  Building,
  Shield,
  Settings,
  Bell,
  Search,
  Plus,
  Filter,
  Download,
  RefreshCw,
  Menu,
  X,
  Home,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Zap
} from 'lucide-react';
import DashboardStats from './DashboardStats';
import DepartmentStats from './DepartmentStats';
import ModerationHistory from './ModerationHistory';
import ModeratorPerformance from './ModeratorPerformance';
import UserManagement from './UserManagement';
import { adminService } from '@/lib/services/adminService';
import FlaggedContentList from './FlaggedContent';

interface AdminDashboardProps {
  initialData?: any;
}

interface QuickStat {
  label: string;
  value: number | string;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ initialData }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState(initialData?.stats || {});
  const [timeRange, setTimeRange] = useState('7days');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [quickStats, setQuickStats] = useState<QuickStat[]>([]);
  const [notifications, setNotifications] = useState([]);

  const tabs = [
    { 
      id: 'overview', 
      label: 'Vue d\'ensemble', 
      icon: BarChart3,
      description: 'Statistiques globales et KPIs'
    },
    { 
      id: 'flagged', 
      label: 'Contenu signalé', 
      icon: Flag,
      description: 'Gérer les signalements en attente',
      badge: quickStats.find(s => s.label === 'En Attente')?.value || 0
    },
    { 
      id: 'users', 
      label: 'Utilisateurs', 
      icon: Users,
      description: 'Gestion des comptes utilisateur'
    },
    { 
      id: 'history', 
      label: 'Historique', 
      icon: FileText,
      description: 'Journal des actions de modération'
    },
    { 
      id: 'departments', 
      label: 'Par département', 
      icon: Building,
      description: 'Analyse par équipe'
    },
    { 
      id: 'moderators', 
      label: 'Modérateurs', 
      icon: Shield,
      description: 'Performance de l\'équipe'
    },
  ];

  useEffect(() => {
    if (activeTab === 'overview') {
      loadDashboardData();
    }
    loadQuickStats();
    loadNotifications();
  }, [timeRange, activeTab]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getDashboardStats({ 
        range: timeRange 
      });
      setStats(data || {});
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      setStats({});
    } finally {
      setIsLoading(false);
    }
  };

  const loadQuickStats = async () => {
    try {
      const data = await adminService.getQuickStats();
      const quickStatsData: QuickStat[] = [
        {
          label: 'Signalements Aujourd\'hui',
          value: data.flagsToday || 0,
          change: '+12%',
          changeType: 'increase',
          icon: Flag,
          color: 'text-red-600'
        },
        {
          label: 'En Attente',
          value: stats.overview?.pendingFlags || 0,
          change: '-5%',
          changeType: 'decrease',
          icon: Clock,
          color: 'text-yellow-600'
        },
        {
          label: 'Taux Résolution 24h',
          value: `${data.resolutionRate24h || 85}%`,
          change: '+2%',
          changeType: 'increase',
          icon: Target,
          color: 'text-green-600'
        },
        {
          label: 'Incidents Actifs',
          value: data.activeIncidents || 0,
          change: '0',
          changeType: 'neutral',
          icon: AlertTriangle,
          color: 'text-orange-600'
        }
      ];
      setQuickStats(quickStatsData);
    } catch (error) {
      console.error('Error loading quick stats:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const data = await adminService.getAdminNotifications();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleRefreshAll = async () => {
    setIsLoading(true);
    await Promise.all([
      loadDashboardData(),
      loadQuickStats(),
      loadNotifications()
    ]);
    setIsLoading(false);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardStats stats={stats} loading={isLoading} timeRange={timeRange} onTimeRangeChange={setTimeRange} />;
      case 'flagged':
        return <FlaggedContentList />;
      case 'users':
        return <UserManagement />;
      case 'history':
        return <ModerationHistory />;
      case 'departments':
        return <DepartmentStats />;
      case 'moderators':
        return <ModeratorPerformance />;
      default:
        return <DashboardStats stats={stats} loading={isLoading} timeRange={timeRange} onTimeRangeChange={setTimeRange} />;
    }
  };

  const getChangeColor = (type?: string) => {
    switch (type) {
      case 'increase': return 'text-green-600';
      case 'decrease': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:inset-0`}>
        
        {/* Header du sidebar */}
        <div className="flex items-center justify-between h-16 px-6 bg-gradient-to-r from-ey-yellow to-ey-yellow-dark">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-ey-black rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-ey-yellow" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-ey-black">Admin EY</h1>
              <p className="text-xs text-ey-black/70">Modération</p>
            </div>
          </div>
          
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-ey-black hover:bg-ey-black/10 p-1 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats rapides dans le sidebar */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Aperçu Rapide</h3>
          <div className="grid grid-cols-2 gap-2">
            {quickStats.slice(0, 4).map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="bg-gray-50 rounded-lg p-3">
                  <div className={`flex items-center gap-2 ${stat.color} mb-1`}>
                    <Icon className="w-4 h-4" />
                    <span className="text-xs font-medium">{stat.label.split(' ')[0]}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">{stat.value}</span>
                    {stat.change && (
                      <span className={`text-xs ${getChangeColor(stat.changeType)}`}>
                        {stat.change}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-4 flex-1 overflow-y-auto">
          <div className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-ey-yellow text-ey-black shadow-md'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{tab.label}</div>
                    <div className="text-xs opacity-75 truncate">{tab.description}</div>
                  </div>
                  {tab.badge && tab.badge > 0 && (
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      isActive 
                        ? 'bg-ey-black text-ey-yellow' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer du sidebar avec actions rapides */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <button
              onClick={handleRefreshAll}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
            
            <button className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Overlay pour mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Contenu principal */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
        {/* Barre de navigation supérieure */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Menu mobile */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                  <Menu className="w-5 h-5" />
                </button>

                {/* Breadcrumb */}
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-900 font-medium">
                    {tabs.find(t => t.id === activeTab)?.label || 'Administration'}
                  </span>
                </div>
              </div>

              {/* Actions de l'en-tête */}
              <div className="flex items-center gap-3">
                {/* Barre de recherche rapide */}
                <div className="relative hidden md:block">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Recherche rapide..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ey-yellow w-64"
                  />
                </div>

                {/* Notifications */}
                <div className="relative">
                  <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg relative">
                    <Bell className="w-5 h-5" />
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                    )}
                  </button>
                </div>

                {/* Actions rapides */}
                <div className="flex items-center gap-2">
                  <button className="hidden sm:flex items-center gap-2 px-3 py-2 bg-ey-yellow text-ey-black rounded-lg hover:bg-ey-yellow-dark transition-colors font-medium text-sm">
                    <Plus className="w-4 h-4" />
                    Action Rapide
                  </button>

                  <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Barre de stats rapides */}
          <div className="px-4 sm:px-6 lg:px-8 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                {quickStats.slice(0, 4).map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${stat.color}`} />
                      <div className="text-sm">
                        <span className="font-medium text-gray-900">{stat.value}</span>
                        <span className="text-gray-600 ml-1">{stat.label.split(' ')[0]}</span>
                        {stat.change && (
                          <span className={`ml-1 text-xs ${getChangeColor(stat.changeType)}`}>
                            ({stat.change})
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-sm text-gray-500">
                Dernière mise à jour: {new Date().toLocaleTimeString('fr-FR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        </header>

        {/* Contenu de la page */}
        <main className="px-4 sm:px-6 lg:px-8 py-8">
          {/* Messages d'alerte globaux */}
          {quickStats.some(s => s.label === 'Incidents Actifs' && Number(s.value) > 0) && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div>
                  <h4 className="text-red-900 font-medium">Incidents Actifs Détectés</h4>
                  <p className="text-red-800 text-sm mt-1">
                    {quickStats.find(s => s.label === 'Incidents Actifs')?.value} incident(s) nécessite(nt) votre attention immédiate.
                  </p>
                </div>
                <button className="ml-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm">
                  Voir les incidents
                </button>
              </div>
            </div>
          )}

          {/* Rendu du contenu de l'onglet actif */}
          <div className="transition-opacity duration-300">
            {renderTabContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;