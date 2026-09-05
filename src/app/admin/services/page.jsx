import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import ServiceList from './ServiceList';

export const metadata = {
  title: 'Services Management | Admin',
};

export default async function AdminServicesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const services = await db.service.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-admin-heading">Services Management</h1>
        <p className="text-admin-muted text-sm mt-1">Manage the core services offered by MECELFAB.</p>
      </div>
      <ServiceList initialServices={services} />
    </div>
  );
}
