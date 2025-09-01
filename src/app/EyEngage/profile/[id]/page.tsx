import { UserProfileData, UserProfileEvents } from '@/types/types';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ProfileClient from '../ProfileClient';

export const dynamic = 'force-dynamic';

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = cookies();
  const allCookies = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');

  // Récupérer l'utilisateur connecté pour vérifier si c'est son propre profil
  const currentUserRes = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/profile`,
    { headers: { cookie: allCookies }, cache: 'no-store' }
  );

  if (currentUserRes.status === 401) redirect('/auth');
  
  const currentUser: UserProfileData = await currentUserRes.json();
  const isOwnProfile = currentUser.id === id;

  let user: UserProfileData;
  
  if (isOwnProfile) {
    // Si c'est son propre profil, utiliser les données complètes
    user = currentUser;
  } else {
    // Si c'est le profil d'un autre utilisateur, récupérer le profil public
    const publicProfileRes = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/public/${id}`,
      { headers: { cookie: allCookies }, cache: 'no-store' }
    );
    
    if (!publicProfileRes.ok) {
      // Si l'utilisateur n'existe pas, rediriger vers le dashboard
      redirect('/EyEngage/EmployeeDashboard');
    }
    
    user = await publicProfileRes.json();
  }

  // Récupérer les événements de l'utilisateur (propre profil ou autre)
  const eventsRes = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/event/profile-events?userId=${id}`,
    { headers: { cookie: allCookies }, cache: 'no-store' }
  );

  const eventsData: UserProfileEvents = await eventsRes.json();

  return <ProfileClient user={user} eventsData={eventsData} isOwnProfile={isOwnProfile} />;
}