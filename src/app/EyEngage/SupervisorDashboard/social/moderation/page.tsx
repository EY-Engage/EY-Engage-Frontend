
"use client"
import { useState } from 'react';
import { Check, X, Trash2 } from 'lucide-react';

const SocialModerationPage = () => {
  const [posts, setPosts] = useState([
    {
      id: 1,
      content: "Notre nouvelle campagne marketing est lancée ! 🚀",
      author: "John D.",
      status: "pending",
      likes: 12,
      comments: 3
    },
    {
      id: 2,
      content: "Pensez à remplir le questionnaire RH...",
      author: "Sarah M.",
      status: "approved",
      likes: 8,
      comments: 1
    }
  ]);

  const moderatePost = (id: number, action: 'approve' | 'reject') => {
    setPosts(posts.filter(post => post.id !== id));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-ey-yellow">Modération des Publications</h1>
      
      <div className="grid gap-4">
        {posts.map(post => (
          <div key={post.id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-ey-dark-gray">{post.author}</h3>
                <p className="text-gray-600 mt-2">{post.content}</p>
                <div className="flex gap-4 mt-4 text-gray-500">
                  <span>❤️ {post.likes}</span>
                  <span>💬 {post.comments}</span>
                </div>
              </div>
              
              {post.status === 'pending' ? (
                <div className="flex gap-2">
                  <button 
                    onClick={() => moderatePost(post.id, 'approve')}
                    className="btn-icon text-ey-yellow hover:bg-ey-yellow-light"
                  >
                    <Check size={20} />
                  </button>
                  <button 
                    onClick={() => moderatePost(post.id, 'reject')}
                    className="btn-icon text-red-600 hover:bg-red-50"
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => moderatePost(post.id, 'reject')}
                  className="btn-icon text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SocialModerationPage;
