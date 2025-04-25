import { z } from 'zod';

export type RouteConfig = {
	url?: string;
	path?: string;
	method: string;
	inputSchema: z.ZodTypeAny;
	outputSchema: z.ZodTypeAny;
	tags?: string[];
	headers?: Record<string, string>;
};

export const routes = {
	SEARCH_SONGS: {
		url: '/api/songs',
		method: 'POST',
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
	GET_CREATOR: {
		path: '/pulse/creators/:id',
		method: 'GET',
		inputSchema: z.object({
			id: z.number(),
		}),
		outputSchema: z.any(), // You can replace this with a more specific schema
		headers: {
			Authorization: `Bearer ${process.env.API_ACCESS_TOKEN}`,
		},
	},
} as const satisfies Record<string, RouteConfig>;

export async function fetchRouteWithBody<KEY extends keyof typeof routes>(
	key: KEY,
	input: z.infer<(typeof routes)[KEY]['inputSchema']>
): Promise<z.infer<(typeof routes)[KEY]['outputSchema']>> {
	const config: RouteConfig = routes[key];

	// Determine the base URL and construct the full URL
	let fullUrl: string;
	if (config.url) {
		fullUrl = config.url;
	} else if (config.path) {
		if (!process.env.API_BASE_URL) {
			throw new Error('API_BASE_URL environment variable is not set');
		}
		let urlPath = config.path;
		if (urlPath.includes(':id') && 'id' in input) {
			urlPath = urlPath.replace(':id', input.id.toString());
		}
		fullUrl = new URL(urlPath, process.env.API_BASE_URL).toString();
	} else {
		throw new Error(`Route ${key} must have either url or path defined`);
	}

	// Prepare the request
	const requestInit: RequestInit = {
		method: config.method,
		headers: {
			'Content-Type': 'application/json',
			...(config.headers || {}),
		},
	};

	// Handle GET vs other methods
	if (config.method === 'GET') {
		const url = new URL(fullUrl);
		Object.entries(input).forEach(([key, value]) => {
			if (value !== undefined && key !== 'id') {
				// Skip id as it's in the path
				url.searchParams.append(key, String(value));
			}
		});
		fullUrl = url.toString();
	} else {
		requestInit.body = JSON.stringify(input);
	}

	const response = await fetch(fullUrl, {
		...requestInit,
		next: {
			tags: config.tags,
		},
	});

	if (response.status === 200) {
		return config.outputSchema.parse(await response.json());
	}

	throw new Error(
		`${key} API (${fullUrl}) returned ${
			response.status
		}! ${await response.text()}`
	);
}
