'use strict';

const path = require('path');

module.exports = function () {
	let args = Array.from(arguments);
	const method = args[0];
	return path[method].apply(this, args.slice(1, -1));
};
