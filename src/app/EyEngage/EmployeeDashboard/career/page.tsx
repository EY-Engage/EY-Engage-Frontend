"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Filter, Search, ArrowRight, Users, MapPin, Clock, Briefcase } from "lucide-react";
import { careerService } from "@/lib/services/careerService";
import { JobOfferDto } from "@/types/types";
import JobApplicationModal from "./JobApplicationModal/page";
import JobRecommendationModal from "./JobRecommendationModal/page";
import EnhancedLoading, { CardSkeleton } from "@/components/SkeletonLoader";

const departmentOptions = [
  { value: "", label: "Tous les départements" },
  { value: "Assurance", label: "Assurance" },
  { value: "Consulting", label: "Consulting" },
  { value: "StrategyAndTransactions", label: "Strategy & Transactions" },
  { value: "Tax", label: "Tax" }
];

const jobTypeOptions = [
  { value: "", label: "Tous les types" },
  { value: "FullTime", label: "Temps plein" },
  { value: "PartTime", label: "Temps partiel" },
  { value: "Contract", label: "Contrat" },
  { value: "Internship", label: "Stage" }
];

export default function EmployeeCareerDashboard() {
  const [jobOffers, setJobOffers] = useState<JobOfferDto[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobOfferDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    department: "",
    jobType: "",
    location: "",
    search: ""
  });
  const [selectedJob, setSelectedJob] = useState<JobOfferDto | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);

  useEffect(() => {
    loadJobOffers();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobOffers, filters]);

  const loadJobOffers = async () => {
    try {
      setLoading(true);
      const jobs = await careerService.getJobOffers();
      setJobOffers(jobs);
    } catch (error) {
      console.error("Erreur lors du chargement des offres:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = jobOffers;

    if (filters.department) {
      filtered = filtered.filter(job => job.department === filters.department);
    }

    if (filters.jobType) {
      filtered = filtered.filter(job => job.jobType === filters.jobType);
    }

    if (filters.location) {
      filtered = filtered.filter(job => 
        job.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.search) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.keySkills.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredJobs(filtered);
  };

  const handleApply = (job: JobOfferDto) => {
    setSelectedJob(job);
    setShowApplicationModal(true);
  };

  const handleRecommend = (job: JobOfferDto) => {
    setSelectedJob(job);
    setShowRecommendationModal(true);
  };

  const getJobTypeLabel = (jobType: string) => {
    const option = jobTypeOptions.find(opt => opt.value === jobType);
    return option?.label || jobType;
  };

  const getDepartmentLabel = (department: string) => {
    const option = departmentOptions.find(opt => opt.value === department);
    return option?.label || department;
  };

  if (loading) {
    return <EnhancedLoading fullScreen={true} message="Chargement des opportunités de carrière..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ey-light-gray to-ey-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-ey-4xl font-bold text-ey-black mb-4">
            Carrière chez <span className="text-ey-yellow">EY</span>
          </h1>
          <p className="text-ey-lg text-ey-gray-600 max-w-2xl mx-auto">
            Découvrez nos opportunités de carrière et rejoignez une équipe exceptionnelle
          </p>
        </div>

        {/* Filtres */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-ey p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <select
                className="select-ey pl-10"
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              >
                {departmentOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Filter size={18} className="absolute left-3 top-3.5 text-ey-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                className="select-ey pl-10"
                value={filters.jobType}
                onChange={(e) => setFilters({ ...filters, jobType: e.target.value })}
              >
                {jobTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Filter size={18} className="absolute left-3 top-3.5 text-ey-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Localisation"
                className="input-ey pl-10"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              />
              <MapPin size={18} className="absolute left-3 top-3.5 text-ey-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher..."
                className="input-ey pl-10"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
              <Search size={18} className="absolute left-3 top-3.5 text-ey-gray-400 pointer-events-none" />
            </div>
          </div>
        </motion.div>

        {/* Résultats */}
        <div className="mb-6">
          <p className="text-ey-gray-600">
            {filteredJobs.length} opportunité{filteredJobs.length !== 1 ? 's' : ''} trouvée{filteredJobs.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Liste des offres */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </>
          ) : (
            filteredJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card-ey p-6 hover:shadow-ey-2xl transition-all duration-300"
              >
                <div className="mb-4">
                  <h3 className="text-ey-xl font-bold text-ey-black mb-2">{job.title}</h3>
                  <p className="text-ey-gray-600 text-ey-sm line-clamp-3 mb-4">
                    {job.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="badge-ey-warning">
                    <Briefcase size={12} className="mr-1" />
                    {getJobTypeLabel(job.jobType)}
                  </span>
                  <span className="badge-ey-info">
                    <Users size={12} className="mr-1" />
                    {getDepartmentLabel(job.department)}
                  </span>
                  <span className="badge-ey-success">
                    <MapPin size={12} className="mr-1" />
                    {job.location}
                  </span>
                  <span className="badge-ey-secondary">
                    <Clock size={12} className="mr-1" />
                    {job.experienceLevel}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-ey-sm text-ey-gray-500 mb-1">Compétences clés:</p>
                  <p className="text-ey-sm text-ey-gray-700 font-medium">{job.keySkills}</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleApply(job)}
                    className="flex-1 btn-ey-primary flex items-center justify-center gap-2"
                  >
                    Postuler
                    <ArrowRight size={16} />
                  </button>
                  <button
                    onClick={() => handleRecommend(job)}
                    className="flex-1 btn-ey-secondary flex items-center justify-center gap-2"
                  >
                    <Users size={16} />
                    Recommander
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {filteredJobs.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-ey-gray-400 mb-4">
              <Search size={48} className="mx-auto" />
            </div>
            <h3 className="text-ey-lg font-medium text-ey-gray-900 mb-2">
              Aucune offre trouvée
            </h3>
            <p className="text-ey-gray-500">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        )}
      </div>

      {/* Modales */}
      {showApplicationModal && selectedJob && (
        <JobApplicationModal
          job={selectedJob}
          onClose={() => {
            setShowApplicationModal(false);
            setSelectedJob(null);
          }}
          onSuccess={() => {
            setShowApplicationModal(false);
            setSelectedJob(null);
          }}
        />
      )}

      {showRecommendationModal && selectedJob && (
        <JobRecommendationModal
          job={selectedJob}
          onClose={() => {
            setShowRecommendationModal(false);
            setSelectedJob(null);
          }}
          onSuccess={() => {
            setShowRecommendationModal(false);
            setSelectedJob(null);
          }}
        />
      )}
    </div>
  );
}