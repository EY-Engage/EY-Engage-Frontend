// components/admin/DepartmentStats.tsx - Design moderne avec données enrichies
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
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  Building, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  Target,
  Users,
  Activity,
  CheckCircle,
  XCircle,
  Calendar,
  Filter,
  RefreshCw,
  Download,
  Eye,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import { adminService } from '@/lib/services/adminService';

interface DepartmentStat {
  department: string;
  departmentKey: string;
  departmentLabel: string;
  totalFlags: number;
  urgentFlags: number;
  resolvedFlags: number;
  pendingFlags: number;
  resolutionRate: number;
  avgResolutionTime: number;
}

const DEPARTMENT_COLORS = {
  'Assurance': '#6B46C1',
  'Consulting': '#2563EB', 
  'StrategyAndTransactions': '#059669',
  'Tax': '#DC2626'
};

const CHART_COLORS = ['#FFE600', '#1A1A24', '#4EBEEB', '#10B981', '#DC2626', '#F97316'];

const DepartmentStats: React.FC = () => {
  const [stats, setStats] = useState<DepartmentStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7days');
  const [viewMode, setViewMode] = useState<'chart' | 'pie' | 'table'>('chart');
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentStat | null>(null);
  const [showDepartmentDetail, setShowDepartmentDetail] = useState(false);

  useEffect(() => {
    loadDepartmentStats();
  }, [timeRange]);

  const loadDepartmentStats = async () => {
    setLoading(true);
    try {
      const data = await adminService.getDepartmentStats({ range: timeRange });
      setStats(data || []);
    } catch (error) {
      console.error('Error loading department stats:', error);
      setStats([]);
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
    { value: 'chart', label: 'Graphique', icon: BarChart3 },
    { value: 'pie', label: 'Répartition', icon: PieChartIcon },
    { value: 'table', label: 'Tableau', icon: Building }
  ];

  // Données pour les graphiques
  const chartData = stats.map(stat => ({
    name: stat.departmentLabel,
    key: stat.departmentKey,
    'Signalements': stat.totalFlags,
    'Urgents': stat.urgentFlags,
    'Résolus': stat.resolvedFlags,
    'En attente': stat.pendingFlags,
    'Taux résolution': stat.resolutionRate
  }));

  const pieData = stats.map(stat => ({
    name: stat.departmentLabel,
    value: stat.totalFlags,
    color: DEPARTMENT_COLORS[stat.departmentKey] || '#6B7280'
  }));

  const getDepartmentIcon = (departmentKey: string) => {
    switch (departmentKey) {
      case 'Assurance': return '🛡️';
      case 'Consulting': return '💼';
      case 'StrategyAndTransactions': return '📈';
      case 'Tax': return '📊';
      default: return '🏢';
    }
  };

  const getDepartmentColor = (departmentKey: string) => {
    const colors = {
      'Assurance': 'from-purple-50 to-purple-100 border-purple-200',
      'Consulting': 'from-blue-50 to-blue-100 border-blue-200',
      'StrategyAndTransactions': 'from-green-50 to-green-100 border-green-200',
      'Tax': 'from-red-50 to-red-100 border-red-200'
    };
    return colors[departmentKey] || 'from-gray-50 to-gray-100 border-gray-200';
  };

  const getRiskLevel = (urgentFlags: number, totalFlags: number): { level: string; color: string } => {
    if (totalFlags === 0) return { level: 'Aucun', color: 'text-gray-600' };
    
    const urgentRate = (urgentFlags / totalFlags) * 100;
    
    if (urgentRate >= 30) return { level: 'Élevé', color: 'text-red-600' };
    if (urgentRate >= 15) return { level: 'Modéré', color: 'text-yellow-600' };
    return { level: 'Faible', color: 'text-green-600' };
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-ey-md p-6 h-32">
              <div className="h-full bg-gray-200 rounded"></div>
            </div>
          ))}
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
              <h2 className="text-2xl font-bold text-gray-900">Statistiques par Département</h2>
              <p className="text-gray-600 mt-1">Analyse comparative des signalements par département</p>
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
                onClick={loadDepartmentStats}
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
            <div className="text-sm text-gray-600">Départements</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {stats.reduce((sum, stat) => sum + stat.totalFlags, 0)}
            </div>
            <div className="text-sm text-gray-600">Total signalements</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.reduce((sum, stat) => sum + stat.urgentFlags, 0)}
            </div>
            <div className="text-sm text-gray-600">Signalements urgents</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.length > 0 
                ? Math.round(stats.reduce((sum, stat) => sum + stat.resolutionRate, 0) / stats.length)
                : 0}%
            </div>
            <div className="text-sm text-gray-600">Taux résolution moyen</div>
          </div>
        </div>
      </div>

      {/* Contenu principal selon le mode de vue */}
      {viewMode === 'chart' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Graphique en barres - Signalements */}
          <div className="bg-white rounded-xl shadow-ey-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Signalements par Département</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#6b7280"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
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
                  <Bar dataKey="Signalements" fill="#DC2626" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Urgents" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Résolus" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Graphique linéaire - Taux de résolution */}
          <div className="bg-white rounded-xl shadow-ey-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Taux de Résolution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#6b7280"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
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
                    formatter={(value) => [`${value}%`, 'Taux de résolution']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Taux résolution" 
                    stroke="#FFE600" 
                    strokeWidth={3}
                    dot={{ fill: '#FFE600', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'pie' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Graphique en secteurs - Répartition */}
          <div className="bg-white rounded-xl shadow-ey-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition des Signalements</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
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
          </div>

          {/* Légende détaillée */}
          <div className="bg-white rounded-xl shadow-ey-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Détail par Département</h3>
            <div className="space-y-4">
              {stats.map((stat) => (
                <div key={stat.departmentKey} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: DEPARTMENT_COLORS[stat.departmentKey] || '#6B7280' }}
                    />
                    <div>
                      <div className="font-medium text-gray-900">{stat.departmentLabel}</div>
                      <div className="text-sm text-gray-600">
                        {stat.urgentFlags} urgents • {stat.resolutionRate}% résolu
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{stat.totalFlags}</div>
                    <div className="text-sm text-gray-600">signalements</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'table' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const riskLevel = getRiskLevel(stat.urgentFlags, stat.totalFlags);
            
            return (
              <div
                key={stat.departmentKey}
                className={`bg-gradient-to-br ${getDepartmentColor(stat.departmentKey)} rounded-xl shadow-ey-md border hover:shadow-ey-lg transition-all duration-300 cursor-pointer`}
                onClick={() => {
                  setSelectedDepartment(stat);
                  setShowDepartmentDetail(true);
                }}
              >
                <div className="p-6">
                  {/* En-tête du département */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{getDepartmentIcon(stat.departmentKey)}</div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{stat.departmentLabel}</h3>
                        <p className="text-sm text-gray-600">Département</p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      stat.totalFlags > 20 ? 'bg-red-100 text-red-800' :
                      stat.totalFlags > 10 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {stat.totalFlags > 20 ? 'Élevé' : stat.totalFlags > 10 ? 'Modéré' : 'Faible'}
                    </div>
                  </div>

                  {/* Métriques principales */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        Total signalements
                      </span>
                      <span className="font-bold text-gray-900 text-lg">{stat.totalFlags}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 flex items-center gap-1">
                        <XCircle className="w-4 h-4" />
                        Urgents
                      </span>
                      <span className="font-bold text-red-600">{stat.urgentFlags}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Résolus
                      </span>
                      <span className="font-bold text-green-600">{stat.resolvedFlags}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Temps moyen
                      </span>
                      <span className="font-bold text-blue-600">{stat.avgResolutionTime}h</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        Niveau de risque
                      </span>
                      <span className={`font-bold ${riskLevel.color}`}>{riskLevel.level}</span>
                    </div>
                  </div>

                  {/* Barre de progression - Taux de résolution */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>Taux de résolution</span>
                      <span className="font-semibold">{stat.resolutionRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          stat.resolutionRate >= 90 ? 'bg-green-500' :
                          stat.resolutionRate >= 70 ? 'bg-yellow-500' :
                          stat.resolutionRate >= 50 ? 'bg-orange-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(stat.resolutionRate, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Indicateur de tendance */}
                  <div className="mt-3 flex items-center justify-center">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <TrendingUp className="w-3 h-3" />
                      Cliquer pour plus de détails
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Insights et recommandations */}
      {stats.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-indigo-900 mb-2">Analyse Départementale</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-indigo-800">
                <div>
                  <strong>Département le plus actif:</strong> {
                    stats.reduce((prev, curr) => prev.totalFlags > curr.totalFlags ? prev : curr).departmentLabel
                  }
                </div>
                <div>
                  <strong>Meilleur taux de résolution:</strong> {
                    stats.reduce((prev, curr) => prev.resolutionRate > curr.resolutionRate ? prev : curr).departmentLabel
                  } ({stats.reduce((prev, curr) => prev.resolutionRate > curr.resolutionRate ? prev : curr).resolutionRate}%)
                </div>
                <div>
                  <strong>Plus d'urgents:</strong> {
                    stats.reduce((prev, curr) => prev.urgentFlags > curr.urgentFlags ? prev : curr).departmentLabel
                  } ({stats.reduce((prev, curr) => prev.urgentFlags > curr.urgentFlags ? prev : curr).urgentFlags} urgents)
                </div>
                <div>
                  <strong>Temps de résolution le plus rapide:</strong> {
                    stats.reduce((prev, curr) => prev.avgResolutionTime < curr.avgResolutionTime ? prev : curr).departmentLabel
                  } ({stats.reduce((prev, curr) => prev.avgResolutionTime < curr.avgResolutionTime ? prev : curr).avgResolutionTime}h)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal détails département */}
      {showDepartmentDetail && selectedDepartment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{getDepartmentIcon(selectedDepartment.departmentKey)}</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedDepartment.departmentLabel}</h3>
                    <p className="text-gray-600">Analyse détaillée du département</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDepartmentDetail(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Métriques détaillées */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Total des signalements</label>
                    <div className="text-2xl font-bold text-gray-900">{selectedDepartment.totalFlags}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Signalements urgents</label>
                    <div className="text-2xl font-bold text-red-600">{selectedDepartment.urgentFlags}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Signalements résolus</label>
                    <div className="text-2xl font-bold text-green-600">{selectedDepartment.resolvedFlags}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">En attente</label>
                    <div className="text-2xl font-bold text-yellow-600">{selectedDepartment.pendingFlags}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Taux de résolution</label>
                    <div className="text-2xl font-bold text-blue-600">{selectedDepartment.resolutionRate}%</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Temps moyen</label>
                    <div className="text-2xl font-bold text-purple-600">{selectedDepartment.avgResolutionTime}h</div>
                  </div>
                </div>
              </div>

              {/* Graphique de progression */}
              <div className="mt-6">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Répartition des signalements</label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Résolus ({selectedDepartment.resolvedFlags})</span>
                    <span>{selectedDepartment.resolutionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${selectedDepartment.resolutionRate}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>Urgents ({selectedDepartment.urgentFlags})</span>
                    <span>{selectedDepartment.totalFlags > 0 ? Math.round((selectedDepartment.urgentFlags / selectedDepartment.totalFlags) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${selectedDepartment.totalFlags > 0 ? (selectedDepartment.urgentFlags / selectedDepartment.totalFlags) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* État vide */}
      {stats.length === 0 && (
        <div className="text-center py-16">
          <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Building className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune donnée disponible</h3>
          <p className="text-gray-500">Aucun signalement trouvé pour cette période.</p>
        </div>
      )}
    </div>
  );
};

export default DepartmentStats;