module.exports = {
	// Lint & Prettify TS and JS files
	'**/*.(ts|tsx|js)': (filenames) => [
		`eslint --fix ${filenames.join(' ')}`,
		`prettier --write ${filenames.join(' ')}`,
	],

	// Prettify only JSON and Markdown files
	'**/*.(json|md)': (filenames) => `prettier --write ${filenames.join(' ')}`,
};
