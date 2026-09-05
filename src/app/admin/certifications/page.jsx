import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import CertificationList from './CertificationList';

export const metadata = {
  title: 'Certifications Management | Admin',
};

export default async function AdminCertificationsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const certifications = await db.certification.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return <CertificationList initialCertifications={certifications} />;
}
