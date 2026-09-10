import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * Health Check Endpoint: GET /api/health
 * 
 * Returns the operational status of the application and its dependencies.
 * Safe to expose publicly — reveals NO secrets, credentials, or internal IDs.
 * 
 * Use this for:
 * - Uptime monitoring (UptimeRobot, BetterStack, etc.)
 * - Vercel health checks
 * - Deployment smoke tests
 */
export async function GET() {
  const startTime = Date.now();
  const checks = {};
  let overallStatus = 'ok';

  // 1. Check database connectivity
  try {
    await db.$queryRaw`SELECT 1`;
    checks.database = { status: 'ok' };
  } catch (err) {
    checks.database = { status: 'error', message: 'Database unreachable' };
    overallStatus = 'degraded';
  }

  // 2. Check environment completeness
  const requiredVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'SMTP_USER',
    'GOOGLE_CLIENT_ID',
  ];
  const missingVars = requiredVars.filter((k) => !process.env[k]);
  if (missingVars.length > 0) {
    // Report missing KEY NAMES only — never values
    checks.environment = { status: 'error', missing: missingVars.length };
    overallStatus = 'degraded';
  } else {
    checks.environment = { status: 'ok' };
  }

  const responseTime = Date.now() - startTime;

  const body = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    responseTimeMs: responseTime,
    checks,
  };

  return NextResponse.json(body, {
    status: overallStatus === 'ok' ? 200 : 503,
  });
}
