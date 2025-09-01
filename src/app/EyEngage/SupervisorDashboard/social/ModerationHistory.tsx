// components/admin/ModerationHistory.tsx - Historique complet avec design moderne
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  User, 
  FileText, 
  Filter, 
  Search, 
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Eye,
  MessageSquare,
  Shield,
  Activity,
  Target,
  ChevronDown,
  ExternalLink,
  RefreshCw,
  Download,
  MoreVertical,
  AlertOctagon,
  Trash2,
  EyeOff,
  UserX,
  UserCheck
} from 'lucide-react';
import { adminService } from '@/lib/services/adminService';

interface ModerationHistoryItem {
  id: string;
  targetId: string;
  targetType: string;
  action: string;
  reason?: string;
  moderatorId: string;
  moderatorName: string;
  contentAuthorId: string;
  contentAuthorName: string;
  createdAt: string;
  resolvedAt?: string;
  actionLabel: string;
  timeElapsed: string;
  originalFlag?: {
    reason: string;
    description: string;
    reportCount: number;
    isUrgent: boolean;
  };
  moderator?: {
    id: string;
    fullName: string;
    email: string;
    department: string;
    profilePicture?: string;
  };
  targetTypeLabel: string;
}

const ModerationHistory: React.FC = () => {
  const [history, setHistory] = useState<ModerationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ModerationHistoryItem | null>(null);
  const [showItemDetail, setShowItemDetail] = useState(false);
  const [filters, setFilters] = useState({
    moderatorId: '',
    action: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 20
  });
  const [stats, setStats] = useState({
    total: 0,
    thisWeek: 0,
    uniqueModerators: 0,
    avgResolutionTime: 0
  });

  useEffect(() => {
    loadHistory();
  }, [filters]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await adminService.getModerationHistory(filters);
      setHistory(data.history || []);
      
      // Calculer les statistiques
      const historyItems = data.history || [];
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      setStats({
        total: data.total || historyItems.length,
        thisWeek: historyItems.filter(item => 
          new Date(item.resolvedAt || item.createdAt) > oneWeekAgo
        ).length,
        uniqueModerators: data.summary?.uniqueModerators || new Set(historyItems.map(h => h.moderatorId)).size,
        avgResolutionTime: 2.5 // À calculer depuis les données
      });
    } catch (error) {
      console.error('Error loading moderation history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'no_action': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'content_hidden': return <EyeOff className="w-4 h-4 text-orange-600" />;
      case 'content_removed': return <Trash2 className="w-4 h-4 text-red-600" />;
      case 'warning_sent': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'user_suspended': return <UserX className="w-4 h-4 text-red-700" />;
      case 'user_banned': return <UserX className="w-4 h-4 text-red-800" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'no_action': return 'bg-green-100 text-green-800 border-green-200';
      case 'content_hidden': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'content_removed': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning_sent': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'user_suspended': return 'bg-red-200 text-red-900 border-red-300';
      case 'user_banned': return 'bg-red-300 text-red-900 border-red-400';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActionSeverity = (action: string): 'low' | 'medium' | 'high' => {
    switch (action) {
      case 'no_action': return 'low';
      case 'warning_sent': 
      case 'content_hidden': return 'medium';
      case 'content_removed':
      case 'user_suspended':
      case 'user_banned': return 'high';
      default: return 'low';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-ey-md p-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-ey-md p-6 h-24 animate-pulse">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
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
              <h2 className="text-2xl font-bold text-gray-900">Historique de Modération</h2>
              <p className="text-gray-600 mt-1">Journal complet des actions de modération effectuées</p>
            </div>
            
            <div className="flex items-center gap-3">
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
              
              <button
                onClick={loadHistory}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Statistiques rapides */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
                  <div className="text-sm text-blue-700">Actions totales</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Activity className="w-8 h-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-green-900">{stats.thisWeek}</div>
                  <div className="text-sm text-green-700">Cette semaine</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold text-purple-900">{stats.uniqueModerators}</div>
                  <div className="text-sm text-purple-700">Modérateurs actifs</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-yellow-600" />
                <div>
                  <div className="text-2xl font-bold text-yellow-900">{stats.avgResolutionTime}h</div>
                  <div className="text-sm text-yellow-700">Temps moyen</div>
                </div>
              </div>
            </div>
          </div>

          {/* Filtres */}
          {showFilters && (
            <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Modérateur</label>
                <select
                  value={filters.moderatorId}
                  onChange={(e) => setFilters({ ...filters, moderatorId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ey-yellow"
                >
                  <option value="">Tous les modérateurs</option>
                  {/* Options des modérateurs disponibles */}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
                <select
                  value={filters.action}
                  onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ey-yellow"
                >
                  <option value="">Toutes les actions</option>
                  <option value="no_action">Aucune action</option>
                  <option value="content_hidden">Contenu masqué</option>
                  <option value="content_removed">Contenu supprimé</option>
                  <option value="warning_sent">Avertissement envoyé</option>
                  <option value="user_suspended">Utilisateur suspendu</option>
                  <option value="user_banned">Utilisateur banni</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date début</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ey-yellow"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date fin</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ey-yellow"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Liste de l'historique */}
      <div className="space-y-4">
        {history.map((item) => {
          const severity = getActionSeverity(item.action);
          
          return (
            <div
              key={item.id}
              className={`bg-white rounded-xl shadow-ey-md border-l-4 hover:shadow-ey-lg transition-all duration-200 ${
                severity === 'high' ? 'border-l-red-500' :
                severity === 'medium' ? 'border-l-yellow-500' :
                'border-l-green-500'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Avatar du modérateur */}
                    <div className="relative">
                      {item.moderator?.profilePicture ? (
                        <img 
                          src={item.moderator.profilePicture} 
                          alt={item.moderatorName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-ey-yellow to-ey-yellow-dark flex items-center justify-center">
                          <Shield className="w-6 h-6 text-ey-black" />
                        </div>
                      )}
                      <div className={`absolute -bottom-1 -right-1 p-1 rounded-full border-2 border-white ${
                        severity === 'high' ? 'bg-red-500' :
                        severity === 'medium' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}>
                        {getActionIcon(item.action)}
                      </div>
                    </div>

                    <div className="flex-1">
                      {/* En-tête de l'action */}
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getActionColor(item.action)}`}>
                          {getActionIcon(item.action)}
                          {item.actionLabel}
                        </span>
                        
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                          {item.targetType === 'post' ? <FileText className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
                          {item.targetTypeLabel}
                        </span>
                        
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {item.timeElapsed}
                        </span>

                        {item.originalFlag?.isUrgent && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                            <AlertOctagon className="w-3 h-3" />
                            Urgent
                          </span>
                        )}
                      </div>

                      {/* Détails de l'action */}
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Action effectuée par {item.moderatorName}
                        </h3>
                        
                        {item.reason && (
                          <p className="text-gray-700 mb-2">
                            <strong>Raison:</strong> {item.reason}
                          </p>
                        )}

                        {item.originalFlag && (
                          <div className="bg-gray-50 rounded-lg p-3 mb-3">
                            <div className="text-sm font-medium text-gray-700 mb-1">Signalement original:</div>
                            <div className="text-sm text-gray-600">
                              <div><strong>Motif:</strong> {item.originalFlag.reason}</div>
                              {item.originalFlag.description && (
                                <div><strong>Description:</strong> {item.originalFlag.description}</div>
                              )}
                              <div><strong>Nombre de signalements:</strong> {item.originalFlag.reportCount}</div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Informations sur les personnes impliquées */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Modérateur</span>
                          </div>
                          <div className="text-gray-900 font-medium">{item.moderatorName}</div>
                          {item.moderator && (
                            <div className="text-sm text-gray-600">{item.moderator.department}</div>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Auteur du contenu</span>
                          </div>
                          <div className="text-gray-900 font-medium">{item.contentAuthorName}</div>
                          <div className="text-sm text-gray-600">Contenu {item.targetTypeLabel.toLowerCase()}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu d'actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setShowItemDetail(true);
                      }}
                      className="flex items-center gap-2 px-3 py-2 bg-ey-yellow text-ey-black rounded-lg hover:bg-ey-yellow-dark transition-colors font-medium text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      Détails
                    </button>
                    
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Timeline si résolu */}
                {item.resolvedAt && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Résolu le {new Date(item.resolvedAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      <div>
                        Temps de traitement: {item.timeElapsed}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {history.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun historique trouvé</h3>
            <p className="text-gray-500">Aucune action de modération ne correspond aux critères de recherche.</p>
          </div>
        )}
      </div>

      {/* Modal détails de l'action */}
      {showItemDetail && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full m-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Détails de l'Action de Modération</h3>
                <button
                  onClick={() => setShowItemDetail(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                {/* Résumé de l'action */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    {getActionIcon(selectedItem.action)}
                    <h4 className="text-lg font-semibold text-gray-900">{selectedItem.actionLabel}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(selectedItem.action)}`}>
                      {selectedItem.action.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>ID de l'action:</strong> {selectedItem.id}
                    </div>
                    <div>
                      <strong>Type de contenu:</strong> {selectedItem.targetTypeLabel}
                    </div>
                    <div>
                      <strong>Date de création:</strong> {new Date(selectedItem.createdAt).toLocaleString('fr-FR')}
                    </div>
                    {selectedItem.resolvedAt && (
                      <div>
                        <strong>Date de résolution:</strong> {new Date(selectedItem.resolvedAt).toLocaleString('fr-FR')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Raison détaillée */}
                {selectedItem.reason && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Raison de l'action</h4>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-yellow-800">{selectedItem.reason}</p>
                    </div>
                  </div>
                )}

                {/* Signalement original */}
                {selectedItem.originalFlag && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Signalement Original</h4>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="space-y-2">
                        <div><strong>Motif:</strong> {selectedItem.originalFlag.reason}</div>
                        {selectedItem.originalFlag.description && (
                          <div><strong>Description:</strong> {selectedItem.originalFlag.description}</div>
                        )}
                        <div><strong>Nombre de signalements:</strong> {selectedItem.originalFlag.reportCount}</div>
                        {selectedItem.originalFlag.isUrgent && (
                          <div className="flex items-center gap-2 text-red-700">
                            <AlertOctagon className="w-4 h-4" />
                            <strong>Marqué comme urgent</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Informations sur le modérateur */}
                {selectedItem.moderator && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Modérateur</h4>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-4">
                        {selectedItem.moderator.profilePicture ? (
                          <img 
                            src={selectedItem.moderator.profilePicture} 
                            alt={selectedItem.moderator.fullName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center">
                            <Shield className="w-6 h-6 text-blue-600" />
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-blue-900">{selectedItem.moderator.fullName}</div>
                          <div className="text-sm text-blue-700">{selectedItem.moderator.email}</div>
                          <div className="text-sm text-blue-600">{selectedItem.moderator.department}</div>
                        </div>
                      </div>
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

export default ModerationHistory;