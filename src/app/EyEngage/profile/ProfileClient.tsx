'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Mail, Phone, Calendar, Clock, Tag, MapPin, Briefcase,
  CalendarDays, Users, MessageCircle, CheckCircle, UserRound, Trophy, Star, Heart,
  Edit, Lock, Camera, Download, Share2, Award, Target, TrendingUp,
  FileText, Eye, Bookmark, Activity, AlertCircle, Check, X, Upload,
  ArrowLeft, UserPlus, UserMinus, UserCheck, RefreshCw, Building,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { 
  updateUserProfile, 
  updatePassword, 
  updateUserProfilePicture 
} from '@/lib/services/userService';
import { UserProfileData, UserProfileEvents, FollowCounts, CreateFollowDto } from '@/types/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import toast from 'react-hot-toast';
import { useFormValidation, ValidationSchemas, validatePasswordStrength } from '@/components/FormValidation';
import EnhancedLoading from '@/components/SkeletonLoader';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { followService } from '@/lib/services/social/followService';
import { UserDto } from '@/dtos/user/UserDto';

interface ProfileClientProps {
  user: UserProfileData;
  eventsData: UserProfileEvents;
  isOwnProfile: boolean;
}

export default function ProfileClient({ user, eventsData, isOwnProfile }: ProfileClientProps) {
  const { roles, logout, user: currentUser } = useAuth();
  const router = useRouter();
  
  // États principaux
  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pictureLoading, setPictureLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  
  // États pour les follows
  const [followCounts, setFollowCounts] = useState<FollowCounts>({ followersCount: 0, followingCount: 0 });
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followersModal, setFollowersModal] = useState(false);
  const [followingModal, setFollowingModal] = useState(false);
  const [followers, setFollowers] = useState<UserDto[]>([]);
  const [following, setFollowing] = useState<UserDto[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  
  // États des messages
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // États des formulaires
  const [formData, setFormData] = useState({ ...user });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [bio, setBio] = useState(user.bio || '');
  
  // États des statistiques
  const [engagementLevel, setEngagementLevel] = useState(0);
  const [achievementScore, setAchievementScore] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validation des formulaires (seulement si c'est son propre profil)
  const { errors: profileErrors, validate: validateProfile, validateField: validateProfileField } = 
    useFormValidation(ValidationSchemas.userRegistration);
  
  const { errors: passwordErrors, validate: validatePasswordForm } = 
    useFormValidation(ValidationSchemas.changePassword);

  // Convertir FollowDto en UserDto - CORRECTION : utilisation correcte des données
  const followToUserDto = (follow: any, isFollower: boolean): UserDto => {
    return {
      id: isFollower ? follow.followerId : follow.followedId,
      fullName: isFollower ? follow.followerName : follow.followedName,
      profilePicture: isFollower ? follow.followerProfilePicture : follow.followedProfilePicture,
      department: isFollower ? follow.followerDepartment : follow.followedDepartment,
      email: '',
      phoneNumber: '',
      fonction: '',
      sector: '',
      roles: [],
      isActive: true,
      isFirstLogin: false,
      createdAt: follow.createdAt,
      updatedAt: follow.createdAt,
    };
  };

  // Charger les données de suivi - CORRIGÉ
  const loadFollowData = async () => {
    if (!user?.id) return;
    
    try {
      // Charger les compteurs
      const counts = await followService.getFollowCounts(user.id);
      console.log('ProfileClient - compteurs chargés:', counts);
      setFollowCounts(counts);
      
      // Vérifier si on suit cet utilisateur (seulement si ce n'est pas notre profil)
      if (!isOwnProfile && currentUser?.id && currentUser.id !== user.id) {
        const followStatus = await followService.isFollowing(user.id);
        console.log('ProfileClient - statut de suivi:', followStatus);
        setIsFollowing(followStatus.isFollowing);
      }
    } catch (error) {
      console.error('Erreur chargement données follow:', error);
      toast.error('Erreur lors du chargement des données de suivi');
    }
  };

  // Charger les followers - CORRIGÉ
  const loadFollowers = async () => {
    if (!user?.id) return;
    
    try {
      setModalLoading(true);
      const followersData = await followService.getFollowers(user.id, 1, 50);
      console.log('ProfileClient - followers chargés:', followersData);
      
      const followersUsers = followersData.followers.map(follow => 
        followToUserDto(follow, true)
      );
      setFollowers(followersUsers);
    } catch (error) {
      console.error('Erreur chargement followers:', error);
      toast.error('Erreur lors du chargement des abonnés');
    } finally {
      setModalLoading(false);
    }
  };

  // Charger les following - CORRIGÉ
  const loadFollowing = async () => {
    if (!user?.id) return;
    
    try {
      setModalLoading(true);
      const followingData = await followService.getFollowing(user.id, 1, 50);
      console.log('ProfileClient - following chargés:', followingData);
      
      const followingUsers = followingData.following.map(follow => 
        followToUserDto(follow, false)
      );
      setFollowing(followingUsers);
    } catch (error) {
      console.error('Erreur chargement following:', error);
      toast.error('Erreur lors du chargement des abonnements');
    } finally {
      setModalLoading(false);
    }
  };

  // Ouvrir le modal des followers
  const openFollowersModal = async () => {
    setFollowersModal(true);
    await loadFollowers();
  };

  // Ouvrir le modal des following
  const openFollowingModal = async () => {
    setFollowingModal(true);
    await loadFollowing();
  };

  // Gérer le suivi/désuivi - CORRIGÉ avec validation complète
  const handleFollowToggle = async (userId: string) => {
    console.log('=== DÉBUT handleFollowToggle ===');
    console.log('ProfileClient - handleFollowToggle userId:', userId);
    console.log('ProfileClient - currentUser:', currentUser?.id);
    console.log('ProfileClient - isOwnProfile:', isOwnProfile);
    console.log('ProfileClient - isFollowing avant:', isFollowing);

    // Validations de base
    if (!currentUser?.id) {
      toast.error('Vous devez être connecté pour suivre un utilisateur');
      return;
    }

    if (isOwnProfile || currentUser.id === userId) {
      toast.error('Vous ne pouvez pas vous suivre vous-même');
      return;
    }

    if (!userId) {
      toast.error('ID utilisateur invalide');
      return;
    }

    setFollowLoading(true);
    
    try {
      if (isFollowing) {
        // Ne plus suivre
        console.log('ProfileClient - Tentative de unfollow...');
        const result = await followService.unfollowUser(userId);
        console.log('ProfileClient - Unfollow réussi:', result);
        
        setIsFollowing(false);
        setFollowCounts(prev => ({ 
          ...prev, 
          followersCount: Math.max(0, prev.followersCount - 1) 
        }));
        toast.success(`Vous ne suivez plus ${user.fullName}`);
        
      } else {
        // Suivre
        console.log('ProfileClient - Tentative de follow...');
        const followDto: CreateFollowDto = { followedId: userId };
        const result = await followService.followUser(followDto);
        console.log('ProfileClient - Follow réussi:', result);
        
        setIsFollowing(true);
        setFollowCounts(prev => ({ 
          ...prev, 
          followersCount: prev.followersCount + 1 
        }));
        toast.success(`Vous suivez maintenant ${user.fullName}`);
      }
      
      // Recharger les données après un délai pour s'assurer de la cohérence
      setTimeout(async () => {
        await loadFollowData();
      }, 1000);
      
    } catch (error: any) {
      console.error('=== ERREUR handleFollowToggle ===');
      console.error('ProfileClient - Erreur follow toggle:', error);
      
      // Gestion des erreurs spécifiques
      let errorMessage = 'Erreur lors de l\'action';
      
      if (error.message) {
        if (error.message.includes('déjà')) {
          errorMessage = 'Vous suivez déjà cet utilisateur';
        } else if (error.message.includes('non trouvé')) {
          errorMessage = 'Utilisateur non trouvé';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
      
      // Recharger les données en cas d'erreur pour éviter l'incohérence
      await loadFollowData();
      
    } finally {
      setFollowLoading(false);
      console.log('=== FIN handleFollowToggle ===');
    }
  };

  // Gérer le suivi/désuivi depuis le modal - CORRIGÉ
  const handleModalFollowToggle = async (targetUser: UserDto) => {
    if (!currentUser?.id || targetUser.id === currentUser.id) return;
    
    try {
      const isCurrentlyFollowing = await followService.isFollowing(targetUser.id);
      
      if (isCurrentlyFollowing.isFollowing) {
        await followService.unfollowUser(targetUser.id);
        toast.success(`Vous ne suivez plus ${targetUser.fullName}`);
      } else {
        const followDto: CreateFollowDto = { followedId: targetUser.id };
        await followService.followUser(followDto);
        toast.success(`Vous suivez maintenant ${targetUser.fullName}`);
      }
      
      // Recharger les données des modals
      if (followersModal) await loadFollowers();
      if (followingModal) await loadFollowing();
      
      // Recharger les compteurs
      await loadFollowData();
    } catch (error) {
      console.error('Erreur follow toggle depuis modal:', error);
      toast.error('Erreur lors de l\'action');
    }
  };

  // Calcul des statistiques au montage
  useEffect(() => {
    const totalEvents = eventsData.organizedEvents.length + eventsData.participatedEvents.length;
    const totalComments = eventsData.comments.length;
    const approvedParticipations = eventsData.approvedParticipations?.length || 0;
    
    // Calcul du niveau d'engagement (0-100)
    const engagement = Math.min(100, (totalEvents * 10) + (totalComments * 2) + (approvedParticipations * 5));
    setEngagementLevel(engagement);
    
    // Calcul du score d'accomplissement
    const achievements = Math.min(1000, (totalEvents * 50) + (approvedParticipations * 25) + (totalComments * 5));
    setAchievementScore(achievements);

    // Charger les données de suivi
    if (user?.id) {
      loadFollowData();
    }
  }, [user?.id, eventsData]);

  // Vérification des rôles
  const hasRole = (targetRoles: string[]) => {
    return roles?.some(role => targetRoles.includes(role));
  };

  // [Toutes les autres méthodes restent identiques - validation, upload, etc.]
  const validateProfileForm = () => {
    if (!isOwnProfile) return false;
    const isValid = validateProfile({
      fullName: formData.fullName,
      phoneNumber: formData.phoneNumber,
      fonction: formData.fonction,
      department: formData.department
    });
    return isValid;
  };

  const validatePasswordFormData = () => {
    if (!isOwnProfile) return false;
    const isValid = validatePasswordForm(passwordData);
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return false;
    }
    
    const passwordStrength = validatePasswordStrength(passwordData.newPassword);
    if (!passwordStrength.isValid) {
      toast.error(`Mot de passe trop faible: ${passwordStrength.errors.join(', ')}`);
      return false;
    }
    
    return isValid;
  };

  const handleProfilePicture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isOwnProfile) return;
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      
      if (file.size > maxSize) {
        toast.error("L'image ne doit pas dépasser 5MB");
        return;
      }
      
      if (!allowedTypes.includes(file.type)) {
        toast.error("Format d'image non supporté (JPG, PNG, WebP uniquement)");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPreviewImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
      
      setPictureLoading(true);
      setSuccessMessage('');
      setErrorMessage('');
      
      try {
        const formData = new FormData();
        formData.append('profilePicture', file);
        
        await updateUserProfilePicture(formData);
        setSuccessMessage('Photo de profil mise à jour avec succès !');
        
        setTimeout(() => window.location.reload(), 2000);
      } catch (error: any) {
        console.error('Erreur mise à jour photo:', error);
        setErrorMessage(error.message || 'Erreur lors de la mise à jour de la photo');
        setPreviewImage(null);
      } finally {
        setPictureLoading(false);
      }
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isOwnProfile || !validateProfileForm()) {
      toast.error('Veuillez corriger les erreurs du formulaire');
      return;
    }
    
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      await updateUserProfile({
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        fonction: formData.fonction,
        department: formData.department,
        sector: formData.sector,
        bio: bio
      });
      
      setSuccessMessage('Profil mis à jour avec succès !');
      setEditMode(false);
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      console.error('Erreur mise à jour profil:', error);
      setErrorMessage(error.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isOwnProfile || !validatePasswordFormData()) {
      return;
    }
    
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      await updatePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      
      setSuccessMessage('Mot de passe mis à jour avec succès ! Reconnexion nécessaire...');
      setPasswordMode(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
      setTimeout(() => {
        logout();
      }, 3000);
    } catch (error: any) {
      console.error('Erreur changement mot de passe:', error);
      setErrorMessage(error.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setLoading(false);
    }
  };

  const generateProfileReport = () => {
    if (!isOwnProfile) return;
    
    const reportData = {
      user: user,
      statistics: {
        organizedEvents: eventsData.organizedEvents.length,
        participatedEvents: eventsData.participatedEvents.length,
        comments: eventsData.comments.length,
        engagementLevel: engagementLevel,
        achievementScore: achievementScore,
        followersCount: followCounts.followersCount,
        followingCount: followCounts.followingCount
      },
      createdAt: new Date().toISOString()
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `profil_${user.fullName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    toast.success('Rapport de profil téléchargé !');
  };

  const getEngagementLabel = (level: number) => {
    if (level >= 80) return { label: "Expert EY", color: "text-ey-green", badge: "badge-ey-success" };
    if (level >= 60) return { label: "Contributeur Actif", color: "text-ey-accent-blue", badge: "badge-ey-info" };
    if (level >= 40) return { label: "Membre Engagé", color: "text-ey-yellow", badge: "badge-ey-warning" };
    if (level >= 20) return { label: "Participant", color: "text-ey-orange", badge: "badge-ey-warning" };
    return { label: "Nouveau Membre", color: "text-ey-gray-500", badge: "badge-ey-secondary" };
  };

  if (loading && !editMode && !passwordMode) {
    return <EnhancedLoading fullScreen message="Chargement du profil..." variant="pulse" />;
  }

  const engagementInfo = getEngagementLabel(engagementLevel);

  return (
    <div className="min-h-screen bg-ey-light-gray p-4 md:p-8">
      
      {/* Messages de feedback */}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-ey-green text-ey-white px-6 py-3 rounded-ey-lg shadow-ey-xl z-50 animate-slide-in max-w-md">
          <div className="flex items-center gap-2">
            <Check size={18} />
            <span>{successMessage}</span>
          </div>
        </div>
      )}
      
      {errorMessage && (
        <div className="fixed top-4 right-4 bg-ey-red text-ey-white px-6 py-3 rounded-ey-lg shadow-ey-xl z-50 animate-slide-in max-w-md">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Bouton retour si ce n'est pas son propre profil */}
        {!isOwnProfile && (
          <div className="flex items-center gap-4 mb-6">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="btn-ey-outline flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Retour
            </Button>
            <div className="text-ey-gray-600">
              <span className="text-ey-sm">Vous consultez le profil de</span>
              <span className="font-semibold text-ey-black ml-1">{user.fullName}</span>
            </div>
          </div>
        )}
        
        {/* En-tête du profil */}
        <Card className="card-ey animate-fade-in">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
              
              {/* Photo de profil */}
              <div className="relative group">
                <div className="relative">
                  {previewImage || user.profilePicture ? (
                    <div className="relative">
                      <Image
                        src={previewImage || `${process.env.NEXT_PUBLIC_BACKEND_URL}${user.profilePicture}`}
                        alt={user.fullName}
                        width={150}
                        height={150}
                        className="rounded-full border-4 border-ey-yellow shadow-ey-lg"
                        unoptimized
                      />
                      {pictureLoading && (
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                          <div className="loading-spinner-ey" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-36 h-36 bg-gradient-ey-primary rounded-full flex items-center justify-center text-5xl font-bold text-ey-black shadow-ey-lg">
                      {user.fullName.charAt(0)}
                    </div>
                  )}
                  
                  {/* Bouton de changement de photo seulement pour son propre profil */}
                  {isOwnProfile && (
                    <button 
                      className="absolute bottom-2 right-2 bg-ey-black text-ey-white rounded-full p-3 shadow-ey-lg hover:bg-ey-gray-800 transition-all hover:scale-110 group-hover:opacity-100 opacity-90"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={pictureLoading}
                      title="Changer la photo de profil"
                    >
                      <Camera size={18} />
                    </button>
                  )}
                  
                  {isOwnProfile && (
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfilePicture}
                      disabled={pictureLoading}
                    />
                  )}
                </div>
                
                {/* Badge de niveau */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <span className={`${engagementInfo.badge} px-3 py-1 shadow-ey-md`}>
                    <Trophy size={14} className="mr-1" />
                    {engagementInfo.label}
                  </span>
                </div>
              </div>

              {/* Informations principales */}
              <div className="flex-1 text-center lg:text-left">
                <div className="mb-4">
                  <h1 className="text-3xl md:text-4xl font-bold text-ey-black mb-2">
                    {user.fullName}
                  </h1>
                  <p className="text-ey-gray-600 text-lg mb-3">
                    {user.fonction || 'Fonction non spécifiée'} • {user.department}
                  </p>
                  
                  {bio && (
                    <p className="text-ey-gray-700 leading-relaxed mb-4 max-w-2xl">
                      {bio}
                    </p>
                  )}
                </div>

                {/* Badges et informations */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-6">
                  <Badge className="badge-ey-info">
                    <Briefcase size={14} className="mr-1" />
                    {user.department}
                  </Badge>
                  {user.sector && (
                    <Badge variant="outline" className="border-ey-gray-300">
                      <Tag size={14} className="mr-1" />
                      {user.sector}
                    </Badge>
                  )}
                  <Badge variant="outline" className="border-ey-gray-300">
                    <Calendar size={14} className="mr-1" />
                    Membre depuis {new Date(user.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                  </Badge>
                </div>

                {/* Statistiques de suivi */}
                <div className="flex justify-center lg:justify-start gap-6 mb-6">
                  <button
                    onClick={openFollowersModal}
                    className="text-center hover:bg-ey-gray-100 p-2 rounded-ey-lg transition-colors"
                  >
                    <div className="text-xl font-bold text-ey-black">
                      {followCounts.followersCount}
                    </div>
                    <div className="text-sm text-ey-gray-600">
                      Abonné{followCounts.followersCount > 1 ? 's' : ''}
                    </div>
                  </button>
                  
                  <button
                    onClick={openFollowingModal}
                    className="text-center hover:bg-ey-gray-100 p-2 rounded-ey-lg transition-colors"
                  >
                    <div className="text-xl font-bold text-ey-black">
                      {followCounts.followingCount}
                    </div>
                    <div className="text-sm text-ey-gray-600">Abonnements</div>
                  </button>
                  
                  <div className="text-center p-2">
                    <div className="text-xl font-bold text-ey-black">
                      {eventsData.organizedEvents.length + eventsData.participatedEvents.length}
                    </div>
                    <div className="text-sm text-ey-gray-600">Événements</div>
                  </div>
                </div>

                {/* Informations de contact */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-center lg:justify-start gap-3 text-ey-gray-700">
                    <Mail size={18} className="text-ey-accent-blue" />
                    <span>{user.email}</span>
                  </div>
                  {user.phoneNumber && (
                    <div className="flex items-center justify-center lg:justify-start gap-3 text-ey-gray-700">
                      <Phone size={18} className="text-ey-accent-blue" />
                      <span>{user.phoneNumber}</span>
                    </div>
                  )}
                </div>
                
                {/* Boutons d'action */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                  {isOwnProfile ? (
                    <>
                      <Button 
                        onClick={() => setEditMode(true)}
                        className="btn-ey-primary"
                      >
                        <Edit size={16} className="mr-2" />
                        Modifier le profil
                      </Button>
                      <Button 
                        onClick={() => setPasswordMode(true)}
                        className="btn-ey-secondary"
                      >
                        <Lock size={16} className="mr-2" />
                        Changer le mot de passe
                      </Button>
                      <Button 
                        onClick={generateProfileReport}
                        variant="outline"
                        className="btn-ey-outline"
                      >
                        <Download size={16} className="mr-2" />
                        Télécharger le rapport
                      </Button>
                    </>
                  ) : (
                    <>
                      {/* Bouton de suivi */}
                      <Button
                        onClick={() => handleFollowToggle(user.id)}
                        disabled={followLoading}
                        className={`min-w-36 ${
                          isFollowing 
                            ? 'btn-ey-secondary hover:btn-ey-danger hover:text-ey-white' 
                            : 'btn-ey-primary'
                        }`}
                      >
                        {followLoading ? (
                          <>
                            <RefreshCw size={16} className="mr-2 animate-spin" />
                            {isFollowing ? 'Désabonnement...' : 'Abonnement...'}
                          </>
                        ) : isFollowing ? (
                          <>
                            <UserCheck size={16} className="mr-2" />
                            Suivi
                          </>
                        ) : (
                          <>
                            <UserPlus size={16} className="mr-2" />
                            Suivre
                          </>
                        )}
                      </Button>
                      
                      {/* Bouton message */}
                      <Button
                        variant="outline"
                        className="btn-ey-outline"
                      >
                        <MessageSquare size={16} className="mr-2" />
                        Message
                      </Button>
                      
                      {/* Badge profil public */}
                      <Badge className="badge-ey-info">
                        <Eye size={14} className="mr-1" />
                        Profil public
                      </Badge>
                    </>
                  )}
                </div>
              </div>

              {/* Statistiques d'engagement */}
              <div className="bg-gradient-to-br from-ey-yellow/20 to-ey-accent-blue/20 rounded-ey-xl p-6 min-w-[300px]">
                <h3 className="font-bold text-ey-black mb-4 text-center">Tableau de bord</h3>
                
                {/* Niveau d'engagement */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-ey-gray-700">Engagement</span>
                    <span className={`text-sm font-bold ${engagementInfo.color}`}>
                      {engagementLevel}%
                    </span>
                  </div>
                  <div className="w-full bg-ey-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-ey-yellow to-ey-accent-blue h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${engagementLevel}%` }}
                    />
                  </div>
                </div>
                
                {/* Score d'accomplissement */}
                <div className="text-center mb-4">
                  <div className="text-2xl font-bold text-ey-black">
                    {achievementScore.toLocaleString()}
                  </div>
                  <div className="text-sm text-ey-gray-600">Points d'accomplissement</div>
                </div>
                
                {/* Statistiques rapides */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center bg-ey-white/50 rounded-ey-lg p-3">
                    <div className="text-lg font-bold text-ey-accent-blue">
                      {eventsData.organizedEvents.length}
                    </div>
                    <div className="text-xs text-ey-gray-600">Organisés</div>
                  </div>
                  <div className="text-center bg-ey-white/50 rounded-ey-lg p-3">
                    <div className="text-lg font-bold text-ey-green">
                      {eventsData.participatedEvents.length}
                    </div>
                    <div className="text-xs text-ey-gray-600">Participations</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contenu principal avec onglets - reste inchangé */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-ey-white border border-ey-gray-200 rounded-ey-lg p-1">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-ey-yellow data-[state=active]:text-ey-black rounded-ey-md transition-all"
            >
              <Activity size={16} className="mr-2" />
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger 
              value="events"
              className="data-[state=active]:bg-ey-yellow data-[state=active]:text-ey-black rounded-ey-md transition-all"
            >
              <Calendar size={16} className="mr-2" />
              Événements
            </TabsTrigger>
            <TabsTrigger 
              value="activity"
              className="data-[state=active]:bg-ey-yellow data-[state=active]:text-ey-black rounded-ey-md transition-all"
            >
              <TrendingUp size={16} className="mr-2" />
              Activité
            </TabsTrigger>
            <TabsTrigger 
              value="network"
              className="data-[state=active]:bg-ey-yellow data-[state=active]:text-ey-black rounded-ey-md transition-all"
            >
              <Users size={16} className="mr-2" />
              Réseau
            </TabsTrigger>
          </TabsList>

          {/* Contenu des onglets - Vue d'ensemble */}
          <TabsContent value="overview" className="space-y-6">
            
            {/* Statistiques générales */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="card-ey text-center">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-ey-accent-blue mb-2">
                    {eventsData.organizedEvents.length}
                  </div>
                  <div className="text-sm text-ey-gray-600">Événements organisés</div>
                </CardContent>
              </Card>
              
              <Card className="card-ey text-center">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-ey-green mb-2">
                    {eventsData.participatedEvents.length}
                  </div>
                  <div className="text-sm text-ey-gray-600">Participations</div>
                </CardContent>
              </Card>
              
              <Card className="card-ey text-center">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-ey-purple mb-2">
                    {eventsData.comments.length}
                  </div>
                  <div className="text-sm text-ey-gray-600">Commentaires</div>
                </CardContent>
              </Card>
              
              <Card className="card-ey text-center">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-ey-orange mb-2">
                    {eventsData.approvedParticipations?.length || 0}
                  </div>
                  <div className="text-sm text-ey-gray-600">Approuvées</div>
                </CardContent>
              </Card>
            </div>

            {/* Section d'engagement */}
            <Card className="card-ey">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-ey-black">
                  <Heart className="text-ey-red" size={24} />
                  {isOwnProfile ? 'Votre engagement chez EY' : `L'engagement de ${user.fullName} chez EY`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-1">
                    <p className="text-ey-gray-700 leading-relaxed mb-4">
                      {isOwnProfile ? 'Vous avez' : `${user.fullName} a`} contribué à <span className="font-bold text-ey-accent-blue">{eventsData.organizedEvents.length + eventsData.participatedEvents.length}</span> événements 
                      cette année et {isOwnProfile ? 'avez' : 'a'} partagé <span className="font-bold text-ey-purple">{eventsData.comments.length}</span> commentaires.
                      {isOwnProfile ? ' Continuez à inspirer vos collègues et à faire vivre la culture EY !' : ' Un engagement remarquable pour la culture EY !'}
                    </p>
                    <div className="flex items-center gap-2">
                      <Trophy className="text-ey-yellow" size={20} />
                      <span className="font-bold text-ey-black">{Math.floor(engagementLevel / 10)}</span>
                      <span className="text-ey-gray-600">niveaux d'engagement atteints</span>
                    </div>
                  </div>
                  <div className="bg-gradient-ey-accent text-ey-white p-6 rounded-ey-xl text-center min-w-[200px]">
                    <div className="text-4xl mb-2">🏆</div>
                    <div className="font-bold text-lg">{engagementInfo.label}</div>
                    <div className="text-sm opacity-90">Niveau {Math.floor(engagementLevel / 20) + 1}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Réseau */}
          <TabsContent value="network" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Statistiques du réseau */}
              <Card className="card-ey">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-ey-black">
                    <Users className="text-ey-green" size={20} />
                    Statistiques du réseau
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    
                    {/* Compteurs principaux */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-ey-green/10 rounded-ey-lg">
                        <div className="text-2xl font-bold text-ey-green">
                          {followCounts.followersCount}
                        </div>
                        <div className="text-sm text-ey-gray-600">Abonnés</div>
                      </div>
                      
                      <div className="text-center p-4 bg-ey-accent-blue/10 rounded-ey-lg">
                        <div className="text-2xl font-bold text-ey-accent-blue">
                          {followCounts.followingCount}
                        </div>
                        <div className="text-sm text-ey-gray-600">Abonnements</div>
                      </div>
                    </div>

                    {/* Ratio d'engagement */}
                    <div className="p-4 bg-ey-yellow/10 rounded-ey-lg">
                      <h4 className="font-medium text-ey-black mb-2">
                        Ratio d'engagement
                      </h4>
                      <div className="text-lg font-bold text-ey-yellow">
                        {followCounts.followersCount > 0 
                          ? Math.round((followCounts.followingCount / followCounts.followersCount) * 100)
                          : 0
                        }%
                      </div>
                      <p className="text-sm text-ey-gray-600 mt-1">
                        Taux d'abonnements par rapport aux abonnés
                      </p>
                    </div>

                    {/* Actions rapides */}
                    <div className="flex gap-2">
                      <button
                        onClick={openFollowersModal}
                        className="btn-ey-outline flex-1 text-sm"
                      >
                        Voir les abonnés
                      </button>
                      <button
                        onClick={openFollowingModal}
                        className="btn-ey-outline flex-1 text-sm"
                      >
                        Voir les abonnements
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Connexions récentes */}
              <Card className="card-ey">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-ey-black">
                    <Activity className="text-ey-purple" size={20} />
                    Activité réseau récente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Simulation d'activités réseau récentes */}
                    <div className="flex items-start gap-3 p-3 bg-ey-gray-50 rounded-ey-lg">
                      <div className="w-2 h-2 bg-ey-green rounded-full mt-2 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="text-ey-gray-700">
                          {isOwnProfile 
                            ? 'Vous avez été suivi par 3 nouvelles personnes cette semaine'
                            : `${user.fullName} a gagné 2 nouveaux abonnés cette semaine`
                          }
                        </p>
                        <p className="text-ey-gray-500 text-xs">Il y a 2 jours</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-ey-gray-50 rounded-ey-lg">
                      <div className="w-2 h-2 bg-ey-accent-blue rounded-full mt-2 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="text-ey-gray-700">
                          {isOwnProfile 
                            ? 'Vous avez suivi 5 nouveaux collègues'
                            : `${user.fullName} suit maintenant 3 nouveaux collègues`
                          }
                        </p>
                        <p className="text-ey-gray-500 text-xs">Il y a 1 semaine</p>
                      </div>
                    </div>

                    {/* Bouton pour voir plus */}
                    <button className="w-full text-ey-accent-blue hover:text-ey-accent-blue-dark text-sm font-medium py-2">
                      Voir toute l'activité réseau
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Événements - inchangé */}
          <TabsContent value="events" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Événements organisés */}
              <Card className="card-ey">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-ey-black">
                    <CalendarDays className="text-ey-accent-blue" size={20} />
                    Événements organisés ({eventsData.organizedEvents.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {eventsData.organizedEvents.length > 0 ? (
                    <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-ey">
                      {eventsData.organizedEvents.map((event, index) => (
                        <div key={event.id} className="bg-ey-light-gray rounded-ey-lg p-4 hover:bg-ey-yellow/10 transition-colors">
                          <Link href={`/EyEngage/EmployeeDashboard/events/${event.id}`} className="block">
                            <h4 className="font-semibold text-ey-black hover:text-ey-accent-blue transition-colors">
                              {event.title}
                            </h4>
                            <p className="text-sm text-ey-gray-600 mt-1">
                              {new Date(event.date).toLocaleDateString('fr-FR')} • {event.location}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-ey-gray-500">
                              <span className="flex items-center gap-1">
                                <Users size={12} />
                                {event.participantCount} participants
                              </span>
                              <span className="flex items-center gap-1">
                                <Heart size={12} />
                                {event.interestedCount} intéressés
                              </span>
                            </div>
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-ey-gray-500">
                      <CalendarDays className="mx-auto h-12 w-12 mb-3 opacity-50" />
                      <p>Aucun événement organisé</p>
                      {isOwnProfile && <p className="text-sm mt-1">Créez votre premier événement !</p>}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Participations */}
              <Card className="card-ey">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-ey-black">
                    <Users className="text-ey-green" size={20} />
                    Participations ({eventsData.participatedEvents.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {eventsData.participatedEvents.length > 0 ? (
                    <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-ey">
                      {eventsData.participatedEvents.map((event, index) => (
                        <div key={event.id} className="bg-ey-light-gray rounded-ey-lg p-4 hover:bg-ey-yellow/10 transition-colors">
                          <Link href={`/EyEngage/EmployeeDashboard/events/${event.id}`} className="block">
                            <h4 className="font-semibold text-ey-black hover:text-ey-accent-blue transition-colors">
                              {event.title}
                            </h4>
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-ey-gray-500">
                      <Users className="mx-auto h-12 w-12 mb-3 opacity-50" />
                      <p>Aucune participation</p>
                      {isOwnProfile && <p className="text-sm mt-1">Rejoignez des événements !</p>}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Activité - inchangé */}
          <TabsContent value="activity" className="space-y-6">
            
            {/* Commentaires récents */}
            <Card className="card-ey">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-ey-black">
                  <MessageCircle className="text-ey-purple" size={20} />
                  Commentaires récents ({eventsData.comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {eventsData.comments.length > 0 ? (
                  <div className="space-y-4 max-h-80 overflow-y-auto scrollbar-ey">
                    {eventsData.comments.slice(0, 10).map((comment, index) => (
                      <div key={comment.id} className="border-l-4 border-ey-accent-blue pl-4 py-2">
                        <div className="flex items-center justify-between mb-2">
                          <Link 
                            href={`/EyEngage/EmployeeDashboard/events/${comment.eventId}`}
                            className="font-medium text-ey-black hover:text-ey-accent-blue transition-colors"
                          >
                            {comment.eventTitle}
                          </Link>
                        </div>
                        <p className="text-sm text-ey-gray-700 line-clamp-2">
                          {comment.content}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-ey-gray-500">
                    <MessageCircle className="mx-auto h-12 w-12 mb-3 opacity-50" />
                    <p>Aucun commentaire</p>
                    {isOwnProfile && <p className="text-sm mt-1">Partagez vos idées !</p>}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Graphique d'activité (simulation) */}
            <Card className="card-ey">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-ey-black">
                  <TrendingUp className="text-ey-orange" size={20} />
                  Évolution de l'activité
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-40 bg-ey-light-gray rounded-ey-lg flex items-end justify-center gap-2 p-4">
                  {[...Array(12)].map((_, i) => {
                    const height = Math.random() * 80 + 20;
                    return (
                      <div 
                        key={i}
                        className="bg-ey-accent-blue rounded-t-md flex-1 max-w-6 transition-all hover:bg-ey-yellow cursor-pointer"
                        style={{ height: `${height}%` }}
                        title={`Mois ${i + 1}: ${Math.floor(height / 10)} activités`}
                      />
                    );
                  })}
                </div>
                <p className="text-center text-sm text-ey-gray-500 mt-4">
                  Activité sur les 12 derniers mois
                </p>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>

      {/* Modals des followers/following - CORRIGES */}
      <AnimatePresence>
        {followersModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-ey-white rounded-ey-2xl shadow-ey-2xl max-w-md w-full max-h-[80vh] overflow-hidden"
            >
              <div className="p-6 border-b border-ey-gray-200 bg-gradient-ey-primary">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-ey-black">
                    Abonnés ({followCounts.followersCount})
                  </h3>
                  <button
                    onClick={() => setFollowersModal(false)}
                    className="p-2 hover:bg-ey-black/10 rounded-ey-lg transition-colors"
                  >
                    <X className="w-6 h-6 text-ey-black" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-96">
                {modalLoading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="w-8 h-8 animate-spin text-ey-accent-blue mx-auto mb-3" />
                    <p className="text-ey-gray-600">Chargement des abonnés...</p>
                  </div>
                ) : followers.length > 0 ? (
                  <div className="space-y-4">
                    {followers.map((follower) => (
                      <div key={follower.id} className="flex items-center gap-3 p-3 hover:bg-ey-gray-50 rounded-ey-lg">
                        <div className="w-10 h-10 bg-gradient-ey-primary rounded-full flex items-center justify-center">
                          <span className="text-ey-black font-bold text-sm">
                            {follower.fullName?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-ey-black text-sm">
                            {follower.fullName || 'Utilisateur'}
                          </p>
                          <p className="text-xs text-ey-gray-600">
                            {follower.department || 'Département non spécifié'}
                          </p>
                        </div>
                        <Link
                          href={`/EyEngage/profile/${follower.id}`}
                          className="btn-ey-outline btn-sm"
                        >
                          Voir
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-ey-gray-300 mx-auto mb-3" />
                    <p className="text-ey-gray-500">Aucun abonné pour le moment</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Following */}
      <AnimatePresence>
        {followingModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-ey-white rounded-ey-2xl shadow-ey-2xl max-w-md w-full max-h-[80vh] overflow-hidden"
            >
              <div className="p-6 border-b border-ey-gray-200 bg-gradient-ey-secondary">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-ey-white">
                    Abonnements ({followCounts.followingCount})
                  </h3>
                  <button
                    onClick={() => setFollowingModal(false)}
                    className="p-2 hover:bg-ey-white/10 rounded-ey-lg transition-colors"
                  >
                    <X className="w-6 h-6 text-ey-white" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-96">
                {modalLoading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="w-8 h-8 animate-spin text-ey-accent-blue mx-auto mb-3" />
                    <p className="text-ey-gray-600">Chargement des abonnements...</p>
                  </div>
                ) : following.length > 0 ? (
                  <div className="space-y-4">
                    {following.map((followedUser) => (
                      <div key={followedUser.id} className="flex items-center gap-3 p-3 hover:bg-ey-gray-50 rounded-ey-lg">
                        <div className="w-10 h-10 bg-gradient-ey-primary rounded-full flex items-center justify-center">
                          <span className="text-ey-black font-bold text-sm">
                            {followedUser.fullName?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-ey-black text-sm">
                            {followedUser.fullName || 'Utilisateur'}
                          </p>
                          <p className="text-xs text-ey-gray-600">
                            {followedUser.department || 'Département non spécifié'}
                          </p>
                        </div>
                        <Link
                          href={`/EyEngage/profile/${followedUser.id}`}
                          className="btn-ey-outline btn-sm"
                        >
                          Voir
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-ey-gray-300 mx-auto mb-3" />
                    <p className="text-ey-gray-500">Aucun abonnement pour le moment</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modals de modification - inchangés mais seulement pour son propre profil */}
      {isOwnProfile && (
        <>
          {/* Modal de modification du profil */}
          {editMode && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-ey-white rounded-ey-2xl shadow-ey-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                
                {/* En-tête */}
                <div className="p-6 border-b border-ey-gray-200 bg-gradient-ey-primary">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-ey-black flex items-center gap-2">
                      <Edit size={24} />
                      Modifier le profil
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditMode(false)}
                      className="text-ey-black hover:bg-ey-black/10 rounded-full"
                      disabled={loading}
                    >
                      <X size={20} />
                    </Button>
                  </div>
                </div>
                
                {/* Formulaire */}
                <form onSubmit={handleProfileSubmit} className="p-6 space-y-6">
                  
                  {/* Nom complet */}
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-ey-black font-medium">
                      Nom complet *
                    </Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => {
                        setFormData({ ...formData, fullName: e.target.value });
                        validateProfileField('fullName', e.target.value);
                      }}
                      className={`input-ey ${profileErrors.fullName ? 'input-ey-error' : ''}`}
                      disabled={loading}
                    />
                    {profileErrors.fullName && (
                      <p className="text-ey-red text-sm flex items-center gap-1">
                        <AlertCircle size={14} />
                        {profileErrors.fullName}
                      </p>
                    )}
                  </div>
                  
                  {/* Téléphone */}
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-ey-black font-medium">
                      Numéro de téléphone
                    </Label>
                    <Input
                      id="phoneNumber"
                      value={formData.phoneNumber || ''}
                      onChange={(e) => {
                        setFormData({ ...formData, phoneNumber: e.target.value });
                        validateProfileField('phoneNumber', e.target.value);
                      }}
                      className={`input-ey ${profileErrors.phoneNumber ? 'input-ey-error' : ''}`}
                      placeholder="Ex: 12345678"
                      maxLength={8}
                      disabled={loading}
                    />
                    {profileErrors.phoneNumber && (
                      <p className="text-ey-red text-sm flex items-center gap-1">
                        <AlertCircle size={14} />
                        {profileErrors.phoneNumber}
                      </p>
                    )}
                  </div>
                  
                  {/* Fonction */}
                  <div className="space-y-2">
                    <Label htmlFor="fonction" className="text-ey-black font-medium">
                      Fonction *
                    </Label>
                    <Input
                      id="fonction"
                      value={formData.fonction || ''}
                      onChange={(e) => {
                        setFormData({ ...formData, fonction: e.target.value });
                        validateProfileField('fonction', e.target.value);
                      }}
                      className={`input-ey ${profileErrors.fonction ? 'input-ey-error' : ''}`}
                      disabled={loading}
                    />
                    {profileErrors.fonction && (
                      <p className="text-ey-red text-sm flex items-center gap-1">
                        <AlertCircle size={14} />
                        {profileErrors.fonction}
                      </p>
                    )}
                  </div>
                  
                  {/* Département */}
                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-ey-black font-medium">
                      Département *
                    </Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => {
                        setFormData({ ...formData, department: e.target.value });
                        validateProfileField('department', e.target.value);
                      }}
                      className={`input-ey ${profileErrors.department ? 'input-ey-error' : ''}`}
                      disabled={loading}
                    />
                    {profileErrors.department && (
                      <p className="text-ey-red text-sm flex items-center gap-1">
                        <AlertCircle size={14} />
                        {profileErrors.department}
                      </p>
                    )}
                  </div>
                  
                  {/* Secteur */}
                  <div className="space-y-2">
                    <Label htmlFor="sector" className="text-ey-black font-medium">
                      Secteur
                    </Label>
                    <Input
                      id="sector"
                      value={formData.sector || ''}
                      onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                      className="input-ey"
                      disabled={loading}
                    />
                  </div>
                  
                  {/* Bio */}
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-ey-black font-medium">
                      Biographie
                    </Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="textarea-ey"
                      placeholder="Parlez-nous de vous..."
                      maxLength={300}
                      disabled={loading}
                    />
                    <p className="text-ey-gray-500 text-xs">
                      {bio.length}/300 caractères
                    </p>
                  </div>
                  
                  {/* Boutons */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-ey-gray-200">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditMode(false)}
                      disabled={loading}
                      className="btn-ey-outline"
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="btn-ey-primary min-w-[120px]"
                    >
                      {loading ? (
                        <>
                          <div className="loading-spinner-ey !h-4 !w-4 mr-2" />
                          Enregistrement...
                        </>
                      ) : (
                        <>
                          <Check size={16} className="mr-2" />
                          Enregistrer
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal de changement de mot de passe */}
          {passwordMode && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-ey-white rounded-ey-2xl shadow-ey-2xl max-w-md w-full">
                
                {/* En-tête */}
                <div className="p-6 border-b border-ey-gray-200 bg-gradient-ey-secondary">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-ey-white flex items-center gap-2">
                      <Lock size={24} />
                      Changer le mot de passe
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setPasswordMode(false);
                        setErrorMessage('');
                      }}
                      className="text-ey-white hover:bg-ey-white/10 rounded-full"
                      disabled={loading}
                    >
                      <X size={20} />
                    </Button>
                  </div>
                </div>
                
                {/* Formulaire */}
                <form onSubmit={handlePasswordSubmit} className="p-6 space-y-6">
                  
                  {/* Mot de passe actuel */}
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-ey-black font-medium">
                      Mot de passe actuel *
                    </Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className={`input-ey ${passwordErrors.currentPassword ? 'input-ey-error' : ''}`}
                      disabled={loading}
                    />
                    {passwordErrors.currentPassword && (
                      <p className="text-ey-red text-sm flex items-center gap-1">
                        <AlertCircle size={14} />
                        {passwordErrors.currentPassword}
                      </p>
                    )}
                  </div>
                  
                  {/* Nouveau mot de passe */}
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-ey-black font-medium">
                      Nouveau mot de passe *
                    </Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className={`input-ey ${passwordErrors.newPassword ? 'input-ey-error' : ''}`}
                      disabled={loading}
                    />
                    {passwordErrors.newPassword && (
                      <p className="text-ey-red text-sm flex items-center gap-1">
                        <AlertCircle size={14} />
                        {passwordErrors.newPassword}
                      </p>
                    )}
                    
                    {/* Indicateur de force du mot de passe */}
                    {passwordData.newPassword && (
                      <div className="space-y-2">
                        <div className="flex gap-1">
                          {[...Array(4)].map((_, i) => {
                            const strength = validatePasswordStrength(passwordData.newPassword).strength;
                            const levels = ['weak', 'medium', 'strong', 'very-strong'];
                            const currentLevel = levels.indexOf(strength);
                            return (
                              <div
                                key={i}
                                className={`h-1 flex-1 rounded-full ${
                                  i <= currentLevel
                                    ? currentLevel === 0
                                      ? 'bg-ey-red'
                                      : currentLevel === 1
                                      ? 'bg-ey-orange'
                                      : currentLevel === 2
                                      ? 'bg-ey-yellow'
                                      : 'bg-ey-green'
                                    : 'bg-ey-gray-200'
                                }`}
                              />
                            );
                          })}
                        </div>
                        <p className="text-xs text-ey-gray-600">
                          Force: {validatePasswordStrength(passwordData.newPassword).strength === 'very-strong' ? 'Très forte' : 
                                  validatePasswordStrength(passwordData.newPassword).strength === 'strong' ? 'Forte' :
                                  validatePasswordStrength(passwordData.newPassword).strength === 'medium' ? 'Moyenne' : 'Faible'}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Confirmation */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-ey-black font-medium">
                      Confirmer le nouveau mot de passe *
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className={`input-ey ${passwordErrors.confirmPassword ? 'input-ey-error' : ''}`}
                      disabled={loading}
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="text-ey-red text-sm flex items-center gap-1">
                        <AlertCircle size={14} />
                        {passwordErrors.confirmPassword}
                      </p>
                    )}
                  </div>
                  
                  {/* Message d'erreur global */}
                  {errorMessage && (
                    <div className="p-3 bg-ey-red/10 border border-ey-red/20 rounded-ey-lg text-ey-red text-sm">
                      {errorMessage}
                    </div>
                  )}
                  
                  {/* Avertissement */}
                  <div className="p-3 bg-ey-yellow/10 border border-ey-yellow/20 rounded-ey-lg">
                    <p className="text-ey-black text-sm">
                      ⚠️ Après changement de mot de passe, vous serez déconnecté automatiquement.
                    </p>
                  </div>
                  
                  {/* Boutons */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-ey-gray-200">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setPasswordMode(false);
                        setErrorMessage('');
                      }}
                      disabled={loading}
                      className="btn-ey-outline"
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="btn-ey-danger min-w-[140px]"
                    >
                      {loading ? (
                        <>
                          <div className="loading-spinner-ey !h-4 !w-4 mr-2" />
                          Changement...
                        </>
                      ) : (
                        <>
                          <Lock size={16} className="mr-2" />
                          Changer le mot de passe
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}

      {/* Loading overlay */}
      {loading && (editMode || passwordMode) && isOwnProfile && (
        <EnhancedLoading 
          fullScreen 
          message={editMode ? "Mise à jour du profil..." : "Changement du mot de passe..."} 
          variant="pulse" 
        />
      )}
    </div>
  );
}