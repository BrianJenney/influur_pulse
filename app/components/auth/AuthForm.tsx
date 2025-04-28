'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { routes } from '@/app/api/routes';
import { fetchRouteWithBody } from '@/app/api/utils';
import { Form } from '@/app/components/forms/Form';
import { FormField } from '@/app/components/forms/FormField';
import { Input } from '@/app/components/ui/Input';
import { Button } from '@/app/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { InfluurLogo } from '@/app/components/InfluurLogo';
import type { z } from 'zod';

type RegisterInput = z.infer<typeof routes.REGISTER.inputSchema>;
type FormFields = keyof RegisterInput;

export default function AuthForm() {
	const router = useRouter();
	const [isRegister, setIsRegister] = useState(false);
	const [error, setError] = useState<string>('');
	const [isLoading, setIsLoading] = useState(false);

	const onSubmit = async (data: RegisterInput) => {
		try {
			setIsLoading(true);
			setError('');

			const response = await fetchRouteWithBody('REGISTER', {
				pulseUserEmail: data.pulseUserEmail,
				pulseUserName: data.pulseUserName,
				password: data.password,
			});

			if (response.detail) {
				router.push('/');
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An error occurred');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className='w-full max-w-md space-y-8'>
			<div className='flex flex-col items-center'>
				<InfluurLogo />
				<h2 className='mt-6 text-center text-3xl font-bold tracking-tight text-gray-900'>
					{isRegister
						? 'Create your account'
						: 'Sign in to your account'}
				</h2>
			</div>

			<Form
				schema={routes.REGISTER.inputSchema}
				onSubmit={onSubmit}
				defaultValues={{
					pulseUserEmail: '',
					pulseUserName: '',
					password: '',
				}}
			>
				{(form) => (
					<div className='space-y-6'>
						<AnimatePresence mode='wait'>
							{isRegister && (
								<motion.div
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: 'auto' }}
									exit={{ opacity: 0, height: 0 }}
									transition={{ duration: 0.2 }}
								>
									<FormField
										form={form}
										name={'pulseUserName' as FormFields}
										label='Name'
										required
									>
										{({ id, name, error }) => (
											<Input
												id={id}
												{...form.register(
													name as FormFields
												)}
												type='text'
												error={error}
												placeholder='Enter your name'
											/>
										)}
									</FormField>
								</motion.div>
							)}
						</AnimatePresence>

						<FormField
							form={form}
							name={'pulseUserEmail' as FormFields}
							label='Email'
							required
						>
							{({ id, name, error }) => (
								<Input
									id={id}
									{...form.register(name as FormFields)}
									type='email'
									error={error}
									placeholder='Enter your email'
								/>
							)}
						</FormField>

						<FormField
							form={form}
							name={'password' as FormFields}
							label='Password'
							required
						>
							{({ id, name, error }) => (
								<Input
									id={id}
									{...form.register(name as FormFields)}
									type='password'
									error={error}
									placeholder='Enter your password'
								/>
							)}
						</FormField>

						{error && (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								className='rounded-md bg-red-50 p-4'
							>
								<p className='text-sm text-red-700'>{error}</p>
							</motion.div>
						)}

						<Button
							type='submit'
							isLoading={isLoading}
							className='w-full'
						>
							{isRegister ? 'Create Account' : 'Sign In'}
						</Button>

						<div className='text-center'>
							<button
								type='button'
								onClick={() => {
									setIsRegister(!isRegister);
									form.reset();
									setError('');
								}}
								className='text-sm text-orange-600 hover:text-orange-500'
							>
								{isRegister
									? 'Already have an account? Sign in'
									: "Don't have an account? Create one"}
							</button>
						</div>
					</div>
				)}
			</Form>
		</div>
	);
}
