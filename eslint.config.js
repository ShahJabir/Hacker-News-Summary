import antfu from '@antfu/eslint-config'

export default antfu({
  formatters: true,
  ignores: [
    '**/dist/**',
    '*.json',
    '*.jsonc',
    '.git/',
  ],
  rules: {
    'no-console': [
      'error',
      {
        allow: [
          'warn',
          'error',
        ],
      },
    ],
  },
})
