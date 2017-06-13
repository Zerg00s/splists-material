(function () {
    'use strict';

    angular.module('app', ['splists', 'ngSanitize', 'ngMaterial', 'md.data.table']);

    angular.module('app')
        .controller('AppController', AppController);

    AppController.inject = ['$mdSidenav'];
    function AppController($mdSidenav) {
        var vm = this;

        vm.toggleLeft = function () {
            $mdSidenav('left').toggle();
        }

    }
})();