/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/views/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      'xs': '320px',
      'sm': '480px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#000000', // Pitch black
          light: '#0a0a0a', // Deep gunmetal/grey
        },
        secondary: {
          DEFAULT: '#a1a1aa', // Muted text
          dark: '#27272a', // Subtle borders
        },
        accent: {
          DEFAULT: '#ffffff', // High contrast
          hover: '#e4e4e7',
          steel: '#3f3f46',
          blue: '#1e3a8a', // Deep blue industrial accent
        },
        // Admin panel design system (Premium Minimalist Dark)
        admin: {
          bg:       '#000000', // Pitch black base
          surface:  '#09090b', // Zinc-950 for cards/sidebar
          elevated: '#18181b', // Zinc-900 for elevated elements
          border:   '#27272a', // Zinc-800 for borders
          muted:    '#71717a', // Zinc-500 for muted text
          text:     '#a1a1aa', // Zinc-400 for regular body text
          heading:  '#fafafa', // Zinc-50 for headings
          accent:   '#fafafa', // Stark white accent
          'accent-dim': '#27272a', // Zinc-800
          'accent-glow': 'rgba(255,255,255,0.05)',
          success:  '#10B981',
          warning:  '#F59E0B',
          danger:   '#EF4444',
          purple:   '#A78BFA',
          indigo:   '#818CF8',
        },
      },
      spacing: {
        'sidebar': '260px',
        'sidebar-collapsed': '72px',
      },
      fontFamily: {
        heading: ['var(--font-space-grotesk)', 'Space Grotesk', 'Inter', 'sans-serif'],
        body: ['var(--font-inter)', 'Inter', 'sans-serif'],
      },
      transitionTimingFunction: {
        'premium': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      letterSpacing: {
        tighter: '-0.04em',
        tight: '-0.02em',
        widest: '0.2em',
      },
    },
  },
  plugins: [],
};
