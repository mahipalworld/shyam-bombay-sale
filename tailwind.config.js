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
          orange: "#FF6600",
          orangeHover: "#E65C00",
          orangeLight: "#FFF4EA",
          orangeBadge: "#FFEAD9",
          cream: "#FAF7F2",
          black: "#0F0F0F",
          dark: "#0F0F0F",
          secondaryDark: "#1F2937",
          lightGray: "#E5E7EB",
          warmBg: "#FFF4EA",
          muted: "#71717A",
          border: "#E5E7EB",
          green: "#059669",
          greenLight: "#ECFDF5",
        },
      },
      fontFamily: {
        sans: ["var(--font-brand)", "var(--font-inter)", "system-ui", "sans-serif"],
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
