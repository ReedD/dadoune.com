'use strict';

const angular = require('angular');

angular
	.module('disqus', [])
	.provider('disqus', function DisqusProvider() {
		let shortName = '';
		this.setShortName = function (name) {
			shortName = name;
		};
		this.$get = [function discusFactory () {
			return {
				getShortName: function () {
					return shortName;
				}
			}
		}];
	})
	.directive('disqus', ['$window', '$timeout', '$location', 'disqus',
	function ($window, $timeout, $location, disqus)  {
		let disqusLoaded = null;
		function initDisqus () {
			if (disqusLoaded) return disqusLoaded;
			disqusLoaded = new Promise(function (resolve, reject) {
				const shortName  = disqus.getShortName();
				const scriptTag  = document.createElement('script');
				scriptTag.src    = `https://${shortName}.disqus.com/embed.js`;
				scriptTag.onload = function () {
					resolve();
				};
				scriptTag.setAttribute('data-timestamp', + new Date());
				document.body.appendChild(scriptTag);
			});
			return disqusLoaded;
		}
		function reset (url) {
			if (!$window.DISQUS) {
				console.error('Disqus is not loaded.');
			}
			$window.DISQUS.reset({
				reload: true,
				config: function () {
					this.page.url = url;
				}
			});
		}
		return {
			restrict: 'E',
			replace: true,
			template: '<div id="disqus_thread"></div>',
			link: function (scope, element, attrs) {
				$timeout(function () {
					if (!document.body.contains(element[0])) return;
					initDisqus()
						.then(function () {
							reset($location.absUrl());
						});
				});
			}
		};
	}]);

module.exports = 'disqus';
