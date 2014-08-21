
angular.module('controllers').controller('ProjectModalCtrl', function(
    $scope, $log, $modalInstance, aerobatic, project) {

  // Clone the contact so that any edits are not reflected in the
  // main page.
  $scope.project = (project ? _.clone(project) : { hashtags: []});
  $scope.modalInstance = $modalInstance;
  $scope.phases = ['Idea', 'Project'];

  if ($scope.project.phase == 'Idea')
    $scope.title = ($scope.project.$id) ? 'Edit Idea' : 'Submit New Idea';
  else if ($scope.project.phase == 'Project')
    $scope.title = 'Edit Project';

  // Turn the hashtags string into an array for storage
  if (_.isArray($scope.project.hashtags))
    $scope.project.hashtags = $scope.project.hashtags.join(' ');

  $scope.saveProject = function(evnt) {
    $log.debug("Saving project");
    delete $scope.errors;

    if (!$scope.project.$id) {
      $scope.project.originator = aerobatic.user.username;
      $scope.project.submitted = new Date();
    }

    if (!$scope.project.stars)
      $scope.project.stars = 0;

    $scope.project.hashtags = _.map($scope.project.hashtags.split(' '), function(tag) {
      tag = tag.trim();
      if (tag[0] !== '#')
        tag = '#' + tag;
      return tag;
    });

    $modalInstance.close($scope.project);

    evnt.preventDefault();
  };
});
