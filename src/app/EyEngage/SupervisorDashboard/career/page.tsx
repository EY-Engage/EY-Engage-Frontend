"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Briefcase, 
  Users, 
  Calendar,
  Edit3,
  Trash2,
  Eye,
  Brain,
  Clock,
  MapPin,
  Filter,
  Search
} from "lucide-react";
import { careerService } from "@/lib/services/careerService";
import { JobOfferDto, JobApplicationDto, CandidateRecommendation } from "@/types/types";
import CreateJobOfferModal from "./CreateJobOfferModal";
import JobApplicationsModal from "./JobApplicationsModal";
import TopCandidatesModal from "./TopCandidatesModal";
import EditJobOfferModal from "./EditJobOfferModal";
import { useAuth } from "@/context/AuthContext";
import EnhancedLoading from "@/components/SkeletonLoader";
import RouteGuard from "@/components/RouteGuard";

const departmentOptions = [
  { value: "", label: "Tous les départements" },
  { value: "Assurance", label: "Assurance" },
  { value: "Consulting", label: "Consulting" },
  { value: "StrategyAndTransactions", label: "Strategy & Transactions" },
  { value: "Tax", label: "Tax" }
];

export default function SupervisorCareerDashboard() {
  const [jobOffers, setJobOffers] = useState<JobOfferDto[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobOfferDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    department: "",
    search: "",
    status: "active"
  });
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [showTopCandidatesModal, setShowTopCandidatesModal] = useState(false);
  
  const [selectedJob, setSelectedJob] = useState<JobOfferDto | null>(null);
  const [applications, setApplications] = useState<JobApplicationDto[]>([]);
  const [topCandidates, setTopCandidates] = useState<CandidateRecommendation[]>([]);

  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingReviews: 0
  });

  const { user } = useAuth();

  useEffect(() => {
    if (user?.roles?.includes("AgentEY") && user?.department) {
      setFilters(prev => ({
        ...prev,
        department: user.department
      }));
    }
    loadJobOffers();
  }, [user]);

  useEffect(() => {
    filterJobs();
    calculateStats();
  }, [jobOffers, filters]);

  const loadJobOffers = async () => {
    try {
      setLoading(true);
      const departmentParam = user?.roles?.includes("Admin") 
        ? filters.department 
        : null;
      const jobs = await careerService.getJobOffers(departmentParam);
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

    if (filters.search) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.status === "active") {
      filtered = filtered.filter(job => job.isActive);
    } else if (filters.status === "inactive") {
      filtered = filtered.filter(job => !job.isActive);
    }

    setFilteredJobs(filtered);
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette offre ?")) return;
    
    try {
      setLoading(true);
      await careerService.deleteJobOffer(jobId);
      await loadJobOffers();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Erreur lors de la suppression de l'offre");
    } finally {
      setLoading(false);
    }
  };

  const handleViewApplications = async (job: JobOfferDto) => {
    try {
      setLoading(true);
      setSelectedJob(job);
      const jobApplications = await careerService.getApplicationsForJob(job.id);
      setApplications(jobApplications);
      setShowApplicationsModal(true);
    } catch (error) {
      console.error("Erreur lors du chargement des candidatures:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetTopCandidates = async (job: JobOfferDto) => {
    try {
      setLoading(true);
      setSelectedJob(job);
      const candidates = await careerService.getTopCandidates(job.id);
      setTopCandidates(candidates);
      setShowTopCandidatesModal(true);
    } catch (error) {
      console.error("Erreur lors de l'analyse IA:", error);
      alert("Erreur lors de l'analyse des candidats par l'IA");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (job: JobOfferDto) => {
    if (!job.isActive) return "bg-gray-100 text-gray-700";
    
    const closeDate = new Date(job.closeDate || "");
    const now = new Date();
    const daysUntilClose = Math.ceil((closeDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilClose < 0) return "bg-red-100 text-red-700";
    if (daysUntilClose < 7) return "bg-yellow-100 text-yellow-700";
    return "bg-green-100 text-green-700";
  };

  const calculateStats = () => {
    const totalJobs = jobOffers.length;
    const activeJobs = jobOffers.filter(job => job.isActive).length;
    const totalApplications = jobOffers.reduce((sum, job) => sum + job.applicationsCount, 0);
    const pendingReviews = applications.reduce((count, app) => 
      app.status === 'Pending' ? count + 1 : count, 0);

    setStats({ totalJobs, activeJobs, totalApplications, pendingReviews });
  };

  if (loading) {
    return <EnhancedLoading fullScreen={true} message="Chargement du tableau de bord..." />;
  }

  return (
   <RouteGuard allowedRoles={['Admin', 'AgentEY']}>
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-ey-black">
              Gestion des <span className="text-ey-yellow">Carrières</span>
            </h1>
            <p className="text-gray-600 mt-2">
              Tableau de bord administrateur - Offres d'emploi et candidatures
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-ey-primary flex items-center gap-2 font-medium"
          >
            <Plus size={20} />
            Créer une offre
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-ey p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total des offres</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalJobs}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-ey p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Offres actives</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeJobs}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-ey p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Candidatures</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card-ey p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingReviews}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-ey p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           {user?.roles?.includes("Admin") && (
              <div className="relative">
                <select
                  className="input-ey pl-10"
                  value={filters.department}
                  onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                >
                  {departmentOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <Filter size={18} className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
              </div>
            )}

            <div className="relative">
              <select
                className="input-ey pl-10"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actives</option>
                <option value="inactive">Inactives</option>
              </select>
              <Filter size={18} className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher..."
                className="input-ey pl-10"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
              <Search size={18} className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </motion.div>

        {/* Job Offers Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-ey overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Offres d'emploi ({filteredJobs.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Poste
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Département
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Localisation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date de clôture
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredJobs.map((job, index) => (
                  <motion.tr
                    key={job.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{job.title}</div>
                        <div className="text-sm text-gray-500">{job.jobType}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{job.department}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin size={16} className="mr-1 text-gray-400" />
                        {job.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(job)}`}>
                        {job.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {job.closeDate ? new Date(job.closeDate).toLocaleDateString('fr-FR') : 'Non définie'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleViewApplications(job)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Voir les candidatures"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleGetTopCandidates(job)}
                          className="text-purple-600 hover:text-purple-900 p-1 rounded"
                          title="Analyse IA"
                        >
                          <Brain size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedJob(job);
                            setShowEditModal(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                          title="Modifier"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredJobs.length === 0 && (
            <div className="text-center py-12">
              <Briefcase size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune offre trouvée
              </h3>
              <p className="text-gray-500 mb-4">
                {filters.search || filters.department || filters.status !== 'all' 
                  ? "Aucune offre ne correspond à vos critères de recherche"
                  : "Commencez par créer votre première offre d'emploi"
                }
              </p>
              {!filters.search && !filters.department && filters.status === 'all' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn-ey-primary"
                >
                  Créer une offre
                </button>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Modals */}
       {showCreateModal && (
        <CreateJobOfferModal
          userDepartment={user?.department || ""}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadJobOffers();
          }}
        />
      )}

      {showEditModal && selectedJob && (
        <EditJobOfferModal
          job={selectedJob}
          onClose={() => {
            setShowEditModal(false);
            setSelectedJob(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedJob(null);
            loadJobOffers();
          }}
        />
      )}

      {showApplicationsModal && selectedJob && (
        <JobApplicationsModal
          job={selectedJob}
          applications={applications}
          onClose={() => {
            setShowApplicationsModal(false);
            setSelectedJob(null);
            setApplications([]);
          }}
          onScheduleInterview={(applicationId, date, location) => {
            careerService.scheduleInterview(applicationId, date, location);
          }}
        />
      )}

      {showTopCandidatesModal && selectedJob && (
        <TopCandidatesModal
          job={selectedJob}
          candidates={topCandidates}
          onClose={() => {
            setShowTopCandidatesModal(false);
            setSelectedJob(null);
            setTopCandidates([]);
          }}
          onScheduleInterview={(applicationId, date, location) => {
            careerService.scheduleInterview(applicationId, date, location);
          }}
        />
      )}
    </div>
      </RouteGuard>
  );

}