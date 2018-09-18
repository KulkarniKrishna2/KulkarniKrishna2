(function (module) {
    mifosX.controllers = _.extend(module, {
        WorkFlowDashboardController: function (scope) {
            scope.uiData = {};
            scope.uiData.dashboardTheme = scope.response.uiDisplayConfigurations.workflowDashboard.theme;
            if(scope.uiData.dashboardTheme){
                scope.uiData.dashboardTheme = 'views/dashboard/'+scope.uiData.dashboardTheme+'.html';
            }
        }
    });
    mifosX.ng.application.controller('WorkFlowDashboardController', ['$scope', mifosX.controllers.WorkFlowDashboardController]).run(function ($log) {
        $log.info("WorkFlowDashboardController initialized");
    });
}(mifosX.controllers || {}));