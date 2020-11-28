module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  rules: {
    'no-empty': 0,
    'no-empty-pattern': 0,
    '@typescript-eslint/no-empty-interface': 0,
    '@typescript-eslint/no-empty-function': 0,
    'react/react-in-jsx-scope': 0,
    'react-hooks/exhaustive-deps': ['warn', { additionalHooks: 'useDeferredEffect' }],
  },
};
