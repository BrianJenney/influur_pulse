import { createRouteHandler } from '../../route.server';
import { callCampaignCreationAgent } from '@/app/services/agents/campaign-creation-agent';
import { callInfluencerRecommenderAgent } from '@/app/services/agents/influencer-recommender-agent';
import { influencers } from '@/app/data/influencers';

export const POST = createRouteHandler(
	'CAMPAIGN_AGENT',
	async ({ message, preferences, messageHistory }) => {
		try {
			const agentResponse = await callCampaignCreationAgent(
				message,
				preferences,
				messageHistory
			);

			if (!agentResponse) {
				throw new Error(
					'Failed to get response from campaign creation agent'
				);
			}

			if (agentResponse.complete) {
				const campaign = {
					intent:
						agentResponse.updatedPreferences.goals?.join(', ') ||
						'',
					budget:
						agentResponse.updatedPreferences.priceRange?.max || 0,
					songUrl: agentResponse.updatedPreferences.songUrl,
				};

				const recommendations = await callInfluencerRecommenderAgent(
					influencers.map((inf) => ({
						...inf,
						platform: 'TikTok',
						niche: inf.niche,
						engagementRate: inf.engagementRate,
						price: inf.price,
					})),
					campaign
				);

				if (!recommendations) {
					throw new Error(
						'Failed to get recommendations from influencer agent'
					);
				}

				return {
					message: agentResponse.message,
					updatedPreferences: agentResponse.updatedPreferences,
					complete: true,
					response: {
						influencers: recommendations.recommendations.map(
							(rec) => ({
								...influencers.find(
									(inf) => inf.name === rec.influencer
								)!,
								platform: 'TikTok',
								matchScore: rec.matchScore,
								reasoning: rec.reasoning,
							})
						),
						strategy:
							agentResponse.response?.strategy ||
							'No strategy provided.',
						songSnippet: agentResponse.response?.songSnippet || {
							startTimestamp: '00:00:00',
							endTimestamp: '00:00:30',
							reason: 'Default 30-second snippet from the start of the song.',
						},
						creativeIdeas: agentResponse.response
							?.creativeIdeas || [
							{
								title: 'Basic Dance Challenge',
								description:
									'Create a simple dance routine to the song.',
								type: 'dance',
								difficulty: 'easy',
								estimatedViews: 100000,
							},
						],
					},
				};
			}

			return {
				message: agentResponse.message,
				updatedPreferences: agentResponse.updatedPreferences,
				complete: false,
				response: null,
			};
		} catch (error) {
			console.error('Error in campaign agent:', error);
			throw error;
		}
	}
);
