import type { APIRoute } from 'astro';

export const ALL: APIRoute = async ({ request, params, url }) => {
  const path = params.path || '';

  // Exclude auth routes or proxy them to the local Astro dev/production server (port 4321)
  let targetUrl = '';
  if (path.startsWith('auth/')) {
    const port = process.env.PORT || '4321';
    targetUrl = `http://localhost:${port}/api/${path}`;
  } else {
    // Forward other API requests to the NestJS backend (port 3001)
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    targetUrl = `${backendUrl}/api/${path}`;
  }

  const targetWithSearch = new URL(targetUrl);
  targetWithSearch.search = url.search;

  // Clone headers, excluding the Host header to prevent proxy mismatch
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (key.toLowerCase() !== 'host') {
      headers.set(key, value);
    }
  });

  const init: RequestInit = {
    method: request.method,
    headers,
  };

  // Forward body if not GET/HEAD
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = await request.arrayBuffer();
    // @ts-expect-error: RequestInit duplex option is not recognized by standard types
    init.duplex = 'half';
  }

  try {
    const response = await fetch(targetWithSearch.toString(), init);

    const resHeaders = new Headers();
    response.headers.forEach((value, key) => {
      resHeaders.set(key, value);
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: resHeaders,
    });
  } catch (error) {
    console.error(`[API Proxy Error] Failed to proxy request to ${targetWithSearch.toString()}:`, error);
    return new Response(JSON.stringify({ message: 'Failed to connect to backend service.' }), {
      status: 502,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
