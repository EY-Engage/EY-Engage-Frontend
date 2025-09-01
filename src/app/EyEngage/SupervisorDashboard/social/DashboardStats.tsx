// components/admin/DashboardStats.tsx - Design moderne avec charte EY
'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  FileText,
  Users,
  Shield,
  Download,
  RefreshCw,
  Calendar,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Target,
  Zap,
  AlertOctagon,
  CheckSquare,
  XCircle
} from 'lucide-react';
import { adminService } from '@/lib/services/adminService';

interface DashboardStatsProps {
  stats: any;
  loading: boolean;
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
}

const COLORS = ['#FFE600', '#1A1A24', '#4EBEEB', '#10B981', '#DC2626', '#F97316'];

const DashboardStats: React.FC<DashboardStatsProps> = ({
  stats,
  loading,
  timeRange,
  onTimeRangeChange
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'detailed'>('grid');
  const [refreshing, setRefreshing] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Force refresh des données
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      await adminService.exportStats({ range: timeRange }, 'csv');
    } finally {
      setExportLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-ey-md p-6 h-32"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-ey-md p-6 h-64"></div>
          <div className="bg-white rounded-xl shadow-ey-md p-6 h-64"></div>
        </div>
      </div>
    );
  }

  const { overview = {}, byType = [], topReasons = [], resolutionStats = [], moderatorStats = [], recentTrends = [] } = stats || {};

  const statCards = [
    {
      title: 'Total Signalements',
      value: overview.totalFlags || 0,
      change: '+12%',
      changeType: 'increase',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-gradient-to-br from-red-50 to-red-100',
      borderColor: 'border-red-200',
      description: 'Signalements reçus cette période'
    },
    {
      title: 'En Attente',
      value: overview.pendingFlags || 0,
      change: '-5%',
      changeType: 'decrease',
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
      borderColor: 'border-yellow-200',
      description: 'Nécessitent une action immédiate'
    },
    {
      title: 'Résolus',
      value: overview.resolvedFlags || 0,
      change: '+18%',
      changeType: 'increase',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-gradient-to-br from-green-50 to-green-100',
      borderColor: 'border-green-200',
      description: 'Traités avec succès'
    },
    {
      title: 'Urgents',
      value: overview.urgentFlags || 0,
      change: '+3%',
      changeType: 'increase',
      icon: AlertOctagon,
      color: 'text-red-700',
      bgColor: 'bg-gradient-to-br from-red-100 to-red-200',
      borderColor: 'border-red-300',
      description: 'Priorité haute'
    },
    {
      title: 'Taux de Résolution',
      value: `${overview.resolutionRate || 0}%`,
      change: '+2.3%',
      changeType: 'increase',
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
      borderColor: 'border-blue-200',
      description: 'Performance de résolution'
    },
    {
      title: 'En Examen',
      value: overview.underReviewFlags || 0,
      change: '0%',
      changeType: 'neutral',
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100',
      borderColor: 'border-purple-200',
      description: 'En cours de traitement'
    },
    {
      title: 'Temps Moyen',
      value: `${overview.avgResolutionTime || 0}h`,
      change: '-15min',
      changeType: 'decrease',
      icon: Zap,
      color: 'text-indigo-600',
      bgColor: 'bg-gradient-to-br from-indigo-50 to-indigo-100',
      borderColor: 'border-indigo-200',
      description: 'Temps de résolution moyen'
    },
    {
      title: 'Modérateurs Actifs',
      value: moderatorStats.length || 0,
      change: '+1',
      changeType: 'increase',
      icon: Shield,
      color: 'text-gray-700',
      bgColor: 'bg-gradient-to-br from-gray-50 to-gray-100',
      borderColor: 'border-gray-200',
      description: 'Équipe de modération'
    }
  ];

  const timeRangeOptions = [
    { value: 'today', label: "Aujourd'hui" },
    { value: '7days', label: '7 derniers jours' },
    { value: '30days', label: '30 derniers jours' },
    { value: '90days', label: '90 derniers jours' }
  ];

  return (
    <div className="space-y-8">
      {/* En-tête moderne avec contrôles */}
      <div className="bg-white rounded-xl shadow-ey-lg p-6 border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Tableau de Bord Modération</h2>
            <p className="text-gray-600 mt-1">Vue d'ensemble des signalements et actions de modération</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Sélecteur de période */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {timeRangeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onTimeRangeChange(option.value)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    timeRange === option.value
                      ? 'bg-ey-yellow text-ey-black shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Boutons d'action */}
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'detailed' : 'grid')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Changer la vue"
            >
              {viewMode === 'grid' ? <BarChart3 className="w-5 h-5" /> : <PieChartIcon className="w-5 h-5" />}
            </button>
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title="Actualiser"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            
            <button
              onClick={handleExport}
              disabled={exportLoading}
              className="flex items-center gap-2 px-4 py-2 bg-ey-yellow text-ey-black rounded-lg hover:bg-ey-yellow-dark transition-colors font-medium disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {exportLoading ? 'Export...' : 'Export'}
            </button>
          </div>
        </div>
      </div>

      {/* Cartes de statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`${card.bgColor} rounded-xl shadow-ey-md border ${card.borderColor} p-6 relative overflow-hidden hover:shadow-ey-lg transition-all duration-300`}
            >
              {/* Indicateur de tendance */}
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-white/80 ${card.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className={`text-sm font-medium flex items-center gap-1 px-2 py-1 rounded-full ${
                  card.changeType === 'increase' 
                    ? 'text-green-700 bg-green-100' 
                    : card.changeType === 'decrease'
                    ? 'text-red-700 bg-red-100'
                    : 'text-gray-700 bg-gray-100'
                }`}>
                  <TrendingUp className={`w-3 h-3 ${
                    card.changeType === 'decrease' ? 'rotate-180' : ''
                  }`} />
                  {card.change}
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                <p className="text-xs text-gray-600">{card.description}</p>
              </div>

              {/* Pattern décoratif EY */}
              <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                <div className="w-full h-full bg-gradient-to-bl from-ey-yellow to-transparent rounded-full"></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Graphiques principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Répartition par type de contenu */}
        <div className="bg-white rounded-xl shadow-ey-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Répartition par Type</h3>
            <div className="flex items-center text-sm text-gray-500">
              <Activity className="w-4 h-4 mr-1" />
              Temps réel
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byType}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="total"
                  label={({ name, total }) => `${name}: ${total}`}
                >
                  {byType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Légende */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            {byType.map((item, index) => (
              <div key={item.type} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-gray-700">{item.label || item.type}</span>
                <span className="text-sm font-medium text-gray-900 ml-auto">{item.total}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tendances récentes */}
        <div className="bg-white rounded-xl shadow-ey-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Tendances Récentes</h3>
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="w-4 h-4 mr-1" />
              7 derniers jours
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={recentTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
                />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="dailyFlags"
                  stackId="1"
                  stroke="#FFE600"
                  fill="#FFE600"
                  fillOpacity={0.6}
                  name="Signalements"
                />
                <Area
                  type="monotone"
                  dataKey="urgentFlags"
                  stackId="2"
                  stroke="#DC2626"
                  fill="#DC2626"
                  fillOpacity={0.8}
                  name="Urgents"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Sections détaillées */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top des motifs */}
        <div className="bg-white rounded-xl shadow-ey-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Motifs Principaux</h3>
          <div className="space-y-3">
            {topReasons.slice(0, 5).map((item, index) => (
              <div key={item.reason} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-red-500' : index === 1 ? 'bg-orange-500' : 'bg-gray-400'}`} />
                  <span className="text-sm text-gray-900 font-medium truncate max-w-xs" title={item.reason}>
                    {item.reason}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">{item.count}</span>
                  {item.urgentCount > 0 && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      {item.urgentCount} urgent{item.urgentCount > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions de résolution */}
        <div className="bg-white rounded-xl shadow-ey-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions de Résolution</h3>
          <div className="space-y-3">
            {resolutionStats.map((item) => (
              <div key={item.action} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-1 rounded ${
                    item.action === 'content_removed' ? 'bg-red-100 text-red-600' :
                    item.action === 'content_hidden' ? 'bg-orange-100 text-orange-600' :
                    item.action === 'warning_sent' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {item.action === 'content_removed' ? <XCircle className="w-3 h-3" /> :
                     item.action === 'content_hidden' ? <AlertTriangle className="w-3 h-3" /> :
                     item.action === 'warning_sent' ? <AlertOctagon className="w-3 h-3" /> :
                     <CheckSquare className="w-3 h-3" />}
                  </div>
                  <span className="text-sm text-gray-900 font-medium">{item.label}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">{item.count}</div>
                  <div className="text-xs text-gray-500">{item.avgHours}h moy.</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance modérateurs */}
        <div className="bg-white rounded-xl shadow-ey-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Modérateurs</h3>
          <div className="space-y-3">
            {moderatorStats.slice(0, 5).map((mod, index) => (
              <div key={mod.moderatorId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    index === 2 ? 'bg-orange-400' :
                    'bg-gray-300'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{mod.moderatorName}</div>
                    <div className="text-xs text-gray-500">{mod.avgResolutionHours}h résolution moy.</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">{mod.totalActions}</div>
                  <div className="text-xs text-gray-500">actions</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alertes et recommandations */}
      {(overview.urgentFlags > 0 || overview.pendingFlags > 10) && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="text-lg font-semibold text-red-900 mb-2">Attention Requise</h4>
              <div className="text-red-800 space-y-1">
                {overview.urgentFlags > 0 && (
                  <p>• <strong>{overview.urgentFlags}</strong> signalement{overview.urgentFlags > 1 ? 's' : ''} urgent{overview.urgentFlags > 1 ? 's' : ''} nécessite{overview.urgentFlags > 1 ? 'nt' : ''} une action immédiate</p>
                )}
                {overview.pendingFlags > 10 && (
                  <p>• <strong>{overview.pendingFlags}</strong> signalements en attente - considérez l'assignation à plus de modérateurs</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardStats;