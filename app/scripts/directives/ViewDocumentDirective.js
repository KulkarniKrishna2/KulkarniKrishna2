/**
 This directive is highly coupled with the controller it is used in.
 So THERE MUST BE a "scope.batchRequests" and "scope.requestIdentifier"
 within the wrapper controller of this directive.
*/
(function (module) {
    mifosX.directives = _.extend(module, {
        ViewDocumentDirective: function ($compile, $rootScope) {
            return {
                restrict: 'E',
                require: '?ngEntityType',
                scope:{
                    ngEntityType : '@',
                    ngEntityId : '@',
                    ngDocumentId : '@'
                },
                controller: ['$scope', '$http', '$sce', function($scope, $http, $sce) {
                    
                    $scope.viewDocument = function(){
                       
                        if($scope.ngEntityType === 'CreditBureau'){
                           var url = $rootScope.hostUrl + '/fineract-provider/api/v1/enquiry/creditbureau/'+$scope.ngEntityType+'/'+
                              $scope.ngEntityId+'/attachment';                
                        }else{
                           var url = $rootScope.hostUrl + '/fineract-provider/api/v1' + '/'+$scope.ngEntityType+'/'+
                              $scope.ngEntityId+'/documents/' + $scope.ngDocumentId + '/attachment';                        
                        }
                        url = $sce.trustAsResourceUrl(url);

                        $http.get(url, {responseType: 'arraybuffer'}).
                        success(function(data, status, headers, config) {
                            var supportedContentTypes = ['image/jpeg','image/jpg','image/png','image/gif','application/pdf','application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation','text/html','application/xml'];
                            var contentType = headers('Content-Type');
                            var file = new Blob([data], {type: contentType});
                            var fileContent = URL.createObjectURL(file);

                            if(supportedContentTypes.indexOf(contentType) > -1){
                                $scope.docURL = $sce.trustAsResourceUrl(fileContent);
                                $scope.showDoc = true;
                            } else {
                                $scope.showDoc = false;
                            }
                        });

                    }
                }],
                link: function (scope, elm, attr, ctrl) {
                    var template = '<iframe ng-show="showDoc" style = "background-color : white" overflow: hidden;" '+
                        'class= "documentview"'+
                        ' ng-src="{{docURL}}" frameborder="0" webkitallowfullscreen="" ' + 
                        ' mozallowfullscreen="" allowfullscreen="" ></iframe>';
                    elm.html('').append($compile(template)(scope));
                    scope.viewDocument(5);
                }
            };
        }
    });
}(mifosX.directives || {}));

mifosX.ng.application.directive("viewDocumentDirective", ['$compile', '$rootScope', mifosX.directives.ViewDocumentDirective]).run(function ($log) {
    $log.info("ViewDocumentDirective initialized");
});