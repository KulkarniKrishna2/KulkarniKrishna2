(function (module) {
    mifosX.controllers = _.extend(module, {
        MainController: function (scope, location, sessionManager, translate, $rootScope, localStorageService, keyboardManager, $idle, tmhDynamicLocale, 
                  uiConfigService, $http, authenticationService, resourceFactory, $timeout, popUpUtilService,$modalStack) {
            var publicKey = undefined;
            scope.hideLoginPannel = false;
            scope.mainUIConfigData = {};
            if (QueryParameters["username"] != undefined && QueryParameters["username"] != "" && QueryParameters["password"] != undefined &&
                QueryParameters["password"] != "" && QueryParameters["landingPath"] != undefined && QueryParameters["landingPath"] != "") {
                scope.hideLoginPannel = true;
                scope.landingPath = QueryParameters["landingPath"];
                var loginCredentials = {};
                loginCredentials.username = QueryParameters["username"];
                loginCredentials.password = QueryParameters["password"];
                authenticationService.authenticateWithUsernamePassword(loginCredentials);
            }

            $http.get('release.json').success(function(data) {
                scope.version = data.version;
                scope.releasedate = data.releasedate;
                scope.releaseyear = data.releaseyear;
            });

            scope.islogofoldernamefetched = false;
            scope.islogofoldernameconfig = false;
            scope.isFaviconPath = false;
            scope.isHeaderLogoPath = false;
            scope.isBigLogoPath = false;
            scope.isLargeLogoPath = false;
            scope.showCollections = false;
            scope.searchRule = true;
            scope.searchRuleLabel = 'label.tooltip.exactsearch';
            if(!scope.islogofoldernamefetched && $rootScope.tenantIdentifier && $rootScope.tenantIdentifier != "default"){
                scope.islogofoldernamefetched = true;
                $http.get('scripts/config/LogoConfig.json').success(function(datas) {
                    for(var i in datas){
                        var data = datas[i];
                        if(data.tenantIdentifier != undefined && data.tenantIdentifier == $rootScope.tenantIdentifier){
                            if(data.logofoldername != undefined && data.logofoldername != ""){
                                scope.islogofoldernameconfig = true;
                                scope.logofoldername = data.logofoldername;
                                if(data.faviconPath){
                                    scope.isFaviconPath = true;
                                    scope.faviconPath = data.faviconPath;
                                }
                                if(data.bigLogoPath){
                                    scope.isBigLogoPath = true;
                                    scope.bigLogoPath = data.bigLogoPath;
                                }
                                if(data.headerLogoPath){
                                    scope.isHeaderLogoPath = true;
                                    scope.headerLogoPath = data.headerLogoPath;
                                }
                                if(data.largeLogoPath){
                                    scope.isLargeLogoPath = true;
                                    scope.largeLogoPath = data.largeLogoPath;
                                }
                            }
                        }
                    }
                });
            }
            uiConfigService.init(scope, $rootScope.tenantIdentifier);
            scope.$on('uiConfigServicePerformed', function(event, response) {
                scope.response = response;
                if(scope.response && scope.response.uiDisplayConfigurations) {
                    scope.mainUIConfigData = scope.response.uiDisplayConfigurations;
                    scope.regexFormats = scope.response.uiDisplayConfigurations.regexFormats;
                    //console.log(JSON.stringify(scope.mainUIConfigData));
                }
                if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.bc) {
                    scope.enableBc = scope.response.uiDisplayConfigurations.bc.enableBc;
                }
                if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.readOnlyFields) {
                    $rootScope.isDatePickerReadOnly = scope.response.uiDisplayConfigurations.readOnlyFields.datePicker;
                }
            });
            //hides loader
            scope.domReady = true;
            scope.activity = {};
            scope.activityQueue = [];
            if (localStorageService.getFromLocalStorage('Location')) {
                scope.activityQueue = localStorageService.getFromLocalStorage('Location');
            }
            scope.loadSC = function () {
                if (!localStorageService.getFromLocalStorage('searchCriteria'))
                    localStorageService.addToLocalStorage('searchCriteria', {})
                scope.searchCriteria = localStorageService.getFromLocalStorage('searchCriteria');
            };
            scope.saveSC = function () {
                localStorageService.addToLocalStorage('searchCriteria', scope.searchCriteria);
            };
            scope.loadSC();
            scope.setDf = function () {
                if (localStorageService.getFromLocalStorage('dateformat')) {
                    scope.dateformat = localStorageService.getFromLocalStorage('dateformat');
                } else {
                    localStorageService.addToLocalStorage('dateformat', 'dd MMMM yyyy');
                    scope.dateformat = 'dd MMMM yyyy';
                }
                scope.df = scope.dateformat;
            };

            scope.updateDf = function(dateFormat){
                localStorageService.addToLocalStorage('dateformat', dateFormat);
                scope.dateformat = dateFormat;
                scope.setDf();
            };
            scope.setDf();
            $rootScope.setPermissions = function (permissions) {
                $rootScope.permissionList = permissions;
                localStorageService.addToLocalStorage('userPermissions', permissions);
                $rootScope.$broadcast('permissionsChanged')
            };

            $rootScope.hasPermission = function (permission) {
                permission = permission.trim();
                //FYI: getting all permissions from localstorage, because if scope changes permissions array will become undefined
                $rootScope.permissionList = localStorageService.getFromLocalStorage('userPermissions');
                //If user is a Super user return true
                if ($rootScope.permissionList && _.contains($rootScope.permissionList, "ALL_FUNCTIONS")) {
                    return true;
                } else if ($rootScope.permissionList && permission && permission != "") {
                    //If user have all read permission return true
                    if (permission.substring(0, 5) == "READ_" && _.contains($rootScope.permissionList, "ALL_FUNCTIONS_READ")) {
                        return true;
                    } else if (_.contains($rootScope.permissionList, permission)) {
                        //check for the permission if user doesn't have any special permissions
                        return true;
                    } else {
                        //return false if user doesn't have permission
                        return false;
                    }
                } else {
                    //return false if no value assigned to has-permission directive
                    return false;
                }
                ;
            };

            scope.$watch(function () {
                return location.path();
            }, function () {
                scope.activity = location.path();
                scope.activityQueue.push(scope.activity);
                localStorageService.addToLocalStorage('Location', scope.activityQueue);
            });

            //Logout the user if Idle
            scope.started = false;
            scope.$on('$idleTimeout', function () {
                scope.logout();
            });

            // Log out the user when the window/tab is closed.   
            window.onunload = function () {
                clearAllSession();
            };

            function onunload(){
                if(scope.currentSession && scope.currentSession.user){
                    scope.logout();
                }else{
                    clearAllSession();
                }
            }

            scope.start = function (session) {
                if (session) {
                    $idle.watch();
                    scope.started = true;
                }
            };

            scope.leftnav = false;
            scope.$on("UserAuthenticationSuccessEvent", function (event, data) {
                scope.authenticationFailed = false;
                scope.resetPassword = data.shouldRenewPassword;
                if (sessionManager.get(data)) {
                    scope.currentSession = sessionManager.get(data);
                    scope.start(scope.currentSession);
                    if (scope.currentSession.user && scope.currentSession.user.userPermissions) {
                        if (data.officeId) {
                            scope.currentSession.user.officeId = data.officeId;
                        }
                        $rootScope.setPermissions(scope.currentSession.user.userPermissions);
                    }
                    location.path('/home').replace();
                } else {
                    scope.loggedInUserId = data.userId;
                }
                scope.getAllGlobalConfigurations();
            });

            scope.$on("UnauthorizedRequest", function (event, data) {
                if (data && data.error && data.error == 'invalid_token') {
                    clearAllSession();
                }
            });

            scope.$on("RefreshAuthenticationFailureEvent", function () {
                clearAllSession();
            });

            scope.configs = [];
            scope.isLoanEmiPackEnabled = false;
            scope.getAllGlobalConfigurations = function () {
                scope.configs = [];
                resourceFactory.configurationResource.get(function (data) {
                    for (var i in data.globalConfiguration) {
                        if(data.globalConfiguration[i].name == "allow-inter-branch-transaction"){
                            scope.showCollections = data.globalConfiguration[i].enabled;
                        }
                        if(data.globalConfiguration[i].name=='Allow emi packs for loan'){
                            scope.isLoanEmiPackEnabled = data.globalConfiguration[i].enabled;
                        }                        
                        if(data.globalConfiguration[i].name=='work-flow'){
                            scope.isGlobalWorkflowEnabled = data.globalConfiguration[i].enabled;
                        }
                        if(data.globalConfiguration[i].name=='show reference number as a name in group'){
                            scope.isReferenceNumberAsNameEnable = data.globalConfiguration[i].enabled;
                        }
                        if(data.globalConfiguration[i].name=='max-clients-in-group'){
                            scope.isMaxClientInGroupEnable = data.globalConfiguration[i].enabled;
                            scope.maxClientLimit = data.globalConfiguration[i].value;

                        }
                        if(data.globalConfiguration[i].name=='max-groups-in-center'){
                            scope.isMaxGroupInCenterEnable = data.globalConfiguration[i].enabled;
                            scope.maxGroupLimit = data.globalConfiguration[i].value;

                        }
                        if(data.globalConfiguration[i].name=='cb check validation for workflow'){
                            scope.isCBCheckEnable = data.globalConfiguration[i].enabled;

                        }
                        if(data.globalConfiguration[i].name=='modify_approved_loan'){
                            scope.isEditApprovedLoan = data.globalConfiguration[i].enabled;
                        }
                        if(data.globalConfiguration[i].name == "create_center_without_village"){
                            scope.createWithoutVillage = data.globalConfiguration[i].enabled;
                        }
                        if(data.globalConfiguration[i].name == "allow-bank-account-for-groups"){
                            scope.allowBankAccountForGroup = data.globalConfiguration[i].enabled;
                        }
                        if(data.globalConfiguration[i].name == "allow-multiple-bank-disbursal"){
                            scope.allowGroupBankAccountInDisburse = data.globalConfiguration[i].enabled;
                        }
                        if(data.globalConfiguration[i].name == "BCIF"){
                            scope.allowBcifOperations = data.globalConfiguration[i].enabled;
                        }
                        if(data.globalConfiguration[i].name=='is-field-office-enable'){
                            scope.isFieldOfficeEnable = data.globalConfiguration[i].enabled;

                        }
                        if (data.globalConfiguration[i].name == 'batch-accounting') {
                            scope.isBatchAccountingEnabled = data.globalConfiguration[i].enabled;

                        }
                        if (data.globalConfiguration[i].name == 'apply-loan-officer-to-center-hierarchy') {
                            scope.isLoanOfficerHierarchy = data.globalConfiguration[i].enabled;

                        }
                        data.globalConfiguration[i].showEditvalue = true;
                        scope.configs.push(data.globalConfiguration[i])
                    }
                    constructJsonForSystemGlobalConfigurations();
                });
            }

            var systemGlobalConfigurations = {};
            var constructJsonForSystemGlobalConfigurations = function () {
                systemGlobalConfigurations = {};
                for(var i in scope.configs){
                    if(scope.configs[i].name){
                        systemGlobalConfigurations[scope.configs[i].name] = scope.configs[i].enabled;
                    }
                }
            };

            scope.isSystemGlobalConfigurationEnabled = function(name){
                if(name != undefined && systemGlobalConfigurations[name] != undefined && systemGlobalConfigurations[name] == true){
                    return true;
                }
                return false;
            };

            scope.globalSearch = function(){
                scope.popUpHeaderName = "Search"
                scope.includeHTML = 'views/search/advanceglobalsearch.html';
                var templateUrl = 'views/common/openpopup.html';
                var controller = 'GlobalSearchController';
                popUpUtilService.openFullScreenPopUp(templateUrl, controller, scope);
            };

            scope.logout = function () {
                resourceFactory.myAccountResource.logout(function (data) {
                    clearAllSession();
                });
            };

            function clearAllSession(){
                scope.currentSession = sessionManager.clearAll();
                scope.resetPassword = false;
                $rootScope.isUserSwitched = false;
                delete $rootScope.proxyToken;
                $modalStack.dismissAll('close');
                $idle.unwatch();
                scope.started = false;
                location.path('/').replace();
                scope.$broadcast("resetCaptchaEvent");
            };

            scope.logoutFromUi = function () {
                clearAllSession();
            };

            scope.switchToMe = function() {
                $rootScope.isUserSwitched = false;
                $rootScope.targetUserName = undefined;
                delete $rootScope.proxyToken;
                location.path('/home');
            };

            scope.langs = mifosX.models.Langs;
            if (localStorageService.getFromLocalStorage('Language')) {
                var temp = localStorageService.getFromLocalStorage('Language');
                for (var i in mifosX.models.Langs) {
                    if (mifosX.models.Langs[i].code == temp.code) {
                        scope.optlang = mifosX.models.Langs[i];
                        tmhDynamicLocale.set(mifosX.models.Langs[i].code);
                        }
                }
            } else {
                scope.optlang = scope.langs[0];
                tmhDynamicLocale.set(scope.langs[0].code);
                }
            translate.uses(scope.optlang.code);

            scope.isActive = function (route) {
                if (route == 'clients') {
                    var temp = ['/clients', '/groups', '/centers'];
                    for (var i in temp) {
                        if (temp[i] == location.path()) {
                            return true;
                        }
                    }
                }
                else if (route == 'acc') {
                    var temp1 = ['/accounting', '/freqposting', '/accounting_coa', '/journalentry', '/accounts_closure', '/Searchtransaction', '/accounting_rules'];
                    for (var i in temp1) {
                        if (temp1[i] == location.path()) {
                            return true;
                        }
                    }
                }
                else if (route == 'rep') {
                    var temp2 = ['/reports/all', '/reports/clients', '/reports/loans', '/reports/funds', '/reports/accounting', 'reports/savings'];
                    for (var i in temp2) {
                        if (temp2[i] == location.path()) {
                            return true;
                        }
                    }
                }
                else if (route == 'admin') {
                    var temp3 = ['/users/', '/organization', '/system', '/products', '/bulkoperations', '/global'];
                    for (var i in temp3) {
                        if (temp3[i] == location.path()) {
                            return true;
                        }
                    }
                }                
                else if (route == 'collections') {
                    var temp4 = ['/interbranchsearch'];
                    for (var i in temp4) {
                        if (temp4[i] == location.path()) {
                            return true;
                        }
                    }
                }
                else {
                    var active = route === location.path();
                    return active;
                }
            };

            keyboardManager.bind('ctrl+shift+n', function () {
                location.path('/nav/offices');
            });
            keyboardManager.bind('ctrl+shift+i', function () {
                location.path('/tasks');
            });
            keyboardManager.bind('ctrl+shift+o', function () {
                location.path('/entercollectionsheet');
            });
            keyboardManager.bind('ctrl+shift+c', function () {
                location.path('/createclient');
            });
            keyboardManager.bind('ctrl+shift+g', function () {
                location.path('/creategroup');
            });
            keyboardManager.bind('ctrl+shift+q', function () {
                location.path('/createcenter');
            });
            keyboardManager.bind('ctrl+shift+f', function () {
                location.path('/freqposting');
            });
            keyboardManager.bind('ctrl+shift+e', function () {
                location.path('/accounts_closure');
            });
            keyboardManager.bind('ctrl+shift+j', function () {
                location.path('/journalentry');
            });
            keyboardManager.bind('ctrl+shift+a', function () {
                location.path('/accounting');
            });
            keyboardManager.bind('ctrl+shift+r', function () {
                location.path('/reports/all');
            });
            keyboardManager.bind('ctrl+s', function () {
                document.getElementById('save').click();
            });
            keyboardManager.bind('ctrl+r', function () {
                document.getElementById('run').click();
            });
            keyboardManager.bind('ctrl+shift+x', function () {
                document.getElementById('cancel').click();
            });
            keyboardManager.bind('ctrl+shift+l', function () {
                document.getElementById('logout').click();
            });
            keyboardManager.bind('alt+x', function () {
                document.getElementById('search').focus();
            });
            keyboardManager.bind('ctrl+shift+h', function () {
                document.getElementById('help').click();
            });
            keyboardManager.bind('ctrl+n', function () {
                document.getElementById('next').click();
            });
            keyboardManager.bind('ctrl+p', function () {
                document.getElementById('prev').click();
            });
            scope.changeLang = function (lang, $event) {
                translate.uses(lang.code);
                localStorageService.addToLocalStorage('Language', lang);
                tmhDynamicLocale.set(lang.code);
                scope.optlang = lang;
            };

            /*redirecticg next pages*/
            scope.redirectCenter = function (id) {
                location.path('/viewcenter/' + id);
            };
            scope.redirectGroup = function (id) {
                location.path('/viewgroup/' + id);
            };
            scope.redirectOffice = function (id) {
                location.path('/viewoffice/' + id);
            };

            scope.viewClient = function (id) {
                location.path('/viewclient/' + id);
            };

            scope.$watch('mainUIConfigData.browserSecurity.isEnabled', function (newValue, oldValue) {
                //Key Ref : https://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes  
                if (!angular.equals(newValue, oldValue) && scope.mainUIConfigData.browserSecurity.isEnabled) {
                    onunload();
                    document.onkeydown = function (e) {
                        if (e.ctrlKey && (e.keyCode === 67 || e.keyCode === 86 || e.keyCode === 85 || e.keyCode ===
                                117 || e.keycode === 17 || e.keyCode === 88)) {
                            e.preventDefault();
                            return false;
                        } else if (e.keyCode == 123) {
                            e.preventDefault();
                            return false;
                        }
                        return true;
                    };
                    document.oncontextmenu = function(e){
                        e.preventDefault();
                        return false;
                    };
                    document.onclick = function(e){
                        if (e.ctrlKey) {
                            e.preventDefault();
                            return false;
                        }
                    };

                    if(window.devtools && window.devtools.open ){
                        blockUserActions(true);
                    };

                    window.addEventListener('devtoolschange', function (e) {
                        if(scope.mainUIConfigData.browserSecurity.isEnabled){
                            if(e.detail.open){
                                blockUserActions(true);
                            }
                        }
                        //console.log('is DevTools open?', e.detail.open);
                        //console.log('and DevTools orientation?', e.detail.orientation);
                    });
                }
            });

            function blockUserActions(isBlockUserActions){
                if(scope.currentSession && scope.currentSession.user){
                    scope.logout();
                }else{
                    clearAllSession();
                }
                //Do not remove this infinite while loop
                $timeout(function () {
                    while(isBlockUserActions){
                        if(!window.devtools.open){
                            break;
                        }
                    }
                }, 500);
            };

            sessionManager.restore(function (session) {
                scope.currentSession = session;
                scope.start(scope.currentSession);
                if (session.user != null && session.user.userPermissions) {
                    $rootScope.setPermissions(session.user.userPermissions);
                    localStorageService.addToLocalStorage('userPermissions', session.user.userPermissions);
                    scope.getAllGlobalConfigurations();
                };
            });

            scope.isHideMenuOptions = function (type) {
                if (scope.mainUIConfigData.headerMenuSettings) {
                    var indexValue = scope.mainUIConfigData.headerMenuSettings.hideMenuOptions.indexOf(type);
                    if (indexValue > -1) {
                        if (type == 'READ_CLIENT' && indexValue == 0) {
                            return true;
                        } else if (type == 'READ_GROUP' && indexValue == 1) {
                            return true;
                        } else if (type == 'READ_CENTER' && indexValue == 2) {
                            return true;
                        } if (type == 'READ_VILLAGE' && indexValue == 3) {
                            return true;
                        }
                    }
                }
                return false;
            };
            
        }
    });
    mifosX.ng.application.controller('MainController', [
        '$scope',
        '$location',
        'SessionManager',
        '$translate',
        '$rootScope',
        'localStorageService',
        'keyboardManager', '$idle',
        'tmhDynamicLocale',
        'UIConfigService',
        '$http',
        'AuthenticationService',
        'ResourceFactory',
        '$timeout',
        'PopUpUtilService',
        '$modalStack',
        mifosX.controllers.MainController
    ]).run(function ($log) {
        $log.info("MainController initialized");
    });
}(mifosX.controllers || {}));

QueryParameters = (function () {
    var result = {};
    if (window.location.search) {
        // split up the query string and store in an associative array
        var params = window.location.search.slice(1).split("&");
        for (var i = 0; i < params.length; i++) {
            var tmp = params[i].split("=");
            result[tmp[0]] = unescape(tmp[1]);
        }
    }
    return result;
}());
