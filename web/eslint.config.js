import ts from 'typescript-eslint'
import eslint from '@eslint/js'

export default ts.config(
	{
		ignores: ['styled-system'],
	},
	eslint.configs.recommended,
	ts.configs.recommended,
	{
		rules: {
			'@typescript-eslint/no-unused-vars': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-restricted-imports': [
				'error',
				{
					paths: [
						{
							name: '~server',
							message: 'Do not import from the server, on the client.',
							allowTypeImports: false,
						},
					],
				},
			],
		},
	}
)
