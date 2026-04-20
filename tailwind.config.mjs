/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        ink: '#0a0a0a',         // primary black
        paper: '#fafaf7',       // warm white
        electric: '#00ff88',    // electric green (primary accent)
        ember: '#ff5e3a',       // ember orange (secondary accent)
        graphite: '#1a1a1a',    // dark card background
        muted: '#6b6b6b',       // muted gray
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Menlo"', 'monospace'],
        display: ['"Fraunces"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '70ch',
          },
        },
      },
    },
  },
  plugins: [],
};
