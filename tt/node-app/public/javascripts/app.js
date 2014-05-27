// Angular module, defining routes for the app
angular.module('polls', ['pollServices', 'validatorServices']).
	config(['$routeProvider', function($routeProvider) {
		$routeProvider.
			when('/login', { templateUrl: 'partials/login.html', controller: LoginCtrl }).
            when('/success', { templateUrl: 'partials/success.html', controller: SuccessCtrl}).
            when('/token', { templateUrl: 'partials/token.html', controller: TokenCtrl}).
			when('/polls', { templateUrl: 'partials/list.html', controller: PollListCtrl }).
			when('/poll/:pollId', { templateUrl: 'partials/item.html', controller: PollItemCtrl }).
			when('/new', { templateUrl: 'partials/new.html', controller: PollNewCtrl }).
			// If invalid route, just redirect to the main list view
			otherwise({ redirectTo: '/login' });
	}])

    .directive("kimlikno", function(){
    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            ctrl.$parsers.unshift(function(viewValue){
                
                function validateNo(kno) { 
                    if(kno.length != 11)
                        return false;
                    if(kno.charAt(0) == '0')
                        return false;
                    var no = kno.split('');
                    var i = 0, total1 = 0, total2 = 0, total3 = parseInt(no[0]);

                    for(i = 0; i < 10; i++)
                        total1 += parseInt(no[i]);

                    if((total1 % 10) != parseInt(no[10]))
                        return false;
                    
                    for(i = 1; i < 9; i += 2)
                    {
                        total2 = total2 + parseInt(no[i]);
                        total3 = total3 + parseInt(no[i+1]);
                    }
                    if(((total3*7 - total2) % 10) != parseInt(no[9]))
                        return false;
                    return true;
                }

                var valid = validateNo(viewValue);
                ctrl.$setValidity('kimlikno', valid);
                return valid ? viewValue : undefined;                 
            });
        }
    };
});
