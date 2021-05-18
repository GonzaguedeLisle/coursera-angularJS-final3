(function () {
'use strict'

    angular.module('NarrowItDownApp', [])
    .controller('NarrowItDownController', NarrowItDownController)
    .service('MenuSearchService', MenuSearchService)
    .constant('ApiBasePath', "https://davids-restaurant.herokuapp.com/menu_items.json")
    .directive('foundItems', FoundItemsDirective)

    NarrowItDownController.$inject  = ['MenuSearchService'];
    function NarrowItDownController (MenuSearchService) {
        var menuCtrl = this ;


        menuCtrl.narrowMenu = function (searchTerm) { 
            //Fetches the promise from the http request
           var promise = MenuSearchService.getMatchedMenuItems(searchTerm);
            //If successfull in getting the data, pushes it into the controller data
            promise.then(function(response){
                menuCtrl.found = response.data.menu_items;
            })
            .catch(function(error){
                console.log(error);
            });
        }

        menuCtrl.onRemove = function (index) {
            menuCtrl.found.splice(index, 1);
        }

        menuCtrl.empty = function () {
            if (menuCtrl.found.empty){
                return true ;
            }
        }
        
    }

    MenuSearchService.$inject = ['$http', 'ApiBasePath'];
    function MenuSearchService ($http, ApiBaseBath) {
        var menuService = this ;

        menuService.getMatchedMenuItems = function (searchTerm) {
            //makes the request
            if (searchTerm){
                //cleans the search term
                var searchTerm = searchTerm.toLowerCase().trim();
            }
            //gets the data and caches it
            var promise =  $http({
                method: 'GET',
                url: ApiBaseBath,
                cache: true
            });
            
            //when data is successfully retrieved, continues processing
            promise.then(function(response){
                //get the menus from the response
                var menus = response.data.menu_items;
                for (var i = 0 ; i < menus.length ; i++) {
                    //get the description for every item, lower cases and trims it
                    var desc = (menus[i].description).toLowerCase().trim();
                    if (searchTerm){
                        //if the search term is not found, the item is removed
                        if (desc.indexOf(searchTerm) === -1) {
                            menus.splice(i, 1);
                            i -= 1 ;
                        }
                    //If there's no search term, empties the array 
                    } else {
                        menus.length = 0 ;
                    }
                }
            })
            //returns the data matching the search term 
            return promise;
        };
    }

    function FoundItemsDirective () {
        var ddo = {
            //relates to the scope that will display the data
            templateUrl: 'foundItems.html',
            //creates an isolate scope
            scope: {
                //the local data foundItems is linked with parent controller's element called items
                foundItems: '<items',
                onRemove: '&'
            }
        }

        return ddo ;
    }

})();