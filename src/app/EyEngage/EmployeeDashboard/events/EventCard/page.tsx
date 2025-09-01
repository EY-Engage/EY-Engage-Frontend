"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, Heart, Users, MessageSquare, Eye, Share2, Bookmark } from "lucide-react";
import { getEventUserStatus, getInterestedUsers, getParticipants } from "@/lib/services/eventService";
import { UserDto } from "@/dtos/user/UserDto";
import UserListModal from "@/components/user/UserListModal";
import { EventDto } from "@/dtos/event/EventDto";
import { Button } from "@/components/ui/button";
import EventActions from "../EventActions/page";
import CommentSection from "../CommentSection";
import toast from "react-hot-toast";
import { CardSkeleton } from "@/components/SkeletonLoader";

/**
 * Composant EventCard - Affichage complet d'un événement avec design EY
 * Fonctionnalités:
 * - Affichage image, titre, description, date, lieu
 * - Actions utilisateur (intérêt, participation)
 * - Section commentaires intégrée
 * - Modal pour liste des participants/intéressés
 * - Design responsive avec animations
 * - Gestion des états de chargement
 */

export default function EventCard({
  event,
  refresh,
}: {
  event: EventDto;
  refresh: () => void;
}) {
  // États locaux pour la gestion des données
  const [showInterested, setShowInterested] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [interestedUsers, setInterestedUsers] = useState<UserDto[]>([]);
  const [participants, setParticipants] = useState<UserDto[]>([]);
  const [userStatus, setUserStatus] = useState({
    isInterested: false,
    participationStatus: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [viewCount, setViewCount] = useState(0);

  // Récupération des utilisateurs intéressés
  const fetchInterestedUsers = async () => {
    try {
      setIsLoading(true);
      const users = await getInterestedUsers(event.id);
      setInterestedUsers(users);
      setShowInterested(true);
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la récupération des utilisateurs intéressés");
    } finally {
      setIsLoading(false);
    }
  };

  // Récupération des participants
  const fetchParticipants = async () => {
    try {
      setIsLoading(true);
      const users = await getParticipants(event.id);
      setParticipants(users);
      setShowParticipants(true);
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la récupération des participants");
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion du partage
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Lien copié dans le presse-papiers !");
      }
    } catch (error) {
      toast.error("Erreur lors du partage");
    }
  };

  // Gestion des favoris
  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? "Retiré des favoris" : "Ajouté aux favoris");
  };

  // Chargement du statut utilisateur au montage du composant
  useEffect(() => {
    const fetchUserStatus = async () => {
      try {
        setIsLoading(true);
        const status = await getEventUserStatus(event.id);
        setUserStatus(status);
        
        // Simulation du compteur de vues
        setViewCount(Math.floor(Math.random() * 100) + 1);
      } catch (err: any) {
        if (err.message === 'Unauthorized') {
          console.log("Utilisateur non authentifié");
        } else {
          console.error("Erreur lors de la récupération du statut utilisateur", err);
          toast.error("Erreur lors du chargement des données");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserStatus();
  }, [event.id, refresh]);

  // Affichage du skeleton pendant le chargement
  if (isLoading) return <CardSkeleton />;

  return (
    <>
      {/* Carte principale de l'événement */}
      <div className="card-ey group hover:scale-[1.02] transition-all duration-300 animate-fade-in">
        
        {/* Image de l'événement */}
        <div className="relative overflow-hidden rounded-t-ey-xl">
          <Link href={`/EyEngage/EmployeeDashboard/events/${event.id}`}>
            <div className="relative w-full h-64 md:h-80 lg:h-96 cursor-pointer overflow-hidden">
              {event.imagePath ? (
                <Image
                  src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${event.imagePath}`}
                  alt={event.title}
                  fill
                  unoptimized
                  quality={100}
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full bg-gradient-ey-primary flex items-center justify-center">
                  <Calendar className="h-16 w-16 text-ey-black opacity-50" />
                </div>
              )}
              
              {/* Overlay avec gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Badge de statut */}
              <div className="absolute top-4 left-4">
                <span className={`badge-ey-${event.status === "Approved" ? "success" : "warning"} shadow-ey-md`}>
                  {event.status === "Approved" ? "✓ Approuvé" : "⏳ En attente"}
                </span>
              </div>
              
              {/* Actions rapides */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={handleBookmark}
                  className="bg-ey-white/90 backdrop-blur-sm text-ey-black p-2 rounded-full hover:bg-ey-yellow transition-colors shadow-ey-md"
                >
                  <Bookmark size={16} fill={isBookmarked ? "currentColor" : "none"} />
                </button>
                <button
                  onClick={handleShare}
                  className="bg-ey-white/90 backdrop-blur-sm text-ey-black p-2 rounded-full hover:bg-ey-yellow transition-colors shadow-ey-md"
                >
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          </Link>
        </div>

        {/* Contenu de la carte */}
        <div className="p-6 space-y-6">
          
          {/* En-tête avec titre et département */}
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <Link href={`/EyEngage/EmployeeDashboard/events/${event.id}`}>
                <h2 className="text-xl font-bold text-ey-black hover:text-ey-accent-blue transition-colors line-clamp-2 group-hover:underline">
                  {event.title}
                </h2>
              </Link>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="badge-ey-info">
                {event.organizerDepartement || "Département non spécifié"}
              </span>
              <div className="flex items-center gap-1 text-ey-gray-500 text-sm">
                <Eye size={14} />
                <span>{viewCount}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-ey-gray-700 line-clamp-3 leading-relaxed">
            {event.description}
          </p>

          {/* Informations détaillées */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Date et heure */}
            <div className="flex items-start gap-3 p-3 bg-ey-light-gray rounded-ey-lg hover:bg-ey-yellow/10 transition-colors">
              <Calendar size={20} className="text-ey-accent-blue mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-ey-black text-sm">Date & Heure</p>
                <p className="text-ey-gray-700 text-sm">
                  {new Date(event.date).toLocaleDateString('fr-FR', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            
            {/* Lieu */}
            <div className="flex items-start gap-3 p-3 bg-ey-light-gray rounded-ey-lg hover:bg-ey-yellow/10 transition-colors">
              <MapPin size={20} className="text-ey-accent-blue mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-ey-black text-sm">Lieu</p>
                <p className="text-ey-gray-700 text-sm truncate" title={event.location}>
                  {event.location}
                </p>
              </div>
            </div>
          </div>

          {/* Statistiques d'engagement */}
          <div className="flex items-center justify-between py-4 border-t border-ey-gray-200">
            <Button 
              variant="ghost"
              className="flex items-center gap-2 text-ey-accent-blue hover:bg-ey-accent-blue/10 transition-colors px-3 py-2 rounded-ey-lg"
              onClick={fetchInterestedUsers}
            >
              <Heart size={18} />
              <span className="font-medium">{event.interestedCount}</span>
              <span className="text-sm">Intéressés</span>
            </Button>
            
            <Button 
              variant="ghost"
              className="flex items-center gap-2 text-ey-accent-blue hover:bg-ey-accent-blue/10 transition-colors px-3 py-2 rounded-ey-lg"
              onClick={fetchParticipants}
            >
              <Users size={18} />
              <span className="font-medium">{event.participantCount}</span>
              <span className="text-sm">Participants</span>
            </Button>

            <Button 
              variant="ghost"
              className="flex items-center gap-2 text-ey-accent-blue hover:bg-ey-accent-blue/10 transition-colors px-3 py-2 rounded-ey-lg"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageSquare size={18} />
              <span className="font-medium">{event.commentCount || 0}</span>
              <span className="text-sm">Commentaires</span>
            </Button>
          </div>

          {/* Actions utilisateur */}
          <div className="border-t border-ey-gray-200 pt-4">
            <EventActions 
              eventId={event.id}
              refresh={refresh}
              userStatus={userStatus}
              setUserStatus={setUserStatus}
            />
          </div>
        </div>

        {/* Section commentaires (repliable) */}
        {showComments && (
          <div className="border-t border-ey-gray-200 px-6 py-4 bg-ey-light-gray/30">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-ey-black flex items-center gap-2">
                <MessageSquare size={18} className="text-ey-accent-blue" />
                Discussion
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComments(false)}
                className="text-ey-gray-500 hover:text-ey-black"
              >
                Masquer
              </Button>
            </div>
            <CommentSection eventId={event.id} />
          </div>
        )}
      </div>

      {/* Modales pour les listes d'utilisateurs */}
      <UserListModal
        isOpen={showInterested}
        onClose={() => setShowInterested(false)}
        users={interestedUsers}
        title={`Personnes intéressées (${event.interestedCount})`}
      />
      
      <UserListModal
        isOpen={showParticipants}
        onClose={() => setShowParticipants(false)}
        users={participants}
        title={`Participants (${event.participantCount})`}
      />
    </>
  );
}