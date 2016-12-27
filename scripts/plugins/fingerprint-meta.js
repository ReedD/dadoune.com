'use strict';

module.exports = () => {
	return (files, metalsmith, done) => {
		setImmediate(done);
		const map = metalsmith.metadata().fingerprint;
		Object.keys(files).forEach(file => {
			if (/\.(html|js|json|css)$/.test(file)) {
				const data = files[file];
				if (data.styles) {
					data.styles = data.styles.map(style => map[style]);
				}
				if (data.scripts) {
					data.scripts = data.scripts.map(script => map[script]);
				}
				let contents = data.contents.toString();
				Object.keys(map).forEach(find => {
					contents = contents.split(find).join(map[find]);
				});
				data.contents = new Buffer(contents);
			}
		});
	};
};
