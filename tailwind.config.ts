/**
 * Configuración de Tailwind CSS para el proyecto Kiki
 * @file /Users/higinieduardmoredomingo/Meta Agent - Kick Off Starter/kiki/tailwind.config.ts
 */

import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // KIKI Educational Platform Neobrutalism colors
      colors: {
        main: "var(--main)",
        background: "var(--background)",
        "secondary-background": "var(--secondary-background)",
        foreground: "var(--foreground)",
        "main-foreground": "var(--main-foreground)",
        border: "var(--border)",
        overlay: "var(--overlay)",
        ring: "var(--ring)",
        
        // Status colors
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
        
        // Chart colors  
        "chart-1": "var(--chart-1)",
        "chart-2": "var(--chart-2)",
        "chart-3": "var(--chart-3)",
        "chart-4": "var(--chart-4)",
        "chart-5": "var(--chart-5)",
      },
      spacing: {
        boxShadowX: "var(--box-shadow-x)",
        boxShadowY: "var(--box-shadow-y)",
        reverseBoxShadowX: "var(--reverse-box-shadow-x)",
        reverseBoxShadowY: "var(--reverse-box-shadow-y)",
      },
      borderRadius: {
        base: "var(--border-radius)",
      },
      borderWidth: {
        base: "var(--border-width)",
      },
      boxShadow: {
        shadow: "var(--shadow)",
        none: 'none',
      },
      translate: {
        boxShadowX: 'var(--box-shadow-x)',
        boxShadowY: 'var(--box-shadow-y)',
        reverseBoxShadowX: 'var(--reverse-box-shadow-x)',
        reverseBoxShadowY: 'var(--reverse-box-shadow-y)',
      },
      fontWeight: {
        base: "var(--base-font-weight)",
        heading: "var(--heading-font-weight)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["'Space Mono'", "monospace"],
        base: ["Inter", "system-ui", "sans-serif"],
        heading: ["'Space Mono'", "monospace"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config