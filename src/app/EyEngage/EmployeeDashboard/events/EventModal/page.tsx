"use client";

import { useState, useRef } from "react";
import { X, Save, Calendar as CalendarIcon, Upload, MapPin, FileText, Clock, AlertCircle } from "lucide-react";
import { createEvent } from "@/lib/services/eventService";
import { CreateEventForm } from "@/dtos/event/CreateEventForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import toast from "react-hot-toast";
import EnhancedLoading from "@/components/SkeletonLoader";
import { useFormValidation, ValidationSchemas } from "@/components/FormValidation";



/**
 * Composant EventModal - Modal de création d'événement avec validation complète
 * Fonctionnalités:
 * - Formulaire complet avec validation en temps réel
 * - Upload d'image avec prévisualisation
 * - Sélection de date avec calendrier
 * - Design responsive EY
 * - Gestion des erreurs et succès
 * - Animation d'ouverture/fermeture
 */

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newEvent: any) => void;
}

export default function EventModal({ isOpen, onClose, onCreated }: EventModalProps) {
  // États du formulaire
  const [formData, setFormData] = useState<CreateEventForm>({
    title: "",
    description: "",
    date: "",
    location: "",
  });
  
  const [file, setFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [date, setDate] = useState<Date>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validation avec le système de validation personnalisé
  const { errors, validate, validateField, clearErrors } = useFormValidation(ValidationSchemas.event);

  // Validation personnalisée pour la date
  const validateDateTime = (selectedDate: Date): boolean => {
    const now = new Date();
    const minDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24h minimum
    return selectedDate >= minDate;
  };

  // Gestion de la sélection de fichier
  const handleFileChange = (selectedFile: File | null) => {
    setFile(selectedFile);
    
    if (selectedFile) {
      // Validation du fichier
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      
      if (selectedFile.size > maxSize) {
        toast.error("L'image ne doit pas dépasser 5MB");
        return;
      }
      
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error("Format d'image non supporté (JPG, PNG, WebP uniquement)");
        return;
      }

      // Créer la prévisualisation
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreviewImage(null);
    }
  };

  // Gestion des changements de champ avec validation
  const handleInputChange = (field: keyof CreateEventForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Validation en temps réel
    validateField(field, value);
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation de la date
    if (!date) {
      toast.error("Veuillez sélectionner une date");
      return;
    }
    
    if (!validateDateTime(date)) {
      toast.error("L'événement doit être programmé au moins 24h à l'avance");
      return;
    }

    // Validation complète du formulaire
    const formDataWithDate = {
      ...formData,
      date: date.toISOString()
    };
    
    if (!validate(formDataWithDate)) {
      toast.error("Veuillez corriger les erreurs du formulaire");
      return;
    }

    setIsSaving(true);
    
    try {
      const submitData = new FormData();
      submitData.append("Title", formData.title.trim());
      submitData.append("Description", formData.description.trim());
      submitData.append("Date", date.toISOString());
      submitData.append("Location", formData.location.trim());
      
      if (file) {
        submitData.append("ImageFile", file);
      }

      const newEvent = await createEvent(submitData);
      toast.success('🎉 Événement créé avec succès !');
      onCreated(newEvent);
      resetForm();
      onClose();
    } catch (err: any) {
      console.error('Erreur création événement:', err);
      toast.error(err.message || "Erreur lors de la création de l'événement");
    } finally {
      setIsSaving(false);
    }
  };

  // Réinitialisation du formulaire
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      date: "",
      location: "",
    });
    setFile(null);
    setPreviewImage(null);
    setDate(undefined);
    clearErrors();
  };

  // Fermeture avec confirmation si des données sont saisies
  const handleClose = () => {
    const hasData = formData.title || formData.description || formData.location || file;
    
    if (hasData && !window.confirm("Êtes-vous sûr de vouloir fermer ? Les données saisies seront perdues.")) {
      return;
    }
    
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay avec animation */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
        
        {/* Conteneur principal de la modal */}
        <div className="bg-ey-white rounded-ey-2xl shadow-ey-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-slide-in">
          
          {/* En-tête de la modal */}
          <div className="p-6 border-b border-ey-gray-200 bg-gradient-ey-primary">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-ey-black rounded-full flex items-center justify-center">
                  <CalendarIcon className="text-ey-yellow" size={20} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-ey-black">Créer un nouvel événement</h2>
                  <p className="text-ey-black/70 text-sm">Partagez vos initiatives avec la communauté EY</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="text-ey-black hover:bg-ey-black/10 rounded-full p-2"
                disabled={isSaving}
              >
                <X size={24} />
              </Button>
            </div>
          </div>

          {/* Contenu du formulaire */}
          <form onSubmit={handleSubmit} className="p-6 space-y-8 overflow-y-auto max-h-[calc(90vh-200px)] scrollbar-ey">
            
            {/* Section titre */}
            <div className="space-y-3">
              <Label htmlFor="title" className="flex items-center gap-2 text-ey-black font-semibold">
                <FileText size={18} className="text-ey-accent-blue" />
                Titre de l'événement *
              </Label>
              <Input
                id="title"
                placeholder="Ex: Conférence Innovation Digitale"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`input-ey ${errors.title ? 'input-ey-error' : ''}`}
                maxLength={200}
                disabled={isSaving}
              />
              {errors.title && (
                <div className="flex items-center gap-2 text-ey-red text-sm">
                  <AlertCircle size={14} />
                  <span>{errors.title}</span>
                </div>
              )}
              <p className="text-ey-gray-500 text-xs">
                {formData.title.length}/200 caractères
              </p>
            </div>

            {/* Section description */}
            <div className="space-y-3">
              <Label htmlFor="description" className="flex items-center gap-2 text-ey-black font-semibold">
                <FileText size={18} className="text-ey-accent-blue" />
                Description détaillée *
              </Label>
              <Textarea
                id="description"
                placeholder="Décrivez votre événement en détail : objectifs, programme, public cible..."
                className={`textarea-ey min-h-[120px] ${errors.description ? 'input-ey-error' : ''}`}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                maxLength={2000}
                disabled={isSaving}
              />
              {errors.description && (
                <div className="flex items-center gap-2 text-ey-red text-sm">
                  <AlertCircle size={14} />
                  <span>{errors.description}</span>
                </div>
              )}
              <p className="text-ey-gray-500 text-xs">
                {formData.description.length}/2000 caractères
              </p>
            </div>

            {/* Section date et lieu */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Sélection de date */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-ey-black font-semibold">
                  <Clock size={18} className="text-ey-accent-blue" />
                  Date et heure *
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal input-ey ${!date ? 'text-ey-gray-400' : ''}`}
                      disabled={isSaving}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr }) : "Sélectionnez une date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 border-ey-gray-200" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      locale={fr}
                      className="rounded-ey-lg"
                    />
                  </PopoverContent>
                </Popover>
                {errors.date && (
                  <div className="flex items-center gap-2 text-ey-red text-sm">
                    <AlertCircle size={14} />
                    <span>{errors.date}</span>
                  </div>
                )}
              </div>

              {/* Lieu */}
              <div className="space-y-3">
                <Label htmlFor="location" className="flex items-center gap-2 text-ey-black font-semibold">
                  <MapPin size={18} className="text-ey-accent-blue" />
                  Lieu *
                </Label>
                <Input
                  id="location"
                  placeholder="Ex: Salle de conférence A, Siège EY Paris"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className={`input-ey ${errors.location ? 'input-ey-error' : ''}`}
                  disabled={isSaving}
                />
                {errors.location && (
                  <div className="flex items-center gap-2 text-ey-red text-sm">
                    <AlertCircle size={14} />
                    <span>{errors.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Section upload d'image */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-ey-black font-semibold">
                <Upload size={18} className="text-ey-accent-blue" />
                Image de couverture (optionnelle)
              </Label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Zone d'upload */}
                <div className="space-y-3">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-ey-gray-300 rounded-ey-lg p-6 text-center cursor-pointer hover:border-ey-yellow hover:bg-ey-yellow/5 transition-all duration-200"
                  >
                    <Upload className="mx-auto h-12 w-12 text-ey-gray-400 mb-3" />
                    <p className="text-ey-black font-medium">Cliquez pour sélectionner</p>
                    <p className="text-ey-gray-500 text-sm mt-1">
                      JPG, PNG ou WebP • Max 5MB
                    </p>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                    className="hidden"
                    disabled={isSaving}
                  />
                </div>

                {/* Prévisualisation */}
                {previewImage && (
                  <div className="space-y-3">
                    <Label className="text-ey-black font-medium">Prévisualisation</Label>
                    <div className="relative rounded-ey-lg overflow-hidden shadow-ey-md">
                      <img
                        src={previewImage}
                        alt="Prévisualisation"
                        className="w-full h-48 object-cover"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFileChange(null)}
                        className="absolute top-2 right-2 bg-ey-red/80 text-ey-white hover:bg-ey-red rounded-full p-1"
                        disabled={isSaving}
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              <p className="text-ey-gray-500 text-sm">
                Une image attrayante augmentera l'engagement de votre événement
              </p>
            </div>

          </form>

          {/* Pied de modal avec actions */}
          <div className="p-6 bg-ey-light-gray border-t border-ey-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              
              {/* Informations d'aide */}
              <div className="flex items-center gap-2 text-ey-gray-600 text-sm">
                <AlertCircle size={16} />
                <span>Votre événement sera soumis pour approbation</span>
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSaving}
                  className="btn-ey-outline min-w-[100px]"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSaving || !formData.title.trim() || !formData.description.trim() || !date || !formData.location.trim()}
                  className="btn-ey-primary min-w-[120px] flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="loading-spinner-ey !h-4 !w-4" />
                      Publication...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Publier l'événement
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading overlay pendant la sauvegarde */}
      {isSaving && (
        <EnhancedLoading 
          fullScreen 
          message="Publication de votre événement..." 
          variant="pulse" 
        />
      )}
    </>
  );
}