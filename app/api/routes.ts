import { z } from 'zod';

export type RouteConfig = {
	path: string;
	method: 'GET' | 'POST' | 'PUT' | 'DELETE';
	inputSchema: z.ZodTypeAny;
	outputSchema: z.ZodTypeAny;
	tags?: string[];
	headers?: Record<string, string> | null;
	isExternal?: boolean;
};

export const routes = {
	// Internal routes (relative to Next.js app)
	SEARCH_SONGS: {
		path: '/api/songs' as string,
		method: 'POST',
		isExternal: false,
		inputSchema: z.object({
			query: z.string(),
		}),
		outputSchema: z.array(
			z.object({
				id: z.string(),
				name: z.string(),
				artist: z.string(),
				album: z.string().optional(),
				imageUrl: z.string().optional(),
				spotifyUrl: z.string(),
			})
		),
	},

	// External routes (using API_BASE_URL)
	GET_CREATOR: {
		path: '/pulse/creators/:id',
		method: 'GET',
		isExternal: true,
		inputSchema: z.object({
			id: z.number(),
		}),
		outputSchema: z.any(),
		tags: [],
	},
} satisfies Record<string, RouteConfig>;

export async function fetchRouteWithBody<KEY extends keyof typeof routes>(
	key: KEY,
	input: z.infer<(typeof routes)[KEY]['inputSchema']>
): Promise<z.infer<(typeof routes)[KEY]['outputSchema']>> {
	const config = routes[key];

	// Construct the full URL based on whether the route is external or internal
	let fullUrl: string;
	if (config.isExternal) {
		if (!process.env.API_BASE_URL) {
			throw new Error('API_BASE_URL environment variable is not set');
		}
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

	// Prepare the request
	const requestInit: RequestInit = {
		method: config.method,
		headers: {
			'Content-Type': 'application/json',
		},
	};

	// Handle query parameters for GET requests
	if (config.method === 'GET') {
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
	});

	if (!response.ok) {
		throw new Error(
			`${key} API (${fullUrl}) returned ${
				response.status
			}! ${await response.text()}`
		);
	}

	return config.outputSchema.parse(await response.json());
}
