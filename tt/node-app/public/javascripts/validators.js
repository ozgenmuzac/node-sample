// Angular service module for connecting to JSON APIs
angular.module('validatorServices', ['ngResource']).
    factory('Validator', function($rootScope){
        return {
            validateKimlikNo: function(kno){
                if(typeof kno == "string")
                {
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
            }
        }
    });
