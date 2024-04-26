import Adapter from '@sveltejs/adapter-static';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
	kit: {
		adapter: Adapter({
			pages: path.join(__dirname, 'StundenplanBackEnd', 'templates', 'frontend')
		})
	}
};
