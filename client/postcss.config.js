const autoprefixer = require("autoprefixer");

// Replace deprecated color-adjust with print-color-adjust before autoprefixer runs.
const replaceColorAdjust = () => ({
  postcssPlugin: "replace-color-adjust",
  Declaration(decl) {
    if (decl.prop === "color-adjust") {
      decl.prop = "print-color-adjust";
    }
  },
});
replaceColorAdjust.postcss = true;

module.exports = {
  plugins: [replaceColorAdjust(), autoprefixer],
};
