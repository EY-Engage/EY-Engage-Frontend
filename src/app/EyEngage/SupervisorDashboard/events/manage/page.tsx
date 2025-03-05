"use client";
import { useState } from 'react';
import { CheckCircle, Pencil, Trash2, XCircle } from 'lucide-react';
import { Button } from "@/components/ui/button"; // Utilisation de Button ShadCN

const ManageEventsPage = () => {
  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Séminaire Innovation",
      date: "2025-03-15",
      status: "approved",
      participants: 45,
      organizer: "John Doe"
    },
    {
      id: 2,
      title: "Formation Leadership",
      date: "2025-04-02",
      status: "pending",
      participants: 23,
      organizer: "Jane Smith"
    }
  ]);

  const handleApprove = (id: number) => {
    setEvents(events.map(e => e.id === id ? { ...e, status: 'approved' } : e));
  };

  const handleDelete = (id: number) => {
    setEvents(events.filter(e => e.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des Événements</h1>
        <div className="flex gap-4">
          <input 
            type="text" 
            placeholder="Rechercher..." 
            className="input-primary"
          />
          <select className="select-primary">
            <option>Tous</option>
            <option>Approuvés</option>
            <option>En attente</option>
          </select>
        </div>
      </div>

      {/* Events List */}
      <div className="grid gap-4">
        {events.map(event => (
          <div key={event.id} className="bg-white p-6 rounded-xl shadow-lg flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{event.title}</h3>
              <p className="text-gray-500">{event.date} • {event.organizer}</p>
            </div>
            
            <div className="flex items-center gap-4">
              <span className={`badge ${event.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {event.status === 'approved' ? 'Approuvé' : 'En attente'}
              </span>
              
              <div className="flex gap-2">
                {event.status !== 'approved' && (
                  <Button 
                    onClick={() => handleApprove(event.id)}
                    variant="ghost"
                    className="text-green-600 hover:bg-green-50"
                  >
                    <CheckCircle size={20} />
                  </Button>
                )}
                <Button 
                  onClick={() => {/* Edit logic */}}
                  variant="ghost"
                  className="text-ey-yellow hover:bg-gray-50"
                >
                  <Pencil size={20} />
                </Button>
                <Button 
                  onClick={() => handleDelete(event.id)}
                  variant="ghost"
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={20} />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageEventsPage;
