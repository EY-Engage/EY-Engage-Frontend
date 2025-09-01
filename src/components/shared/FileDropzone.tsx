'use client';

import React, { useCallback, useState } from 'react';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';

interface FileDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  acceptedTypes?: string[];
  maxFiles?: number;
  maxSize?: number; // in bytes
  className?: string;
}

export default function FileDropzone({
  onFilesSelected,
  acceptedTypes = [],
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024, // 5MB
  className = ''
}: FileDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const validateFile = (file: File): boolean => {
    if (acceptedTypes.length > 0 && !acceptedTypes.includes(file.type)) {
      alert(`Type de fichier non supporté: ${file.type}`);
      return false;
    }
    
    if (file.size > maxSize) {
      alert(`Fichier trop volumineux: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
      return false;
    }
    
    return true;
  };

  const handleFiles = useCallback((files: FileList) => {
    const validFiles = Array.from(files).filter(validateFile);
    
    if (selectedFiles.length + validFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} fichiers autorisés`);
      return;
    }
    
    const newFiles = [...selectedFiles, ...validFiles];
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
  }, [selectedFiles, maxFiles, onFilesSelected]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFiles(files);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="h-5 w-5 text-blue-500" />;
    }
    return <FileText className="h-5 w-5 text-gray-500" />;
  };

  return (
    <div className={className}>
      {/* Dropzone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
          ${isDragOver 
            ? 'border-yellow-400 bg-yellow-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
      >
        <input
          type="file"
          multiple
          onChange={handleFileInput}
          accept={acceptedTypes.join(',')}
          className="hidden"
          id="file-upload"
        />
        
        <label htmlFor="file-upload" className="cursor-pointer">
          <Upload className={`h-12 w-12 mx-auto mb-4 ${
            isDragOver ? 'text-yellow-600' : 'text-gray-400'
          }`} />
          <p className="text-lg font-medium text-gray-900 mb-2">
            Glissez vos fichiers ici
          </p>
          <p className="text-sm text-gray-600 mb-4">
            ou cliquez pour parcourir
          </p>
          <p className="text-xs text-gray-500">
            Maximum {maxFiles} fichiers, {formatFileSize(maxSize)} par fichier
          </p>
        </label>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="font-medium text-gray-900">Fichiers sélectionnés:</h4>
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                {getFileIcon(file)}
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="p-1 text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}