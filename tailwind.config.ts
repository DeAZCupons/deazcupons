import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // Habilita o dark mode via classe no <html>
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;