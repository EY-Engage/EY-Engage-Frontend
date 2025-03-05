"use client";
import { ThumbUp, ThumbDown } from '@mui/icons-material';
import { useState } from 'react';
import PostCommentInput from '../PostCommentInput/page'; // Import du composant

export default function PostList({ posts, setPosts }) {
  // Gérer les réactions
  const handleReaction = (postId, type) => {
    setPosts(posts.map(post => (post.id === postId ? { ...post, [type]: post[type] + 1 } : post)));
  };

  // Gérer l'ajout d'un post
  const handlePostSubmit = (data) => {
    const { text, file, audio } = data;
    if (text || file || audio) {
      const newPost = {
        id: posts.length + 1,
        author: "Vous",
        department: "IT",
        content: text,
        file: file,
        audio: audio,
        likes: 0,
        dislikes: 0,
        comments: [],
      };
      setPosts([newPost, ...posts]);
    }
  };

  // Gérer l'ajout d'un commentaire
  const handleCommentSubmit = (postId, data) => {
    const { text, file, audio } = data;
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [
            ...post.comments,
            { type: 'text', content: text, file, audio, date: new Date().toLocaleString() },
          ],
        };
      }
      return post;
    }));
  };

  return (
    <div>
      {/* Nouvelle publication */}
      <PostCommentInput onSubmit={handlePostSubmit} isPost={true} />

      {/* Liste des publications */}
      {posts.map(post => (
        <div key={post.id} className="bg-white rounded-lg shadow-md mb-6 p-6">
          <div className="flex items-center mb-4">
            <div className="bg-gray-800 text-yellow-500 w-12 h-12 rounded-full flex items-center justify-center font-bold">
              {post.department.slice(0, 2)}
            </div>
            <div className="ml-4">
              <h3 className="font-bold text-gray-900">{post.author}</h3>
              <p className="text-sm text-gray-500">{post.department}</p>
            </div>
          </div>
          <p className="text-gray-700 mb-6">{post.content}</p>
          {post.file && <img src={post.file.url} alt={post.file.name} className="w-32 h-32 mb-4" />}
          {post.audio && <audio controls src={post.audio.url} className="mb-4" />}

          <div className="flex items-center border-t pt-4">
            <button onClick={() => handleReaction(post.id, 'likes')} className="flex items-center text-gray-600 hover:text-yellow-500 mr-4">
              <ThumbUp className="mr-2" /> {post.likes}
            </button>
            <button onClick={() => handleReaction(post.id, 'dislikes')} className="flex items-center text-gray-600 hover:text-yellow-500">
              <ThumbDown className="mr-2" /> {post.dislikes}
            </button>
          </div>

          {/* Commentaires */}
          <div className="mt-4">
            {post.comments.map((comment, index) => (
              <div key={index} className="bg-gray-100 p-4 rounded-lg mb-2">
                <p>{comment.content}</p>
                {comment.file && <img src={comment.file.url} alt={comment.file.name} className="w-32 h-32 mb-4" />}
                {comment.audio && <audio controls src={comment.audio.url} className="mb-4" />}
              </div>
            ))}
            {/* Intégrer le composant d'enregistrement vocal dans les commentaires */}
            <div className="flex items-center">
              <PostCommentInput onSubmit={(data) => handleCommentSubmit(post.id, data)} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
