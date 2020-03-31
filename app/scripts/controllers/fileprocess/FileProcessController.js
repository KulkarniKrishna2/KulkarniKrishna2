(function (module) {
    mifosX.controllers = _.extend(module, {
        FileProcessController: function (scope, resourceFactory, location, routeParams, API_VERSION, $upload, $rootScope, commonUtilService) {
            var fileProcessCategory = routeParams.fileProcessCategory;
            scope.formData = {};
            scope.isSourceTypeReq = false;
            resourceFactory.fileProcessTypeTemplateResource.get({}, function (data) {
                scope.filter(data);
                scope.attachedFileURL(data);
            });

            scope.attachedFileURL = function(data){
                for (var i = 0; i < scope.fileProcesses.length; i++) {
                        var url = {};
                        url = API_VERSION + '/fileprocess/' + scope.fileProcesses[i].id + '/attachment';
                        scope.fileProcesses[i].docUrl = url;
                    }
            }

            scope.filter = function (data) {
                scope.loans = [];
                scope.savings = [];
                scope.accounting = [];
                scope.organisation = [];
                scope.insurance = [];

                for (var i = 0; i < data.length; i++) {
                    var url = {};
                    url = API_VERSION + '/fileprocess/template/' + data[i].id + '/attachment';
                    data[i].docUrl = url;
                    if (data[i].fileProcessCategory == "LOANS") {
                        scope.loans.push(data[i]);
                    } else if (data[i].fileProcessCategory == "SAVINGS") {
                        scope.savings.push(data[i]);
                    } else if (data[i].fileProcessCategory == "ACCOUNTING") {
                        scope.accounting.push(data[i]);

                    } else if (data[i].fileProcessCategory == "ORGANISATION") {
                        if(data[i].fileProcessIdentifier != 'workflow'){
                            scope.organisation.push(data[i]);
                        }                    

                    } else if (data[i].fileProcessCategory == "INSURANCE") {
                        scope.insurance.push(data[i]);

                    }

                }
            }

            scope.viewProcessedFiles = function (fileTemplate) {
                location.path('/viewfileprocess/' + fileTemplate.fileProcessIdentifier);

            }

            scope.upload = function (fileTemplate) {
                location.path('/uploadfileprocess/' + fileTemplate.fileProcessIdentifier);

            }

            scope.downloadFileTemplate = function (fileTemplate) {
                var url =$rootScope.hostUrl + fileTemplate.docUrl;
                var fileType = fileTemplate.fileTemplatePath.substr(fileTemplate.fileTemplatePath.lastIndexOf('.') + 1);
                commonUtilService.downloadFile(url,fileType,fileTemplate.fileTemplatePath);
            }

            scope.isHideDownloadTemplate =  function(fileTemplate){
                if(_.isUndefined(fileTemplate.fileTemplatePath)){
                    return true;
                }
                return false;
            }


            if(fileProcessCategory){
                if(fileProcessCategory == "LOANS"){
                    document.getElementById("loans").style.display = "";
                }else if(fileProcessCategory == "SAVINGS"){
                    document.getElementById("savings").style.display = "";
                }else if(fileProcessCategory == "ACCOUNTING"){
                    document.getElementById("accounting").style.display = "";
                }else if(fileProcessCategory == "ORGANISATION"){
                    document.getElementById("organisation").style.display = "";
                }else if(fileProcessCategory == "INSURANCE"){
                    document.getElementById("insurance").style.display = "";
                }
            }else{
                document.getElementById("loans").style.display = "";
            }

            var acc = document.getElementsByClassName("accordion");
            var i;
            for (i = 0; i < acc.length; i++) {
                acc[i].addEventListener("click", function () {
                    var acc1 = document.getElementsByClassName("accordion");
                    for (var j = 0; j < acc1.length; j++) {
                        acc1[j].nextElementSibling.style.display = "none";
                    }
                    this.classList.toggle("active");
                    var panel = this.nextElementSibling;
                    if (panel.style.display === "none") {
                        panel.style.display = "block";
                    } else {
                        panel.style.display = "none";
                    }
                });
            }
        }
    });
    mifosX.ng.application.controller('FileProcessController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'API_VERSION', '$upload', '$rootScope', 'CommonUtilService', mifosX.controllers.FileProcessController]).run(function ($log) {
        $log.info("FileProcessController initialized");
    });
}(mifosX.controllers || {}));