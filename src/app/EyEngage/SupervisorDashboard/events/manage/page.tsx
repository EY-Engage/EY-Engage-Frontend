"use client";
import { useEffect, useState } from "react";
import RouteGuard from "@/components/RouteGuard";
import { EventDto } from "@/dtos/event/EventDto";
import { ParticipationRequestDto } from "@/dtos/event/ParticipationRequestDto";
import {
  getEventsByStatus,
  getParticipationRequests,
  approveParticipation,
  rejectParticipation,
  approveEvent,
  rejectEvent,
  deleteEvent
} from "@/lib/services/eventService";
import { Button } from "@/components/ui/button";
import { 
  Trash2, Check, User, ChevronDown, ChevronUp, X, 
  Calendar, MapPin, Heart, Users, Clock, Building,
  Filter, Search, AlertCircle, Eye, Edit
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { getUserProfile } from "@/lib/services/userService";
import { useAuth } from "@/context/AuthContext";
import EnhancedLoading, { CardSkeleton } from "@/components/SkeletonLoader";
import toast from "react-hot-toast";
import UserListItem from "@/components/UserListtem";

export default function ManageEventsPage() {
  const [pending, setPending] = useState<EventDto[]>([]);
  const [approved, setApproved] = useState<EventDto[]>([]);
  const [requests, setRequests] = useState<Record<string, ParticipationRequestDto[]>>({});
  const [filter, setFilter] = useState<"All" | "Pending" | "Approved">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [userDepartment, setUserDepartment] = useState<string | null>(null);
  const [processingItems, setProcessingItems] = useState<Set<string>>(new Set());
  const { roles } = useAuth();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await getUserProfile();
        setUserDepartment(profile.department.toString());
      } catch (err) {
        console.error("Échec du chargement du profil", err);
        toast.error("Erreur lors du chargement du profil");
      }
    };
    fetchUserProfile();
  }, []);

  const reload = async () => {
    try {
      setIsLoading(true);
      const department = roles.includes("AgentEY") ? userDepartment : undefined;

      const [pendingEvents, approvedEvents] = await Promise.all([
        getEventsByStatus("Pending", department),
        getEventsByStatus("Approved", department),
      ]);

      setPending(pendingEvents);
      setApproved(approvedEvents);

      const requestMap: Record<string, ParticipationRequestDto[]> = {};
      for (const evt of approvedEvents) {
        const reqs = await getParticipationRequests(evt.id);
        requestMap[evt.id] = reqs;
      }
      setRequests(requestMap);
    } catch (err) {
      console.error("Erreur lors du chargement des événements :", err);
      toast.error("Impossible de charger les événements");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userDepartment || !roles.includes("AgentEY")) {
      reload();
    }
  }, [userDepartment, roles]);

  const toggleEventExpansion = (eventId: string) => {
    setExpandedEvents(prev => ({
      ...prev,
      [eventId]: !prev[eventId],
    }));
  };

  const handleApproveEvent = async (eventId: string) => {
    setProcessingItems(prev => new Set(prev).add(eventId));
    try {
      await approveEvent(eventId);
      toast.success("Événement approuvé avec succès");
      await reload();
    } catch (err) {
      toast.error("Erreur lors de l'approbation");
    } finally {
      setProcessingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
    }
  };

  const handleRejectEvent = async (eventId: string) => {
    setProcessingItems(prev => new Set(prev).add(eventId));
    try {
      await rejectEvent(eventId);
      toast.success("Événement refusé");
      await reload();
    } catch (err) {
      toast.error("Erreur lors du refus");
    } finally {
      setProcessingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
    }
  };

  const handleApproveParticipation = async (requestId: string, eventId: string) => {
    setProcessingItems(prev => new Set(prev).add(requestId));
    try {
      await approveParticipation(requestId);
      const reqs = await getParticipationRequests(eventId);
      setRequests(r => ({ ...r, [eventId]: reqs }));
      toast.success("Participation approuvée");
    } catch (err) {
      toast.error("Erreur lors de l'approbation");
    } finally {
      setProcessingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const handleRejectParticipation = async (requestId: string, eventId: string) => {
    setProcessingItems(prev => new Set(prev).add(requestId));
    try {
      await rejectParticipation(requestId);
      const reqs = await getParticipationRequests(eventId);
      setRequests(r => ({ ...r, [eventId]: reqs }));
      toast.success("Participation refusée");
    } catch (err) {
      toast.error("Erreur lors du refus");
    } finally {
      setProcessingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    const confirmDelete = confirm("⚠️ Cette action est irréversible. Souhaitez-vous vraiment supprimer cet événement ?");
    if (!confirmDelete) return;

    setProcessingItems(prev => new Set(prev).add(eventId));
    try {
      await deleteEvent(eventId);
      toast.success("Événement supprimé avec succès");
      await reload();
    } catch (err) {
      console.error("Erreur lors de la suppression :", err);
      toast.error("Impossible de supprimer l'événement");
    } finally {
      setProcessingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
    }
  };

  // Filtrage et recherche
  const filteredEvents = [...pending, ...approved]
    .filter(evt => filter === "All" ? true : evt.status === filter)
    .filter(evt => 
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

  if (isLoading) {
    return <EnhancedLoading fullScreen message="Chargement des événements..." variant="dots" />;
  }

  return (
    <RouteGuard allowedRoles={['Admin', 'AgentEY']}>
      <div className="min-h-screen bg-gradient-to-br from-ey-light-gray to-white p-6">
        <div className="max-w-7xl mx-auto">
          
          {/* En-tête */}
          <Card className="card-ey mb-8 overflow-visible">
            <div className="bg-gradient-to-r from-ey-black to-ey-gray-800 text-white p-6 rounded-t-ey-xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Calendar className="h-8 w-8 text-ey-yellow" />
                    Gestion des Événements
                  </h1>
                  <p className="text-white/80 mt-2">
                    Approuvez, refusez ou supprimez les événements de votre département
                  </p>
                </div>
                <Button 
                  onClick={reload} 
                  className="btn-ey-primary flex items-center gap-2"
                  disabled={isLoading}
                >
                  <Clock className="h-4 w-4" />
                  Rafraîchir
                </Button>
              </div>
            </div>

            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Barre de recherche */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ey-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Rechercher un événement..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-ey pl-10 w-full"
                  />
                </div>

                {/* Filtre de statut */}
                <Select value={filter} onValueChange={(val) => setFilter(val as any)}>
                  <SelectTrigger className="w-[240px] input-ey">
                    <Filter className="h-4 w-4 mr-2 text-ey-gray-600" />
                    <SelectValue placeholder="Filtrer les événements" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-ey-gray-400" />
                        Tous les événements ({pending.length + approved.length})
                      </div>
                    </SelectItem>
                    <SelectItem value="Pending">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-ey-orange" />
                        En attente ({pending.length})
                      </div>
                    </SelectItem>
                    <SelectItem value="Approved">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-ey-green" />
                        Approuvés ({approved.length})
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Statistiques rapides */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-ey-yellow/10 border border-ey-yellow/20 rounded-ey-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-ey-gray-600">Total</span>
                    <Calendar className="h-4 w-4 text-ey-yellow" />
                  </div>
                  <div className="text-2xl font-bold text-ey-black mt-1">
                    {pending.length + approved.length}
                  </div>
                </div>
                <div className="bg-ey-orange/10 border border-ey-orange/20 rounded-ey-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-ey-gray-600">En attente</span>
                    <Clock className="h-4 w-4 text-ey-orange" />
                  </div>
                  <div className="text-2xl font-bold text-ey-black mt-1">
                    {pending.length}
                  </div>
                </div>
                <div className="bg-ey-green/10 border border-ey-green/20 rounded-ey-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-ey-gray-600">Approuvés</span>
                    <Check className="h-4 w-4 text-ey-green" />
                  </div>
                  <div className="text-2xl font-bold text-ey-black mt-1">
                    {approved.length}
                  </div>
                </div>
                <div className="bg-ey-accent-blue/10 border border-ey-accent-blue/20 rounded-ey-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-ey-gray-600">Demandes</span>
                    <Users className="h-4 w-4 text-ey-accent-blue" />
                  </div>
                  <div className="text-2xl font-bold text-ey-black mt-1">
                    {Object.values(requests).flat().length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liste des événements */}
          {filteredEvents.length === 0 ? (
            <Card className="card-ey">
              <CardContent className="p-12 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-ey-gray-200 rounded-full flex items-center justify-center mb-4">
                    <Calendar className="h-10 w-10 text-ey-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-ey-black mb-2">
                    Aucun événement trouvé
                  </h3>
                  <p className="text-ey-gray-600 max-w-md">
                    {searchQuery 
                      ? "Aucun événement ne correspond à votre recherche."
                      : "Il n'y a pas encore d'événements dans cette catégorie."}
                  </p>
                  {searchQuery && (
                    <Button 
                      onClick={() => setSearchQuery("")}
                      className="btn-ey-outline mt-4"
                    >
                      Effacer la recherche
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredEvents.map(evt => (
                <Card key={evt.id} className="card-ey overflow-hidden hover:shadow-ey-2xl transition-all duration-300">
                  <div className="flex flex-col lg:flex-row">
                    {/* Image de l'événement */}
                    <div className="w-full lg:w-1/3 h-64 lg:h-auto relative bg-gradient-to-br from-ey-gray-200 to-ey-gray-300">
                      {evt.imagePath ? (
                        <Image
                          src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${evt.imagePath}`}
                          alt={evt.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex flex-col items-center justify-center">
                          <Calendar className="h-16 w-16 text-ey-gray-400 mb-3" />
                          <p className="text-sm text-ey-gray-500">Aucune image</p>
                        </div>
                      )}
                      
                      {/* Badge de statut sur l'image */}
                      <div className="absolute top-4 left-4">
                        <Badge className={`${
                          evt.status === "Approved" 
                            ? "bg-ey-green text-white border-0" 
                            : "bg-ey-orange text-white border-0"
                        } font-semibold px-3 py-1.5 shadow-lg`}>
                          {evt.status === "Approved" ? "✓ Approuvé" : "⏳ En attente"}
                        </Badge>
                      </div>
                    </div>

                    {/* Contenu de l'événement */}
                    <div className="flex-1 p-6">
                      <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-4">
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-ey-black mb-2">{evt.title}</h3>
                          <p className="text-ey-gray-700 line-clamp-2 mb-4">{evt.description}</p>
                          
                          {/* Informations de l'événement */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex items-center gap-2 text-sm text-ey-gray-600">
                              <Calendar className="h-4 w-4 text-ey-accent-blue" />
                              <span className="font-medium">
                                {new Date(evt.date).toLocaleDateString('fr-FR', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-ey-gray-600">
                              <MapPin className="h-4 w-4 text-ey-accent-blue" />
                              <span className="font-medium">{evt.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-ey-gray-600">
                              <Heart className="h-4 w-4 text-ey-red" />
                              <span><strong>{evt.interestedCount}</strong> intéressés</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-ey-gray-600">
                              <Users className="h-4 w-4 text-ey-green" />
                              <span><strong>{evt.participantCount}</strong> participants</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2">
                          {evt.status === "Pending" ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleApproveEvent(evt.id)}
                                className="btn-ey-success h-10"
                                disabled={processingItems.has(evt.id)}
                              >
                                {processingItems.has(evt.id) ? (
                                  <div className="loading-spinner-ey h-4 w-4" />
                                ) : (
                                  <>
                                    <Check size={16} className="mr-1" />
                                    Approuver
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleRejectEvent(evt.id)}
                                className="btn-ey-danger h-10"
                                disabled={processingItems.has(evt.id)}
                              >
                                {processingItems.has(evt.id) ? (
                                  <div className="loading-spinner-ey h-4 w-4" />
                                ) : (
                                  <>
                                    <X size={16} className="mr-1" />
                                    Refuser
                                  </>
                                )}
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => toggleEventExpansion(evt.id)}
                              className="btn-ey-secondary h-10"
                            >
                              <User size={16} className="mr-2" />
                              {requests[evt.id]?.length || 0} demandes
                              {expandedEvents[evt.id] ? 
                                <ChevronUp size={16} className="ml-2" /> : 
                                <ChevronDown size={16} className="ml-2" />
                              }
                            </Button>
                          )}
                          <Button
                            size="sm"
                            onClick={() => handleDeleteEvent(evt.id)}
                            className="btn-ey-outline h-10 border-ey-red text-ey-red hover:bg-ey-red hover:text-white"
                            disabled={processingItems.has(evt.id)}
                          >
                            {processingItems.has(evt.id) ? (
                              <div className="loading-spinner-ey h-4 w-4" />
                            ) : (
                              <>
                                <Trash2 size={16} className="mr-1" />
                                Supprimer
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Section des demandes de participation */}
                      {evt.status === "Approved" && expandedEvents[evt.id] && (
                        <div className="mt-6 pt-6 border-t-2 border-ey-gray-200">
                          <h4 className="font-bold text-ey-black mb-4 flex items-center gap-2">
                            <Users className="h-5 w-5 text-ey-accent-blue" />
                            Demandes de participation
                          </h4>

                          {(requests[evt.id] || []).length === 0 ? (
                            <div className="bg-ey-light-gray rounded-ey-lg p-6 text-center">
                              <User className="h-12 w-12 text-ey-gray-400 mx-auto mb-3" />
                              <p className="text-ey-gray-600">Aucune demande de participation</p>
                            </div>
                          ) : (
                            <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-ey">
                              {(requests[evt.id] || []).map((req, i) => (
                                <div 
                                  key={req.participationId || i} 
                                  className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-ey-light-gray to-white p-4 rounded-ey-lg border border-ey-gray-200 hover:shadow-md transition-shadow"
                                >
                                  <UserListItem
                                    user={{
                                      id: req.userId,
                                      fullName: req.fullName,
                                      email: req.email,
                                      profilePicture: req.profilePicture ?? null
                                    }}
                                  />
                                  
                                  <div className="flex items-center gap-2">
                                    {req.status === "Approved" ? (
                                      <span className="badge-ey-success">
                                        <Check size={14} className="mr-1" />
                                        Approuvé
                                      </span>
                                    ) : req.status === "Rejected" ? (
                                      <span className="badge-ey-danger">
                                        <X size={14} className="mr-1" />
                                        Refusé
                                      </span>
                                    ) : (
                                      <>
                                        <Button
                                          size="sm"
                                          className="btn-ey-success h-9"
                                          disabled={processingItems.has(req.participationId)}
                                          onClick={() => handleApproveParticipation(req.participationId, evt.id)}
                                        >
                                          {processingItems.has(req.participationId) ? (
                                            <div className="loading-spinner-ey h-4 w-4" />
                                          ) : (
                                            <Check size={16} />
                                          )}
                                        </Button>
                                        <Button
                                          size="sm"
                                          className="btn-ey-danger h-9"
                                          disabled={processingItems.has(req.participationId)}
                                          onClick={() => handleRejectParticipation(req.participationId, evt.id)}
                                        >
                                          {processingItems.has(req.participationId) ? (
                                            <div className="loading-spinner-ey h-4 w-4" />
                                          ) : (
                                            <X size={16} />
                                          )}
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </RouteGuard>
  );
}