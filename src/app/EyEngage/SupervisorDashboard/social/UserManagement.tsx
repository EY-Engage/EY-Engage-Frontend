// components/admin/UserManagement.tsx - Design moderne avec enum corrigé
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Building, 
  Calendar, 
  AlertTriangle, 
  Search, 
  Filter, 
  User,
  Shield,
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  Flag,
  ChevronDown,
  MoreVertical,
  Eye,
  UserX,
  UserCheck,
  MessageSquare,
  Target,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { adminService } from '@/lib/services/adminService';
import { Warning } from '@mui/icons-material';

interface UserData {
  id: string;
  fullName: string;
  email: string;
  department: string;
  isActive: boolean;
  createdAt: string;
  warningCount: number;
  flagsReceived: number;
  flagsMade: number;
  departmentLabel: string;
  recentWarnings: Array<{
    id: string;
    message: string;
    severity: string;
    createdAt: string;
    moderatorName: string;
  }>;
  riskScore: number;
  accountAge: string;
  fonction?: string;
  profilePicture?: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [filters, setFilters] = useState({
    q: '',
    department: '',
    isActive: '',
    hasWarnings: '',
    page: 1,
    limit: 20
  });
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    withWarnings: 0,
    highRisk: 0
  });

  // CORRECTION: Utiliser les bonnes valeurs enum pour Department
  const departmentOptions = [
    { value: '', label: 'Tous les départements' },
    { value: 'Assurance', label: 'Assurance' },
    { value: 'Consulting', label: 'Consulting' },
    { value: 'StrategyAndTransactions', label: 'Strategy & Transactions' },
    { value: 'Tax', label: 'Tax' }
  ];

  useEffect(() => {
    loadUsers();
  }, [filters]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await adminService.searchUsers(filters);
      setUsers(data.users || []);
      
      // Calculer les statistiques
      const users = data.users || [];
      setStats({
        total: users.length,
        active: users.filter(u => u.isActive).length,
        withWarnings: users.filter(u => u.warningCount > 0).length,
        highRisk: users.filter(u => u.riskScore >= 60).length
      });
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId: string, isActive: boolean) => {
    setActionLoading(userId);
    try {
      const result = await adminService.updateUserStatus(userId, isActive);
      if (result.success) {
        await loadUsers();
        showNotification(result.message, 'success');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      showNotification('Erreur lors de la modification du statut', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const sendWarning = async (userId: string, message: string, severity: 'low' | 'medium' | 'high') => {
    try {
      const result = await adminService.sendUserWarning(userId, message, severity);
      if (result.success) {
        await loadUsers();
        showNotification('Avertissement envoyé avec succès', 'success');
      }
    } catch (error) {
      console.error('Error sending warning:', error);
      showNotification('Erreur lors de l\'envoi de l\'avertissement', 'error');
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    // Implémentation simple de notification
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
      type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => document.body.removeChild(notification), 3000);
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-700 bg-red-100';
    if (score >= 60) return 'text-orange-700 bg-orange-100';
    if (score >= 40) return 'text-yellow-700 bg-yellow-100';
    return 'text-green-700 bg-green-100';
  };

  const getDepartmentColor = (department: string) => {
    const colors = {
      'Assurance': 'bg-purple-100 text-purple-800',
      'Consulting': 'bg-blue-100 text-blue-800',
      'StrategyAndTransactions': 'bg-green-100 text-green-800',
      'Tax': 'bg-orange-100 text-orange-800'
    };
    return colors[department] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-ey-md p-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-5 gap-4 mb-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-ey-md p-6 h-32 animate-pulse">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="bg-white rounded-xl shadow-ey-md border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h2>
              <p className="text-gray-600 mt-1">Superviser et modérer les comptes utilisateur</p>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                showFilters 
                  ? 'bg-ey-yellow text-ey-black border-ey-yellow' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filtres
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Statistiques rapides */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <User className="w-8 h-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
                  <div className="text-sm text-blue-700">Total utilisateurs</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <UserCheck className="w-8 h-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-green-900">{stats.active}</div>
                  <div className="text-sm text-green-700">Actifs</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Warning className="w-8 h-8 text-yellow-600" />
                <div>
                  <div className="text-2xl font-bold text-yellow-900">{stats.withWarnings}</div>
                  <div className="text-sm text-yellow-700">Avec avertissements</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                <div>
                  <div className="text-2xl font-bold text-red-900">{stats.highRisk}</div>
                  <div className="text-sm text-red-700">Risque élevé</div>
                </div>
              </div>
            </div>
          </div>

          {/* Filtres */}
          {showFilters && (
            <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recherche</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Nom ou email..."
                    value={filters.q}
                    onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-ey-yellow"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Département</label>
                <select
                  value={filters.department}
                  onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ey-yellow"
                >
                  {departmentOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                <select
                  value={filters.isActive}
                  onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ey-yellow"
                >
                  <option value="">Tous</option>
                  <option value="true">Actifs</option>
                  <option value="false">Inactifs</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Avertissements</label>
                <select
                  value={filters.hasWarnings}
                  onChange={(e) => setFilters({ ...filters, hasWarnings: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ey-yellow"
                >
                  <option value="">Tous</option>
                  <option value="true">Avec avertissements</option>
                  <option value="false">Sans avertissements</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => setFilters({
                    q: '', department: '', isActive: '', hasWarnings: '', page: 1, limit: 20
                  })}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Liste des utilisateurs */}
      <div className="space-y-4">
        {users.map((user) => (
          <div 
            key={user.id} 
            className="bg-white rounded-xl shadow-ey-md hover:shadow-ey-lg transition-all duration-200 border border-gray-200"
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Avatar */}
                  <div className="relative">
                    {user.profilePicture ? (
                      <img 
                        src={user.profilePicture} 
                        alt={user.fullName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-ey-yellow to-ey-yellow-dark flex items-center justify-center">
                        <User className="w-6 h-6 text-ey-black" />
                      </div>
                    )}
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                      user.isActive ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                  </div>

                  <div className="flex-1">
                    {/* En-tête utilisateur */}
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{user.fullName}</h3>
                      
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Actif' : 'Inactif'}
                      </span>
                      
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDepartmentColor(user.department)}`}>
                        {user.departmentLabel}
                      </span>

                      {user.warningCount > 0 && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {user.warningCount} avertissement{user.warningCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    {/* Informations de base */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          {user.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Building className="w-4 h-4" />
                          {user.departmentLabel}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          Inscrit {user.accountAge}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Flag className="w-4 h-4" />
                          {user.flagsReceived} signalement{user.flagsReceived > 1 ? 's' : ''} reçu{user.flagsReceived > 1 ? 's' : ''}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Target className="w-4 h-4" />
                          {user.flagsMade} signalement{user.flagsMade > 1 ? 's' : ''} fait{user.flagsMade > 1 ? 's' : ''}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm text-gray-600">Score de risque:</div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(user.riskScore)}`}>
                            {user.riskScore}/100
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Avertissements récents */}
                    {user.recentWarnings.length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Warning className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-800">Avertissements récents</span>
                        </div>
                        <div className="space-y-1">
                          {user.recentWarnings.slice(0, 2).map((warning) => (
                            <div key={warning.id} className="text-sm text-yellow-800">
                              <span className="font-medium">{warning.severity.toUpperCase()}:</span> {warning.message}
                              <span className="text-yellow-600 ml-2">par {warning.moderatorName}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => updateUserStatus(user.id, !user.isActive)}
                    disabled={actionLoading === user.id}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      user.isActive
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    } ${actionLoading === user.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {user.isActive ? (
                      <>
                        <UserX className="w-4 h-4 inline mr-2" />
                        Désactiver
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4 inline mr-2" />
                        Activer
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setShowUserDetail(true);
                    }}
                    className="px-4 py-2 bg-ey-yellow text-ey-black rounded-lg hover:bg-ey-yellow-dark transition-colors font-medium"
                  >
                    <Eye className="w-4 h-4 inline mr-2" />
                    Détails
                  </button>

                  <button
                    onClick={() => {
                      const message = prompt('Message d\'avertissement:');
                      const severity = prompt('Sévérité (low/medium/high):') as 'low' | 'medium' | 'high';
                      if (message && severity) {
                        sendWarning(user.id, message, severity);
                      }
                    }}
                    className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors font-medium"
                  >
                    <MessageSquare className="w-4 h-4 inline mr-2" />
                    Avertir
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {users.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun utilisateur trouvé</h3>
            <p className="text-gray-500">Aucun utilisateur ne correspond aux critères de recherche.</p>
          </div>
        )}
      </div>

      {/* Modal détails utilisateur */}
      {showUserDetail && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Détails Utilisateur</h3>
                <button
                  onClick={() => setShowUserDetail(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                {/* Informations détaillées */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Nom complet</label>
                    <div className="text-gray-900 font-medium">{selectedUser.fullName}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <div className="text-gray-900">{selectedUser.email}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Département</label>
                    <div className="text-gray-900">{selectedUser.departmentLabel}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Score de risque</label>
                    <div className={`inline-block px-2 py-1 rounded text-sm font-medium ${getRiskColor(selectedUser.riskScore)}`}>
                      {selectedUser.riskScore}/100
                    </div>
                  </div>
                </div>

                {/* Historique des avertissements */}
                {selectedUser.recentWarnings.length > 0 && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Historique des avertissements</h4>
                    <div className="space-y-3">
                      {selectedUser.recentWarnings.map((warning) => (
                        <div key={warning.id} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              warning.severity === 'high' ? 'bg-red-100 text-red-800' :
                              warning.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {warning.severity.toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(warning.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-sm text-gray-800 mb-1">{warning.message}</div>
                          <div className="text-xs text-gray-600">Par {warning.moderatorName}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;