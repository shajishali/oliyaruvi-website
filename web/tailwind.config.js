/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        surface: "var(--color-surface)",
        gold: "var(--color-gold)",
        "light-gold": "var(--color-light-gold)",
        maroon: "var(--color-maroon)",
        ink: "var(--color-text)",
        muted: "var(--color-muted)",
      },
      fontFamily: {
        heading: "var(--font-heading)",
        body: "var(--font-body)",
        tamil: "var(--font-tamil)",
      },
      borderRadius: {
        button: "var(--radius-button)",
      },
      spacing: {
        section: "var(--space-section)",
      },
    },
  },
  plugins: [],
};
