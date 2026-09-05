import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import TestimonialList from './TestimonialList';

export const metadata = {
  title: 'Testimonials Management | Admin',
};

export default async function AdminTestimonialsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const testimonials = await db.testimonial.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return <TestimonialList initialTestimonials={testimonials} />;
}
