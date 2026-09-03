/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sbs: {
          orange: "#F35C16",
          orangeHover: "#E04F0E",
          orangeLight: "#FFF4EC",
          orangeBadge: "#FFEBE0",
          cream: "#FAF7F2",
          dark: "#1A1A1A",
          muted: "#71717A",
          border: "#F0EBE6",
          green: "#00A859",
          greenLight: "#EBF7F0",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 2px 10px rgba(0, 0, 0, 0.04)",
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.06)",
        float: "0 10px 30px -5px rgba(243, 92, 22, 0.25)",
      },
    },
  },
  plugins: [],
};
