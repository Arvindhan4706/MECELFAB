import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import ServiceRequestForm from './ServiceRequestForm';

export const metadata = {
  title: 'Raise Service Request | Customer Portal | MECELFAB',
};

export default async function NewServiceRequestPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect('/api/auth/signin?callbackUrl=/portal');

  const customer = await db.customer.findUnique({
    where: { userId: session.user.id },
  });

  if (!customer) redirect('/portal');

  const resolvedParams = await searchParams;
  const preselectedEquipmentId = resolvedParams?.equipmentId || '';

  // STRICT ISOLATION: Scoped to this customer's machinery only
  const equipmentList = await db.equipment.findMany({
    where: { customerId: customer.id },
    orderBy: { type: 'asc' },
    select: {
      id: true,
      type: true,
      model: true,
      serialNumber: true,
      location: true,
    },
  });

  return (
    <ServiceRequestForm
      equipmentList={equipmentList}
      preselectedEquipmentId={preselectedEquipmentId}
    />
  );
}
