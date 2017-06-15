(function () {
    'use strict';
    angular.module('splists', []);

    /*
        S H A R E P O I N T   L I S T    D I R E C T I V E 
    */
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

        $scope.$watch('promise', function () {
            if (!$scope.promise) {
                return;
            }
            $scope.loading = true;
            $q.when($scope.promise).then(function () {
                $scope.loading = false;
            });
        })

        $scope.pageSize = parseInt($attrs.pageSize);
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

        $scope.click = function (item) {
            $window.open($scope.itemForm + "?ID=" + item.ID, '_blank');
        }

        $scope.openListView = function () {
            spListsFactory.getViewUrl($attrs.siteUrl, $attrs.listTitle, $attrs.viewTitle)
                .then(function (viewUrl) {
                    $window.open(viewUrl);
                })
        }

        $scope.selected = [];

        $scope.pageItems = [];
        $scope.pageNumber = 1;
        $scope.pageRight = pageRight;
        $scope.pageLeft = pageLeft;

        $scope.$watchCollection('[pageItems, pageNumber]', function () {
            $scope.startItemIndex = (($scope.pageNumber - 1) * $scope.pageSize) + 1;
            $scope.endItemIndex = $scope.startItemIndex + $scope.pageItems.length;
        })

        function resetPagination(){
            $scope.pageItems = [];
            $scope.items = [];
            $scope.pageNumber = 1;
            $scope.nextUrl = null;
        }

        function getItems(filter, deferred) {
            resetPagination();
            var deferred = $q.defer();
            $scope.promise = deferred.promise;

            spListsFactory.getItemsWithLookups($attrs.siteUrl, $attrs.listTitle, $attrs.viewTitle, $attrs.pageSize, filter)
                .then(function (results) {
                    $scope.items = results.items;
                    $scope.pageItems = $scope.items;
                    $scope.nextUrl = results.nextUrl;
                    $scope.viewFields = results.viewFields;
                    $scope.itemForm = results.itemForm;
                    deferred.resolve();
                });
        }

        function getNextBatchOfItems() {
            var deferred = $q.defer();
            $scope.promise = deferred.promise;
            if (!$scope.nextUrl) {
                console.log('no more items left');
                deferred.resolve();
                return;
            }
            spListsFactory.getNextItems($scope.nextUrl, $scope.viewFields)
                .then(function (results) {
                    $scope.items = $scope.items.concat(results.items);
                    $scope.nextUrl = results.nextUrl;
                    deferred.resolve();
                });
        }

        function pageLeft() {
            $scope.pageNumber--;
            $scope.pageItems = getitemsFromPage($scope.pageNumber)
        }

        function getitemsFromPage(pageNumber) {
            pageNumber--;
            var startIndex = pageNumber * $scope.pageSize;
            var endIndex = startIndex + $scope.pageSize
            var pageItems = $scope.items.slice(startIndex, endIndex);
            return pageItems;
        }

        function pageRight() {
            $scope.pageNumber++;
            var pItems = getitemsFromPage($scope.pageNumber);
            if (pItems.length > 0) {
                $scope.pageItems = pItems;
                return;
            }

            var deferred = $q.defer();
            $scope.promise = deferred.promise;
            spListsFactory.getNextItems($scope.nextUrl, $scope.viewFields)
                .then(function (results) {
                    $scope.items = $scope.items.concat(results.items);
                    $scope.pageItems = results.items;
                    $scope.nextUrl = results.nextUrl;
                    deferred.resolve();
                });
        }
    }

})();
