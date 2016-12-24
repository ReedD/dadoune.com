'use strict';

const angular = require('angular');
const modules = [
	require('angular-ui-router'),
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
		$rootScope.$on('$stateChangeSuccess', function (event, toState, toStateParams) {
			if (toState.name === 'page') {
				$rootScope.bodyClasses = `${toState.name}-${toStateParams.name}`;
			} else {
				$rootScope.bodyClasses = toState.name;
			}
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
