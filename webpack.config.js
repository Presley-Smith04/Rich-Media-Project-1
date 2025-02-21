/* This is our webpack configuration file. We create the webpack.config.js
   file in the root folder of our project and use it to define how webpack
   should construct our client side code bundle.

   Webpack's own description of this file can be found here: https://webpack.js.org/configuration/
   A tool for generating these files: https://createapp.dev/webpack/
*/

// Import node's path library
const path = require('path');

// Our actual configuration is an object exported by this file.
module.exports = {
    /* Entry defines the main file that our bundle should begin with.
       If this entry file uses require() statements to import other code
       files, they will be recursively included. Meaning that if those
       files also require() other files, they too will be included.
    */
    entry: './client/client.js',

    /* The mode determines the type of build process and output webpack
       should use. Our config file will use the "development" mode, which will make
       it easy to debug our client code. When Heroku builds our code, it will use
       the "production" mode, which will be minified. Heroku does this by calling
       our heroku-postbuild script after downloading and installing everything.
    */
    mode: 'development',

    /* The watch boolean determines if the webpack command (which we have in
        our package.json as 'npm run build') will execute once (set to false)
        or will watch our client code for changes and rebuild on changes (set to true).
        Using true will allow us to keep the build script running and will speed up
        our development time since we do not need to manually rerun builds after every
        edit.

        Watch options gives some extra configuration options for the watch functionality.
        The aggregateTimeout adds a slight delay to the build. This combines any rebuild
        events fired in quick succession (such as pressing ctrl+s multiple times quickly)
        into a single rebuild.
    */
    //watch: true,
    watchOptions: {
        aggregateTimeout: 200,
    },

    // The output object defines various things about the output bundle.
    output: {
        /* The path specifies where the bundle will be placed in our code project.
           In this case, we use the path library to resolve a filepath to the hosted
           folder.
        */
        path: path.resolve(__dirname, 'hosted'),

        // The filename determines the name of the build bundle file.
        filename: 'bundle.js',
    },
};
