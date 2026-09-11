/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#ffffff",
          muted: "#d1d5db",
          faint: "#9ca3af",
        },
        canvas: {
          DEFAULT: "#121212",
          elevated: "#1e1e1e",
          subtle: "#2a2a2a",
        },
        accent: {
          DEFAULT: "#9333ea",
          hover: "#7e22ce",
          soft: "rgba(147, 51, 234, 0.15)",
          ring: "#a855f7",
        },
        danger: {
          DEFAULT: "#f87171",
          soft: "rgba(127, 29, 29, 0.35)",
          border: "rgba(127, 29, 29, 0.5)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 8px 24px rgba(0, 0, 0, 0.35)",
      },
      spacing: {
        18: "4.5rem",
      },
    },
  },
  plugins: [],
}
