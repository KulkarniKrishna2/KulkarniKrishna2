(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewBankStatementController: function (scope, resourceFactory, location, http, routeParams, API_VERSION, $upload, $rootScope, commonUtilService, paginatorUsingOffsetService) {
            scope.bankStatements  = [];
            scope.baseUri = $rootScope.hostUrl+API_VERSION+'/bankstatement/1/documents/';
            scope.appendedUri = '/attachment';
            scope.actualBankStatements = [];
            scope.bankStatementPerPage = 15;
            scope.searchText = "";
            scope.searchResults = [];
            scope.deleteBankStatement = function(bankStatementId){
                scope.formData = {};
                scope.formData.locale = scope.optlang.code;
                scope.formData.dateFormat = scope.df;
                resourceFactory.deleteBankStatementsResource.deleteBankStatement({bankStatementId : bankStatementId},scope.formData, function (data) {
                   scope.initPage();
                });
            };

            scope.makeBankStatementReconcile = function(id){
                resourceFactory.bankStatementsResource.reconcileBankStatement({ bankStatementId : id}, function (data) {
                    scope.getBankStatement();
                    location.path('/bankstatements');
                });
            };

            scope.routeToTransaction = function(id,action){
                var uri = '/bankstatementsdetails/'+id+'/'+action
                location.path(uri);
            }


            var fetchFunction = function (offset, limit, callback) {
                resourceFactory.bankStatementsResource.getAllBankStatement({
                    offset: offset,
                    limit: limit,
                }, callback);
            };

            scope.addCpifDownloadUri = function (){
                for(var i = 0;i< scope.bankStatements.length; i++){
                    scope.bankStatements[i].cpifDownloadUri = scope.baseUri+ scope.bankStatements[i].cpifKeyDocumentId+ scope.appendedUri;
                    if(scope.bankStatements[i].orgStatementKeyDocumentId > 0){
                        scope.bankStatements[i].orgDownloadUri = scope.baseUri+ scope.bankStatements[i].orgStatementKeyDocumentId+ scope.appendedUri;
                    }else{
                        scope.bankStatements[i].orgDownloadUri = null;
                    }
                }
            }  
            
            scope.bankStatements = paginatorUsingOffsetService.paginate(fetchFunction, scope.bankStatementPerPage);
            scope.addCpifDownloadUri();

            scope.search = function () {
                scope.actualBankStatements = [];
                scope.searchResults = [];
                scope.filterText = "";
                var searchString = scope.searchText;
                searchString = searchString.replace(/(^"|"$)/g, '');
                var exactMatch=false;
                var n = searchString.localeCompare(scope.searchText);
                if(n!=0)
                {
                    exactMatch=true;
                }

                if(!scope.searchText){
                    scope.initPage();
                } else {
                    searchString = searchString.trim().replace(" ", "%")
                    resourceFactory.globalSearch.search({query: searchString , resource: "bankstatements",exactMatch: exactMatch}, function (data) {
                        var arrayLength = data.length;
                        for (var i = 0; i < arrayLength; i++) {
                            var result = data[i];
                            var bankStatement = {};

                            bankStatement.cpifDownloadUri = scope.baseUri+result.cpifKeyDocumentId+ scope.appendedUri;
                                if(bankStatement.orgStatementKeyDocumentId > 0){
                                    bankStatement.orgDownloadUri = scope.baseUri+ result.orgStatementKeyDocumentId+ scope.appendedUri;
                                }else{
                                    bankStatement.orgDownloadUri = null;
                                }

                                bankStatement.name = result.entityName;
                                bankStatement.cpifFileName = result.cpifFileName;
                                bankStatement.orgFileName = result.orgFileName;
                                bankStatement.bankData = {'name':result.bankData.name};
                                bankStatement.description = result.description;
                                bankStatement.lastModifiedByName = result.lastModifiedByName;
                                bankStatement.lastModifiedDate = result.lastModifiedDate;
                                bankStatement.isReconciled = result.isReconciled;
                                bankStatement.id = result.entityId;
                                scope.actualBankStatements.push(bankStatement);
                        }
                        var numberOfBankStatement = scope.actualBankStatements.length;
                        scope.totalBankStatement = numberOfBankStatement;
                        scope.bankStatements = scope.actualBankStatements.slice(0, scope.bankStatementPerPage);
                    });
                }
            }

            scope.routeToViewSummary = function(id,action){
                var uri = '/bankstatement/'+id+'/'+action
                location.path(uri);
            }

            scope.updateBankStatement = function(id){
               var uri = '/updatebankstatements/'+id
               location.path(uri); 
            }

            scope.sortDate = function(bankStatement) {
               return new Date(bankStatement.lastModifiedDate);
            };

            scope.download = function(fileName,docUrl){
                var fileType = fileName.substr(fileName.lastIndexOf('.') + 1);
                commonUtilService.downloadFile(docUrl,fileType,fileName);
            }
        }
    });
    mifosX.ng.application.controller('ViewBankStatementController', ['$scope', 'ResourceFactory', '$location', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', 'CommonUtilService', 'PaginatorUsingOffsetService',mifosX.controllers.ViewBankStatementController]).run(function ($log) {
        $log.info("ViewBankStatementController initialized");
    });
}(mifosX.controllers || {}));