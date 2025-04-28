import assert from 'assert';
import { z } from 'zod';
import { routes } from './routes';
import { RouteConfig } from './types';

export async function fetchRouteWithBody<KEY extends keyof typeof routes>(
	key: KEY,
	input: z.infer<(typeof routes)[KEY]['inputSchema']>
): Promise<z.infer<(typeof routes)[KEY]['outputSchema']>> {
	const config = routes[key];

	// Construct the full URL based on whether the route is external or internal
	let fullUrl: string;
	if (config.isExternal) {
		assert(
			process.env.API_BASE_URL,
			'API_BASE_URL environment variable is not set'
		);
		let urlPath = config.path;
		// Replace path parameters
		Object.entries(input).forEach(([key, value]) => {
			if (urlPath.includes(`:${key}`)) {
				urlPath = urlPath.replace(`:${key}`, String(value));
			}
		});
		fullUrl = new URL(urlPath, process.env.API_BASE_URL).toString();
	} else {
		// For internal routes, use the path as is
		fullUrl = config.path;
	}

	// Setup base headers
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		'Influur-Version': process.env.INFLUUR_VERSION || '1.0.0',
	};

	// Prepare the request
	const requestInit: RequestInit = {
		method: config.method,
		headers: {
			...headers,
			...(config.headers || {}), // Allow route-specific headers to override defaults
		},
	};

	// Handle query parameters for GET requests
	if (config.method === ('GET' as RouteConfig['method'])) {
		const url = new URL(fullUrl);
		Object.entries(input).forEach(([key, value]) => {
			// Only add as query param if it's not a path parameter
			if (value !== undefined && !config.path.includes(`:${key}`)) {
				url.searchParams.append(key, String(value));
			}
		});
		fullUrl = url.toString();
	} else {
		requestInit.body = JSON.stringify(input);
	}

	const response = await fetch(fullUrl, {
		...requestInit,
		cache: 'no-store', // Disable caching by default for API calls
	});

	if (!response.ok) {
		let errorMessage = `${key} API (${fullUrl}) returned ${response.status}`;
		try {
			const errorBody = await response.json();
			errorMessage += ` - ${JSON.stringify(errorBody)}`;
		} catch {
			errorMessage += ` - ${await response.text()}`;
		}
		throw new Error(errorMessage);
	}

	// Check if response is CSV based on Content-Type header
	const isCsvResponse =
		response.headers.get('Content-Type')?.includes('text/csv') ?? false;

	// If route is configured for CSV or Content-Type indicates CSV
	if (isCsvResponse) {
		return config.outputSchema.parse(await response.text());
	}

	return config.outputSchema.parse(await response.json());
}
