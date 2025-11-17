const tokens = require('./tokens.tailwind.cjs')

module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: tokens.colors || {},
      fontFamily: tokens.fontFamily || {},
      spacing: tokens.spacing || {},
      screens: tokens.screens || {},
    },
  },
  plugins: [],
}
