"use client";
import { useState } from 'react';
import EventCard from './EventCard/page';
import EventModal from './EventModal/page';
import toast, { Toaster } from 'react-hot-toast';
import { AddCircleOutline } from '@mui/icons-material';

export default function EventMain() {
    const [events, setEvents] = useState<Event[]>([
        {
            id: 1,
            title: 'Séminaire sur l\'Innovation',
            description: 'Un séminaire pour discuter des dernières tendances en matière d\'innovation dans le secteur technologique.',
            date: '2025-03-10',
            location: 'Salle de conférence EY Paris',
            files: [
                { name: 'file1.png', url: '/assets/images/file1.png', type: 'image/png' },
                { name: 'file2.png', url: '/assets/images/file2.png',type: 'image/png' }
            ],
            comments: [],
            interested: 12,
            participants: 50,
        },
        {
            id: 2,
            title: 'Atelier de Développement Personnel',
            description: 'Un atelier pour améliorer les compétences en leadership et gestion du temps.',
            date: '2025-03-15',
            location: 'Bureaux EY Tunis',
            files: [
                { name: 'file3.png', url: '/assets/images/file3.png',type: 'image/png' }
            ],
            comments: [],
            interested: 8,
            participants: 25,
        },
        {
            id: 3,
            title: 'Réunion stratégique de fin d\'année',
            description: 'Une réunion pour discuter des objectifs stratégiques de l\'année prochaine.',
            date: '2025-03-20',
            location: 'Salle de réunion EY Lyon',
            files: [
                { name: 'file4.jpg', url: '/assets/images/file4.jpg',type: 'image/jpg' }
            ],
            comments: [],
            interested: 5,
            participants: 20,
        }
    ]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCreateEvent = (newEvent: Event) => {
        setEvents([...events, newEvent]);
        setIsModalOpen(false);
        toast.success('Événement créé avec succès!');
    };

    return (
        <div className="min-h-screen bg-ey-light-gray">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 py-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-6">
                    <h1 className="text-3xl font-extrabold text-ey-black">Gestion des Événements</h1>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="btn-primary flex items-center gap-2 p-3"
                    >
                        <AddCircleOutline className="text-xl" />
                        <span>Nouvel Événement</span>
                    </button>
                </div>

                {/* Event List */}
                <div className="space-y-8">
                    {events.length > 0 ? (
                        events.map(event => (
                            <EventCard key={event.id} event={event} setEvents={setEvents} />
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-ey-dark-gray text-lg">
                                Aucun événement prévu. Commencez par en créer un !
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <EventModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreate={handleCreateEvent} />

            <Toaster position="bottom-right" toastOptions={{
                style: {
                    background: 'var(--ey-yellow)',
                    color: 'var(--ey-black)',
                },
                iconTheme: {
                    primary: 'var(--ey-black)',
                    secondary: 'var(--ey-yellow)',
                },
            }} />
        </div>
    );
}

