'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/app/components/ui/Input';
import { fetchRouteWithBody } from '@/app/api/utils';
import { routes } from '@/app/api/routes';
import { z } from 'zod';
import Image from 'next/image';

type Song = z.infer<typeof routes.SEARCH_SONGS.outputSchema>[number] & {
	imageUrl?: string;
	genres?: string[];
};

type SongSearchProps = {
	onSelectSong: (song: Song) => void;
	required?: boolean;
};

export function SongSearch({ onSelectSong, required = true }: SongSearchProps) {
	const [query, setQuery] = useState('');
	const [songs, setSongs] = useState<Song[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [selectedSong, setSelectedSong] = useState<Song | null>(null);

	const searchSongs = useCallback(async (searchQuery: string) => {
		if (!searchQuery.trim()) {
			setSongs([]);
			setSelectedSong(null);
			return;
		}

		setIsLoading(true);
		try {
			const data = await fetchRouteWithBody('SEARCH_SONGS', {
				query: searchQuery,
			});
			setSongs(data);
			setSelectedSong(null);
		} catch (error) {
			console.error('Error searching songs:', error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		const timer = setTimeout(() => {
			searchSongs(query);
		}, 300);

		return () => clearTimeout(timer);
	}, [query, searchSongs]);

	const handleSelectSong = (song: Song) => {
		setSelectedSong(song);
		onSelectSong(song);
	};

	return (
		<div className='w-full space-y-4'>
			<div className='w-full'>
				<Input
					type='text'
					placeholder='Search for a song...'
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					className='w-full'
					required={required}
				/>
			</div>

			{selectedSong && (
				<div className='w-full p-4 border rounded-lg bg-orange-50 flex gap-4 items-start'>
					<div className='relative w-16 h-16 flex-shrink-0'>
						<Image
							src={selectedSong.imageUrl || ''}
							alt={`${selectedSong.name} album art`}
							fill
							className='rounded-lg object-cover'
						/>
					</div>
					<div className='flex-1'>
						<div className='font-medium text-orange-700'>
							{selectedSong.name}
						</div>
						<div className='text-sm text-orange-600'>
							{selectedSong.artist}
						</div>
						{selectedSong.album && (
							<div className='text-sm text-orange-500'>
								{selectedSong.album}
							</div>
						)}
						{selectedSong.genres &&
							selectedSong.genres.length > 0 && (
								<div className='mt-2 flex flex-wrap gap-2'>
									{selectedSong.genres.map((genre) => (
										<span
											key={genre}
											className='px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-700'
										>
											{genre}
										</span>
									))}
								</div>
							)}
					</div>
				</div>
			)}

			{!selectedSong && songs.length > 0 && (
				<div className='w-full space-y-2 max-h-96 overflow-y-auto'>
					{songs.map((song) => (
						<div
							key={song.id}
							className='w-full p-4 border rounded-lg hover:bg-gray-50 cursor-pointer flex gap-4 items-start'
							onClick={() => handleSelectSong(song)}
						>
							<div className='relative w-12 h-12 flex-shrink-0'>
								<Image
									src={song.imageUrl || ''}
									alt={`${song.name} album art`}
									fill
									className='rounded-lg object-cover'
								/>
							</div>
							<div className='flex-1'>
								<div className='font-medium'>{song.name}</div>
								<div className='text-sm text-gray-600'>
									{song.artist}
								</div>
								{song.album && (
									<div className='text-sm text-gray-500'>
										{song.album}
									</div>
								)}
								{song.genres && song.genres.length > 0 && (
									<div className='mt-1 flex flex-wrap gap-1'>
										{song.genres
											.slice(0, 2)
											.map((genre) => (
												<span
													key={genre}
													className='px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600'
												>
													{genre}
												</span>
											))}
									</div>
								)}
							</div>
						</div>
					))}
				</div>
			)}

			{isLoading && (
				<div className='flex justify-center'>
					<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500'></div>
				</div>
			)}
		</div>
	);
}
