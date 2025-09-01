"use client";
import { useState } from 'react';
import Link from 'next/link';
import { forgotPassword } from '@/lib/services/userService';
import { ValidationPatterns } from '@/components/FormValidation';
import EnhancedLoading from '@/components/SkeletonLoader';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validateEmail = () => {
    if (!email) {
      setEmailError('L\'email est requis');
      return false;
    }
    
    if (!ValidationPatterns.email.test(email)) {
      setEmailError('Format d\'email invalide');
      return false;
    }
    
    setEmailError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail()) return;
    
    setIsLoading(true);
    try {
      await forgotPassword(email);
      setMessage('Un email de réinitialisation a été envoyé à votre adresse');
      setError('');
    } catch (err) {
      setError(err.message || 'Une erreur est survenue');
      setMessage('');
    } finally {
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
          <h1 className="text-3xl font-bold text-ey-white mb-2 drop-shadow-lg">Mot de passe oublié</h1>
          <p className="text-ey-white/90 drop-shadow">Entrez votre email pour recevoir un lien de réinitialisation</p>
        </div>

        <div className="bg-ey-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-ey-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-ey-black mb-3">
                Adresse email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={validateEmail}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-0 focus:outline-none transition-colors text-ey-black placeholder-ey-black/50 bg-ey-white ${
                  emailError ? 'border-ey-red focus:border-ey-red' : 'border-ey-darkGray focus:border-ey-yellow'
                }`}
                placeholder="votre@email.com"
                required
                disabled={isLoading || message}
              />
              {emailError && (
                <p className="text-ey-red text-xs mt-1">{emailError}</p>
              )}
            </div>
            
            {message && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-green-700 text-sm font-medium">{message}</p>
                </div>
                <p className="text-green-600 text-xs mt-2 ml-7">
                  Vérifiez votre boîte de réception et vos spams
                </p>
              </div>
            )}
            
            {error && (
              <div className="p-4 bg-ey-red/10 border border-ey-red/20 rounded-xl">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-ey-red mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-ey-red text-sm font-medium">{error}</p>
                </div>
              </div>
            )}
            
            <button
              type="submit"
              disabled={isLoading || message}
              className="w-full bg-ey-yellow text-ey-black font-semibold py-3 rounded-xl hover:bg-ey-yellow/90 focus:ring-4 focus:ring-ey-yellow/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-ey-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Envoi en cours...
                </span>
              ) : message ? (
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Email envoyé ✓
                </span>
              ) : (
                'Envoyer le lien de réinitialisation'
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

        {message && (
          <div className="mt-6 text-center">
            <div className="bg-ey-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg">
              <p className="text-ey-black/80 text-sm">
                <strong>Que faire ensuite ?</strong>
              </p>
              <ul className="text-ey-black/70 text-xs mt-2 space-y-1 text-left">
                <li>• Vérifiez votre boîte de réception</li>
                <li>• Consultez le dossier spam/courriers indésirables</li>
                <li>• Cliquez sur le lien dans l'email reçu</li>
                <li>• Le lien expire dans 1 heure</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}