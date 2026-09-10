import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Suspense } from 'react';
import RequestForm from '@/components/portal/RequestForm';
import { Loader2 } from 'lucide-react';

export const metadata = { title: 'New Request | MECELFAB Portal' };

export default async function NewRequestPage() {
  const session = await getServerSession(authOptions);
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-32">
        <Loader2 size={28} className="animate-spin text-zinc-600" />
      </div>
    }>
      <RequestForm session={session} />
    </Suspense>
  );
}
