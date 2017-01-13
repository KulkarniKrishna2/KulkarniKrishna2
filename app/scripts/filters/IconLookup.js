(function (module) {
    mifosX.filters = _.extend(module, {
        IconLookup: function () {
            return function (input) {

                var cssClassNameLookup = {
                    "eligibilityStatus.tobereviewed": "icon-exclamation-sign",
                    "eligibilityStatus.approved": "icon-ok-sign",
                    "eligibilityStatus.rejected": "icon-remove-sign"
                }

                return cssClassNameLookup[input];
            }
        }
    });
    mifosX.ng.application.filter('IconLookup', [mifosX.filters.IconLookup]).run(function ($log) {
        $log.info("IconLookup filter initialized");
    });
}(mifosX.filters || {}));
