module.exports = {
	root: true,
	extends: ['eslint:recommended', 'plugin:svelte/recommended', 'prettier'],
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2020,
		extraFileExtensions: ['.svelte']
	},
	rules: {
		"svelte/valid-compile": ["error", { "ignoreWarnings": true }]
	},
	env: {
		browser: true,
		es2017: true,
		node: true
	}
};
