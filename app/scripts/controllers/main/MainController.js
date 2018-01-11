(function (module) {
    mifosX.controllers = _.extend(module, {
        MainController: function (scope, location, sessionManager, translate, $rootScope, localStorageService, keyboardManager, $idle, tmhDynamicLocale, 
                  uiConfigService, $http, authenticationService, resourceFactory) {
            scope.hideLoginPannel = false;
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
            setSearchScopes();
            uiConfigService.init(scope, $rootScope.tenantIdentifier);

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
                $idle.unwatch();
                scope.started = false;
            });

            // Log out the user when the window/tab is closed.
            window.onunload = function () {
                scope.logout();
                $idle.unwatch();
                scope.started = false;
            };

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

            scope.configs = [];
            scope.getAllGlobalConfigurations = function () {
                scope.configs = [];
                resourceFactory.configurationResource.get(function (data) {
                    for (var i in data.globalConfiguration) {
                        if(data.globalConfiguration[i].name == "allow-inter-branch-transaction"){
                            scope.showCollections = data.globalConfiguration[i].enabled;
                        }
                        data.globalConfiguration[i].showEditvalue = true;
                        scope.configs.push(data.globalConfiguration[i])
                    }
                    resourceFactory.cacheResource.get(function (data) {
                        for (var i in data) {
                            if (data[i].cacheType && data[i].cacheType.id == 2) {
                                var cache = {};
                                cache.name = 'Is Cache Enabled';
                                cache.enabled = data[i].enabled;
                                cache.showEditvalue = false;
                                scope.configs.push(cache);
                            }
                        }
                        constructJsonForSystemGlobalConfigurations();
                    });
                });
            };

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

            function setSearchScopes (){
                //var all = {name: "label.search.scope.all", value: "clients,clientIdentifiers,groups,savings,loans,loanapplications"};
                var clients = {
                    name: "label.search.scope.clients.and.clientIdentifiers",
                    value: "clients,clientIdentifiers"
                };
                var groups = {
                    name: "label.search.scope.groups.and.centers",
                    value: "groups"
                };
                var savings = {name: "label.input.adhoc.search.loans", value: "loans"};
                var loans = {name: "label.search.scope.savings", value: "savings"};
                var loanapplications = {name: "label.search.scope.loanapplications", value: "loanapplications"};
                scope.searchScopes = [clients,groups,loans,savings, loanapplications];
                scope.currentScope = groups;
            }

            scope.changeScope = function (searchScope) {
                scope.currentScope = searchScope ;
            }

            scope.search = function () {
                var resource;
                var searchString=scope.search.query;
                var exactMatch=false;
                if(searchString != null){
                    searchString = searchString.replace(/(^"|"$)/g, '');
                    var n = searchString.localeCompare(scope.search.query);
                    if(n!=0)
                    {
                        exactMatch=true;
                    }
                }
                location.path('/search/' + searchString).search({exactMatch: exactMatch, resource: scope.currentScope.value});

            };

            scope.logout = function () {
                scope.currentSession = sessionManager.clear();
                scope.resetPassword = false;
                $rootScope.isUserSwitched = false;
                delete $rootScope.proxyToken;
                location.path('/').replace();
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



            sessionManager.restore(function (session) {
                scope.currentSession = session;
                scope.start(scope.currentSession);
                if (session.user != null && session.user.userPermissions) {
                    $rootScope.setPermissions(session.user.userPermissions);
                    localStorageService.addToLocalStorage('userPermissions', session.user.userPermissions);
                    scope.getAllGlobalConfigurations();
                };
            });
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