'use strict';

module.exports = () => {

	return (files, metalsmith, done) => {
		setImmediate(done);
		Object.keys(files).forEach(file => {
			const data = files[file];
			if (data.pagination || file.match(/\.(md|html)$/)) {
				const scripts = files[file].scripts || [];
				// Add `bundle.js` if not already included
				if (scripts.indexOf('bundle.js') === -1) {
					scripts.unshift('bundle.js');
				}
				files[file].scripts = scripts.map(script => `assets/js/${script}`);
			}
		});
	};
};
