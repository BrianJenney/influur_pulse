'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { InfluurLogo } from '@/app/components/InfluurLogo';

export function Navbar() {
	const pathname = usePathname();

	const isActive = (path: string) => pathname === path;

	return (
		<nav className='border-b border-gray-200 bg-white'>
			<div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
				<div className='flex h-16'>
					<div className='flex-shrink-0 flex items-center'>
						<Link href='/'>
							<InfluurLogo />
						</Link>
					</div>

					<div className='flex-1 flex justify-center'>
						<div className='flex space-x-4'>
							<Link
								href='/campaigns'
								className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
									isActive('/campaigns')
										? 'border-primary-500 text-gray-900'
										: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
								}`}
							>
								Campaigns
							</Link>
							<Link
								href='/campaign/create'
								className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
									isActive('/campaigns/create')
										? 'border-primary-500 text-gray-900'
										: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
								}`}
							>
								Create Campaign
							</Link>
						</div>
					</div>

					<div className='flex-shrink-0 w-[88px]'></div>
				</div>
			</div>
		</nav>
	);
}
