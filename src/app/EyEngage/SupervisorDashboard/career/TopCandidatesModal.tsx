"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Users, 
  Mail, 
  Phone, 
  Star, 
  Calendar, 
  MapPin,
  Download,
  CheckCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { JobOfferDto, CandidateRecommendation } from "@/types/types";
import { careerService } from "@/lib/services/careerService";
import EnhancedLoading from "@/components/SkeletonLoader";
import { useFormValidation, ValidationSchemas } from "@/components/FormValidation";

interface TopCandidatesModalProps {
  job: JobOfferDto;
  candidates: CandidateRecommendation[];
  onClose: () => void;
  onScheduleInterview: (applicationId: string, date: Date, location: string) => void;
}

export default function TopCandidatesModal({ 
  job, 
  candidates, 
  onClose, 
  onScheduleInterview 
}: TopCandidatesModalProps) {
  const [expandedCandidate, setExpandedCandidate] = useState<string | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { errors, validate, validateField } = useFormValidation(
    ValidationSchemas.jobApplicationSchedule
  );
  
  const [interviewData, setInterviewData] = useState({
    date: "",
    time: "",
    location: ""
  });

  const toggleCandidate = (id: string) => {
    setExpandedCandidate(expandedCandidate === id ? null : id);
  };

  const handleScheduleInterview = async () => {
    if (!validate(interviewData)) return;
    
    try {
      setLoading(true);
      const dateTime = new Date(`${interviewData.date}T${interviewData.time}`);
      
      await onScheduleInterview(selectedCandidate!.id, dateTime, interviewData.location);
      
      setShowScheduleModal(false);
      setSelectedCandidate(null);
      setInterviewData({ date: "", time: "", location: "" });
    } catch (error) {
      console.error("Error scheduling interview:", error);
      alert("Erreur lors de la planification: " + (error.message || "Erreur inconnue"));
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadResume = async (applicationId: string, candidateName: string) => {
    try {
      setLoading(true);
      await careerService.downloadResume(applicationId, candidateName);
    } catch (error) {
      console.error("Download error:", error);
      alert("Erreur de téléchargement: " + (error.message || "Erreur inconnue"));
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "bg-green-100 text-green-800";
    if (score <= 70) return "bg-yellow-100 text-yellow-800";
    return "bg-orange-100 text-orange-800";
  };

  if (loading) {
    return <EnhancedLoading fullScreen={true} message="Traitement en cours..." />;
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-ey-purple-600 to-ey-purple-700 p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Star size={24} />
                  Top Candidats
                </h2>
                <p className="text-ey-purple-100 mt-1">
                  {job.title} • Analyse IA
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-ey-purple-100 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {candidates.length === 0 ? (
              <div className="text-center py-12">
                <Users size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucune recommandation disponible
                </h3>
                <p className="text-gray-500">
                  L'analyse IA n'a pas trouvé de candidats correspondant parfaitement à cette offre
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {candidates.map((candidate) => (
                  <motion.div key={candidate.id} className="border border-gray-200 rounded-lg">
                    <div className="p-4 bg-gray-50 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          candidate.score >= 85 ? 'bg-green-100 text-green-800' :
                          candidate.score >= 70 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-orange-100 text-orange-800'
                        }`}>
                          <span className="font-bold text-lg">{candidate.score}/100</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{candidate.candidateName}</h3>
                          <p className="text-gray-600">{candidate.candidateEmail}</p>
                          {candidate.candidatePhone && (
                            <p className="text-gray-600 flex items-center mt-1">
                              <Phone size={16} className="mr-2" />
                              {candidate.candidatePhone}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleCandidate(candidate.id)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {expandedCandidate === candidate.id ? 
                          <ChevronUp size={24} /> : <ChevronDown size={24} />}
                      </button>
                    </div>

                    {expandedCandidate === candidate.id && (
                      <motion.div className="p-4 border-t border-gray-200">
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-700 mb-2">Analyse IA</h4>
                          <p className="text-gray-600">{candidate.justification}</p>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          {candidate.resumeFilePath && (
                            <button
                              onClick={() => handleDownloadResume(candidate.id, candidate.candidateName)}
                              className="text-ey-blue-600 hover:text-ey-blue-800 flex items-center"
                            >
                              <Download size={16} className="mr-1" />
                              Télécharger le CV
                            </button>
                          )}
                          
                          <button
                            onClick={() => {
                              setSelectedCandidate(candidate);
                              setShowScheduleModal(true);
                            }}
                            className="btn-ey-primary flex items-center gap-2"
                          >
                            <Calendar size={16} />
                            Planifier un entretien
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium"
            >
              Fermer
            </button>
          </div>
        </motion.div>
      </div>

      {/* Schedule Interview Modal */}
      {showScheduleModal && selectedCandidate && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-md w-full"
          >
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Planifier un entretien
              </h3>
              <p className="text-gray-600 mb-4">
                Pour <span className="font-medium">{selectedCandidate.candidateName}</span>
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    className={`input-ey ${errors.date ? 'input-ey-error' : ''}`}
                    value={interviewData.date}
                    onChange={(e) => {
                      setInterviewData({...interviewData, date: e.target.value});
                      validateField('date', e.target.value);
                    }}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {errors.date && <p className="text-ey-red text-sm mt-1">{errors.date}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Heure *
                  </label>
                  <input
                    type="time"
                    className={`input-ey ${errors.time ? 'input-ey-error' : ''}`}
                    value={interviewData.time}
                    onChange={(e) => {
                      setInterviewData({...interviewData, time: e.target.value});
                      validateField('time', e.target.value);
                    }}
                  />
                  {errors.time && <p className="text-ey-red text-sm mt-1">{errors.time}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lieu *
                  </label>
                  <input
                    type="text"
                    className={`input-ey ${errors.location ? 'input-ey-error' : ''}`}
                    placeholder="Ex: Campus EY Tunis"
                    value={interviewData.location}
                    onChange={(e) => {
                      setInterviewData({...interviewData, location: e.target.value});
                      validateField('location', e.target.value);
                    }}
                  />
                  {errors.location && <p className="text-ey-red text-sm mt-1">{errors.location}</p>}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowScheduleModal(false);
                    setSelectedCandidate(null);
                    setInterviewData({ date: "", time: "", location: "" });
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Annuler
                </button>
                <button
                  onClick={handleScheduleInterview}
                  className="btn-ey-primary px-4 py-2 rounded-lg"
                >
                  Confirmer
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}