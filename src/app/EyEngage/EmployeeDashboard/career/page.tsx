"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Filter, Search, ArrowRight } from "lucide-react";

export default function CareerModule() {
  const router = useRouter();
  const [filters, setFilters] = useState({
    type: "",
    experience: "",
    location: "",
  });

  const opportunities = [
    {
      id: 1,
      title: "Consultant Junior",
      type: "Full-Time",
      experience: "0-2 ans",
      location: "Paris",
      description: "Développez vos compétences dans un environnement stimulant.",
      status: "published",
    },
    {
      id: 2,
      title: "Senior Manager",
      type: "Full-Time",
      experience: "5+ ans",
      location: "Lyon",
      description: "Responsabilité des équipes et projets stratégiques.",
      status: "published",
    },
  ];

  const applyToOpportunity = (id: number) => {
    router.push(`career/apply/${id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-ey-black mb-6">Carrière chez EY</h1>

      {/* Filtres */}
      <div className="bg-ey-light-gray p-6 rounded-lg mb-8 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <select
              className="w-full p-3 rounded-lg border border-ey-dark-gray bg-white focus:outline-none focus:ring-2 focus:ring-ey-yellow"
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            >
              <option value="">Type de poste</option>
              <option value="Full-Time">Full-Time</option>
              <option value="Part-Time">Part-Time</option>
            </select>
            <Filter size={18} className="absolute right-3 top-4 text-ey-dark-gray" />
          </div>

          <div className="relative">
            <select
              className="w-full p-3 rounded-lg border border-ey-dark-gray bg-white focus:outline-none focus:ring-2 focus:ring-ey-yellow"
              value={filters.experience}
              onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
            >
              <option value="">Expérience</option>
              <option value="0-2">0-2 ans</option>
              <option value="3-5">3-5 ans</option>
              <option value="5+">5+ ans</option>
            </select>
            <Filter size={18} className="absolute right-3 top-4 text-ey-dark-gray" />
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Localisation"
              className="w-full p-3 rounded-lg border border-ey-dark-gray bg-white focus:outline-none focus:ring-2 focus:ring-ey-yellow"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            />
            <Search size={18} className="absolute right-3 top-4 text-ey-dark-gray" />
          </div>
        </div>
      </div>

      {/* Opportunités */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {opportunities
          .filter(opp => opp.status === "published")
          .map((opp) => (
            <motion.div
              key={opp.id}
              whileHover={{ scale: 1.02 }}
              className="bg-white p-6 rounded-lg shadow-md border border-ey-light-gray"
            >
              <h2 className="text-xl font-bold text-ey-black mb-2">{opp.title}</h2>
              <p className="text-gray-600 mb-4">{opp.description}</p>
              <div className="flex gap-2 flex-wrap mb-4">
                <span className="bg-ey-light-gray px-3 py-1 rounded-full text-sm text-ey-dark-gray">
                  {opp.type}
                </span>
                <span className="bg-ey-light-gray px-3 py-1 rounded-full text-sm text-ey-dark-gray">
                  {opp.experience}
                </span>
                <span className="bg-ey-light-gray px-3 py-1 rounded-full text-sm text-ey-dark-gray">
                  {opp.location}
                </span>
              </div>
              <button
                className="flex items-center gap-2 bg-ey-yellow text-ey-black py-2 px-4 rounded-lg hover:bg-ey-dark-yellow transition-colors"
                onClick={() => applyToOpportunity(opp.id)}
              >
                Postuler <ArrowRight size={16} />
              </button>
            </motion.div>
          ))}
      </div>

      {/* Recommandation */}
      <div className="mt-12 bg-ey-yellow/20 p-8 rounded-lg border border-ey-yellow">
        <h2 className="text-2xl font-bold text-ey-black mb-4">
          Recommander une personne
        </h2>
        <p className="mb-4 text-ey-dark-gray">
          Connaissez-vous quelqu'un qui serait un bon fit pour EY Tunisie ?
        </p>
        <button
          className="bg-ey-yellow text-ey-black py-2 px-4 rounded-lg hover:bg-ey-dark-yellow transition-colors"
          onClick={() => router.push("career/recommend")}
        >
          Faire une recommandation
        </button>
      </div>
    </div>
  );
}