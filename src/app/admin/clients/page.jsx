import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import ClientList from './ClientList';

export const metadata = {
  title: 'Clients Management | Admin',
};

export default async function AdminClientsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const clients = await db.client.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return <ClientList initialClients={clients} />;
}
