(function() {
    'use strict';

    angular
        .module('splists')
        .directive('spItemForm', spItemForm);

    spItemForm.$inject = ['spListsFactory'];
    function spItemForm(spListsFactory) {
        // Usage:
        // <sp-item-form site-url='/sites/demo/Kiosk/' list-title='Signins' item-id="item.ID" view-mode="true"></sp-item-form>
        // Creates: entire list form
        var directive = {
            bindToController: true,
            controller: spItemFormController,
            templateUrl:'sp-item-form/sp-item-form-view.html',
            controllerAs: 'vm',
            restrict: 'E',
            compile: function (element, attrs) { //setting default values
                if (!attrs.itemId){attrs.viewMode = false;}
                if (!attrs.viewMode) { attrs.viewMode = true; }
            },
            scope: {
                "itemId":"@", // optional
                "listTitle":"@",
                "siteUrl":"@",
                "viewMode":"@", // optional
                "callback":"&"
            }
        };
        return directive;

    }
    /* @ngInject */
    function spItemFormController ($scope, $attrs, spListsFactory) {
        var vm = this;
        console.log('spItemFormController start...');

        $scope.$on("save-item",function(){
            //TODO: save item
            //then - callback
            vm.callback();
            //console.log("item saved!");
        })

        $scope.$watch(function () {
              return $attrs.siteUrl;
           }, getListItem);

        function getListItem(){
            spListsFactory.getItemById($attrs.siteUrl, $attrs.listTitle, $attrs.itemId)
            .then(function(result){
                console.log(result);
                vm.item = result;
            })
        }
    }
})();