'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserDto } from '@/dtos/user/UserDto';
import AddUserModal from './AddUserModal';
import UpdateUserModal from './UpdateUserModal';
import AddRoleModal from './AddRoleModal';
import AssignRoleModal from './AssignRoleModal';
import RouteGuard from '@/components/RouteGuard';
import Link from 'next/link';

import {
  Search, PlusIcon, User, Mail, Phone, Briefcase, Building, 
  Layers, Calendar, Clock, ImageIcon, Trash2, Edit2, Eye,
  Filter, Download, Upload, RefreshCw, MoreVertical,
  Shield, Users, AlertTriangle, CheckCircle, Settings,
  TrendingUp, BarChart3, Activity, Globe, Archive,
  UserCheck, UserX, UserPlus, Zap, Target, ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import { deleteUser } from '@/lib/services/userService';
import { useFormValidation } from '../FormValidation';
import EnhancedLoading, { TableSkeleton } from '../SkeletonLoader';
import UserListModal from './UserListModal';

interface UsersTableProps {
  initialUsers: UserDto[];
}

type ViewMode = 'table' | 'cards' | 'list';
type StatusFilter = 'all' | 'active' | 'inactive';

interface TableStats {
  total: number;
  active: number;
  inactive: number;
  newThisMonth: number;
  byDepartment: { name: string; count: number; percentage: number }[];
  byRole: { name: string; count: number; percentage: number }[];
  topDepartments: string[];
}

export default function UsersTable({ initialUsers }: UsersTableProps) {
  const [users, setUsers] = useState<UserDto[]>(initialUsers);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // États des modals
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDto | null>(null);
  const [isUpdateModalOpen, setUpdateModalOpen] = useState(false);
  const [isAddRoleModalOpen, setAddRoleModalOpen] = useState(false);
  const [selectedUserForRole, setSelectedUserForRole] = useState<UserDto | null>(null);
  const [isAssignRoleModalOpen, setAssignRoleModalOpen] = useState(false);
  const [isUserListModalOpen, setUserListModalOpen] = useState(false);

  // États de chargement pour les actions
  const [deletingUsers, setDeletingUsers] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Validation pour les filtres
  const { validateField, errors } = useFormValidation({
    search: [
      { maxLength: 100, message: 'La recherche ne peut pas dépasser 100 caractères' }
    ]
  });

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setUsers(initialUsers);
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [initialUsers]);

  // Filtrage des utilisateurs
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const searchMatch = !searchQuery || 
        user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phoneNumber?.includes(searchQuery) ||
        user.fonction?.toLowerCase().includes(searchQuery.toLowerCase());

      const departmentMatch = !departmentFilter || user.department === departmentFilter;
      const roleMatch = !roleFilter || user.roles?.includes(roleFilter);
      
      let statusMatch = true;
      if (statusFilter === 'active') statusMatch = user.isActive !== false;
      if (statusFilter === 'inactive') statusMatch = user.isActive === false;

      return searchMatch && departmentMatch && roleMatch && statusMatch;
    });
  }, [users, searchQuery, departmentFilter, roleFilter, statusFilter]);

  // Pagination
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Départements et rôles uniques
  const uniqueDepartments = useMemo(() => {
    return Array.from(new Set(users.map(u => u.department).filter(Boolean)));
  }, [users]);

  const uniqueRoles = useMemo(() => {
    const allRoles = users.flatMap(u => u.roles || []);
    return Array.from(new Set(allRoles));
  }, [users]);

  // Statistiques avancées
  const stats: TableStats = useMemo(() => {
    const activeUsers = users.filter(u => u.isActive !== false);
    const inactiveUsers = users.filter(u => u.isActive === false);
    
    // Nouveaux utilisateurs ce mois
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const newThisMonth = users.filter(u => {
      if (!u.createdAt) return false;
      const createdDate = new Date(u.createdAt);
      return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
    }).length;

    // Répartition par département
    const byDepartment = uniqueDepartments.map(dept => {
      const count = users.filter(u => u.department === dept).length;
      return {
        name: dept,
        count,
        percentage: Math.round((count / users.length) * 100)
      };
    }).sort((a, b) => b.count - a.count);

    // Répartition par rôle
    const byRole = uniqueRoles.map(role => {
      const count = users.filter(u => u.roles?.includes(role)).length;
      return {
        name: role,
        count,
        percentage: Math.round((count / users.length) * 100)
      };
    }).sort((a, b) => b.count - a.count);

    return {
      total: users.length,
      active: activeUsers.length,
      inactive: inactiveUsers.length,
      newThisMonth,
      byDepartment,
      byRole,
      topDepartments: byDepartment.slice(0, 3).map(d => d.name)
    };
  }, [users, uniqueDepartments, uniqueRoles]);

  const handleUserCreated = (newUser: UserDto) => {
    setUsers(u => [newUser, ...u]);
    setAddModalOpen(false);
    toast.success('Utilisateur créé avec succès !');
  };

  const handleUserUpdated = (updated: UserDto) => {
    setUsers(u => u.map(x => x.id === updated.id ? updated : x));
    setUpdateModalOpen(false);
    setEditingUser(null);
    toast.success('Utilisateur mis à jour avec succès !');
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) return;
    
    setDeletingUsers(prev => [...prev, id]);
    try {
      await deleteUser(id);
      setUsers(u => u.filter(x => x.id !== id));
      setSelectedUsers(prev => prev.filter(x => x !== id));
      toast.success("Utilisateur supprimé avec succès !");
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la suppression");
    } finally {
      setDeletingUsers(prev => prev.filter(x => x !== id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return;
    if (!confirm(`Voulez-vous vraiment supprimer ${selectedUsers.length} utilisateur(s) ?`)) return;

    setDeletingUsers(selectedUsers);
    try {
      await Promise.all(selectedUsers.map(id => deleteUser(id)));
      setUsers(u => u.filter(x => !selectedUsers.includes(x.id)));
      setSelectedUsers([]);
      toast.success(`${selectedUsers.length} utilisateur(s) supprimé(s) !`);
    } catch (e: any) {
      toast.error("Erreur lors de la suppression en lot");
    } finally {
      setDeletingUsers([]);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Données actualisées !');
    } catch (error) {
      toast.error('Erreur lors de l\'actualisation');
    } finally {
      setRefreshing(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const csvData = filteredUsers.map(user => ({
        'Nom': user.fullName || '',
        'Email': user.email || '',
        'Téléphone': user.phoneNumber || '',
        'Fonction': user.fonction || '',
        'Département': user.department || '',
        'Secteur': user.sector || '',
        'Rôles': user.roles?.join(', ') || '',
        'Statut': user.isActive === false ? 'Inactif' : 'Actif',
        'Créé le': user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : '',
        'Mis à jour': user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('fr-FR') : ''
      }));

      const headers = Object.keys(csvData[0]);
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => Object.values(row).map(value => `"${value}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `utilisateurs_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Export CSV généré !');
    } catch (error) {
      toast.error('Erreur lors de l\'export');
    } finally {
      setExporting(false);
    }
  };

  const handleImport = () => {
    setImporting(true);
    // Simulation d'import
    setTimeout(() => {
      setImporting(false);
      toast.success('Import terminé avec succès !');
    }, 2000);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setDepartmentFilter('');
    setRoleFilter('');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <RouteGuard allowedRoles={['SuperAdmin']}>
        <div className="p-6 space-y-6 bg-ey-light-gray min-h-screen">
          <div className="card-ey p-6">
            <EnhancedLoading 
              fullScreen={false}
              message="Chargement de la gestion des utilisateurs..."
              variant="pulse"
              size="lg"
            />
          </div>
          <TableSkeleton rows={8} columns={6} />
        </div>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard allowedRoles={['SuperAdmin']}>
      <div className="p-6 space-y-6 bg-ey-light-gray min-h-screen">
        {/* En-tête avec statistiques */}
        <motion.div 
          className="card-ey p-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
            {/* Titre et contrôles */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-ey-primary rounded-ey-2xl flex items-center justify-center shadow-ey-lg">
                  <Users className="w-9 h-9 text-ey-black" />
                </div>
                <div>
                  <h1 className="text-ey-4xl font-bold text-ey-black">
                    Gestion des Utilisateurs
                  </h1>
                  <p className="text-ey-gray-600 text-ey-lg">
                    Gérez les utilisateurs, rôles et permissions de votre organisation
                  </p>
                </div>
                
                <button
                  onClick={() => setShowStats(!showStats)}
                  className="ml-auto btn-ey-outline flex items-center gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  {showStats ? 'Masquer' : 'Afficher'} stats
                </button>
              </div>

              {/* Statistiques */}
              <AnimatePresence>
                {showStats && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
                  >
                    <div className="bg-ey-white p-4 rounded-ey-xl border border-ey-gray-200 hover:shadow-ey-md transition-shadow">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-ey-accent-blue/10 rounded-ey-xl flex items-center justify-center">
                          <Users className="w-6 h-6 text-ey-accent-blue" />
                        </div>
                        <div>
                          <div className="text-ey-3xl font-bold text-ey-black">{stats.total}</div>
                          <div className="text-ey-sm text-ey-gray-600">Total</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-ey-white p-4 rounded-ey-xl border border-ey-gray-200 hover:shadow-ey-md transition-shadow">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-ey-green/10 rounded-ey-xl flex items-center justify-center">
                          <UserCheck className="w-6 h-6 text-ey-green" />
                        </div>
                        <div>
                          <div className="text-ey-3xl font-bold text-ey-black">{stats.active}</div>
                          <div className="text-ey-sm text-ey-gray-600">Actifs</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-ey-white p-4 rounded-ey-xl border border-ey-gray-200 hover:shadow-ey-md transition-shadow">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-ey-red/10 rounded-ey-xl flex items-center justify-center">
                          <UserX className="w-6 h-6 text-ey-red" />
                        </div>
                        <div>
                          <div className="text-ey-3xl font-bold text-ey-black">{stats.inactive}</div>
                          <div className="text-ey-sm text-ey-gray-600">Inactifs</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-ey-white p-4 rounded-ey-xl border border-ey-gray-200 hover:shadow-ey-md transition-shadow">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-ey-yellow/10 rounded-ey-xl flex items-center justify-center">
                          <UserPlus className="w-6 h-6 text-ey-orange" />
                        </div>
                        <div>
                          <div className="text-ey-3xl font-bold text-ey-black">{stats.newThisMonth}</div>
                          <div className="text-ey-sm text-ey-gray-600">Ce mois</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-ey-white p-4 rounded-ey-xl border border-ey-gray-200 hover:shadow-ey-md transition-shadow">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-ey-purple/10 rounded-ey-xl flex items-center justify-center">
                          <Building className="w-6 h-6 text-ey-purple" />
                        </div>
                        <div>
                          <div className="text-ey-3xl font-bold text-ey-black">{uniqueDepartments.length}</div>
                          <div className="text-ey-sm text-ey-gray-600">Départements</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-ey-white p-4 rounded-ey-xl border border-ey-gray-200 hover:shadow-ey-md transition-shadow">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-ey-orange/10 rounded-ey-xl flex items-center justify-center">
                          <Shield className="w-6 h-6 text-ey-orange" />
                        </div>
                        <div>
                          <div className="text-ey-3xl font-bold text-ey-black">{uniqueRoles.length}</div>
                          <div className="text-ey-sm text-ey-gray-600">Rôles</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Actions principales */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setAddRoleModalOpen(true)}
                className="btn-ey-tertiary flex items-center gap-2 whitespace-nowrap"
              >
                <Shield className="w-5 h-5" />
                Nouveau Rôle
              </button>
              <button
                onClick={() => setAddModalOpen(true)}
                className="btn-ey-primary flex items-center gap-2 whitespace-nowrap"
              >
                <PlusIcon className="w-5 h-5" />
                Ajouter Utilisateur
              </button>
            </div>
          </div>
        </motion.div>

        {/* Barre d'outils */}
        <motion.div 
          className="card-ey p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Recherche */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Rechercher par nom, email, téléphone, fonction..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  validateField('search', e.target.value);
                  setCurrentPage(1);
                }}
                className={`input-ey pl-12 ${errors.search ? 'input-ey-error' : ''}`}
                maxLength={100}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ey-gray-400" />
              
              {errors.search && (
                <p className="text-ey-red text-ey-xs mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {errors.search}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn-ey-outline flex items-center gap-2 ${showFilters ? 'bg-ey-yellow text-ey-black' : ''}`}
              >
                <Filter className="w-4 h-4" />
                Filtres
                {(departmentFilter || roleFilter || statusFilter !== 'all') && (
                  <span className="w-2 h-2 bg-ey-red rounded-full"></span>
                )}
              </button>

              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="btn-ey-outline flex items-center gap-2"
                title="Actualiser les données"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Actualiser
              </button>

              <button
                onClick={handleImport}
                disabled={importing}
                className="btn-ey-secondary flex items-center gap-2"
                title="Importer des utilisateurs"
              >
                {importing ? (
                  <div className="loading-spinner-ey w-4 h-4" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                Import
              </button>

              <button
                onClick={handleExport}
                disabled={exporting || filteredUsers.length === 0}
                className="btn-ey-secondary flex items-center gap-2"
                title="Exporter au format CSV"
              >
                {exporting ? (
                  <div className="loading-spinner-ey w-4 h-4" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Export CSV
              </button>

              <button
                onClick={() => setUserListModalOpen(true)}
                className="btn-ey-tertiary flex items-center gap-2"
                title="Vue liste avancée"
              >
                <Eye className="w-4 h-4" />
                Vue Liste
              </button>

              {selectedUsers.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="btn-ey-danger flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer ({selectedUsers.length})
                </button>
              )}
            </div>
          </div>

          {/* Filtres avancés */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-ey-white rounded-ey-lg border border-ey-gray-200"
              >
                <div>
                  <label className="block text-ey-sm font-medium text-ey-black mb-2">
                    Département
                  </label>
                  <select
                    value={departmentFilter}
                    onChange={(e) => {
                      setDepartmentFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="select-ey"
                  >
                    <option value="">Tous les départements</option>
                    {uniqueDepartments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-ey-sm font-medium text-ey-black mb-2">
                    Rôle
                  </label>
                  <select
                    value={roleFilter}
                    onChange={(e) => {
                      setRoleFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="select-ey"
                  >
                    <option value="">Tous les rôles</option>
                    {uniqueRoles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-ey-sm font-medium text-ey-black mb-2">
                    Statut
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value as StatusFilter);
                      setCurrentPage(1);
                    }}
                    className="select-ey"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="active">Actifs uniquement</option>
                    <option value="inactive">Inactifs uniquement</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={clearAllFilters}
                    className="btn-ey-outline w-full"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Informations de filtrage */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4 text-ey-sm">
              <span className="font-medium text-ey-black">
                {filteredUsers.length} utilisateur(s) trouvé(s) sur {users.length} total
              </span>
              
              {selectedUsers.length > 0 && (
                <span className="badge-ey-primary">
                  {selectedUsers.length} sélectionné(s)
                </span>
              )}

              {(searchQuery || departmentFilter || roleFilter || statusFilter !== 'all') && (
                <span className="badge-ey-info">
                  Filtres actifs
                </span>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center gap-3">
                <span className="text-ey-sm text-ey-gray-600">
                  Page {currentPage} sur {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="btn-ey-outline text-ey-sm px-3 py-1 disabled:opacity-50"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="btn-ey-outline text-ey-sm px-3 py-1 disabled:opacity-50"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Tableau des utilisateurs */}
        <motion.div 
          className="card-ey overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="overflow-x-auto">
            <table className="table-ey">
              <thead>
                <tr>
                  <th className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                      onChange={() => {
                        if (selectedUsers.length === paginatedUsers.length) {
                          setSelectedUsers([]);
                        } else {
                          setSelectedUsers(paginatedUsers.map(u => u.id));
                        }
                      }}
                      className="w-4 h-4 text-ey-yellow bg-ey-white border-ey-gray-300 rounded focus:ring-ey-yellow"
                    />
                  </th>
                  {[
                    { icon: ImageIcon, label: 'Photo' },
                    { icon: User, label: 'Nom' },
                    { icon: Mail, label: 'Email' },
                    { icon: Phone, label: 'Téléphone' },
                    { icon: Briefcase, label: 'Fonction' },
                    { icon: Building, label: 'Département' },
                    { icon: Layers, label: 'Secteur' },
                    { icon: Shield, label: 'Rôles' },
                    { icon: Activity, label: 'Statut' },
                    { icon: Calendar, label: 'Créé le' },
                    { icon: Clock, label: 'Mis à jour' },
                    { label: 'Actions' },
                  ].map((h, i) => (
                    <th key={i}>
                      <div className="flex items-center gap-2">
                        {h.icon && <h.icon size={18} className="text-ey-yellow" />}
                        {h.label}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {paginatedUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className={`hover:bg-ey-yellow/5 ${selectedUsers.includes(user.id) ? 'bg-ey-yellow/10' : ''}`}
                    >
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => {
                            setSelectedUsers(prev =>
                              prev.includes(user.id)
                                ? prev.filter(id => id !== user.id)
                                : [...prev, user.id]
                            );
                          }}
                          className="w-4 h-4 text-ey-yellow bg-ey-white border-ey-gray-300 rounded focus:ring-ey-yellow"
                        />
                      </td>
                      <td>
                        <Link 
                          href={`/EyEngage/profile/${user.id}`}
                          className="relative group block"
                          title={`Voir le profil de ${user.fullName}`}
                        >
                          {user.profilePicture ? (
                            <img
                              src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${user.profilePicture}`}
                              alt={user.fullName}
                              className="w-12 h-12 rounded-full object-cover border-2 border-ey-yellow shadow-ey-sm hover:shadow-ey-md transition-all hover:scale-105"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-ey-primary flex items-center justify-center border-2 border-ey-yellow shadow-ey-sm hover:shadow-ey-md transition-all hover:scale-105">
                              <User size={20} className="text-ey-black" />
                            </div>
                          )}
                          {/* Indicateur de lien */}
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-ey-accent-blue rounded-full items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hidden group-hover:flex">
                            <ExternalLink className="w-3 h-3 text-ey-white" />
                          </div>
                        </Link>
                      </td>
                      <td>
                        <Link 
                          href={`/EyEngage/profile/${user.id}`}
                          className="font-semibold text-ey-black hover:text-ey-accent-blue transition-colors hover:underline"
                          title={`Voir le profil de ${user.fullName}`}
                        >
                          {user.fullName}
                        </Link>
                      </td>
                      <td className="text-ey-gray-700">{user.email}</td>
                      <td className="text-ey-gray-700">{user.phoneNumber || '-'}</td>
                      <td className="text-ey-gray-700">{user.fonction || '-'}</td>
                      <td className="text-ey-gray-700">{user.department || '-'}</td>
                      <td className="text-ey-gray-700">{user.sector || '-'}</td>
                      <td>
                        {user.roles && user.roles.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {user.roles.slice(0, 2).map((role, index) => (
                              <span key={index} className="badge-ey-secondary text-ey-xs">
                                {role}
                              </span>
                            ))}
                            {user.roles.length > 2 && (
                              <span className="badge-ey-info text-ey-xs">
                                +{user.roles.length - 2}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-ey-gray-400">-</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge-ey-${user.isActive === false ? 'danger' : 'success'} text-ey-xs`}>
                          {user.isActive === false ? 'Inactif' : 'Actif'}
                        </span>
                      </td>
                      <td className="text-ey-gray-700">{formatDate(user.createdAt)}</td>
                      <td className="text-ey-gray-700">{formatDate(user.updatedAt)}</td>
                      <td>
                        <div className="flex gap-2">
                          {deletingUsers.includes(user.id) ? (
                            <div className="loading-spinner-ey w-6 h-6" />
                          ) : (
                            <>
                              <Link
                                href={`/EyEngage/profile/${user.id}`}
                                className="p-2 bg-ey-green/10 rounded-ey-lg hover:bg-ey-green/20 text-ey-green transition-colors"
                                title="Voir le profil"
                              >
                                <Eye size={16} />
                              </Link>
                              <button
                                onClick={() => { setEditingUser(user); setUpdateModalOpen(true); }}
                                className="p-2 bg-ey-accent-blue/10 rounded-ey-lg hover:bg-ey-accent-blue/20 text-ey-accent-blue transition-colors"
                                title="Modifier"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => { setSelectedUserForRole(user); setAssignRoleModalOpen(true); }}
                                className="p-2 bg-ey-yellow/20 rounded-ey-lg hover:bg-ey-yellow/30 text-ey-black transition-colors"
                                title="Assigner un rôle"
                              >
                                <Shield size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(user.id)}
                                className="p-2 bg-ey-red/10 rounded-ey-lg hover:bg-ey-red/20 text-ey-red transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {paginatedUsers.length === 0 && (
                  <tr>
                    <td colSpan={13} className="p-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-20 h-20 bg-ey-gray-100 rounded-full flex items-center justify-center">
                          <Users className="w-10 h-10 text-ey-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-ey-xl font-semibold text-ey-gray-700 mb-2">
                            Aucun utilisateur trouvé
                          </h3>
                          <p className="text-ey-gray-500 mb-4">
                            {searchQuery || departmentFilter || roleFilter || statusFilter !== 'all'
                              ? 'Essayez de modifier vos critères de recherche ou filtres.'
                              : 'Commencez par ajouter votre premier utilisateur.'
                            }
                          </p>
                          {(searchQuery || departmentFilter || roleFilter || statusFilter !== 'all') && (
                            <button
                              onClick={clearAllFilters}
                              className="btn-ey-primary"
                            >
                              Effacer tous les filtres
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Modals */}
        <AddUserModal
          isOpen={isAddModalOpen}
          onClose={() => setAddModalOpen(false)}
          onUserCreated={handleUserCreated}
        />

        {editingUser && (
          <UpdateUserModal
            user={editingUser}
            isOpen={isUpdateModalOpen}
            onClose={() => {
              setUpdateModalOpen(false);
              setEditingUser(null);
            }}
            onUserUpdated={handleUserUpdated}
          />
        )}

        <AddRoleModal
          isOpen={isAddRoleModalOpen}
          onClose={() => setAddRoleModalOpen(false)}
        />

        {selectedUserForRole && (
          <AssignRoleModal
            user={selectedUserForRole}
            isOpen={isAssignRoleModalOpen}
            onClose={() => {
              setAssignRoleModalOpen(false);
              setSelectedUserForRole(null);
            }}
          />
        )}

        <UserListModal
          isOpen={isUserListModalOpen}
          onClose={() => setUserListModalOpen(false)}
          users={filteredUsers}
          title="Liste Avancée des Utilisateurs"
          subtitle={`${filteredUsers.length} utilisateur(s) • ${selectedUsers.length} sélectionné(s)`}
          allowSelection={true}
          selectedUsers={selectedUsers}
          onSelectionChange={setSelectedUsers}
          onUserEdit={(user) => { setEditingUser(user); setUpdateModalOpen(true); setUserListModalOpen(false); }}
          onUserDelete={handleDelete}
          allowExport={true}
          allowRefresh={true}
          onRefresh={handleRefresh}
        />
      </div>
    </RouteGuard>
  );
}