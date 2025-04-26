import { openai } from '@/app/libs/openai';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';
import { influencerSchema } from '@/app/schemas/influencer';
import { campaignSchema } from '@/app/schemas/influencer';
import { agentOutputSchema } from '@/app/schemas/influencer';

type Influencer = z.infer<typeof influencerSchema>;
type Campaign = z.infer<typeof campaignSchema>;

export const callInfluencerRecommenderAgent = async (
	influencers: Influencer[],
	campaign: Campaign
) => {
	const response = await openai.beta.chat.completions.parse({
		model: 'gpt-4o-mini',
		response_format: zodResponseFormat(
			agentOutputSchema,
			'influencerRecommendations'
		),
		messages: [
			{
				role: 'system',
				content: `
        You are an expert influencer marketing agent that recommends the best influencers for a campaign.
        
        Your task is to analyze the provided influencers and recommend the best matches based on:
        - Campaign intent
        - Budget constraints
        - Influencer metrics (followers, engagement rate)
        - Niche alignment
        - Location relevance
        
        You will respond in a JSON structure like this:

            {
              "influencer": "influencerName",
              "message": "Detailed recommendation message",
              "matchScore": 0.95,
              "reasoning": "Why this influencer is a good match"
            }
        
        Format the "message" field in markdown with light formatting.
        The matchScore should be between 0 and 1, where 1 is a perfect match.
        `,
			},
			{
				role: 'user',
				content: `
        Campaign Details:
        Intent: ${campaign.intent}
        Budget: $${campaign.budget}
        
        Available Influencers:
        ${JSON.stringify(influencers, null, 2)}
        `,
			},
		],
	});

	return response.choices[0].message.parsed;
};
