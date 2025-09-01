export interface UserDto {
  id: string;
  fullName: string;
  email: string;
  profilePicture?: string;
  phoneNumber: string;
  createdAt: string;
  roles  : string[];
  updatedAt: string;
  fonction: string;
  department: string;
  sector: string;
}