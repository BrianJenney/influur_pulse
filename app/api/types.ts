import { z } from 'zod';

export type RouteConfig = {
	path: string;
	method: 'GET' | 'POST' | 'PUT' | 'DELETE';
	inputSchema: z.ZodTypeAny;
	outputSchema: z.ZodTypeAny;
	tags?: string[];
	headers?: Record<string, string>;
	isExternal?: boolean;
	responseType?: 'json' | 'csv';
};
