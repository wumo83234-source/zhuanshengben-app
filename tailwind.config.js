/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans SC"', '"Microsoft YaHei"', "sans-serif"],
      },
      colors: {
        sage: {
          50: "#f4f7f4",
          100: "#e8ece8",
          200: "#d1ddd1",
          300: "#b2c4b2",
          400: "#a2b5a5",
          500: "#7e9682",
          600: "#5f7362",
          700: "#4f5e52",
        },
        roseAccent: "#eac8d1",
        blueAccent: "#c0cfe6",
        iceAccent: "#d4e0ee",
        charcoal: "#1b1b1b",
        softGray: "#f6f8f6",
      },
      boxShadow: {
        device: "0 32px 80px rgba(27, 27, 27, 0.14), 0 0 0 10px #e8ece8",
        panel: "0 18px 48px rgba(95, 115, 98, 0.13)",
      },
    },
  },
  plugins: [],
};
