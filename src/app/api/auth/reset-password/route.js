import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ message: 'Missing token or password' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ message: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const resetToken = await db.resetToken.findUnique({
      where: { token }
    });

    if (!resetToken) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 400 });
    }

    if (new Date() > new Date(resetToken.expires)) {
      return NextResponse.json({ message: 'Token has expired' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email: resetToken.email }
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password
    await db.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword }
    });

    // Delete the token so it can't be used again
    await db.resetToken.delete({
      where: { id: resetToken.id }
    });

    return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Reset Password Error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
