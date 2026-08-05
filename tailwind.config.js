import plugin from "tailwindcss/plugin.js";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {},
  },
  plugins: [
    plugin(({ addComponents }) => {
      addComponents({
        ".admin-light-scope": {
          colorScheme: "light",
        },

        ".admin-light-scope .bg-black, .admin-light-scope .bg-neutral-950, .admin-light-scope .bg-neutral-900, .admin-light-scope .bg-slate-950, .admin-light-scope .bg-slate-900, .admin-light-scope .bg-zinc-950, .admin-light-scope .bg-zinc-900, .admin-light-scope .bg-gray-950, .admin-light-scope .bg-gray-900, .admin-light-scope .bg-stone-950, .admin-light-scope .bg-stone-900": {
          backgroundColor: "#ffffff !important",
          backgroundImage: "none !important",
        },

        ".admin-light-scope .bg-neutral-800, .admin-light-scope [class~='bg-neutral-800/80'], .admin-light-scope [class~='bg-neutral-800/70'], .admin-light-scope [class~='bg-neutral-800/60'], .admin-light-scope [class~='bg-neutral-800/50'], .admin-light-scope [class~='bg-white/5']": {
          backgroundColor: "#f1f5f9 !important",
        },

        ".admin-light-scope [class~='bg-[#05080a]'], .admin-light-scope [class~='bg-[#080808]'], .admin-light-scope [class~='bg-[#090909]'], .admin-light-scope [class~='bg-[#090a0b]'], .admin-light-scope [class~='bg-[#0a0a0a]'], .admin-light-scope [class~='bg-[#0a0b0c]'], .admin-light-scope [class~='bg-[#0b0b0b]'], .admin-light-scope [class~='bg-[#0d0d0d]'], .admin-light-scope [class~='bg-[#101010]'], .admin-light-scope [class~='bg-[#101112]'], .admin-light-scope [class~='bg-[#111111]'], .admin-light-scope [class~='bg-[#121212]'], .admin-light-scope [class~='bg-[#141414]'], .admin-light-scope [class~='bg-[#151515]'], .admin-light-scope [class~='bg-[#181818]']": {
          backgroundColor: "#ffffff !important",
          backgroundImage: "none !important",
        },

        ".admin-light-scope [class~='bg-[#08090a]'], .admin-light-scope [class~='bg-[#171717]']": {
          backgroundColor: "#f8fafc !important",
        },

        ".admin-light-scope [class~='bg-[#191919]']": {
          backgroundColor: "#eef2f7 !important",
        },

        ".admin-light-scope [class~='bg-[#101010]/95'], .admin-light-scope [class~='bg-[#0b0b0b]/90']": {
          backgroundColor: "rgb(255 255 255 / 0.96) !important",
          backgroundImage: "none !important",
        },

        ".admin-light-scope [class~='bg-[#0b2427]']": {
          backgroundColor: "#ecfeff !important",
        },
        ".admin-light-scope [class~='bg-[#2a2110]']": {
          backgroundColor: "#fff4e6 !important",
        },
        ".admin-light-scope [class~='bg-[#101928]']": {
          backgroundColor: "#eff6ff !important",
        },
        ".admin-light-scope [class~='bg-[#191326]']": {
          backgroundColor: "#f5f3ff !important",
        },
        ".admin-light-scope [class~='bg-[#102126]']": {
          backgroundColor: "#ecfeff !important",
        },

        ".admin-light-scope .text-white, .admin-light-scope .text-neutral-50, .admin-light-scope .text-neutral-100, .admin-light-scope .text-slate-50, .admin-light-scope .text-slate-100": {
          color: "#0f172a !important",
        },
        ".admin-light-scope .text-neutral-200, .admin-light-scope .text-slate-200": {
          color: "#1e293b !important",
        },
        ".admin-light-scope .text-neutral-300, .admin-light-scope .text-neutral-400, .admin-light-scope .text-slate-300, .admin-light-scope .text-slate-400": {
          color: "#475569 !important",
        },
        ".admin-light-scope .text-neutral-500, .admin-light-scope .text-neutral-600, .admin-light-scope .text-slate-500, .admin-light-scope .text-slate-600": {
          color: "#64748b !important",
        },

        ".admin-light-scope .text-cyan-100, .admin-light-scope .text-cyan-200, .admin-light-scope .text-cyan-300, .admin-light-scope .text-cyan-400": {
          color: "#0e7490 !important",
        },
        ".admin-light-scope .text-emerald-100, .admin-light-scope .text-emerald-200, .admin-light-scope .text-emerald-300, .admin-light-scope .text-emerald-400": {
          color: "#047857 !important",
        },
        ".admin-light-scope .text-amber-100, .admin-light-scope .text-amber-200, .admin-light-scope .text-amber-300, .admin-light-scope .text-amber-400": {
          color: "#92400e !important",
        },
        ".admin-light-scope .text-orange-100, .admin-light-scope .text-orange-200, .admin-light-scope .text-orange-300, .admin-light-scope .text-orange-400": {
          color: "#c2410c !important",
        },
        ".admin-light-scope .text-red-100, .admin-light-scope .text-red-200, .admin-light-scope .text-red-300, .admin-light-scope .text-red-400": {
          color: "#b91c1c !important",
        },
        ".admin-light-scope .text-blue-100, .admin-light-scope .text-blue-200, .admin-light-scope .text-blue-300, .admin-light-scope .text-blue-400": {
          color: "#1d4ed8 !important",
        },
        ".admin-light-scope .text-violet-100, .admin-light-scope .text-violet-200, .admin-light-scope .text-violet-300, .admin-light-scope .text-violet-400, .admin-light-scope .text-purple-100, .admin-light-scope .text-purple-200, .admin-light-scope .text-purple-300, .admin-light-scope .text-purple-400": {
          color: "#6d28d9 !important",
        },

        ".admin-light-scope button.text-white, .admin-light-scope a.text-white, .admin-light-scope .bg-cyan-600.text-white, .admin-light-scope .bg-cyan-500.text-white, .admin-light-scope .bg-emerald-600.text-white, .admin-light-scope .bg-red-600.text-white, .admin-light-scope .bg-violet-600.text-white": {
          color: "#ffffff !important",
        },

        ".admin-light-scope .border-black, .admin-light-scope .border-neutral-950, .admin-light-scope .border-neutral-900, .admin-light-scope .border-neutral-800, .admin-light-scope [class~='border-neutral-800/90'], .admin-light-scope [class~='border-neutral-800/80'], .admin-light-scope [class~='border-neutral-800/60'], .admin-light-scope .border-slate-800": {
          borderColor: "#cbd5e1 !important",
        },
        ".admin-light-scope .border-neutral-700, .admin-light-scope .border-neutral-600, .admin-light-scope .border-slate-700": {
          borderColor: "#94a3b8 !important",
        },

        ".admin-light-scope input:not([type='checkbox']):not([type='radio']), .admin-light-scope select, .admin-light-scope textarea": {
          backgroundColor: "#ffffff !important",
          borderColor: "#cbd5e1 !important",
          color: "#0f172a !important",
          colorScheme: "light",
        },
        ".admin-light-scope input::placeholder, .admin-light-scope textarea::placeholder": {
          color: "#94a3b8 !important",
        },
        ".admin-light-scope input:disabled, .admin-light-scope select:disabled, .admin-light-scope textarea:disabled": {
          backgroundColor: "#f1f5f9 !important",
          color: "#64748b !important",
          opacity: "1 !important",
        },

        ".admin-light-scope button.bg-neutral-900, .admin-light-scope button.bg-neutral-800, .admin-light-scope button[class~='bg-[#08090a]'], .admin-light-scope button[class~='bg-[#171717]']": {
          backgroundColor: "#ffffff !important",
          borderColor: "#cbd5e1 !important",
          color: "#334155 !important",
        },
        ".admin-light-scope button.bg-white.text-black": {
          backgroundColor: "#0891b2 !important",
          borderColor: "#0891b2 !important",
          color: "#ffffff !important",
        },

        ".admin-light-scope table": {
          color: "#1e293b",
        },
        ".admin-light-scope td, .admin-light-scope th": {
          borderColor: "#cbd5e1 !important",
        },
        ".admin-light-scope thead[class*='bg-[#'], .admin-light-scope th[class*='bg-[#']": {
          backgroundColor: "#eef2f7 !important",
          color: "#334155 !important",
        },
      });
    }),
  ],
};
