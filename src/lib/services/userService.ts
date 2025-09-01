// lib/services/userService.ts
import { api } from "../Api-Client";
import { UserDto } from '@/dtos/user/UserDto';

export async function getUsers(): Promise<UserDto[]> {
  return api.get<UserDto[]>('/api/user');
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/api/user/${id}`);
}

export async function createUser(formData: FormData): Promise<any> {
  return api.post('/api/user', formData);
}

export async function checkEmailUnique(email: string): Promise<boolean> {
  const data = await api.get<{ isUnique: boolean }>(
    `/api/user/check-email?email=${encodeURIComponent(email)}`
  );
  return data.isUnique;
}

export async function updateUser(id: string, formData: FormData): Promise<UserDto> {
  return api.put<UserDto>(`/api/user/${id}`, formData);
}

export async function createRole(role: string): Promise<any> {
  return api.post('/api/roles/create', { RoleName: role });
}

export async function assignRole(userId: string, RoleName: string): Promise<any> {
  return api.post('/api/roles/assign', { userId, RoleName });
}

export const getUserProfile = async (): Promise<UserDto> => {
  return api.get<UserDto>('/api/user/profile');
};

export const forgotPassword = async (email: string): Promise<void> => {
  await api.post('/api/auth/forgot-password', { email });
};

export const resetPassword = async (
  email: string,
  token: string,
  newPassword: string
): Promise<void> => {
  await api.post('/api/auth/reset-password', { email, token, newPassword });
};
export async function updateUserProfile(profileData: {
  fullName: string;
  phoneNumber: string;
  fonction: string;
  department: string;
  sector: string;
}): Promise<any> {
  return api.put('/api/user/profile', profileData);
}

export async function updatePassword(
  currentPassword: string, 
  newPassword: string
): Promise<any> {
  return api.post('/api/user/change-password', { 
    currentPassword, 
    newPassword 
  });
}
export async function updateUserProfilePicture(formData: FormData): Promise<any> {
  return api.put('/api/user/profile-picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}