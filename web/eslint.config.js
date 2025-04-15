import ts from 'typescript-eslint'
import eslint from '@eslint/js'

export default ts.config(
	{
		ignores: ['styled-system', 'dist'],
	},
	eslint.configs.recommended,
	ts.configs.recommended,
	{
		rules: {
			'prefer-const': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'no-empty': 'off',
		},
	},
	{
		ignores: ['./worker/**'],
		rules: {
			'@typescript-eslint/no-restricted-imports': [
				'error',
				{
					patterns: [
						{
							group: ['~server/*'],
							message: 'Do not import from the server on the client.',
							allowTypeImports: true,
						},
					],
				},
			],
		},
	}
)
