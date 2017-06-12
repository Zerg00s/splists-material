(function () {
    'use strict';

    angular
        .module('splists')
        .factory('spListsFactory', spListsFactory);

    spListsFactory.inject = ['$log', '$http', '$q', '$sce'];
    function spListsFactory($log, $http, $q, $sce) {
        var listFactory = {
            description: 'listFactory',
            getViewFields: getViewFields,
            getListFields: getListFields,
            getViewFieldsRitch: getViewFieldsRitch,
            getItemsWithLookups: getItemsWithLookups,
            getNextItems: getNextItems,
            getAllItems: getAllItems
        };

        return listFactory;

        //////////////////////////////////////////////
        function concatUrls(a, b) {
            a = trimUrl(a);
            b = trimUrl(b);
            if (a.indexOf('http') == 0) {
                return (a + '/' + b);
            }
            else {
                return ('/' + a + '/' + b);
            }

            function trimUrl(url) {
                return url.trim()
                    .replace(/\/\s*$/, "")
                    .replace(/^\//, "");
            }
        }

        /* Allo HTML content to be rendered correctny, Lookup fields to display text instead of IDs*/
        function processListItemValues(items, viewFields) {
            var refinedItems = [];

            for (let item of items) {
                for (let field of viewFields) {
                    switch (field.TypeAsString) {
                        case "Note":
                            if (field.RichText) {
                                item[field.InternalName] = $sce.trustAsHtml(item[field.InternalName]);
                            }
                            break;
                        case "Computed":
                            if (field.InternalName == "File") {
                                var filename = item[field.InternalName].ServerRelativeUrl.replace(/^.*[\\\/]/, '');
                                var fileLink = "<a href='" + item[field.InternalName].ServerRelativeUrl + "'>" + filename + "</a>";
                                item[field.InternalName] = $sce.trustAsHtml(fileLink);
                            }
                            break;
                        case "Lookup":
                        case "User":
                            item[field.InternalName] = item[field.InternalName].Title;
                            break;
                        case "LookupMulti":
                        case "UserMulti":
                            item[field.InternalName] = item[field.InternalName].results.map(function (lookup) {
                                return lookup.Title;
                            }).join(', ');
                            break;
                        case "DateTime":
                            if (field.DisplayFormat == 1) { // 1 means Date and Time. 
                                item[field.InternalName] = new Date(item[field.InternalName]).toLocaleString();
                            }
                            else { // 0 means just Date, without time
                                item[field.InternalName] = new Date(item[field.InternalName]).toLocaleDateString();
                            }
                            break;
                        case "URL":
                            var hyperLink = "<a href='" + item[field.InternalName].Hyperlink + "'>" + item[field.InternalName].Description + "</a>";
                            item[field.InternalName] = $sce.trustAsHtml(hyperLink)
                            break;
                        case "MultiChoice":
                            item[field.InternalName] = item[field.InternalName].results.join(', ');
                            break;
                        case "TaxonomyFieldType":
                            //TODO: get values from the global taxonomy cache:
                            item[field.InternalName] = item[field.InternalName].Label;

                            //item[field.InternalName].TermGuid + ", " +
                            //item[field.InternalName].WssId;
                            break;
                        case "TaxonomyFieldTypeMulti":
                            item[field.InternalName] =
                                item[field.InternalName].results.map(function (metadata) {
                                    return metadata.Label;
                                    // metadata.TermGuid + ", " +
                                    // metadata.WssId;
                                }).join(', ');

                            break;

                        default:
                        // do nothing
                    }
                }
                refinedItems.push(item);
            }

            return refinedItems;
        }

        /*Transform ugly field properties to a useble object */
        function cleanupField(field) {

            var cleanedField = {
                Title: field.Title,
                InternalName: field.InternalName,
                TypeAsString: field.TypeAsString,
                TypeDisplayName: field.TypeDisplayName,
                Description: field.Description,
                Group: field.Group,
                DisplayFormat: field.DisplayFormat,
                AllowMultipleValues: field.AllowMultipleValues,
                DefaultValue: field.DefaultValue,
                Required: field.Required,
                Hidden: field.Hidden,
                ReadOnlyField: field.ReadOnlyField,
                LookupField: field.LookupField,
                LookupList: field.LookupList,
                RichText: field.RichText, //true/false
                NumberOfLines: field.NumberOfLines,
                SchemaXml: field.SchemaXml,
                Id: field.Id
            }

            if (field.Choices) {
                cleanedField.Choices = field.Choices.results;
            }

            return cleanedField;
        }

        /*Get view fields */
        function getViewFields(siteUrl, listTitle, viewTitle) {
            var viewUrl = concatUrls(siteUrl, "/_api/web/lists/getByTitle('" + listTitle + "')/views/getByTitle('" + viewTitle + "')/viewfields")
            $log.info(viewUrl);
            return $http({
                url: viewUrl,
                method: 'GET',
                headers: { accept: 'application/json;odata=verbose' }
            })
                .then(function (results) {
                    return results.data.d.Items.results;
                });
        }

        /*Get view fields with all useful field properties*/
        function getViewFieldsRitch(siteUrl, listTitle, viewTitle) {
            var viewFieldsPromise = getViewFields(siteUrl, listTitle, viewTitle);
            var listFieldsPromise = getListFields(siteUrl, listTitle);

            return $q.all([viewFieldsPromise, listFieldsPromise])
                .then(function (results) {
                    var viewFields = results[0];
                    var listFields = results[1];
                    viewFields = viewFields.map(function (viewField) {
                        var field = listFields.filter(function (listField) {
                            return listField.InternalName == viewField;
                        })[0];
                        return field;
                    });


                    var viewFields = viewFields
                        .map(function (field) {
                            if (field.InternalName.indexOf('LinkFilename') == 0) {
                                field.InternalName = "File";
                                field.ReadOnlyField = false;
                            }
                            if (field.InternalName.indexOf('_x') == 0) {
                                field.InternalName = "OData_" + field.InternalName;
                            }
                            if (field.ReadOnlyField && field.InternalName.indexOf('Title') != -1) {
                                field.InternalName = 'Title';
                                field.ReadOnlyField = false;
                            }
                            return field;
                        })
                        .filter(function (field) {
                            return field.ReadOnlyField == false;
                        });

                    return getUniqueFields(viewFields);
                })

            function getUniqueFields(viewFields) {
                //Some fields will have the same InternalNames. we don't want these to be repeated
                let uniqueFields = [];
                for (let field of viewFields) {
                    if (!uniqueFields.find(function (uniqueField) {
                        return field.InternalName == uniqueField.InternalName;
                    })) {
                        uniqueFields.push(field);
                    }
                }

                return uniqueFields;
            }
        }

        /*Get all list fields */
        function getListFields(siteUrl, listTitle) {
            var listFieldsUrl = concatUrls(siteUrl, "/_api/web/lists/getByTitle('" + listTitle + "')/fields");
            $log.info(listFieldsUrl);
            return $http({
                url: listFieldsUrl,
                method: 'GET',
                headers: { accept: 'application/json;odata=verbose' }
            })
                .then(function (results) {
                    return results.data.d.results.map(cleanupField);
                });
        }

        function getItemsWithLookups(siteUrl, listTitle, viewTitle, pageSize, filter) {

            var viewFieldsPromise = getViewFieldsRitch(siteUrl, listTitle, viewTitle);
            var itemFormPromise = getItemForm();
            return $q.all([viewFieldsPromise, itemFormPromise])
                .then(getItems);


            /*Appending ?$select=.. and &$expand=... to the URL */
            function appendFieldSelectors(itemsUrl, viewFields) {
                var lookupFields = viewFields.filter(function (field) {
                    if (field.TypeAsString == 'Lookup' ||
                        field.TypeAsString == 'LookupMulti' ||
                        field.TypeAsString == 'User' ||
                        field.TypeAsString == 'UserMulti' ||
                        field.InternalName == 'File') {
                        return true;
                    }
                }).map(function (lookupField) {
                    return lookupField.InternalName;
                }).join(',');

                var allViewFields = viewFields.map(function (field) {
                    var select = field.InternalName;
                    if (field.TypeAsString == 'Lookup' ||
                        field.TypeAsString == 'LookupMulti') {
                        select = select + '/' + field.LookupField;
                    }
                    else if (field.TypeAsString == 'User' ||
                        field.TypeAsString == 'UserMulti') {
                        select = select + '/' + "Title";
                    }
                    else if (field.InternalName == 'File') {
                        select = select + '/' + "ServerRelativeUrl";
                    }
                    return select;
                }).join(',');

                var select = "?$select=ID," + allViewFields;
                var expand = "&$expand=" + lookupFields;

                return itemsUrl + select + expand;
            }

            function getItemForm() {
                var itemFormUrl = siteUrl + "/_api/web/lists/GetByTitle('" + listTitle + "')/Forms?$select=ServerRelativeUrl&$filter=FormType eq " + 6;
                return $http({
                    url: itemFormUrl,
                    method: 'GET',
                    headers: { accept: 'application/json;odata=verbose' }
                })
                    .then(function (formResult) {
                        let itemFormUrl = formResult.data.d.results[0].ServerRelativeUrl;
                        return itemFormUrl;
                    });
            }

            function getItems(results) {
                var viewFields = results[0];
                var itemForm = results[1];
                var itemsUrl = concatUrls(siteUrl, '/_api/web/lists/');
                itemsUrl = concatUrls(itemsUrl, "getByTitle('" + listTitle + "')/items");
                itemsUrl = appendFieldSelectors(itemsUrl, viewFields);
                itemsUrl += "&$top=" + pageSize.toString();               
                
                if (filter) {
                    itemsUrl += "&$filter=" + filter;
                }
                $log.info(itemsUrl);
                var getItemsUrl = {
                    url: itemsUrl,
                    method: 'GET',
                    headers: {
                        accept: 'application/json;odata=verbose'
                    }
                };

                return $http(getItemsUrl)
                    .then(function (response) {
                        return {
                            items: processListItemValues(response.data.d.results, viewFields),
                            viewFields: viewFields,
                            itemForm: itemForm,
                            nextUrl: response.data.d.__next // This is used to get the next batch of items
                        };
                    });
            }
        }

        function getNextItems(nextUrl, viewFields) {
            $log.info(nextUrl);
            var getItemsUrl = {
                url: nextUrl,
                method: 'GET',
                headers: {
                    accept: 'application/json;odata=verbose'
                }
            };

            return $http(getItemsUrl)
                .then(function (response) {
                    return {
                        items: processListItemValues(response.data.d.results, viewFields),
                        nextUrl: response.data.d.__next // This is used to get the next batch of items
                    };
                });
        }

        function getAllItems(siteUrl, listTitle) {
            var listItemsUrl = concatUrls(siteUrl, "/_api/web/lists/getByTitle('" + listTitle + "')/items");
            var listItems = [];
            var deferred = $q.defer();
            var getItemsUrl = {
                url: listItemsUrl,
                method: 'GET',
                headers: {
                    accept: 'application/json;odata=verbose'
                }
            };

            $http(getItemsUrl).then(parseListItems);

            function parseListItems(result) {
                var results = result.data.d.results;
                for (var i = 0; i < results.length; i++) {
                    listItems.push(results[i]);
                }

                if (result.data.d.__next) {
                    getItemsUrl.url = result.data.d.__next;
                    $http(getItemsUrl).then(parseListItems);
                }
                else {
                    deferred.resolve(listItems);
                }
            }

            return deferred.promise;
        }

    }
})();