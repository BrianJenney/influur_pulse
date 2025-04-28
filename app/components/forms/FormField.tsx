'use client';

import { UseFormReturn } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface FormFieldProps<T extends Record<string, any>> {
	form: UseFormReturn<T>;
	name: keyof T;
	label: string;
	required?: boolean;
	children: (props: {
		id: string;
		name: string;
		error: string | undefined;
	}) => React.ReactNode;
	className?: string;
}

const errorVariants = {
	hidden: { height: 0, opacity: 0 },
	visible: {
		height: 'auto',
		opacity: 1,
		transition: {
			type: 'spring',
			stiffness: 300,
			damping: 30,
		},
	},
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export function FormField<T extends Record<string, any>>({
	form,
	name,
	label,
	required = false,
	children,
	className = '',
}: FormFieldProps<T>) {
	const error = form.formState.errors[name]?.message as string | undefined;

	return (
		<div className={`space-y-1 ${className}`}>
			<label
				htmlFor={String(name)}
				className='block text-sm font-medium text-gray-700'
			>
				{label} {required && <span className='text-red-500'>*</span>}
			</label>
			{children({
				id: String(name),
				name: String(name),
				error,
			})}
			<AnimatePresence>
				{error && (
					<motion.p
						variants={errorVariants}
						initial='hidden'
						animate='visible'
						exit='hidden'
						className='text-sm text-red-600'
					>
						{error}
					</motion.p>
				)}
			</AnimatePresence>
		</div>
	);
}
