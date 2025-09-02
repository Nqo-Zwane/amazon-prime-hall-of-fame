import eslintJs from '@eslint/js';

export default [
  eslintJs.configs.recommended,
  {
    files: ['**/*.js'],
    ignores: ['**/*.cjs'],
    rules: {
      // Naming conventions
      'camelcase': 'error',
      
      // Function naming
      'func-names': ['error', 'always'],
      'func-style': ['error', 'declaration'],
      
      // General code quality
      'no-unused-vars': 'error',
      'no-console': 'warn',
      'prefer-const': 'error',
      
      // Semantic naming suggestions
      'id-length': ['error', { 'min': 3, 'exceptions': ['i', 'j', 'x', 'y', 'z'] }]
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly'
      }
    }
  }
];
