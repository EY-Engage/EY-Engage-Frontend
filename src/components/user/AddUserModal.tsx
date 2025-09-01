'use client';
import { useState, useEffect } from "react";
import { 
  XIcon, User, Mail, Phone, Lock, Building, 
  Briefcase, MapPin, Camera, AlertCircle, Check, Eye, EyeOff
} from "lucide-react";
import toast from "react-hot-toast";
import { UserDto } from "@/dtos/user/UserDto";
import { checkEmailUnique, createUser } from "@/lib/services/userService";
import { CreateUserDto } from "@/dtos/user/CreateUserDto";
import { useFormValidation, ValidationSchemas, validatePasswordStrength } from "@/components/FormValidation";
import EnhancedLoading from "@/components/SkeletonLoader";

export default function AddUserModal({ 
  isOpen, 
  onClose, 
  onUserCreated 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onUserCreated: (newUser: UserDto) => void;
}) {
  const [formData, setFormData] = useState<CreateUserDto>({
    fullName: "",
    email: "",
    password: "",
    department: "",
    fonction: "",
    sector: "",
    phoneNumber: "",
    profilePictureFile: undefined,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  
  // Création d'un schéma de validation spécifique pour ce formulaire
  const addUserSchema = {
    ...ValidationSchemas.userRegistration,
    phoneNumber: [
      { pattern: ValidationSchemas.userRegistration.phoneNumber[0].pattern, message: 'Le numéro doit contenir exactement 8 chiffres' }
    ]
  };
  
  const { errors, validate, validateField, clearErrors } = useFormValidation(addUserSchema);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        fullName: "",
        email: "",
        password: "",
        department: "",
        fonction: "",
        sector: "",
        phoneNumber: "",
        profilePictureFile: undefined,
      });
      setImagePreview(null);
      clearErrors();
    }
  }, [isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validation de l'image
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      
      if (file.size > maxSize) {
        toast.error("L'image ne doit pas dépasser 5MB");
        return;
      }
      
      if (!allowedTypes.includes(file.type)) {
        toast.error("Format non supporté (JPG, PNG, WebP uniquement)");
        return;
      }
      
      setFormData({ ...formData, profilePictureFile: file });
      
      // Prévisualisation
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation complète
    if (!validate(formData)) {
      toast.error("Veuillez corriger les erreurs du formulaire");
      return;
    }
    
    // Vérification supplémentaire de l'email
    try {
      const emailUnique = await checkEmailUnique(formData.email);
      if (!emailUnique) {
        toast.error("Cet email est déjà utilisé");
        return;
      }
    } catch (error) {
      toast.error("Erreur lors de la vérification de l'email");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const form = new FormData();
      form.append('FullName', formData.fullName);
      form.append('Email', formData.email);
      form.append('Password', formData.password);
      form.append('Department', formData.department);
      if (formData.fonction) form.append('Fonction', formData.fonction);
      if (formData.sector) form.append('Sector', formData.sector);
      if (formData.phoneNumber) form.append('PhoneNumber', formData.phoneNumber);
      if (formData.profilePictureFile) {
        form.append('ProfilePictureFile', formData.profilePictureFile);
      }

      const newUser = await createUser(form);
      onUserCreated(newUser);
      
      toast.success("✅ Utilisateur créé avec succès !");
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la création");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const passwordStrength = validatePasswordStrength(formData.password);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden border border-gray-200">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-ey-yellow to-[#f0c414] p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-ey-black flex items-center gap-2">
            <User className="h-6 w-6" />
            Ajouter un Utilisateur
          </h2>
          <button 
            onClick={onClose} 
            className="text-ey-black hover:bg-ey-black/10 rounded-full p-2 transition-colors"
            disabled={isSubmitting}
          >
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Corps */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Photo de profil */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-4 border-ey-yellow flex items-center justify-center">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Camera className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-ey-yellow rounded-full p-2 cursor-pointer hover:bg-[#e0b414] transition-colors">
                <Camera className="h-4 w-4 text-ey-black" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={isSubmitting}
                />
              </label>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-1">Photo de profil (optionnel)</p>
              <p className="text-xs text-gray-500">JPG, PNG ou WebP. Max 5MB.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nom complet */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Nom complet *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => {
                    setFormData({ ...formData, fullName: e.target.value });
                    validateField('fullName', e.target.value);
                  }}
                  className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ey-yellow ${
                    errors.fullName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Jean Dupont"
                  disabled={isSubmitting}
                />
              </div>
              {errors.fullName && (
                <p className="text-red-500 text-xs flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    validateField('email', e.target.value);
                  }}
                  className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ey-yellow ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: jean.dupont@ey.com"
                  disabled={isSubmitting}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Mot de passe */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Mot de passe *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type={passwordVisible ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    validateField('password', e.target.value);
                  }}
                  className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ey-yellow ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  {passwordVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.password}
                </p>
              )}
              
              {/* Indicateur de force du mot de passe */}
              {formData.password && (
                <div className="space-y-2">
                  <div className="flex gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                          i < (passwordStrength.strength === 'very-strong' ? 4 :
                               passwordStrength.strength === 'strong' ? 3 :
                               passwordStrength.strength === 'medium' ? 2 : 1)
                            ? passwordStrength.strength === 'very-strong' ? 'bg-green-500' :
                              passwordStrength.strength === 'strong' ? 'bg-ey-yellow' :
                              passwordStrength.strength === 'medium' ? 'bg-orange-400' : 'bg-red-500'
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-600">
                    Force: {
                      passwordStrength.strength === 'very-strong' ? 'Très forte' :
                      passwordStrength.strength === 'strong' ? 'Forte' :
                      passwordStrength.strength === 'medium' ? 'Moyenne' : 'Faible'
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Téléphone */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Numéro de téléphone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => {
                    setFormData({ ...formData, phoneNumber: e.target.value });
                    validateField('phoneNumber', e.target.value);
                  }}
                  className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ey-yellow ${
                    errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: 12345678"
                  disabled={isSubmitting}
                />
              </div>
              {errors.phoneNumber && (
                <p className="text-red-500 text-xs flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.phoneNumber}
                </p>
              )}
            </div>

            {/* Département */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Département *
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <select
                  value={formData.department}
                  onChange={(e) => {
                    setFormData({ ...formData, department: e.target.value });
                    validateField('department', e.target.value);
                  }}
                  className={`w-full pl-10 pr-3 py-2.5 border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-ey-yellow ${
                    errors.department ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting}
                >
                  <option value="">Sélectionner un département</option>
                  <option value="Assurance">Assurance</option>
                  <option value="Consulting">Consulting</option>
                  <option value="StrategyAndTransactions">Strategy & Transactions</option>
                  <option value="Tax">Tax</option>
                </select>
              </div>
              {errors.department && (
                <p className="text-red-500 text-xs flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.department}
                </p>
              )}
            </div>

            {/* Fonction */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Fonction
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.fonction}
                  onChange={(e) => setFormData({ ...formData, fonction: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ey-yellow"
                  placeholder="Ex: Consultant Senior"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Secteur */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Secteur
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ey-yellow"
                  placeholder="Ex: Technologies"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end pt-4 gap-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-4 py-2.5 bg-ey-yellow text-white rounded-lg hover:bg-[#e0b414] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Création...
                </>
              ) : (
                <>
                  <Check className="h-5 w-5" />
                  Créer l'utilisateur
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}