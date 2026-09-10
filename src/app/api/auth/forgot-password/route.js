import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { sendPasswordResetEmail } from '@/lib/email';
import { checkRateLimit } from '@/lib/rateLimit';
import { logger } from '@/lib/logger';

export async function POST(req) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.ip || '127.0.0.1';
    
    // Rate limit: 3 requests per 15 minutes for Forgot Password API
    if (!checkRateLimit(ip, 3, 15 * 60 * 1000)) {
      logger.warn('Rate limit exceeded on Forgot Password API', { ip });
      return NextResponse.json({ message: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email } });

    // For security reasons, we don't want to confirm whether an email exists or not
    // to prevent email enumeration attacks. We just return success either way.
    if (!user) {
      return NextResponse.json({ message: 'If an account exists, a reset link has been sent.' }, { status: 200 });
    }

    // Delete any existing reset tokens for this user
    await db.resetToken.deleteMany({
      where: { email }
    });

    // Create a new token that expires in 1 hour
    const token = uuidv4();
    const expires = new Date(new Date().getTime() + 1000 * 60 * 60);

    await db.resetToken.create({
      data: {
        email,
        token,
        expires,
      }
    });

    // Send the email
    await sendPasswordResetEmail(email, token);

    return NextResponse.json({ message: 'If an account exists, a reset link has been sent.' }, { status: 200 });
  } catch (error) {
    logger.error('Forgot Password Error', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
