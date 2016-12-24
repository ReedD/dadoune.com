'use strict';

const minimatch    = require('minimatch');
const postcss      = require('postcss');
const sassSyntax   = require('postcss-scss');
const autoprefixer = require('autoprefixer');

module.exports = () => {
	return (files, metalsmith, done) => {
		setImmediate(done);
		const processor = postcss([autoprefixer]);
		Object.keys(files)
			.filter(minimatch.filter('*.scss', {matchBase: true}))
			.forEach(file => {
				const originalContents = files[file].contents.toString();
				const prefixedContents = processor.process(originalContents, {
					syntax: sassSyntax
				}).css;
				files[file].contents = new Buffer(prefixedContents);
			});
	};
};
