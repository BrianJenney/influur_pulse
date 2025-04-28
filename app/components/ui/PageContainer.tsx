import clsx from 'clsx';

interface PageContainerProps {
	children: React.ReactNode;
	className?: string;
}

export function PageContainer({
	children,
	className = '',
}: PageContainerProps) {
	return (
		<div
			className={clsx(
				'min-h-screen bg-gray-200 px-4 py-8 sm:px-6 lg:px-8',
				className
			)}
		>
			<div className='max-w-7xl mx-auto'>{children}</div>
		</div>
	);
}
