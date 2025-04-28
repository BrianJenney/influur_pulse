'use client';

import { Input } from '@/app/components/ui/Input';
import { Button } from '@/app/components/ui/Button';
import { useState } from 'react';
import { fetchRouteWithBody } from '@/app/api/routes';
import { Form } from '@/app/components/forms/Form';
import { searchSchema } from '@/app/schemas/search';
import { z } from 'zod';

interface Song {
	id: string;
	name: string;
	artist: string;
	album?: string;
	imageUrl?: string;
	spotifyUrl: string;
}

type SearchFormData = z.infer<typeof searchSchema>;

export default function HomePage() {
	const [songs, setSongs] = useState<Song[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSearch = async ({ query }: SearchFormData) => {
		setIsLoading(true);
		setError(null);

		try {
			const results = await fetchRouteWithBody('SEARCH_SONGS', {
				query,
			});
			setSongs(results);
		} catch (err) {
			setError('Failed to search songs. Please try again.');
			console.error('Search error:', err);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8'>
			<div className='max-w-md w-full space-y-8'>
				<div className='text-center pt-4'>
					<h1 className='text-4xl font-semibold text-gray-800'>
						Track what matters. Amplify what works.
					</h1>
					<p className='mt-4 text-sm text-gray-600'>
						Start a campaign to amplify your music.
					</p>
				</div>

				<div className='mt-8 bg-white py-8 px-4 rounded-xl sm:px-10'>
					<Form
						schema={searchSchema}
						onSubmit={handleSearch}
						defaultValues={{ query: '' }}
					>
						{(methods) => (
							<div className='space-y-6'>
								<div className='flex gap-2 flex-col'>
									<Input
										type='text'
										placeholder='Search for a song...'
										className='flex-1 w-full'
										{...methods.register('query')}
									/>
									<Button
										type='submit'
										className='w-full'
										disabled={isLoading}
									>
										{isLoading ? 'Searching...' : 'Search'}
									</Button>
								</div>
							</div>
						)}
					</Form>

					{error && (
						<div className='mt-4 text-red-500 text-sm text-center'>
							{error}
						</div>
					)}

					{songs.length > 0 && (
						<div className='mt-6 space-y-4'>
							<h2 className='text-lg font-semibold text-gray-900'>
								Results
							</h2>
							<div className='space-y-3'>
								{songs.map((song) => (
									<div
										key={song.id}
										className='p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors'
									>
										<div className='flex items-center gap-3'>
											{song.imageUrl && (
												<img
													src={song.imageUrl}
													alt={song.name}
													className='w-12 h-12 rounded'
												/>
											)}
											<div className='flex-1 min-w-0'>
												<h3 className='text-sm font-medium text-gray-900 truncate'>
													{song.name}
												</h3>
												<p className='text-sm text-gray-500 truncate'>
													{song.artist}
												</p>
												{song.album && (
													<p className='text-xs text-gray-400 truncate'>
														{song.album}
													</p>
												)}
											</div>
											<a
												href={song.spotifyUrl}
												target='_blank'
												rel='noopener noreferrer'
												className='text-orange-500 hover:text-orange-600'
											>
												Listen
											</a>
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
