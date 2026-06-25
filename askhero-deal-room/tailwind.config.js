import forms from "@tailwindcss/forms";

const tailwindConfig = {
  content: ["./client/index.html", "./client/src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        "bg-primary": "#0a0c0f",
        "bg-card": "#111418",
        "bg-dark": "#0d1014",
        "border-default": "#1e2228",
        gold: "#c8a96e",
        "gold-light": "#e8c97a",
        success: "#4ade80",
        info: "#60a5fa",
        "text-primary": "#e8e4dc",
        "text-muted": "#666666"
      }
    }
  },
  plugins: [forms]
};

export default tailwindConfig;
