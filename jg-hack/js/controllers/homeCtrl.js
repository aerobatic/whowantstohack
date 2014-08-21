angular.module('controllers').controller('HomeCtrl', function($scope, $log, $location, $modal, $firebase, aerobatic, GitHub) {
  'use strict';

  $scope.aerobatic = aerobatic;
  var ref = new Firebase(aerobatic.settings.FIREBASE_URL + '/events');
  var sync = $firebase(ref);

  $scope.eventsLoading = true;
  // create a synchronized array for use in our HTML code
  $scope.events = sync.$asArray();

  $scope.events.$loaded(
    function(data) {
      $scope.eventsLoading = false;
      $log.info("Events loaded");
    },
    function(err) {
      $scope.eventsLoading = false;
      $log.error(err);
    }
  );

  $scope.navigateToEvent = function(eventId) {
    $log.debug("Load event " + eventId);
    $location.path('/events/' + eventId);
  };

  $scope.openEventModal = function(hackEvent) {
    var modalInstance = $modal.open({
      templateUrl: aerobatic.cdnUrl + '/partials/eventModal.html',
      controller: 'EventModalCtrl',
      resolve: {
        hackEvent: function () {
          return hackEvent;
        }
      }
    });

    modalInstance.result.then(function(hackEvent) {
      $scope.events.$add(hackEvent);
    });
  };
});
