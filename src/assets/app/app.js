'use strict';

const angular = require('angular');
const modules = [
	require('angular-ui-router'),
	require('angulartics'),
	require('angulartics-google-analytics'),
	require('angular-disqus-comments'),
	require('./directives/gist'),
	require('./directives/offline')
];

angular
	.module('dadoune', modules)
	.config(['$locationProvider', '$interpolateProvider',
		function ($locationProvider, $interpolateProvider) {
			$locationProvider.html5Mode(true);
			$interpolateProvider.startSymbol('[[').endSymbol(']]');
		}
	])
	.config(['disqusCommentsProvider', function (disqusProvider) {
		disqusProvider.shortName = __disqusShortName;
	}])
	.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

		// 404
		$urlRouterProvider.otherwise('/404/');

		// Page routes
		$stateProvider
			.state('home', {
				url: '/',
				views: {
					'main@': {
						templateUrl: 'partials/'
					}
				}
			});

		// Page routes
		$stateProvider
			.state('page', {
				url: '/{name:projects|404|offline}/',
				views: {
					'main@': {
						templateUrl: function ($stateParams) {
							return `partials/${$stateParams.name}/`;
						}
					}
				}
			});

		// Blog routes
		$stateProvider
			.state('blog', {
				url: '/blog/',
				views: {
					'main@': {
						templateUrl: function () {
							return `partials/blog/`;
						}
					}
				}
			})
			.state('blog.tag', {
				url: 'tag/{tag:[0-9a-z\-]+}/',
				views: {
					'main@': {
						templateUrl: function ($stateParams) {
							return `partials/blog/tag/${$stateParams.tag}/`;
						}
					}
				}
			})
			.state('blog.index', {
				url: '{page:[0-9]+}/',
				views: {
					'main@': {
						templateUrl: function ($stateParams) {
							return `partials/blog/${$stateParams.page}/`;
						}
					}
				}
			})
			.state('blog.post', {
				url: ':title/',
				views: {
					'main@': {
						templateUrl: function ($stateParams) {
							return `partials/blog/${$stateParams.title}/`;
						}
					}
				}
			});

	}])
	.run(['$rootScope', '$state',  function ($rootScope, $state) {
		angular.element(document.body).removeClass(window.bodyClasses);
		$rootScope.bodyClasses = window.bodyClasses;
		$rootScope.$on('$stateChangeSuccess', function (event, toState, toStateParams) {
			let bodyClasses;
			if (toState.name === 'page') {
				bodyClasses = `${toState.name}-${toStateParams.name}`;
			} else {
				bodyClasses = toState.name;
			}
			bodyClasses = bodyClasses.replace('.', '-');
			$rootScope.bodyClasses = bodyClasses;
		});
		$rootScope.$on('$stateNotFound', function () {
			$state.go('404');
		});
		$rootScope.$on('$stateChangeError', function () {
			$state.go('404');
		});
	}]);

angular
	.element(document)
	.ready(function () {
		angular.bootstrap(document, ['dadoune']);
	});
