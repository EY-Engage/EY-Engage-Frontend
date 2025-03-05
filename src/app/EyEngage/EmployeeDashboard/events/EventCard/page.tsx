"use client";
import { LocationOn, EventNote, PlayCircle, Description, Close, ChevronLeft, ChevronRight } from '@mui/icons-material';
import EventActions from '../EventActions/page';
import { useState } from 'react';

export default function EventCard({ event, setEvents }) {
    const [showModal, setShowModal] = useState(false);
    const [currentFiles, setCurrentFiles] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);

    const renderFileThumbnail = (file) => {
        const [fileType] = file.type?.split('/') || [];
        
        return (
            <div className="h-full w-full relative">
                {fileType === 'image' && (
                    <img 
                        src={file.url} 
                        alt={file.name}
                        className="h-full w-full object-cover"
                    />
                )}
                
                {fileType === 'video' && (
                    <div className="h-full w-full bg-gray-900 flex items-center justify-center">
                        <PlayCircle className="text-white text-4xl opacity-90" />
                    </div>
                )}
                
                {fileType === 'application' && (
                    <div className="h-full w-full bg-gray-900 flex items-center justify-center">
                        <Description className="text-white text-4xl opacity-90" />
                    </div>
                )}
            </div>
        );
    };

    const renderFileContent = (file) => {
        const [fileType] = file.type?.split('/') || [];

        const renderFileContent = (file) => {
            const [fileType] = file.type?.split('/') || [];
        
            return (
                <div className="h-full flex items-center justify-center">
                    {fileType === 'image' && (
                        <img 
                            src={file.url} 
                            alt={file.name}
                            className="max-h-[80vh] max-w-full object-contain rounded-lg"
                        />
                    )}
        
                    {fileType === 'video' && (
                        <video 
                            controls 
                            className="max-h-[80vh] w-auto max-w-full object-contain rounded-lg"
                        >
                            <source src={file.url} type={file.type} />
                        </video>
                    )}
        
                    {fileType === 'application' && (
                        <iframe 
                            src={file.url}
                            className="w-full h-[80vh] border-0 rounded-lg"
                            title={file.name}
                        />
                    )}
        
                    {fileType === 'pdf' && (
                        <iframe 
                            src={file.url}
                            className="w-full h-[80vh] border-0 rounded-lg"
                            title={file.name}
                            type="application/pdf"
                        />
                    )}
                </div>
            );
        };        
       return (
            <div className="h-full flex items-center justify-center">
                {fileType === 'image' && (
                    <img 
                        src={file.url} 
                        alt={file.name}
                        className="max-h-[80vh] max-w-full object-contain rounded-lg"
                    />
                )}

                {fileType === 'video' && (
                    <video 
                        controls 
                        className="max-h-[80vh] w-auto max-w-full object-contain rounded-lg"
                    >
                        <source src={file.url} type={file.type} />
                    </video>
                )}

                {fileType === 'application' && (
                    <iframe 
                        src={file.url}
                        className="w-full h-[80vh] border-0 rounded-lg"
                        title={file.name}
                    />
                )}
            </div>
        );
    };

    const handleViewAllFiles = (index = 0) => {
        setCurrentFiles(event.files);
        setActiveIndex(index);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setActiveIndex(0);
    };

    return (
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all mb-8">
            <div className="p-6 space-y-4">
                {/* En-tête de l'événement */}
                <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-gray-900">{event.title}</h2>
                    <p className="text-gray-600">{event.description}</p>
                </div>

                {/* Métadonnées */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                        <EventNote className="text-blue-600" />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <LocationOn className="text-blue-600" />
                        <span>{event.location}</span>
                    </div>
                </div>

                {/* Galerie de fichiers */}
                {event.files?.length > 0 && (
                    <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2 cursor-pointer">
                            {event.files.slice(0, 4).map((file, index) => (
                                <div 
                                    key={index}
                                    onClick={() => handleViewAllFiles(index)}
                                    className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100 hover:opacity-90 transition-opacity"
                                >
                                    {renderFileThumbnail(file)}
                                    
                                    {/* Overlay pour le nombre de fichiers restants */}
                                    {index === 3 && event.files.length > 4 && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <span className="text-white font-bold text-xl">
                                                +{event.files.length - 4}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        
                        {event.files.length > 4 && (
                            <button
                                onClick={() => handleViewAllFiles()}
                                className="text-blue-600 font-medium text-sm"
                            >
                                Voir tous les fichiers ({event.files.length})
                            </button>
                        )}
                    </div>
                )}

                <EventActions event={event} setEvents={setEvents} />
            </div>

            {/* Section commentaires */}
            <div className="mt-4 p-4 border-t border-gray-100">
                <h3 className="text-blue-600 font-medium mb-2">Commentaires</h3>
                <div className="space-y-2">
                    {event.comments.length > 0 ? (
                        event.comments.map((comment, index) => (
                            <div key={index} className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-gray-800 text-sm">{comment}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-400 text-sm">Aucun commentaire</p>
                    )}
                </div>
            </div>

            {/* Modal amélioré */}
            {showModal && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="relative bg-white rounded-xl w-full max-w-4xl mx-4 overflow-hidden">
                        <button 
                            onClick={closeModal}
                            className="absolute top-4 right-4 z-50 text-gray-500 hover:text-gray-700"
                        >
                            <Close className="text-3xl" />
                        </button>
                        
                        {/* Carrousel */}
                        <div className="relative h-[80vh]">
                            {currentFiles.map((file, index) => (
                                <div 
                                    key={index}
                                    className={`absolute inset-0 transition-transform duration-300 ${
                                        index === activeIndex ? 'translate-x-0' : 
                                        index < activeIndex ? '-translate-x-full' : 'translate-x-full'
                                    }`}
                                >
                                    {renderFileContent(file)}
                                </div>
                            ))}
                            
                            {/* Contrôles de navigation */}
                            {currentFiles.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setActiveIndex(prev => Math.max(0, prev - 1))}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white"
                                    >
                                        <ChevronLeft className="text-3xl" />
                                    </button>
                                    <button
                                        onClick={() => setActiveIndex(prev => Math.min(currentFiles.length - 1, prev + 1))}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white"
                                    >
                                        <ChevronRight className="text-3xl" />
                                    </button>
                                </>
                            )}
                        </div>
                        
                        {/* Indicateurs de position */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                            {currentFiles.map((_, index) => (
                                <div 
                                    key={index}
                                    className={`w-2 h-2 rounded-full transition-colors ${
                                        index === activeIndex ? 'bg-blue-600' : 'bg-gray-300'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}