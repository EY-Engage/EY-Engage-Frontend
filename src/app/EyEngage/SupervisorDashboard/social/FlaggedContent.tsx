// components/admin/FlaggedContentList.tsx - Design moderne avec actions rapides
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  Filter, 
  Search, 
  ChevronDown,
  MessageSquare,
  FileText,
  User,
  Calendar,
  Target,
  Zap,
  ThumbsUp,
  ThumbsDown,
  MoreVertical,
  ExternalLink,
  Flag,
  Shield,
  Users,
  Trash2,
  EyeOff,
  AlertOctagon,
  CheckSquare,
  XCircle,
  Loader2
} from 'lucide-react';
import { adminService } from '@/lib/services/adminService';

interface FlaggedContentItem {
  id: string;
  targetId: string;
  targetType: string;
  reason: string;
  description?: string;
  status: string;
  isUrgent: boolean;
  reportCount: number;
  contentSnippet: string;
  createdAt: string;
  timeElapsed: string;
  priorityScore: number;
  statusLabel: string;
  contentAuthor: {
    id: string;
    fullName: string;
    department: string;
  };
  reportedBy: {
    id: string;
    fullName: string;
    email: string;
    department: string;
  };
  reviewedBy?: {
    id: string;
    fullName: string;
  };
  fullContent?: any;
  relatedFlagsCount: number;
}

const FlaggedContentList: React.FC = () => {
  const [content, setContent] = useState<FlaggedContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    department: '',
    urgent: '',
    page: 1,
    limit: 20
  });

  useEffect(() => {
    loadFlaggedContent();
  }, [filters]);

  const loadFlaggedContent = async () => {
    setLoading(true);
    try {
      const data = await adminService.getFlaggedContent(filters);
      setContent(data.flags || []);
    } catch (error) {
      console.error('Error loading flagged content:', error);
    } finally {
      setLoading(false);
    }
  };

  // Actions rapides de modération
  const handleQuickAction = async (flagId: string, action: 'approve' | 'reject') => {
    setActionLoading(flagId);
    try {
      const result = await adminService.quickModerationAction(flagId, action);
      if (result.success) {
        await loadFlaggedContent(); // Recharger la liste
        // Afficher notification de succès
        showNotification(result.message, 'success');
      }
    } catch (error) {
      console.error('Error in quick moderation:', error);
      showNotification('Erreur lors de l\'action de modération', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    // Implémentation simple de notification - à remplacer par votre système de toast
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
      type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => document.body.removeChild(notification), 3000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'under_review': return <Eye className="w-4 h-4 text-blue-600" />;
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'dismissed': return <XCircle className="w-4 h-4 text-gray-600" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'under_review': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'dismissed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (score: number) => {
    if (score >= 80) return 'border-l-red-500 bg-red-50';
    if (score >= 60) return 'border-l-orange-500 bg-orange-50';
    if (score >= 40) return 'border-l-yellow-500 bg-yellow-50';
    return 'border-l-green-500 bg-green-50';
  };

  const handleBulkAction = async (action: string) => {
    const selectedIds = Array.from(selectedItems);
    if (selectedIds.length === 0) return;

    try {
      await adminService.bulkModerationAction(selectedIds, action);
      setSelectedItems(new Set());
      await loadFlaggedContent();
      showNotification(`Action appliquée à ${selectedIds.length} signalement(s)`, 'success');
    } catch (error) {
      showNotification('Erreur lors de l\'action groupée', 'error');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-ey-md p-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-ey-md p-6 h-32 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="flex gap-2">
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec filtres et actions groupées */}
      <div className="bg-white rounded-xl shadow-ey-md border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Contenu Signalé</h2>
              <p className="text-gray-600 mt-1">Gérer et modérer les signalements de contenu</p>
            </div>
            
            <div className="flex items-center gap-3">
              {selectedItems.size > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {selectedItems.size} sélectionné{selectedItems.size > 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={() => handleBulkAction('approve')}
                    className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                  >
                    Approuver tout
                  </button>
                  <button
                    onClick={() => handleBulkAction('reject')}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                  >
                    Rejeter tout
                  </button>
                </div>
              )}
              
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
          </div>

          {/* Filtres */}
          {showFilters && (
            <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ey-yellow"
                >
                  <option value="">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="under_review">En examen</option>
                  <option value="resolved">Résolu</option>
                  <option value="dismissed">Rejeté</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ey-yellow"
                >
                  <option value="">Tous les types</option>
                  <option value="post">Publications</option>
                  <option value="comment">Commentaires</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Département</label>
                <select
                  value={filters.department}
                  onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ey-yellow"
                >
                  <option value="">Tous les départements</option>
                  <option value="Assurance">Assurance</option>
                  <option value="Consulting">Consulting</option>
                  <option value="StrategyAndTransactions">Strategy & Transactions</option>
                  <option value="Tax">Tax</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priorité</label>
                <select
                  value={filters.urgent}
                  onChange={(e) => setFilters({ ...filters, urgent: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ey-yellow"
                >
                  <option value="">Tous</option>
                  <option value="true">Urgent</option>
                  <option value="false">Normal</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => setFilters({
                    status: '', type: '', department: '', urgent: '', page: 1, limit: 20
                  })}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Statistiques rapides */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{content.length}</div>
              <div className="text-sm text-gray-600">Total affiché</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{content.filter(c => c.status === 'pending').length}</div>
              <div className="text-sm text-gray-600">En attente</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{content.filter(c => c.isUrgent).length}</div>
              <div className="text-sm text-gray-600">Urgents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{content.filter(c => c.status === 'resolved').length}</div>
              <div className="text-sm text-gray-600">Résolus</div>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des contenus signalés */}
      <div className="space-y-4">
        {content.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-xl shadow-ey-md border-l-4 ${getPriorityColor(item.priorityScore)} hover:shadow-ey-lg transition-all duration-200`}
          >
            <div className="p-6">
              {/* En-tête */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.id)}
                    onChange={(e) => {
                      const newSelected = new Set(selectedItems);
                      if (e.target.checked) {
                        newSelected.add(item.id);
                      } else {
                        newSelected.delete(item.id);
                      }
                      setSelectedItems(newSelected);
                    }}
                    className="mt-1 w-4 h-4 text-ey-yellow bg-gray-100 border-gray-300 rounded focus:ring-ey-yellow"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(item.status)}`}>
                        {getStatusIcon(item.status)}
                        {item.statusLabel}
                      </span>
                      
                      {item.isUrgent && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium border border-red-200">
                          <AlertOctagon className="w-3 h-3" />
                          Urgent
                        </span>
                      )}
                      
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                        {item.targetType === 'post' ? <FileText className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
                        {item.targetType === 'post' ? 'Publication' : 'Commentaire'}
                      </span>
                      
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {item.timeElapsed}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Motif: {item.reason}
                    </h3>
                    
                    {item.description && (
                      <p className="text-gray-600 mb-3">{item.description}</p>
                    )}

                    {/* Aperçu du contenu */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <div className="text-sm font-medium text-gray-700 mb-1">Contenu signalé:</div>
                      <div className="text-gray-800 italic line-clamp-3">
                        "{item.contentSnippet}"
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score de priorité */}
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${
                    item.priorityScore >= 80 ? 'bg-red-100 text-red-700' :
                    item.priorityScore >= 60 ? 'bg-orange-100 text-orange-700' :
                    item.priorityScore >= 40 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {item.priorityScore}
                  </div>
                  <span className="text-xs text-gray-500">Priorité</span>
                </div>
              </div>

              {/* Informations détaillées */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 bg-gray-50 rounded-lg p-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Auteur du contenu</span>
                  </div>
                  <div className="text-gray-900 font-medium">{item.contentAuthor.fullName}</div>
                  <div className="text-sm text-gray-600">{item.contentAuthor.department}</div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Flag className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Signalé par</span>
                  </div>
                  <div className="text-gray-900 font-medium">{item.reportedBy.fullName}</div>
                  <div className="text-sm text-gray-600">{item.reportedBy.department}</div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Statistiques</span>
                  </div>
                  <div className="text-gray-900 font-medium">{item.reportCount} signalement{item.reportCount > 1 ? 's' : ''}</div>
                  {item.relatedFlagsCount > 0 && (
                    <div className="text-sm text-gray-600">{item.relatedFlagsCount} signalement{item.relatedFlagsCount > 1 ? 's' : ''} lié{item.relatedFlagsCount > 1 ? 's' : ''}</div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  {/* Actions rapides */}
                  {(item.status === 'pending' || item.status === 'under_review') && (
                    <>
                      <button
                        onClick={() => handleQuickAction(item.id, 'approve')}
                        disabled={actionLoading === item.id}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                      >
                        {actionLoading === item.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckSquare className="w-4 h-4" />
                        )}
                        Signalement Fondé
                      </button>
                      
                      <button
                        onClick={() => handleQuickAction(item.id, 'reject')}
                        disabled={actionLoading === item.id}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                      >
                        {actionLoading === item.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                        Signalement Non Fondé
                      </button>
                    </>
                  )}
                  
                  {/* Action détaillée */}
                  <button
                    onClick={() => window.location.href = `/admin/flagged-content/${item.id}`}
                    className="flex items-center gap-2 px-4 py-2 bg-ey-yellow text-ey-black rounded-lg hover:bg-ey-yellow-dark transition-colors font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    Examiner en Détail
                  </button>
                </div>

                {/* Menu supplémentaire */}
                <div className="relative">
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {content.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun contenu signalé</h3>
            <p className="text-gray-500">Aucun signalement ne correspond aux critères de recherche.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlaggedContentList;