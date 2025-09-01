"use client";

import toast from 'react-hot-toast';
import { CloudUpload } from '@mui/icons-material';

export default function FileUpload({ setFile }: { setFile: (file: File) => void }) {
  const handleFileUpload = (file: File) => {
    if (file) {
      setFile(file);
      toast.success('Fichier téléchargé avec succès!');
    }
  };

  return (
    <div className="mt-4">
      <label className="flex items-center gap-2 bg-ey-yellow hover:bg-ey-yellow/90 text-ey-black px-4 py-2 rounded-lg cursor-pointer ">
        <CloudUpload /> Choisir un fichier
        <input
          type="file"
          onChange={(e) => handleFileUpload(e.target.files![0])}
          className="hidden"
        />
      </label>
    </div>
  );
}
