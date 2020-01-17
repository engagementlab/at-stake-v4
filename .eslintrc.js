module.exports = {
  env: {
    commonjs: true,
    es6: true,
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
    _: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  "ignorePatterns": ["client/.eslintrc.js"],
  rules: {
  },
};
