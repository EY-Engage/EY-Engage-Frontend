"use client";

import { useState } from 'react';
import PostList from './PostList/page';
import ChatBubble from './ChatBubble/page';
import ChatRoom from './ChatRoom/page';

export default function SocialFeed() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: 'John Doe',
      department: 'Marketing',
      content: 'Notre nouvelle campagne est en ligne !',
      likes: 5,
      dislikes: 1,
      comments: [],
      file: null,
    },
    {
      id: 2,
      author: 'Jane Smith',
      department: 'HR',
      content: "N'oubliez pas de remplir votre enquête de satisfaction.",
      likes: 3,
      dislikes: 0,
      comments: [],
      file: null,
    },
  ]);

  return (
    <div className="flex flex-col md:flex-row container mx-auto px-4 py-8">
      {/* Section principale à gauche */}
      <div className="w-full md:w-2/3 pr-4">
        <PostList posts={posts} setPosts={setPosts} />
      </div>
      {/* Bulle de discussion à droite */}
      <div className="w-full md:w-1/3">
        {selectedUser ? (
          <ChatRoom user={selectedUser} onBack={() => setSelectedUser(null)} />
        ) : (
          <ChatBubble onSelectUser={setSelectedUser} />
        )}
      </div>
    </div>
  );
}
