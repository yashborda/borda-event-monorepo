/** @type {import("prettier").Config} */
const config = {
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: "es5",
  printWidth: 80,
  plugins: [
    "@trivago/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss",
  ],
  importOrder: [
    "^next(/.*|$)",
    "^react$",
    "^@radix-ui(/.*|$)",
    "^@mui(/.*|$)",
    "^@/env(/.*|$)",
    "^@/lib(/.*|$)",
    "^@/constants(/.*|$)",
    "^@/services(/.*|$)",
    "^@/utils(/.*|$)",
    "^@/apis(/.*|$)",
    "^@/hooks(/.*|$)",
    "^@/store(/.*|$)",
    "^@/components(/.*|$)",
    "^@/blocks(/.*|$)",
    "^@/assets(/.*|$)",
    "@(/.*|$)",
    "^[./]",
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};

export default config;
