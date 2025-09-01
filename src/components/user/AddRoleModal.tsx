import { useState } from 'react';
import { createRole } from '@/lib/services/userService';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddRoleModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [RoleName, setRole] = useState('');

  const handleSubmit = async () => {
    try {
      await createRole(RoleName);
      toast.success('Rôle ajouté avec succès');
      setRole('');
      onClose();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-ey-black">Nouveau Rôle</h2>
          <button onClick={onClose}><X /></button>
        </div>
        <input
          type="text"
          placeholder="Nom du rôle"
          value={RoleName}
          onChange={e => setRole(e.target.value)}
          className="w-full border border-ey-darkGray rounded px-4 py-2 mb-4"
        />
        <button
          onClick={handleSubmit}
          className="w-full bg-ey-yellow py-2 rounded text-ey-black font-semibold"
        >
          Ajouter
        </button>
      </div>
    </div>
  );
}
