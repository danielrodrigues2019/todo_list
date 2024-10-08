module.exports = {
  parser: '@typescript-eslint/parser',
  env: {
    browser: true,
    es2021: true,
    node: true,
    'cypress/globals': true,
  },
  plugins: [
    'react',
    'prettier',
    '@typescript-eslint',
    'cypress',
    'chai-friendly',
  ],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:cypress/recommended',
    'plugin:prettier/recommended',
    'plugin:chai-friendly/recommended',
  ],
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  ignorePatterns: ['node_modules/'],
  // Cherry of the Cake
  rules: {
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'react/no-unknown-property': ['error', { ignore: ['jsx', 'global'] }],
    'chai-friendly/no-unused-expressions': 2,
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
      },
    ],
  },
}
