'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserDto } from '@/dtos/user/UserDto';
import {
  X, User, Mail, Phone, Building, Briefcase, MapPin,
  Upload, Camera, AlertCircle, CheckCircle, Edit2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useFormValidation, ValidationSchemas } from '../FormValidation';
import EnhancedLoading from '../SkeletonLoader';

interface UpdateUserModalProps {
  user: UserDto;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: (user: UserDto) => void;
}

interface FormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  fonction: string;
  department: string;
  sector: string;
  profilePicture?: File | null;
}

const departments = [
  'Ressources Humaines', 'Finance', 'IT', 'Marketing', 
  'Ventes', 'Production', 'Logistique', 'Juridique'
];

const sectors = [
  'Audit', 'Conseil', 'Fiscalité', 'Transactions',
  'Risk Management', 'Digital', 'Sustainability'
];

const functions = [
  'Directeur', 'Manager', 'Senior', 'Junior',
  'Consultant', 'Analyste', 'Coordinateur', 'Assistant'
];

export default function UpdateUserModal({ user, isOpen, onClose, onUserUpdated }: UpdateUserModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phoneNumber: '',
    fonction: '',
    department: '',
    sector: '',
    profilePicture: null
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validation - on exclut le mot de passe pour la mise à jour
  const updateValidationSchema = {
    fullName: ValidationSchemas.userRegistration.fullName,
    email: ValidationSchemas.userRegistration.email,
    phoneNumber: ValidationSchemas.userRegistration.phoneNumber,
    department: ValidationSchemas.userRegistration.department
  };

  const { errors, validate, validateField, clearErrors } = useFormValidation(updateValidationSchema);

  useEffect(() => {
    if (user && isOpen) {
      const initialData = {
        fullName: user.fullName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        fonction: user.fonction || '',
        department: user.department || '',
        sector: user.sector || '',
        profilePicture: null
      };
      setFormData(initialData);
      setImagePreview(user.profilePicture ? 
        `${process.env.NEXT_PUBLIC_BACKEND_URL}${user.profilePicture}` : null);
      setHasChanges(false);
      clearErrors();
    }
  }, [user, isOpen, clearErrors]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    setHasChanges(true);
    validateField(field, value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Le fichier ne doit pas dépasser 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Veuillez sélectionner une image');
        return;
      }

      setFormData(prev => ({ ...prev, profilePicture: file }));
      setHasChanges(true);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, profilePicture: null }));
    setImagePreview(null);
    setHasChanges(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasChanges) {
      toast.info('Aucune modification détectée');
      return;
    }

    const isValidForm = validate(formData);
    if (!isValidForm) {
      toast.error('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    setIsLoading(true);

    try {
      // Simulation de mise à jour
      await new Promise(resolve => setTimeout(resolve, 1500));

      const updatedUser: UserDto = {
        ...user,
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        fonction: formData.fonction,
        department: formData.department,
        sector: formData.sector,
        profilePicture: imagePreview,
        updatedAt: new Date().toISOString()
      };

      onUserUpdated(updatedUser);
      toast.success('Utilisateur mis à jour avec succès !');

    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="modal-ey">
        <motion.div 
          className="modal-content-ey max-w-3xl w-full max-h-[95vh] overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* En-tête */}
          <div className="modal-header-ey bg-ey-black text-ey-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-ey-yellow rounded-ey-lg flex items-center justify-center">
                <Edit2 className="w-6 h-6 text-ey-black" />
              </div>
              <div>
                <h2 className="text-ey-xl font-bold text-ey-white">Modifier l'Utilisateur</h2>
                <p className="text-ey-gray-300 text-ey-sm">{user.fullName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-ey-gray-800 rounded-ey-lg transition-colors"
            >
              <X className="w-6 h-6 text-ey-white" />
            </button>
          </div>

          {/* Contenu */}
          <div className="modal-body-ey overflow-y-auto scrollbar-ey">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <EnhancedLoading 
                  fullScreen={false}
                  message="Mise à jour en cours..."
                  variant="dots"
                />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Photo de profil */}
                <div className="text-center">
                  <div className="mb-4">
                    <label className="block text-ey-sm font-medium text-ey-black mb-3">
                      Photo de profil
                    </label>
                    <div className="flex flex-col items-center gap-4">
                      {imagePreview ? (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Prévisualisation"
                            className="w-24 h-24 rounded-full object-cover border-4 border-ey-yellow shadow-ey-lg"
                          />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute -top-2 -right-2 w-8 h-8 bg-ey-red rounded-full flex items-center justify-center text-ey-white hover:bg-ey-red/80"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-24 h-24 bg-ey-gray-200 rounded-full flex items-center justify-center border-4 border-dashed border-ey-gray-300">
                          <Camera className="w-8 h-8 text-ey-gray-400" />
                        </div>
                      )}
                      <div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="btn-ey-outline flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          Changer l'image
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nom complet */}
                  <div>
                    <label className="block text-ey-sm font-medium text-ey-black mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className={`input-ey ${errors.fullName ? 'input-ey-error' : ''}`}
                    />
                    {errors.fullName && (
                      <p className="text-ey-red text-ey-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-ey-sm font-medium text-ey-black mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Adresse email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`input-ey ${errors.email ? 'input-ey-error' : ''}`}
                    />
                    {errors.email && (
                      <p className="text-ey-red text-ey-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Téléphone */}
                  <div>
                    <label className="block text-ey-sm font-medium text-ey-black mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      className={`input-ey ${errors.phoneNumber ? 'input-ey-error' : ''}`}
                      maxLength={8}
                    />
                    {errors.phoneNumber && (
                      <p className="text-ey-red text-ey-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.phoneNumber}
                      </p>
                    )}
                  </div>

                  {/* Fonction */}
                  <div>
                    <label className="block text-ey-sm font-medium text-ey-black mb-2">
                      <Briefcase className="w-4 h-4 inline mr-2" />
                      Fonction
                    </label>
                    <select
                      value={formData.fonction}
                      onChange={(e) => handleInputChange('fonction', e.target.value)}
                      className="select-ey"
                    >
                      <option value="">Sélectionner une fonction</option>
                      {functions.map(func => (
                        <option key={func} value={func}>{func}</option>
                      ))}
                    </select>
                  </div>

                  {/* Département */}
                  <div>
                    <label className="block text-ey-sm font-medium text-ey-black mb-2">
                      <Building className="w-4 h-4 inline mr-2" />
                      Département *
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      className={`select-ey ${errors.department ? 'input-ey-error' : ''}`}
                    >
                      <option value="">Sélectionner un département</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                    {errors.department && (
                      <p className="text-ey-red text-ey-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.department}
                      </p>
                    )}
                  </div>

                  {/* Secteur */}
                  <div>
                    <label className="block text-ey-sm font-medium text-ey-black mb-2">
                      <MapPin className="w-4 h-4 inline mr-2" />
                      Secteur
                    </label>
                    <select
                      value={formData.sector}
                      onChange={(e) => handleInputChange('sector', e.target.value)}
                      className="select-ey"
                    >
                      <option value="">Sélectionner un secteur</option>
                      {sectors.map(sector => (
                        <option key={sector} value={sector}>{sector}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Statut des modifications */}
                {hasChanges && (
                  <div className="alert-ey-warning">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      <span>Des modifications non sauvegardées sont en attente</span>
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>

          {/* Pied de page */}
          <div className="modal-footer-ey bg-ey-light-gray">
            <div className="flex items-center justify-between">
              <div className="text-ey-sm text-ey-gray-600">
                Dernière mise à jour: {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('fr-FR') : 'N/A'}
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="btn-ey-outline"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isLoading || !hasChanges}
                  className="btn-ey-primary flex items-center gap-2"
                >
                  {isLoading ? (
                    <div className="loading-spinner-ey w-4 h-4" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Sauvegarder
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
