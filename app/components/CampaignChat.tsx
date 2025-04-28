'use client';

import { useState, useEffect, useRef } from 'react';
import { fetchRouteWithBody } from '@/app/api/utils';
import { routes } from '@/app/api/routes';
import { z } from 'zod';
import { SongSearch } from './forms/SongSearch';
import ReactMarkdown from 'react-markdown';
import { type Message } from '@/app/lib/types';
import { Spinner } from '@/app/components/ui/Spinner';
import Image from 'next/image';

type Song = z.infer<typeof routes.SEARCH_SONGS.outputSchema>[number];
type CampaignPreferences = z.infer<
	typeof routes.CAMPAIGN_AGENT.outputSchema
>['updatedPreferences'];
type CampaignResponse = NonNullable<
	z.infer<typeof routes.CAMPAIGN_AGENT.outputSchema>['response']
>;

export function CampaignChat() {
	const [messages, setMessages] = useState<Message[]>([]);
	const [inputMessage, setInputMessage] = useState('');
	const [preferences, setPreferences] = useState<CampaignPreferences>({});
	const [campaignResponse, setCampaignResponse] =
		useState<CampaignResponse | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [showSongSearch, setShowSongSearch] = useState(true);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages, isLoading]);

	useEffect(() => {
		setMessages([
			{
				role: 'assistant',
				content:
					"**Welcome to Campaign Creator!** 👋\n\nI'm here to help you create your TikTok campaign. Let's start by selecting the song you want to promote.",
			},
		]);
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!inputMessage.trim() || isLoading) return;

		setIsLoading(true);
		const userMessage = inputMessage;
		setInputMessage('');

		const newMessage: Message = { role: 'user', content: userMessage };
		const newMessages = [...messages, newMessage];
		setMessages(newMessages);

		try {
			const response = await fetchRouteWithBody('CAMPAIGN_AGENT', {
				message: userMessage,
				preferences,
				messageHistory: newMessages,
			});

			const assistantMessage: Message = {
				role: 'assistant',
				content: response.message,
			};
			setMessages((prev) => [...prev, assistantMessage]);
			setPreferences(response.updatedPreferences);

			if (response.complete && response.response) {
				setCampaignResponse(response.response);
			}
		} catch (error) {
			console.error('Error:', error);
			const errorMessage: Message = {
				role: 'assistant',
				content:
					'❌ Sorry, there was an error processing your request. Please try again.',
			};
			setMessages((prev) => [...prev, errorMessage]);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSongSelect = async (song: Song) => {
		setShowSongSearch(false);
		setPreferences((prev) => ({
			...prev,
			songUrl: song.spotifyUrl,
		}));
		setMessages((prev) => [
			...prev,
			{
				role: 'user',
				content: `Selected: *${song.name}* by *${song.artist}*`,
			},
			{
				role: 'assistant',
				content: `## Great choice! 🎵

Let's create a campaign for **${song.name}**. Please provide the following information:

\n\n

**1. Target Audience**
- Gender (male/female/all)
- Location (e.g., "United States" or "Global")

**2. Budget**		
- Range (min-max in USD)

**3. Campaign Goals**
*Choose one or more:**
- 🎧 Increase song streams
- 💃 Create viral dance challenge
- 🎤 Build artist awareness
- ➕ Drive playlist adds
- 🎬 Generate UGC content
- ✨ Other (please specify)

*You can provide all this information in a single message.*`,
			},
		]);
	};

	const handleReset = () => {
		setMessages([
			{
				role: 'assistant',
				content:
					"*Welcome to Campaign Creator!* 👋\n\n\n I'm here to help you create your TikTok campaign. Let's start by selecting the song you want to promote.",
			},
		]);
		setPreferences({});
		setCampaignResponse(null);
		setShowSongSearch(true);
	};

	return (
		<div className='p-[1px] bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 rounded-2xl shadow-2xl max-w-[1800px] mx-auto'>
			<div className='flex h-[calc(100vh-8rem)] bg-white/90 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/20'>
				{/* Main chat section */}
				<div className='flex-1 flex flex-col min-w-0'>
					<div className='flex-1 overflow-y-auto p-8 space-y-8 min-h-0 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent'>
						{messages.map((message, index) => (
							<div
								key={index}
								className={`flex items-start gap-4 ${
									message.role === 'user'
										? 'justify-end'
										: 'justify-start'
								}`}
							>
								{message.role === 'assistant' && (
									<div className='w-12 h-12 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center shadow-md'>
										<span className='text-orange-500 text-xl'>
											🤖
										</span>
									</div>
								)}
								<div
									className={`max-w-[60%] rounded-2xl shadow-md p-6 ${
										message.role === 'user'
											? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
											: 'bg-gradient-to-r from-gray-800 to-gray-900 text-gray-100 border border-gray-700'
									}`}
								>
									<div
										className={`prose prose-base break-words leading-relaxed ${
											message.role === 'user'
												? 'prose-invert'
												: 'prose-invert'
										}`}
									>
										<ReactMarkdown
											components={{
												p: ({ children }) => (
													<p className='mb-4 leading-relaxed'>
														{children}
													</p>
												),
												ul: ({ children }) => (
													<ul className='mb-2 space-y-2'>
														{children}
													</ul>
												),
												li: ({ children }) => (
													<li className='ml-4 leading-relaxed'>
														{children}
													</li>
												),
												strong: ({ children }) => (
													<strong className='text-orange-400 font-bold'>
														{children}
													</strong>
												),
											}}
										>
											{message.content}
										</ReactMarkdown>
									</div>
								</div>
								{message.role === 'user' && (
									<div className='w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-sm'>
										<span className='text-white text-sm font-medium'>
											You
										</span>
									</div>
								)}
							</div>
						))}
						{isLoading && (
							<div className='flex items-start gap-3'>
								<div className='w-12 h-12 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center'>
									<span className='text-orange-500 text-xl'>
										🤖
									</span>
								</div>
								<div className='bg-gradient-to-r from-gray-800 to-gray-900 text-gray-100 rounded-2xl p-6 shadow-sm border border-gray-700'>
									<Spinner className='w-8 h-8 text-orange-500' />
								</div>
							</div>
						)}
						<div ref={messagesEndRef} />
					</div>

					{/* Input form */}
					<div className='p-6 border-t border-gray-200 bg-white/50'>
						<form
							onSubmit={handleSubmit}
							className='flex items-center gap-4 max-w-4xl mx-auto'
						>
							<input
								type='text'
								value={inputMessage}
								onChange={(e) =>
									setInputMessage(e.target.value)
								}
								placeholder='Type your message...'
								className='flex-1 rounded-xl border border-gray-300 px-6 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-base'
							/>
							<button
								type='submit'
								disabled={isLoading}
								className='px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 text-base font-medium'
							>
								Send
							</button>
							<button
								type='button'
								onClick={handleReset}
								className='px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors focus:outline-none text-base'
							>
								Reset
							</button>
						</form>
					</div>
				</div>

				{/* Vertical divider */}
				<div className='w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent mx-2' />

				{/* Right sidebar */}
				<div className='w-[480px] flex-shrink-0 bg-gray-50/50 p-6 border-l border-gray-200'>
					{showSongSearch ? (
						<div className='h-full'>
							<h3 className='text-xl font-semibold text-gray-800 mb-6'>
								Select a Song
							</h3>
							<SongSearch onSelectSong={handleSongSelect} />
						</div>
					) : campaignResponse ? (
						<div className='h-full overflow-y-auto pr-2'>
							<h3 className='text-xl font-semibold text-gray-800 mb-6'>
								Campaign Summary
							</h3>
							<div className='space-y-8'>
								<div>
									<h2 className='text-lg font-semibold text-gray-800 mb-3'>
										Strategy 📝
									</h2>
									<div className='text-gray-600 prose prose-base'>
										<ReactMarkdown>
											{campaignResponse.strategy}
										</ReactMarkdown>
									</div>
								</div>

								<div>
									<h2 className='text-lg font-semibold text-gray-800 mb-3'>
										Song Snippet 🎵
									</h2>
									<div className='bg-gray-50 p-6 rounded-xl border border-gray-100'>
										<p className='font-medium text-gray-700'>
											Recommended Clip:
										</p>
										<p className='text-xl font-mono mt-3 text-orange-500'>
											{
												campaignResponse.songSnippet
													.startTimestamp
											}{' '}
											-{' '}
											{
												campaignResponse.songSnippet
													.endTimestamp
											}
										</p>
										<p className='mt-3 italic text-gray-600'>
											{
												campaignResponse.songSnippet
													.reason
											}
										</p>
									</div>
								</div>

								<div>
									<h2 className='text-lg font-semibold text-gray-800 mb-3'>
										Creative Ideas 💡
									</h2>
									<div className='grid grid-cols-1 gap-4 not-prose'>
										{campaignResponse.creativeIdeas.map(
											(idea, index) => (
												<div
													key={index}
													className='border border-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow bg-gray-50'
												>
													<h4 className='font-bold text-lg text-gray-800'>
														{idea.title}
													</h4>
													<div className='flex flex-wrap gap-2 mt-3'>
														<span className='px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm'>
															{idea.type}
														</span>
														<span className='px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm'>
															{idea.difficulty}
														</span>
														<span className='px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm'>
															{idea.estimatedViews.toLocaleString()}{' '}
															views
														</span>
													</div>
													<p className='mt-4 text-gray-600'>
														{idea.description}
													</p>
												</div>
											)
										)}
									</div>
								</div>

								<div>
									<h2 className='text-lg font-semibold text-gray-800 mb-3'>
										Recommended Influencers 👥
									</h2>
									<div className='grid grid-cols-1 gap-4 not-prose'>
										{campaignResponse.influencers.map(
											(influencer) => (
												<div
													key={influencer.id}
													className='border border-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow bg-gray-50'
												>
													<div className='flex items-start gap-4'>
														<Image
															src={
																influencer.image
															}
															alt={
																influencer.name
															}
															width={80}
															height={80}
															className='rounded-full object-cover'
														/>
														<div className='flex-1'>
															<h4 className='font-bold text-lg text-gray-800'>
																{
																	influencer.name
																}
															</h4>
															<p className='text-gray-500'>
																@
																{
																	influencer.handle
																}
															</p>
															<p className='text-orange-500 font-medium mt-2'>
																Match Score:{' '}
																{(
																	influencer.matchScore *
																	100
																).toFixed(1)}
																%
															</p>
														</div>
													</div>
													<div className='mt-5 space-y-3 text-sm text-gray-600'>
														<div className='flex items-center gap-2'>
															<span>👥</span>
															<span className='font-medium'>
																{influencer.followers.toLocaleString()}
															</span>
															<span className='text-gray-400'>
																followers
															</span>
														</div>
														<div className='flex items-center gap-2'>
															<span>📈</span>
															<span className='font-medium'>
																{(
																	influencer.engagementRate *
																	100
																).toFixed(1)}
																%
															</span>
															<span className='text-gray-400'>
																engagement
															</span>
														</div>
														<div className='flex items-center gap-2'>
															<span>📍</span>
															<span className='font-medium'>
																{
																	influencer.location
																}
															</span>
														</div>
														<div className='flex items-center gap-2'>
															<span>💰</span>
															<span className='font-medium'>
																$
																{influencer.price.toLocaleString()}
															</span>
															<span className='text-gray-400'>
																per post
															</span>
														</div>
														<div className='flex items-center gap-2'>
															<span>🎯</span>
															<span className='font-medium'>
																{
																	influencer.niche
																}
															</span>
														</div>
													</div>
													<p className='mt-4 text-gray-700 italic text-sm'>
														{influencer.reasoning}
													</p>
													{influencer.website && (
														<a
															href={
																influencer.website
															}
															target='_blank'
															rel='noopener noreferrer'
															className='mt-4 inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 transition-colors text-sm'
														>
															<span>
																View Profile
															</span>
															<svg
																className='w-4 h-4'
																fill='none'
																stroke='currentColor'
																viewBox='0 0 24 24'
															>
																<path
																	strokeLinecap='round'
																	strokeLinejoin='round'
																	strokeWidth={
																		2
																	}
																	d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14'
																/>
															</svg>
														</a>
													)}
												</div>
											)
										)}
									</div>
								</div>

								<button
									onClick={handleReset}
									className='mt-8 w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-colors shadow-sm font-medium'
								>
									Start New Campaign 🔄
								</button>
							</div>
						</div>
					) : (
						<div className='h-full flex items-center justify-center text-gray-500 text-base'>
							Campaign details will appear here
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
