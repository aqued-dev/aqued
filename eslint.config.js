import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import unicorn from 'eslint-plugin-unicorn';
import { parser } from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
export default [
	eslint.configs.recommended,
	prettier,
	...tseslint.configs.recommended,
	{
		files: ['**/*.{js,ts,mjs,mts,cjs,cts,jsx,tsx}'],
		ignores: ['./dist/*'],
		languageOptions: {
			parser,
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
			},
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: {
				...globals.es2024,
				...globals.node,
			},
		},
		plugins: {
			'typescript-eslint': tseslint,
			unicorn: unicorn,
		},
		rules: {
			'unicorn/filename-case': 'off',
			'unicorn/prefer-node-protocol': 'error',
			'no-console': 'off', //Loggerを入れた後はerrorに。
			'unicorn/no-await-expression-member': 'off',
			'@typescript-eslint/no-unused-vars': 'warn',
			'unicorn/empty-brace-spaces': 'warn',
			'unicorn/prevent-abbreviations': 'off',
			'unicorn/consistent-function-scoping': 'off',
			// 仮
			'@typescript-eslint/no-unused-expressions': 'off',
			'no-constant-binary-expression': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
		},
	},
];
