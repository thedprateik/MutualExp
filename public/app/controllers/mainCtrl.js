angular.module('mainCtrl', [])
	.controller('mainController', function($rootScope, $location, Auth) {
		var vm = this;
		
		vm.loggedIn = Auth.isLoggedIn();
		
		$rootScope.$on('$routeChangeStart', function ()
		{
			vm.loggedIn = Auth.isLoggedIn();
			
			
		})
	});