/**
 * MECELFAB — Authoritative Role-Permission Matrix
 *
 * This is the SINGLE SOURCE OF TRUTH for what each role can do.
 * 
 * Rules:
 * - UI must never be the only gate (sidebars hidden ≠ secured)
 * - Every server action / API must call `checkPermission()` before executing
 * - Never grant access based on client-supplied role values
 *
 * Role hierarchy (descending privilege):
 *   SUPER_ADMIN > ADMIN > MANAGER > STAFF > TECHNICIAN > CUSTOMER
 */

export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  STAFF: 'STAFF',
  TECHNICIAN: 'TECHNICIAN',
  CUSTOMER: 'CUSTOMER',
};

/**
 * Permission definitions.
 * Each permission maps to an array of roles that may perform it.
 */
export const PERMISSIONS = {
  // ── Users & Settings ─────────────────────────────────────────────────────
  'users:read':             ['SUPER_ADMIN', 'ADMIN'],
  'users:write':            ['SUPER_ADMIN', 'ADMIN'],
  'users:delete':           ['SUPER_ADMIN'],
  'settings:read':          ['SUPER_ADMIN', 'ADMIN'],
  'settings:write':         ['SUPER_ADMIN', 'ADMIN'],

  // ── CMS Content ──────────────────────────────────────────────────────────
  'cms:read':               ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
  'cms:write':              ['SUPER_ADMIN', 'ADMIN'],
  'projects:write':         ['SUPER_ADMIN', 'ADMIN'],
  'services:write':         ['SUPER_ADMIN', 'ADMIN'],
  'testimonials:write':     ['SUPER_ADMIN', 'ADMIN'],
  'certifications:write':   ['SUPER_ADMIN', 'ADMIN'],
  'clients:write':          ['SUPER_ADMIN', 'ADMIN'],

  // ── CRM / Inquiries ───────────────────────────────────────────────────────
  'inquiries:read':         ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF'],
  'inquiries:write':        ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF'],
  'inquiries:delete':       ['SUPER_ADMIN', 'ADMIN'],

  // ── Quotations ────────────────────────────────────────────────────────────
  'quotations:read':        ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF'],
  'quotations:create':      ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
  'quotations:status':      ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
  'quotations:convert':     ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
  'quotations:delete':      ['SUPER_ADMIN', 'ADMIN'],

  // ── Work Orders ───────────────────────────────────────────────────────────
  'workorders:read':        ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF', 'TECHNICIAN'],
  'workorders:create':      ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
  'workorders:write':       ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF'],
  'workorders:assign':      ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
  'workorders:delete':      ['SUPER_ADMIN', 'ADMIN'],

  // ── Inventory ─────────────────────────────────────────────────────────────
  'inventory:read':         ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF', 'TECHNICIAN'],
  'inventory:issue':        ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF', 'TECHNICIAN'],
  'inventory:return':       ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF', 'TECHNICIAN'],
  'inventory:receive':      ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF'],
  'inventory:adjust':       ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
  'inventory:write':        ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],

  // ── Field Service / AMC ───────────────────────────────────────────────────
  'fieldservice:read':      ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF', 'TECHNICIAN'],
  'fieldservice:assign':    ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
  'fieldservice:execute':   ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF', 'TECHNICIAN'],
  'amc:read':               ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF'],
  'amc:write':              ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],

  // ── Billing / Invoices ────────────────────────────────────────────────────
  'billing:read':           ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF'],
  'billing:create':         ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
  'billing:payment':        ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
  'billing:cancel':         ['SUPER_ADMIN', 'ADMIN'],

  // ── Dashboard ─────────────────────────────────────────────────────────────
  'dashboard:read':         ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF', 'TECHNICIAN'],

  // ── Customer Portal (own records only) ───────────────────────────────────
  'portal:read':            ['CUSTOMER'],
  'portal:write':           ['CUSTOMER'],

  // ── Documents / Equipment ─────────────────────────────────────────────────
  'documents:read':         ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
  'equipment:read':         ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF', 'TECHNICIAN'],
  'equipment:write':        ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
};

/**
 * Check if a user role has a specific permission.
 *
 * @param {string} role - The user's role from the database session
 * @param {string} permission - The permission key from PERMISSIONS
 * @returns {boolean}
 *
 * @example
 * if (!hasPermission(user.role, 'billing:create')) {
 *   return { success: false, error: 'Unauthorized' };
 * }
 */
export function hasPermission(role, permission) {
  const allowedRoles = PERMISSIONS[permission];
  if (!allowedRoles) {
    // Unknown permission — deny by default
    console.error(`[RBAC] Unknown permission requested: '${permission}'`);
    return false;
  }
  return allowedRoles.includes(role);
}

/**
 * Server-side permission assertion.
 * Throws an error if the role does not have the required permission.
 * Use this inside server actions and API routes.
 *
 * @param {string} role
 * @param {string} permission
 *
 * @example
 * assertPermission(user.role, 'quotations:create');
 */
export function assertPermission(role, permission) {
  if (!hasPermission(role, permission)) {
    throw new Error(
      `Forbidden: Role '${role}' does not have permission '${permission}'.`
    );
  }
}
