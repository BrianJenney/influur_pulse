'use client';

import { UseFormReturn, Path } from 'react-hook-form';
import { FormField } from '../FormField';

interface TextInputProps<T extends Record<string, unknown>> {
	form: UseFormReturn<T>;
	name: keyof T;
	label: string;
	required?: boolean;
	placeholder?: string;
	className?: string;
}

export function TextInput<T extends Record<string, unknown>>({
	form,
	name,
	label,
	required = false,
	placeholder,
	className = '',
}: TextInputProps<T>) {
	return (
		<FormField form={form} name={name} label={label} required={required}>
			{({ id, name, error }) => (
				<input
					type='text'
					id={id}
					{...form.register(name as Path<T>)}
					placeholder={placeholder}
					className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm ${
						error ? 'border-red-500' : ''
					} ${className}`}
				/>
			)}
		</FormField>
	);
}
