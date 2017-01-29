'use strict';

module.exports = () => {
	return (files, metalsmith, done) => {
		setImmediate(done);
		Object.keys(files).forEach(file => {
			if (/\.(html)$/.test(file)) {
				const data        = files[file];
				let   contents    = data.contents.toString();
				const inlineRegex = /<!-- INLINE (.*?) -->/g;

				// Extract partials
				for (let match; match = inlineRegex.exec(contents);) { // eslint-disable-line no-cond-assign
					const fullMatch  = match[0];
					const inlinePath = match[1];
					const inlineFile = files[inlinePath];
					if (!inlineFile) {
						throw new Error(`Inline path '${inlinePath}' dosen't exist.`);
					}
					const inlineContents = inlineFile.contents.toString();
					contents = contents.replace(fullMatch, inlineContents);
				}
				data.contents = new Buffer(contents);
			}
		});

	};
};
