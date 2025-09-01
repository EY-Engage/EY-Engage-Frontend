export interface CreateUserDto {
    fullName: string;
    email: string;
    password: string;
    profilePictureFile?: File; // Utilisé pour l'upload de fichiers (comme IFormFile en .NET)
    fonction: string;
    department: string; // Supposé être une chaîne ici, sinon adapte au type exact de Department
    sector: string;
    phoneNumber: string;
  }
  