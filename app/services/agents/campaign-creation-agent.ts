import { openai } from '@/app/libs/openai';
import { z } from 'zod';
import { influencers } from '@/app/data/influencers';

export const campaignCreationResponseSchema = z.object({
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
	response: z
		.object({
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
						website: z.string().optional(),
						matchScore: z.number(),
						reasoning: z.string(),
					})
				)
				.min(5)
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
		})
		.optional()
		.nullable(),
});

export type CampaignCreationResponse = z.infer<
	typeof campaignCreationResponseSchema
>;

interface Message {
	role: 'user' | 'assistant';
	content: string;
}

export const callCampaignCreationAgent = async (
	message: string,
	currentPreferences: Partial<
		z.infer<typeof campaignCreationResponseSchema>['updatedPreferences']
	>,
	messageHistory: Message[] = []
) => {
	const missingFields = [
		'gender',
		'location',
		'priceRange',
		'songUrl',
		'goals',
	].filter((field) => !(field in currentPreferences));

	// If we have all requirements, generate the campaign
	if (missingFields.length === 0) {
		return generateCampaign(currentPreferences);
	}

	// Otherwise, continue with requirements gathering
	const response = await openai.chat.completions.create({
		model: 'gpt-4o-mini',
		messages: [
			{
				role: 'system',
				content: `You are a helpful campaign creation assistant that helps users define their TikTok campaign preferences.
Missing information: **${missingFields.join(', ')}**

**Song Selection**
When discussing songs:
• Ask about the type of song they want to promote
• When they provide a song URL, acknowledge it and suggest relevant campaign goals
• Consider the song's genre and style when making suggestions

**Campaign Goals**
Suggest goals based on the song and target audience, such as:
• *Increase song streams*
• *Create viral dance challenge*
• *Build artist awareness*
• *Drive playlist adds*
• *Generate UGC content*

Current preferences:
\`\`\`json
${JSON.stringify(currentPreferences, null, 2)}
\`\`\`

Focus on gathering the missing information in a conversational way. Do not generate campaign suggestions yet.

Your response MUST be a JSON object with this exact format:
{
  "message": "Your message to the user",
  "updatedPreferences": {
    "gender": "male" | "female" | "all" (optional),
    "location": "string" (optional),
    "priceRange": { "min": number, "max": number } (optional),
    "songUrl": "url string" (optional),
    "goals": ["string array"] (optional)
  },
  "complete": false,
  "response": null
}`,
			},
			...messageHistory.map((msg) => ({
				role: msg.role as 'assistant' | 'user',
				content: msg.content,
			})),
			{
				role: 'user',
				content: message,
			},
		],
		response_format: { type: 'json_object' },
	});

	const content = response.choices[0].message.content;
	if (!content) {
		throw new Error('Empty response from campaign creation agent');
	}

	try {
		const parsedContent = JSON.parse(content);
		console.log(
			'Raw content from OpenAI:',
			JSON.stringify(parsedContent, null, 2)
		);

		// If we're in the requirements gathering phase, ensure response is null
		if (!missingFields.length) {
			parsedContent.response = parsedContent.response || null;
		}

		const parsedResponse =
			campaignCreationResponseSchema.safeParse(parsedContent);
		console.log(
			'Schema validation result:',
			JSON.stringify(parsedResponse, null, 2)
		);

		if (!parsedResponse.success) {
			console.error(
				'Schema validation errors:',
				parsedResponse.error.errors
			);
			throw new Error(
				'Invalid response format from campaign creation agent'
			);
		}

		return parsedResponse.data;
	} catch (error) {
		console.error('Error processing agent response:', error);
		throw new Error('Failed to process campaign creation agent response');
	}
};

type CampaignPreferences = NonNullable<
	z.infer<typeof campaignCreationResponseSchema>['updatedPreferences']
>;

const VALID_CREATIVE_TYPES = [
	'dance',
	'lipsync',
	'transition',
	'story',
	'challenge',
	'other',
] as const;
type CreativeType = (typeof VALID_CREATIVE_TYPES)[number];

type PartialCampaignResponse = {
	creativeIdeas?: Array<{
		type?: CreativeType | string;
		[key: string]: unknown;
	}>;
};

function validateCreativeTypes(response: PartialCampaignResponse): void {
	// Skip validation if response or creativeIdeas is not present
	if (!response?.creativeIdeas) {
		return;
	}

	for (const idea of response.creativeIdeas) {
		if (
			!idea.type ||
			!(VALID_CREATIVE_TYPES as readonly string[]).includes(idea.type)
		) {
			console.warn(
				`Invalid creative type "${idea.type}" found, defaulting to "other"`
			);
			idea.type = 'other';
		}
	}
}

async function generateCampaign(preferences: CampaignPreferences) {
	const response = await openai.chat.completions.create({
		model: 'gpt-4o-mini',
		messages: [
			{
				role: 'system',
				content: `You are a campaign generation expert. Based on the provided preferences, generate a complete TikTok campaign strategy.

Current preferences:
\`\`\`json
${JSON.stringify(preferences, null, 2)}
\`\`\`

Available Influencers:
\`\`\`json
${JSON.stringify(influencers, null, 2)}
\`\`\`

Generate a comprehensive campaign including:
1. Select 5-7 most relevant influencers from the provided list, with detailed match reasoning
2. A recommended song snippet (15-30 seconds) with timing and explanation
3. At least 3 creative ideas for content. IMPORTANT: Each idea MUST use EXACTLY one of these content types (no other types allowed):
   - 'dance': Choreographed routines or dance challenges
   - 'lipsync': Lip syncing or singing performances
   - 'transition': Creative video transitions or transformations
   - 'story': Narrative-based content or day-in-life videos
   - 'challenge': Interactive challenges or trends (non-dance)
   - 'other': Any other content type not covered above
   Note: If your idea doesn't fit the exact types above, use 'other' and describe the specific type in the description.
4. Overall campaign strategy

IMPORTANT: 
- Only use influencers from the provided list. Do not make up new ones.
- Creative idea types MUST be exactly one of: 'dance', 'lipsync', 'transition', 'story', 'challenge', or 'other'.
  Any other value will cause an error.

Your response MUST be a JSON object with this exact format:
{
  "message": "Campaign strategy generated successfully!",
  "updatedPreferences": ${JSON.stringify(preferences, null, 2)},
  "complete": true,
  "response": {
    "influencers": [
      {
        "id": "string",
        "name": "string",
        "platform": "string",
        "followers": number,
        "engagementRate": number,
        "niche": "string",
        "location": "string",
        "price": number,
        "website": "string (optional)",
        "matchScore": number,
        "reasoning": "string"
      }
    ],
    "strategy": "string",
    "songSnippet": {
      "startTimestamp": "00:00:15",
      "endTimestamp": "00:00:45",
      "reason": "string"
    },
    "creativeIdeas": [
      {
        "title": "string",
        "description": "string",
        "type": "dance" | "lipsync" | "transition" | "story" | "challenge" | "other",
        "difficulty": "easy" | "medium" | "hard",
        "estimatedViews": number
      }
    ]
  }
}`,
			},
		],
		response_format: { type: 'json_object' },
	});

	const content = response.choices[0].message.content;
	if (!content) {
		throw new Error('Empty response from campaign generation');
	}

	try {
		const parsedContent = JSON.parse(content);
		console.log(
			'Raw content from campaign generation:',
			JSON.stringify(parsedContent, null, 2)
		);

		// Validate and fix creative types before schema validation
		validateCreativeTypes(parsedContent);

		const parsedResponse =
			campaignCreationResponseSchema.safeParse(parsedContent);
		console.log(
			'Campaign generation schema validation:',
			JSON.stringify(parsedResponse, null, 2)
		);

		if (!parsedResponse.success) {
			console.error(
				'Campaign generation validation errors:',
				parsedResponse.error.errors
			);
			throw new Error('Invalid response format from campaign generation');
		}

		return parsedResponse.data;
	} catch (error) {
		console.error('Error processing campaign generation:', error);
		throw new Error('Failed to process campaign generation response');
	}
}
