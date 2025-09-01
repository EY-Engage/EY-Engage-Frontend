"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, FileText, Check, MessageSquare } from "lucide-react";
import { careerService } from "@/lib/services/careerService";
import { JobOfferDto } from "@/types/types";
import { useFormValidation } from "@/components/FormValidation";
import EnhancedLoading from "@/components/SkeletonLoader";

interface JobApplicationModalProps {
  job: JobOfferDto;
  onClose: () => void;
  onSuccess: () => void;
}

const applicationSchema = {
  coverLetter: [
    { required: true, message: 'La lettre de motivation est requise' },
    { minLength: 50, message: 'La lettre de motivation doit contenir au moins 50 caractères' },
    { maxLength: 2000, message: 'La lettre de motivation ne peut pas dépasser 2000 caractères' }
  ]
};

export default function JobApplicationModal({ job, onClose, onSuccess }: JobApplicationModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const { errors, validate, validateField, clearErrors } = useFormValidation(applicationSchema);
  const [fileError, setFileError] = useState("");

  const steps = [
    { number: 1, title: "Documents", icon: <FileText size={16} /> },
    { number: 2, title: "Confirmation", icon: <Check size={16} /> }
  ];

  const validateFile = (file: File | null): boolean => {
    if (!file) {
      setFileError("Le CV est requis");
      return false;
    }
    if (file.type !== 'application/pdf') {
      setFileError("Le CV doit être au format PDF");
      return false;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB
      setFileError("Le fichier ne doit pas dépasser 5MB");
      return false;
    }
    setFileError("");
    return true;
  };

  const handleSubmit = async () => {
    if (!validateFile(resumeFile)) return;
    if (!validate({ coverLetter })) return;

    try {
      setLoading(true);
      
      const applicationData = new FormData();
      applicationData.append("jobOfferId", job.id);
      applicationData.append("coverLetter", coverLetter);
      applicationData.append("resume", resumeFile!);

      await careerService.applyToJob(applicationData);
      onSuccess();
    } catch (error) {
      console.error("Erreur lors de la candidature:", error);
      alert("Erreur lors de la soumission de votre candidature");
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    if (step === 1) {
      return resumeFile && coverLetter.trim().length >= 50 && !fileError;
    }
    return true;
  };

  if (loading) {
    return <EnhancedLoading fullScreen={true} message="Soumission de votre candidature..." />;
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-ey-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="card-ey max-w-2xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header avec gradient EY */}
          <div className="gradient-ey-primary p-6 text-ey-black">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-ey-2xl font-bold mb-2">Candidature</h2>
                <p className="text-ey-black/80 font-medium">{job.title}</p>
              </div>
              <button
                onClick={onClose}
                className="text-ey-black/60 hover:text-ey-black transition-colors focus-visible-ey"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Progress bar */}
            <div className="flex justify-between mt-6 relative">
              {steps.map((stepItem, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step > index ? "bg-ey-black text-ey-yellow" : 
                    step === index + 1 ? "bg-ey-white text-ey-black" : 
                    "bg-ey-yellow-dark text-ey-black/50"
                  }`}>
                    {step > index ? <Check size={16} /> : stepItem.icon}
                  </div>
                  <span className="mt-1 text-ey-xs text-center text-ey-black/70">
                    {stepItem.title}
                  </span>
                </div>
              ))}
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-ey-yellow-dark">
                <div 
                  className="h-full bg-ey-black transition-all duration-300"
                  style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh] scrollbar-ey">
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="text-ey-lg font-semibold text-ey-black mb-4">
                  Documents requis
                </h3>

                {/* CV Upload */}
                <div>
                  <label className="block text-ey-sm font-medium text-ey-black mb-2">
                    CV (PDF uniquement) *
                  </label>
                  <div className={`border-2 border-dashed rounded-ey-lg p-6 text-center transition-all duration-200 ${
                    fileError ? 'border-ey-red bg-ey-red/5' : 
                    resumeFile ? 'border-ey-green bg-ey-green/5' : 
                    'border-ey-gray-300 hover:border-ey-yellow bg-ey-light-gray'
                  }`}>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setResumeFile(file);
                        validateFile(file);
                      }}
                      className="hidden"
                      id="resume-upload"
                    />
                    <label htmlFor="resume-upload" className="cursor-pointer">
                      <Upload size={32} className={`mx-auto mb-2 ${
                        fileError ? 'text-ey-red' : 
                        resumeFile ? 'text-ey-green' : 
                        'text-ey-gray-400'
                      }`} />
                      {resumeFile ? (
                        <div>
                          <p className="text-ey-sm text-ey-green font-medium">{resumeFile.name}</p>
                          <p className="text-ey-xs text-ey-gray-500 mt-1">
                            {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      ) : (
                        <>
                          <p className="text-ey-sm text-ey-gray-600">
                            Cliquez pour télécharger votre CV
                          </p>
                          <p className="text-ey-xs text-ey-gray-400 mt-1">
                            Format PDF uniquement (max 5MB)
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                  {fileError && (
                    <p className="text-ey-red text-ey-sm mt-2 flex items-center">
                      <X size={16} className="mr-1" />
                      {fileError}
                    </p>
                  )}
                </div>

                {/* Cover Letter */}
                <div>
                  <label className="block text-ey-sm font-medium text-ey-black mb-2">
                    Lettre de motivation *
                  </label>
                  <div className="relative">
                    <MessageSquare size={18} className="absolute left-3 top-3 text-ey-gray-400" />
                    <textarea
                      placeholder="Expliquez pourquoi vous souhaitez rejoindre EY et ce poste en particulier..."
                      rows={6}
                      className={`textarea-ey pl-10 ${errors.coverLetter ? 'input-ey-error' : ''}`}
                      value={coverLetter}
                      onChange={(e) => {
                        setCoverLetter(e.target.value);
                        validateField('coverLetter', e.target.value);
                      }}
                    />
                    <div className="absolute bottom-2 right-2 text-ey-xs text-ey-gray-500">
                      {coverLetter.length}/2000
                    </div>
                  </div>
                  {errors.coverLetter && (
                    <p className="text-ey-red text-ey-sm mt-2 flex items-center">
                      <X size={16} className="mr-1" />
                      {errors.coverLetter}
                    </p>
                  )}
                </div>

                {/* Info box */}
                <div className="alert-ey-info">
                  <p className="text-ey-sm">
                    💡 <strong>Conseil :</strong> Personnalisez votre lettre en mentionnant des aspects spécifiques d'EY et du poste qui vous motivent.
                  </p>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-center"
              >
                <div className="bg-ey-green/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Check size={32} className="text-ey-green" />
                </div>
                
                <h3 className="text-ey-lg font-semibold text-ey-black mb-2">
                  Confirmation de candidature
                </h3>
                
                <p className="text-ey-gray-600 mb-6">
                  Vous êtes sur le point de soumettre votre candidature pour :
                </p>
                
                <div className="card-ey p-4 text-left">
                  <h4 className="font-semibold text-ey-black">{job.title}</h4>
                  <p className="text-ey-sm text-ey-gray-600 mt-1">{job.department} • {job.location}</p>
                  <div className="mt-3 text-ey-sm space-y-2">
                    <p><strong>Candidat recommandé:</strong> {formData.candidateName}</p>
                    <p><strong>Email:</strong> {formData.candidateEmail}</p>
                    <p><strong>CV:</strong> {resumeFile?.name}</p>
                  </div>
                </div>

                <div className="alert-ey-warning mt-4">
                  <p className="text-ey-sm">
                    ⚠️ Le candidat sera notifié par email de votre recommandation
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-ey-light-gray px-6 py-4 flex justify-between border-t border-ey-gray-200">
            <button
              onClick={step === 1 ? onClose : () => setStep(step - 1)}
              className="btn-ey-outline"
              disabled={loading}
            >
              {step === 1 ? "Annuler" : "Précédent"}
            </button>
            
            <button
              onClick={step === 3 ? handleSubmit : () => setStep(step + 1)}
              disabled={!isStepValid() || loading}
              className="btn-ey-tertiary flex items-center gap-2"
            >
              {loading && (
                <div className="loading-spinner-ey h-4 w-4 border-ey-white" />
              )}
              {step === 3 ? "Soumettre la recommandation" : "Suivant"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}