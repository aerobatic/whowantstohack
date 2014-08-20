
angular.module('controllers').controller('EventCtrl', function($scope, $log, $window, $routeParams, $modal, $firebase, aerobatic) {
  'use strict';

  $scope.aerobatic = aerobatic;
  var ref = new Firebase(aerobatic.settings.FIREBASE_URL + '/events/' + $routeParams.eventId);
  var sync = $firebase(ref);
  $scope.hackEvent = sync.$asObject();

  var projectsRef = new Firebase(aerobatic.settings.FIREBASE_URL + '/projects/' + $routeParams.eventId);
  var projectsSync = $firebase(projectsRef);
  var projects = projectsSync.$asArray();

  $scope.phases = {
    'Idea': {
      title: 'Ideas'
    },
    'Project': {
      title: 'Projects'
    }
  };
  $scope.selectedPhase = 'Idea';

  projects.$watch(function() {
    _.each(_.keys($scope.phases), function(phase) {
      // Seperate the different phases and sort by most stars
      $scope.phases[phase].projects = _.sortBy(_.filter(projects, {phase:phase}), function(project) {
        return $scope.starCount(project);
      }).reverse();
    });
    $scope.phasesLoaded = true;
  });

  $scope.isStarred = function(project) {
    return _.isObject(project.stars) &&
      _.any(_.values(project.stars), {user: aerobatic.user.username});
  };

  $scope.isMember = function(project) {
    if (!project || !_.isObject(project.team))
      return false;

    return _.any(_.values(project.team), {user: aerobatic.user.username});
  };

  $scope.selectPhase = function(phase) {
    $scope.selectedPhase = phase;
  };

  $scope.starCount = function(project) {
    if (!project || !_.isObject(project.stars))
      return 0;

    return _.keys(project.stars).length;
  };

  $scope.starProject = function(project) {
    // Find the $id of the first star for the current user.
    var existingStarId = null;
    if (_.isObject(project.stars)) {
      existingStarId = _.find(_.keys(project.stars), function(key) {
        return project.stars[key].user == aerobatic.user.username;
      });
    }

    // TODO: There is probably a cleaner way to do this.
    var ref = new Firebase(aerobatic.settings.FIREBASE_URL + '/projects/' + $routeParams.eventId + '/' + project.$id + '/stars');
    var sync = $firebase(ref);

    if (existingStarId)
      sync.$remove(existingStarId);
    else
      sync.$push({user: aerobatic.user.username});
  };

  $scope.joinTeam = function(project) {
    // Find the $id of the member entry for the current user if it exists.
    var existingMemberId = null;
    if (_.isObject(project.team)) {
      existingMemberId = _.find(_.keys(project.team), function(key) {
        return project.team[key].user == aerobatic.user.username;
      });
    }

    // TODO: There is probably a cleaner way to do this.
    var ref = new Firebase(aerobatic.settings.FIREBASE_URL + '/projects/' + $routeParams.eventId + '/' + project.$id + '/team');
    var sync = $firebase(ref);

    // If the user is already a member leave the team, otherwise join.
    if (existingMemberId)
      sync.$remove(existingMemberId);
    else
      sync.$push({user: aerobatic.user.username});
  };

  $scope.usersWhoStarred = function(project) {
    if (!project || !_.isObject(project.stars)) return '';

    return _.map(_.values(project.stars), function(star) {
      return star.user;
    }).join(', ');
  };

  $scope.teamMembers = function(project) {
    if (!project || !_.isObject(project.team)) return '';

    return _.map(_.values(project.team), function(member) {
      return member.user;
    });
  };

  $scope.openProjectModal = function(project) {
    var modalInstance = $modal.open({
      backdrop: 'static',
      templateUrl: aerobatic.cdnUrl + '/partials/projectModal.html',
      controller: 'ProjectModalCtrl',
      resolve: {
        project: function () {
          return project;
        }
      }
    });

    modalInstance.result.then(function(project) {
      // If this is an existing project, update it.
      if (project.$id) {
        var ref = new Firebase(aerobatic.settings.FIREBASE_URL + '/projects/' + $routeParams.eventId + '/' + project.$id);
        var sync = $firebase(ref);
        sync.$update(_.pick(project, ['title', 'description', 'phase', 'hashtags']));
      }
      else
        projects.$add(project);
    });
  };

  $scope.deleteProject = function(project) {
    // TODO: Do something better than window.confirm
    if ($window.confirm("Are you sure you want to delete this " + project.phase + "?")) {
      var ref = new Firebase(aerobatic.settings.FIREBASE_URL + '/projects/' + $routeParams.eventId + '/' + project.$id);
      var sync = $firebase(ref);
      sync.$remove();
    }
  };
});
