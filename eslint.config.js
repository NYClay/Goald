const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const hooksPlugin = require('eslint-plugin-react-hooks');
const reactNativePlugin = require('eslint-plugin-react-native');
const prettierConfig = require('eslint-config-prettier');

const src = 'src';

module.exports = [
  { ignores: ['node_modules', 'dist', '.expo'] },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: { parser: tsParser },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react-hooks': hooksPlugin,
      'react-native': reactNativePlugin,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'no-console': 'warn',
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: `${src}/screens`,
              message: 'screens/ must not be imported by services/, utils/, or components/',
            },
            {
              name: `${src}/components`,
              message: 'components/ must not be imported by services/ or utils/',
            },
            {
              name: `${src}/hooks`,
              message: 'hooks/ must not be imported by services/ or utils/',
            },
            {
              name: `${src}/services`,
              message: 'services/ must not be imported by screens/, components/, or utils/',
            },
          ],
          patterns: [
            {
              group: [`${src}/screens/**`],
              message: 'screens/ must not be imported by services/, utils/, or components/',
            },
            {
              group: [`${src}/components/**`],
              message: 'components/ must not be imported by services/ or utils/',
            },
            {
              group: [`${src}/hooks/**`],
              message: 'hooks/ must not be imported by services/ or utils/',
            },
            {
              group: [`${src}/services/**`],
              message: 'services/ must not be imported by screens/, components/, or utils/',
            },
          ],
        },
      ],
    },
  },
  {
    files: [`${src}/utils/**/*.ts`, `${src}/utils/**/*.tsx`],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: `${src}/screens`,
              message: 'utils/ must not import from screens/',
            },
            {
              name: `${src}/components`,
              message: 'utils/ must not import from components/',
            },
            {
              name: `${src}/hooks`,
              message: 'utils/ must not import from hooks/',
            },
            {
              name: `${src}/services`,
              message: 'utils/ must not import from services/',
            },
            {
              name: `${src}/context`,
              message: 'utils/ must not import from context/',
            },
          ],
          patterns: [
            {
              group: [`${src}/screens/**`],
              message: 'utils/ must not import from screens/',
            },
            {
              group: [`${src}/components/**`],
              message: 'utils/ must not import from components/',
            },
            {
              group: [`${src}/hooks/**`],
              message: 'utils/ must not import from hooks/',
            },
            {
              group: [`${src}/services/**`],
              message: 'utils/ must not import from services/',
            },
            {
              group: [`${src}/context/**`],
              message: 'utils/ must not import from context/',
            },
          ],
        },
      ],
    },
  },
  {
    files: [`${src}/types/**/*.ts`, `${src}/types/**/*.tsx`],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [`${src}/screens/**`, `${src}/components/**`, `${src}/hooks/**`, `${src}/services/**`, `${src}/context/**`, `${src}/config/**`],
              message: 'types/ must not import from any other layer',
            },
          ],
        },
      ],
    },
  },
  prettierConfig,
];
