import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ message: 'Token is required' }, { status: 400 });
    }

    const verificationToken = await db.verificationToken.findUnique({
      where: { token }
    });

    if (!verificationToken) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 400 });
    }

    if (new Date() > new Date(verificationToken.expires)) {
      return NextResponse.json({ message: 'Token has expired' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email: verificationToken.email }
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 400 });
    }

    // Verify the user's email
    await db.user.update({
      where: { email: verificationToken.email },
      data: { emailVerified: new Date() }
    });

    // Delete the token
    await db.verificationToken.delete({
      where: { id: verificationToken.id }
    });

    return NextResponse.json({ message: 'Email verified successfully' }, { status: 200 });
  } catch (error) {
    console.error('Verify Email Error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
