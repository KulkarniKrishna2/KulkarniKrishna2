(function (module) {
    mifosX.directives = _.extend(module, {
        DisableRightClickDirective: function ($compile) {
            return {
                restrict: 'A',
                link: function (scope, element, attr) {
                    element.bind('contextmenu', function (e) {
                        e.preventDefault();
                    });
                    element.bind('click', function (e) {
                        if (e.ctrlKey) {
                            e.preventDefault();
                            return false;
                        }
                    });
                }
            };
        }
    });
}(mifosX.directives || {}));

mifosX.ng.application.directive("disableRightClick", ['$compile', mifosX.directives.DisableRightClickDirective]).run(function ($log) {
    $log.info("DisableRightClickDirective initialized");
});