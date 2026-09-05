import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import InvoiceCreateForm from './InvoiceCreateForm';

export const metadata = {
  title: 'Create Invoice | Admin | MECELFAB',
};

export default async function NewInvoicePage() {
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

  const workOrders = await db.workOrder.findMany({
    where: {
      status: { not: 'CLOSED' },
    },
    orderBy: { createdAt: 'desc' },
    include: {
      customer: true,
      quotation: {
        include: { items: true },
      },
    },
  });

  const quotations = await db.quotation.findMany({
    where: {
      status: 'ACCEPTED',
    },
    orderBy: { createdAt: 'desc' },
    include: {
      items: true,
    },
  });

  return (
    <InvoiceCreateForm
      customers={customers}
      workOrders={workOrders}
      quotations={quotations}
    />
  );
}
