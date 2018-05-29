/**
 * Created by Satish on 29-05-2018.
 */
(function (module) {
    mifosX.services = _.extend(module, {
        PopUpUtilService: function ($modal) {
            this.openFullScreenPopUp = function (templateUrl, controller, scope) {
                var windowClass = 'app-modal-window-full-screen';
                this.openPopUp(templateUrl, controller, scope, windowClass)
            };

            this.openDefaultScreenPopUp = function (templateUrl, controller, scope) {
                var windowClass = '';
                this.openPopUp(templateUrl, controller, scope, windowClass)
            };

            this.openPopUp = function (templateUrl, controller, scope, windowClass) {
                scope.modalInstance = $modal.open({
                    templateUrl: templateUrl,
                    controller: controller,
                    backdrop: 'static',
                    size: 'lg',
                    resolve: {},
                    size: 'lg',
                    scope: scope,
                    modal: $modal,
                    resolve: {},
                    windowClass: windowClass
                });

                scope.close = function () {
                    scope.modalInstance.dismiss('');
                };
            };
        }
    });
    mifosX.ng.services.service('PopUpUtilService', ['$modal', mifosX.services.PopUpUtilService]).run(function ($log) {
        $log.info("PopUpUtilService initialized");
    });
}(mifosX.services || {}));