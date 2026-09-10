'use server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';

export async function addInquiryNote(formData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role === 'CUSTOMER') throw new Error('Unauthorized', { cause: err });

  const inquiryId = formData.get('inquiryId');
  const noteText = formData.get('note');

  if (!noteText || !inquiryId) return;

  await db.inquiryNote.create({
    data: {
      note: noteText,
      inquiryId,
      authorId: session.user.id
    }
  });

  await db.activityLog.create({
    data: {
      action: 'NOTE_ADDED',
      entity: 'INQUIRY',
      entityId: inquiryId,
      userId: session.user.id,
      details: 'Added an internal note.'
    }
  });

  revalidatePath(`/admin/inquiries/${inquiryId}`);
}

export async function updateInquiryStatus(formData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role === 'CUSTOMER') throw new Error('Unauthorized', { cause: err });

  const inquiryId = formData.get('inquiryId');
  const status = formData.get('status');

  if (!status || !inquiryId) return;

  await db.inquiry.update({
    where: { id: inquiryId },
    data: { status }
  });

  await db.activityLog.create({
    data: {
      action: 'STATUS_CHANGED',
      entity: 'INQUIRY',
      entityId: inquiryId,
      userId: session.user.id,
      details: `Changed status to ${status}.`
    }
  });

  revalidatePath(`/admin/inquiries/${inquiryId}`);
  revalidatePath(`/admin/inquiries`);
}
