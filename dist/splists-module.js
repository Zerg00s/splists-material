(function () {
    'use strict';
    angular.module('splists', []);

    angular.module('splists').directive('splist', splist);
    splist.inject = ['$http', '$sce'];
    function splist($http, $sce) {
        // Usage: 
        //<splist site-url='/sd/' list-title='SampleList' page-size='10' view-title='All Items'></splist>
        // Creates:
        //
        var directive = {
            bindToController: true,
            controller: splistController,
            controllerAs: 'vm',
            templateUrl: 'splist-view.html',
            restrict: 'E',
            scope: {
                siteUrl: '@',
                listTitle: '@',
                viewTitle: '@',
                pageSize: '@',
                lookupField: '@',
                lookupId: '='
            },
            compile: function (element, attrs) { //setting default values
                if (!attrs.pageSize) { attrs.pageSize = '10'; }
            }
        };
        return directive;

    }

    function splistController($attrs, $scope, $q, spListsFactory, $window) {

        if ($attrs.lookupField) {
            $scope.$watch('vm.lookupId', function (lookupId) {
                if (lookupId) {
                    $scope.nextUrl = null;
                    let filter = $attrs.lookupField + "/Id eq " + lookupId;
                    getItems(filter);
                }
            });
        }
        else {
            getItems();
        }


        $scope.getNextBatchOfItems = getNextBatchOfItems;

        $scope.click = function (row) {
            console.log(row.entity);
            $window.open($scope.itemForm + "?ID=" + row.entity.ID, '_blank');
        }

        $scope.selected = [];

        $scope.query = {
            order: 'ID',
            limit: 5,
            page: 1
        };

        function getItems(filter) {
            spListsFactory.getItemsWithLookups($attrs.siteUrl, $attrs.listTitle, $attrs.viewTitle, $attrs.pageSize, filter)
                .then(function (results) {
                    $scope.items = results.items;
                    $scope.nextUrl = results.nextUrl;
                    $scope.viewFields = results.viewFields;
                    $scope.itemForm = results.itemForm;
                    $scope.columnDefs = getColumnDefs($scope.viewFields);
                });
        }

        function getNextBatchOfItems() {
            if (!$scope.nextUrl) {
                console.log('no more items left');
                return;
            }
            spListsFactory.getNextItems($scope.nextUrl, $scope.viewFields)
                .then(function (results) {
                    $scope.items = $scope.items.concat(results.items);
                    $scope.nextUrl = results.nextUrl;
                });
        }

        function getColumnDefs(viewFields) {
            var columnDefs = [];
            var columnDefinition = { name: ' ', width: 70 };
            columnDefinition.cellTemplate = '<div><a class="open-link" ng-click="grid.appScope.click(row)" href="#" >Edit</a></div>'
            columnDefs.push(columnDefinition);
            for (let field of viewFields) {
                var columnDefinition = {
                    field: field.InternalName, displayName: field.Title
                };
                if (field.InternalName == "File" ||
                    (field.TypeAsString == "Note" && field.RichText) ||
                    field.TypeAsString == "URL"
                ) {
                    columnDefinition.cellTemplate = '<div style="word-wrap: normal; padding:10px" ng-bind-html="row.entity[col.field]"></div>';
                }
                else {
                    columnDefinition.cellTemplate = '<div style="word-wrap: normal; padding:10px"> {{row.entity[col.field]}}</div>';
                }

                columnDefs.push(columnDefinition);
            }

            return columnDefs;
        }
    }



    ///Select directive/////////////////////////////
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
            templateUrl: 'listItemSelect-view.html'
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
                console.log(vm.items);
            });

        vm.querySearch = function (searchText) {
            console.log(searchText);
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
