var app = angular.module('myapp',['ngRoute','ui.bootstrap']);
app.config(function($routeProvider){
	$routeProvider.when('/login',{
		templateUrl:'/views/login.html',
		controller:'loginCtrl'
	}).when('/home',{
		templateUrl:'/views/home.html'

	}).when('/loginDiv',{
		template:'oksa',
		controller:'logoutCtrl'
	}).when('/profile',{
		templateUrl:'/views/profile.html',
		controller:'profileCtrl'
	}).when('/message',{
		templateUrl:'/views/message.html',
		controller:'messageCtrl'
	}).when('/message/:id',{
		templateUrl:'/views/view.html',
		controller:'msgCtrl'
	}).when('/newuser',{
		templateUrl:'/views/newuser.html',
		controller:'newuserCtrl'
	}).otherwise('/login');
});
app.controller('loginCtrl',['$scope','$location','$rootScope','$http',
	function($scope,$location,$rootScope,$http){
	$rootScope.logSuccess = false;
	$http.get('/getsession').then(function(success){
		// console.log(success.data);
		if(success.data){
			$location.path('/profile');
		}
	},function(err){
		console.log(err);
	});
    $scope.login = function(){
       var loginUser = {};
       loginUser.username = $scope.username;
       loginUser.password = $scope.password;
       $http.post('/loginuser', loginUser).then(function(success){
       		console.log(success);
       		if(success.data == 'success'){
       			$location.path('/profile');
       			$rootScope.logSuccess = true;
       		}else{
       			$scope.error = success.data;
       		}
       }, function(err){
       		console.log(err);
       });

    }

    $scope.register = function(){
    	$location.path('/newuser');
    }
}]);

app.controller('logoutCtrl',function($http,$rootScope,$location){
	$rootScope.logSuccess = false;
	// console.log('ok');
	$http.get('/logout').then(function(success){
		// console.log('success');
		if(success.data == 'success'){
			$location.path('/login');
		}else{
			console.log('logout error');
		}
	}, function(err){
		console.log(err);
	});
});
app.controller('newuserCtrl', function($scope,$rootScope,$http,$location){
	$scope.error ='';
	$scope.register = function(){
		var user = {};
		user.name = $scope.name;
		user.email = $scope.email;
		user.username = $scope.username;
		user.password = $scope.password;
		user.location = $scope.location;
		user.contactnumber = $scope.contactnumber;
		$http.post('/adduser', user).then(function(success){
			if(success.data == 'success'){
				$location.path('/login');
			}else{
				$scope.error = success.data;
			}
			// console.log(success);
		}, function(err){
			console.log(err);
		});
	}
});
app.controller('profileCtrl', function($scope,$rootScope,$http,$location,loginService){

 	$http.get('/getsession')
	    .success(function(data){
	    	if(!data){
	    		$rootScope.logSuccess = false;
	    		$location.path('/login');
	    	}else{
	    		$rootScope.logSuccess = true;
	    		$rootScope.username = data.username;
	    		$scope.user = data;
	    		$scope.table_flag = true;
	    	}
	    })
	    .error(function(err){
	    	console.log(err);
	    });
	
    $scope.editUser = function(){
	var edit_user={};
	if($("#edit_name").val() != ""){
		edit_user.name = $("#edit_name").val();
		$scope.name_err = "";
	}else{
		$scope.name_err = "Name is required";
		return;
	}

	if($("#edit_email").val() != ""){
		edit_user.email= $("#edit_email").val();
		$scope.email_err = "";
	}else{
		$scope.email_err = "Email is required";
		return;
	}

	if($("#edit_loc").val() != ""){
		edit_user.loc = $("#edit_loc").val();
		$scope.loc_err = "";
	}else{
		$scope.loc_err = "Location is required";
		return;
	}
	if ($("#edit_contactnumber").val() != "") {
		edit_user.contactnumber = $("#edit_contactnumber").val();
		$scope.contactnum_err = "";
	}else{
		$scope.contactnum_err = "Contact number is required";
		return;
	}
	if($("#edit_password").val() != ""){
		edit_user.password = $("#edit_password").val();
		$scope.password_err = "";
	}else{
		$scope.password_err = "Password is required";
	}	
	edit_user.username = $scope.user.username;
	edit_user.messages = $scope.user.messages;
	edit_user.outmessages = $scope.user.outmessages;
	$scope.table_flag = true;
	$http.post('/updateuser', edit_user).then(function(success){

	    },function(err){
	    	console.log(err);
		});
	$scope.user = edit_user;
    }
    
    $scope.showEditForm = function(){
        $scope.table_flag = false;
    }
    $scope.cancel = function(){
    	$scope.table_flag = true;
    }

});
app.controller('msgCtrl', ['$scope','loginService','$routeParams','$location','$http','$rootScope',
	function($scope,loginService,$routeParams,$location,$http,$rootScope){
    $http.get('/getsession')
	    .success(function(data){
	    	console.log(data);
	    	if(!data){
	    		$rootScope.logSuccess = false;
	    		$location.path('/login');
	    	}else{
	    		$rootScope.logSuccess = true;
	    		$rootScope.username = data.username;
	    		$scope.user = data;
	    		$scope.messages = data.messages;
	    		$scope.outmessages = data.outmessages;
				var id = $routeParams.id;
			    var message = $scope.user.messages[id];
			    $('#msgtitle').val(message.title);
			    $('#sender').val(message.sender);
			    $('#content').val(message.content);    		
	    	}
	    })
	    .error(function(err){
	    	console.log(err);
	    });
    

    $scope.goback = function(){
    	$location.path('/message');
    }

}]);
app.controller('messageCtrl',function($scope,$rootScope,$http,$location){
	$http.get('/getsession')
	    .success(function(data){
	    	if(!data){
	    		$rootScope.logSuccess = false;
	    		$location.path('/login');
	    	}else{
	    		$scope.tab1 = true;
	    		$scope.tab2 = false;
	    		$scope.tab3 = false;
	    		$rootScope.logSuccess = true;
	    		$rootScope.username = data.username;
	    		$scope.user = data;
	    		$scope.messages = data.messages;
	    		$scope.outmessages = data.outmessages;
	    	}
	    })
	    .error(function(err){
	    	console.log(err);
	    });
	
	$scope.deleteMsg = function(index){
    	var origin_messages = $scope.user.messages;
        $http.post('/deletemsg', {'id':index}).then(function(success){
        	if(success.data == 'success'){
        		// $scope.messages = origin_messages.splice(index,1);
        	}else{
        		console.log('delete error');
        	}
        }, function(err){
        	console.log(err);
        });
        
    }
    $scope.sendMsg = function(){
    	var msg = {};
    	msg.title = $('#sendtitle').val();
    	msg.to = $('#sendto').val();
    	msg.content = $('#sendcontent').val();
    	$scope.user.outmessages.push(msg);
    	$http.post('/addmessage', {'outmessages':$scope.user.outmessages}).then(function(success){

    	},function(err){
    		console.log(err);
    	});
        $scope.outmessages = $scope.user.outmessages;
        $http.post('/addinmessage', {'msg':msg}).then(function(success){

        }, function(err){
        	console.log(err);
        });
        $('#sendtitle').val('');
        $('#sendto').val('');
        $('#sendcontent').val('');
    }
    $scope.viewMsg = function($index){
    	$location.path('/message/'+$index);
    }
    $scope.switchTab = function(tab){
    	switch(tab){
    		case 1:
    			$scope.tab1 = true;
	    		$scope.tab2 = false;
	    		$scope.tab3 = false;
	    		break;
	    	case 2:
	    		$scope.tab1 = false;
	    		$scope.tab2 = true;
	    		$scope.tab3 = false;
	    		break;
	    	case 3:
	    		$scope.tab1 = false;
	    		$scope.tab2 = false;
	    		$scope.tab3 = true;
	    		break;
	    	default:
    			$scope.tab1 = true;
	    		$scope.tab2 = false;
	    		$scope.tab3 = false;
	    		break;
    	}
    }
});
app.directive('starSign', function($http,$compile){
	return{
		restrict:'EACM',
		template:'<span id={{index}}>&#9734;</span>',
		scope:{
			index:"="
		},
		link: function(scope,elem,attri){
		   $http.get('/getsession')
			    .success(function(data){
			    	if(!data){
			    		$rootScope.logSuccess = false;
			    		$location.path('/login');
			    	}else{

			    		$(document).ready(function(){
					var len = data.messages.length;
					for(var i = 0; i < len; i++){
						if(data.messages[i].mark == false){
							$('#'+i).html('&#9734;');
						}else if(data.messages[i].mark == true){
							$('#'+i).html('&#9733;');
						}
					  }

				elem.on('click',function(){
				  	var id = scope.index;
					if(data.messages[id].mark == true){
			            $('#'+id).html('&#9734;');
			            data.messages[id].mark = false;         
					}else if(data.messages[id].mark == false){
			    		$('#'+id).html('&#9733;');
			    		data.messages[id].mark = true;
			    	}
			    $http.post('/updatemessage', {'id':id}).then(function(success){
			    	// console.log(success);
			    }, function(err){
			    	console.log(err);
			    });   	
			  });
			});
	    }
	    })
	    .error(function(err){
	    	console.log(err);
	    });       
		}
	}
});

app.service('loginService', function($rootScope,$http,$location){
	this.getSession = function(){
		 var hour = new Date().getHours();
	    if (hour < 12) {
	        $rootScope.greeting = "Good morning";
	    } else if (hour < 18) {
	        $rootScope.greeting = "Good day";
	    } else {
	        $rootScope.greeting = "Good evening";
	    }
	    $http.get('/getsession')
	    .success(function(data){
	    	if(!data){
	    		$rootScope.logSuccess = false;
	    		$location.path('/login');
	    	}else{
	    		console.log(data);
	    		$rootScope.logSuccess = true;
	    		$rootScope.username = data.username;
	    		$rootScope.user = data;
	    	}
	    })
	    .error(function(err){
	    	console.log(err);
	    });
	}
    
});