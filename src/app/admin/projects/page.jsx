import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import ProjectList from './ProjectList';

export const metadata = {
  title: 'Projects Management | Admin',
};

export default async function AdminProjectsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const projects = await db.project.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-admin-heading">Projects Management</h1>
        <p className="text-admin-muted text-sm mt-1">Manage case studies and project portfolio.</p>
      </div>
      <ProjectList initialProjects={projects} />
    </div>
  );
}
