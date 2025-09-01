// components/admin/ModeratorPerformance.tsx - Design moderne avec données enrichies
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from 'recharts';
import { 
  User, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Award,
  Target,
  Zap,
  Shield,
  Activity,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Star,
  Trophy,
  ThumbsUp
} from 'lucide-react';
import { adminService } from '@/lib/services/adminService';

interface ModeratorStat {
  moderatorId: string;
  moderatorName: string;
  totalActions: number;
  warningsSent: number;
  contentHidden: number;
  contentDeleted: number;
  avgResolutionTime: number;
  efficiency: number;
}

const ModeratorPerformance: React.FC = () => {
  const [stats, setStats] = useState<ModeratorStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7days');
  const [viewMode, setViewMode] = useState<'table' | 'chart' | 'radar'>('table');
  const [selectedModerator, setSelectedModerator] = useState<ModeratorStat | null>(null);

  useEffect(() => {
    loadModeratorStats();
  }, [timeRange]);

  const loadModeratorStats = async () => {
    setLoading(true);
    try {
      const data = await adminService.getModeratorStats({ range: timeRange });
      setStats(data || []);
    } catch (error) {
      console.error('Error loading moderator stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const timeRangeOptions = [
    { value: 'today', label: "Aujourd'hui" },
    { value: '7days', label: '7 derniers jours' },
    { value: '30days', label: '30 derniers jours' },
    { value: '90days', label: '90 derniers jours' }
  ];

  const viewModeOptions = [
    { value: 'table', label: 'Tableau', icon: User },
    { value: 'chart', label: 'Graphique', icon: BarChart },
    { value: 'radar', label: 'Radar', icon: Target }
  ];

  // Données pour le graphique radar
  const getRadarData = (moderator: ModeratorStat) => [
    { subject: 'Actions Totales', A: Math.min(moderator.totalActions / 10, 100) },
    { subject: 'Efficacité', A: moderator.efficiency || 0 },
    { subject: 'Rapidité', A: Math.max(0, 100 - (moderator.avgResolutionTime * 2)) },
    { subject: 'Avertissements', A: Math.min(moderator.warningsSent * 5, 100) },
    { subject: 'Suppressions', A: Math.min(moderator.contentDeleted * 10, 100) }
  ];

  // Données pour le graphique en barres
  const chartData = stats.map((mod, index) => ({
    name: mod.moderatorName.split(' ').map(n => n[0]).join(''), // Initiales
    fullName: mod.moderatorName,
    Actions: mod.totalActions,
    Efficacité: mod.efficiency,
    'Temps Moyen': mod.avgResolutionTime,
    rank: index + 1
  }));

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return 'text-green-700 bg-green-100';
    if (efficiency >= 70) return 'text-yellow-700 bg-yellow-100';
    if (efficiency >= 50) return 'text-orange-700 bg-orange-100';
    return 'text-red-700 bg-red-100';
  };

  const getActionTypeIcon = (type: string) => {
    switch (type) {
      case 'warnings': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'hidden': return <Eye className="w-4 h-4 text-orange-600" />;
      case 'deleted': return <CheckCircle className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="bg-white rounded-xl shadow-ey-md p-6">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="flex gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 w-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-ey-md p-6 h-96">
          <div className="h-full bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec contrôles */}
      <div className="bg-white rounded-xl shadow-ey-md border border-gray-200">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Performance des Modérateurs</h2>
              <p className="text-gray-600 mt-1">Analyse détaillée de l'activité et de l'efficacité</p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Sélecteur de vue */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                {viewModeOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setViewMode(option.value as any)}
                      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                        viewMode === option.value
                          ? 'bg-ey-yellow text-ey-black shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {option.label}
                    </button>
                  );
                })}
              </div>

              {/* Sélecteur de période */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ey-yellow"
              >
                {timeRangeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <button
                onClick={loadModeratorStats}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Métriques globales */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.length}</div>
            <div className="text-sm text-gray-600">Modérateurs actifs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.reduce((sum, stat) => sum + stat.totalActions, 0)}
            </div>
            <div className="text-sm text-gray-600">Actions totales</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.length > 0 ? Math.round(stats.reduce((sum, stat) => sum + stat.avgResolutionTime, 0) / stats.length) : 0}h
            </div>
            <div className="text-sm text-gray-600">Temps moyen</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {stats.length > 0 ? Math.round(stats.reduce((sum, stat) => sum + (stat.efficiency || 0), 0) / stats.length) : 0}%
            </div>
            <div className="text-sm text-gray-600">Efficacité moyenne</div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-xl shadow-ey-md border border-gray-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Classement des Modérateurs</h3>
            
            <div className="space-y-4">
              {stats.map((mod, index) => (
                <div 
                  key={mod.moderatorId}
                  className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => setSelectedModerator(mod)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Rang */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                        index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                        index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                        index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                        'bg-gradient-to-br from-blue-400 to-blue-600'
                      }`}>
                        {index === 0 ? <Trophy className="w-6 h-6" /> : index + 1}
                      </div>

                      {/* Informations modérateur */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{mod.moderatorName}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center gap-1">
                            <Activity className="w-4 h-4" />
                            {mod.totalActions} actions
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {mod.avgResolutionTime}h moy.
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEfficiencyColor(mod.efficiency || 0)}`}>
                            {mod.efficiency || 0}% efficacité
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Métriques détaillées */}
                    <div className="grid grid-cols-3 gap-6 text-center">
                      <div>
                        <div className="flex items-center justify-center gap-1 text-yellow-600 mb-1">
                          {getActionTypeIcon('warnings')}
                          <span className="text-sm font-medium">Avertissements</span>
                        </div>
                        <div className="text-xl font-bold text-gray-900">{mod.warningsSent}</div>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-center gap-1 text-orange-600 mb-1">
                          {getActionTypeIcon('hidden')}
                          <span className="text-sm font-medium">Masqués</span>
                        </div>
                        <div className="text-xl font-bold text-gray-900">{mod.contentHidden}</div>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-center gap-1 text-red-600 mb-1">
                          {getActionTypeIcon('deleted')}
                          <span className="text-sm font-medium">Supprimés</span>
                        </div>
                        <div className="text-xl font-bold text-gray-900">{mod.contentDeleted}</div>
                      </div>
                    </div>
                  </div>

                  {/* Barre de progression de l'efficacité */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                      <span>Score d'efficacité</span>
                      <span>{mod.efficiency || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          (mod.efficiency || 0) >= 90 ? 'bg-green-500' :
                          (mod.efficiency || 0) >= 70 ? 'bg-yellow-500' :
                          (mod.efficiency || 0) >= 50 ? 'bg-orange-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(mod.efficiency || 0, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'chart' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Graphique des actions */}
          <div className="bg-white rounded-xl shadow-ey-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions par Modérateur</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.75rem',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                    labelFormatter={(value, payload) => {
                      const item = payload?.[0]?.payload;
                      return item ? `${item.fullName}` : value;
                    }}
                  />
                  <Bar dataKey="Actions" fill="#FFE600" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Graphique de l'efficacité */}
          <div className="bg-white rounded-xl shadow-ey-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Efficacité des Modérateurs</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#6b7280" 
                    fontSize={12}
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.75rem',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                    labelFormatter={(value, payload) => {
                      const item = payload?.[0]?.payload;
                      return item ? `${item.fullName}` : value;
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Efficacité" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'radar' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.slice(0, 6).map((mod) => (
            <div key={mod.moderatorId} className="bg-white rounded-xl shadow-ey-md border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ey-yellow to-ey-yellow-dark flex items-center justify-center">
                  <User className="w-5 h-5 text-ey-black" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{mod.moderatorName}</h4>
                  <p className="text-sm text-gray-600">{mod.totalActions} actions</p>
                </div>
              </div>
              
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={getRadarData(mod)}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#6b7280' }} />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 100]} 
                      tick={{ fontSize: 10, fill: '#6b7280' }}
                    />
                    <Radar
                      name={mod.moderatorName}
                      dataKey="A"
                      stroke="#FFE600"
                      fill="#FFE600"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recommandations et insights */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-blue-900 mb-2">Insights de Performance</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-800">
              {stats.length > 0 && (
                <>
                  <div>
                    <strong>Meilleur modérateur:</strong> {stats[0]?.moderatorName} avec {stats[0]?.totalActions} actions
                  </div>
                  <div>
                    <strong>Temps de résolution le plus rapide:</strong> {
                      Math.min(...stats.map(s => s.avgResolutionTime))
                    }h en moyenne
                  </div>
                  <div>
                    <strong>Efficacité moyenne:</strong> {
                      Math.round(stats.reduce((sum, stat) => sum + (stat.efficiency || 0), 0) / stats.length)
                    }% sur l'équipe
                  </div>
                  <div>
                    <strong>Actions cette période:</strong> {
                      stats.reduce((sum, stat) => sum + stat.totalActions, 0)
                    } au total
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {stats.length === 0 && (
        <div className="text-center py-16">
          <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune donnée disponible</h3>
          <p className="text-gray-500">Aucune activité de modération trouvée pour cette période.</p>
        </div>
      )}
    </div>
  );
};

export default ModeratorPerformance;