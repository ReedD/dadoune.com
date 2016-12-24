'use strict';

const _      = require('lodash');
const axios  = require('axios');
const github = axios.create({
  baseURL: 'https://api.github.com/'
});

module.exports = (opts) => {
	if (!opts.path) {
		throw new Error(`Missing 'page' key.`)
	}
	if (!opts.layout) {
		throw new Error(`Missing 'layout' key.`)
	}
	return (files, metalsmith, done) => {
		if (files[opts.path]) {
			throw new Error(`'${opts.path}' already exists.`);
		}
		const file = {
			title: opts.title,
			layout: opts.layout,
			contents: new Buffer('')
		};
		files[opts.path] = file;

		// Get github data
		const promises = [];
		_.each(opts.endpoints, function (endpoint, key) {
			const promise = github
				.get(endpoint)
				.then(function (result) {
					file[key] = _.get(result, 'data');
				});
			promises.push(promise);
		});

		const colors = axios
			.get('https://raw.githubusercontent.com/doda/github-language-colors/master/colors.json')
			.then(function (result) {
				file['colors'] = _.get(result, 'data');
			});
		promises.push(colors);

		Promise.all(promises)
			.then(function () {
				done();
			})
			.catch(function (e) {
				done(e);
			});
	};
};
