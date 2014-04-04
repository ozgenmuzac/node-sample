// Angular module, defining routes for the app
angular.module('polls', ['pollServices']).
	config(['$routeProvider', function($routeProvider) {
		$routeProvider.
			when('/login', { templateUrl: 'partials/login.html', controller: LoginCtrl }).
            when('/success', { templateUrl: 'partials/success.html', controller: SuccessCtrl}).
			when('/polls', { templateUrl: 'partials/list.html', controller: PollListCtrl }).
			when('/poll/:pollId', { templateUrl: 'partials/item.html', controller: PollItemCtrl }).
			when('/new', { templateUrl: 'partials/new.html', controller: PollNewCtrl }).
			// If invalid route, just redirect to the main list view
			otherwise({ redirectTo: '/login' });
	}]);
