"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Briefcase, 
  MapPin, 
  Users, 
  Clock, 
  FileText, 
  Tag
} from "lucide-react";
import { careerService } from "@/lib/services/careerService";
import { JobOfferDto, Department, JobType } from "@/types/types";
import { useFormValidation, ValidationSchemas } from "@/components/FormValidation";
import EnhancedLoading from "@/components/SkeletonLoader";
interface CreateJobOfferModalProps {
  userDepartment: Department;
  onClose: () => void;
  onSuccess: () => void;
}

const jobTypeOptions = [
  { value: "FullTime", label: "Temps plein" },
  { value: "PartTime", label: "Temps partiel" },
  { value: "Contract", label: "Contrat" },
  { value: "Internship", label: "Stage" }
];

const experienceLevels = [
  "Junior (0-2 ans)",
  "Confirmé (3-5 ans)", 
  "Senior (5-10 ans)",
  "Expert (10+ ans)"
];

export default function CreateJobOfferModal({ 
  userDepartment,
  onClose, 
  onSuccess 
}: CreateJobOfferModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    keySkills: "",
    experienceLevel: "",
    location: "",
    jobType: "" as JobType,
    closeDate: ""
  });

  const { errors, validate, validateField } = useFormValidation(ValidationSchemas.jobOffer);

  const handleSubmit = async () => {
    if (!validate(formData)) return;

    try {
      setLoading(true);
      
      const jobOfferData = {
        title: formData.title,
        description: formData.description,
        keySkills: formData.keySkills,
        experienceLevel: formData.experienceLevel,
        location: formData.location,
        jobType: formData.jobType,
        closeDate: new Date(formData.closeDate).toISOString(),
        isActive: true
      };

      await careerService.createJobOffer(jobOfferData);
      onSuccess();
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      alert("Erreur lors de la création de l'offre");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <EnhancedLoading fullScreen={true} message="Création de l'offre en cours..." />;
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-ey-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="card-ey max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          <div className="gradient-ey-primary p-6 text-ey-black">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-ey-2xl font-bold flex items-center gap-2">
                  <Briefcase size={24} />
                  Créer une nouvelle offre
                </h2>
                <p className="text-ey-black/70 mt-1">
                  Ajoutez une nouvelle opportunité de carrière chez EY
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-ey-black/60 hover:text-ey-black transition-colors focus-visible-ey"
                disabled={loading}
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] scrollbar-ey">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-ey-sm font-medium text-ey-black mb-2">
                    Titre du poste *
                  </label>
                  <div className="relative">
                    <Tag size={18} className="absolute left-3 top-3.5 text-ey-gray-400" />
                    <input
                      type="text"
                      className={`input-ey pl-10 ${errors.title ? 'input-ey-error' : ''}`}
                      value={formData.title}
                      onChange={(e) => {
                        setFormData({ ...formData, title: e.target.value });
                        validateField('title', e.target.value);
                      }}
                      placeholder="Ex: Consultant Senior"
                    />
                  </div>
                  {errors.title && <p className="text-ey-red text-ey-sm mt-1">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-ey-sm font-medium text-ey-black mb-2">
                    Département
                  </label>
                  <div className="relative">
                    <Users size={18} className="absolute left-3 top-3.5 text-ey-gray-400" />
                    <input
                      type="text"
                      readOnly
                      className="input-ey pl-10 bg-ey-gray-100 cursor-not-allowed"
                      value={userDepartment}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-ey-sm font-medium text-ey-black mb-2">
                    Type de contrat *
                  </label>
                  <div className="relative">
                    <Briefcase size={18} className="absolute left-3 top-3.5 text-ey-gray-400" />
                    <select
                      className={`select-ey pl-10 ${errors.jobType ? 'input-ey-error' : ''}`}
                      value={formData.jobType}
                      onChange={(e) => {
                        setFormData({ ...formData, jobType: e.target.value as JobType });
                        validateField('jobType', e.target.value);
                      }}
                    >
                      <option value="">Sélectionner un type</option>
                      {jobTypeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.jobType && <p className="text-ey-red text-ey-sm mt-1">{errors.jobType}</p>}
                </div>

                <div>
                  <label className="block text-ey-sm font-medium text-ey-black mb-2">
                    Niveau d'expérience *
                  </label>
                  <div className="relative">
                    <Clock size={18} className="absolute left-3 top-3.5 text-ey-gray-400" />
                    <select
                      className={`select-ey pl-10 ${errors.experienceLevel ? 'input-ey-error' : ''}`}
                      value={formData.experienceLevel}
                      onChange={(e) => {
                        setFormData({ ...formData, experienceLevel: e.target.value });
                        validateField('experienceLevel', e.target.value);
                      }}
                    >
                      <option value="">Sélectionner un niveau</option>
                      {experienceLevels.map(level => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.experienceLevel && <p className="text-ey-red text-ey-sm mt-1">{errors.experienceLevel}</p>}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-ey-sm font-medium text-ey-black mb-2">
                    Localisation *
                  </label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-3 top-3.5 text-ey-gray-400" />
                    <input
                      type="text"
                      className={`input-ey pl-10 ${errors.location ? 'input-ey-error' : ''}`}
                      value={formData.location}
                      onChange={(e) => {
                        setFormData({ ...formData, location: e.target.value });
                        validateField('location', e.target.value);
                      }}
                      placeholder="Ex: Tunis, Paris, Lyon"
                    />
                  </div>
                  {errors.location && <p className="text-ey-red text-ey-sm mt-1">{errors.location}</p>}
                </div>

                <div>
                  <label className="block text-ey-sm font-medium text-ey-black mb-2">
                    Date de clôture *
                  </label>
                  <input
                    type="date"
                    className={`input-ey ${errors.closeDate ? 'input-ey-error' : ''}`}
                    value={formData.closeDate}
                    onChange={(e) => {
                      setFormData({ ...formData, closeDate: e.target.value });
                      validateField('closeDate', e.target.value);
                    }}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {errors.closeDate && <p className="text-ey-red text-ey-sm mt-1">{errors.closeDate}</p>}
                </div>

                <div>
                  <label className="block text-ey-sm font-medium text-ey-black mb-2">
                    Compétences clés *
                  </label>
                  <textarea
                    rows={4}
                    className={`textarea-ey ${errors.keySkills ? 'input-ey-error' : ''}`}
                    value={formData.keySkills}
                    onChange={(e) => {
                      setFormData({ ...formData, keySkills: e.target.value });
                      validateField('keySkills', e.target.value);
                    }}
                    placeholder="Ex: Java, Spring Boot, PostgreSQL, Microservices..."
                  />
                  {errors.keySkills && <p className="text-ey-red text-ey-sm mt-1">{errors.keySkills}</p>}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-ey-sm font-medium text-ey-black mb-2">
                Description du poste *
              </label>
              <div className="relative">
                <FileText size={18} className="absolute left-3 top-3 text-ey-gray-400" />
                <textarea
                  rows={6}
                  className={`textarea-ey pl-10 ${errors.description ? 'input-ey-error' : ''}`}
                  value={formData.description}
                  onChange={(e) => {
                    setFormData({ ...formData, description: e.target.value });
                    validateField('description', e.target.value);
                  }}
                  placeholder="Décrivez les responsabilités, missions et ce que vous attendez du candidat..."
                />
                <div className="absolute bottom-2 right-2 text-ey-xs text-ey-gray-500">
                  {formData.description.length}/5000
                </div>
              </div>
              {errors.description && <p className="text-ey-red text-ey-sm mt-1">{errors.description}</p>}
            </div>

            <div className="flex justify-between mt-8 pt-6 border-t border-ey-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="btn-ey-outline"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-ey-primary flex items-center gap-2"
              >
                {loading && (
                  <div className="loading-spinner-ey h-4 w-4 border-ey-black" />
                )}
                {loading ? "Création en cours..." : "Créer l'offre"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}