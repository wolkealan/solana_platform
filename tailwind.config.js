/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
    darkMode: "class",
    theme: {
      extend: {
        colors: {
          primary: {
            DEFAULT: "#9D4EDD",
            light: "#B47AFF",
            dark: "#7B2CBF",
          },
          secondary: {
            DEFAULT: "#FF4FBF",
            light: "#FF77D9",
            dark: "#CC2A9E",
          },
          accent: {
            DEFAULT: "#5B5FFF",
            light: "#8689FF",
            dark: "#3339CC",
          },
          background: {
            DEFAULT: "#000000",
            light: "#121212",
            dark: "#000000",
          },
        },
        fontFamily: {
          sans: ["Inter", "sans-serif"],
        },
        borderRadius: {
          lg: "0.5rem",
          md: "0.375rem",
          sm: "0.25rem",
        },
        boxShadow: {
          custom: "0 0 15px rgba(0, 162, 255, 0.2)",
          glow: "0 0 10px rgba(0, 162, 255, 0.7)",
        },
        animation: {
          "accordion-down": "accordion-down 0.2s ease-out",
          "accordion-up": "accordion-up 0.2s ease-out",
        },
        keyframes: {
          "accordion-down": {
            from: { height: 0 },
            to: { height: "var(--radix-accordion-content-height)" },
          },
          "accordion-up": {
            from: { height: "var(--radix-accordion-content-height)" },
            to: { height: 0 },
          },
        },
      },
    },
    plugins: [require("tailwindcss-animate")],
    // This ensures Tailwind doesn't override existing styles
    corePlugins: {
      preflight: false,
    },
  };