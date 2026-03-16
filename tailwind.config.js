/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        page:    "var(--bg)",
        card:    "var(--surf)",
        card2:   "var(--surf2)",
        card3:   "var(--surf3)",
        line:    "var(--border)",
        lineh:   "var(--bh)",
        vis:     "var(--vis)",
        "vis-s": "var(--vis-s)",
        hear:    "var(--hear)",
        "hear-s":"var(--hear-s)",
        tx:      "var(--text)",
        dim:     "var(--dim)",
        mute:    "var(--mute)",
        ok:      "var(--green)",
        err:     "var(--red)",
      },
      fontFamily: {
        display: ["Syne", "sans-serif"],
        body:    ["Outfit", "sans-serif"],
      },
      borderRadius: {
        main: "16px",
        sm:   "10px",
      },
      animation: {
        rise: "rise 0.45s ease both",
      },
      keyframes: {
        rise: {
          from: { opacity: "0", transform: "translateY(14px)" },
          to:   { opacity: "1", transform: "none" },
        },
      },
    },
  },
  plugins: [],
};
