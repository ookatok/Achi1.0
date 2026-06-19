import { getSession } from 'auth-astro/server';
import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  // Prevent rewrite redirection loops
  const isInternalRewritten = context.request.headers.get('x-astro-rewritten') === 'true';
  if (isInternalRewritten) {
    return next();
  }

  // 1. Identify static files and API requests to bypass localization routing
  const isStaticOrApi = 
    pathname.startsWith('/_astro/') || 
    pathname.startsWith('/api/') || 
    pathname.startsWith('/assets/') || 
    pathname.includes('.') || 
    pathname.startsWith('/@');

  if (!isStaticOrApi) {
    // 2. Check for locale prefix
    let locale: 'th' | 'en' | null = null;
    let targetPath = pathname;

    if (pathname.startsWith('/th/') || pathname === '/th') {
      locale = 'th';
      targetPath = pathname.substring(3) || '/';
    } else if (pathname.startsWith('/en/') || pathname === '/en') {
      locale = 'en';
      targetPath = pathname.substring(3) || '/';
    }

    if (locale) {
      // Set the 'lang' cookie to match the URL path prefix
      context.cookies.set('lang', locale, {
        path: '/',
        maxAge: 31536000,
        sameSite: 'lax',
      });

      // Define route protection rules on the TARGET path
      const isPrivateRoute = targetPath.startsWith('/profile') || targetPath.startsWith('/admin');
      const isAdminRoute = targetPath.startsWith('/admin');

      if (isPrivateRoute) {
        const session = await getSession(context.request);
        
        if (!session) {
          // User is not signed in - redirect to credentials signin with callbackUrl pointing to the CURRENT prefix path
          return context.redirect(`/${locale}/auth/signin?callbackUrl=${encodeURIComponent(pathname)}`);
        }

        if (isAdminRoute && (session.user as any)?.role !== 'admin') {
          // User is logged in but does not have the admin privilege
          return new Response(`
            <!DOCTYPE html>
            <html lang="${locale}">
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
                  <a href="/${locale}/" class="border border-stone-300 text-stone-600 hover:border-brand-charcoal hover:text-brand-charcoal px-6 py-2.5 rounded-sm text-[10px] uppercase tracking-widest font-semibold transition-all duration-300 text-center">
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
                    window.location.href = "/${locale}/";
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

      // Rewrite the URL internally to the unprefixed target path
      const targetUrl = new URL(`${targetPath}${url.search}`, context.url.origin);
      const headers = new Headers(context.request.headers);
      headers.set('x-astro-rewritten', 'true');

      const requestInit: RequestInit = {
        method: context.request.method,
        headers: headers,
      };

      if (context.request.method !== 'GET' && context.request.method !== 'HEAD' && context.request.body) {
        requestInit.body = context.request.body;
        // @ts-ignore
        requestInit.duplex = 'half';
      }

      return context.rewrite(new Request(targetUrl, requestInit));
    } else {
      // No locale prefix in the URL - redirect to correct prefix based on cookie
      const langCookie = context.cookies.get('lang')?.value;
      const userLang = langCookie === 'en' ? 'en' : 'th';
      return context.redirect(`/${userLang}${pathname}${url.search}`);
    }
  }

  return next();
});
