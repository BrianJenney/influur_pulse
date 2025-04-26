import { z } from 'zod';

export const influencerSchema = z.object({
	id: z.string(),
	name: z.string(),
	platform: z.string(),
	followers: z.number(),
	engagementRate: z.number(),
	niche: z.string(),
	location: z.string(),
	price: z.number(),
	website: z.string().optional(),
});

export const campaignSchema = z.object({
	intent: z.string().min(1, 'Campaign intent is required'),
	budget: z.number().min(1, 'Budget must be greater than 0'),
});

export const agentOutputSchema = z.object({
	recommendations: z.array(
		z.object({
			influencer: z.string(),
			message: z.string(),
			matchScore: z.number(),
			reasoning: z.string(),
		})
	),
});
