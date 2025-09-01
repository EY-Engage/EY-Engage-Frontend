// app/auth/forbidden/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Lock, Home, LogOut, Shield, AlertTriangle, User } from 'lucide-react';
import EnhancedLoading from '@/components/SkeletonLoader';

export default function ForbiddenPage() {
  const { logout, user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // Simulation de chargement initial
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push('/auth');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleGoHome = () => {
    router.push('/EyEngage/EmployeeDashboard');
  };

  if (isLoading) {
    return (
      <EnhancedLoading 
        fullScreen={true}
        message="Vérification des autorisations..."
        variant="pulse"
      />
    );
  }

  if (isLoggingOut) {
    return (
      <EnhancedLoading 
        fullScreen={true}
        message="Déconnexion en cours..."
        variant="spinner"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ey-light-gray via-ey-white to-ey-yellow-light flex items-center justify-center p-4">
      {/* Arrière-plan décoratif */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-ey-yellow/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-ey-accent-blue/20 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        className="card-ey max-w-lg w-full relative z-10"
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.6,
          type: "spring",
          stiffness: 100,
          damping: 15
        }}
      >
        {/* En-tête avec logo EY */}
        <div className="p-8 text-center">
          <motion.div 
            className="inline-flex items-center justify-center w-20 h-20 bg-ey-yellow rounded-full mb-6 shadow-ey-lg"
            initial={{ rotate: -180, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <span className="text-ey-black font-bold text-2xl">EY</span>
          </motion.div>

          {/* Icône d'accès refusé */}
          <motion.div
            className="flex items-center justify-center mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <div className="relative">
              <div className="w-24 h-24 bg-ey-red/10 rounded-full flex items-center justify-center">
                <Lock className="w-12 h-12 text-ey-red" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-ey-red rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-ey-white" />
              </div>
            </div>
          </motion.div>

          {/* Titre principal */}
          <motion.h1 
            className="text-ey-3xl font-bold text-ey-red mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            Accès Non Autorisé
          </motion.h1>

          {/* Sous-titre */}
          <motion.p 
            className="text-ey-gray-600 text-ey-lg mb-6 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            Vous ne disposez pas des privilèges nécessaires pour accéder à cette ressource.
          </motion.p>

          {/* Informations utilisateur */}
          {user && (
            <motion.div 
              className="bg-ey-light-gray rounded-ey-lg p-4 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.5 }}
            >
              <div className="flex items-center gap-3 text-ey-sm">
                <User className="w-5 h-5 text-ey-gray-500" />
                <span className="text-ey-gray-700">
                  Connecté en tant que: <strong className="text-ey-black">{user.fullName}</strong>
                </span>
              </div>
            </motion.div>
          )}

          {/* Message d'aide */}
          <motion.div 
            className="alert-ey-warning mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.5 }}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-ey-orange mt-1 flex-shrink-0" />
              <div className="text-ey-sm text-left">
                <p className="font-semibold mb-1">Que faire maintenant ?</p>
                <ul className="text-ey-orange/80 space-y-1">
                  <li>• Contactez votre administrateur système</li>
                  <li>• Vérifiez que vous utilisez le bon compte</li>
                  <li>• Retournez à l'accueil ou déconnectez-vous</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Actions */}
        <motion.div 
          className="p-6 border-t border-ey-gray-200 space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleGoHome}
              className="btn-ey-secondary flex items-center justify-center gap-2 flex-1"
            >
              <Home className="w-5 h-5" />
              Retour à l'accueil
            </button>
            
            <button
              onClick={handleLogout}
              className="btn-ey-danger flex items-center justify-center gap-2 flex-1"
            >
              <LogOut className="w-5 h-5" />
              Se déconnecter
            </button>
          </div>

          {/* Lien de contact */}
          <div className="text-center">
            <p className="text-ey-sm text-ey-gray-500">
              Besoin d'aide ? 
              <a 
                href="mailto:support@ey.com" 
                className="text-ey-accent-blue hover:text-ey-accent-blue/80 ml-1 font-medium"
              >
                Contactez le support
              </a>
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Élément décoratif en bas */}
      <div className="absolute bottom-4 right-4 text-ey-gray-400 text-ey-xs">
        EY Engage - Système de gestion d'événements
      </div>
    </div>
  );
}