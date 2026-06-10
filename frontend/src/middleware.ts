import { getSession } from 'auth-astro/server';
import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const pathname = context.url.pathname;

  // Define route protection rules
  const isPrivateRoute = pathname.startsWith('/profile') || pathname.startsWith('/admin');
  const isAdminRoute = pathname.startsWith('/admin');

  if (isPrivateRoute) {
    const session = await getSession(context.request);
    
    if (!session) {
      // User is not signed in - redirect to credentials signin
      return context.redirect(`/auth/signin?callbackUrl=${encodeURIComponent(pathname)}`);
    }

    if (isAdminRoute && (session.user as any)?.role !== 'admin') {
      // User is logged in but does not have the admin privilege
      return new Response('Forbidden: Admin access only.', { status: 403 });
    }
  }

  return next();
});
