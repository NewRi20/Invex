const envApiUrl = import.meta.env.VITE_API_URL?.trim();

if (!envApiUrl) {
	// In development, Vite proxy forwards /api/* to the Flask backend.
	// In production, configure VITE_API_URL to your backend host.
	// Keeping '/api' here preserves existing local behavior.
	// Example production value: https://your-backend.onrender.com
	// Requests are still made to /api/* by app code.
	// See normalized handling below when envApiUrl exists.
}

const withoutTrailingSlash = envApiUrl ? envApiUrl.replace(/\/+$/, '') : '';

export const API_BASE_URL = withoutTrailingSlash
	? (/\/api$/i.test(withoutTrailingSlash)
			? withoutTrailingSlash
			: `${withoutTrailingSlash}/api`)
	: '/api';
