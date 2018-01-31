(function (module) {
    mifosX.filters = _.extend(module, {
        DateTimeFormat: function (dateFilter, localStorageService) {
            return function (input, timeFormat) {
                if (input) {
                    var tDate = new Date(input);
                    return dateFilter(tDate, localStorageService.getFromLocalStorage('dateformat') + ' HH:mm:ss ');
                }
                return '';
            }
        }
    });
    mifosX.ng.application.filter('DateTimeFormat', ['dateFilter', 'localStorageService', mifosX.filters.DateTimeFormat]).run(function ($log) {
        $log.info("DateTimeFormat filter initialized");
    });
}(mifosX.filters || {}));
