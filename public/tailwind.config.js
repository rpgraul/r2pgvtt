/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{svelte,js,ts}'],
  theme: {
    extend: {
      colors: {
        border: 'oklch(var(--color-border))',
        input: 'oklch(var(--color-input))',
        ring: 'oklch(var(--color-ring))',
        background: 'oklch(var(--color-background))',
        foreground: 'oklch(var(--color-foreground))',
        primary: {
          DEFAULT: 'oklch(var(--color-primary))',
          foreground: 'oklch(var(--color-primary-foreground))',
        },
        secondary: {
          DEFAULT: 'oklch(var(--color-secondary))',
          foreground: 'oklch(var(--color-secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'oklch(var(--color-destructive))',
          foreground: 'oklch(var(--color-destructive-foreground))',
        },
        muted: {
          DEFAULT: 'oklch(var(--color-muted))',
          foreground: 'oklch(var(--color-muted-foreground))',
        },
        accent: {
          DEFAULT: 'oklch(var(--color-accent))',
          foreground: 'oklch(var(--color-accent-foreground))',
        },
        popover: {
          DEFAULT: 'oklch(var(--color-popover))',
          foreground: 'oklch(var(--color-popover-foreground))',
        },
        card: {
          DEFAULT: 'oklch(var(--color-card))',
          foreground: 'oklch(var(--color-card-foreground))',
        },
        success: {
          DEFAULT: 'oklch(var(--color-success))',
          foreground: 'oklch(var(--color-success-foreground))',
        },
        warning: {
          DEFAULT: 'oklch(var(--color-warning))',
          foreground: 'oklch(var(--color-warning-foreground))',
        },
        info: {
          DEFAULT: 'oklch(var(--color-info))',
          foreground: 'oklch(var(--color-info-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
