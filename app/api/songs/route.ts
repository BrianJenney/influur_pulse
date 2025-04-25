import { createRouteHandler } from '../route.server';
import { spotifyClient } from '../../libs/spotify';

export const POST = createRouteHandler('SEARCH_SONGS', async ({ query }) => {
	try {
		const songs = await spotifyClient.searchTracks(query);
		return songs.map((song) => ({
			...song,
			previewUrl: song.previewUrl || undefined,
		}));
	} catch (error) {
		console.error('Error searching songs:', error);
		throw new Error('Failed to search songs');
	}
});
