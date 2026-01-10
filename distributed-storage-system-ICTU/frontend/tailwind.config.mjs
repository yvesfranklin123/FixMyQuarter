/** @type {import('tailwindcss').Config} */
export default {
  // Dis à Tailwind où chercher tes classes pour générer le CSS
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // Ajout des couleurs pour ton design paroxysmique
        nexus: {
          blue: "#2563eb",
          dark: "#050505",
          red: "#dc2626",
        }
      },
      borderRadius: {
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      animation: {
        "spin-slow": "spin 8s linear infinite",
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
  darkMode: "class",
};