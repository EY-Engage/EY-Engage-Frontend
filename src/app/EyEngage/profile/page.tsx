"use client";
import { useState } from 'react';
import { Pencil, Save } from 'lucide-react';

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState({
    name: "John Doe",
    email: "john.doe@ey.com",
    role: "Admin",
    department: "Consulting"
  });

  const userPosts = [
    { id: 1, content: "Super séminaire cette semaine !", likes: 15 },
    { id: 2, content: "Nouveau processus RH disponible", likes: 8 }
  ];

  const userEvents = [
    { id: 1, title: "Séminaire Innovation", date: "2025-03-15", status: "confirmed" },
    { id: 2, title: "Formation Leadership", date: "2025-04-02", status: "pending" }
  ];

  return (
    <div className="space-y-8">
      {/* Profile Card */}
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">{user.name}</h1>
            <div className="space-y-1">
              {isEditing ? (
                <>
                  <input 
                    value={user.name}
                    onChange={(e) => setUser({...user, name: e.target.value})}
                    className="input-field mb-2"
                  />
                  <input 
                    value={user.email}
                    onChange={(e) => setUser({...user, email: e.target.value})}
                    className="input-field"
                  />
                </>
              ) : (
                <>
                  <p className="text-gray-600">{user.email}</p>
                  <div className="flex gap-2">
                    <span className="badge bg-ey-yellow/20 text-ey-yellow">{user.role}</span>
                    <span className="badge bg-gray-200 text-gray-700">{user.department}</span>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="btn-primary flex items-center gap-2 bg-ey-yellow text-black"
          >
            {isEditing ? <Save size={18} /> : <Pencil size={18} />}
            {isEditing ? "Sauvegarder" : "Modifier"}
          </button>
        </div>
      </div>

      {/* User Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Posts Section */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-4">Publications récentes</h2>
          <div className="space-y-4">
            {userPosts.map(post => (
              <div key={post.id} className="border-b pb-4">
                <p className="text-gray-600">{post.content}</p>
                <div className="flex items-center gap-4 mt-2 text-gray-500">
                  <span>❤️ {post.likes}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Events Section */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-4">Événements à venir</h2>
          <div className="space-y-4">
            {userEvents.map(event => (
              <div key={event.id} className="flex justify-between items-center border-b pb-4">
                <div>
                  <h3 className="font-semibold">{event.title}</h3>
                  <p className="text-gray-500">{event.date}</p>
                </div>
                <span className={`badge ${event.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {event.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
