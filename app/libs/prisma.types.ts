import { z } from 'zod';

// User schemas
export const userSchema = z.object({
	id: z.string(),
	email: z.string(),
	name: z.string().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

// Export all schemas
export const schemasPerModel = {
	User: userSchema,
} as const;
