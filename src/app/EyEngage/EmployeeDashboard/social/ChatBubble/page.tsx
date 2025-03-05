import React from 'react';

const users = [
  { id: 1, name: 'John Doe' },
  { id: 2, name: 'Jane Smith' },
  { id: 3, name: 'Alex Johnson' },
];

export default function ChatBubble({ onSelectUser }) {
  return (
    <div className="bg-yellow-500 text-white rounded-lg p-4 mb-6 shadow-md">
      <h3 className="font-bold text-lg">Bulle de discussion</h3>
      <p>Sélectionnez un collègue pour discuter :</p>
      <ul className="mt-4">
        {users.map((user) => (
          <li
            key={user.id}
            onClick={() => onSelectUser(user)}
            className="cursor-pointer hover:bg-yellow-600 p-2 rounded-md"
          >
            {user.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
