import netlifyAdapter from '@sveltejs/adapter-netlify';
import vercelAdapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: process.env.ADAPTER === 'netlify' ? netlifyAdapter() : vercelAdapter(),
		csp: {
			mode: 'auto',
			directives: {
				'default-src': ["'self'"],
				'script-src': ["'self'", 'https://va.vercel-scripts.com/v1/script.debug.js'],
				'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
				'style-src-elem': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
				'style-src-attr': ["'self'", "'unsafe-inline'"],
				'font-src': ["'self'", 'https://fonts.gstatic.com'],
				'img-src': ["'self'", 'data:'],
				'connect-src': ["'self'"],
				'frame-ancestors': ["'none'"],
				'base-uri': ["'self'"],
				'form-action': ["'self'"]
			}
		}
	}
};

export default config;
