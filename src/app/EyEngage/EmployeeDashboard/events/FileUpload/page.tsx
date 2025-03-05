"use client";
import toast from 'react-hot-toast';
import { CloudUpload } from '@mui/icons-material';

export default function FileUpload({ setFiles }) {
    const handleFileUpload = (file) => {
        if (file) {
            const fileObject = {
                name: file.name,
                url: URL.createObjectURL(file),
                type: file.type
            };

            setFiles((prevFiles) => [...prevFiles, fileObject]);
            toast.success('Fichier téléchargé avec succès!');
        }
    };

    return (
        <div className="mt-4">
            <label className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-600 transition">
                <CloudUpload /> Choisir un fichier
                <input
                    type="file"
                    onChange={(e) => handleFileUpload(e.target.files[0])}
                    className="hidden"
                />
            </label>
        </div>
    );
}
