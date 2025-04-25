import prisma from '@/app/libs/prisma';
import { parsePriceRange } from '@/app/libs/utils/price';
import { prismaToPOJO } from '@/app/utils/nextjs';
import { users_report } from '@prisma/client';

type SearchParams = {
	gender?: string;
	minPrice?: string;
	maxPrice?: string;
};

type UserReport = Pick<
	users_report,
	| 'id'
	| 'user_id'
	| 'user_name'
	| 'full_name'
	| 'gender'
	| 'price'
	| 'profile_pic'
	| 'tiktok_followers'
	| 'instagram_followers'
	| 'youtube_followers'
	| 'last_location'
	| 'verified'
>;

async function getFilteredInfluencers(
	searchParams: SearchParams
): Promise<UserReport[]> {
	const { gender, minPrice = '0', maxPrice = '1000000' } = await searchParams;

	const minPriceNum = parseInt(minPrice);
	const maxPriceNum = parseInt(maxPrice);

	const potentialInfluencers = await prismaToPOJO(
		prisma.users_report.findMany({
			where: {
				brand: false,
				gender: gender
					? {
							equals: gender,
					  }
					: undefined,
				deleted: false,
			},
			select: {
				id: true,
				user_id: true,
				user_name: true,
				full_name: true,
				gender: true,
				price: true,
				profile_pic: true,
				tiktok_followers: true,
				instagram_followers: true,
				youtube_followers: true,
				last_location: true,
				verified: true,
			},
			// Increase the initial pool size to allow for better filtering
			take: 100,
		})
	);

	// Filter influencers based on price range
	const priceFilteredInfluencers = potentialInfluencers.filter(
		(influencer) => {
			if (
				!influencer.price ||
				influencer.price.toLowerCase() === 'unknown'
			) {
				return true;
			}

			const priceRange = parsePriceRange(influencer.price);
			if (!priceRange) return true;

			return (
				priceRange.min <= maxPriceNum && priceRange.max >= minPriceNum
			);
		}
	);

	// Sort by follower count (prioritize those with more followers)
	const sortedInfluencers = priceFilteredInfluencers.sort(
		(a: UserReport, b: UserReport) => {
			const aFollowers = Math.max(
				parseInt(a.tiktok_followers?.replace(/,/g, '') || '0'),
				parseInt(a.instagram_followers?.replace(/,/g, '') || '0'),
				parseInt(a.youtube_followers?.replace(/,/g, '') || '0')
			);
			const bFollowers = Math.max(
				parseInt(b.tiktok_followers?.replace(/,/g, '') || '0'),
				parseInt(b.instagram_followers?.replace(/,/g, '') || '0'),
				parseInt(b.youtube_followers?.replace(/,/g, '') || '0')
			);
			return bFollowers - aFollowers;
		}
	);

	return sortedInfluencers.slice(0, 20);
}

export default async function NewCampaignPage({
	searchParams,
}: {
	searchParams: SearchParams;
}) {
	const influencers = await getFilteredInfluencers(searchParams);

	return (
		<div className='container mx-auto px-4 py-8'>
			<h1 className='text-3xl font-bold mb-8'>Create New Campaign</h1>

			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
				{influencers.map((influencer) => (
					<div
						key={influencer.id.toString()}
						className='bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow'
					>
						<div className='flex items-center gap-4'>
							{influencer.profile_pic && (
								<img
									src={influencer.profile_pic}
									alt={influencer.full_name || 'Influencer'}
									className='w-16 h-16 rounded-full'
								/>
							)}
							<div>
								<h3 className='font-semibold'>
									{influencer.full_name}
								</h3>
								<p className='text-gray-600'>
									@{influencer.user_name}
								</p>
							</div>
						</div>

						<div className='mt-4 space-y-2'>
							<p className='text-sm'>
								<span className='font-medium'>Price:</span>{' '}
								{influencer.price || 'Unknown'}
							</p>
							<p className='text-sm'>
								<span className='font-medium'>Followers:</span>{' '}
								{Math.max(
									parseInt(
										influencer.tiktok_followers?.replace(
											/,/g,
											''
										) || '0'
									),
									parseInt(
										influencer.instagram_followers?.replace(
											/,/g,
											''
										) || '0'
									),
									parseInt(
										influencer.youtube_followers?.replace(
											/,/g,
											''
										) || '0'
									)
								).toLocaleString()}
							</p>
							{influencer.last_location && (
								<p className='text-sm'>
									<span className='font-medium'>
										Location:
									</span>{' '}
									{influencer.last_location}
								</p>
							)}
						</div>

						{influencer.verified && (
							<div className='mt-4'>
								<span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
									Verified
								</span>
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
