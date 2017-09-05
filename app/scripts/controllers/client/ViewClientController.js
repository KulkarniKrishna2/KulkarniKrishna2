(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewClientController: function (scope, routeParams, route, location, resourceFactory, http, $modal, API_VERSION, $rootScope, $upload, dateFilter) {
            scope.client = [];
            scope.identitydocuments = [];
            scope.buttons = [];
            scope.clientdocuments = [];
            scope.staffData = {};
            scope.formData = {};
            scope.openLoan = true;
            scope.openSaving = true;
            scope.openShares = true ;
            scope.updateDefaultSavings = false;
            scope.charges = [];
            scope.showClosedPledges = false;
            scope.id = routeParams.id;
            scope.pledges = [];
            scope.dob = "label.input.dateofbirth";
            scope.addressData = [];
            scope.addressId ;
            scope.enableClientAddress = false;
            scope.loancycledetail = [];
            scope.smartCardData = [];
            scope.smartformData = {};
            scope.showNoteField = false;
            scope.showSmartcard = true;
            scope.clientId = routeParams.id;
            scope.entityType = routeParams.entityType;
            scope.entityId = routeParams.id;
            scope.isCenter=false;
            scope.loanApplicationReferenceId = routeParams.loanApplicationReferenceId;
            scope.pincode = false;
            scope.sections = [];
            scope.displayNameInReverseOrder = false;
            if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.viewClient.isHiddenField.pincode) {
                scope.pincode = scope.response.uiDisplayConfigurations.viewClient.isHiddenField.pincode;
            }
            if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.viewClient.isHiddenField.displayNameInReverseOrder) {
                scope.displayNameInReverseOrder = scope.response.uiDisplayConfigurations.viewClient.isHiddenField.displayNameInReverseOrder;
            }
            scope.routeToLoan = function (id) {
                location.path('/viewloanaccount/' + id);
            };
            scope.routeToLoanApplication = function (loanAppData) {
                location.path('/viewloanapplicationreference/' + loanAppData.loanApplicationReferenceId);
            };
            scope.routeToChargeOverview = function () {
                location.path(scope.pathToChargeOverview());
            };

            scope.pathToChargeOverview =function (){
                return ('/viewclient/'+ scope.client.id + '/chargeoverview');
            }

            scope.routeToCharge = function (chargeId) {
                location.path('/viewclient/'+ scope.client.id + '/charges/' + chargeId);
            };

            scope.routeToSaving = function (id, depositTypeCode) {
                if (depositTypeCode === "depositAccountType.savingsDeposit") {
                    location.path('/viewsavingaccount/' + id);
                } else if (depositTypeCode === "depositAccountType.fixedDeposit") {
                    location.path('/viewfixeddepositaccount/' + id);
                } else if (depositTypeCode === "depositAccountType.recurringDeposit") {
                    location.path('/viewrecurringdepositaccount/' + id);
                }
            };

            function constructActiveLoanSummary() {
                if (scope.existingLoans) {
                    for (var i in scope.existingLoans) {
                        var existingLoan = scope.existingLoans[i];
                        if (existingLoan.source && existingLoan.source.name === 'Credit Bureau') {
                            if (existingLoan.loanStatus && existingLoan.loanStatus.id === 300) {
                                if (_.isUndefined(scope.activeLoan)) {
                                    scope.viewCreditBureauReport = true;
                                    scope.activeLoan = {};
                                    scope.activeLoan.summaries = [];
                                    scope.activeLoan.totalSummary = {};
                                    scope.activeLoan.totalSummary.noOfActiveLoans = 0;
                                    scope.activeLoan.totalSummary.totalOutstandingAmount = 0;
                                    scope.activeLoan.totalSummary.totalEMIAmount = 0;
                                    scope.activeLoan.totalSummary.totalOverDueAmount = 0;
                                }
                                if (existingLoan.lenderName) {
                                    var isLenderPresent = false;
                                    var summaty = {};
                                    for (var j in scope.activeLoan.summaries) {
                                        if (existingLoan.lenderName === scope.activeLoan.summaries[j].lenderName) {
                                            summaty = scope.activeLoan.summaries[j];
                                            isLenderPresent = true;
                                            summaty.noOfActiveLoans += 1;
                                            if (summaty.customerSince > existingLoan.disbursedDate) {
                                                summaty.customerSince = existingLoan.disbursedDate;
                                            }
                                            summaty.totalOutstandingAmount += existingLoan.currentOutstanding;
                                            summaty.totalEMIAmount += convertEMIAmountToMonthlyAmount(existingLoan);
                                            if (summaty.disbursalDate < existingLoan.disbursedDate) {
                                                summaty.disbursalDate = existingLoan.disbursedDate;
                                            }
                                            summaty.totalOverDueAmount += existingLoan.amtOverdue;
                                            scope.activeLoan.summaries[j] = summaty;
                                            break;
                                        }
                                    }
                                    if (!isLenderPresent) {
                                        summaty.lenderName = existingLoan.lenderName;
                                        summaty.customerSince = existingLoan.disbursedDate;
                                        summaty.noOfActiveLoans = 1;
                                        summaty.totalOutstandingAmount = existingLoan.currentOutstanding;
                                        summaty.totalEMIAmount = convertEMIAmountToMonthlyAmount(existingLoan);
                                        summaty.disbursalDate = existingLoan.disbursedDate;
                                        summaty.totalOverDueAmount = existingLoan.amtOverdue;
                                        scope.activeLoan.summaries.push(summaty);
                                    }
                                    scope.activeLoan.totalSummary.noOfActiveLoans += 1;
                                    scope.activeLoan.totalSummary.totalOutstandingAmount += existingLoan.currentOutstanding;
                                    scope.activeLoan.totalSummary.totalEMIAmount += convertEMIAmountToMonthlyAmount(existingLoan);
                                    scope.activeLoan.totalSummary.totalOverDueAmount += existingLoan.amtOverdue;
                                }
                            }
                        }
                    }
                    if (!_.isUndefined(scope.activeLoan) && !_.isUndefined(scope.activeLoan.summaries)) {
                        if (scope.activeLoan.summaries.length > 0) {
                            scope.isReportPresent = true;
                        }
                    }
                }
            };

            function constructClosedLoanSummary() {
                if (scope.existingLoans) {
                    for (var i in scope.existingLoans) {
                        var existingLoan = scope.existingLoans[i];
                        var isValidData = false;
                       dData = true;
                        if (existingLoan.source && existingLoan.source.name === 'Credit Bureau') {
                            if (existingLoan.loanStatus && existingLoan.loanStatus.id === 600) {
                                if (_.isUndefined(scope.closedLoan)) {
                                    scope.closedLoan = {};
                                    scope.closedLoan.summaries = [];
                                    scope.closedLoan.totalSummary = {};
                                    scope.closedLoan.totalSummary.noOfClosedLoans = 0;
                                    scope.closedLoan.totalSummary.totalDisbursalAmount = 0;
                                    scope.closedLoan.totalSummary.totalWriteOffAmount = 0;
                                }
                                if (existingLoan.lenderName) {
                                    var isLenderPresent = false;
                                    var summaty = {};
                                    for (var j in scope.closedLoan.summaries) {
                                        if (existingLoan.lenderName === scope.closedLoan.summaries[j].lenderName) {
                                            summaty = scope.closedLoan.summaries[j];
                                            isLenderPresent = true;
                                            summaty.noOfClosedLoans += 1;
                                            if (summaty.customerSince > existingLoan.disbursedDate) {
                                                summaty.customerSince = existingLoan.disbursedDate;
                                            }
                                            summaty.totalDisbursalAmount += existingLoan.amountBorrowed;
                                            if (summaty.lastClosureDate) {
                                                if (existingLoan.closedDate && summaty.lastClosureDate < existingLoan.closedDate) {
                                                    summaty.lastClosureDate = existingLoan.closedDate;
                                                }
                                            } else if (existingLoan.closedDate) {
                                                summaty.lastClosureDate = existingLoan.closedDate;
                                            }
                                            summaty.totalWriteOffAmount += existingLoan.writtenOffAmount;
                                            scope.closedLoan.summaries[j] = summaty;
                                            break;
                                        }
                                    }
                                    if (!isLenderPresent) {
                                        summaty.lenderName = existingLoan.lenderName;
                                        summaty.customerSince = existingLoan.disbursedDate;
                                        summaty.noOfClosedLoans = 1;
                                        summaty.totalDisbursalAmount = existingLoan.amountBorrowed;
                                        if (existingLoan.closedDate) {
                                            summaty.lastClosureDate = existingLoan.closedDate;
                                        }
                                        summaty.totalWriteOffAmount = existingLoan.writtenOffAmount;
                                        scope.closedLoan.summaries.push(summaty);
                                    }
                                    scope.closedLoan.totalSummary.noOfClosedLoans += 1;
                                    scope.closedLoan.totalSummary.totalDisbursalAmount += existingLoan.amountBorrowed;
                                    scope.closedLoan.totalSummary.totalWriteOffAmount += existingLoan.writtenOffAmount;
                                }
                            }
                        }
                        if (!_.isUndefined(scope.closedLoan) && !_.isUndefined(scope.closedLoan.summaries)) {
                            if (scope.closedLoan.summaries.length > 0) {
                                scope.isReportPresent = true;
                            }
                        }
                    }
                }
            };
            scope.isReportPresent = false;
            function constructLoanSummary() {
                if (!_.isUndefined(scope.activeLoan)) {
                    delete scope.activeLoan;
                }
                if (!_.isUndefined(scope.closedLoan)) {
                    delete scope.closedLoan;
                }
                constructActiveLoanSummary();
                constructClosedLoanSummary();
                findcustomerSinceFromEachMFI();
            };

            function findcustomerSinceFromEachMFI() {
                if(scope.activeLoan && scope.activeLoan.summaries && scope.activeLoan.summaries.length > 0){
                    if(scope.closedLoan && scope.closedLoan.summaries && scope.closedLoan.summaries.length > 0){
                        for(var i in scope.activeLoan.summaries){
                            for(var j in scope.closedLoan.summaries){
                                if(scope.activeLoan.summaries[i].lenderName === scope.closedLoan.summaries[j].lenderName){
                                    if (scope.activeLoan.summaries[i].customerSince > scope.closedLoan.summaries[j].customerSince) {
                                        scope.activeLoan.summaries[i].customerSince = scope.closedLoan.summaries[j].customerSince
                                    }else if(scope.closedLoan.summaries[j].customerSince > scope.activeLoan.summaries[i].customerSince){
                                        scope.closedLoan.summaries[i].customerSince = scope.activeLoan.summaries[j].customerSince
                                    }
                                }
                            }
                        }
                    }
                }
            };

            function convertEMIAmountToMonthlyAmount(existingLoan){
                if(existingLoan.loanTenurePeriodType.value.toLowerCase() === 'months'){
                    return existingLoan.installmentAmount;
                }else if(existingLoan.loanTenurePeriodType.value.toLowerCase() === 'weeks'){
                    if(existingLoan.repaymentFrequencyMultipleOf && existingLoan.repaymentFrequencyMultipleOf === 2){
                        return convertBIWeeklyEMIAmountToMonthly(existingLoan);
                    } else {
                        return convertWeeklyEMIAmountToMonthly(existingLoan);
                    }
                }else if(existingLoan.loanTenurePeriodType.value.toLowerCase() === 'days'){
                    return convertDailyEMIAmountToMonthly(existingLoan);
                }else{
                    return 0.00;
                }
            };

            function convertBIWeeklyEMIAmountToMonthly(existingLoan){
                return (existingLoan.installmentAmount/14) * 30;
            };

            function convertWeeklyEMIAmountToMonthly(existingLoan){
                return (existingLoan.installmentAmount/7) * 30;
            };

            function convertDailyEMIAmountToMonthly(existingLoan){
                return existingLoan.installmentAmount * 30;
            };

            scope.existingclientdetailsloaded = false;
           scope.getCreditBureauReportSummary = function () {
               if(!scope.existingclientdetailsloaded) {
                   resourceFactory.clientCreditSummary.getAll({
                       clientId: scope.clientId,
                       loanApplicationId: null,
                       loanId: null,
                       trancheDisbursalId: null
                   }, function (data) {
                       scope.existingLoans = data.existingLoans;
                       scope.creditScores = data.creditScores ;
                       constructLoanSummary();
                   });
                   scope.existingclientdetailsloaded = true;
               }
            };

            scope.creditBureauReportView = function () {
                resourceFactory.creditBureauReportFileContentResource.get({
                    entityType: 'client',
                    entityId: scope.entityId
                }, function (fileContentData) {
                    if (fileContentData.reportFileType.value == 'HTML') {
                        var result = "";
                        for (var i = 0; i < fileContentData.fileContent.length; ++i) {
                            result += (String.fromCharCode(fileContentData.fileContent[i]));
                        }
                        var popupWin = window.open('', '_blank', 'width=1000,height=500');
                        popupWin.document.open();
                        popupWin.document.write(result);
                        popupWin.document.close();
                    }else if (fileContentData.reportFileType.value == 'XML') {
                        var result = "";
                        for (var i = 0; i < fileContentData.fileContent.length; ++i) {
                            result += (String.fromCharCode(fileContentData.fileContent[i]));
                        }
                        var newWindow = window.open('', '_blank', 'toolbar=0, location=0, directories=0, status=0, scrollbars=1, resizable=1, copyhistory=1, menuBar=1, width=640, height=480, left=50, top=50', true);
                        var preEl = newWindow.document.createElement("pre");
                        var codeEl = newWindow.document.createElement("code");
                        codeEl.appendChild(newWindow.document.createTextNode(result));
                        preEl.appendChild(codeEl);
                        newWindow.document.body.appendChild(preEl);
                    }
                });
            };

            scope.routeToShareAccount = function(id) {
                location.path('/viewshareaccount/'+id)
            } ;

            scope.haveFile = [];
            resourceFactory.clientResource.get({clientId: routeParams.id, associations:'hierarchyLookup'}, function (data) {
                scope.client = data;
                if(scope.client.lastname != undefined){
                    scope.client.displayNameInReverseOrder = scope.client.lastname.concat(" ");
                }
                if(scope.client.middlename != undefined){
                    scope.client.displayNameInReverseOrder = scope.client.displayNameInReverseOrder.concat(scope.client.middlename).concat(" ");
                }
                if(scope.client.firstname != undefined){
                    scope.client.displayNameInReverseOrder = scope.client.displayNameInReverseOrder.concat(scope.client.firstname);
                }
                $rootScope.clientname=data.displayName;
                scope.isClosedClient = scope.client.status.value == 'Closed';
                scope.staffData.staffId = data.staffId;
                if(scope.client.dateOfBirth != undefined && scope.client.dateOfBirth != null){
                    calculateClientAge(scope.client.dateOfBirth);
                }
                if (data.imagePresent) {
                    http({
                        method: 'GET',
                        url: $rootScope.hostUrl + API_VERSION + '/client/' + routeParams.id + '/images?maxHeight=150'
                    }).then(function (imageData) {
                        scope.imageData = imageData.data[0];
                        http({
                        method: 'GET',
                        url: $rootScope.hostUrl + API_VERSION + '/client/' + routeParams.id + '/images/'+scope.imageData.imageId+'?maxHeight=150'
                        }).then(function (imageData) {
                            scope.image = imageData.data;
                        });
                    });
                    

                }
                if(data.groups.length > 0 && data.groups[0].groupLevel==1){
                    scope.isCenter=true;
                }
                if(data.groups.length > 0 && data.groups.length ==1 && data.groups.groupLevel==2) {
                    scope.group = data.groups[0];
                }
                if(data.groups.length > 0 && data.groups.length ==1 && data.groups.groupLevel==1) {
                    scope.center = data.groups[0];
                }

                http({
                    method: 'GET',
                    url: $rootScope.hostUrl + API_VERSION + '/clients/' + routeParams.id + '/documents'
                }).then(function (docsData) {
                    var docId = -1;
                    for (var i = 0; i < docsData.data.length; ++i) {
                        if (docsData.data[i].name == 'clientSignature') {
                            docId = docsData.data[i].id;
                            scope.signature_url = $rootScope.hostUrl + API_VERSION + '/clients/' + routeParams.id + '/documents/' + docId + '/attachment?tenantIdentifier=' + $rootScope.tenantIdentifier;
                        }
                    }
                });

                scope.navigateToSavingsOrDepositAccount = function (eventName, accountId, savingProductType) {
                    switch(eventName) {

                        case "deposit":
                            if(savingProductType==100)
                                location.path('/savingaccount/' + accountId + '/deposit');
                            if(savingProductType==300)
                                location.path('/recurringdepositaccount/' + accountId + '/deposit');
                            break;
                        case "withdraw":
                            if(savingProductType==100)
                                location.path('/savingaccount/' + accountId + '/withdrawal');
                            if(savingProductType==300)
                                location.path('/recurringdepositaccount/' + accountId + '/withdrawal');
                            break;
                    }
                }

                
                var clientStatus = new mifosX.models.ClientStatus();

                if (clientStatus.statusKnown(data.status.value)) {
                    scope.buttons = clientStatus.getStatus(data.status.value);
                    scope.savingsActionbuttons = [
                            {
                                name: "button.deposit",
                                type: "100",
                                icon: "icon-arrow-right",
                                taskPermissionName: "DEPOSIT_SAVINGSACCOUNT"
                            },
                            {
                                name: "button.withdraw",
                                type: "100",
                                icon: "icon-arrow-left",
                                taskPermissionName: "WITHDRAW_SAVINGSACCOUNT"
                            },
                            {
                                name: "button.deposit",
                                type: "300",
                                icon: "icon-arrow-right",
                                taskPermissionName: "DEPOSIT_RECURRINGDEPOSITACCOUNT"
                            },
                            {
                                name: "button.withdraw",
                                type: "300",
                                icon: "icon-arrow-left",
                                taskPermissionName: "WITHDRAW_RECURRINGDEPOSITACCOUNT"
                            }
                        ];
                }

                if (data.status.value == "Pending" || data.status.value == "Active") {
                    if (data.staffId) {

                    }
                    else {
                        scope.buttons.push(clientStatus.getStatus("Assign Staff"));
                    }
                    if (!scope.client.isWorkflowEnabled) {
                        var editOption = {
                            name: "label.button.edit",
                            href: "#/editclient",
                            icon: "icon-edit",
                            taskPermissionName: "UPDATE_CLIENT"
                        };
                        scope.buttons.splice(1, 0, editOption);
                        if (data.status.value == "Pending") {
                            var activateOption = {
                                name: "label.button.activate",
                                href: "#/client",
                                subhref: "activate",
                                icon: "icon-ok-sign",
                                taskPermissionName: "ACTIVATE_CLIENT"
                            };
                            scope.buttons.splice(1, 0, activateOption);
                        }
                    }
                }

                scope.buttonsArray = {
                    options: [
                        {
                            name: "button.clientscreenreports"
                        }
                    ]
                };

                scope.buttonsArray.singlebuttons = scope.buttons;

                scope.$watch(scope.buttonsArray.singlebuttons, function() {
                    if(_.isUndefined(scope.isLoanApplication)){
                        resourceFactory.configurationResource.get({configName: 'loan-application'}, function (response) {
                            scope.isLoanApplication = response.enabled;
                            for(var i in scope.buttonsArray.singlebuttons){
                                if(scope.buttonsArray.singlebuttons[i].taskPermissionName === 'CREATE_LOANAPPLICATIONREFERENCE'){
                                    scope.buttonsArray.singlebuttons[i].isEnableButton = scope.isLoanApplication;
                                    break;
                                }
                            }
                        });
                    }else{
                        for(var i in scope.buttonsArray.singlebuttons){
                            if(scope.buttonsArray.singlebuttons[i].taskPermissionName === 'CREATE_LOANAPPLICATIONREFERENCE'){
                                scope.buttonsArray.singlebuttons[i].isEnableButton = scope.isLoanApplication;
                                break;
                            }
                        }
                    }
                });


                resourceFactory.runReportsResource.get({reportSource: 'ClientSummary', genericResultSet: 'false', R_clientId: routeParams.id}, function (data) {
                    scope.client.ClientSummary = data[0];
                    scope.loancycledetail = data;
                });
                var associatedEntityId = scope.client.legalForm != undefined ? scope.client.legalForm.id : null;
                if (associatedEntityId == null) {
                    associatedEntityId = scope.client.clientType.id != undefined ? scope.client.clientType.id : null;
                } else if (associatedEntityId == null) {
                    associatedEntityId = scope.client.clientClassification.id != undefined ? scope.client.clientClassification.id : null;
                }
                var dataTableParams = {apptable: 'm_client', associatedEntityId: associatedEntityId, isFetchBasicData : true};
                resourceFactory.DataTablesResource.getAllDataTables(dataTableParams, function (data) {
                    scope.clientdatatables = data;
                });

                resourceFactory.loanApplicationReferencesResource.getByClientId({clientId: routeParams.id}, function (data) {
                    scope.loanApplications = data;
                });

                resourceFactory.clientAccountResource.get({clientId: routeParams.id}, function (data) {
                    scope.clientAccounts = data;
                    scope.pledges = scope.clientAccounts.pledges;
                    if (data.savingsAccounts) {
                        for (var i in data.savingsAccounts) {
                            if (data.savingsAccounts[i].status.value == "Active") {
                                scope.updateDefaultSavings = true;
                                break;
                            }
                        }
                    }
                    resourceFactory.clientChargesResource.getCharges({clientId: routeParams.id, pendingPayment:true, chargeStatus:"active"}, function (data) {
                        scope.charges = data.pageItems;


                    });
                });

            });
            function calculateClientAge(dateOfBirth){
                dateOfBirth = new Date(dateFilter(dateOfBirth, scope.df));
                var ageDifMs = Date.now() - dateOfBirth.getTime();
                var ageDifMs = Date.now() - dateOfBirth.getTime();
                var ageDate = new Date(ageDifMs); // miliseconds from epoch
                scope.displayAge = true;
                scope.age = Math.abs(ageDate.getUTCFullYear() - 1970);
            }

            scope.deleteClient = function () {
                $modal.open({
                    templateUrl: 'deleteClient.html',
                    controller: ClientDeleteCtrl
                });
            };
            scope.uploadPic = function () {
                $modal.open({
                    templateUrl: 'uploadpic.html',
                    controller: UploadPicCtrl
                });
            };
            var UploadPicCtrl = function ($scope, $modalInstance) {
                $scope.onFileSelect = function ($files) {
                    scope.file = $files[0];
                };
                $scope.upload = function () {
                    if (scope.file) {
                        $upload.upload({
                            url: $rootScope.hostUrl + API_VERSION + '/client/' + routeParams.id + '/images',
                            data: {},
                            file: scope.file
                        }).then(function (imageData) {
                            // to fix IE not refreshing the model
                            if (!scope.$$phase) {
                                scope.$apply();
                            }
                            $modalInstance.close('upload');
                            route.reload();
                        });
                    }
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };
            scope.capturePic = function () {
                $modal.open({
                    templateUrl: 'capturepic.html',
                    controller: CapturePicCtrl,
                    windowClass: 'modalwidth700'
                });
            };
            var CapturePicCtrl = function ($scope, $modalInstance) {

                $scope.video = null;
                $scope.picture = null;
                $scope.error = null;
                $scope.channel={};
                
                $scope.onVideoSuccess = function () {
                    $scope.video = $scope.channel.video;
                    $scope.error = null;
                };

                $scope.onVideoError = function (err) {
                    if(typeof err != "undefined")
                        $scope.error = err.message + '(' + err.name + ')';
                };

                $scope.takeScreenshot = function () {
                    var picCanvas = document.createElement('canvas');
                    var width = $scope.video.width;
                    var height = $scope.video.height;

                    picCanvas.width = width;
                    picCanvas.height = height;
                    var ctx = picCanvas.getContext("2d");
                    ctx.drawImage($scope.video, 0, 0, width, height);
                    var imageData = ctx.getImageData(0, 0, width, height);
                    document.querySelector('#clientSnapshot').getContext("2d").putImageData(imageData, 0, 0);
                    $scope.picture = picCanvas.toDataURL();
                };
                $scope.uploadscreenshot = function () {
                    if($scope.picture != null) {
                        http({
                            method: 'POST',
                            url: $rootScope.hostUrl + API_VERSION + '/client/' + routeParams.id + '/images',
                            data: $scope.picture
                        }).then(function (imageData) {
                            if (!scope.$$phase) {
                                scope.$apply();
                            }
                            $modalInstance.close('upload');
                            route.reload();
                        });
                    }
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
                $scope.reset = function () {
                    $scope.picture = null;
                }
            };
            scope.deletePic = function () {
                $modal.open({
                    templateUrl: 'deletePic.html',
                    controller: DeletePicCtrl
                });
            };
            var DeletePicCtrl = function ($scope, $modalInstance) {
                $scope.delete = function () {
                    http({
                        method: 'DELETE',
                        url: $rootScope.hostUrl + API_VERSION + '/client/' + routeParams.id + '/images',
                    }).then(function (imageData) {
                        if (!scope.$$phase) {
                            scope.$apply();
                        }
                        $modalInstance.close('delete');
                        route.reload();
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };
            scope.uploadSig = function () {
                $modal.open({
                    templateUrl: 'uploadsig.html',
                    controller: UploadSigCtrl
                });
            };
            var UploadSigCtrl = function ($scope, $modalInstance) {
                $scope.onFileSelect = function ($files) {
                    scope.file = $files[0];
                };
                $scope.upload = function () {
                    if (scope.file) {
                        $upload.upload({
                            url: $rootScope.hostUrl + API_VERSION + '/client/' + routeParams.id + '/documents',
                            data: {
                                name: 'clientSignature',
                                description: 'client signature'
                            },
                            file: scope.file,
                        }).then(function (imageData) {
                                // to fix IE not refreshing the model
                                if (!scope.$$phase) {
                                    scope.$apply();
                                }
                                $modalInstance.close('upload');
                                route.reload();
                            });
                    }
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            scope.unassignStaffCenter = function () {
                $modal.open({
                    templateUrl: 'clientunassignstaff.html',
                    controller: ClientUnassignCtrl
                });
            };
            var ClientDeleteCtrl = function ($scope, $modalInstance) {
                $scope.delete = function () {
                    resourceFactory.clientResource.delete({clientId: routeParams.id}, {}, function (data) {
                        $modalInstance.close('delete');
                        location.path('/clients');
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };
            var ClientUnassignCtrl = function ($scope, $modalInstance) {
                $scope.unassign = function () {
                    resourceFactory.clientResource.save({clientId: routeParams.id, command: 'unassignstaff'}, scope.staffData, function (data) {
                        $modalInstance.close('unassign');
                        route.reload();
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            scope.isClosed = function (loanaccount) {
                if (loanaccount.status.code === "loanStatusType.closed.written.off" ||
                    loanaccount.status.code === "loanStatusType.closed.obligations.met" ||
                    loanaccount.status.code === "loanStatusType.closed.reschedule.outstanding.amount" ||
                    loanaccount.status.code === "loanStatusType.withdrawn.by.client" ||
                    loanaccount.status.code === "loanStatusType.rejected") {
                    return true;
                } else {
                    return false;
                }
            };
            scope.isSavingClosed = function (savingaccount) {
                if (savingaccount.status.code === "savingsAccountStatusType.withdrawn.by.applicant" ||
                    savingaccount.status.code === "savingsAccountStatusType.closed" ||
                    savingaccount.status.code === "savingsAccountStatusType.pre.mature.closure" ||
                    savingaccount.status.code === "savingsAccountStatusType.rejected") {
                    return true;
                } else {
                    return false;
                }
            };

            scope.isShareClosed = function (shareAccount) {
                if ( shareAccount.status.code === "shareAccountStatusType.closed" ||
                    shareAccount.status.code === "shareAccountStatusType.rejected") {
                    return true;
                } else {
                    return false;
                }
            };
            scope.setLoan = function () {
                if (scope.openLoan) {
                    scope.openLoan = false
                } else {
                    scope.openLoan = true;
                }
            };
            scope.setSaving = function () {
                if (scope.openSaving) {
                    scope.openSaving = false;
                } else {
                    scope.openSaving = true;
                }
            };

            scope.isGetAllClientsNotes = false;
            scope.getAllClientsNotes = function () {
                if(!scope.isGetAllClientsNotes){
                    resourceFactory.clientNotesResource.getAllNotes({clientId: routeParams.id}, function (data) {
                        scope.clientNotes = data;
                        scope.isGetAllClientsNotes = true;
                    });
                }
            }

            scope.setShares = function () {
                if (scope.openShares) {
                    scope.openShares = false;
                } else {
                    scope.openShares = true;
                }
            };

            var addressConfig = 'enable-clients-address';
            resourceFactory.configurationResource.get({configName: addressConfig}, function (response) {
                if (response.enabled == true) {
                    scope.enableClientAddress = true;
                } else {
                    scope.enableClientAddress = false;
                }
            });

            resourceFactory.configurationResource.get({configName: 'enable-beta'}, function (response) {
                scope.isBetaEnabled = response.enabled;
            });

            scope.entityAddressLoaded = false;
            scope.fetchEntityAddress = function () {
                if(!scope.entityAddressLoaded) {
                    scope.entityType = "clients";
                    resourceFactory.addressDataResource.getAll({
                        entityType: scope.entityType,
                        entityId: routeParams.id
                    }, function (response) {
                        if (response != null) {
                            scope.addressData = response;
                        }
                    });
                    scope.entityAddressLoaded = true;
                }
            }
            scope.deleteAddress = function (addressId) {
                scope.addressId = addressId;
                $modal.open({
                    templateUrl: 'deleteaddress.html',
                    controller: AddressDeleteCtrl
                });
            };

            var AddressDeleteCtrl = function ($scope, $modalInstance) {
                $scope.delete = function () {
                    resourceFactory.entityAddressResource.delete({entityType: scope.entityType, entityId: routeParams.id, addressId: scope.addressId}, function (response) {
                        $modalInstance.close('delete');
                        if(response != null) {
                            route.reload();
                        }
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };
            scope.smartCardDataLoaded = false;
            scope.fetchSmartCardData = function() {
                if(!scope.smartCardDataLoaded) {
                    scope.entityType = "clients";
                    resourceFactory.smartCardDataResource.getAll({
                        entityId: routeParams.id,
                        entityType: scope.entityType
                    }, function (response) {
                        if (response != null) {
                            scope.smartCardData = response;
                        }
                    });
                    scope.smartCardDataLoaded = true;
                }
            }

            scope.inactivate = function (smartCard) {
                scope.smartCard = smartCard;
                scope.showNoteField = true;
                scope.showSmartcard = false;
            };

            scope.submit = function () {
                scope.entityType = "clients";
                scope.smartformData.locale = scope.optlang.code;
                scope.smartformData.dateFormat = scope.df;
                scope.smartformData.cardNumber = scope.smartCard.cardNumber;
                resourceFactory.smartCardDataResource.update({entityId: routeParams.id, entityType: scope.entityType, command: 'inactivate' },scope.smartformData, function (response) {
                    if(response != null) {
                        route.reload();
                    }
                });
            };
            scope.cancel = function () {
                route.reload();
            };
            scope.clientIdentityDocumentsLoaded = false;
            scope.getClientIdentityDocuments = function () {
                if(!scope.clientIdentityDocumentsLoaded) {
                    resourceFactory.clientResource.getAllClientDocuments({
                        clientId: routeParams.id,
                        anotherresource: 'identifiers'
                    }, function (data) {
                        scope.identitydocuments = data;
                        for (var i = 0; i < scope.identitydocuments.length; i++) {
                            resourceFactory.clientIdentifierResource.get({clientIdentityId: scope.identitydocuments[i].id}, function (data) {
                                for (var j = 0; j < scope.identitydocuments.length; j++) {
                                    if (data.length > 0 && scope.identitydocuments[j].id == data[0].parentEntityId) {
                                        for (var l in data) {

                                            var loandocs = {};
                                            loandocs = API_VERSION + '/' + data[l].parentEntityType + '/' + data[l].parentEntityId + '/documents/' + data[l].id + '/attachment?tenantIdentifier=' + $rootScope.tenantIdentifier;
                                            data[l].docUrl = loandocs;
                                        }
                                        scope.identitydocuments[j].documents = data;
                                    }
                                }
                            });
                        }
                    });
                    scope.clientIdentityDocumentsLoaded = true;
                }
            };

            scope.dataTableChange = function (clientdatatable) {
                resourceFactory.DataTablesResource.getTableDetails({datatablename: clientdatatable.registeredTableName,
                    entityId: routeParams.id, genericResultSet: 'true'}, function (data) {
                    scope.datatabledetails = data;
                    scope.datatabledetails.isData = data.data.length > 0 ? true : false;
                    scope.datatabledetails.isColumnData = data.columnData.length > 0 ? true : false;
                    scope.datatabledetails.isMultirow = data.columnHeaders[0].columnName == "id" ? true : false;
                    scope.showDataTableAddButton = !scope.datatabledetails.isData || scope.datatabledetails.isMultirow;
                    scope.showDataTableEditButton = scope.datatabledetails.isData && !scope.datatabledetails.isMultirow;
                    scope.singleRow = [];
                    scope.isSectioned = false;
                    scope.sections = [];
                    for (var i in data.columnHeaders) {
                        if (scope.datatabledetails.columnHeaders[i].columnCode) {
                            for (var j in scope.datatabledetails.columnHeaders[i].columnValues) {
                                for (var k in data.data) {
                                    if (data.data[k].row[i] == scope.datatabledetails.columnHeaders[i].columnValues[j].id) {
                                        data.data[k].row[i] = scope.datatabledetails.columnHeaders[i].columnValues[j].value;
                                    }
                                }
                                for(var m in data.columnData){
                                    for(var n in data.columnData[m].row){
                                        if(data.columnData[m].row[n].columnName == scope.datatabledetails.columnHeaders[i].columnName && data.columnData[m].row[n].value == scope.datatabledetails.columnHeaders[i].columnValues[j].id){
                                            data.columnData[m].row[n].value = scope.datatabledetails.columnHeaders[i].columnValues[j].value;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    
                    if(data.sectionedColumnList != null && data.sectionedColumnList !=undefined && data.sectionedColumnList.length > 0){
                    	scope.isSectioned = true;
                    }

                    if (scope.datatabledetails.isColumnData) {
                        for (var i in data.columnHeaders) {
                            if (!scope.datatabledetails.isMultirow) {
                                var row = {};
                                if(data.columnHeaders[i].displayName != undefined && data.columnHeaders[i].displayName != 'null') {
                                    row.key = data.columnHeaders[i].displayName;
                                } else {
                                    row.key = data.columnHeaders[i].columnName;
                                }
                                row.columnDisplayType = data.columnHeaders[i].columnDisplayType;
                                for(var j in data.columnData[0].row){
                                    if(data.columnHeaders[i].columnName == data.columnData[0].row[j].columnName){
                                       row.value = data.columnData[0].row[j].value;
                                       break;
                                    }
                                }
                                scope.singleRow.push(row);
                            }
                            var index = scope.datatabledetails.columnData[0].row.findIndex(x => x.columnName==data.columnHeaders[i].columnName);
                            if(index > 0 ){
                                if(data.columnHeaders[i].displayName != undefined && data.columnHeaders[i].displayName != 'null') {
                                   scope.datatabledetails.columnData[0].row[index].displayName = data.columnHeaders[i].displayName;
                                } 
                            }
                        }    
                    }

                    for(var l in data.sectionedColumnList){
                        var tempSection = {
                        displayPosition:data.sectionedColumnList[l].displayPosition,
                        displayName: data.sectionedColumnList[l].displayName,
                        cols: []
                        }
                    scope.sections.push(tempSection);
                    }
                    if(scope.isSectioned){
                        if (scope.datatabledetails.isColumnData) {
                            for(var l in data.sectionedColumnList){
                                for (var i in data.sectionedColumnList[l].columns) {
                                    for (var j in data.columnHeaders) {
                                        if(data.sectionedColumnList[l].columns[i].columnName == data.columnHeaders[j].columnName ){
                                            var index = scope.sections.findIndex(x => x.displayName==data.sectionedColumnList[l].displayName);
                                            if (!scope.datatabledetails.isMultirow) {   
                                                var row = {};
                                                if(data.columnHeaders[j].displayName != undefined && data.columnHeaders[j].displayName != 'null') {
                                                    row.key = data.columnHeaders[j].displayName;
                                                } else {
                                                    row.key = data.columnHeaders[j].columnName;
                                                }
                                                row.columnDisplayType = data.columnHeaders[j].columnDisplayType;
                                                for(var k in data.columnData[0].row){
                                                    if(data.columnHeaders[j].columnName == data.columnData[0].row[k].columnName){
                                                        row.value = data.columnData[0].row[k].value;
                                                        break;
                                                    }
                                                }
                                                scope.sections[index].cols.push(row);
                                            }
                                        } 
                                    }
                                }
                            }
                        }
                    }
                    
                });
            };

            scope.viewstandinginstruction = function () {
                location.path('/liststandinginstructions/' + scope.client.officeId + '/' + scope.client.id);
            };
            scope.createstandinginstruction = function () {
                location.path('/createstandinginstruction/' + scope.client.officeId + '/' + scope.client.id + '/fromsavings');
            };
            scope.deleteAll = function (apptableName, entityId) {
                resourceFactory.DataTablesResource.delete({datatablename: apptableName, entityId: entityId, genericResultSet: 'true'}, {}, function (data) {
                    route.reload();
                });
            };

            scope.clientDocumentsLoaded = false;
            scope.getClientDocuments = function () {
                if(!scope.clientDocumentsLoaded) {
                    resourceFactory.clientDocumentsResource.getAllClientDocuments({clientId: routeParams.id}, function (data) {
                        scope.clientdocuments = {};
                        for (var l = 0; l < data.length; l++) {
                            if (data[l].id) {
                                var loandocs = {};
                                loandocs = API_VERSION + '/' + data[l].parentEntityType + '/' + data[l].parentEntityId + '/documents/' + data[l].id + '/attachment?tenantIdentifier=' + $rootScope.tenantIdentifier;
                                data[l].docUrl = loandocs;
                            }
                            if(data[l].tagValue){
                                scope.pushDocumentToTag(data[l], data[l].tagValue);
                            } else {
                                scope.pushDocumentToTag(data[l], 'uploadedDocuments');
                            }
                        }
                    });
                    scope.clientDocumentsLoaded = true;
                }
            };

            scope.pushDocumentToTag = function(document, tagValue){
                if (scope.clientdocuments.hasOwnProperty(tagValue)) {
                    scope.clientdocuments[tagValue].push(document);
                } else {
                    scope.clientdocuments[tagValue] = [];
                    scope.clientdocuments[tagValue].push(document);
                }
            };

            scope.deleteDocument = function (document, index, tagValue) {
                resourceFactory.clientDocumentsResource.delete({clientId: routeParams.id, documentId: document.id}, '', function (data) {
                    if(document.reportIdentifier) {
                        delete document.id ;
                    }else {
                        scope.clientdocuments[tagValue].splice(index, 1);
                    }
                });
            };

            scope.generateDocument = function (document){
                resourceFactory.documentsGenerateResource.generate({entityType:'clients', entityId: routeParams.id, identifier: document.reportIdentifier}, function(data){
                    document.id = data.resourceId;
                    var loandocs = {};
                    loandocs = API_VERSION + '/' + document.parentEntityType + '/' + document.parentEntityId + '/documents/' + document.id + '/attachment?tenantIdentifier=' + $rootScope.tenantIdentifier;
                    document.docUrl = loandocs;
                })
            };

            scope.reGenerateDocument = function (document){
                resourceFactory.documentsGenerateResource.reGenerate({entityType:'clients', entityId: routeParams.id, identifier: document.id}, function(data){
                    document.id = data.resourceId;
                    var loandocs = {};
                    loandocs = API_VERSION + '/' + document.parentEntityType + '/' + document.parentEntityId + '/documents/' + document.id + '/attachment?tenantIdentifier=' + $rootScope.tenantIdentifier;
                    document.docUrl = loandocs;
                })
            };
            
            scope.viewDataTable = function (registeredTableName, data) {
                if (scope.datatabledetails.isMultirow) {
                    location.path("/viewdatatableentry/" + registeredTableName + "/" + scope.client.id + "/" + data.row[0].value);
                } else {
                    location.path("/viewsingledatatableentry/" + registeredTableName + "/" + scope.client.id);
                }
            };

            scope.downloadDocument = function (documentId) {
                resourceFactory.clientDocumentsResource.get({clientId: routeParams.id, documentId: documentId}, '', function (data) {
                    scope.clientdocuments.splice(index, 1);
                });
            };

            scope.isLoanNotClosed = function (loanaccount) {
                if (loanaccount.status.code === "loanStatusType.closed.written.off" ||
                    loanaccount.status.code === "loanStatusType.closed.obligations.met" ||
                    loanaccount.status.code === "loanStatusType.closed.reschedule.outstanding.amount" ||
                    loanaccount.status.code === "loanStatusType.withdrawn.by.client" ||
                    loanaccount.status.code === "loanStatusType.rejected") {
                    return false;
                } else {
                    return true;
                }
            };

            scope.loanAppStatusId = 400;
            scope.isLoanAppIncompleted = function (loanAddData) {
                if (loanAddData.status.id < scope.loanAppStatusId) {
                    return true;
                } else {
                    return false;
                }
            };

            scope.isSavingNotClosed = function (savingaccount) {
                if (savingaccount.status.code === "savingsAccountStatusType.withdrawn.by.applicant" ||
                    savingaccount.status.code === "savingsAccountStatusType.closed" ||
                    savingaccount.status.code === "savingsAccountStatusType.pre.mature.closure" ||
                    savingaccount.status.code === "savingsAccountStatusType.rejected") {
                    return false;
                } else {
                    return true;
                }
            };

            scope.isShareNotClosed = function (shareAccount) {
                if ( shareAccount.status.code === "shareAccountStatusType.closed" ||
                    shareAccount.status.code === "shareAccountStatusType.rejected") {
                    return false;
                } else {
                    return true;
                }
            };
            scope.saveNote = function () {
                resourceFactory.clientResource.save({clientId: routeParams.id, anotherresource: 'notes'}, this.formData, function (data) {
                    var today = new Date();
                    temp = { id: data.resourceId, note: scope.formData.note, createdByUsername: "test", createdOn: today };
                    scope.clientNotes.push(temp);
                    scope.formData.note = "";
                    scope.predicate = '-id';
                });
            }

            scope.deleteClientIdentifierDocument = function (clientId, entityId, index) {
                resourceFactory.clientIdenfierResource.delete({clientId: clientId, id: entityId}, '', function (data) {
                    scope.identitydocuments.splice(index, 1);
                });
            };

            scope.downloadClientIdentifierDocument = function (identifierId, documentId) {
                console.log(identifierId, documentId);
            };

            scope.waiveCharge = function(chargeId){
                resourceFactory.clientChargesResource.waive({clientId: routeParams.id, resourceType:chargeId}, function (data) {
                    route.reload();
                });
            }

            scope.showSignature = function()
            {
                $modal.open({
                    templateUrl: 'clientSignature.html',
                    controller: ViewLargerClientSignature,
                    size: "lg"
                });
             };

            scope.showWithoutSignature = function()
            {
                $modal.open({
                    templateUrl: 'clientWithoutSignature.html',
                    controller: ViewClientWithoutSignature,
                    size: "lg"
                });
            };

            scope.showPicture = function () {
                $modal.open({
                    templateUrl: 'photo-dialog.html',
                    controller: ViewLargerPicCtrl,
                    size: "lg"
                });
            };

            var ViewClientWithoutSignature = function($scope,$modalInstance){
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };
            var ViewLargerClientSignature = function($scope,$modalInstance){
                    var loadSignature = function(){
                     http({
                        method: 'GET',
                        url: $rootScope.hostUrl + API_VERSION + '/clients/' + routeParams.id + '/documents'
                     }).then(function (docsData) {
                        var docId = -1;
                        for (var i = 0; i < docsData.data.length; ++i) {
                            if (docsData.data[i].name == 'clientSignature') {
                                docId = docsData.data[i].id;
                                scope.signature_url = $rootScope.hostUrl + API_VERSION + '/clients/' + routeParams.id + '/documents/' + docId + '/attachment?tenantIdentifier=' + $rootScope.tenantIdentifier;
                            }
                        }
                    if (scope.signature_url != null) {
                        http({
                            method: 'GET',
                                url: $rootScope.hostUrl + API_VERSION + '/clients/' + routeParams.id + '/documents/' + docId + '/attachment?tenantIdentifier=' + $rootScope.tenantIdentifier
                    }).then(function (docsData) {
                            $scope.largeImage = scope.signature_url;
                        });
                    }
                    });
                };
                loadSignature();
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
             };

            var ViewLargerPicCtrl = function ($scope, $modalInstance) {
                var loadImage = function () {
                    if (scope.client.imagePresent) {
                        http({
                            method: 'GET',
                            url: $rootScope.hostUrl + API_VERSION + '/client/' + routeParams.id + '/images?maxWidth=860'
                        }).then(function (imageData) {
                            $scope.Image = imageData.data[0];
                            http({
                            method: 'GET',
                            url: $rootScope.hostUrl + API_VERSION + '/client/' + routeParams.id + '/images/'+$scope.Image.imageId+'?maxHeight=860'
                            }).then(function (imageData) {
                                $scope.largeImage = imageData.data;
                            });
                        });
                        
                    }
                };
                loadImage();
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            }

            scope.deletePledge = function(id){
                resourceFactory.pledgeResource.delete({pledgeId: id}, function (data) {
                    resourceFactory.clientAccountResource.get({clientId: routeParams.id}, function (data) {
                        scope.pledges = data.pledges;
                    });
                });

            };

            scope.requestApprovalLoanAppRef = function (loanApplicationReferenceId) {
                resourceFactory.loanApplicationReferencesResource.update({
                    loanApplicationReferenceId: loanApplicationReferenceId,
                    command: 'requestforapproval'
                }, {}, function (data) {
                    location.path('/viewloanapplicationreference/' + loanApplicationReferenceId);
                });
            };

            scope.familyDetailsLoaded = false;
            scope.familyDetails = function(){
                if(!scope.familyDetailsLoaded) {
                    resourceFactory.familyDetails.getAll({clientId: routeParams.id}, function (data) {
                        scope.familyMembers = data;
                        scope.checkIfFamilyMemberIsExistingCustomer(scope.familyMembers);
                        scope.differentiateFamilyMemberDetailsBaseOnReferenceId(scope.familyMembers);
                    });
                    scope.familyDetailsLoaded = true;
                }
            };

            scope.checkIfFamilyMemberIsExistingCustomer = function(familyMembers){
                for(var i in familyMembers){
                    familyMembers[i].isExistingCustomer = false;
                    if(familyMembers[i].clientReference){
                        familyMembers[i].isExistingCustomer = true;
                    }
                }
            }

            scope.routeTo = function (id) {
                location.path('/clients/' + routeParams.id + '/viewfamilydetails/' + id);
            };

            scope.routeToClientDetails = function (familyMember) {
                if( familyMember.clientReference ){
                    location.path('/viewclient/' + familyMember.clientReference);
                }
            };

            scope.showEdit = function (id) {
                location.path('/clients/' + routeParams.id + '/editfamilydetails/' + id);
            };

            var FamilyDetailsDeleteCtrl = function ($scope, $modalInstance, familyDetailsId) {
                $scope.delete = function () {
                    resourceFactory.familyDetails.delete({
                        clientId: scope.id,
                        familyDetailId: familyDetailsId
                    }, {}, function (data) {
                        $modalInstance.close('delete');
                        route.reload();
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };
            scope.deleteFamilyDetail = function (id) {
                $modal.open({
                    templateUrl: 'deletefamilydetail.html',
                    controller: FamilyDetailsDeleteCtrl,
                    resolve: {
                        familyDetailsId: function () {
                            return id;
                        }
                    }
                });
            };
            scope.incomeAndexpenseLoaded = false;
            scope.incomeAndexpense = function(){
                if(!scope.incomeAndexpenseLoaded) {
                    resourceFactory.incomeExpenseAndHouseHoldExpense.getAll({clientId: routeParams.id}, function (data) {
                        scope.incomeAndExpenses = data;
                        scope.totalIncomeOcc = scope.calculateOccupationTotal();
                        scope.totalIncomeAsset = scope.calculateTotalAsset();
                        scope.totalHouseholdExpense = scope.calculateTotalExpense();
                    });
                    scope.incomeAndexpenseLoaded = true;
                }
            };


            scope.calculateOccupationTotal = function(){
                var total = 0;
                angular.forEach(scope.incomeAndExpenses, function(incomeExpense){
                    if(!_.isUndefined(incomeExpense.incomeExpenseData.cashFlowCategoryData.categoryEnum) && incomeExpense.incomeExpenseData.cashFlowCategoryData.categoryEnum.id == 1){
                        if(!_.isUndefined(incomeExpense.totalIncome) && !_.isNull(incomeExpense.totalIncome)){
                            if(!_.isUndefined(incomeExpense.totalExpense) && !_.isNull(incomeExpense.totalExpense)){
                                total = total + incomeExpense.totalIncome-incomeExpense.totalExpense;
                            }
                            else
                            {
                                total = total + incomeExpense.totalIncome;
                            }
                        }
                    }
                });
                return total;
            };

            scope.calculateTotalAsset = function(){
                var total = 0;
                angular.forEach(scope.incomeAndExpenses, function(incomeExpense){
                    if(!_.isUndefined(incomeExpense.incomeExpenseData.cashFlowCategoryData.categoryEnum) && incomeExpense.incomeExpenseData.cashFlowCategoryData.categoryEnum.id == 2){
                        if(!_.isUndefined(incomeExpense.totalIncome) && !_.isNull(incomeExpense.totalIncome)){
                            if(!_.isUndefined(incomeExpense.totalExpense) && !_.isNull(incomeExpense.totalExpense)){
                                total = total + incomeExpense.totalIncome-incomeExpense.totalExpense;
                            }
                            else
                            {
                                total = total + incomeExpense.totalIncome;
                            }
                        }
                    }
                });
                return total;
            };

            scope.calculateTotalExpense = function(){
                var total = 0;
                angular.forEach(scope.incomeAndExpenses, function(incomeExpense){
                    if(!_.isUndefined(incomeExpense.incomeExpenseData.cashFlowCategoryData.typeEnum) && incomeExpense.incomeExpenseData.cashFlowCategoryData.typeEnum.id == 2){
                        if(!_.isUndefined(incomeExpense.totalExpense) && !_.isNull(incomeExpense.totalExpense)){
                            total = total + incomeExpense.totalExpense;
                        }
                    }
                });
                return total;
            };

            scope.showEditClientIncome = function(id){
                location.path('/clients/'+scope.id+'/editclientoccupation/'+id);
            };

            scope.showEditClientAsset = function(id){
                location.path('/clients/'+scope.id+'/editclientasset/'+id);
            };

            scope.editClientIdentifier = function(id){
                location.path('/clients/'+scope.id+'/identifiers/'+id);
            };
            scope.showEditClientHouseHoldExpense = function(id){
                location.path('/clients/'+scope.id+'/editclienthouseholdexpense/'+id);
            };

            scope.existingLoansLoaded = false;
            scope.existingLoans = function(){
                if(!scope.existingLoansLoaded) {
                    resourceFactory.clientExistingLoan.getAll({clientId: routeParams.id}, function (data) {
                        scope.existingLoans = data;
                    });
                    scope.existingLoansLoaded = true;
                }
            };

            scope.showEditClientExistLoan = function(id){
                location.path('/clients/'+scope.id+'/editclientexistingloan/'+id);
            }

            scope.routeToViewExistingLoan = function(id){
                location.path('/clients/'+scope.id+'/viewclientexistingloan/'+id);
            }

            function getprofileRating(){
                resourceFactory.profileRating.get({entityType: 1,entityId : routeParams.id}, function (data) {
                    scope.profileRatingData = data;
                });
            };
            getprofileRating();
            scope.reComputeProfileRating = function () {
                scope.profileRatingData = {};
                resourceFactory.computeProfileRatingTemplate.get(function (response) {
                    for(var i in response.scopeEntityTypeOptions){
                        if(response.scopeEntityTypeOptions[i].value === 'OFFICE'){
                            scope.profileRatingData.scopeEntityType = response.scopeEntityTypeOptions[i].id;
                            scope.profileRatingData.scopeEntityId =  scope.client.officeId;
                            break;
                        }
                    }
                    for(var i in response.entityTypeOptions){
                        if(response.entityTypeOptions[i].value === 'CLIENT'){
                            scope.profileRatingData.entityType = response.entityTypeOptions[i].id;
                            scope.profileRatingData.entityId =  routeParams.id;
                            break;
                        }
                    }
                    scope.profileRatingData.locale = "en";
                    resourceFactory.computeProfileRating.save(scope.profileRatingData, function (response) {
                        getprofileRating();
                    });
                });
            }

            scope.isRefundOption = function(loanaccount){
                return (loanaccount.status.value =='Overpaid' && loanaccount.loanType.value != 'GLIM');
            };

            scope.isDisburseOption = function(loanaccount){
                return (!loanaccount.status.pendingApproval && !loanaccount.status.active  && loanaccount.loanType.value != 'GLIM' && loanaccount.status.value!='Overpaid');
            };

            scope.isRepaymentOption = function(loanaccount){
                return (loanaccount.status.active && loanaccount.loanType.value != 'GLIM');
            };
            scope.isApproveOption = function(loanaccount){
                return (loanaccount.status.pendingApproval && loanaccount.loanType.value != 'GLIM');
            };
            
            scope.routeToLoanNextAction = function (loan) {
                var loanId = loan.id;
                var trancheDisbursalId = undefined;
                if(loan.productId){
                    resourceFactory.configurationResource.get({configName: 'tranche-disbursal-credit-check'}, function (response) {
                        scope.isTrancheDisbursalCreditCheck = response.enabled;
                        if (scope.isTrancheDisbursalCreditCheck == true) {
                            resourceFactory.configurationResource.get({configName: 'credit-check'}, function (response) {
                                scope.isCreditCheck = response.enabled;
                                if (scope.isCreditCheck == true) {
                                    resourceFactory.loanProductResource.getCreditbureauLoanProducts({
                                        loanProductId: loan.productId,
                                        associations: 'creditBureaus',
                                        clientId : scope.clientId
                                    }, function (creditbureauLoanProduct) {
                                        scope.creditbureauLoanProduct = creditbureauLoanProduct;
                                        if (scope.creditbureauLoanProduct.isActive == true) {
                                            scope.isCBCheckReq = true;
                                            var multiTranchDataRequest = "multiDisburseDetails,emiAmountVariations";
                                            var loanApplicationReferenceId = "loanApplicationReferenceId";
                                            resourceFactory.LoanAccountResource.getLoanAccountDetails({loanId: loanId,  associations:multiTranchDataRequest+",loanApplicationReferenceId", exclude: 'guarantors'}, function (data) {
                                                scope.loandetails = data;
                                                if(!_.isUndefined(scope.loandetails.disbursementDetails)){
                                                    var expectedDisbursementDate = undefined;
                                                    for(var i in scope.loandetails.disbursementDetails){
                                                        if(_.isUndefined(scope.loandetails.disbursementDetails[i].actualDisbursementDate)){
                                                            if(_.isUndefined(expectedDisbursementDate)){
                                                                expectedDisbursementDate = scope.loandetails.disbursementDetails[i].expectedDisbursementDate;
                                                                trancheDisbursalId = scope.loandetails.disbursementDetails[i].id;
                                                            }else{
                                                                if(expectedDisbursementDate > scope.loandetails.disbursementDetails[i].expectedDisbursementDate){
                                                                    expectedDisbursementDate = scope.loandetails.disbursementDetails[i].expectedDisbursementDate;
                                                                    trancheDisbursalId = scope.loandetails.disbursementDetails[i].id;
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                                routeToLoanNextActionUrl(loanId,trancheDisbursalId);
                                            });
                                        }else{
                                            routeToLoanNextActionUrl(loanId,trancheDisbursalId);
                                        }
                                    });
                                }else{
                                    routeToLoanNextActionUrl(loanId,trancheDisbursalId);
                                }
                            });
                        }else{
                            routeToLoanNextActionUrl(loanId,trancheDisbursalId);
                        }
                    });
                }else{
                    routeToLoanNextActionUrl(loanId,trancheDisbursalId);
                }
            };

            var viewDocumentCtrl= function ($scope, $modalInstance, documentDetail) {
                $scope.data = documentDetail;
                $scope.close = function () {
                    $modalInstance.close('close');
                };
               
            };
            scope.openViewDocument = function (documentDetail) {
                $modal.open({
                    templateUrl: 'viewDocument.html',
                    controller: viewDocumentCtrl,
                    resolve: {
                        documentDetail: function () {
                            return documentDetail;
                        }
                    }
                });
            };

            function routeToLoanNextActionUrl(loanId,trancheDisbursalId){
                if(_.isUndefined(trancheDisbursalId)){
                    location.path('/loanaccount/'+loanId+'/disburse');
                }else{
                    location.path('/creditbureaureport/loan/'+loanId+'/'+trancheDisbursalId+'/'+scope.clientId);
                }
            };
            scope.differentiateFamilyMemberDetailsBaseOnReferenceId = function(familyMembers){
                scope.familyDetailsOfClient = [];
                scope.familyMemberOf = [];
                for(var i in familyMembers){
                    if(familyMembers[i].clientReference == scope.clientId){
                        scope.familyMemberOf.push(familyMembers[i]);
                    }
                    else if(familyMembers[i].id){
                        scope.familyDetailsOfClient.push(familyMembers[i]);
                    }

                }
            }
            scope.routeToClient = function (id) {
              location.path('/viewclient/' + id);   
           };
        }
    });

    mifosX.ng.application.controller('ViewClientController', ['$scope', '$routeParams', '$route', '$location', 'ResourceFactory', '$http', '$modal', 'API_VERSION', '$rootScope', '$upload', 'dateFilter', mifosX.controllers.ViewClientController]).run(function ($log) {
        $log.info("ViewClientController initialized");
    });
}(mifosX.controllers || {}));