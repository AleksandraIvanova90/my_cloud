import importPlugin from 'eslint-plugin-import';
import js from '@eslint/js';
import globals from 'globals';
import pluginReact from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import stylistic from '@stylistic/eslint-plugin';
import { defineConfig } from 'eslint/config';

const importRules = importPlugin.configs.recommended.rules;

export default defineConfig([
  {ignores: [
      'node_modules/',
      'dist/',        
      'build/',      
      '*.config.js',   
      '**/*.test.js',  
      '**/*.test.jsx',
      '**/*.spec.js',
      '**/*.spec.jsx',
  ],
    files: ['**/*.{js,mjs,cjs,jsx}'],
    plugins: {
      js,
      react: pluginReact,
      'react-hooks': reactHooks,
      '@stylistic': stylistic,
      import: importPlugin,
    },
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx'],
        },
        
        alias: {
          map: [
            ['@components', './src/components'], 
          ],
          extensions: ['.js', '.jsx'],
        },
      },
    },
    rules: {
      ...importRules,
      'import/order': [
        'error',
        {
          groups: ['external', 'builtin', 'sibling', 'parent', 'index'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'off',
      '@stylistic/indent': ['error', 2],
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/semi': ['error', 'always'],
      'no-unused-vars': 'off',
      'no-console': 'warn',
      'import/no-dynamic-require': 'warn',
      'import/no-nodejs-modules': 'warn',
    },
  },
]);

