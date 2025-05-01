/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        beige: {
          50: "#faf5ec",
          100: "#f5ede0",
          200: "#ead6c2",
          600: "#d2b79a",
          700: "#c4a388",
          800: "#683f14",
          900: "#552800",
          DEFAULT: "#a78452",
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "ping-slow": "ping 3s cubic-bezier(0, 0, 0.2, 1) infinite",
        sparkle: "sparkle 1.5s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-20px) rotate(10deg)" },
        },
        sparkle: {
          "0%, 100%": { opacity: 0, transform: "scale(1)" },
          "50%": { opacity: 1, transform: "scale(1.5)" },
        },
      },
    },
  },
  
  safelist: [
    "bg-beige-50",
    "bg-beige-100",
    "bg-beige-200",
    "bg-beige-600",
    "bg-beige-700",
    "border-beige-600",
    "hover:bg-beige-700",
    "animate-float", // Add animation to safelist if needed
  ],
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  plugins: [],
};
