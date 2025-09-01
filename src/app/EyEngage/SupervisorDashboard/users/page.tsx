import { cookies } from 'next/headers';
import { UserDto } from '@/dtos/user/UserDto';
import UsersTable from '@/components/user/UserTable';
import RouteGuard from '@/components/RouteGuard';

export default async function UsersPage() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) throw new Error("BACKEND_URL non configuré");

  const cookieStore = cookies();
  const res = await fetch(`${backendUrl}/api/user`, {
    cache: 'no-store',
    headers: { cookie: cookieStore.toString() },
  });

  if (!res.ok) throw new Error(await res.text());

  const initialUsers: UserDto[] = await res.json();

  return( <RouteGuard allowedRoles={["SuperAdmin"]}>
    <UsersTable initialUsers={initialUsers} />;
  </RouteGuard> )
}