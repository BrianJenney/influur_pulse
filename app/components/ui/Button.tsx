import { motion } from 'framer-motion';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: 'primary' | 'secondary';
	isLoading?: boolean;
}

export function Button({
	children,
	variant = 'primary',
	isLoading = false,
	className = '',
	...props
}: ButtonProps) {
	const baseStyles = clsx(
		'w-full',
		'flex',
		'justify-center',
		'py-3',
		'px-4',
		'border',
		'border-transparent',
		'rounded-lg',
		'shadow-sm',
		'text-lg',
		'font-medium',
		'transition-all',
		'duration-200',
		'hover:cursor-pointer',
		'focus:outline-none',
		'focus:ring-2',
		'focus:ring-offset-2'
	);

	const variantStyles = {
		primary: clsx(
			'text-white',
			'bg-orange-500',
			'hover:bg-orange-600',
			'focus:ring-orange-300'
		),
		secondary: clsx(
			'text-gray-700',
			'bg-white',
			'border-gray-300',
			'hover:bg-gray-50',
			'focus:ring-gray-300'
		),
	};

	return (
		<motion.button
			whileHover={{ scale: 1.02 }}
			whileTap={{ scale: 0.98 }}
			className={clsx(baseStyles, variantStyles[variant], className)}
			disabled={isLoading}
			{...props}
		>
			{isLoading ? (
				<div className='flex items-center'>
					<svg
						className='animate-spin -ml-1 mr-3 h-5 w-5'
						xmlns='http://www.w3.org/2000/svg'
						fill='none'
						viewBox='0 0 24 24'
					>
						<circle
							className='opacity-25'
							cx='12'
							cy='12'
							r='10'
							stroke='currentColor'
							strokeWidth='4'
						></circle>
						<path
							className='opacity-75'
							fill='currentColor'
							d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
						></path>
					</svg>
					Loading...
				</div>
			) : (
				children
			)}
		</motion.button>
	);
}
