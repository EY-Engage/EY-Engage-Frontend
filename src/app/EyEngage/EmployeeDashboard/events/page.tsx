"use client";
import { useEffect, useState } from "react";
import RouteGuard from "@/components/RouteGuard";
import { EventDto } from "@/dtos/event/EventDto";
import { getEventsByStatus } from "@/lib/services/eventService";
import { AddCircleOutline } from '@mui/icons-material';
import toast from 'react-hot-toast';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import EventCard from "./EventCard/page";
import EventModal from "./EventModal/page";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { getUserProfile } from "@/lib/services/userService";
import EnhancedLoading from "@/components/SkeletonLoader";

const DEPARTMENTS = [
  "All", 
  "Assurance", 
  "Consulting", 
  "StrategyAndTransactions", 
  "Tax"
];

export default function EventMain() {
  const [events, setEvents] = useState<EventDto[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState<string>("All");
  const [userDepartment, setUserDepartment] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await getUserProfile();
        setUserDepartment(profile.department);
        if (profile.department) {
          setDepartmentFilter(profile.department);
        }
      } catch (err) {
        console.error("Failed to fetch user profile", err);
      }
    };
    fetchUserProfile();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const department = departmentFilter === "All" ? undefined : departmentFilter;
      const data = await getEventsByStatus("Approved", department);
      setEvents(data);
    } catch (err) {
      toast.error('Erreur lors du chargement des événements');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    const intervalId = setInterval(fetchEvents, 60000);
    return () => clearInterval(intervalId);
  }, [departmentFilter]);

  if (isLoading) return <EnhancedLoading fullScreen />;

  return (
    <RouteGuard allowedRoles={['EmployeeEY','SuperAdmin','Admin','AgentEY']}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-ey-black">Événements EY</h1>
            <p className="text-ey-black mt-2">Découvrez et participez aux prochains événements</p>
          </div>
          
          <div className="flex gap-4">
            <Select 
              value={departmentFilter} 
              onValueChange={setDepartmentFilter}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Département" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map(dept => (
                  <SelectItem key={dept} value={dept}>
                    {dept === "All" ? "Tous départements" : dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-ey-yellow hover:bg-ey-yellow/90 text-ey-black flex items-center gap-2"
            >
              <AddCircleOutline /> Proposer un événement
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full rounded-lg" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 bg-ey-lightGray rounded-xl">
            <p className="text-ey-darkGray">Aucun événement disponible actuellement.</p>
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="mt-4 bg-ey-yellow hover:bg-ey-yellow/90 text-ey-black"
            >
              Soyez le premier à proposer un événement
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {events.map(event => (
              <div key={event.id} className="w-full">
                <EventCard event={event} refresh={fetchEvents} />
              </div>
            ))}
          </div>
        )}

        <EventModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreated={(newEvent) => {
            setEvents(prev => [newEvent, ...prev]);
            setIsModalOpen(false);
          }}
        />
      </div>
    </RouteGuard>
  );
}