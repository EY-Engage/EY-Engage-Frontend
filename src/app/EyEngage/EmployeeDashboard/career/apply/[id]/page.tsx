"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, ArrowLeft, Check } from "lucide-react";

export default function ApplicationForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    cv: null,
    coverLetter: "",
  });

  const progress = [
    { label: "Information", icon: <Check size={16} /> },
    { label: "Documents", icon: <Upload size={16} /> },
    { label: "Confirmation", icon: <Check size={16} /> },
  ];

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setFormData({ ...formData, cv: file });
    }
  };

  return (
    <div className="min-h-screen bg-ey-light-gray p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl p-8 shadow-lg">
        {/* Progress Bar */}
        <div className="flex justify-between mb-8 relative">
          {progress.map((stepItem, index) => (
            <div key={index} className="flex flex-col items-center w-1/3">
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step > index ? "bg-ey-yellow" : "bg-ey-light-gray"
                } transition-colors duration-300`}
              >
                {step > index ? stepItem.icon : index + 1}
              </motion.div>
              <span className="mt-2 text-sm text-center text-ey-dark-gray">
                {stepItem.label}
              </span>
            </div>
          ))}
        </div>

        {/* Form Steps */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-2xl font-bold text-ey-black mb-6">Informations Personnelles</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nom complet"
                className="w-full p-3 border border-ey-light-gray rounded-lg focus:ring-2 focus:ring-ey-yellow"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full p-3 border border-ey-light-gray rounded-lg focus:ring-2 focus:ring-ey-yellow"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <input
                type="tel"
                placeholder="Téléphone"
                className="w-full p-3 border border-ey-light-gray rounded-lg focus:ring-2 focus:ring-ey-yellow"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-2xl font-bold text-ey-black mb-6">Documents Requis</h2>
            <div className="space-y-6">
              <div className="border-2 border-dashed border-ey-light-gray rounded-lg p-6 text-center">
                <label className="cursor-pointer">
                  <Upload size={40} className="mx-auto text-ey-dark-gray mb-2" />
                  <p className="text-ey-dark-gray">Déposer votre CV (PDF uniquement)</p>
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  {formData.cv && (
                    <p className="mt-2 text-sm text-ey-yellow">{formData.cv.name}</p>
                  )}
                </label>
              </div>
              <textarea
                placeholder="Lettre de motivation"
                className="w-full p-3 border border-ey-light-gray rounded-lg focus:ring-2 focus:ring-ey-yellow h-32"
                value={formData.coverLetter}
                onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
              />
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-2xl font-bold text-ey-black mb-6">Confirmation</h2>
            <div className="bg-ey-light-gray/30 p-6 rounded-lg">
              <h3 className="font-bold mb-2">Récapitulatif :</h3>
              <p>Nom : {formData.fullName}</p>
              <p>Email : {formData.email}</p>
              <p>CV : {formData.cv?.name || "Aucun fichier sélectionné"}</p>
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center text-ey-dark-gray hover:text-ey-yellow"
            >
              <ArrowLeft size={18} className="mr-2" /> Précédent
            </button>
          )}
          <button
            onClick={() => {
              if (step < 3) {
                setStep(step + 1);
              } else {
                alert("Candidature soumise avec succès !");
                // Soumission API ici
              }
            }}
            className="bg-ey-yellow text-ey-black py-2 px-6 rounded-lg hover:bg-ey-dark-yellow ml-auto"
          >
            {step === 3 ? "Confirmer" : "Suivant"}
          </button>
        </div>
      </div>
    </div>
  );
}