import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth;
    const { pathname } = req.nextUrl;

    if (pathname === "/admin/login" && token) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    const isApiRoute = pathname.startsWith("/api/");

    // Role-based protection for /admin and /api/admin routes
    if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
      if (!token) {
        if (isApiRoute) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }

      // Customers should not access admin panel or admin APIs
      if (token.role === "CUSTOMER") {
        if (isApiRoute) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        return NextResponse.redirect(new URL("/portal", req.url));
      }

      // RBAC Checks for restricted admin routes
      if (
        (pathname.startsWith("/admin/users") ||
         pathname.startsWith("/admin/settings") ||
         pathname.startsWith("/admin/activity") ||
         pathname.startsWith("/admin/content") ||
         pathname.startsWith("/api/admin/users") ||
         pathname.startsWith("/api/admin/settings") ||
         pathname.startsWith("/api/admin/media") ||
         pathname.startsWith("/api/admin/content")) &&
        token?.role !== "SUPER_ADMIN" && token?.role !== "ADMIN"
      ) {
        if (isApiRoute) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
    }

    // Role-based protection for /portal and /api/portal routes
    if (pathname.startsWith("/portal") || pathname.startsWith("/api/portal")) {
      if (!token) {
        if (isApiRoute) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        return NextResponse.redirect(new URL("/api/auth/signin?callbackUrl=/portal", req.url));
      }

      // Non-customers shouldn't typically access portal unless they are admins impersonating?
      // The requirement says: "Customers cannot access administrative pages. Technicians cannot access unauthorized administrative functionality."
      // And "CUSTOMER A -> CUSTOMER B" lateral movement is prevented.
      // Let's enforce that only CUSTOMER role can access portal.
      if (token.role !== "CUSTOMER") {
        if (isApiRoute) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: () => true, // We handle authorization logic above to allow redirects instead of generic 401s
    },
    pages: {
      signIn: '/admin/login',
    }
  }
);

export const config = {
  matcher: ['/admin/:path*', '/portal/:path*', '/api/admin/:path*', '/api/portal/:path*'],
};
