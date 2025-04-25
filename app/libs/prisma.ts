import { PrismaClient } from '@prisma/client';
import { backOff } from 'exponential-backoff';

// Retry the transaction only if the error was due to a write conflict or deadlock
const retryableErrorCodes = ['P2034', 'P2024'];

function createPrismaClient() {
	const prisma = new PrismaClient({
		log:
			process.env.NODE_ENV === 'development'
				? ['query', 'error', 'warn']
				: ['error'],
	});

	// Add retry logic for specific error codes
	return prisma.$extends({
		query: {
			$allModels: {
				$allOperations: async ({ model, operation, args, query }) => {
					return backOff(() => query(args), {
						retry: (error) => {
							const code = error?.code;
							const shouldRetry =
								retryableErrorCodes.includes(code);
							if (shouldRetry) {
								console.warn(
									`Retrying ${model}.${operation} due to error code: ${code}`
								);
							}
							return shouldRetry;
						},
						jitter: 'full',
						numOfAttempts: 3,
					});
				},
			},
		},
	});
}

// Create a singleton instance of PrismaClient
const globalForPrisma = globalThis as unknown as {
	prisma: ReturnType<typeof createPrismaClient> | undefined;
};

const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
	globalForPrisma.prisma = prisma;
}

export default prisma;
