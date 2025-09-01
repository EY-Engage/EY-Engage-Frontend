
import { EventDto } from "@/dtos/event/EventDto";
import { CommentDto } from "@/dtos/event/CommentDto";
import { ParticipationRequestDto } from "@/dtos/event/ParticipationRequestDto";
import { UserDto } from "@/dtos/user/UserDto";
import { CurrentUser, EventAnalyticsDto, EventTrendDto } from "@/types/types";
import { api } from "../Api-Client";

export async function createEvent(form: FormData): Promise<EventDto> {
  return api.post<EventDto>('/api/event', form);
}

export const getEventsByStatus = async (
  status: "Pending" | "Approved" | "Rejected", 
  department?: string
): Promise<EventDto[]> => {
  const params = new URLSearchParams();
  if (department) params.append("department", department);
  
  return api.get<EventDto[]>(`/api/event/status/${status}?${params.toString()}`);
};

export async function getEventById(id: string): Promise<EventDto> {
  return api.get<EventDto>(`/api/event/${id}`);
}

export async function toggleInterest(eventId: string): Promise<void> {
  await api.post(`/api/event/${eventId}/toggleInterest`);
}

export async function getInterestedUsers(eventId: string): Promise<UserDto[]> {
  return api.get<UserDto[]>(`/api/event/${eventId}/interestedUsers`);
}

export async function requestParticipation(eventId: string): Promise<void> {
  await api.post(`/api/event/${eventId}/participate`);
}

export async function approveParticipation(pid: string): Promise<void> {
  await api.post(`/api/event/participation/${pid}/approve`);
}
export async function getCurrentUser(): Promise<CurrentUser> {
  return api.get<CurrentUser>(`/api/auth/current-user`);
}

export async function getComments(eventId: string): Promise<CommentDto[]> {
  return api.get<CommentDto[]>(`/api/event/${eventId}/comments`);
}

export async function addComment(eventId: string, content: string): Promise<void> {
  await api.post(`/api/event/${eventId}/comment`, content);
}

export async function approveEvent(eventId: string): Promise<void> {
  await api.post(`/api/event/${eventId}/approveEvent`);
}

export async function rejectEvent(eventId: string): Promise<void> {
  await api.post(`/api/event/${eventId}/rejectEvent`);
}

export async function getParticipationRequests(eventId: string): Promise<ParticipationRequestDto[]> {
  return api.get<ParticipationRequestDto[]>(`/api/event/${eventId}/requests`);
}

export const getParticipants = async (eventId: string): Promise<UserDto[]> => {
  return api.get<UserDto[]>(`/api/event/${eventId}/participants`);
};

export const getEventUserStatus = async (eventId: string): Promise<{
  isInterested: boolean;
  participationStatus: string | null;
}> => {
  return api.get(`/api/event/${eventId}/user-status`);
};

export async function rejectParticipation(pid: string): Promise<void> {
  await api.post(`/api/event/participation/${pid}/reject`);
}

export async function reactToComment(commentId: string, emoji: string): Promise<void> {
  await api.post(`/api/event/comments/${commentId}/react`, emoji);
}

export async function getReactions(commentId: string): Promise<{
  emoji: string;
  user: { fullName: string; profilePicture?: string; userId: string };
}[]> {
  return api.get(`/api/event/comments/${commentId}/reactions`);
}

export async function replyToComment(commentId: string, content: string): Promise<void> {
  await api.post(`/api/event/comments/${commentId}/reply`, content);
}

export async function getReplies(commentId: string): Promise<{
  id: string;
  content: string;
  createdAt: string;
  authorFullName: string;
  authorProfilePicture?: string;
}[]> {
  return api.get(`/api/event/comments/${commentId}/replies`);
}

export async function deleteComment(commentId: string): Promise<void> {
  await api.delete(`/api/event/comments/${commentId}`);
}

export async function reactToReply(replyId: string, emoji: string): Promise<void> {
  await api.post(`/api/event/replies/${replyId}/react`, emoji);
}

export async function deleteReply(replyId: string): Promise<void> {
  await api.delete(`/api/event/replies/${replyId}`);
}

export async function getReplyReactions(replyId: string): Promise<any[]> {
  return api.get(`/api/event/replies/${replyId}/reactions`);
}

export async function deleteEvent(eventId: string): Promise<void> {
  await api.delete(`/api/event/${eventId}`);
}

export async function getEventAnalytics(userId?: string): Promise<EventAnalyticsDto> {
  const url = userId ? `/api/event/analytics?userId=${userId}` : '/api/event/analytics';
  return api.get<EventAnalyticsDto>(url);
}

export async function getEventTrends(userId?: string): Promise<EventTrendDto[]> {
  const url = userId ? `/api/event/trends?userId=${userId}` : '/api/event/trends';
  return api.get<EventTrendDto[]>(url);
}

export async function getProfileEvents(): Promise<any> {
  return api.get('/api/event/profile-events');
}