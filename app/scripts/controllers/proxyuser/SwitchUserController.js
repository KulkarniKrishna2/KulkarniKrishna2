(function(module) {
    mifosX.controllers = _.extend(module, {
        SwitchUserController: function(scope, resourceFactory, $rootScope, location,$timeout) {

            scope.switchUserOptions = [];
            scope.formData = {};

            resourceFactory.switchUserResource.query({}, function(data) {
                scope.switchUserOptions = data;
                if (scope.switchUserOptions.length > 0 && scope.switchUserOptions[0].targetUser) {
                    scope.formData.targetUserId = scope.switchUserOptions[0].targetUser.id;
                }
            });

            var setTimer = function(time){
                var waitTime = time > 30 ? time-30 : 1;
                $timeout(scope.logout, waitTime * 1000);
            };

            scope.submit = function() {
                resourceFactory.switchUserResource.save(scope.formData, function(data) {
                    $rootScope.proxyToken = data.changes.token;
                    scope.expiresIn=data.changes.expiresIn || 1;
                    scope.isUserSwitched = true;
                    scope.targetUserName = data.changes.targetUserName;
                    $rootScope.targetUserName = scope.targetUserName;
                    $rootScope.isUserSwitched = scope.isUserSwitched;
                    setTimer(scope.expiresIn);
                    location.path('/home');
                });
            };
        }
    });

    mifosX.ng.application.controller('SwitchUserController', ['$scope', 'ResourceFactory', '$rootScope', '$location','$timeout', mifosX.controllers.SwitchUserController]).run(function($log) {
        $log.info("SwitchUserController initialized");
    });
}(mifosX.controllers || {}));