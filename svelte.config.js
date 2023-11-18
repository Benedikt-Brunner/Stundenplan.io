import adapter from '@sveltejs/adapter-auto';

import Adapter from '@sveltejs/adapter-vercel';

export default {
	kit: {
		adapter: Adapter({})
	}
};
