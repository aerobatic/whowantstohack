angular.module('controllers').controller('MainCtrl', function($scope, $log, aerobatic) {
  'use strict';

  $scope.aerobatic = aerobatic;
  $scope.prettyName = function () {
    return aerobatic.user.displayName || aerobatic.user.username;
  };
});
