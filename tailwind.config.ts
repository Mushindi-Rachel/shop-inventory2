import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#14181f",
          900: "#1b212b",
          800: "#242c39",
          700: "#333e50",
          600: "#4a586f",
          500: "#6b7a92",
          400: "#93a1b5",
          300: "#c1cad6",
          200: "#dfe4ea",
          100: "#eef1f4",
          50: "#f7f8fa",
        },
        tag: {
          DEFAULT: "#e8a539",
          dark: "#c9861f",
          light: "#fbeecd",
        },
        leaf: {
          DEFAULT: "#4d7c62",
          light: "#e4efe8",
        },
        rust: {
          DEFAULT: "#b5533c",
          light: "#f6e4de",
        },
      },
      fontFamily: {
        display: ["Ubuntu", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "8px",
        lg: "12px",
      },
    },
  },
  plugins: [],
};
export default config;
