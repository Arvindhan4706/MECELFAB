/**
 * Environment Variable Validator
 * 
 * Validates all required env vars at startup.
 * The app will throw clearly at boot if a critical variable is missing.
 * Values are NEVER logged — only key names.
 */

const REQUIRED_VARS = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
];

export function validateEnv() {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `[MECELFAB] STARTUP FAILED: Missing required environment variables:\n${missing.map((k) => `  - ${k}`).join('\n')}\n\nPlease set these in your .env file before starting the application.`
    );
  }
}
