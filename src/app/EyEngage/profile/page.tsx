import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ProfileRedirectPage() {
  const cookieStore = cookies();
  const allCookies = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');

  // Récupérer l'utilisateur connecté
  const profileRes = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/profile`,
    { headers: { cookie: allCookies }, cache: 'no-store' }
  );

  if (profileRes.status === 401) {
    redirect('/auth');
  }

  if (!profileRes.ok) {
    redirect('/EyEngage/EmployeeDashboard');
  }

  const user = await profileRes.json();
  
  // Rediriger vers le profil de l'utilisateur connecté
  redirect(`/EyEngage/profile/${user.id}`);
}