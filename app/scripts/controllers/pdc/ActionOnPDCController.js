/**
 * Created by FinTech on 17-07-2017.
 */
(function (module) {
    mifosX.controllers = _.extend(module, {
        ActionOnPDCController: function (scope, routeParams, resourceFactory, dateFilter) {

            scope.pdcActionData = {};
            if (scope.action === scope.present) {
                scope.actionHeadinglabel = 'lable.tab.heading.pdc';
                scope.actionDatelabel = 'label.date';
            } else if (scope.action === scope.bounced) {
                scope.actionHeadinglabel = 'lable.tab.heading.pdc';
                scope.actionDatelabel = 'label.date';
            } else if (scope.action === scope.clear) {
                scope.actionHeadinglabel = 'lable.tab.heading.pdc';
                scope.actionDatelabel = 'label.date';
            } else if (scope.action === scope.cancel) {
                scope.actionHeadinglabel = 'lable.tab.heading.pdc';
                scope.actionDatelabel = 'label.date';
            } else if (scope.action === scope.return) {
                scope.actionHeadinglabel = 'lable.tab.heading.pdc';
                scope.actionDatelabel = 'label.date';
            } else if (scope.action === scope.undo) {
                scope.actionHeadinglabel = 'lable.tab.heading.pdc';
                scope.actionDatelabel = 'label.date';
            }

            scope.actionSubmit = function () {
                if (scope.pdcActionData.date) {
                    scope.pdcActionData.date = dateFilter(new Date(scope.pdcActionData.date), scope.df);
                }
                scope.pdcActionData.pdcChequeDetails = scope.pdcChequeDetails;
                scope.pdcActionData.locale = scope.optlang.code;
                scope.pdcActionData.dateFormat = scope.df;
                resourceFactory.pdcActionResource.action({
                    'command': scope.action
                }, scope.pdcActionData, function (data) {
                    scope.modalInstance.close('actionSubmit');
                    if (!scope.isSingleOperation) {
                        scope.back();
                    } else {
                        scope.getPDCDetails();
                    }
                });
            };

            scope.cancel = function () {
                scope.modalInstance.dismiss('pdcCancel');
                if (!scope.isSingleOperation) {
                    scope.back();
                } else {
                    scope.getPDCDetails();
                }
            };
        }
    });

    mifosX.ng.application.controller('ActionOnPDCController', ['$scope', '$routeParams', 'ResourceFactory', 'dateFilter', mifosX.controllers.ActionOnPDCController]).run(function ($log) {
        $log.info("ActionOnPDCController initialized");
    });
}(mifosX.controllers || {}));
