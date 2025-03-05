"use client";
import { useState } from 'react';
import { Check, X, Trash2, Search, Plus } from 'lucide-react';

const UsersPage = () => {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@ey.com",
      role: "Admin",
      department: "Consulting",
      status: "active"
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@ey.com",
      role: "Employee",
      department: "Audit",
      status: "inactive"
    },
    {
      id: 3,
      name: "Alice Johnson",
      email: "alice.johnson@ey.com",
      role: "Agent",
      department: "Tax & Legal",
      status: "active"
    }
  ]);

  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleUserStatus = (id: number) => {
    setUsers(users.map(user =>
      user.id === id ? { ...user, status: user.status === "active" ? "inactive" : "active" } : user
    ));
  };

  const deleteUser = (id: number) => {
    setUsers(users.filter(user => user.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-ey-yellow">Gestion des Utilisateurs</h1>
        <button className="btn-primary flex items-center gap-2 bg-ey-yellow text-white hover:bg-ey-yellow-dark">
          <Plus size={18} />
          Ajouter un utilisateur
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-primary w-full pl-10 border border-gray-300 rounded-lg"
          />
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
        <table className="w-full">
          <thead className="bg-ey-dark-gray text-white">
            <tr>
              <th className="p-4 text-left">Nom</th>
              <th className="p-4">Email</th>
              <th className="p-4">Rôle</th>
              <th className="p-4">Département</th>
              <th className="p-4">Statut</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="p-4">{user.name}</td>
                <td className="p-4 text-center">{user.email}</td>
                <td className="p-4 text-center">
                  <span className="badge bg-gray-200 text-gray-700">{user.role}</span>
                </td>
                <td className="p-4 text-center">{user.department}</td>
                <td className="p-4 text-center">
                  <span className={`badge ${user.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {user.status === "active" ? "Actif" : "Inactif"}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => toggleUserStatus(user.id)}
                      className="btn-icon text-ey-yellow hover:bg-ey-yellow-light"
                    >
                      {user.status === "active" ? <X size={18} /> : <Check size={18} />}
                    </button>
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="btn-icon text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersPage;
