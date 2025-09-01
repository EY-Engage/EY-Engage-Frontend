// components/UserListModal.tsx
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserDto } from "@/dtos/user/UserDto";
import { 
  X, Search, Users, Filter, SortAsc, SortDesc, Download, 
  Mail, Phone, Building, User, Shield, Grid3X3, List,
  FileSpreadsheet, Printer, Share2, Settings, RefreshCw,
  CheckCircle, AlertTriangle, Info, TrendingUp
} from "lucide-react";
import toast from 'react-hot-toast';
import { useFormValidation } from "../FormValidation";
import EnhancedLoading from "../SkeletonLoader";
import UserListItem from "../UserListtem";

interface UserListModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserDto[];
  title: string;
  subtitle?: string;
  allowSelection?: boolean;
  selectedUsers?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  showActions?: boolean;
  maxHeight?: string;
  onUserEdit?: (user: UserDto) => void;
  onUserView?: (user: UserDto) => void;
  onUserDelete?: (user: UserDto) => void;
  allowExport?: boolean;
  allowRefresh?: boolean;
  onRefresh?: () => void;
}

type SortField = 'name' | 'email' | 'department' | 'createdAt' | 'fonction';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'list' | 'grid' | 'compact';

export default function UserListModal({
  isOpen,
  onClose,
  users,
  title,
  subtitle,
  allowSelection = false,
  selectedUsers = [],
  onSelectionChange,
  showActions = true,
  maxHeight = "80vh",
  onUserEdit,
  onUserView,
  onUserDelete,
  allowExport = true,
  allowRefresh = false,
  onRefresh
}: UserListModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // Validation pour la recherche
  const { errors, validateField } = useFormValidation({
    search: [
      { maxLength: 100, message: 'La recherche ne peut pas dépasser 100 caractères' }
    ]
  });

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Filtrage et tri des utilisateurs
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter(user => {
      const searchMatch = !searchQuery || 
        user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phoneNumber?.includes(searchQuery) ||
        user.fonction?.toLowerCase().includes(searchQuery.toLowerCase());

      const departmentMatch = !departmentFilter || user.department === departmentFilter;
      const roleMatch = !roleFilter || user.roles?.includes(roleFilter);

      return searchMatch && departmentMatch && roleMatch ;
    });

    // Tri
    filtered.sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';

      switch (sortField) {
        case 'name':
          aValue = a.fullName?.toLowerCase() || '';
          bValue = b.fullName?.toLowerCase() || '';
          break;
        case 'email':
          aValue = a.email?.toLowerCase() || '';
          bValue = b.email?.toLowerCase() || '';
          break;
        case 'department':
          aValue = a.department?.toLowerCase() || '';
          bValue = b.department?.toLowerCase() || '';
          break;
        case 'fonction':
          aValue = a.fonction?.toLowerCase() || '';
          bValue = b.fonction?.toLowerCase() || '';
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt || '').getTime();
          bValue = new Date(b.createdAt || '').getTime();
          break;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [users, searchQuery, departmentFilter, roleFilter, statusFilter, sortField, sortDirection]);

  // Obtenir les départements uniques
  const uniqueDepartments = useMemo(() => {
    return Array.from(new Set(users.map(u => u.department).filter(Boolean)));
  }, [users]);

  // Obtenir les rôles uniques
  const uniqueRoles = useMemo(() => {
    const allRoles = users.flatMap(u => u.roles || []);
    return Array.from(new Set(allRoles));
  }, [users]);

  // Statistiques
  const stats = useMemo(() => {
    
    return {
      total: users.length,
      filtered: filteredAndSortedUsers.length,
      departments: uniqueDepartments.length,
      roles: uniqueRoles.length
    };
  }, [users, filteredAndSortedUsers, uniqueDepartments, uniqueRoles]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleUserSelection = (userId: string) => {
    if (!allowSelection || !onSelectionChange) return;

    const newSelection = selectedUsers.includes(userId)
      ? selectedUsers.filter(id => id !== userId)
      : [...selectedUsers, userId];

    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    if (!allowSelection || !onSelectionChange) return;

    if (selectedUsers.length === filteredAndSortedUsers.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(filteredAndSortedUsers.map(u => u.id));
    }
  };

  const handleRefresh = async () => {
    if (!onRefresh) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
      toast.success('Liste actualisée !');
    } catch (error) {
      toast.error('Erreur lors de l\'actualisation');
    } finally {
      setIsRefreshing(false);
    }
  };

  const exportToCSV = () => {
    const csvData = filteredAndSortedUsers.map(user => ({
      'Nom': user.fullName || '',
      'Email': user.email || '',
      'Téléphone': user.phoneNumber || '',
      'Fonction': user.fonction || '',
      'Département': user.department || '',
      'Secteur': user.sector || '',
      'Rôles': user.roles?.join(', ') || '',
      'Créé le': user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : ''
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
  };

  const printList = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const printContent = `
        <html>
          <head>
            <title>Liste des Utilisateurs - EY Engage</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #FFE600; padding-bottom: 20px; }
              .user { margin-bottom: 15px; padding: 10px; border: 1px solid #ddd; }
              .user-name { font-weight: bold; font-size: 16px; }
              .user-info { color: #666; font-size: 14px; margin-top: 5px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>EY Engage</h1>
              <h2>${title}</h2>
              <p>Généré le ${new Date().toLocaleDateString('fr-FR')}</p>
            </div>
            ${filteredAndSortedUsers.map(user => `
              <div class="user">
                <div class="user-name">${user.fullName}</div>
                <div class="user-info">
                  Email: ${user.email}<br>
                  ${user.phoneNumber ? `Téléphone: ${user.phoneNumber}<br>` : ''}
                  ${user.department ? `Département: ${user.department}<br>` : ''}
                  ${user.fonction ? `Fonction: ${user.fonction}` : ''}
                </div>
              </div>
            `).join('')}
          </body>
        </html>
      `;
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setDepartmentFilter('');
    setRoleFilter('');
    setStatusFilter('');
    setSortField('name');
    setSortDirection('asc');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="modal-ey">
        <motion.div 
          className="modal-content-ey max-w-6xl w-full"
          style={{ maxHeight }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* En-tête */}
          <div className="modal-header-ey bg-ey-black text-ey-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-ey-yellow rounded-ey-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-ey-black" />
              </div>
              <div>
                <h3 className="text-ey-xl font-bold text-ey-white">{title}</h3>
                {subtitle && (
                  <p className="text-ey-gray-300 text-ey-sm">{subtitle}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Statistiques rapides */}
              <div className="flex items-center gap-4 text-ey-sm text-ey-gray-300 mr-4">
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  {stats.filtered}/{stats.total}
                </span>
              </div>

              <button
                onClick={onClose}
                className="p-2 hover:bg-ey-gray-800 rounded-ey-lg transition-colors"
              >
                <X className="w-6 h-6 text-ey-white" />
              </button>
            </div>
          </div>

          {/* Barre d'outils */}
          <div className="p-4 border-b border-ey-gray-200 bg-ey-light-gray">
            {/* Recherche et contrôles principaux */}
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
              {/* Recherche */}
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Rechercher par nom, email, téléphone..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    validateField('search', e.target.value);
                  }}
                  className={`input-ey pl-12 ${errors.search ? 'input-ey-error' : ''}`}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ey-gray-400" />
                {errors.search && (
                  <p className="text-ey-red text-ey-sm mt-1">{errors.search}</p>
                )}
              </div>

              {/* Modes d'affichage */}
              <div className="flex gap-2">
                <div className="flex bg-ey-white rounded-ey-lg p-1 border border-ey-gray-200">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-ey-md transition-colors ${
                      viewMode === 'list' ? 'bg-ey-yellow text-ey-black' : 'text-ey-gray-600 hover:bg-ey-gray-100'
                    }`}
                    title="Vue liste"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-ey-md transition-colors ${
                      viewMode === 'grid' ? 'bg-ey-yellow text-ey-black' : 'text-ey-gray-600 hover:bg-ey-gray-100'
                    }`}
                    title="Vue grille"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('compact')}
                    className={`p-2 rounded-ey-md transition-colors ${
                      viewMode === 'compact' ? 'bg-ey-yellow text-ey-black' : 'text-ey-gray-600 hover:bg-ey-gray-100'
                    }`}
                    title="Vue compacte"
                  >
                    <Users className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`btn-ey-outline flex items-center gap-2 ${showFilters ? 'bg-ey-yellow text-ey-black' : ''}`}
                >
                  <Filter className="w-4 h-4" />
                  Filtres
                </button>

                {allowRefresh && (
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="btn-ey-outline flex items-center gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Actualiser
                  </button>
                )}

                {allowExport && (
                  <div className="relative">
                    <button
                      onClick={exportToCSV}
                      className="btn-ey-secondary flex items-center gap-2"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      Export
                    </button>
                  </div>
                )}

                <button
                  onClick={printList}
                  className="btn-ey-tertiary flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Imprimer
                </button>
              </div>
            </div>

            {/* Filtres avancés */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-ey-white rounded-ey-lg border border-ey-gray-200"
                >
                  {/* Filtre par département */}
                  <div>
                    <label className="block text-ey-sm font-medium text-ey-black mb-1">
                      Département
                    </label>
                    <select
                      value={departmentFilter}
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                      className="select-ey"
                    >
                      <option value="">Tous</option>
                      {uniqueDepartments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  {/* Filtre par rôle */}
                  <div>
                    <label className="block text-ey-sm font-medium text-ey-black mb-1">
                      Rôle
                    </label>
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="select-ey"
                    >
                      <option value="">Tous</option>
                      {uniqueRoles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>

                  {/* Filtre par statut */}
                  <div>
                    <label className="block text-ey-sm font-medium text-ey-black mb-1">
                      Statut
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="select-ey"
                    >
                      <option value="">Tous</option>
                      <option value="active">Actifs</option>
                      <option value="inactive">Inactifs</option>
                    </select>
                  </div>

                  {/* Tri */}
                  <div>
                    <label className="block text-ey-sm font-medium text-ey-black mb-1">
                      Trier par
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={sortField}
                        onChange={(e) => setSortField(e.target.value as SortField)}
                        className="select-ey flex-1"
                      >
                        <option value="name">Nom</option>
                        <option value="email">Email</option>
                        <option value="department">Département</option>
                        <option value="fonction">Fonction</option>
                        <option value="createdAt">Date création</option>
                      </select>
                      <button
                        onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                        className="btn-ey-outline px-3"
                      >
                        {sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Bouton de réinitialisation */}
                  <div className="md:col-span-4 flex justify-end">
                    <button
                      onClick={clearAllFilters}
                      className="btn-ey-outline text-ey-sm"
                    >
                      Réinitialiser tous les filtres
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Statistiques et sélection */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-6 text-ey-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-ey-gray-500" />
                  <span className="text-ey-gray-700">
                    <strong className="text-ey-black">{filteredAndSortedUsers.length}</strong> utilisateur(s)
                  </span>
                </div>

                {allowSelection && selectedUsers.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-ey-accent-blue" />
                    <span className="text-ey-accent-blue font-medium">
                      {selectedUsers.length} sélectionné(s)
                    </span>
                  </div>
                )}
              </div>

              {allowSelection && (
                <button
                  onClick={handleSelectAll}
                  className="btn-ey-outline text-ey-sm"
                >
                  {selectedUsers.length === filteredAndSortedUsers.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                </button>
              )}
            </div>
          </div>

          {/* Liste des utilisateurs */}
          <div className="modal-body-ey overflow-y-auto scrollbar-ey" style={{ maxHeight: '60vh' }}>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <EnhancedLoading 
                  fullScreen={false}
                  message="Chargement des utilisateurs..."
                  variant="dots"
                />
              </div>
            ) : filteredAndSortedUsers.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-ey-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-12 h-12 text-ey-gray-400" />
                </div>
                <h3 className="text-ey-xl font-semibold text-ey-gray-700 mb-3">
                  Aucun utilisateur trouvé
                </h3>
                <p className="text-ey-gray-500 mb-6 max-w-md mx-auto">
                  {searchQuery || departmentFilter || roleFilter || statusFilter 
                    ? 'Aucun utilisateur ne correspond à vos critères de recherche. Essayez de modifier vos filtres.'
                    : 'La liste est vide pour le moment.'
                  }
                </p>
                {(searchQuery || departmentFilter || roleFilter || statusFilter) && (
                  <button
                    onClick={clearAllFilters}
                    className="btn-ey-primary"
                  >
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            ) : (
              <div className={`p-4 ${
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                  : 'space-y-3'
              }`}>
                {filteredAndSortedUsers.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <UserListItem 
                      user={user}
                      variant={viewMode === 'compact' ? 'compact' : viewMode === 'grid' ? 'default' : 'detailed'}
                      showDetails={viewMode !== 'compact'}
                      onClick={allowSelection ? () => handleUserSelection(user.id) : undefined}
                      isSelected={selectedUsers.includes(user.id)}
                      action={allowSelection ? (
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => handleUserSelection(user.id)}
                            className="w-5 h-5 text-ey-yellow bg-ey-white border-ey-gray-300 rounded focus:ring-ey-yellow focus:ring-2"
                          />
                        </div>
                      ) : showActions ? (
                        <div className="flex gap-2">
                          {onUserView && (
                            <button
                              onClick={() => onUserView(user)}
                              className="p-2 bg-ey-accent-blue/10 rounded-ey-lg hover:bg-ey-accent-blue/20 text-ey-accent-blue"
                              title="Voir"
                            >
                              <User className="w-4 h-4" />
                            </button>
                          )}
                          {onUserEdit && (
                            <button
                              onClick={() => onUserEdit(user)}
                              className="p-2 bg-ey-yellow/20 rounded-ey-lg hover:bg-ey-yellow/30 text-ey-black"
                              title="Modifier"
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ) : undefined}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Pied de page */}
          <div className="modal-footer-ey bg-ey-light-gray">
            <div className="flex items-center justify-between">
              <div className="text-ey-sm text-ey-gray-600">
                {filteredAndSortedUsers.length} utilisateur(s) affiché(s) sur {users.length} total
                {stats.departments > 0 && ` • ${stats.departments} département(s)`}
                {stats.roles > 0 && ` • ${stats.roles} rôle(s)`}
              </div>
              
              <div className="flex gap-3">
                {allowSelection && selectedUsers.length > 0 && (
                  <button
                    onClick={() => onSelectionChange && onSelectionChange([])}
                    className="btn-ey-outline"
                  >
                    Effacer la sélection
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="btn-ey-primary"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}