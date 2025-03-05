"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const publishedJobs = [
  { id: 1, title: "Consultant Junior" },
  { id: 2, title: "Senior Manager" },
];

export default function RecommendForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    candidateName: "",
    candidateEmail: "",
    jobId: "",
    message: "",
  });

  const handleSubmit = () => {
    if (!formData.jobId) {
      alert("Veuillez sélectionner un poste !");
      return;
    }
    alert("Recommandation soumise avec succès !");
    router.push("/career");
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg mt-8"
    >
      <h1 className="text-2xl font-bold text-ey-black mb-6">
        Recommander une personne
      </h1>
      <div className="space-y-4">
        <select
          className="w-full p-3 border border-ey-light-gray rounded-lg focus:ring-2 focus:ring-ey-yellow"
          value={formData.jobId}
          onChange={(e) => setFormData({ ...formData, jobId: e.target.value })}
        >
          <option value="">Sélectionner un poste</option>
          {publishedJobs.map((job) => (
            <option key={job.id} value={job.id}>{job.title}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Nom du candidat"
          className="w-full p-3 border border-ey-light-gray rounded-lg focus:ring-2 focus:ring-ey-yellow"
          value={formData.candidateName}
          onChange={(e) => setFormData({ ...formData, candidateName: e.target.value })}
        />

        <input
          type="email"
          placeholder="Email du candidat"
          className="w-full p-3 border border-ey-light-gray rounded-lg focus:ring-2 focus:ring-ey-yellow"
          value={formData.candidateEmail}
          onChange={(e) => setFormData({ ...formData, candidateEmail: e.target.value })}
        />

        <textarea
          placeholder="Message de recommandation"
          className="w-full p-3 border border-ey-light-gray rounded-lg focus:ring-2 focus:ring-ey-yellow h-32"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        />

        <button
          onClick={handleSubmit}
          className="w-full bg-ey-yellow text-ey-black py-3 px-6 rounded-lg hover:bg-ey-dark-yellow transition-colors"
        >
          Soumettre la recommandation
        </button>
      </div>
    </motion.div>
  );
}