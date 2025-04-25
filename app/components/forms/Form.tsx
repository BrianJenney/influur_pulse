'use client';

import { useForm, UseFormProps, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';

interface FormProps<TInput, TOutput> {
	schema: z.ZodType<TOutput, z.ZodTypeDef, TInput>;
	onSubmit: (data: TOutput) => Promise<void>;
	children: (methods: UseFormReturn<TOutput>) => React.ReactNode;
	defaultValues?: UseFormProps<TOutput>['defaultValues'];
	className?: string;
}

export function Form<TInput, TOutput>({
	schema,
	onSubmit,
	children,
	defaultValues,
	className = '',
}: FormProps<TInput, TOutput>) {
	const methods = useForm<TOutput>({
		resolver: zodResolver(schema),
		defaultValues,
	});

	const handleSubmit = async (data: TOutput) => {
		try {
			await onSubmit(data);
		} catch (error) {
			console.error('Form submission error:', error);
		}
	};

	return (
		<motion.form
			onSubmit={methods.handleSubmit(handleSubmit)}
			className={`space-y-6 ${className}`}
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.3 }}
		>
			{children(methods)}
		</motion.form>
	);
}
