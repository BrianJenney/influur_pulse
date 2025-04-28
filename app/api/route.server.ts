import { NextRequest } from 'next/server';
import { ZodError, z } from 'zod';
import { routes } from './routes';
import { RouteConfig } from './types';
export class RouteError extends Error {
	constructor(
		message: string,
		public status: number = 400,
		public errorCode?: string
	) {
		super(message);
	}
}

async function createErrorResponse(
	error: unknown,
	defaultMessage: string = 'An error occurred',
	defaultStatus: number = 500
): Promise<Response> {
	if (error instanceof RouteError) {
		return new Response(
			JSON.stringify({
				error: error.message,
				errorCode: error.errorCode,
			}),
			{
				status: error.status,
				headers: { 'content-type': 'application/json' },
			}
		);
	}

	if (error instanceof ZodError) {
		return new Response(
			JSON.stringify({
				error: 'Invalid input',
				details: error.errors,
			}),
			{
				status: 422,
				headers: { 'content-type': 'application/json' },
			}
		);
	}

	return new Response(
		JSON.stringify({
			error: defaultMessage,
		}),
		{
			status: defaultStatus,
			headers: { 'content-type': 'application/json' },
		}
	);
}

export function createRouteHandler<KEY extends keyof typeof routes>(
	key: KEY,
	handler: (
		input: z.infer<(typeof routes)[KEY]['inputSchema']>
	) => Promise<z.infer<(typeof routes)[KEY]['outputSchema']>>
): (request: NextRequest) => Promise<Response> {
	const config: RouteConfig = routes[key];

	return async (request) => {
		try {
			const input = config.inputSchema.parse(await request.json());

			const result = await handler(input);

			const output = config.outputSchema.parse(result);
			return new Response(JSON.stringify(output), {
				headers: { 'content-type': 'application/json' },
			});
		} catch (error) {
			return createErrorResponse(error);
		}
	};
}
