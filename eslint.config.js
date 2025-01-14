import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';
import unicorn from 'eslint-plugin-unicorn';
import globals from 'globals';
import tseslint, { parser } from 'typescript-eslint';
/** @type { import("eslint").Linter.Config[] } */
export default [
	eslint.configs.recommended,
	prettier,
	...tseslint.configs.recommended,
	{
		files: ['**/*.{js,ts,mjs,mts,cjs,cts,jsx,tsx}'],
		ignores: ['**/dist/**']
	},
	{
		languageOptions: {
			parser,
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module'
			},
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: {
				...globals.es2024,
				...globals.node
			}
		}
	},
	{
		plugins: {
			'typescript-eslint': tseslint,
			'unicorn': unicorn
		}
	},
	{
		rules: { '@typescript-eslint/no-unused-vars': 'off', 'curly': 'error' }
	}
];
