"use client";

import { useState, useRef } from 'react';
import { Mic, AttachFile, Mood } from '@mui/icons-material';
import EmojiPicker from 'emoji-picker-react';

export default function ChatRoom({ user, onBack }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Ajouter un emoji au message
  const handleEmojiClick = (emojiData) => {
    setNewMessage((prevMessage) => prevMessage + emojiData.emoji);
  };

  // Gérer l'enregistrement vocal
  const handleRecordVoice = async () => {
    if (!recording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.start();

        mediaRecorderRef.current.ondataavailable = (event) => {
          const audioURL = URL.createObjectURL(event.data);
          setMessages([...messages, { type: 'audio', content: audioURL }]);
        };

        setRecording(true);
      } catch (error) {
        console.error("Erreur d'enregistrement vocal:", error);
      }
    } else {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  // Gérer l'envoi de message texte
  const handleSend = () => {
    if (newMessage.trim()) {
      setMessages([...messages, { type: 'text', content: newMessage }]);
      setNewMessage("");
    }
  };

  // Gérer l'envoi de fichier
  const handleSendFile = (event) => {
    const file = event.target.files[0];
    if (file) {
      const fileURL = URL.createObjectURL(file);
      setMessages([...messages, { type: 'file', content: fileURL, fileName: file.name }]);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold mb-4">{`Chat avec ${user.name}`}</h2>
        <button onClick={onBack} className="text-sm text-yellow-500 hover:underline">
          Retour
        </button>
      </div>
      <div className="h-96 overflow-y-auto mb-4 border rounded-lg p-4">
        {messages.map((message, index) => (
          <div key={index} className="mb-2 p-2 bg-gray-100 rounded">
            {message.type === 'text' && <span>{message.content}</span>}
            {message.type === 'audio' && (
              <audio controls>
                <source src={message.content} type="audio/webm" />
              </audio>
            )}
            {message.type === 'file' && (
              <a href={message.content} download={message.fileName} className="text-blue-500 underline">
                {message.fileName}
              </a>
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center relative">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Entrez un message..."
          className="flex-1 p-2 border rounded-l-lg focus:outline-none"
        />
        <button onClick={handleSend} className="bg-yellow-500 text-white px-4 py-2 rounded-r-lg">
          Envoyer
        </button>
        <Mic
          className={`ml-2 cursor-pointer ${recording ? 'text-red-500' : 'text-gray-600'} hover:text-yellow-500`}
          onClick={handleRecordVoice}
        />
        <label className="ml-2 cursor-pointer text-gray-600 hover:text-yellow-500">
          <AttachFile />
          <input type="file" onChange={handleSendFile} className="hidden" />
        </label>
        <Mood
          className="ml-2 cursor-pointer text-gray-600 hover:text-yellow-500"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        />
        {showEmojiPicker && (
          <div className="absolute bottom-20 right-0 z-50">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}
      </div>
    </div>
  );
}
