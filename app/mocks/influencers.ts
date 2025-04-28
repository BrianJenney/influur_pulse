export interface Influencer {
	id: string;
	name: string;
	followers: number;
	engagementRate: number;
	niche: string;
	location: string;
	price: number;
	website?: string;
}

export const mockInfluencers: Influencer[] = [
	{
		id: '1',
		name: 'DanceKing',
		followers: 1200000,
		engagementRate: 0.05,
		niche: 'Dance',
		location: 'Los Angeles, USA',
		price: 2000,
		website: 'https://example.com/danceking',
	},
	{
		id: '2',
		name: 'MusicLover',
		followers: 800000,
		engagementRate: 0.04,
		niche: 'Music',
		location: 'New York, USA',
		price: 1500,
	},
	{
		id: '3',
		name: 'TrendSetter',
		followers: 2000000,
		engagementRate: 0.06,
		niche: 'Lifestyle',
		location: 'Miami, USA',
		price: 3000,
		website: 'https://example.com/trendsetter',
	},
	{
		id: '4',
		name: 'BeatMaker',
		followers: 500000,
		engagementRate: 0.08,
		niche: 'Music Production',
		location: 'Nashville, USA',
		price: 1000,
	},
	{
		id: '5',
		name: 'ViralCreator',
		followers: 1500000,
		engagementRate: 0.07,
		niche: 'Entertainment',
		location: 'London, UK',
		price: 2500,
		website: 'https://example.com/viralcreator',
	},
];
