'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ValidationPatterns } from '@/components/FormValidation';
import EnhancedLoading from '@/components/SkeletonLoader';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{email?: string; password?: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/EyEngage/EmployeeDashboard');
    }
  }, [isAuthenticated, router]);

  const validateForm = () => {
    const errors: {email?: string; password?: string} = {};
    
    if (!email) {
      errors.email = 'L\'email est requis';
    } else if (!ValidationPatterns.email.test(email)) {
      errors.email = 'Format d\'email invalide';
    }
    
    if (!password) {
      errors.password = 'Le mot de passe est requis';
    } else if (password.length < 8) {
      errors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError('');

    try {
      await login(email, password);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Erreur de connexion. Vérifiez vos identifiants.');
      setIsLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-ey-white mb-2 drop-shadow-lg">EY Engage</h1>
          <p className="text-ey-white/90 drop-shadow">Connectez-vous à votre espace</p>
        </div>

        <div className="bg-ey-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-ey-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-ey-black mb-3">
                Adresse email
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-0 focus:outline-none transition-colors text-ey-black placeholder-ey-black/50 bg-ey-white ${
                    fieldErrors.email 
                      ? 'border-ey-red focus:border-ey-red' 
                      : 'border-ey-darkGray focus:border-ey-yellow'
                  }`}
                  placeholder="votre@email.com"
                  disabled={isLoading}
                  autoComplete="email"
                />
                {fieldErrors.email && (
                  <p className="text-ey-red text-xs mt-1 ml-1">{fieldErrors.email}</p>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-ey-black mb-3">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:ring-0 focus:outline-none transition-colors text-ey-black placeholder-ey-black/50 bg-ey-white ${
                    fieldErrors.password 
                      ? 'border-ey-red focus:border-ey-red' 
                      : 'border-ey-darkGray focus:border-ey-yellow'
                  }`}
                  placeholder="••••••••"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-ey-darkGray hover:text-ey-black transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
                {fieldErrors.password && (
                  <p className="text-ey-red text-xs mt-1 ml-1">{fieldErrors.password}</p>
                )}
              </div>
            </div>
            
            {error && (
              <div className="p-4 bg-ey-red/10 border border-ey-red/20 rounded-xl">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-ey-red mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-ey-red text-sm font-medium">{error}</p>
                </div>
              </div>
            )}
            
            <button
              type="submit"
              disabled={isLoading || !!fieldErrors.email || !!fieldErrors.password}
              className="w-full bg-ey-yellow text-ey-black font-semibold py-3 rounded-xl hover:bg-ey-yellow/90 focus:ring-4 focus:ring-ey-yellow/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-ey-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connexion en cours...
                </span>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <Link 
              href="/auth/forgot-password" 
              className="inline-block text-ey-black/70 hover:text-ey-black transition-colors text-sm font-medium"
            >
              Mot de passe oublié ?
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-ey-white/70 text-xs">
            © 2024 EY. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
}