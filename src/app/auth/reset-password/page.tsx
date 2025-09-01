"use client";
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { resetPassword } from '@/lib/services/userService';
import { validatePasswordStrength, validatePasswordMatch } from '@/components/FormValidation';
import EnhancedLoading from '@/components/SkeletonLoader';
export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  
  const searchParams = useSearchParams();
  const router = useRouter();

  const email = searchParams.get('email') || '';
  const token = searchParams.get('token') || '';

  const validateForm = () => {
    const errors: string[] = [];
    const strength = validatePasswordStrength(newPassword);
    
    if (!newPassword) {
      errors.push('Le mot de passe est requis');
    } else if (!strength.isValid) {
      errors.push(...strength.errors);
    }
    
    if (!confirmPassword) {
      errors.push('La confirmation est requise');
    } else if (!validatePasswordMatch(newPassword, confirmPassword)) {
      errors.push('Les mots de passe ne correspondent pas');
    }
    
    setPasswordErrors(errors);
    return errors.length === 0;
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const getStrengthLabel = (strength: number) => {
    if (strength <= 1) return { label: 'Faible', color: 'bg-red-500' };
    if (strength <= 2) return { label: 'Moyen', color: 'bg-yellow-500' };
    if (strength <= 3) return { label: 'Bon', color: 'bg-blue-500' };
    return { label: 'Excellent', color: 'bg-green-500' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      await resetPassword(email, token, newPassword);
      setMessage('Votre mot de passe a été réinitialisé avec succès');
      setError('');
      
      setRedirecting(true);
      setTimeout(() => {
        router.push('/auth');
      }, 3000);
      
    } catch (err) {
      setError(err.message || 'Le lien de réinitialisation est invalide ou a expiré');
      setMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(newPassword);
  const strengthInfo = getStrengthLabel(passwordStrength);
  const strengthPercentage = (passwordStrength / 4) * 100;

  if (isLoading) return <EnhancedLoading fullScreen />;

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-4" 
                style={{backgroundImage: "url('/assets/images/bg-login.jpg')"}}>
      
      <div className="absolute inset-0 bg-ey-black/20"></div>
      
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-ey-yellow rounded-full mb-4 shadow-xl transform hover:scale-105 transition-transform">
            <span className="text-ey-black font-bold text-3xl">EY</span>
          </div>
          <h1 className="text-3xl font-bold text-ey-white mb-2 drop-shadow-lg">Nouveau mot de passe</h1>
          <p className="text-ey-white/90 drop-shadow">Choisissez un mot de passe sécurisé pour votre compte</p>
        </div>

        <div className="bg-ey-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-ey-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-ey-black mb-3">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPasswords ? "text" : "password"}
                  id="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-ey-darkGray rounded-xl focus:border-ey-yellow focus:ring-0 focus:outline-none transition-colors text-ey-black placeholder-ey-black/50 pr-12 bg-ey-white"
                  placeholder="Minimum 8 caractères"
                  required
                  minLength={8}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-ey-black/60 hover:text-ey-black transition-colors"
                  disabled={isLoading}
                >
                  {showPasswords ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              
              {newPassword && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-ey-black/70">Force du mot de passe</span>
                    <span className={`text-xs font-medium ${strengthInfo.color.replace('bg-', 'text-')}`}>
                      {strengthInfo.label}
                    </span>
                  </div>
                  <div className="w-full bg-ey-darkGray/20 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${strengthInfo.color}`}
                      style={{ width: `${strengthPercentage}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 text-xs text-ey-black/60">
                    <p>Le mot de passe doit contenir :</p>
                    <ul className="mt-1 space-y-1">
                      <li className={`flex items-center ${newPassword.length >= 8 ? 'text-green-600' : 'text-ey-black/40'}`}>
                        <svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Au moins 8 caractères
                      </li>
                      <li className={`flex items-center ${/[A-Z]/.test(newPassword) ? 'text-green-600' : 'text-ey-black/40'}`}>
                        <svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Une majuscule
                      </li>
                      <li className={`flex items-center ${/[0-9]/.test(newPassword) ? 'text-green-600' : 'text-ey-black/40'}`}>
                        <svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Un chiffre
                      </li>
                      <li className={`flex items-center ${/[^A-Za-z0-9]/.test(newPassword) ? 'text-green-600' : 'text-ey-black/40'}`}>
                        <svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Un caractère spécial
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-ey-black mb-3">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPasswords ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-0 focus:outline-none transition-colors text-ey-black placeholder-ey-black/50 pr-12 bg-ey-white ${
                    confirmPassword && newPassword !== confirmPassword 
                      ? 'border-red-500 focus:border-red-500' 
                      : confirmPassword && newPassword === confirmPassword
                      ? 'border-green-500 focus:border-green-500'
                      : 'border-ey-darkGray focus:border-ey-yellow'
                  }`}
                  placeholder="Répétez votre mot de passe"
                  required
                  disabled={isLoading}
                />
                {confirmPassword && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {newPassword === confirmPassword ? (
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                )}
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-red-500 text-xs mt-2 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Les mots de passe ne correspondent pas
                </p>
              )}
            </div>
            
            {passwordErrors.length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                {passwordErrors.map((error, index) => (
                  <div key={index} className="flex items-center text-red-600 text-sm">
                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>{error}</span>
                  </div>
                ))}
              </div>
            )}
            
            {message && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-green-700 text-sm font-medium">{message}</p>
                </div>
                {redirecting && (
                  <div className="mt-3 flex items-center text-green-600 text-xs">
                    <svg className="animate-spin -ml-1 mr-2 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Redirection vers la page de connexion...
                  </div>
                )}
              </div>
            )}
            
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              </div>
            )}
            
            <button
              type="submit"
              disabled={isLoading || !newPassword || !confirmPassword || newPassword !== confirmPassword || redirecting}
              className="w-full bg-ey-yellow text-ey-black font-bold py-3 px-6 rounded-xl hover:bg-ey-yellow/90 focus:ring-4 focus:ring-ey-yellow/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-ey-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Réinitialisation en cours...
                </span>
              ) : redirecting ? (
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Mot de passe modifié ✓
                </span>
              ) : (
                'Réinitialiser le mot de passe'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link 
              href="/auth" 
              className="inline-flex items-center text-ey-black/70 hover:text-ey-black transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour à la connexion
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <div className="bg-ey-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg">
            <p className="text-ey-black/80 text-sm font-medium mb-2">
              <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1.257-.257A6 6 0 1118 8zm-2 0a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              Conseils pour un mot de passe sécurisé
            </p>
            <ul className="text-ey-black/70 text-xs space-y-1 text-left">
              <li>• Utilisez au moins 8 caractères</li>
              <li>• Combinez majuscules, minuscules, chiffres et symboles</li>
              <li>• Évitez les mots du dictionnaire ou informations personnelles</li>
              <li>• Ne réutilisez pas ce mot de passe ailleurs</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}