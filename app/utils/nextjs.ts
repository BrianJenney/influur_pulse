import { instanceToPlain } from 'class-transformer';

export function stringToBoolean(
	stringValue: string | null | undefined,
	defaultValue: boolean = false
) {
	switch (stringValue?.toLowerCase()?.trim()) {
		case 'y':
		case 't':
		case 'true':
		case 'yes':
		case '1':
			return true;

		case 'n':
		case 'f':
		case 'false':
		case 'no':
		case '0':
			return false;
		case null:
		case undefined:
			return defaultValue;

		default:
			console.error(
				`Cannot parse ${stringValue} to boolean! Returning ${defaultValue}`
			);
			return defaultValue;
	}
}

/**
 * Use this function to resolve nextjs warnings like
 * Warning: Only plain objects can be passed to Client Components from Server Components. Objects with symbol properties like nodejs.util.inspect.custom are not supported.
 *
 * Wrap the result of prisma calls to this before returning it to the client.
 */
export function prismaToPOJO<T>(prismaObject: T): T {
	return instanceToPlain(prismaObject) as T;
}
