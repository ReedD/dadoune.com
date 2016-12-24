'use strict';

module.exports = () => {
	return (files, metalsmith, done) => {
		setImmediate(done);
		const meta = metalsmith.metadata().package;
		Object.keys(files).forEach(file => {
			if (/\.(js)$/.test(file)) {
				const data = files[file];
				let contents = data.contents.toString();
				contents = contents.replace('{{ PACKAGE.VERSION }}', meta.version);
				data.contents = new Buffer(contents);
			}
		});
	};
};
