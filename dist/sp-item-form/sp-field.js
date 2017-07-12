(function() {
    'use strict';

    angular
        .module('splists')
        .directive('spField', spField);

    spField.$inject = [];
    function spField() {
        // Usage:
        // <sp-field field='{{field}}' field-value="{{vm.item.fieldValues[field.InternalName] }}" ></sp-field>
        // Creates: a single item field
        var directive = {
            bindToController: true,
            controller: spFieldController,
            templateUrl:'sp-item-form/sp-field.html',
            controllerAs: 'vm',
            restrict: 'E',
            scope: {
                "field":"=",
                "fieldValue":"=",
            }
        };
        return directive;

    }
    /* @ngInject */
    function spFieldController ($scope, $attrs, spListsFactory) {
        var vm = this;

        $scope.$watch("vm.fieldValue",
        function(newValue, old){
           // console.log($scope, newValue, old);
        });
    }
})();