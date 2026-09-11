/**
 * Environment Variable Validator
 * 
 * Validates environment variables at startup.
 * Logs warnings for missing optional variables (Google Auth, SMTP) rather than
 * crashing during static build page collection (e.g. Next.js / Vercel build).
 */

const CRITICAL_VARS = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
];

const OPTIONAL_VARS = [
  'NEXTAUTH_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
];

export function validateEnv() {
  // Never crash during Next.js static build or prerendering
  if (
    process.env.NEXT_PHASE === 'phase-production-build' ||
    process.env.npm_lifecycle_event === 'build'
  ) {
    return;
  }

  const missingCritical = CRITICAL_VARS.filter((key) => !process.env[key]);
  if (missingCritical.length > 0) {
    console.warn(
      `[MECELFAB] WARNING: Missing critical environment variables:\n${missingCritical.map((k) => `  - ${k}`).join('\n')}`
    );
  }

  const missingOptional = OPTIONAL_VARS.filter((key) => !process.env[key]);
  if (missingOptional.length > 0) {
    console.warn(
      `[MECELFAB] NOTICE: Some optional integrations are not configured in environment variables:\n${missingOptional.map((k) => `  - ${k}`).join('\n')}`
    );
  }
}
