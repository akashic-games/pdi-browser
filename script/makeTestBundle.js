var path = require("path");
var browserify = require("browserify");
var glob = require("glob");

// set up the browserify instance on a task basis
// https://github.com/gulpjs/gulp/blob/master/docs/recipes/browserify-transforms.md を参考に
var b = browserify({
	entries: glob.sync(path.resolve(__dirname, "../spec/**/*[sS]pec.js")),
	debug: true
});
b.bundle().pipe(process.stdout);
