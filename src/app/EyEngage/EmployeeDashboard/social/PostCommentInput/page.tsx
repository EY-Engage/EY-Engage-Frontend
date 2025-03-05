"use client";
import { Mic, AttachFile, Mood } from '@mui/icons-material';
import { useState, useRef } from 'react';
import EmojiPicker from 'emoji-picker-react';

const PostCommentInput = ({ onSubmit, isPost = false }) => {
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const [newMessage, setNewMessage] = useState("");

  // Gérer l'enregistrement vocal
  const handleRecordVoice = async () => {
    if (!recording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.start();

        mediaRecorderRef.current.ondataavailable = (event) => {
          const audioURL = URL.createObjectURL(event.data);
          setAudioFile({ url: audioURL, name: 'audio.webm' });
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

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile({ url: URL.createObjectURL(file), name: file.name });
    }
  };

  const handleEmojiClick = (emojiData) => {
    setInputText((prevMessage) => prevMessage + emojiData.emoji);
  };

  const handlePost = () => {
    if (inputText.trim() || selectedFile || audioFile) {
      onSubmit({ text: inputText, file: selectedFile, audio: audioFile });
      setInputText('');  // Réinitialise le texte
      setSelectedFile(null);
      setAudioFile(null);
    }
  };

  return (
    <div className="mb-4 p-4 bg-white rounded-lg shadow-md relative">
      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder={isPost ? "Écrivez votre post..." : "Écrivez un commentaire..."}
        className="w-full p-2 border rounded-lg mb-2"
      />
      {selectedFile && <div className="mb-2"><img src={selectedFile.url} alt={selectedFile.name} className="w-32 h-32" /></div>}
      {audioFile && <div className="mb-2"><audio controls src={audioFile.url} /></div>}

      <div className="flex items-center">
        <label className="cursor-pointer mr-2">
          <AttachFile />
          <input type="file" onChange={handleFileSelect} className="hidden" />
        </label>
        <label className="cursor-pointer mr-2">
          <Mic
            className={`cursor-pointer ${recording ? 'text-red-500' : 'text-gray-600'} hover:text-yellow-500`}
            onClick={handleRecordVoice}
          />
        </label>
        <Mood
          className="ml-2 cursor-pointer text-gray-600 hover:text-yellow-500"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        />
        {showEmojiPicker && (
          <div className="absolute bottom-16 left-0 z-50">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}
        <button onClick={handlePost} className="ml-auto bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600">
          {isPost ? 'Publier' : 'Commenter'}
        </button>
      </div>
    </div>
  );
};

export default PostCommentInput;
