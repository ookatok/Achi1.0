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
      return new Response(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Access Denied | ACHI Studio</title>
          <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,600&display=swap" rel="stylesheet">
          <script src="https://cdn.tailwindcss.com"></script>
          <script>
            tailwind.config = {
              theme: {
                extend: {
                  colors: {
                    'brand-charcoal': '#1F1F1F',
                    'brand-gold': '#D4AF37'
                  },
                  fontFamily: {
                    serif: ['Playfair Display', 'serif'],
                    sans: ['Outfit', 'sans-serif']
                  }
                }
              }
            }
          </script>
        </head>
        <body class="bg-[#FAF9F6] text-brand-charcoal min-h-screen flex flex-col justify-center items-center px-6 font-sans">
          <div class="max-w-md w-full text-center space-y-6 bg-white p-10 border border-stone-200 shadow-sm rounded-sm">
            <h1 class="font-serif text-3xl uppercase tracking-widest text-brand-charcoal">Access Denied</h1>
            <p class="text-[10px] uppercase tracking-widest text-stone-400 font-semibold font-sans">Admin Role Required</p>
            <div class="text-xs text-stone-600 font-light leading-relaxed">
              Your account (<span class="font-medium text-brand-charcoal">${session.user?.email}</span>) does not have administrative permissions. Please sign out and log in with an authorized admin account.
            </div>
            <div class="pt-6 border-t border-stone-100 flex flex-col sm:flex-row gap-3 justify-center">
              <a href="/" class="border border-stone-300 text-stone-600 hover:border-brand-charcoal hover:text-brand-charcoal px-6 py-2.5 rounded-sm text-[10px] uppercase tracking-widest font-semibold transition-all duration-300 text-center">
                Go Home
              </a>
              <button id="auth-signout-btn" class="bg-brand-charcoal text-white hover:bg-stone-800 px-6 py-2.5 rounded-sm text-[10px] uppercase tracking-widest font-semibold transition-all duration-300 cursor-pointer text-center">
                Sign Out
              </button>
            </div>
          </div>
          
          <script>
            document.getElementById('auth-signout-btn').addEventListener('click', async () => {
              try {
                // Fetch CSRF token for NextAuth/Auth.js signout POST request
                const csrfRes = await fetch('/api/auth/csrf');
                const csrfData = await csrfRes.json();
                
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = '/api/auth/signout';
                
                const csrfInput = document.createElement('input');
                csrfInput.type = 'hidden';
                csrfInput.name = 'csrfToken';
                csrfInput.value = csrfData.csrfToken;
                
                form.appendChild(csrfInput);
                document.body.appendChild(form);
                form.submit();
              } catch (e) {
                console.error("Sign out failed:", e);
                // Fallback to client-side callback URL reload
                window.location.href = "/";
              }
            });
          </script>
        </body>
        </html>
      `, {
        status: 403,
        headers: { 'Content-Type': 'text/html' }
      });
    }
  }

  return next();
});
