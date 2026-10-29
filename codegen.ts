import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
	schema: 'https://graphql.anilist.co',
	documents: ['src/**/*.ts', '!src/lib/gql/**', '!src/lib/paraglide/**'],
	ignoreNoDocuments: true,
	generates: {
		'./src/lib/gql/': {
			preset: 'client',
			presetConfig: { fragmentMasking: false },
			config: { enumsAsTypes: true, useTypeImports: true }
		}
	}
};

export default config;
