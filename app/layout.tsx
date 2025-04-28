import type { Metadata } from 'next';
import { Varela_Round } from 'next/font/google';
import { Navbar } from './components/nav/Navbar';
import './globals.css';

const varelaRound = Varela_Round({
	weight: '400',
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-varela-round',
});

export const metadata: Metadata = {
	title: 'influur.ai',
	description: 'Influencer marketing platform',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en' className={varelaRound.className}>
			<body>
				<Navbar />
				<main className='min-h-screen'>{children}</main>
			</body>
		</html>
	);
}
