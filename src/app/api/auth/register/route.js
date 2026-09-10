import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { checkRateLimit } from '@/lib/rateLimit';
import { logger } from '@/lib/logger';

export async function POST(req) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.ip || '127.0.0.1';
    
    // Rate limit: 3 requests per 10 minutes for Registration API
    if (!checkRateLimit(ip, 3, 10 * 60 * 1000)) {
      logger.warn('Rate limit exceeded on Registration API', { ip });
      return NextResponse.json({ message: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ message: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'An account with this email already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'CUSTOMER',
      },
    });

    // Automatically create a Customer record linked to this user
    await db.customer.create({
      data: {
        userId: user.id,
        companyName: name, // Default to their name for now
        contactPerson: name,
        email: email,
      },
    });

    const { v4: uuidv4 } = await import('uuid');
    const { sendVerificationEmail } = await import('@/lib/email');
    
    const token = uuidv4();
    const expires = new Date(new Date().getTime() + 1000 * 60 * 60 * 24); // 24 hours

    await db.verificationToken.create({
      data: {
        email,
        token,
        expires,
      }
    });

    await sendVerificationEmail(email, token);

    return NextResponse.json(
      { message: 'Account created successfully', userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Registration Error', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
