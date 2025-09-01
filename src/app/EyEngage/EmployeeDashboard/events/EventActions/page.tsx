'use client';

import React, { useState } from "react";
import { Heart, Users, Check, X, Clock } from "lucide-react";
import { 
  toggleInterest, 
  requestParticipation 
} from "@/lib/services/eventService";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function EventActions({
  eventId,
  refresh,
  userStatus,
  setUserStatus,
}: {
  eventId: string;
  refresh: () => void;
  userStatus: {
    isInterested: boolean;
    participationStatus: string | null;
  };
  setUserStatus: React.Dispatch<
    React.SetStateAction<{
      isInterested: boolean;
      participationStatus: string | null;
    }>
  >;
}) {
  const [isLoading, setIsLoading] = useState({
    interest: false,
    participation: false,
  });

  const onToggleInterest = async () => {
    setIsLoading((prev) => ({ ...prev, interest: true }));
    try {
      await toggleInterest(eventId);
      setUserStatus((prev) => ({
        ...prev,
        isInterested: !prev.isInterested,
      }));
      toast.success(
        !userStatus.isInterested
          ? "Vous êtes intéressé par cet événement"
          : "Vous n'êtes plus intéressé"
      );
      refresh();
    } catch (err: any) {
      toast.error(err.message || "Une erreur est survenue");
    } finally {
      setIsLoading((prev) => ({ ...prev, interest: false }));
    }
  };

  const onParticipate = async () => {
    setIsLoading((prev) => ({ ...prev, participation: true }));
    try {
      await requestParticipation(eventId);
      setUserStatus((prev) => ({
        ...prev,
        participationStatus: "Pending",
      }));
      toast.success("Votre demande de participation a été envoyée");
      refresh();
    } catch (err: any) {
      toast.error(err.message || "Une erreur est survenue");
    } finally {
      setIsLoading((prev) => ({ ...prev, participation: false }));
    }
  };

  const getParticipationStatusLabel = () => {
    if (userStatus.participationStatus === "Approved") {
      return (
        <Button variant="outline" className="flex-1 bg-green-100 text-green-800" disabled>
          <Check size={16} className="mr-2" /> Inscrit
        </Button>
      );
    } else if (userStatus.participationStatus === "Pending") {
      return (
        <Button variant="outline" className="flex-1 bg-yellow-100 text-yellow-800" disabled>
          <Clock size={16} className="mr-2" /> En attente
        </Button>
      );
    } else if (userStatus.participationStatus === "Rejected") {
      return (
        <Button variant="outline" className="flex-1 bg-red-100 text-red-800" disabled>
          <X size={16} className="mr-2" /> Refusé
        </Button>
      );
    }
    return null;
  };

  return (
    <div className="pt-4 border-t border-gray-200 space-y-6">
      <div className="flex gap-2">
        <Button
          variant={userStatus.isInterested ? "default" : "outline"}
          className={`flex-1 ${userStatus.isInterested ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
          onClick={onToggleInterest}
          disabled={isLoading.interest}
        >
          <Heart
            size={16}
            fill={userStatus.isInterested ? "currentColor" : "none"}
            className="mr-2"
          />
          {userStatus.isInterested ? "Se désintéresser" : "S'intéresser"}
        </Button>
        
        {getParticipationStatusLabel() ?? (
          <Button
            variant="default"
            className="flex-1 bg-green-500 hover:bg-green-600"
            onClick={onParticipate}
            disabled={isLoading.participation}
          >
            <Users size={16} className="mr-2" /> Participer
          </Button>
        )}
      </div>
    </div>
  );
}