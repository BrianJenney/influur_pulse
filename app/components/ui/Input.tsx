interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
	return (
		<div className='space-y-2'>
			{label && (
				<label
					htmlFor={props.id}
					className='block text-sm font-medium text-gray-700'
				>
					{label}
				</label>
			)}
			<input
				{...props}
				className={`
          appearance-none 
          block 
          w-full 
          px-4 
          py-3 
          border 
          rounded-lg 
          shadow-sm 
          placeholder-gray-400
          focus:outline-none 
          focus:ring-2 
          focus:ring-orange-300
          focus:border-orange-500
          text-sm
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${className}
        `}
			/>
			{error && <p className='text-sm text-red-600'>{error}</p>}
		</div>
	);
}
