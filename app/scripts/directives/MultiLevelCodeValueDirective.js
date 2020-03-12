(function (module) {
    mifosX.directives = _.extend(module, {
        MultiLevelCodeValueDirective: function ($compile) {

            // This Element can be used by follwoing syntax @data-code is the name of code  and selected data will be assigned to scope.tagIdentifier
            // <multi-level-code-value data-code="finance" ></multi-level-code-value >
            return {
                restrict: 'EA',
                require: '?ngModel',
                scope: {
                    ngModel: '='
                  },
                controller: ['$scope', '$modal', 'ResourceFactory', '$routeParams', '$location', function(scope, $modal, resourceFactory, routeParams, location) {

                    scope.searchConditions = {
                        'childCodeValue' : true
                    }
                    scope.getCodeValues = function (attr) {
                        resourceFactory.codeValueByCodeNameResources.get({codeName: attr.code , searchConditions: scope.searchConditions}, function (codeValueData) {
                            scope.documentTagOptions = codeValueData;
                            scope.filterCodeValues();
                        });
                    };
                }],

                link: function (scope, elm, attr, ctrl) {
                    scope.tagIdentifierName = 'Select Document Tag';
                    scope.getCodeValues(attr);
                    scope.filterCodeValues = function() {
                        scope.parentCode = [];
                        scope.mastTagOptions = [];
                        for(var i =0;i<scope.documentTagOptions.length;i++) {
                            scope.documentTagOptions[i].child = [];
                            for(var j =0;j<scope.documentTagOptions.length; j++) {
                                if(scope.documentTagOptions[j].parentId != undefined && scope.documentTagOptions[i].id == scope.documentTagOptions[j].parentId) {
                                    scope.documentTagOptions[i].child.push(scope.documentTagOptions[j]);
                                }
                            }
                        }
                        for(var i =0;i<scope.documentTagOptions.length;i++) {
                            if(scope.documentTagOptions[i].parentId == undefined ){
                                scope.mastTagOptions.push(scope.documentTagOptions[i]);
                            }
                        }
                    };

                    scope.onClick = function(codeValue) {
                        for(var i =0;i<scope.documentTagOptions.length;i++) {
                            if(scope.documentTagOptions[i].id == codeValue.id ){
                                scope.ngModel = codeValue.id;
                                scope.tagIdentifierName = codeValue.name;
                                document.getElementsByClassName('multiChildDropDown ng-scope open')[0].className="multiChildDropDown ng-scope";
                            }
                        }
                    }

                    scope.onShow = function($event, codeValue) {
                        $event.toElement.parentElement.parentElement.className = "multiChildDropDown ng-scope open";
                        for(var i=0;i<$event.toElement.children[1].children.length;i++) {
                            if($event.toElement.children[1].children[i].style.display == "none") {
                            $event.toElement.children[1].children[i].style.display = "block";
                             } else {
                                 $event.toElement.children[1].children[i].style.display = "none";
                             }
                        }
                    }


                    var template =
                    '<div class="multiChildDropDown">' +
                    ' <button class="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">{{tagIdentifierName}}<span class="caret"></span></button>'+
                        '<ul class="dropdown-menu multi-level"  role="menu">' +
                            '<li ng-repeat="item in mastTagOptions" id="wrapper" ng-click="onShow($event, item)" ng-include="\'menu_sublevel.html\'"></li>'+
                        '</ul>' +
                    '</div>'+
                    '<script type="text/ng-template" id="menu_sublevel.html">' +
                        '<div class=" btn  dropdown-toggle">' +
                            '<input type="radio" class="custom-control-input" style="margin-right: 20px" name="codeValue" ng-if="!item.child.length > 0" ng-click="onClick(item)"/>' +
                            '<span >{{item.name}}</span> ' +
                        '</div>' +
                        '<ul class="accordion" >' +
                            '<li  class="dropdown-submenu multi-level" style="display:none" ng-repeat="item in item.child"   ng-include="\'menu_sublevel.html\'"> </li>' +
                        '</ul>' +
                    '</script>';

                    elm.html('').append($compile(template)(scope));
                }
            };
        }
    });
}(mifosX.directives || {}));

mifosX.ng.application.directive("multiLevelCodeValue", ['$compile', mifosX.directives.MultiLevelCodeValueDirective]).run(function ($log) {
    $log.info("MultiLevelCodeValueDirective initialized");
});