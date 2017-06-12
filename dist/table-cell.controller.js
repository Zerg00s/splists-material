(function() {
    'use strict';

    angular
        .module('splists')
        .directive('tableCell', tableCell);

    tableCell.$inject = ['$sce'];
    function tableCell($sce) {
        // Usage:
        //
        // Creates:
        //
        var directive = {
            bindToController: true,
            controller: tableCellController,
            controllerAs: 'vm',
            templateUrl: 'table-cell.view.html',
            restrict: 'E',
            scope: {
                field : '=',
                item : '=',
                viewFields: '='
            }
        };
        return directive;

    }
    /* @ngInject */
    function tableCellController ($scope) {
    }
})();