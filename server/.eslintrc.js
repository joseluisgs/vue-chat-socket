module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.eslint.json',
    tsconfigRootDir: __dirname,

  },
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'airbnb-typescript/base',
  ],
  rules: {
    'max-len': [
      'error',
      {
        code: 180,
        comments: 180,
      },
    ],
    'no-console': 'off',
  },
};
