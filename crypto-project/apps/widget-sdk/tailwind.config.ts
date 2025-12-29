// Dosya: apps/widget-sdk/tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}", // 👈 Burası app klasörüne bakmasını söyler
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "rgb(var(--color-primary) / <alpha-value>)",
                secondary: "rgb(var(--color-secondary) / <alpha-value>)",
                background: "rgb(var(--color-bg) / <alpha-value>)",
                foreground: "rgb(var(--color-text) / <alpha-value>)",
            },
            borderRadius: {
                btn: "var(--radius-btn)",
                card: "var(--radius-card)",
            },
        },
    },
    plugins: [],
};
export default config;