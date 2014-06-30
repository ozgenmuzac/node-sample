function LoginCtrl($scope, $http, $location, Validator, User, $log) {
    $scope.user = {
        name: '',
        password: ''
    };
    var url = $location.absUrl();//for getting full url
//    $scope.redirectPage = $location.path
/*    $scope.init = function() {
        $http({
                method: 'GET',
                url: '/isloggedin'
            })
            .success(function(data, status, headers, config){
                if(status === 401) {
                    $location.path('login');
                }
                else {
                    $location.path('success');
                }
            })
            .error(function(data, status, headers, config){
                alert("Error: " + status);
            })
    };*/
    $scope.login = function() {
        var user = $scope.user;
        $http({
                method: 'POST',
                url: '/login',
                data: user
            })
            .success(function(data, status, headers, config){
                if(status === 401) {
                    $location.path('login');
                }
                else {
                    $location.path('success');
                    //alert("Success: " + data.auth);
                }
            })
            .error(function(data, status, headers, config){
                alert("Error");
            })
    };
}

function SuccessCtrl($scope, $http, $location, User, $log) {
    $scope.userinfo = User.info().query();//{username:"ozgen"};

    $scope.options = [{
        name: 'year',
        value: 'extend-year'
    }, {
        name: 'month',
        value: 'extend-month'
    }];

    $scope.optionsType = [{
        name: 'enterprise',
        value: 'type-enterprise'
    }, {
        name: 'community',
        value: 'type-community'
    }];

    $scope.selectedOption = $scope.options[0];
    
    $scope.selectedTypeOption = $scope.optionsType[0];

    $scope.extend = function() {
        alert("extend");
    }

    $scope.change = function() {
        alert("change");
    }

    $scope.expire = function() {
        alert("expire");
    }

    $scope.status = {
        isopen: false
    };

    $scope.selected = "Time Period";

    $scope.toggleDropdown = function($event) {
        
        $event.preventDefault();
        $event.stopPropagation();
        $scope.status.isopen = !$scope.status.isopen;
    };

    $scope.logout = function() {
        $http({
            method: 'GET', 
            url: '/logout'})
            .success(function(data, status, headers, config){
                $location.path('login');
            })
            .error(function(data, status, header, config){
                alert("Error occured try again to logout")
            })
    };
    
}

function InitCtrl($scope, $http, $location, User) {
    $scope.init = function() {
        $http({
            method: 'GET',
            url: '/status'})
            .success(function(data, status, headers, config){
                if(status === 401) {
                    $location.path('login');
                }
                else {
                    $location.path('success');
                }
            })
            .error(function(data, status, header, config){
                $location.path('login');
            })
    };
}

// Controller for the poll list
function PollListCtrl($scope, Poll) {
	$scope.polls = Poll.query();
}

// Controller for an individual poll
function PollItemCtrl($scope, $routeParams, Poll) {	
    $scope.poll = Poll.get({pollId: $routeParams.pollId});	
	$scope.vote = function() {};
}
// Controller for creating a new poll
function PollNewCtrl($scope, $location, Poll) {
	// Define an empty poll model object
	$scope.poll = {
		question: '',
		choices: [ { text: '' }, { text: '' }, { text: '' }]
	};
	
	// Method to add an additional choice option
	$scope.addChoice = function() {
		$scope.poll.choices.push({ text: '' });
	};
	
	// Validate and save the new poll to the database
	$scope.createPoll = function() {
		var poll = $scope.poll;
		
		// Check that a question was provided
		if(poll.question.length > 0) {
			var choiceCount = 0;
			
			// Loop through the choices, make sure at least two provided
			for(var i = 0, ln = poll.choices.length; i < ln; i++) {
				var choice = poll.choices[i];
				
				if(choice.text.length > 0) {
					choiceCount++
				}
			}
		
			if(choiceCount > 1) {
				// Create a new poll from the model
				var newPoll = new Poll(poll);
				
				// Call API to save poll to the database
				newPoll.$save(function(p, resp) {
					if(!p.error) {
						// If there is no error, redirect to the main view
						$location.path('polls');
					} else {
						alert('Could not create poll');
					}
				});
			} else {
				alert('You must enter at least two choices');
			}
		} else {
			alert('You must enter a question');
		}
	};
}
