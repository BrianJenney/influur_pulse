const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
import { z } from 'zod';

const spotifyImageSchema = z.object({
	url: z.string(),
	height: z.number(),
	width: z.number(),
});

const spotifyArtistSchema = z.object({
	name: z.string(),
});

const spotifyAlbumSchema = z.object({
	name: z.string(),
	images: z.array(spotifyImageSchema),
});

const spotifyTrackSchema = z.object({
	id: z.string(),
	name: z.string(),
	artists: z.array(spotifyArtistSchema),
	album: spotifyAlbumSchema,
	preview_url: z.string().nullable(),
	external_urls: z.object({
		spotify: z.string(),
	}),
	genres: z.array(z.string()).optional(),
});

const spotifySearchResponseSchema = z.object({
	tracks: z.object({
		items: z.array(spotifyTrackSchema),
	}),
});

export type SpotifyTrack = z.infer<typeof spotifyTrackSchema>;
export type SpotifySearchResponse = z.infer<typeof spotifySearchResponseSchema>;

export class SpotifyClient {
	private accessToken: string | null = null;
	private tokenExpiry: number | null = null;

	constructor(
		private clientId: string = process.env.SPOTIFY_CLIENT_ID!,
		private clientSecret: string = process.env.SPOTIFY_CLIENT_SECRET!
	) {}

	private async getAccessToken() {
		if (
			this.accessToken &&
			this.tokenExpiry &&
			Date.now() < this.tokenExpiry
		) {
			return this.accessToken;
		}

		const response = await fetch('https://accounts.spotify.com/api/token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				Authorization: `Basic ${Buffer.from(
					`${this.clientId}:${this.clientSecret}`
				).toString('base64')}`,
			},
			body: 'grant_type=client_credentials',
		});

		if (!response.ok) {
			throw new Error('Failed to get Spotify access token');
		}

		const data = await response.json();
		this.accessToken = data.access_token;
		this.tokenExpiry = Date.now() + data.expires_in * 1000;
		return this.accessToken;
	}

	async searchTracks(query: string, limit: number = 10) {
		const accessToken = await this.getAccessToken();
		const response = await fetch(
			`${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(
				query
			)}&type=track&limit=${limit}`,
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			}
		);

		if (!response.ok) {
			throw new Error('Failed to search Spotify tracks');
		}

		const json = await response.json();
		const parsedResponse = spotifySearchResponseSchema.safeParse(json);

		if (!parsedResponse.success) {
			console.error(
				'Failed to parse Spotify response:',
				parsedResponse.error
			);
			throw new Error('Invalid response from Spotify API');
		}

		return parsedResponse.data.tracks.items.map((track) => {
			const imageUrl = track.album.images[0]?.url || '';

			return {
				id: track.id,
				name: track.name,
				artist: track.artists[0].name,
				album: track.album.name,
				previewUrl: track.preview_url,
				spotifyUrl: track.external_urls.spotify,
				imageUrl,
				genres: track.genres || [],
			};
		});
	}
}

export const spotifyClient = new SpotifyClient();
