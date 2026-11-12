/*
 * Forwards /api/* to the backend whose address is in the VITE_API_BASE_URL environment variable.
 *
 * Why: the admin session is an HttpOnly cookie. If the browser called the backend's own domain directly, that cookie
 * would be third-party and browsers would not keep or send it. Calling /api on the admin app's own origin and
 * forwarding it here keeps the cookie first-party. The address comes from the environment, so nothing is hardcoded.
 *
 * vercel.json rewrites /api/<anything> to /api/proxy?__path=<anything>; this function rebuilds the real URL.
 */
export const config = { runtime: 'edge' };

const PATH_PARAM = '__path';
const HOP_BY_HOP = ['host', 'connection', 'keep-alive', 'transfer-encoding', 'upgrade', 'te', 'trailer'];

export default async function handler(request: Request): Promise<Response> {
    const base = process.env.VITE_API_BASE_URL;
    if (!base) {
        return json(502, 'The API address is not configured (set VITE_API_BASE_URL in the Vercel project).');
    }

    const incoming = new URL(request.url);
    const rawPath = incoming.searchParams.get(PATH_PARAM) ?? '';
    const segments = rawPath.split('/').filter((segment) => segment.length > 0);
    // Only /api/<segments> is ever forwarded; no way to climb out of it, and the host always comes from the environment.
    if (segments.length === 0 || segments.some((segment) => segment === '.' || segment === '..')) {
        return json(404, 'Not found.');
    }

    incoming.searchParams.delete(PATH_PARAM);
    const query = incoming.searchParams.toString();

    let target: URL;
    try {
        target = new URL(`/api/${segments.map(encodeURIComponent).join('/')}${query ? `?${query}` : ''}`, base);
    } catch {
        return json(502, 'The API address is invalid.');
    }

    const headers = new Headers(request.headers);
    HOP_BY_HOP.forEach((name) => headers.delete(name));

    const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
    // `duplex` is required by the runtime to stream a request body; older DOM typings do not declare it.
    const init: RequestInit & { duplex?: 'half' } = {
        method: request.method,
        headers,
        body: hasBody ? request.body : undefined,
        redirect: 'manual',
        duplex: hasBody ? 'half' : undefined,
    };
    const upstream = await fetch(target, init);

    // The runtime already decoded the body, so the original encoding/length headers no longer describe it.
    const responseHeaders = new Headers(upstream.headers);
    responseHeaders.delete('content-encoding');
    responseHeaders.delete('content-length');

    return new Response(upstream.body, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers: responseHeaders,
    });
}

function json(status: number, message: string): Response {
    return new Response(JSON.stringify({ success: false, message }), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}
