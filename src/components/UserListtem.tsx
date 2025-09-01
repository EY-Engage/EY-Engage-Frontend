import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  User, Mail, Phone, Building, MapPin, Calendar, Shield, 
  CheckCircle, AlertCircle, Clock, Briefcase, ExternalLink
} from "lucide-react";

interface UserListItemProps {
  user: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
    department?: string;
    fonction?: string;
    sector?: string;
    profilePicture?: string | null;
    createdAt?: string;
    updatedAt?: string;
    roles?: string[];
    isActive?: boolean;
  };
  action?: React.ReactNode;
  showDetails?: boolean;
  onClick?: () => void;
  isSelected?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
  showStatus?: boolean;
  enableProfileLink?: boolean; // Nouvelle prop pour contrôler l'affichage du lien
}

export default function UserListItem({ 
  user, 
  action, 
  showDetails = false, 
  onClick,
  isSelected = false,
  variant = 'default',
  showStatus = true,
  enableProfileLink = true // Par défaut activé
}: UserListItemProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const getProfilePictureUrl = (path?: string | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return path.startsWith('/')
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${path}`
      : `${process.env.NEXT_PUBLIC_BACKEND_URL}/${path}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'superadmin':
        return 'badge-ey-danger';
      case 'admin':
        return 'badge-ey-warning';
      case 'manager':
        return 'badge-ey-info';
      case 'consultant':
        return 'badge-ey-primary';
      default:
        return 'badge-ey-secondary';
    }
  };

  const getStatusColor = () => {
    if (user.isActive === false) return 'bg-ey-red';
    return 'bg-ey-green';
  };

  // Composant Avatar avec lien conditionnel
  const AvatarComponent = ({ size, showProfileLink = false }: { size: 'sm' | 'md' | 'lg', showProfileLink?: boolean }) => {
    const sizeClasses = {
      sm: 'w-8 h-8',
      md: 'w-12 h-12', 
      lg: 'w-16 h-16'
    };

    const iconSizes = {
      sm: 16,
      md: 24,
      lg: 32
    };

    const avatarContent = (
      <div className="relative flex-shrink-0">
        {user.profilePicture && !imageError ? (
          <div className={`relative ${sizeClasses[size]} rounded-full overflow-hidden border-2 border-ey-yellow shadow-ey-sm hover:shadow-ey-md transition-shadow`}>
            {imageLoading && (
              <div className="absolute inset-0 bg-ey-gray-200 animate-pulse rounded-full" />
            )}
            <Image
              src={getProfilePictureUrl(user.profilePicture) || ''}
              alt={`Photo de ${user.fullName}`}
              fill
              className="object-cover"
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageError(true);
                setImageLoading(false);
              }}
            />
          </div>
        ) : (
          <div className={`${sizeClasses[size]} bg-gradient-ey-primary rounded-full flex items-center justify-center border-2 border-ey-yellow shadow-ey-sm hover:shadow-ey-md transition-shadow`}>
            <User className={`w-${iconSizes[size]/4} h-${iconSizes[size]/4} text-ey-black`} size={iconSizes[size]} />
          </div>
        )}

        {showStatus && (
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor()} rounded-full border-2 border-ey-white shadow-ey-sm`} />
        )}

        {showProfileLink && enableProfileLink && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-ey-accent-blue rounded-full flex items-center justify-center shadow-ey-md opacity-80 hover:opacity-100 transition-opacity">
            <ExternalLink className="w-3 h-3 text-ey-white" />
          </div>
        )}
      </div>
    );

    if (showProfileLink && enableProfileLink) {
      return (
        <Link 
          href={`/EyEngage/profile/${user.id}`}
          className="relative group"
          title={`Voir le profil de ${user.fullName}`}
        >
          {avatarContent}
        </Link>
      );
    }

    return avatarContent;
  };

  const renderCompactView = () => (
    <div className="flex items-center gap-3">
      <AvatarComponent size="sm" showProfileLink={true} />

      {/* Informations compactes */}
      <div className="flex-1 min-w-0">
        {enableProfileLink ? (
          <Link 
            href={`/EyEngage/profile/${user.id}`}
            className="block"
          >
            <p className="font-medium text-ey-black text-ey-sm truncate hover:text-ey-accent-blue transition-colors">
              {user.fullName}
            </p>
            <p className="text-ey-gray-500 text-ey-xs truncate">{user.email}</p>
          </Link>
        ) : (
          <>
            <p className="font-medium text-ey-black text-ey-sm truncate">{user.fullName}</p>
            <p className="text-ey-gray-500 text-ey-xs truncate">{user.email}</p>
          </>
        )}
      </div>

      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );

  const renderDefaultView = () => (
    <div className="flex items-start gap-4">
      <AvatarComponent size="md" showProfileLink={true} />

      {/* Informations */}
      <div className="flex-1 min-w-0">
        {/* Nom et rôles */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            {enableProfileLink ? (
              <Link 
                href={`/EyEngage/profile/${user.id}`}
                className="block"
              >
                <h3 className="font-semibold text-ey-black text-ey-lg truncate hover:text-ey-accent-blue transition-colors">
                  {user.fullName}
                </h3>
              </Link>
            ) : (
              <h3 className="font-semibold text-ey-black text-ey-lg truncate">
                {user.fullName}
              </h3>
            )}
            
            {user.roles && user.roles.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {user.roles.slice(0, 2).map((role, index) => (
                  <span 
                    key={index}
                    className={`${getRoleBadgeColor(role)} text-ey-xs`}
                  >
                    <Shield className="w-3 h-3 mr-1" />
                    {role}
                  </span>
                ))}
                {user.roles.length > 2 && (
                  <span className="badge-ey-secondary text-ey-xs">
                    +{user.roles.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="flex items-center gap-2 text-ey-gray-600 text-ey-sm mb-1">
          <Mail className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{user.email}</span>
        </div>

        {/* Informations supplémentaires condensées */}
        <div className="flex flex-wrap items-center gap-4 text-ey-gray-500 text-ey-xs">
          {user.phoneNumber && (
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {user.phoneNumber}
            </span>
          )}
          {user.fonction && (
            <span className="flex items-center gap-1">
              <Briefcase className="w-3 h-3" />
              {user.fonction}
            </span>
          )}
          {user.department && (
            <span className="flex items-center gap-1">
              <Building className="w-3 h-3" />
              {user.department}
            </span>
          )}
        </div>
      </div>

      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );

  const renderDetailedView = () => (
    <div className="space-y-4">
      {/* En-tête avec avatar et nom */}
      <div className="flex items-start gap-4">
        <AvatarComponent size="lg" showProfileLink={true} />

        <div className="flex-1">
          {enableProfileLink ? (
            <Link 
              href={`/EyEngage/profile/${user.id}`}
              className="block"
            >
              <h3 className="text-ey-xl font-bold text-ey-black mb-1 hover:text-ey-accent-blue transition-colors">
                {user.fullName}
              </h3>
            </Link>
          ) : (
            <h3 className="text-ey-xl font-bold text-ey-black mb-1">
              {user.fullName}
            </h3>
          )}
          
          {user.roles && user.roles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {user.roles.map((role, index) => (
                <span 
                  key={index}
                  className={`${getRoleBadgeColor(role)} text-ey-sm`}
                >
                  <Shield className="w-4 h-4 mr-1" />
                  {role}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 text-ey-gray-600">
            <span className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
            <span className="text-ey-sm">
              {user.isActive !== false ? 'Actif' : 'Inactif'}
            </span>
          </div>
        </div>

        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>

      {/* Informations détaillées */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-ey-light-gray rounded-ey-lg">
        {/* Contact */}
        <div className="space-y-3">
          <h4 className="font-semibold text-ey-black text-ey-sm uppercase tracking-wider">
            Contact
          </h4>
          
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-ey-gray-500" />
              <span className="text-ey-sm text-ey-gray-700">{user.email}</span>
            </div>
            
            {user.phoneNumber && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-ey-gray-500" />
                <span className="text-ey-sm text-ey-gray-700">{user.phoneNumber}</span>
              </div>
            )}
          </div>
        </div>

        {/* Organisation */}
        <div className="space-y-3">
          <h4 className="font-semibold text-ey-black text-ey-sm uppercase tracking-wider">
            Organisation
          </h4>
          
          <div className="space-y-2">
            {user.fonction && (
              <div className="flex items-center gap-3">
                <Briefcase className="w-4 h-4 text-ey-gray-500" />
                <span className="text-ey-sm text-ey-gray-700">{user.fonction}</span>
              </div>
            )}
            
            {user.department && (
              <div className="flex items-center gap-3">
                <Building className="w-4 h-4 text-ey-gray-500" />
                <span className="text-ey-sm text-ey-gray-700">{user.department}</span>
              </div>
            )}
            
            {user.sector && (
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-ey-gray-500" />
                <span className="text-ey-sm text-ey-gray-700">{user.sector}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action rapide vers le profil */}
      {enableProfileLink && (
        <div className="flex justify-end pt-2 border-t border-ey-gray-200">
          <Link 
            href={`/EyEngage/profile/${user.id}`}
            className="flex items-center gap-2 text-ey-accent-blue hover:text-ey-accent-blue-dark text-ey-sm transition-colors"
          >
            <User className="w-4 h-4" />
            Voir le profil complet
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Dates */}
      {(user.createdAt || user.updatedAt) && (
        <div className="flex items-center justify-between text-ey-xs text-ey-gray-500 pt-2 border-t border-ey-gray-200">
          {user.createdAt && (
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              <span>Créé le {formatDate(user.createdAt)}</span>
            </div>
          )}
          
          {user.updatedAt && (
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3" />
              <span>Modifié le {formatDate(user.updatedAt)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const getContent = () => {
    switch (variant) {
      case 'compact':
        return renderCompactView();
      case 'detailed':
        return renderDetailedView();
      default:
        return renderDefaultView();
    }
  };

  return (
    <motion.div
      className={`
        card-ey p-4 transition-all duration-200
        ${onClick ? 'cursor-pointer hover:shadow-ey-lg hover:scale-[1.01]' : ''}
        ${isSelected ? 'ring-2 ring-ey-yellow shadow-ey-lg bg-ey-yellow/5' : 'hover:shadow-ey-md'}
        ${variant === 'compact' ? 'p-3' : variant === 'detailed' ? 'p-6' : 'p-4'}
      `}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -1 }}
    >
      {getContent()}
    </motion.div>
  );
}