module.exports = {
  env: {
    es6: true,
    node: true,
    mocha: true,
  },
  extends: [
    'eslint:recommended',
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    "@typescript-eslint/camelcase": ["error", {
      allow: [ // Database uses all snake_case
        "isbn_10", "isbn_13", "other_identifier", "first_name", "last_name",
        "book_id", "user_id", "author_id"
      ]
    }],
  },
};
