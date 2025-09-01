'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Clock,
  Building,
  User,
  ChevronLeft,
  ExternalLink,
  Download,
  Eye,
  Star,
  Flag,
  Edit,
  Trash2,
  Check
} from 'lucide-react';
import { EventDto } from '@/dtos/event/EventDto';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CommentSection from './CommentSection';
import EventActions from './EventActions/page';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import EnhancedLoading from '@/components/SkeletonLoader';

/**
 * Composant EventDetails - Page détaillée d'un événement
 * Fonctionnalités:
 * - Affichage complet des informations événement
 * - Actions utilisateur (participation, intérêt, partage)
 * - Section commentaires intégrée
 * - Gestion des permissions (modification/suppression)
 * - Design responsive avec animations
 * - Indicateurs d'engagement et statistiques
 */

interface EventDetailsProps {
  event: EventDto;
  onBack?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function EventDetails({ 
  event, 
  onBack, 
  onEdit, 
  onDelete 
}: EventDetailsProps) {
  // États locaux
  const [showComments, setShowComments] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [shareCount, setShareCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // État des actions utilisateur
  const [userStatus, setUserStatus] = useState({
    isInterested: false,
    participationStatus: null,
  });

  // Récupération du contexte d'authentification
  const { user, roles } = useAuth();

  // Vérifier les permissions utilisateur
  const canEdit = user && (user.id === event.organizerId || roles?.includes('Admin'));
  const canDelete = user && (user.id === event.organizerId || roles?.includes('Admin'));

  // Simulation des données d'engagement au montage
  useEffect(() => {
    setViewCount(Math.floor(Math.random() * 500) + 50);
    setShareCount(Math.floor(Math.random() * 20) + 1);
    setIsBookmarked(Math.random() > 0.7); // 30% de chance d'être en favoris
  }, []);

  // Gestion du partage
  const handleShare = async () => {
    try {
      const shareData = {
        title: event.title,
        text: event.description,
        url: window.location.href,
      };

      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        setShareCount(prev => prev + 1);
        toast.success('📤 Événement partagé !');
      } else {
        // Fallback: copier le lien
        await navigator.clipboard.writeText(window.location.href);
        toast.success('🔗 Lien copié dans le presse-papiers !');
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        toast.error('Erreur lors du partage');
      }
    }
  };

  // Gestion des favoris
  const handleBookmark = () => {
    setIsBookmarked(prev => {
      const newState = !prev;
      toast.success(
        newState 
          ? '⭐ Ajouté aux favoris' 
          : '📌 Retiré des favoris'
      );
      return newState;
    });
  };

  // Gestion de la modification
  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    } else {
      toast.info('Fonction de modification non disponible');
    }
  };

  // Gestion de la suppression
  const handleDelete = () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible.')) {
      return;
    }

    if (onDelete) {
      onDelete();
    } else {
      toast.info('Fonction de suppression non disponible');
    }
  };

  // Fonction pour télécharger l'image
  const handleDownloadImage = async () => {
    if (!event.imagePath) return;
    
    try {
      const imageUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}${event.imagePath}`;
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}_image.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('📥 Image téléchargée !');
    } catch (error) {
      toast.error('Erreur lors du téléchargement');
    }
  };

  // Formatage de la date
  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let dateFormatted = date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    if (diffDays === 0) {
      return `Aujourd'hui • ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Demain • ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays > 0 && diffDays <= 7) {
      return `Dans ${diffDays} jour${diffDays > 1 ? 's' : ''} • ${dateFormatted}`;
    } else {
      return dateFormatted;
    }
  };

  // Obtenir la couleur du badge selon le statut
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'badge-ey-success';
      case 'Pending':
        return 'badge-ey-warning';
      case 'Rejected':
        return 'badge-ey-danger';
      default:
        return 'badge-ey-secondary';
    }
  };

  return (
    <div className="min-h-screen bg-ey-light-gray">
      
      {/* Navigation et actions en en-tête */}
      <div className="sticky top-0 z-30 bg-ey-white/95 backdrop-blur-md border-b border-ey-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            
            {/* Navigation retour */}
            <div className="flex items-center gap-3">
              {onBack && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="text-ey-gray-600 hover:text-ey-black hover:bg-ey-gray-100 rounded-full p-2"
                >
                  <ChevronLeft size={20} />
                </Button>
              )}
              <div>
                <h1 className="font-bold text-ey-black truncate max-w-md">
                  {event.title}
                </h1>
                <p className="text-sm text-ey-gray-500">
                  Organisé par {event.organizerDepartement}
                </p>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="flex items-center gap-2">
              
              {/* Actions de gestion (si autorisé) */}
              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEdit}
                  className="text-ey-accent-blue hover:bg-ey-accent-blue/10 rounded-full p-2"
                  title="Modifier l'événement"
                >
                  <Edit size={18} />
                </Button>
              )}
              
              {canDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="text-ey-red hover:bg-ey-red/10 rounded-full p-2"
                  title="Supprimer l'événement"
                >
                  <Trash2 size={18} />
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={handleBookmark}
                className={`rounded-full p-2 ${isBookmarked ? 'text-ey-yellow bg-ey-yellow/10' : 'text-ey-gray-600 hover:bg-ey-gray-100'}`}
                title={isBookmarked ? "Retirer des favoris" : "Ajouter aux favoris"}
              >
                <Bookmark size={18} fill={isBookmarked ? "currentColor" : "none"} />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="text-ey-gray-600 hover:bg-ey-gray-100 rounded-full p-2"
                title="Partager l'événement"
              >
                <Share2 size={18} />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="text-ey-gray-600 hover:bg-ey-gray-100 rounded-full p-2"
                title="Signaler un problème"
              >
                <Flag size={18} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Image principale et informations */}
        <div className="card-ey overflow-hidden mb-8 animate-fade-in">
          
          {/* Image de couverture */}
          <div className="relative h-96 md:h-[500px] bg-ey-light-gray group">
            {event.imagePath ? (
              <>
                <Image
                  src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${event.imagePath}`}
                  alt={event.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="100vw"
                  priority
                />
                
                {/* Overlay avec actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="flex gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDownloadImage}
                      className="bg-ey-white/20 backdrop-blur-sm text-ey-white hover:bg-ey-white/30 rounded-full"
                    >
                      <Download size={20} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`${process.env.NEXT_PUBLIC_BACKEND_URL}${event.imagePath}`, '_blank')}
                      className="bg-ey-white/20 backdrop-blur-sm text-ey-white hover:bg-ey-white/30 rounded-full"
                    >
                      <ExternalLink size={20} />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full bg-gradient-ey-primary flex items-center justify-center">
                <div className="text-center text-ey-black">
                  <Calendar className="h-20 w-20 mx-auto mb-4 opacity-60" />
                  <p className="text-xl font-semibold">Événement EY</p>
                </div>
              </div>
            )}

            {/* Badge de statut en overlay */}
            <div className="absolute top-6 left-6">
              <span className={`${getStatusBadgeVariant(event.status)} shadow-ey-lg text-sm font-medium`}>
                {event.status === "Approved" ? (
                  <>
                    <Check size={14} className="mr-1" />
                    Approuvé
                  </>
                ) : event.status === "Pending" ? (
                  <>
                    <Clock size={14} className="mr-1" />
                    En attente
                  </>
                ) : (
                  "En cours de validation"
                )}
              </span>
            </div>

            {/* Statistiques en overlay */}
            <div className="absolute bottom-6 right-6 flex gap-3">
              <div className="bg-ey-black/60 backdrop-blur-sm text-ey-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                <Eye size={14} />
                {viewCount}
              </div>
              <div className="bg-ey-black/60 backdrop-blur-sm text-ey-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                <Share2 size={14} />
                {shareCount}
              </div>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="p-8">
            
            {/* En-tête avec titre et statut */}
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold text-ey-black mb-3 leading-tight">
                    {event.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge className="badge-ey-info">
                      <Building size={14} className="mr-1" />
                      {event.organizerDepartement || "Département non spécifié"}
                    </Badge>
                    {event.organizerName && (
                      <Badge variant="outline" className="border-ey-gray-300">
                        <User size={14} className="mr-1" />
                        {event.organizerName}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Rating/étoiles si disponible */}
                <div className="text-center">
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={16} 
                        className={`${i < 4 ? 'text-ey-yellow fill-current' : 'text-ey-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <p className="text-xs text-ey-gray-500">4.0/5</p>
                </div>
              </div>
            </div>

            {/* Informations détaillées */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              
              {/* Date et heure */}
              <div className="bg-ey-light-gray rounded-ey-xl p-4 hover:bg-ey-yellow/10 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-ey-accent-blue rounded-ey-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Calendar className="text-ey-white" size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-ey-black text-sm">Date & Heure</p>
                    <p className="text-ey-gray-700 text-sm leading-relaxed">
                      {formatEventDate(event.date)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Lieu */}
              <div className="bg-ey-light-gray rounded-ey-xl p-4 hover:bg-ey-yellow/10 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-ey-green rounded-ey-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MapPin className="text-ey-white" size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-ey-black text-sm">Lieu</p>
                    <p className="text-ey-gray-700 text-sm leading-relaxed">
                      {event.location}
                    </p>
                  </div>
                </div>
              </div>

              {/* Participants */}
              <div className="bg-ey-light-gray rounded-ey-xl p-4 hover:bg-ey-yellow/10 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-ey-purple rounded-ey-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="text-ey-white" size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-ey-black text-sm">Participants</p>
                    <p className="text-ey-gray-700 text-sm">
                      {event.participantCount} inscrit{event.participantCount > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Intérêts */}
              <div className="bg-ey-light-gray rounded-ey-xl p-4 hover:bg-ey-yellow/10 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-ey-red rounded-ey-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Heart className="text-ey-white" size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-ey-black text-sm">Intéressés</p>
                    <p className="text-ey-gray-700 text-sm">
                      {event.interestedCount} personne{event.interestedCount > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-ey-black mb-4 flex items-center gap-2">
                À propos de cet événement
              </h2>
              <div className="bg-ey-light-gray/50 rounded-ey-xl p-6 border border-ey-gray-200">
                <p className="text-ey-gray-800 leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              </div>
            </div>

            {/* Actions utilisateur */}
            <div className="mb-8 p-6 bg-gradient-to-r from-ey-yellow/10 to-ey-accent-blue/10 rounded-ey-xl border border-ey-yellow/20">
              <h3 className="text-lg font-bold text-ey-black mb-4 text-center">
                Participez à cet événement
              </h3>
              <EventActions 
                eventId={event.id}
                refresh={() => {}}
                userStatus={userStatus}
                setUserStatus={setUserStatus}
              />
            </div>
          </div>
        </div>

        {/* Section commentaires */}
        <div className="card-ey animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="p-6 border-b border-ey-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-ey-black flex items-center gap-3">
                <MessageCircle className="text-ey-accent-blue" size={24} />
                Commentaires et discussions
                <span className="bg-ey-accent-blue/10 text-ey-accent-blue px-3 py-1 rounded-full text-sm">
                  {event.commentCount || 0}
                </span>
              </h2>
              <Button 
                variant="ghost" 
                onClick={() => setShowComments(!showComments)}
                className="text-ey-accent-blue hover:bg-ey-accent-blue/10"
              >
                {showComments ? 'Masquer' : 'Afficher'}
              </Button>
            </div>
          </div>
          
          {showComments && (
            <div className="p-6">
              <CommentSection eventId={event.id} />
            </div>
          )}
        </div>

        {/* Événements similaires (section bonus) */}
        <div className="mt-8 card-ey animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="p-6">
            <h2 className="text-xl font-bold text-ey-black mb-4">
              Événements similaires
            </h2>
            <div className="text-center py-8 text-ey-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Aucun événement similaire pour le moment</p>
              <p className="text-sm mt-1">Revenez plus tard pour découvrir d'autres événements</p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <EnhancedLoading 
          fullScreen 
          message="Chargement des détails..." 
          variant="pulse" 
        />
      )}
    </div>
  );
}