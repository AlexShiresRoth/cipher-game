import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event, {
		filterSerializedResponseHeaders: (name) => !['set-cookie'].includes(name),
		transformPageChunk: ({ html }) => {
			// {@html} JSON-LD scripts don't get Kit's CSP nonce automatically
			const nonce = html.match(/<script[^>]*\snonce="([^"]+)"/)?.[1];
			if (!nonce || !html.includes('application/ld+json')) return html;

			return html.replaceAll(
				'<script type="application/ld+json">',
				`<script type="application/ld+json" nonce="${nonce}">`
			);
		}
	});

	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

	return response;
};
