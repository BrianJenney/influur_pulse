/** @type {import('next').NextConfig} */
const nextConfig = {
	webpack: (config) => {
		config.resolve.alias = {
			...config.resolve.alias,
			'@': './',
		};
		config.images.remotePatterns = [new URL('https://i.scdn.co/**')];
		return config;
	},
	images: {
		domains: ['i.scdn.co'],
	},
};

module.exports = nextConfig;
