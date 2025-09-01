// dtos/event/ParticipationRequestDto.ts
export interface ParticipationRequestDto {
  participationId: string;
  userId: string;
  fullName: string;
  email: string;
  profilePicture?: string;
  requestedAt: string;
}