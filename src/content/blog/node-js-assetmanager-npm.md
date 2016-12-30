---
title: "Node.js assetmanager npm"
subtitle: "A new npm package"
date: 2014-03-15
category: "code"
tags:
  - Node.js
  - npm
  - grunt
  - assetmanager
layout: blog-post.hbs
---

I just created a little assetmanager that I published to npm and git. You can find the git repo for it here:

https://github.com/ReedD/node-assetmanager


### node-assetmanager

Asset manager easily allows you to switch between development and production css and js files in your templates by managing them in a single json file that's still compatible with grunt cssmin and uglify.


#### Usage
To use assetmanager, cd into your project directory and install assetmanager with npm.


```bash
$ cd /to/project/directory
$ npm install assetmanager --save

```

Setup an external json asset configuration file that holds your development and production css and js files. The format of this file matches that used in cssmin and uglify grunt tasks where the key is the name of the output production file and the following array is a list of files that need to be compressed.

**assets.json**

```json
{
	"css": {
		"public/build/css/dist.min.css": [
			"public/lib/bootstrap/dist/css/bootstrap.css",
			"public/css/**/*.css"
		]
	},
	"js": {
		"public/build/js/dist.min.js": [
			"public/lib/angular/angular.js",
			"public/lib/angular-cookies/angular-cookies.js",
			"public/lib/angular-resource/angular-resource.js",
			"public/lib/angular-ui-router/release/angular-ui-router.js",
			"public/lib/angular-bootstrap/ui-bootstrap.js",
			"public/lib/angular-bootstrap/ui-bootstrap-tpls.js",
			"public/js/**/*.js"
		]
	}
}

```

This way in your `gruntfile` you can easily import the same `assets.json` config file and plop in the respective values for css and js.

**gruntfile.js**

```javascript
'use strict';

module.exports = function(grunt) {
	// Project Configuration
	grunt.initConfig({
		assets: grunt.file.readJSON('config/assets.json'),
		uglify: {
			production: {
				options: {
					mangle: true,
					compress: true
				},
				files: '<%= assets.js %>'
			}
		},
		cssmin: {
			combine: {
				files: '<%= assets.css %>'
			}
		}
	});

	//Load NPM tasks
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	//Making grunt default to force in order not to break the project.
	grunt.option('force', true);

	//Default task(s).
	grunt.registerTask('default', ['cssmin', 'uglify']);

};

```

Then in your node app require `assetmanager`, the example below is partial code from an express setup. Call `assetmanager.init` with your files from your `assets.json` config file. Set the `debug` value to toggle between your compressed files and your development files. You can also set the `webroot` value so that when assetmanager processes your files it will change `public/lib/angular/angular.js` to `/lib/angular/angular.js` so that everything is relative to your webroot.

```javascript
'use strict';

/**
 * Module dependencies.
 */
var express = require('express'),
	assetmanager = require('assetmanager');

module.exports = function(app, passport, db) {

	app.configure(function() {
		// Import your asset file
		var assets = require('./assets.json');
		assetmanager.init({
			js: assets.js,
			css: assets.css,
			debug: (process.env.NODE_ENV !== 'production'),
			webroot: 'public'
		});
		// Add assets to local variables
		app.use(function (req, res, next) {
			res.locals({
				assets: assetmanager.assets
			});
			next();
		});

		// ... Your CODE

	});

	// ... Your CODE

};
```
Then finally in your template you can output them with whatever templating framework you use. Using swig your template might look something like this:

```html
{% for file in assets.css %}
	<link rel="stylesheet" href="{{file}}">
{% endfor %}

{% for file in assets.js %}
	<script type="text/javascript" src="{{file}}"></script>
{% endfor %}

```

And that's it, if you have any question feel free to leave a comment.
