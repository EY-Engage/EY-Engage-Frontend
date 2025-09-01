'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TextField, Button, Card, CardContent,
  Typography, Snackbar, Alert
} from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import EnhancedLoading from '@/components/SkeletonLoader';
import { validatePasswordStrength } from '@/components/FormValidation';

export default function ChangePasswordPage() {
  const router = useRouter();
  const { 
    email, 
    isActive, 
    isFirstLogin, 
    isLoading,
    isAuthenticated,
    changePassword
  } = useAuth();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{
    isValid: boolean;
    strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  }>({ isValid: false, strength: 'weak' });

  useEffect(() => {
    if (!isLoading) {
      if (!email) {
        router.replace('/auth');
        return;
      }
      
      if (isAuthenticated && isActive && !isFirstLogin) {
        router.replace('/EyEngage/EmployeeDashboard');
        return;
      }
    }
  }, [email, isActive, isFirstLogin, isLoading, isAuthenticated, router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!currentPassword) {
      newErrors.currentPassword = 'Le mot de passe actuel est requis';
    }
    
    if (!newPassword) {
      newErrors.newPassword = 'Le nouveau mot de passe est requis';
    } else {
      const strength = validatePasswordStrength(newPassword);
      setPasswordStrength(strength);
      
      if (!strength.isValid) {
        newErrors.newPassword = 'Le mot de passe ne respecte pas les exigences de sécurité';
      }
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'La confirmation est requise';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setErrors({});

    try {
      await changePassword(email, currentPassword, newPassword, confirmPassword);
      setSuccess(true);
    } catch (err: any) {
      setErrors({ general: err.message || "Erreur lors du changement de mot de passe" });
      setIsSubmitting(false);
    }
  };

  const getStrengthColor = () => {
    switch (passwordStrength.strength) {
      case 'weak': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'strong': return 'bg-blue-500';
      case 'very-strong': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  const getStrengthLabel = () => {
    switch (passwordStrength.strength) {
      case 'weak': return 'Faible';
      case 'medium': return 'Moyen';
      case 'strong': return 'Fort';
      case 'very-strong': return 'Très fort';
      default: return '';
    }
  };

  if (isLoading) {
    return <EnhancedLoading fullScreen />;
  }

  if (!email || (isAuthenticated && isActive && !isFirstLogin)) {
    return null;
  }

  return (
    <div
      className="relative flex min-h-screen items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/assets/images/bg-login.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
      <motion.div
        className="relative bg-white shadow-2xl rounded-xl p-8 max-w-md w-full mx-4"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <div className="flex flex-col items-center mb-8 space-y-4">
          <Image
            src="/assets/images/ey-logo.png"
            alt="EY Engage Logo"
            width={140}
            height={60}
            priority
            className="h-auto"
          />
          <div className="text-center">
            <Typography variant="h4" className="font-bold text-gray-800 mb-2">
              Changement de mot de passe
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              {isFirstLogin 
                ? "Première connexion - Veuillez définir un nouveau mot de passe"
                : "Votre compte nécessite un changement de mot de passe"
              }
            </Typography>
          </div>
        </div>
        
        <Card className="bg-white shadow-none">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <TextField
                label="Mot de passe actuel"
                type="password"
                fullWidth
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                required
                disabled={isSubmitting}
                error={!!errors.currentPassword}
                helperText={errors.currentPassword}
              />
              
              <div>
                <TextField
                  label="Nouveau mot de passe"
                  type="password"
                  fullWidth
                  value={newPassword}
                  onChange={e => {
                    setNewPassword(e.target.value);
                    if (e.target.value) {
                      setPasswordStrength(validatePasswordStrength(e.target.value));
                    }
                  }}
                  required
                  disabled={isSubmitting}
                  error={!!errors.newPassword}
                  helperText={errors.newPassword || "Minimum 8 caractères avec majuscule, minuscule, chiffre et caractère spécial"}
                />
                
                {newPassword && (
                  <div className="mt-3">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs">Force du mot de passe</span>
                      <span className={`text-xs font-medium ${getStrengthColor().replace('bg-', 'text-')}`}>
                        {getStrengthLabel()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getStrengthColor()}`}
                        style={{ 
                          width: passwordStrength.strength === 'weak' ? '25%' : 
                                  passwordStrength.strength === 'medium' ? '50%' : 
                                  passwordStrength.strength === 'strong' ? '75%' : '100%' 
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <TextField
                label="Confirmer le nouveau mot de passe"
                type="password"
                fullWidth
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                disabled={isSubmitting}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
              />
              
              {errors.general && (
                <Typography color="error" className="text-center text-sm">
                  {errors.general}
                </Typography>
              )}
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isSubmitting}
                className="bg-ey-yellow hover:bg-ey-yellow/90 text-ey-black font-semibold py-3 rounded-xl disabled:opacity-50"
              >
                {isSubmitting ? 'Changement en cours...' : 'Valider'}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <Snackbar
          open={success}
          autoHideDuration={2000}
          onClose={() => setSuccess(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="success" sx={{ width: '100%' }}>
            Mot de passe changé avec succès! Redirection...
          </Alert>
        </Snackbar>
      </motion.div>
    </div>
  );
}