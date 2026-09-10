import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { checkRateLimit } from "@/lib/rateLimit";
import { logger } from "@/lib/logger";

export const authOptions = {
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "mecelfab@gmail.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;


        const user = await db.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) return null;

        // If the user signed up via Google, they might not have a password
        if (!user.password) {
          throw new Error("Please sign in with Google.");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) return null;

        return { id: user.id, name: user.name, email: user.email, role: user.role };
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account.provider === "google") {
        // Prevent ATO by checking if email already exists
        const existingUser = await db.user.findUnique({
          where: { email: user.email }
        });

        if (existingUser) {
          // Check if this user already has a Google account linked
          const linkedAccount = await db.account.findFirst({
            where: {
              userId: existingUser.id,
              provider: "google"
            }
          });

          if (!linkedAccount) {
            // An account with this email exists, but no Google account is linked.
            // Deny sign in to prevent account takeover.
            return "/auth/login?error=OAuthAccountNotLinked";
          }
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      // Pass the role & id from user to token
      if (user) {
        token.role = user.role || "CUSTOMER"; // Default to CUSTOMER if not set (for OAuth creation)
        token.id = user.id;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    }
  },
  events: {
    async createUser({ user }) {
      try {
        await db.customer.create({
          data: {
            userId: user.id,
            companyName: user.name || "New Customer",
            contactPerson: user.name || "New Customer",
            email: user.email,
          }
        });
      } catch (error) {
        logger.error("Failed to auto-create Customer record for OAuth user", error, { userId: user.id, email: user.email });
      }
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  }
};

const handler = NextAuth(authOptions);

export const GET = async (req, ctx) => {
  return handler(req, ctx);
};

export const POST = async (req, ctx) => {
  const ip = req.headers.get('x-forwarded-for') || req.ip || '127.0.0.1';
  
  // Rate limit: 10 requests per 5 minutes for Auth API
  if (!checkRateLimit(ip, 10, 5 * 60 * 1000)) {
    logger.warn('Rate limit exceeded on Auth API', { ip });
    return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }), { 
      status: 429,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return handler(req, ctx);
};
