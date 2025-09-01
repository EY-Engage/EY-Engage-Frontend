// lib/validation/formValidation.ts

import React from "react";

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
  message: string;
}

export interface ValidationSchema {
  [field: string]: ValidationRule[];
}

// Patterns de validation courants
export const ValidationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\d\s\-\+\(\)]+$/,
  phoneExact8: /^\d{8}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  letters: /^[a-zA-Z\s]+$/,
  numbers: /^\d+$/,
  url: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
  date: /^\d{4}-\d{2}-\d{2}$/,
};

// Schémas de validation prédéfinis
export const ValidationSchemas = {
  // Schéma pour l'inscription/création d'utilisateur
  userRegistration: {
    fullName: [
      { required: true, message: 'Le nom complet est requis' },
      { minLength: 3, message: 'Le nom doit contenir au moins 3 caractères' },
      { maxLength: 100, message: 'Le nom ne peut pas dépasser 100 caractères' },
      { pattern: ValidationPatterns.letters, message: 'Le nom ne doit contenir que des lettres' }
    ],
    email: [
      { required: true, message: 'L\'email est requis' },
      { pattern: ValidationPatterns.email, message: 'Format d\'email invalide' }
    ],
    password: [
      { required: true, message: 'Le mot de passe est requis' },
      { minLength: 8, message: 'Le mot de passe doit contenir au moins 8 caractères' },
      { pattern: ValidationPatterns.password, message: 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial' }
    ],
    phoneNumber: [
      { required: true, message: 'Le numéro de téléphone est requis' },
      { pattern: ValidationPatterns.phoneExact8, message: 'Le numéro doit contenir exactement 8 chiffres' }
    ],
    department: [
      { required: true, message: 'Le département est requis' }
    ]
  },

  // Schéma pour la connexion
  login: {
    email: [
      { required: true, message: 'L\'email est requis' },
      { pattern: ValidationPatterns.email, message: 'Format d\'email invalide' }
    ],
    password: [
      { required: true, message: 'Le mot de passe est requis' },
      { minLength: 8, message: 'Le mot de passe doit contenir au moins 8 caractères' }
    ]
  },

  // Schéma pour le changement de mot de passe
  changePassword: {
    currentPassword: [
      { required: true, message: 'Le mot de passe actuel est requis' }
    ],
    newPassword: [
      { required: true, message: 'Le nouveau mot de passe est requis' },
      { minLength: 8, message: 'Le mot de passe doit contenir au moins 8 caractères' },
      { pattern: ValidationPatterns.password, message: 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial' }
    ],
    confirmPassword: [
      { required: true, message: 'La confirmation du mot de passe est requise' }
    ]
  },

  // Schéma pour la création d'événement
  event: {
    title: [
      { required: true, message: 'Le titre est requis' },
      { minLength: 5, message: 'Le titre doit contenir au moins 5 caractères' },
      { maxLength: 200, message: 'Le titre ne peut pas dépasser 200 caractères' }
    ],
    description: [
      { required: true, message: 'La description est requise' },
      { minLength: 20, message: 'La description doit contenir au moins 20 caractères' },
      { maxLength: 2000, message: 'La description ne peut pas dépasser 2000 caractères' }
    ],
    date: [
      { required: true, message: 'La date est requise' },
      { 
        custom: (value: string) => new Date(value) > new Date(), 
        message: 'La date doit être dans le futur' 
      }
    ],
    location: [
      { required: true, message: 'Le lieu est requis' },
      { minLength: 3, message: 'Le lieu doit contenir au moins 3 caractères' }
    ]
  },

  // Schéma pour les offres d'emploi
  jobOffer: {
    title: [
      { required: true, message: 'Le titre du poste est requis' },
      { minLength: 5, message: 'Le titre doit contenir au moins 5 caractères' },
      { maxLength: 100, message: 'Le titre ne peut pas dépasser 100 caractères' }
    ],
    description: [
      { required: true, message: 'La description est requise' },
      { minLength: 50, message: 'La description doit contenir au moins 50 caractères' },
      { maxLength: 5000, message: 'La description ne peut pas dépasser 5000 caractères' }
    ],
    keySkills: [
      { required: true, message: 'Les compétences clés sont requises' },
      { minLength: 10, message: 'Les compétences doivent contenir au moins 10 caractères' }
    ],
    experienceLevel: [
      { required: true, message: 'Le niveau d\'expérience est requis' }
    ],
    location: [
      { required: true, message: 'La localisation est requise' }
    ],
    jobType: [
      { required: true, message: 'Le type de contrat est requis' }
    ],
    closeDate: [
      { required: true, message: 'La date de clôture est requise' },
      { 
        custom: (value: string) => new Date(value) > new Date(), 
        message: 'La date de clôture doit être dans le futur' 
      }
    ]
  }
};

// Classe de validation
export class FormValidator {
  private errors: { [field: string]: string } = {};

  constructor(private schema: ValidationSchema) {}

  validate(data: { [field: string]: any }): boolean {
    this.errors = {};
    
    for (const field in this.schema) {
      const rules = this.schema[field];
      const value = data[field];
      
      for (const rule of rules) {
        if (!this.validateRule(value, rule)) {
          this.errors[field] = rule.message;
          break; // Stop at first error for this field
        }
      }
    }
    
    return Object.keys(this.errors).length === 0;
  }

  validateField(field: string, value: any): string | null {
    const rules = this.schema[field];
    if (!rules) return null;
    
    for (const rule of rules) {
      if (!this.validateRule(value, rule)) {
        return rule.message;
      }
    }
    
    return null;
  }

  private validateRule(value: any, rule: ValidationRule): boolean {
    // Required validation
    if (rule.required && (!value || value.toString().trim() === '')) {
      return false;
    }
    
    // Skip other validations if value is empty and not required
    if (!rule.required && (!value || value.toString().trim() === '')) {
      return true;
    }
    
    // Min length validation
    if (rule.minLength && value.toString().length < rule.minLength) {
      return false;
    }
    
    // Max length validation
    if (rule.maxLength && value.toString().length > rule.maxLength) {
      return false;
    }
    
    // Pattern validation
    if (rule.pattern && !rule.pattern.test(value.toString())) {
      return false;
    }
    
    // Custom validation
    if (rule.custom && !rule.custom(value)) {
      return false;
    }
    
    return true;
  }

  getErrors(): { [field: string]: string } {
    return this.errors;
  }

  getError(field: string): string | null {
    return this.errors[field] || null;
  }

  clearErrors(): void {
    this.errors = {};
  }
}

// Hook React pour la validation
export function useFormValidation(schema: ValidationSchema) {
  const [errors, setErrors] = React.useState<{ [field: string]: string }>({});
  const validator = React.useRef(new FormValidator(schema));

  const validate = (data: { [field: string]: any }): boolean => {
    const isValid = validator.current.validate(data);
    setErrors(validator.current.getErrors());
    return isValid;
  };

  const validateField = (field: string, value: any): void => {
    const error = validator.current.validateField(field, value);
    setErrors(prev => ({
      ...prev,
      [field]: error || ''
    }));
  };

  const clearErrors = (): void => {
    validator.current.clearErrors();
    setErrors({});
  };

  return {
    errors,
    validate,
    validateField,
    clearErrors
  };
}

// Fonction utilitaire pour valider le mot de passe
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  errors: string[];
} {
  const errors: string[] = [];
  let strength = 0;
  
  if (password.length < 8) {
    errors.push('Au moins 8 caractères');
  } else {
    strength++;
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Au moins une majuscule');
  } else {
    strength++;
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Au moins une minuscule');
  } else {
    strength++;
  }
  
  if (!/\d/.test(password)) {
    errors.push('Au moins un chiffre');
  } else {
    strength++;
  }
  
  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Au moins un caractère spécial (@$!%*?&)');
  } else {
    strength++;
  }
  
  let strengthLevel: 'weak' | 'medium' | 'strong' | 'very-strong' = 'weak';
  if (strength >= 5) strengthLevel = 'very-strong';
  else if (strength >= 4) strengthLevel = 'strong';
  else if (strength >= 3) strengthLevel = 'medium';
  
  return {
    isValid: errors.length === 0,
    strength: strengthLevel,
    errors
  };
}

// Fonction pour comparer deux mots de passe
export function validatePasswordMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword;
}