/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{css,xml,html,vue,svelte,ts,tsx}'],
  // use the .ns-dark class to control dark mode (applied by NativeScript) - since 'media' (default) is not supported.
  darkMode: ['class', '.ns-dark'],
  theme: {
    extend: {
      colors: {
        brut: {
          surface: '#f6f6f4',
          card: '#ffffff',
          container: '#e7e8e6',
          'container-high': '#e1e3e1',
          'container-low': '#f0f1ef',
          ink: '#2d2f2e',
          'ink-light': '#5a5c5b',
          muted: '#767776',
          'muted-light': '#acadac',
          primary: '#005f99',
          'on-primary': '#ecf3ff',
          'primary-light': '#63b4fd',
          'primary-dark': '#003152',
          gold: '#ffd709',
          'on-gold': '#5b4b00',
          'gold-dark': '#6c5a00',
          error: '#b31b25',
          'error-bg': '#fb5151',
          'on-error': '#570008',
        },
      },
      borderWidth: {
        '3': '3',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false, // disables browser-specific resets
  },
}
