import { z } from 'zod';

export const userSchema = z.object({
	id: z.string(),
	email: z.string(),
	name: z.string().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const schemasPerModel = {
	User: userSchema,
} as const;
