(function (module) {
    mifosX.services = _.extend(module, {
        PaginatorUsingOffsetService: function (scope, httpService) {
            var callBack = null;
            this.setCallBack = function(callBackData){
                callBack = callBackData;
            };
            this.paginate = function (fetchFunction, pageSize) {
                var paginator = {
                    hasNextVar: false,
                    next: function () {
                        if (this.hasNextVar) {
                            this.currentOffset += pageSize;
                            this._load();
                        }
                    },
                    _load: function () {
                        var self = this;
                        /**
                         * To handel scenario where last page is having same amount of page size records
                         **/
                        fetchFunction(this.currentOffset, pageSize + 1, function (items) {
                            self.isResponsePresent = true;
                            self.currentPageItems = items;
                            self.hasNextVar = items.length === (pageSize+1);
                            if(self.currentPageItems && self.currentPageItems.length > pageSize) {
                                self.currentPageItems.splice(pageSize, 1);
                            }
                            if(callBack){
                                if(callBack)
                                    callBack();
                                callBack = null;
                            }
                        });
                    },
                    hasNext: function () {
                        return this.hasNextVar;
                    },
                    previous: function () {
                        if (this.hasPrevious()) {
                            this.currentOffset -= pageSize;
                            this._load();
                        }
                    },
                    hasPrevious: function () {
                        return this.currentOffset !== 0;
                    },
                    currentPageItems: [],
                    currentOffset: 0,
                    isResponsePresent: false
                };
                // Load the first page
                paginator._load();
                return paginator;
            };

        }
    });
    mifosX.ng.services.service('PaginatorUsingOffsetService', ['$rootScope', 'HttpService', mifosX.services.PaginatorUsingOffsetService]).run(function ($log) {
        $log.info("PaginatorUsingOffsetService initialized");
    });
}(mifosX.services || {}));
