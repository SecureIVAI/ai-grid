const config = {
  plugins: {
    'tailwindcss/nesting': {},
    tailwindcss: {
      future: {
        unstable_oxide: false, // Disable Oxide compiler
      }
    },
    autoprefixer: {},
  },
};

export default config;
