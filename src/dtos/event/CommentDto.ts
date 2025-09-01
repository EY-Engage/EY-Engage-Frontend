export interface CommentDto {
  id: string;
  content: string;
  authorId: string;
  authorFullName: string;
  authorProfilePicture: string | null;
  eventId: string;
  createdAt: string;
  updatedAt: string;
}