(function (module) {
    mifosX.directives = _.extend(module, {
      

        ConfirmPopupDirective: function ($modal, $compile, $parse) {
            var directive = {};
            directive.restrict = 'A';
            directive.link= function(scope, elem, attrs) {
                // get reference of ngClick func
                var onSuccess = $parse(attrs.ngConfirmSuccess);

                // remove ngClick and handler func        
                elem.prop('ng-click', null).off('click');

                elem.bind('click' , function(e) {
                    e.stopImmediatePropagation();
                   
                    $modal.open({
                       templateUrl:'views/common/confirmpopup.html',
                        controller: function($scope, $modalInstance) {
                            $scope.header = attrs.header || 'label.confirmPopup.header';
                            $scope.text = attrs.text ||"message.confirmPopup.text";
                            $scope.confirm = function () {
                                $modalInstance.close();
                                onSuccess(scope);
                                
                            };
                            $scope.cancel = function () {
                            $modalInstance.dismiss('cancel');
                            };
                        }
                    });

                });
            };
            return directive; 

        }
    });
    
}(mifosX.directives || {}));

mifosX.ng.application.directive("confirmPopup", ['$modal', '$compile', '$parse', mifosX.directives.ConfirmPopupDirective]).run(function ($log) {
    $log.info("ConfirmPopupDirective initialized");
});