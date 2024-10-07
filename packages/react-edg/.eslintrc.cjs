module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  ignorePatterns: ['.eslintrc.cjs'],
  extends: [
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:@typescript-eslint/strict',
    'plugin:prettier/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
    extraFileExtensions: ['.cjs'],
  },
  plugins: ['react', 'react-hooks', '@typescript-eslint', 'prettier', 'import'],
  rules: {
    'import/newline-after-import': ['error', { count: 1 }],
    'import/order': [
      'error',
      {
        groups: [['builtin', 'external'], 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
    quotes: ['error', 'single', { avoidEscape: true }],
    'linebreak-style': ['error', 'unix'],
    semi: ['error', 'always'],
    'no-empty-function': 'off',

    '@typescript-eslint/consistent-type-exports': ['warn', { fixMixedExportsWithInlineTypeSpecifier: true }],
    '@typescript-eslint/consistent-type-imports': ['warn', { prefer: 'type-imports' }],

    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/no-misused-promises': 'warn',
    '@typescript-eslint/ban-ts-comment': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',

    // turn off rules for any type
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-argument': 'warn',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/no-unsafe-call': 'warn',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',

    // turn off rules for unbound methods due to custom useRouter
    '@typescript-eslint/unbound-method': 'off',

    'react/display-name': 'off',
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 0,

    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    'no-console': ['error', { allow: ['warn', 'error', 'debug'] }],

    'prettier/prettier': 'error',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
