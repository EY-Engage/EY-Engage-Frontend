// EventModal.tsx
"use client";
import { useState } from 'react';
import toast from 'react-hot-toast';
import FileUpload from '../FileUpload/page';
import { Close, Save } from '@mui/icons-material';

export default function EventModal({ isOpen, onClose, onCreate }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        location: '',
    });
    const [files, setFiles] = useState([]);

    const handleSubmit = () => {
        if (!Object.values(formData).every(Boolean)) {
            toast.error('Tous les champs sont obligatoires');
            return;
        }

        onCreate({
            id: Date.now(),
            ...formData,
            files,
            comments: [],
            interested: 0,
            participants: 0,
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
                <div className="p-6 border-b border-ey-light-gray">
                    <h2 className="text-2xl font-bold text-ey-black">Nouvel Événement</h2>
                </div>

                <div className="p-6 space-y-4">
                    <input
                        type="text"
                        placeholder="Titre de l'événement"
                        className="ey-input"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />

                    <textarea
                        placeholder="Description complète"
                        className="ey-input h-32"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="date"
                            className="ey-input"
                            value={formData.date}
                            onChange={(e) => setFormData({...formData, date: e.target.value})}
                        />

                        <input
                            type="text"
                            placeholder="Lieu"
                            className="ey-input"
                            value={formData.location}
                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                        />
                    </div>

                    <FileUpload setFiles={setFiles} />
                </div>

                <div className="p-6 flex justify-end gap-4 border-t border-ey-light-gray">
                    <button 
                        onClick={onClose}
                        className="ey-btn-secondary"
                    >
                        <Close /> Annuler
                    </button>
                    <button 
                        onClick={handleSubmit}
                        className="ey-btn-primary"
                    >
                        <Save /> Publier
                    </button>
                </div>
            </div>
        </div>
    );
}