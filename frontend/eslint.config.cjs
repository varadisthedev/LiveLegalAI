module.exports = [
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: {
      react: require("eslint-plugin-react"),
      "react-hooks": require("eslint-plugin-react-hooks"),
    },
    // react-hooks plugin is provided by deps; avoid missing-rule errors
    // we only enable a small, safe rule set here to allow --fix runs
    rules: {
      "react-hooks/exhaustive-deps": "off",
      // Keep these light — the goal is safe, automatic fixes only
      semi: ["error", "always"],
      quotes: ["error", "single", { avoidEscape: true }],

      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
      "no-unused-vars": [
        "warn",
        { args: "after-used", ignoreRestSiblings: true },
      ],
      "no-console": "off",
    },
    settings: { react: { version: "detect" } },
  },
];
