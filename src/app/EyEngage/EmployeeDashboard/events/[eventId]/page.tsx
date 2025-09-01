'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { EventDto } from '@/dtos/event/EventDto';
import { Skeleton } from '@/components/ui/skeleton';
import RouteGuard from '@/components/RouteGuard';
import { getEventById } from '@/lib/services/eventService';
import EventDetails from '../EventDetails';

interface EventDetailPageProps {
  params: {
    eventId: string;
  };
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
  const [event, setEvent] = useState<EventDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await getEventById(params.eventId);
        setEvent(data);
      } catch (error) {
        console.error('Failed to load event:', error);
        router.replace('/EyEngage/EmployeeDashboard/events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [params.eventId, router]);

  useEffect(() => {
    if (!loading && event && typeof window !== 'undefined' && window.location.hash) {
      const id = window.location.hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [loading, event]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (!event) return null;

  return (
    <RouteGuard allowedRoles={['EmployeeEY', 'SuperAdmin', 'Admin', 'AgentEY']}>
      <div className="max-w-4xl mx-auto p-6">
        <EventDetails event={event} />
      </div>
    </RouteGuard>
  );
}
