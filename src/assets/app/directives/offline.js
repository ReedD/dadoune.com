'use strict';

const angular = require('angular');

function findAncestor (el, sel) {
	while ((el = el.parentElement) && !((el.matches || el.matchesSelector).call(el,sel)));
	return el;
}

angular
	.module('offline', [])
	.directive('uiSref', [
		'$window',
		function ($window)  {
			function getCache () {
				return $window.caches
					.open('v{{ PACKAGE.VERSION }}::pages')
					.then(cache => {
						return cache.keys();
					})
					.then(keys => {
						return keys.map(req => req.url);
					});
			}
			return {
				restrict: 'A',
				link: function (scope, element, attrs) {
					if (!$window.caches) return;
					const ancestor = findAncestor(element[0], '[offline]');
					function wentOffline () {
						return getCache()
							.then(cachedUrls => {
								const full    = `${$window.location.origin}${attrs.href}`;
								const partial = `${$window.location.origin}/partials${attrs.href}`;
								if (cachedUrls.includes(full)) {
									element[0].setAttribute('target', '_self');
								}
								if (!ancestor) return;
								if (cachedUrls.includes(partial) || cachedUrls.includes(full)) {
									ancestor.setAttribute('offline', 'available');
								} else {
									ancestor.setAttribute('offline', 'unavailable');
								}
							});
					}
					function cameOnline () {
						element[0].removeAttribute('target');
						if (!ancestor) return;
						ancestor.setAttribute('offline', 'available');
					}
					if (!window.navigator.onLine) {
						wentOffline();
					}
					$window.addEventListener('offline', wentOffline, false);
					$window.addEventListener('online',  cameOnline,  false);
				}
			};
		}
	]);

module.exports = 'offline';
