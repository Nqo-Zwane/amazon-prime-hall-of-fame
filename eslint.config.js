import eslintJs from '@eslint/js';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  eslintJs.configs.recommended,
  prettierConfig,
  {
    files: ['**/*.js'],
    ignores: ['**/*.cjs'],
    plugins: {
      prettier,
    },
    rules: {
      // Prettier integration
      'prettier/prettier': 'error',

      // Naming conventions
      camelcase: 'error',

      // Function naming
      'func-names': ['error', 'always'],
      'func-style': ['error', 'declaration'],

      // General code quality
      'no-unused-vars': 'error',
      'no-console': 'warn',
      'prefer-const': 'error',

      // Semantic naming suggestions
      'id-length': ['error', { min: 3, exceptions: ['i', 'j', 'x', 'y', 'z'] }],

      // Spacing and formatting
      'lines-between-class-members': ['error', 'always'],
      'padded-blocks': ['error', 'never'],
      'newline-after-var': ['error', 'always'],
      'padding-line-empty-lines': 'off',
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
      },
    },
  },
];
