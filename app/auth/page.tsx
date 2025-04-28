import { Metadata } from 'next';
import AuthForm from '../components/auth/AuthForm';

export const metadata: Metadata = {
	title: 'Login / Register - Influur Pulse',
	description: 'Login or create your account on Influur Pulse',
};

export default function AuthPage() {
	return (
		<main className='min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
			<div className='max-w-md w-full space-y-8'>
				<div className='text-center'>
					<p className='mt-2 text-sm text-gray-600'>
						Login or create your account to continue
					</p>
				</div>
				<AuthForm />
			</div>
		</main>
	);
}
