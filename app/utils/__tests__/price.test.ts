import { parsePriceRange } from '../price';

describe('parsePriceRange', () => {
	test('parses price ranges with hyphens correctly', () => {
		expect(parsePriceRange('1000-2000')).toEqual({ min: 1000, max: 2000 });
		expect(parsePriceRange('500-1500')).toEqual({ min: 500, max: 1500 });
	});

	test('parses single values correctly', () => {
		expect(parsePriceRange('1000')).toEqual({ min: 1000, max: 1000 });
		expect(parsePriceRange('500')).toEqual({ min: 500, max: 500 });
	});

	test('handles currency symbols and commas', () => {
		expect(parsePriceRange('$1,000-$2,000')).toEqual({
			min: 1000,
			max: 2000,
		});
		expect(parsePriceRange('$500')).toEqual({ min: 500, max: 500 });
		expect(parsePriceRange('$1,500')).toEqual({ min: 1500, max: 1500 });
	});

	test('returns null for invalid formats', () => {
		expect(parsePriceRange('')).toBeNull();
		expect(parsePriceRange('invalid')).toBeNull();
		expect(parsePriceRange('1000-')).toBeNull();
		expect(parsePriceRange('-1000')).toBeNull();
		expect(parsePriceRange('1000-2000-3000')).toBeNull();
		expect(parsePriceRange('abc-def')).toBeNull();
	});
});
