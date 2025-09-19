import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

// eslint-disable-next-line import/no-anonymous-default-export
export default [
  // base config từ Next.js + TanStack Query
  ...compat.extends('next/core-web-vitals', 'next/typescript', 'plugin:@tanstack/eslint-plugin-query/recommended'),

  // 🚫 Tắt toàn bộ rule React (khỏi bị crash khi lint)
  {
    rules: {
      'react/display-name': 'off',
      'react/no-direct-mutation-state': 'off',
      'react/require-render-return': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },

  // ignore build output, node_modules
  {
    ignores: ['node_modules/**', '.next/**', 'out/**', 'build/**', 'next-env.d.ts'],
  },
]
