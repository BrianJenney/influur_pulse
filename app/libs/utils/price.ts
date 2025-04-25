interface PriceRange {
	min: number;
	max: number;
}

export function parsePriceRange(priceString: string): PriceRange | null {
	// Remove any currency symbols and spaces
	const cleanString = priceString.replace(/[$,]/g, '').trim();

	// Handle ranges like "1000-2000"
	const rangeMatch = cleanString.match(/^(\d+)-(\d+)$/);
	if (rangeMatch) {
		return {
			min: parseInt(rangeMatch[1]),
			max: parseInt(rangeMatch[2]),
		};
	}

	// Handle single values like "1000"
	const singleMatch = cleanString.match(/^(\d+)$/);
	if (singleMatch) {
		const value = parseInt(singleMatch[1]);
		return {
			min: value,
			max: value,
		};
	}

	return null;
}
