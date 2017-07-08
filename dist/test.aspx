<!DOCTYPE html>
<html lang="en">
<head>
    <title>Client Documentation</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="style.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/angular-material/1.1.4/angular-material.min.css" />
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <link rel="stylesheet" href="https://rawgit.com/daniel-nagy/md-data-table/master/dist/md-data-table.css">

</head>

<body ng-app="app" ng-controller="AppController as app" ng-cloak layout='row'>
    
<div layout='column' flex>
    <md-content layout-padding>
        <md-content layout-padding>
            <!--<splist site-url='/sites/demo/Kiosk/' list-title='Signins' page-size='5' view-title='All Items'></splist>-->
            <sp-item-form site-url='/sd/' list-title='SampleList' item-id="3" ></sp-item-form>
        </md-content>
    </md-content>
</div>














    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.6.1/angular.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.6.1/angular-sanitize.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.6.1/angular-animate.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.6.1/angular-aria.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.6.1/angular-messages.min.js"></script>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/angular-material/1.1.4/angular-material.min.js"></script>

    <script src='lib/md-data-table.min.js'></script>
    <script src='lib/polifyll.js'></script>


    <script src='splists-module.js?ver=2'></script>
    <script src='sp-item-form/sp-item-form.js?ver=2'></script>
    <script src='spforms-factory.js?ver=2'></script>
    <script src='splists-factory.js?ver=2'></script>

    <script src='item-select.controller.js?ver=2'></script>

    <script src='splists-factory.js?ver=2'></script>
    <script src='table-cell.controller.js?ver=2'></script>
    <script src='app-module.js?ver=2'></script>
</body>

</html>
