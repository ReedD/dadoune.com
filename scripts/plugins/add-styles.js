'use strict';

module.exports = () => {
	return (files, metalsmith, done) => {
		setImmediate(done);
		Object.keys(files).forEach(file => {
			const data = files[file];
			if (data.pagination || file.match(/\.(md|html)$/)) {
				const styles = files[file].styles || [];
				// Add `styles.css` if not already included
				if (styles.indexOf('styles.css') === -1) {
					styles.unshift('styles.css');
				}
				files[file].styles = styles.map(style => `assets/css/${style}`);
			}
		});
	};
};
