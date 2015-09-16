/**
 * The main app module
 *
 * @type {angular.Module}
 */

angular.module('services', []).factory('aerobatic', function($window) {
  return $window.__config__;
});

angular.module('controllers', ['services']);
angular.module('directives', ['services']);
angular.module('whowantstohack', ['ngRoute', 'ui.bootstrap', 'firebase', 'services', 'controllers', 'directives']);

angular.module('whowantstohack').config(function ($locationProvider, $sceDelegateProvider, $routeProvider, $httpProvider) {
  $locationProvider.html5Mode(true);

  $routeProvider.when('/', {
      templateUrl: window.__config__.cdnUrl + '/partials/home.html',
      controller: 'HomeCtrl'
    })
    .when('/events/:eventId', {
      templateUrl: window.__config__.cdnUrl + '/partials/event.html',
      controller: 'EventCtrl'
    })
    .otherwise({ redirectTo: '/' });

  // Tell angular to trust loading template from the Aerobatic CDN.
  // In simulator mode cdnHost will be localhost
  $sceDelegateProvider.resourceUrlWhitelist([
    // Need the special 'self' keyword so the angular-ui templates are trusted
    'self',
    'https:' + window.__config__.cdnUrl + '/**',
    'http:' + window.__config__.cdnUrl + '/**'
  ]);
});

angular.module('whowantstohack').run(function($rootScope, $location, $log, aerobatic) {
  // Preserve the querystring during HTML5 view navigations
  $log.info("app run");
  if (aerobatic.simulator === true) {
    var originalQuery = $location.search();
    $rootScope.$on('$routeChangeStart', function() {
      for (var key in originalQuery) {
        $location.search(key, originalQuery[key]);
      }
    });
  }
});
