import { useState } from 'react';
import { assignRole } from '@/lib/services/userService';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { UserDto } from '@/dtos/user/UserDto';

const roles = ['SuperAdmin', 'Admin', 'AgentEY', 'EmployeeEY'];

export default function AssignRoleModal({
  user,
  isOpen,
  onClose
}: {
  user: UserDto,
  isOpen: boolean,
  onClose: () => void
}) {
  const [RoleName, setSelectedRole] = useState('');

  const handleAssign = async () => {
    try {
      await assignRole(user.id, RoleName);
      toast.success('Rôle assigné avec succès');
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
          <h2 className="text-lg font-bold text-ey-black">Assigner un rôle à {user.fullName}</h2>
          <button onClick={onClose}><X /></button>
        </div>
        <select
          className="w-full border border-ey-darkGray rounded px-4 py-2 mb-4"
          value={RoleName}
          onChange={e => setSelectedRole(e.target.value)}
        >
          <option value="">Choisir un rôle</option>
          {roles.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <button
          onClick={handleAssign}
          className="w-full bg-ey-yellow py-2 rounded text-ey-black font-semibold"
        >
          Assigner
        </button>
      </div>
    </div>
  );
}