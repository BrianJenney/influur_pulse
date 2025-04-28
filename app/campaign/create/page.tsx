import { CampaignChat } from '@/app/components/CampaignChat';

export default function CreateCampaignPage() {
	return (
		<div className='min-h-screen bg-gradient-to-br from-orange-600 via-orange-500 to-orange-700'>
			<div className='container mx-auto px-6 py-6'>
				<h1 className='text-4xl font-bold mb-6 mx-auto w-full text-center text-white'>
					Create Your Campaign
				</h1>
				<CampaignChat />
			</div>
		</div>
	);
}
