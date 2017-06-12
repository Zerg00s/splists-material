(function () {
    'use strict';

    angular.module('app', ['splists', 'ngSanitize',  'ngMaterial']);

    angular.module('app')
        .controller('AppController', AppController);

    AppController.inject = [];
    function AppController() {
        var vm = this;
    }
})();