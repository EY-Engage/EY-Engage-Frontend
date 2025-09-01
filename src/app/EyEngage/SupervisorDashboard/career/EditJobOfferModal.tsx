"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Briefcase, 
  MapPin, 
  Clock, 
  FileText, 
  Tag,
  Save
} from "lucide-react";
import { careerService } from "@/lib/services/careerService";
import { JobOfferDto, JobType } from "@/types/types";

interface EditJobOfferModalProps {
  job: JobOfferDto;
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

export default function EditJobOfferModal({ 
  job, 
  onClose, 
  onSuccess 
}: EditJobOfferModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: job.title,
    description: job.description,
    keySkills: job.keySkills,
    experienceLevel: job.experienceLevel,
    location: job.location,
    jobType: job.jobType,
    closeDate: job.closeDate?.split('T')[0] || "",
    isActive: job.isActive
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "Le titre est requis";
    if (!formData.description.trim()) newErrors.description = "La description est requise";
    if (!formData.keySkills.trim()) newErrors.keySkills = "Les compétences clés sont requises";
    if (!formData.experienceLevel) newErrors.experienceLevel = "Le niveau d'expérience est requis";
    if (!formData.location.trim()) newErrors.location = "La localisation est requise";
    if (!formData.jobType) newErrors.jobType = "Le type de poste est requis";
    if (!formData.closeDate) newErrors.closeDate = "La date de clôture est requise";

    if (formData.closeDate) {
      const closeDate = new Date(formData.closeDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (closeDate <= today) {
        newErrors.closeDate = "La date de clôture doit être dans le futur";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const updatedJob: JobOfferDto = {
        ...job,
        ...formData,
        closeDate: new Date(formData.closeDate).toISOString()
      };

      await careerService.updateJobOffer(job.id, updatedJob);
      onSuccess();
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      alert("Erreur lors de la mise à jour de l'offre");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Briefcase size={24} />
                  Modifier l'offre
                </h2>
                <p className="text-indigo-100 mt-1">
                  {job.title}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-indigo-100 hover:text-white transition-colors"
                disabled={loading}
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre du poste *
                  </label>
                  <div className="relative">
                    <Tag size={18} className="absolute left-3 top-3.5 text-gray-400" />
                    <input
                      type="text"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        errors.title ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de contrat *
                  </label>
                  <div className="relative">
                    <Briefcase size={18} className="absolute left-3 top-3.5 text-gray-400" />
                    <select
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        errors.jobType ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.jobType}
                      onChange={(e) => setFormData({ ...formData, jobType: e.target.value as JobType })}
                    >
                      {jobTypeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.jobType && <p className="text-red-500 text-sm mt-1">{errors.jobType}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Niveau d'expérience *
                  </label>
                  <div className="relative">
                    <Clock size={18} className="absolute left-3 top-3.5 text-gray-400" />
                    <select
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        errors.experienceLevel ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.experienceLevel}
                      onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                    >
                      {experienceLevels.map(level => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.experienceLevel && <p className="text-red-500 text-sm mt-1">{errors.experienceLevel}</p>}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Localisation *
                  </label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-3 top-3.5 text-gray-400" />
                    <input
                      type="text"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        errors.location ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                  {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de clôture *
                  </label>
                  <input
                    type="date"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      errors.closeDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.closeDate}
                    onChange={(e) => setFormData({ ...formData, closeDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {errors.closeDate && <p className="text-red-500 text-sm mt-1">{errors.closeDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Compétences clés *
                  </label>
                  <textarea
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none ${
                      errors.keySkills ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.keySkills}
                    onChange={(e) => setFormData({ ...formData, keySkills: e.target.value })}
                  />
                  {errors.keySkills && <p className="text-red-500 text-sm mt-1">{errors.keySkills}</p>}
                </div>
                
                <div className="flex items-center">
                  <input
                    id="active-checkbox"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <label htmlFor="active-checkbox" className="ml-2 block text-sm text-gray-900">
                    Offre active
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description du poste *
              </label>
              <div className="relative">
                <FileText size={18} className="absolute left-3 top-3 text-gray-400" />
                <textarea
                  rows={6}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {loading ? "Enregistrement..." : "Enregistrer les modifications"}
                <Save size={18} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}