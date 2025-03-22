module.exports = {
  extends: "next/core-web-vitals",
  rules: {
    // Désactiver la règle pour les apostrophes non échappées
    "react/no-unescaped-entities": "off",
    // Rendre les règles TypeScript moins strictes pour le développement
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      },
    ],
  },
}

