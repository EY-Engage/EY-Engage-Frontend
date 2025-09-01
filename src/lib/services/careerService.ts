// lib/services/careerService.ts
import { api } from "@/lib/Api-Client";
import { JobOfferDto, JobApplicationDto, CandidateRecommendation } from "@/types/types";

export const careerService = {
  // Job Offers
 getJobOffers: async (department?: string): Promise<JobOfferDto[]> => {
    // Construire l'URL avec le paramètre department optionnel
    let url = '/api/JobOffers';
    if (department && department !== 'All') {
      const params = new URLSearchParams();
      params.append('department', department);
      url = `/api/JobOffers?${params.toString()}`;
    }
    return api.get<JobOfferDto[]>(url);
  },
  getJobOfferById: async (id: string): Promise<JobOfferDto> => {
    return api.get<JobOfferDto>(`/api/joboffers/${id}`);
  },

  // Modifiez la fonction createJobOffer
createJobOffer: async (jobOffer: Omit<JobOfferDto, 'id' | 'publisherId' | 'publishDate' | 'applicationsCount'>): Promise<JobOfferDto> => {
  return api.post<JobOfferDto>('/api/JobOffers', jobOffer);
},
 updateJobOffer: async (id: string, jobOffer: JobOfferDto): Promise<void> => {
    // S'assurer que l'ID dans l'objet correspond à l'ID de l'URL
    const jobOfferWithId = {
      ...jobOffer,
      id: id
    };
    await api.put(`/api/JobOffers/${id}`, jobOfferWithId);
  },

  deleteJobOffer: async (id: string): Promise<void> => {
    await api.delete(`/api/joboffers/${id}`);
  },

  // Applications
  applyToJob: async (applicationData: FormData): Promise<void> => {
    await api.post('/api/jobapplications/apply', applicationData);
  },

  recommendCandidate: async (recommendationData: FormData): Promise<void> => {
    await api.post('/api/jobapplications/recommend', recommendationData);
  },

  getApplicationsForJob: async (jobId: string): Promise<JobApplicationDto[]> => {
    return api.get<JobApplicationDto[]>(`/api/jobapplications/for-job/${jobId}`);
  },

  getTopCandidates: async (jobId: string): Promise<CandidateRecommendation[]> => {
    return api.get<CandidateRecommendation[]>(`/api/jobrecommendations/${jobId}/top-candidates`);
  },

  scheduleInterview: async (applicationId: string, date: Date, location: string): Promise<void> => {
    // Validate inputs
    if (!applicationId || applicationId.trim() === '') {
      throw new Error("Application ID is required");
    }
    
    if (!location || location.trim() === '') {
      throw new Error("Location is required");
    }
    
    if (date <= new Date()) {
      throw new Error("Interview date must be in the future");
    }

    // Validate GUID format
    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!guidRegex.test(applicationId)) {
      throw new Error("Invalid application ID format");
    }

    const requestBody = {
      applicationId: applicationId,
      interviewDate: date.toISOString(),
      location: location.trim()
    };

    await api.post('/api/jobrecommendations/schedule-interview', requestBody);
  },

  downloadResume: async (applicationId: string, candidateName: string): Promise<void> => {
    // Special handling for file download
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jobapplications/${applicationId}/resume`, {
      credentials: "include"
    });
    
    if (!response.ok) throw new Error("Failed to download resume");
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CV_${candidateName.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }
};