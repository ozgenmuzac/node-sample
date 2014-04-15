function LoginCtrl($scope, $http, $location, Validator) {
    $scope.user = {
        name: 'none',
        password: 'none',
        kimlikno: ''
    };
    $scope.login = function() {
        var user = $scope.user;
        var respon = Validator.validateKimlikNo(user.kimlikno);
        alert(user.kimlikno);
        $http({
                method: 'POST',
                url: '/login',
                data: user
            })
            .success(function(data, status, headers, config){
                $location.path('success');
                if(status === 401) {
                    alert("401 Status");
                }
                else {
                    alert("Status: " + status);
                }
                alert("Success: " + data.auth);
            })
            .error(function(data, status, headers, config){
                alert("Error");
            })
    };
}

function SuccessCtrl($scope, $http, User) {
    $scope.userinfo = User.query();//{username:"ozgen"};
    $scope.username = res.username;
//    $scope.username = "ozgen";
    $scope.logout = function() {
        alert("Logout");
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
