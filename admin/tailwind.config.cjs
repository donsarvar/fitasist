module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: '#4f6bff',
        'brand-indigo': '#7b5cff',
        background: 'var(--background)',
        surface: 'var(--surface)',
        'surface-elevated': 'var(--surface-elevated)',
        'secondary-bg': 'var(--secondary-bg)',
        border: 'var(--border)',
        divider: 'var(--divider)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        success: '#22c55e',
        warning: '#f59e0b',
        destructive: '#ef4444',
        info: '#38bdf8',
      },
      boxShadow: {
        soft: '0 6px 18px rgba(15, 23, 42, 0.05)',
        card: '0 12px 40px rgba(15, 23, 42, 0.08)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #4f6bff 0%, #7b5cff 100%)',
      },
    },
  },
  plugins: [],
}
