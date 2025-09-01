export interface EventDto {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  imagePath: string | null;
  status: 'Pending' | 'Approved' | 'Rejected';
  organizerId: string;
  organizerFullName: string;
  organizerDepartement: string;
  interestedCount: number;
  participantCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}