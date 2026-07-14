import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#1F3864",
        teal: "#0F766E",
        paper: "#F7F9FC",
      },
    },
  },
  plugins: [],
};

export default config;
