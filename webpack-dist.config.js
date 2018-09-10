let config = require('@ucd-lib/cork-app-build').dist({
  // root directory, all paths below will be relative to root
  root : __dirname,
  // path to your entry .js file
  entry : 'src/elements/library-self-checkout/library-self-checkout.js',
  // folder where bundle.js and ie-bundle.js will be written
  dist : 'src/assets',
  // path your client (most likely installed via yarn) node_modules folder.
  // Due to the flat:true flag of yarn, it's normally best to separate
  // client code/libraries from all other modules (ex: build tools such as this).
  clientModules : 'src/elements/library-self-checkout/node_modules'
});

module.exports = config;
