(function () {
    'use strict';

    /*
         S E L E C T   D I R E C T I V E 
     */
    angular.module('splists').directive('listItemSelect', listItemSelect);
    listItemSelect.inject = ['$http'];
    function listItemSelect($http) {
        // Usage:
        //
        // Creates:
        //
        var directive = {
            bindToController: true,
            controller: listItemSelectController,
            controllerAs: 'vm',
            restrict: 'E',
            scope: {
                siteUrl: '@',
                listTitle: '@',
                selectedItem: '='
            },
            templateUrl: 'item-select.view.html'
        };
        return directive;


    }
    function listItemSelectController($attrs, $scope, $http, spListsFactory) {
        var vm = this;
        vm.item = {};
        vm.siteUrl = $attrs.siteUrl;
        vm.listTitle = $attrs.listTitle;

        spListsFactory.getAllItems(vm.siteUrl, vm.listTitle)
            .then(function (items) {
                vm.items = items;
            });

        vm.querySearch = function (searchText) {
            if(!vm.items){
                return [];
            }
            if (angular.isUndefined(searchText) || searchText === null) {
                return vm.items;
            }
            else {
                vm.filteredItems = vm.items.filter(function (item) {

                    if (item.Title.toLowerCase().indexOf(searchText.toLowerCase()) != -1) {
                        return true;
                    }
                    else {
                        return false;
                    }
                })
                return vm.filteredItems
            }
        }

        vm.selectedItemChange = function (newItem) {

        };

        // $scope.$watch(() => vm.item.selected, function (newVal) {
        //     if (newVal) {
        //         $scope.selectedId = newVal;
        //         console.log(newVal);
        //     }
        // });
    }
})();