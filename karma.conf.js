module.exports = function(config) {
  config.set({
    frameworks: ["jasmine"],
    reporters: ["spec"],
    browsers: ["PhantomJS"],

    phantomjsLauncher: {
      exitOnResourceError: true
    },

    files: [
      "build/public/js/app.js",
      "test/*.spec.js"
    ]
  })
};
