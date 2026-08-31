/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        canvas: "var(--bg)",
        canvas2: "var(--bg2)",
        card: "var(--card)",
        line: "var(--line)",
        ink: "var(--tx)",
        ink2: "var(--tx2)",
        ink3: "var(--tx3)",
        violet: "var(--violet)",
        cy: "var(--cyan)",
        pk: "var(--pink)",
        amb: "var(--amber)",
        grn: "var(--green)",
        background: "var(--bg)",
        foreground: "var(--tx)",
        border: "var(--line)",
        input: "var(--line)",
        ring: "var(--violet)",
        primary: { DEFAULT: "var(--violet)", foreground: "var(--bg)" },
        secondary: { DEFAULT: "var(--bg2)", foreground: "var(--tx)" },
        muted: { DEFAULT: "var(--bg2)", foreground: "var(--tx3)" },
        accent: { DEFAULT: "var(--bg2)", foreground: "var(--tx)" },
        destructive: { DEFAULT: "var(--pink)", foreground: "#ffffff" },
        popover: { DEFAULT: "var(--card)", foreground: "var(--tx)" },
      },
      fontFamily: {
        display: ["Manrope", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      keyframes: {
        marquee: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
        blink: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.2" } },
        "pulse-ring": {
          "0%": { transform: "scale(1)", opacity: "0.7" },
          "100%": { transform: "scale(2.4)", opacity: "0" },
        },
      },
      animation: {
        marquee: "marquee 46s linear infinite",
        blink: "blink 1.5s ease-in-out infinite",
        "pulse-ring": "pulse-ring 1.8s cubic-bezier(0.2,0.6,0.4,1) infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
