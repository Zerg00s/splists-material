(function() {
    'use strict';

    angular
        .module('splists')
        .directive('spItemForm', spItemForm);

    spItemForm.$inject = ['spListsFactory'];
    function spItemForm(spListsFactory) {
        // Usage:
        // <sp-item-form site-url='/sites/demo/Kiosk/' list-title='Signins' item-id="item.ID" ></sp-item-form>
        // Creates: entire list form
        var directive = {
            bindToController: true,
            controller: spItemFormController,
            templateUrl:'sp-item-form/sp-item-form-view.html',
            controllerAs: 'vm',
            restrict: 'E',
            scope: {
                "itemId":"@",
                "listTitle":"@",
                "siteUrl":"@",
            }
        };
        return directive;

    }
    /* @ngInject */
    function spItemFormController ($scope, $attrs, spListsFactory) {
        var vm = this;
        console.log('spItemFormController start...');
        $scope.$watch(function () {
              return $attrs.siteUrl;
           }, getListItem);

        function getListItem(){
            spListsFactory.getItemById($attrs.siteUrl, $attrs.listTitle, $attrs.itemId)
            .then(function(result){
                console.log(result);
                vm.result = result;
            })
        }
    }
})();