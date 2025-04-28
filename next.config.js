/** @type {import('next').NextConfig} */
const nextConfig = {
	webpack: (config) => {
		config.resolve.alias = {
			...config.resolve.alias,
			'@': './',
		};
		config.images.remotePatterns = [
			new URL('https://i.scdn.co/**'),
			new URL(
				'https://influur-uploads213904-dev.s3.us-east-2.amazonaws.com/**'
			),
		];
		return config;
	},
	images: {
		domains: [
			'i.scdn.co',
			'influur-uploads213904-dev.s3.us-east-2.amazonaws.com',
		],
	},
};

module.exports = nextConfig;
