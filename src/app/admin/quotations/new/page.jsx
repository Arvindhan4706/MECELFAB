import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import QuotationCreateForm from './QuotationCreateForm';

export const metadata = {
  title: 'Create Quotation | Admin | MECELFAB',
};

export default async function NewQuotationPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const customers = await db.customer.findMany({
    orderBy: { companyName: 'asc' },
    select: {
      id: true,
      companyName: true,
      contactPerson: true,
      email: true,
      phone: true,
      location: true,
    },
  });

  const inquiries = await db.inquiry.findMany({
    where: {
      status: { in: ['NEW', 'IN_REVIEW', 'QUOTATION', 'NEGOTIATION'] },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: {
      id: true,
      referenceNumber: true,
      name: true,
      company: true,
      email: true,
      phone: true,
      service: true,
      message: true,
      location: true,
    },
  });

  return <QuotationCreateForm customers={customers} inquiries={inquiries} />;
}
