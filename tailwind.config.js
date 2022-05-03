module.exports = {
  content: [
      "./src/**/*.{html, js, jsx}",
      "./src/tablist/tablist.jsx",
      "./src/popup/popup.jsx"
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
}
