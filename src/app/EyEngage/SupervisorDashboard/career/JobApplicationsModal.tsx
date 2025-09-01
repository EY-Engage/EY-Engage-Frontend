"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Users, 
  Mail, 
  Phone, 
  FileText, 
  Calendar, 
  MapPin,
  Clock,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { JobOfferDto, JobApplicationDto } from "@/types/types";
import { careerService } from "@/lib/services/careerService";
import EnhancedLoading from "@/components/SkeletonLoader";
import { useFormValidation, ValidationSchemas } from "@/components/FormValidation";

interface JobApplicationsModalProps {
  job: JobOfferDto;
  applications: JobApplicationDto[];
  onClose: () => void;
  onScheduleInterview: (applicationId: string, date: Date, location: string) => void;
}

const statusConfig = {
  Pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock, label: "En attente" },
  Selected: { color: "bg-green-100 text-green-800", icon: CheckCircle, label: "Sélectionnée" },
  Rejected: { color: "bg-red-100 text-red-800", icon: XCircle, label: "Rejetée" }
};

export default function JobApplicationsModal({ 
  job, 
  applications, 
  onClose, 
  onScheduleInterview 
}: JobApplicationsModalProps) {
  const [selectedApplication, setSelectedApplication] = useState<JobApplicationDto | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { errors, validate, validateField } = useFormValidation(
    ValidationSchemas.jobApplicationSchedule
  );
  
  const [interviewData, setInterviewData] = useState({
    date: "",
    time: "",
    location: ""
  });

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

  const handleScheduleInterview = async () => {
    if (!validate(interviewData)) return;
    
    try {
      setLoading(true);
      const dateTime = new Date(`${interviewData.date}T${interviewData.time}`);
      
      await onScheduleInterview(selectedApplication!.id, dateTime, interviewData.location);
      
      setShowScheduleModal(false);
      setSelectedApplication(null);
      setInterviewData({ date: "", time: "", location: "" });
    } catch (error) {
      console.error("Error scheduling interview:", error);
      alert("Erreur lors de la planification: " + (error.message || "Erreur inconnue"));
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: keyof typeof statusConfig) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    return <Icon size={16} />;
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
          className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-ey-blue-600 to-ey-blue-700 p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Users size={24} />
                  Candidatures
                </h2>
                <p className="text-ey-blue-100 mt-1">
                  {job.title} • {applications.length} candidature{applications.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-ey-blue-100 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {applications.length === 0 ? (
              <div className="text-center py-12">
                <Users size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucune candidature
                </h3>
                <p className="text-gray-500">
                  Aucune candidature n'a été soumise pour cette offre pour le moment
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {applications.map((application) => (
                  <motion.div
                    key={application.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">
                          {application.candidateName}
                        </h3>
                        <div className="flex items-center text-gray-600 mt-1">
                          <Mail size={16} className="mr-2" />
                          <span>{application.candidateEmail}</span>
                        </div>
                        <div className="flex items-center text-gray-600 mt-1">
                          <Phone size={16} className="mr-2" />
                          <span>{application.candidatePhone || "Non renseigné"}</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        {application.resumeFilePath && (
                          <button
                            onClick={() => handleDownloadResume(application.id, application.candidateName)}
                            className="text-ey-blue-600 hover:text-ey-blue-800 p-1 rounded"
                            title="Télécharger le CV"
                          >
                            <Download size={20} />
                          </button>
                        )}
                        
                        <button
                          onClick={() => {
                            setSelectedApplication(application);
                            setShowScheduleModal(true);
                          }}
                          className="text-ey-green-600 hover:text-ey-green-800 p-1 rounded"
                          title="Planifier un entretien"
                        >
                          <Calendar size={20} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-700 mb-1">Lettre de motivation</h4>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {application.coverLetter || "Aucune lettre de motivation fournie"}
                      </p>
                    </div>
                    
                    <div className="mt-3 flex justify-between items-center">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        // @ts-ignore
                        statusConfig[application.status]?.color || "bg-gray-100 text-gray-800"
                      }`}>
                        {/* @ts-ignore */}
                        {getStatusIcon(application.status)}
                        <span className="ml-1">
                          {/* @ts-ignore */}
                          {statusConfig[application.status]?.label || application.status}
                        </span>
                      </div>
                      
                      <span className="text-xs text-gray-500">
                        Postulé le {new Date(application.appliedAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
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
      {showScheduleModal && selectedApplication && (
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
                Pour <span className="font-medium">{selectedApplication.candidateName}</span>
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
                    setSelectedApplication(null);
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