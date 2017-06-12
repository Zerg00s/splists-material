(function () {
    'use strict';

    angular
        .module('app')
        .controller('mainController', mainController);

    mainController.$inject = ['$http', '$mdSidenav', '$mdToast'];
    function mainController($http, $mdSidenav, $mdToast) {
        var vm = this;
        vm.message = "Material tutorial"
        vm.openLeftMenu = function () {
            $mdSidenav('left').toggle();
            console.log('clicked');
        }

        $http({
            method: "GET",
            url: "https://jsonplaceholder.typicode.com/users",
            headers: {
                accept: "application/json;odata=verbose"
            }
        })
            .then(function (results) {
                vm.users = results.data;
            });



        vm.querySearch = function (searchText) {
            if (angular.isUndefined(searchText) || searchText === null) {
                return vm.users;
            }
            else {
                vm.filteredUsers = vm.users.filter(function (item) {
                    if (item.name.indexOf(searchText) != -1) {
                        return true;
                    }
                    else {
                        return false;
                    }
                })
                return vm.filteredUsers
            }
        }

        vm.selectedItemChange = function (newItem) {
            if (newItem) {
                vm.selectedUser = newItem;
                console.log(newItem);
                $http({
                    method: 'GET',
                    url: 'https://jsonplaceholder.typicode.com/posts?userId=' + newItem.id,
                    headers: {
                        accept: 'application/json;odata=verbose'
                    }
                })
                    .then(function (results) {
                        vm.posts = results.data;
                    });
            }
        }

        // TABS: 
        vm.changeTab = function () {
            vm.tabIndex = 1;
        }


        //Toasts
        vm.toast = function () {
            $mdToast.show(
                $mdToast.simple()
                    .textContent('test')
                    .position('top right')
                    .hideDelay(3000)
            );

        }
    }
})();