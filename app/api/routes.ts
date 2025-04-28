import { z } from 'zod';
import { messageSchema } from '../schemas/message';
import { RouteConfig } from './types';

export const routes = {
	// Internal routes (relative to Next.js app)
	SEARCH_SONGS: {
		path: '/api/songs' as string,
		method: 'POST',
		isExternal: false,
		headers: {},
		responseType: 'json',
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

	CAMPAIGN_AGENT: {
		path: '/api/campaign/agent',
		method: 'POST',
		isExternal: false,
		headers: {},
		responseType: 'json',
		inputSchema: z.object({
			message: z.string(),
			messageHistory: z.array(messageSchema),
			preferences: z.object({
				gender: z.enum(['male', 'female', 'all']).optional().nullable(),
				location: z.string().optional().nullable(),
				priceRange: z
					.object({
						min: z.number(),
						max: z.number(),
					})
					.optional()
					.nullable(),
				songUrl: z.string().url().optional().nullable(),
				goals: z.array(z.string()).optional().nullable(),
			}),
		}),
		outputSchema: z.object({
			message: z.string(),
			updatedPreferences: z.object({
				gender: z.enum(['male', 'female', 'all']).optional().nullable(),
				location: z.string().optional().nullable(),
				priceRange: z
					.object({
						min: z.number(),
						max: z.number(),
					})
					.optional()
					.nullable(),
				songUrl: z.string().url().optional().nullable(),
				goals: z.array(z.string()).optional().nullable(),
			}),
			complete: z.boolean(),
			response: z.union([
				z.object({
					influencers: z
						.array(
							z.object({
								id: z.string(),
								name: z.string(),
								platform: z.string(),
								followers: z.number(),
								engagementRate: z.number(),
								niche: z.string(),
								location: z.string(),
								price: z.number(),
								website: z.string().nullish(),
								image: z.string(),
								handle: z.string(),
								matchScore: z.number(),
								reasoning: z.string(),
							})
						)
						.max(7),
					strategy: z.string(),
					songSnippet: z.object({
						startTimestamp: z.string().regex(/^\d{2}:\d{2}:\d{2}$/),
						endTimestamp: z.string().regex(/^\d{2}:\d{2}:\d{2}$/),
						reason: z.string(),
					}),
					creativeIdeas: z
						.array(
							z.object({
								title: z.string(),
								description: z.string(),
								type: z.enum([
									'dance',
									'lipsync',
									'transition',
									'story',
									'challenge',
									'other',
								]),
								difficulty: z.enum(['easy', 'medium', 'hard']),
								estimatedViews: z.number(),
							})
						)
						.min(3),
				}),
				z.null(),
			]),
		}),
	},

	// External routes (using API_BASE_URL)
	REGISTER: {
		path: '/api/user/register',
		method: 'POST',
		isExternal: true,
		headers: {},
		responseType: 'json',
		inputSchema: z.object({
			pulseUserEmail: z.string().email(),
			pulseUserName: z.string(),
			password: z.string(),
		}),
		outputSchema: z.object({
			message: z.string(),
			detail: z
				.object({
					id: z.number(),
					email: z.string().email(),
					name: z.string(),
					token: z.string(),
					image: z.string().nullable(),
					country: z.string().nullable(),
				})
				.optional(),
		}),
	},
} satisfies Record<string, RouteConfig>;
