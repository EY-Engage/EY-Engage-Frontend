"use client";

import { useState } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { AttachFile, Mood } from '@mui/icons-material';

export default function PostForm({ addPost }) {
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleEmojiClick = (emojiData) => {
    setContent((prevContent) => prevContent + emojiData.emoji);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim() || selectedFile) {
      // Création d'un objet contenant le contenu et le fichier
      const post = {
        content: content.trim(),
        file: selectedFile ? URL.createObjectURL(selectedFile) : null,
      };
      addPost(post);
      setContent("");
      setSelectedFile(null); // Réinitialiser le fichier après la soumission
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Quoi de neuf ?"
          className="w-full p-2 border rounded-lg focus:outline-none"
        />
        <Mood
          className="absolute right-8 top-2 cursor-pointer text-gray-600 hover:text-yellow-500"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        />
        {showEmojiPicker && (
          <div className="absolute bottom-14 right-0 z-50">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}
      </div>
      <label className="flex items-center mt-2 text-gray-600 cursor-pointer hover:text-yellow-500">
        <AttachFile />
        <input type="file" className="hidden" onChange={handleFileChange} />
        {selectedFile && <span className="ml-2">{selectedFile.name}</span>}
      </label>
      <button
        type="submit"
        className="mt-2 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
      >
        Publier
      </button>
    </form>
  );
}
