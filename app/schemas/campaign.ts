import { z } from 'zod';

export const CampaignPreferencesSchema = z.object({
	gender: z.enum(['male', 'female', 'all']),
	location: z.string(),
	priceRange: z.object({
		min: z.number(),
		max: z.number(),
	}),
	songUrl: z.string().url(),
	goals: z.array(z.string()),
});

export const InfluencerSchema = z.object({
	id: z.string(),
	name: z.string(),
	handle: z.string(),
	followers: z.number(),
	engagement: z.number(),
	gender: z.enum(['male', 'female']),
	location: z.string(),
	pricePerPost: z.number(),
	categories: z.array(z.string()),
});

export const CampaignResponseSchema = z.object({
	influencers: z.array(InfluencerSchema),
	strategy: z.string(),
	songRecommendation: z.string(),
});

export type CampaignPreferences = z.infer<typeof CampaignPreferencesSchema>;
export type Influencer = z.infer<typeof InfluencerSchema>;
export type CampaignResponse = z.infer<typeof CampaignResponseSchema>;
