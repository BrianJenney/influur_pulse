'use client';

import {
	FieldValues,
	useForm,
	UseFormProps,
	UseFormReturn,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';

interface FormProps<TOutput extends FieldValues> {
	schema: z.ZodType<TOutput, z.ZodTypeDef, TOutput>;
	onSubmit: (data: TOutput) => Promise<void>;
	children: (methods: UseFormReturn<TOutput>) => React.ReactNode;
	defaultValues?: UseFormProps<TOutput>['defaultValues'];
	className?: string;
}

export function Form<TOutput extends FieldValues>({
	schema,
	onSubmit,
	children,
	defaultValues,
	className = '',
}: FormProps<TOutput>) {
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
