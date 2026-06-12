import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params }) => {
  const { path } = params;
  const backendUrl = `${BACKEND_URL}/assets/images/${path}`;
  
  try {
    const res = await fetch(backendUrl);
    if (res.ok) {
      const headers = new Headers();
      headers.set('Content-Type', res.headers.get('Content-Type') || 'image/png');
      headers.set('Cache-Control', 'public, max-age=31536000');
      
      return new Response(res.body, {
        status: 200,
        headers,
      });
    }
  } catch (e) {
    console.error(`[Astro Image Proxy Error] Fetching image from backend failed: ${backendUrl}`, e);
  }
  
  return new Response('Image Not Found', { status: 404 });
};
