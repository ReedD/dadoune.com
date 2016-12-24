'use strict';

module.exports = () => {
	return (files, metalsmith, done) => {
		setImmediate(done);
		Object.keys(files).forEach(file => {
			if (/\.(html)$/.test(file)) {
				const data         = files[file];
				const contents     = data.contents.toString();
				const partialStart = /<!-- BEGIN PARTIAL (.*?) -->/g;

				// Extract partials
				for (let startMatch; startMatch = partialStart.exec(contents);) { // eslint-disable-line no-cond-assign
					const partialEnd   = /<!-- END PARTIAL -->/;
					let partialContent = contents.substring(startMatch.index + startMatch[0].length);
					const endMatch     = partialEnd.exec(partialContent);

					// Determine where the partial ends
					if (!endMatch) throw new Error('Invalid partial structure, missing end tag.');
					partialContent = partialContent.substring(0, endMatch.index);

					// Add partial to files array
					const partialPath  = startMatch[1];
					files[partialPath] = {
						mode: data.mode,
						contents: new Buffer(partialContent)
					};
				}
			}
		});

	};
};
