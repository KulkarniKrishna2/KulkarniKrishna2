(function (module) {
    mifosX.services = _.extend(module, {
        ResourceFactoryProvider: function () {
            var baseUrl = "" , apiVer = "/fineract-provider/api/v1", tenantIdentifier = "";
            this.setBaseUrl = function (url) {
                baseUrl = url;
                console.log(baseUrl);
            };

            this.setTenantIdenetifier = function (tenant) {
                tenantIdentifier = tenant;
            };

            this.getTenantIdentifier = function () {
                return tenantIdentifier;
            };

            this.$get = ['$resource', '$rootScope', function (resource, $rootScope) {
                var defineResource = function (url, paramDefaults, actions) {
                    var tempUrl = baseUrl;
                    $rootScope.hostUrl = tempUrl;
                    $rootScope.tenantIdentifier = tenantIdentifier;
                    return resource(baseUrl + url, paramDefaults, actions);
                };
                return {
                    userResource: defineResource(apiVer + "/users/:userId", {userId: '@userId'}, {
                        getAllUsers: {method: 'GET', params: {fields: "id,firstname,lastname,username,officeName"}, isArray: true},
                        getUser: {method: 'GET', params: {}}
                    }),
                    roleResource: defineResource(apiVer + "/roles/:roleId", {roleId: '@roleId', command: '@command'}, {
                        getAllRoles: {method: 'GET', params: {}, isArray: true},
                        get: {method: 'GET', params: {template: true}},
                        deleteRoles: {method: 'DELETE'},
                        disableRoles: {method: 'POST'},
                        enableRoles: {method: 'POST'},
                        update: {method: 'PUT'}
                    }),
                    rolePermissionResource: defineResource(apiVer + "/roles/:roleId/permissions", {roleId: '@roleId'}, {
                        get: {method: 'GET', params: {}},
                        update: {method: 'PUT'}
                    }),
                    permissionResource: defineResource(apiVer + "/permissions", {}, {
                        get: {method: 'GET', params: {}, isArray: true},
                        update: {method: 'PUT'}
                    }),
                    officeResource: defineResource(apiVer + "/offices/:officeId", {officeId: "@officeId"}, {
                        getOffice: {method: 'GET', params: {}},
                        getAllOffices: {method: 'GET', params: {}, isArray: true},
                        getAllOfficesInAlphabeticalOrder: {method: 'GET', params: {orderBy: 'name', sortOrder: 'ASC'}, isArray: true},
                        update: { method: 'PUT'}
                    }),
                    clientResource: defineResource(apiVer + "/clients/:clientId/:anotherresource", {clientId: '@clientId', anotherresource: '@anotherresource', searchConditions: '@searchConditions'}, {
                        getAllClients: {method: 'GET', params: {limit:100, searchConditions: '@searchConditions'}},
                        getAllClientsWithoutLimit: {method: 'GET', params: {limit: -1, searchConditions: '@searchConditions'}},
                        getClientClosureReasons: {method: 'GET', params: {}},
                        getAllClientDocuments: {method: 'GET', params: {}, isArray: true},
                        update: { method: 'PUT'}
                    }),
                    clientsSearchResource: defineResource(apiVer + "/clients/search", {searchConditions: '@searchConditions'}, {
                        getAllClients: {method: 'GET', params: {searchConditions: '@searchConditions'}, isArray: true}
                    }),
                    clientResourceTemplate: defineResource(apiVer + "/clients/:clientId/template", {clientId: '@clientId', command: '@command'}, {
                        getActivateTemplate: {method: 'GET', params: {command : 'activate'}}
                    }),
                    clientChargesResource: defineResource(apiVer + "/clients/:clientId/charges/:resourceType", {clientId: '@clientId', resourceType: '@resourceType'}, {
                        getCharges: {method: 'GET'},
                        waive:{method:'POST' , params:{command : 'waive'}}
                    }),
                    clientChargeTransactionResource: defineResource(apiVer + "/clients/:clientId/charges/:resourceType", {clientId: '@clientId', resourceType: '@resourceType'}, {
                        getCharges: {method: 'GET'},
                        waive:{method:'POST' , params:{command : 'waive'}}
                    }),
                    clientRecurringChargesResource: defineResource(apiVer + "/clients/:clientId/recurringcharges/:resourceType", {clientId: '@clientId',resourceType: '@resourceType'}, {
                        getRecurringCharges: {method: 'GET',isArray: true},
                        getRecurringCharge: {method: 'GET'},
                        inactivateRecurringCharge:{method:'POST'}
                    }),
                    clientTransactionResource: defineResource(apiVer + "/clients/:clientId/transactions/:transactionId", {clientId: '@clientId', transactionId: '@transactionId'}, {
                        getTransactions: {method: 'GET',isArray: true},
                        getTransaction: {method: 'GET'},
                        undoTransaction :{method:'POST', params:{command:'undo'}}
                    }),
                    clientIdentifierResource: defineResource(apiVer + "/client_identifiers/:clientIdentityId/documents", {clientIdentityId: '@clientIdentityId'}, {
                        get: {method: 'GET', params: {}, isArray: true}
                    }),
                    clientDocumentsResource: defineResource(apiVer + "/clients/:clientId/documents/:documentId", {clientId: '@clientId', documentId: '@documentId'}, {
                        getAllClientDocuments: {method: 'GET', params: {}, isArray: true}
                    }),
                    documentsResource: defineResource(apiVer + "/:entityType/:entityId/documents/:documentId", {entityType: '@entityType', entityId: '@entityId',documentId: '@documentId'}, {
                        getAllDocuments: {method: 'GET', params: {}, isArray: true}
                    }),
                    clientAccountResource: defineResource(apiVer + "/clients/:clientId/accounts", {clientId: '@clientId'}, {
                        getAllClients: {method: 'GET', params: {}}
                    }),
                    clientAccountsOverviewsResource: defineResource(apiVer + "/clients/:clientId/accounts/overviews", {clientId: '@clientId'}, {
                        getAllClientAccounts: {method: 'GET', params: {}}
                    }),
                    clientNotesResource: defineResource(apiVer + "/clients/:clientId/notes", {clientId: '@clientId'}, {
                        getAllNotes: {method: 'GET', params: {}, isArray: true}
                    }),
                    clientTemplateResource: defineResource(apiVer + "/clients/template", {}, {
                        get: {method: 'GET', params: {}}
                    }),
                    clientSearchTemplateResource: defineResource(apiVer + "/clients/search/template", {}, {
                        get: {method: 'GET', params: {}}
                    }),
                    clientLookupResource: defineResource(apiVer + "/clients/lookup", {}, {
                        get: {method: 'GET', params: {}, isArray: true}
                    }),
                    tasklookupResource: defineResource(apiVer + "/loans/tasklookup", {}, {
                        get: {method: 'GET', params: {}, isArray: true}
                    }),
                    rdTasklookupResource: defineResource(apiVer + "/recurringdepositaccounts/tasklookup", {}, {
                        get: {method: 'GET', params: {}, isArray: true}
                    }),
                    clientIdenfierTemplateResource: defineResource(apiVer + "/clients/:clientId/identifiers/template", {clientId: '@clientId'}, {
                        get: {method: 'GET', params: {}}
                    }),
                    clientIdenfierResource: defineResource(apiVer + "/clients/:clientId/identifiers/:id", {clientId: '@clientId', id: '@id'}, {
                        get: {method: 'GET', params: {}},
                        getAll:{method: 'GET', params: {}, isArray:true},
                        update: {method: 'PUT', params: {}}
                    }),
                    surveyTemplateResource: defineResource(apiVer + "/surveys/template", {}, {
                        get: {method: 'GET', params: {}}
                    }),
                    surveyResource: defineResource(apiVer + "/surveys/:surveyId", {surveyId: '@surveyId'}, {
                        get: {method: 'GET', params: {}, isArray: true},
                        getBySurveyId: {method: 'GET', params: {}},
                        update: {method: 'PUT', params: {}}
                    }),
                    surveyScorecardResource: defineResource(apiVer + "/surveys/:surveyId/scorecards", {surveyId: '@surveyId'}, {
                        post: {method: 'POST', params: {}, isArray: false}
                    }),
                    takeSurveysResource: defineResource(apiVer + "/:entityType/:entityId/takesurveys", {entityType: '@entityType',entityId: '@entityId'}, {
                        getAll: {method: 'GET', params: {}, isArray: true},
                        post: {method: 'POST', params: {}},
                        update: {method: 'PUT', params: {}}
                    }),
                    groupResource: defineResource(apiVer + "/groups/:groupId/:anotherresource", {groupId: '@groupId', anotherresource: '@anotherresource'}, {
                        get: {method: 'GET', params: {}},
                        getAllGroups: {method: 'GET', params: {}, isArray: true},
                        update: { method: 'PUT'}
                    }),
                    groupSummaryResource: defineResource(apiVer + "/runreports/:reportSource", {reportSource: '@reportSource'}, {
                        getSummary: {method: 'GET', params: {}}
                    }),
                    groupAccountResource: defineResource(apiVer + "/groups/:groupId/accounts", {groupId: '@groupId'}, {
                        getAll: {method: 'GET', params: {}}
                    }),
                    groupNotesResource: defineResource(apiVer + "/groups/:groupId/notes/:noteId", {groupId: '@groupId', noteId: '@noteId'}, {
                        getAllNotes: {method: 'GET', params: {}, isArray: true}
                    }),
                    groupTemplateResource: defineResource(apiVer + "/groups/template", {}, {
                      get: {method: 'GET', params: {}}
                    }),
                    groupMeetingResource: defineResource(apiVer + "/groups/:groupId/meetings/:templateSource", {groupId: '@groupId', templateSource: '@templateSource'}, {
                        getMeetingInfo: {method: 'GET', params: {}}
                    }),
                    attachMeetingResource: defineResource(apiVer + "/:groupOrCenter/:groupOrCenterId/calendars/:templateSource", {groupOrCenter: '@groupOrCenter', groupOrCenterId: '@groupOrCenterId',
                        templateSource: '@templateSource'}, {
                        update: {method: 'PUT'}
                    }),
                    runReportsResource: defineResource(apiVer + "/runreports/:reportSource", {reportSource: '@reportSource'}, {
                        get: {method: 'GET', params: {}, isArray: true},
                        getReport: {method: 'GET', params: {}}
                    }),
                    advancedReportsResource: defineResource(apiVer + "/advancedreports", {}, {
                        get: {method: 'GET', params: {},  isArray: true},
                        post: {method: 'POST', params: {}}
                    }),
                    fileUrlResource: defineResource(apiVer + "/files/:fileId", {fileId: '@fileId'}, {
                        get: {method: 'GET', params: {}}
                    }),
                    reportsResource: defineResource(apiVer + "/reports/:id/:resourceType", {id: '@id', resourceType: '@resourceType', usageTrackingEnabledOnly : '@usageTrackingEnabledOnly'}, {
                        get: {method: 'GET', params: {id: '@id'}},
                        getReport: {method: 'GET', params: {id: '@id'}, isArray: true},
                        getReportDetails: {method: 'GET', params: {id: '@id'}},
                        update: {method: 'PUT', params: {}},
                        getAll: {method: 'GET', params: {usageTrackingEnabledOnly : '@usageTrackingEnabledOnly'}, isArray: true}
                    }),
                    reportsByCategoryResource: defineResource(apiVer + "/reports/category/:id", {id: '@id'}, {
                        get: {method: 'GET', params: {}, isArray: true}
                    }),
                    reportsByEntityResource: defineResource(apiVer + "/reports/entityreport/:id", {id: '@id'}, {
                        get: {method: 'GET', params: {}, isArray: true},
                    }),
                    reportsResourceCommands: defineResource(apiVer + "/reports/:id", {id: '@id'}, {
                        activate: {method: 'POST',  params:{command : 'activate'}},
                        deActivate: {method: 'POST', params:{command : 'deActivate'}}
                    }),
                    xbrlMixtaxonomyResource: defineResource(apiVer + "/mixtaxonomy", {}, {
                        get: {method: 'GET', params: {}, isArray: true}
                    }),
                    xbrlMixMappingResource: defineResource(apiVer + "/mixmapping", {}, {
                        get: {method: 'GET', params: {}, isArray: true},
                        update: {method: 'PUT', params: {}}
                    }),
                    DataTablesResource: defineResource(apiVer + "/datatables/:datatablename/:entityId/:resourceId", {datatablename: '@datatablename', entityId: '@entityId', resourceId: '@resourceId', command: '@command',associateAppTable: '@associateAppTable',isFetchAssociateTable: '@isFetchAssociateTable'}, {
                        getAllDataTables: {method: 'GET', params: {}, isArray: true},
                        getTableDetails: {method: 'GET', params: {}},
                        update: {method: 'PUT'}
                    }),
                    DataTablesTemplateResource: defineResource(apiVer + "/datatables/template", {}, {
                        get: {method: 'GET', params: {}, isArray: false}
                    }),
                    loanProductResource: defineResource(apiVer + "/loanproducts/:loanProductId/:resourceType", {resourceType: '@resourceType', loanProductId: '@loanProductId'}, {
                        getAllLoanProducts: {method: 'GET', params: {}, isArray: true},
                        getAllCreditbureauLoanProducts: {method: 'GET', params: {}, isArray: true},
                        getProductmix: {method: 'GET', params: {}},
                        getCreditbureauLoanProducts: {method: 'GET', params: {}},
                        put: {method: 'PUT', params: {}}
                    }),
                    chargeResource: defineResource(apiVer + "/charges/:chargeId", {chargeId: '@chargeId'}, {
                        getAllCharges: {method: 'GET', params: {}, isArray: true},
                        getCharge: {method: 'GET', params: {}},
                        update: {method: 'PUT', params: {}}
                    }),
                    chargeTemplateResource: defineResource(apiVer + "/charges/template", {
                        get: {method: 'GET', params: {}, isArray: true},
                        getChargeTemplates: {method: 'GET', params: {}}
                    }),
                    savingProductResource: defineResource(apiVer + "/savingsproducts/:savingProductId/:resourceType", {savingProductId: '@savingProductId', resourceType: '@resourceType'}, {
                        getAllSavingProducts: {method: 'GET', params: {}, isArray: true},
                        update: {method: 'PUT', params: {}}
                    }),
                    fixedDepositProductResource: defineResource(apiVer + "/fixeddepositproducts/:productId/:resourceType", {productId: '@productId', resourceType: '@resourceType'}, {
                        getAllFixedDepositProducts: {method: 'GET', params: {}, isArray: true},
                        update: {method: 'PUT', params: {}}
                    }),
                    recurringDepositProductResource: defineResource(apiVer + "/recurringdepositproducts/:productId/:resourceType", {productId: '@productId', resourceType: '@resourceType'}, {
                        getAllRecurringDepositProducts: {method: 'GET', params: {}, isArray: true},
                        update: {method: 'PUT', params: {}}
                    }),
                    customerAccountLimitsResource: defineResource(apiVer + "/clients/:clientId/accountlimits/:limitId", {clientId: '@clientId', limitId: '@limitId'}, {
                        get: {method: 'GET', params: {}, isArray: false},
                        save:{method: 'POST',params:{},isArray: false},
                        update: {method: 'PUT', params: {}}
                    }),
                    interestRateChartResource: defineResource(apiVer + "/interestratecharts/:chartId/:resourceType", {chartId:'@chartId', resourceType:'@resourceType'}, {
                        getInterestRateChart: {method: 'GET', params: {productId:'@productId', template:'@template', associations:'@chartSlabs'} , isArray:true},
                        update: {method: 'PUT', params: {}},
                        getAllInterestRateCharts: {method: 'GET', params: {productId: '@productId'}, isArray: true}
                    }),
                    batchResource: defineResource(apiVer + "/batches", {}, {
                        post: {method: 'POST', params: {}, isArray: true}
                    }),
                    loanResource: defineResource(apiVer + "/loans/:loanId/:resourceType/:resourceId", {resourceType: '@resourceType', loanId: '@loanId', resourceId: '@resourceId', limit: '@limit', searchConditions: '@searchConditions'}, {
                        getAllLoans: {method: 'GET', params: {limit:'@limit', searchConditions: '@searchConditions'}}
                    }),
                    loanApplicationReferencesResource: defineResource(apiVer + "/loanapplicationreferences/:loanApplicationReferenceId", {loanApplicationReferenceId: '@loanApplicationReferenceId'}, {
                        getByClientId: {method: 'GET', params: {}, isArray: true},
                        getByLoanAppId: {method: 'GET', params: {}},
                        getChargesByLoanAppId: {method: 'GET', params: {}, isArray: true},
                        save: {method: 'POST', params: {}},
                        update: {method: 'PUT', params: {}}
                    }),
                    loanApplicationReferencesTrancheResource: defineResource(apiVer + "/loanapplicationreferences/:loanApplicationReferenceId/tranchedatas", {loanApplicationReferenceId: '@loanApplicationReferenceId'}, {
                        getByLoanAppId: {method: 'GET', params: {}, isArray: true}
                    }),
                    loanApplicationOverViewsResource: defineResource(apiVer + "/loanapplicationreferences/:loanApplicationReferenceId/overviews", {loanApplicationReferenceId: '@loanApplicationReferenceId'}, {
                        getByClientId: {method: 'GET', params: {}, isArray: true},
                        getByLoanAppId: {method: 'GET', params: {}}
                    }),
                    loanCoApplicantsResource: defineResource(apiVer + "/loanapplicationreferences/:loanApplicationReferenceId/coapplicants/:coApplicantId", {loanApplicationReferenceId: '@loanApplicationReferenceId', coApplicantId: '@coApplicantId'}, {
                        getAll: {method: 'GET', params: {}, isArray: true},
                        add: {method: 'POST', params: {clientId:'@clientId'}},
                        delete: {method: 'DELETE', params: {}}
                    }),
                    creditBureauReportTemplateResource: defineResource(apiVer + "/enquiry/creditbureau/template", {}, {
                        template: {method: 'GET', params: {}}
                    }),
                    creditBureauEnquiriesResource: defineResource(apiVer + "/enquiry/creditbureau/:entityType/:entityId", {entityType: '@entityType',entityId: '@entityId'}, {
                        getAll: {method: 'GET', params: {}, isArray: true}
                    }),
                    creditBureauReportResource: defineResource(apiVer + "/enquiry/creditbureau/:entityType/:entityId/initiate", {entityType: '@entityType',entityId: '@entityId'}, {
                        get: {method: 'GET', params: {}}
                    }),
                    creditBureauReportSummaryByEnquiryIdResource: defineResource(apiVer + "/enquiry/creditbureau/:enquiryId/summary", {enquiryId: '@enquiryId'}, {
                        get: {method: 'GET', params: {}}
                    }),
                    creditBureauReportSummaryResource: defineResource(apiVer + "/enquiry/creditbureau/clients/:clientId/:entityType/:entityId/summary", {clientId: '@clientId', entityType: '@entityType',entityId: '@entityId'}, {
                        get: {method: 'GET', params: {}}
                    }),
                    creditBureauReportFileContentResource: defineResource(apiVer + "/enquiry/creditbureau/:entityType/:entityId/creditbureaureport", {entityType: '@entityType',entityId: '@entityId'}, {
                        get: {method: 'GET', params: {}}
                    }),
                    creditBureauReportFileContentByEnquiryIdResource: defineResource(apiVer + "/enquiry/creditbureau/:enquiryId/creditbureaureport", {enquiryId: '@enquiryId'}, {
                        get: {method: 'GET', params: {}}
                    }),
                    creditLatestBureauReportFileContentResource: defineResource(apiVer + "/enquiry/creditbureau/creditbureaureport",{clientId: '@clientId'},  {
                        get: {method: 'GET', params: {}}
                    }),
                    loanApplicationReferencesTemplateResource: defineResource(apiVer + "/loanapplicationreferences/:loanApplicationReferenceId/template", {loanApplicationReferenceId: '@loanApplicationReferenceId'}, {
                        get: {method: 'GET', params: {}}
                    }),
                    loanResource: defineResource(apiVer + "/loans/:loanId/:resourceType/:resourceId", {resourceType: '@resourceType', loanId: '@loanId', resourceId: '@resourceId'}, {
                        getAllLoans: {method: 'GET', params: {}},
                        getAllNotes: {method: 'GET', params: {}, isArray: true},
                        put: {method: 'PUT', params: {}}
                    }),
                    loanChargeTemplateResource: defineResource(apiVer + "/loans/:loanId/charges/template", {loanId: '@loanId'}, {
                        get: {method: 'GET', params: {}}
                    }),
                    loanChargesResource: defineResource(apiVer + "/loans/:loanId/charges/:chargeId", {loanId: '@loanId', chargeId: '@chargeId'}, {
                    }),
                    loanCollateralTemplateResource: defineResource(apiVer + "/loans/:loanId/collaterals/template", {loanId: '@loanId'}, {
                        get: {method: 'GET', params: {}}
                    }),
                    loanTrxnsTemplateResource: defineResource(apiVer + "/loans/:loanId/transactions/template", {loanId: '@loanId'}, {
                        get: {method: 'GET', params: {}}
                    }),
                    loanTemplateResource: defineResource(apiVer + "/loans/:loanId/template", {loanId: '@loanId'}, {
                        get: {method: 'GET', params: {}}
                    }),
                    loanTrxnsResource: defineResource(apiVer + "/loans/:loanId/transactions/:transactionId", {loanId: '@loanId', transactionId: '@transactionId'}, {
                        get: {method: 'GET', params: {}}
                    }),
                    LoanAccountResource: defineResource(apiVer + "/loans/:loanId/:resourceType/:chargeId", {loanId: '@loanId', resourceType: '@resourceType', chargeId: '@chargeId'}, {
                        getLoanAccountDetails: {method: 'GET', params: {}},
                        update: {method: 'PUT'}
                    }),
                    LoanEditDisburseResource: defineResource(apiVer + "/loans/:loanId/disbursements/:disbursementId", {loanId: '@loanId', disbursementId: '@disbursementId'}, {
                        getLoanAccountDetails: {method: 'GET', params: {}},
                        update: {method: 'PUT'}
                    }),
                    LoanAddTranchesResource: defineResource(apiVer + "/loans/:loanId/disbursements/editDisbursements", {loanId: '@loanId'}, {
                        update: {method: 'PUT'}
                    }),
                    LoanDocumentResource: defineResource(apiVer + "/loans/:loanId/documents/:documentId", {loanId: '@loanId', documentId: '@documentId'}, {
                        getLoanDocuments: {method: 'GET', params: {}, isArray: true}
                    }),
                    documentsGenerateResource: defineResource(apiVer + "/:entityType/:entityId/documents/generate/:identifier", {entityType: '@entityType', entityId: '@entityId', identifier: '@identifier'}, {
                        generate: {method: 'POST', params: {command:"generate"}},
                        reGenerate: {method: 'POST', params: {command:"regenerate"}}
                    }),
                    mandateTemplateResource: defineResource(apiVer + "/loans/:loanId/mandates/template", {loanId: '@loanId'}, {
                        getCreateTemplate: {method: 'GET', params: {command:"create",showEMIBalance:"@showEMIBalance"}, isArray: false},
                        getUpdateTemplate: {method: 'GET', params: {command:"update"}, isArray: false},
                        getCancelTemplate: {method: 'GET', params: {command:"cancel"}, isArray: false}
                    }),
                    mandateResource: defineResource(apiVer + "/loans/:loanId/mandates/:mandateId", {loanId: '@loanId', mandateId: '@mandateId'}, {
                        getAll: {method: 'GET', params: {}, isArray: true},
                        getOne: {method: 'GET', params: {}, isArray: false},
                        post: {method: 'POST', params: {command:"@command"}, isArray: false},
                        put: {method: 'PUT', params: {}, isArray: false},
                        delete: {method: 'DELETE', params: {}, isArray: false}
                    }),
                    mandatesResource: defineResource(apiVer + "/mandates", {type: '@type', requestDate: '@requestDate', dateFormat: '@dateFormat', officeId:'@officeId', command:"@command"}, {
                        getAll: {method: 'GET', params: {}, isArray: true},
                        post: {method: 'POST', params: {}, isArray: false}
                    }),
                    mandatesSummaryResource: defineResource(apiVer + "/mandates/summary/:type", {type: '@type',
                        requestFromDate: '@requestFromDate', requestToDate: '@requestToDate', dateFormat: '@dateFormat',
                        officeId:'@officeId', includeChildOffices:"@includeChildOffices"}, {

                        get: {method: 'GET', params: {}, isArray: true}
                    }),
                    mandatesListResource: defineResource(apiVer + "/mandates/list/:type", {type: '@type',
                        requestFromDate: '@requestFromDate', requestToDate: '@requestToDate', dateFormat: '@dateFormat',
                        officeId:'@officeId', includeChildOffices:"@includeChildOffices"}, {

                        get: {method: 'GET', params: {}, isArray: false}
                    }),
                    mandatesTemplateResource: defineResource(apiVer + "/mandates/template", {command: '@command'}, {
                        get: {method: 'GET', params: {}, isArray: false}
                    }),
                    currencyConfigResource: defineResource(apiVer + "/currencies", {}, {
                        get: {method: 'GET', params: {}},
                        update: { method: 'PUT'},
                        upd: { method: 'PUT', params: {}}
                    }),
                    userListResource: defineResource(apiVer + "/users/:userId", {userId: '@userId'}, {
                        getAllUsers: {method: 'GET', params: {}, isArray: true},
                        update: { method: 'PUT' },
                        post:{ method: 'POST' }
                    }),
                    userTemplateResource: defineResource(apiVer + "/users/template", {}, {
                        get: {method: 'GET', params: {}}
                    }),
                    employeeResource: defineResource(apiVer + "/staff/:staffId", {staffId: '@staffId',status:"all"}, {
                        getAllEmployees: {method: 'GET', params: {}},
                        update: { method: 'PUT' }
                    }),
                    globalSearch: defineResource(apiVer + "/search", {query: '@query', resource: '@resource'}, {
                        search: { method: 'GET',
                            params: { query: '@query' , resource: '@resource'},
                            isArray: true
                        }
                    }),
                    globalSearchTemplateResource: defineResource(apiVer + "/search/template", {}, {
                        get: {method: 'GET', params: {}}
                    }),
                    globalAdHocSearchResource: defineResource(apiVer + "/search/advance/", {}, {
                        get: {method: 'GET', params: {}},
                        search: { method: 'POST', isArray: true },
                        getClientDetails : {method: 'POST', params: {clientInfo: true},isArray: true}
                    }),
                    fundsResource: defineResource(apiVer + "/funds/:fundId", {fundId: '@fundId',command:'@command'}, {
                        getAllFunds: {method: 'GET', params: {}, isArray: true},
                        getFund: {method: 'GET', params: {}},
                        update: {method: 'PUT', params: {fundId: '@fundId',command:'@command'}},
                        assign: {method: 'POST', params: {fundId: '@fundId',command:'assign'}},
                        activate: {method: 'POST', params: {fundId: '@fundId',command:'activate'}},
                        deactivate: {method: 'POST', params: {fundId: '@fundId',command:'deactivate'}}
                    }),
                    accountingRulesResource: defineResource(apiVer + "/accountingrules/:accountingRuleId", {accountingRuleId: '@accountingRuleId'}, {
                        getAllRules: {method: 'GET', params: {associations: 'all'}, isArray: true},
                        getById: {method: 'GET', params: {accountingRuleId: '@accountingRuleId'}},
                        get: {method: 'GET', params: {}, isArray: true},
                        update: {method: 'PUT'}
                    }),
                    accountingRulesTemplateResource: defineResource(apiVer + "/accountingrules/template", {}, {
                        get: {method: 'GET', params: {}}
                    }),
                    accountCoaResource: defineResource(apiVer + "/glaccounts/:glAccountId", {glAccountId: '@glAccountId'}, {
                        getAllAccountCoas: {method: 'GET', params: {}, isArray: true},
                        getAllAccountCoasPage: {method: 'GET', params: {}},
                        update: { method: 'PUT' }
                    }),
                    accountCoaTemplateResource: defineResource(apiVer + "/glaccounts/template", {}, {
                        get: {method: 'GET', params: {}}
                    }),
                    journalEntriesResource: defineResource(apiVer + "/journalentries/:trxid", {trxid: '@transactionId'}, {
                        get: {method: 'GET', params: {transactionId: '@transactionId'}},
                        reverse: {method: 'POST', params: {command: 'reverse'}},
                        search: {method: 'GET', params: {}}
                    }),
                    frequentPostingResource: defineResource(apiVer+ "/frequentpostings",{},{}),
                    accountingClosureResource: defineResource(apiVer + "/glclosures/:accId", {accId: "@accId"}, {
                        get: {method: 'GET', params: {}, isArray: true},
                        getView: {method: 'GET', params: {}}
                    }),
                    accountingClosureByOfficeResource: defineResource(apiVer + "/glclosures/offices/:officeId", {officeId: "@officeId"}, {
                        get: {method: 'GET', params: {}, isArray: true},
                        getView: {method: 'GET', params: {}}
                    }),
                    periodicAccrualAccountingResource: defineResource(apiVer + "/runaccruals", {}, {
                        run: {method: 'POST', params: {}}
                    }),
                    officeOpeningResource: defineResource(apiVer + "/journalentries/openingbalance", {}, {
                        get: {method: 'GET', params: {}}
                    }),
                    codeResources: defineResource(apiVer + "/codes/:codeId", {codeId: "@codeId"}, {
                        getAllCodes: {method: 'GET', params: {}, isArray: true},
                        update: { method: 'PUT', params: {} }
                    }),
                    codeValueResource: defineResource(apiVer + "/codes/:codeId/codevalues/:codevalueId", {codeId: '@codeId', codevalueId: '@codevalueId'}, {
                        getAllCodeValues: {method: 'GET', params: {}, isArray: true},
                        update: { method: 'PUT', params: {} }
                    }),
                    codeValueByCodeNameResources: defineResource(apiVer + "/codes/codeValues", {}, {
                        get: {method: 'GET', params: {}, isArray: true}
                    }),
                    hookResources: defineResource(apiVer + "/hooks/:hookId", {hookId: "@hookId"}, {
                        getAllHooks: {method: 'GET', params: {}, isArray: true},
                        getHook: {method: 'GET', params: {}},
                        update: {method: 'PUT', params: {}}
                    }),
                    hookTemplateResource: defineResource(apiVer + "/hooks/template", {}, {
                        get: {method: 'GET', params: {}}
                    }),
                    entityToEntityResource: defineResource(apiVer + "/entitytoentitymapping/:mappingId/:fromId/:toId", {mappingId: '@mappingId'}, {
                        getAllEntityMapping: {method: 'GET', params: {}, isArray: true},
                        getEntityMapValues: {method: 'GET', params: {}}
                    }),
                    entityMappingResource: defineResource(apiVer + "/entitytoentitymapping/:mapId", {mappingId: '@mappingId'}, {
                        getAllEntityMapping: {method: 'GET', params: {}, isArray: true},
                        getEntityMapValues: {method: 'GET', params: {}, isArray: true},
                        update: { method: 'PUT', params: {}},
                        delete:{method:'DELETE',params:{}}
                    }),
                    accountNumberResources: defineResource(apiVer + "/accountnumberformats/:accountNumberFormatId",{accountNumberFormatId: '@accountNumberFormatId'}, {
                        get:{method:'GET',params:{accountNumberFormatId:'@accountNumberFormatId'}},
                        getAllPreferences:{method:'GET',params:{},isArray: true},
                        put:{method:'PUT'},
                        getPrefixType:{method:'GET',params:{template:true}},
                        delete:{method:'DELETE',params:{}}
                    }),
                    accountNumberTemplateResource: defineResource(apiVer + "/accountnumberformats/template", {}, {
                        get: {method: 'GET', params: {}}
                    }),
                    holResource: defineResource(apiVer + "/holidays", {}, {
                        getAllHols: {method: 'GET', params: {}, isArray: true}
                    }),
                    holidayTemplateResource: defineResource(apiVer + "/holidays/template", {}, {
                        get: {method: 'GET', params: {}, isArray: true}
                    }),
                    holValueResource: defineResource(apiVer + "/holidays/:holId", {holId: '@holId'}, {
                        getholvalues: {method: 'GET', params: {}},
                        update: { method: 'PUT', params: {}}
                    }),
                    savingsTemplateResource: defineResource(apiVer + "/savingsaccounts/template", {}, {
                        get: {method: 'GET', params: {}}
                    }),
                    savingsResource: defineResource(apiVer + "/savingsaccounts/:accountId/:resourceType/:chargeId", {accountId: '@accountId', resourceType: '@resourceType', chargeId: '@chargeId'}, {
                        get: {method: 'GET', params: {}},
                        getAllNotes: {method: 'GET', params: {}, isArray: true},
                        update: {method: 'PUT'}
                    }),
                    savingsChargeResource: defineResource(apiVer + "/savingsaccounts/:accountId/charges/:resourceType", {accountId: '@accountId', resourceType: '@resourceType'}, {
                        get: {method: 'GET', params: {}},
                        update: {method: 'PUT'}
                    }),
                    savingsTrxnsTemplateResource: defineResource(apiVer + "/savingsaccounts/:savingsId/transactions/template", {savingsId: '@savingsId'}, {
                        get: {method: 'GET', params: {savingsId: '@savingsId'}}
                    }),
                    savingsTrxnsResource: defineResource(apiVer + "/savingsaccounts/:savingsId/transactions/:transactionId", {savingsId: '@savingsId', transactionId: '@transactionId'}, {
                        get: {method: 'GET', params: {savingsId: '@savingsId', transactionId: '@transactionId'}}
                    }),
                    savingsOnHoldTrxnsResource: defineResource(apiVer + "/savingsaccounts/:savingsId/onholdtransactions", {savingsId: '@savingsId'}, {
                        get: {method: 'GET', params: {}}
                    }),
                    fixedDepositAccountResource: defineResource(apiVer + "/fixeddepositaccounts/:accountId/:resourceType", {accountId: '@accountId', resourceType: '@resourceType'}, {
                        get: {method: 'GET', params: {}},
                        update: {method: 'PUT'}
                    }),
                    fixedDepositAccountTemplateResource: defineResource(apiVer + "/fixeddepositaccounts/template", {}, {
                        get: {method: 'GET', params: {}}
                    }),
                    fixedDepositTrxnsTemplateResource: defineResource(apiVer + "/fixeddepositaccounts/:savingsId/transactions/template", {savingsId: '@savingsId'}, {
                        get: {method: 'GET', params: {savingsId: '@savingsId'}}
                    }),
                    fixedDepositTrxnsResource: defineResource(apiVer + "/fixeddepositaccounts/:savingsId/transactions/:transactionId", {savingsId: '@savingsId', transactionId: '@transactionId'}, {
                        get: {method: 'GET', params: {savingsId: '@savingsId', transactionId: '@transactionId'}}
                    }),
                    recurringDepositAccountResource: defineResource(apiVer + "/recurringdepositaccounts/:accountId/:resourceType", {accountId: '@accountId', resourceType: '@resourceType'}, {
                        get: {method: 'GET', params: {}},
                        update: {method: 'PUT'}
                    }),
                    recurringDepositAccountTemplateResource: defineResource(apiVer + "/recurringdepositaccounts/template", {}, {
                        get: {method: 'GET', params: {}}
                    }),
                    recurringDepositTrxnsTemplateResource: defineResource(apiVer + "/recurringdepositaccounts/:savingsId/transactions/template", {savingsId: '@savingsId'}, {
                        get: {method: 'GET', params: {savingsId: '@savingsId'}}
                    }),
                    recurringDepositTrxnsResource: defineResource(apiVer + "/recurringdepositaccounts/:savingsId/transactions/:transactionId", {savingsId: '@savingsId', transactionId: '@transactionId'}, {
                        get: {method: 'GET', params: {savingsId: '@savingsId', transactionId: '@transactionId'}}
                    }),
                    accountTransferResource: defineResource(apiVer + "/accounttransfers/:transferId", {transferId: '@transferId'}, {
                        get: {method: 'GET', params: {transferId: '@transferId'}}
                    }),
                    accountTransfersTemplateResource: defineResource(apiVer + "/accounttransfers/template", {}, {
                        get: {method: 'GET', params: {}}
                    }),
                    standingInstructionResource: defineResource(apiVer + "/standinginstructions/:standingInstructionId", {standingInstructionId: '@standingInstructionId'}, {
                        get: {method: 'GET', params: {standingInstructionId: '@standingInstructionId'}},
                        getTransactions: {method: 'GET', params: {standingInstructionId: '@standingInstructionId', associations: 'transactions'}},
                        withTemplate: {method: 'GET', params: {standingInstructionId: '@standingInstructionId', associations: 'template'}},
                        search: {method: 'GET', params: {}},
                        update: { method: 'PUT', params: {command: 'update'}},
                        cancel: { method: 'PUT', params: {command: 'delete'}}
                    }),
                    standingInstructionTemplateResource: defineResource(apiVer + "/standinginstructions/template", {}, {
                        get: {method: 'GET', params: {}}
                    }),
                    standingInstructionHistoryResource: defineResource(apiVer + "/standinginstructionrunhistory", {}, {
                        get: {method: 'GET', params: {}}
                    }),
                    centerAccountResource: defineResource(apiVer + "/centers/:centerId/accounts", {centerId: '@centerId'}, {
                        getAll: {method: 'GET', params: {}, isArray: true}
                    }),
                    centerClientResource: defineResource(apiVer + "/centers/:centerId/clientdetails", {centerId: '@centerId'}, {
                        get: {method: 'GET', params: {}}
                    }),
                    centerResource: defineResource(apiVer + "/centers/:centerId/:anotherresource", {centerId: '@centerId', anotherresource: '@anotherresource'}, {
                        get: {method: 'GET', params: {}},
                        getAllCenters: {method: 'GET', params: {}, isArray: true},
                        getAllMeetingFallCenters: {method: 'GET', params: {}, isArray: true},
                        update: { method: 'PUT'}
                    }),
                    centerWorkflowResource: defineResource(apiVer + "/centers/:centerId/workflowData", {centerId: '@centerId'}, {
                        get: {method: 'GET', params: {}}
                    }),
                    centerMeetingResource: defineResource(apiVer + "/centers/:centerId/meetings/:templateSource", {centerId: '@centerId', templateSource: '@templateSource'}, {
                        getMeetingInfo: {method: 'GET', params: {}}
                    }),
                    centerTemplateResource: defineResource(apiVer + "/centers/template", {}, {
                        get: {method: 'GET', params: {}}
                    }),
                    centerBulkTransactionResource: defineResource(apiVer + "/centers/:centerId/transactions", {centerId: '@centerId', transactionDate: '@transactionDate'}, {
                        get: {method: 'GET', params: {}, isArray: true}
                    }),
                    villageResource: defineResource(apiVer + "/villages/:villageId/:anotherresource", {villageId: '@villageId', anotherresource: '@anotherresource'}, {
                        get: {method: 'GET', params: {}},
                        getAllVillages: {method: 'GET', params: {}, isArray: true},
                        update: {method: 'PUT', params: {}}

                    }),
                    villageTemplateResource: defineResource(apiVer + "/villages/template", {}, {
                        get: {method: 'GET', params: {}}
                    }),
                    jobsResource: defineResource(apiVer + "/jobs/:jobId/:resourceType", {jobId: '@jobId', resourceType: '@resourceType'}, {
                        get: {method: 'GET', params: {}, isArray: true},
                        getJobDetails: {method: 'GET', params: {}},
                        getJobHistory: {method: 'GET', params: {}},
                        update: {method: 'PUT', params: {}}
                    }),
                    schedulerResource: defineResource(apiVer + "/scheduler", {}, {
                        get: {method: 'GET', params: {}}
                    }),
                    assignStaffResource: defineResource(apiVer + "/groups/:groupOrCenterId", {groupOrCenterId: '@groupOrCenterId'}, {
                        get: {method: 'GET', params: {}}
                    }),
                    assignStaffToCenterResource: defineResource(apiVer + "/centers/:CenterId", {CenterId: '@CenterId'}, {
                        get: {method: 'GET', params: {}}
                    }),
                    configurationResource: defineResource(apiVer + "/configurations/:id", {id: '@id'}, {
                        get: {method: 'GET', params: {}},
                        update: {method: 'PUT', params: {}}
                    }),
                    dedupResource: defineResource(apiVer + "/clientdedup/weightages/:id", {id: '@id'}, {
                        get: {method: 'GET', params: {}, isArray: true},
                        update: {method: 'PUT', params: {}}
                    }),
                    cacheResource: defineResource(apiVer + "/caches", {}, {
                        get: {method: 'GET', params: {}, isArray: true},
                        update: {method: 'PUT', params: {}}
                    }),
                    templateResource: defineResource(apiVer + "/templates/:templateId/:resourceType", {templateId: '@templateId', resourceType: '@resourceType'}, {
                        get: {method: 'GET', params: {}, isArray: true},
                        getTemplateDetails: {method: 'GET', params: {}},
                        update: {method: 'PUT', params: {}}
                    }),
                    loanProductTemplateResource: defineResource(apiVer + "/loanproducts/template", {}, {
                        get: {method: 'GET', params: {}}
                    }),
                    loanProductAssociationResource: defineResource(apiVer + "/loanproducts", {associations: "@associations"}, {
                        getAll: {method: 'GET', params: {associations: '@associations'}, isArray: true}
                    }),
                    loanReassignmentResource: defineResource(apiVer + "/loans/loanreassignment/:templateSource", {templateSource: '@templateSource'}, {
                        get: {method: 'GET', params: {}}
                    }),
                    
                    loanRepaymentRescheduleResource: defineResource(apiVer + "/loans/bulkLoanReschedule/:templateSource", {templateSource: '@templateSource'}, {
                        get: {method: 'GET', params: {}}
                    
                    }),
                    bulkLoanReschedule:defineResource(apiVer + "/rescheduleloans/bulkCreateAndApprove",  {
                    	
                    }),
                    loanRescheduleResource: defineResource(apiVer + "/rescheduleloans/:scheduleId",{scheduleId:'@scheduleId', command: '@command'},{
                     get: {method: 'GET',params:{}},
                     getAll: {method: 'GET', params: {}, isArray: true},
                     template: {method: 'GET',params:{}},
                     preview:{method:'GET',params:{command:'previewLoanReschedule'}},
                     put: {method: 'POST', params: {command:'reschedule'}},
                     reject:{method:'POST',params:{command:'reject'}},
                     approve:{method:'POST',params:{command:'approve'}}
                     }),
                     auditResource: defineResource(apiVer + "/audits/:templateResource", {templateResource: '@templateResource'}, {
                        get: {method: 'GET', params: {}},
                        search: {method: 'GET', params: {}, isArray: false}
                    }),
                    guarantorResource: defineResource(apiVer + "/loans/:loanId/guarantors/:templateResource", {loanId: '@loanId', templateResource: '@templateResource'}, {
                        get: {method: 'GET', params: {}},
                        update: {method: 'PUT', params: {}},
                        delete: { method: 'DELETE', params: {guarantorFundingId: '@guarantorFundingId'}}
                    }),
                    guarantorAccountResource: defineResource(apiVer + "/loans/:loanId/guarantors/accounts/template", {loanId: '@loanId'}, {
                        get: {method: 'GET', params: {clientId: '@clientId'}},
                        update: {method: 'PUT', params: {}}
                    }),
                    checkerInboxResource: defineResource(apiVer + "/makercheckers/:templateResource", {templateResource: '@templateResource'}, {
                        get: {method: 'GET', params: {}},
                        search: {method: 'GET', params: {}, isArray: true}
                    }),
                    officeToGLAccountMappingResource: defineResource(apiVer + "/financialactivityaccounts/:mappingId", {mappingId: '@mappingId'}, {
                        get: {method: 'GET', params: {mappingId: '@mappingId'}},
                        getAll: {method: 'GET', params: {}, isArray: true},
                        withTemplate: {method: 'GET', params: {mappingId: '@mappingId', template: 'true'}},
                        search: {method: 'GET', params: {}},
                        create: {method: 'POST', params: {}},
                        update: { method: 'PUT', params: {mappingId: '@mappingId'}},
                        delete: { method: 'DELETE', params: {mappingId: '@mappingId'}}
                    }),
                    officeToGLAccountMappingTemplateResource: defineResource(apiVer + "/financialactivityaccounts/template", {}, {
                        get: {method: 'GET', params: {}}
                    }),
                    tellerResource: defineResource(apiVer + "/tellers/:tellerId", {tellerId: "@tellerId"}, {
                        getAllTellers: {method: 'GET', params: {}, isArray: true},
                        get: {method: 'GET', params: {tellerId: '@tellerId'}},
                        update: { method: 'PUT', params: {tellerId: '@tellerId'}},
                        delete: { method: 'DELETE', params: {tellerId: '@tellerId'}}
                    }),
                    tellerCashierResource: defineResource(apiVer + "/tellers/:tellerId/cashiers/:cashierId", {tellerId: "@tellerId", cashierId: "@cashierId"}, {
                        getAllCashiersForTeller: {method: 'GET', params: {tellerId: "@tellerId"}, isArray: false},
                        getCashier: {method: 'GET', params:{tellerId: "@tellerId", cashierId: "@cashierId"}},
                        update: { method: 'PUT', params: {tellerId: "@tellerId", cashierId: "@cashierId"}},
                        delete: { method: 'DELETE', params: {tellerId: "@tellerId", cashierId: "@cashierId"}}
                    }),
                    tellerCashierTemplateResource: defineResource(apiVer + "/tellers/:tellerId/cashiers/template", {tellerId: "@tellerId"}, {
                        get: {method: 'GET', params: {tellerId: '@tellerId'}, isArray: false}
                    }),
                    tellerCashierTxnsResource: defineResource(apiVer + "/tellers/:tellerId/cashiers/:cashierId/transactions", {tellerId: "@tellerId", cashierId: "@cashierId"}, {
                        getCashierTransactions: {method: 'GET', params: {tellerId: "@tellerId", cashierId: "@cashierId"}, isArray: true}
                    }),
                    tellerCashierSummaryAndTxnsResource: defineResource(apiVer + "/tellers/:tellerId/cashiers/:cashierId/summaryandtransactions", {tellerId: "@tellerId", cashierId: "@cashierId"}, {
                        getCashierSummaryAndTransactions: {method: 'GET', params: {tellerId: "@tellerId", cashierId: "@cashierId"}, isArray: false}
                    }),
                    tellerCashierTxnsAllocateResource: defineResource(apiVer + "/tellers/:tellerId/cashiers/:cashierId/allocate", {tellerId: "@tellerId", cashierId: "@cashierId"}, {
                        allocate: { method: 'POST', params: {tellerId: "@tellerId", cashierId: "@cashierId", command: "allocate"}}
                    }),
                    tellerCashierTxnsSettleResource: defineResource(apiVer + "/tellers/:tellerId/cashiers/:cashierId/settle", {tellerId: "@tellerId", cashierId: "@cashierId"}, {
                        settle: { method: 'POST', params: {tellerId: "@tellerId", cashierId: "@cashierId", command: "settle"}}
                    }),
                    cashierTxnTemplateResource: defineResource(apiVer + "/tellers/:tellerId/cashiers/:cashierId/transactions/template", {tellerId: "@tellerId", cashierId: "@cashierId"}, {
                        get: {method: 'GET', params: {tellerId: "@tellerId", cashierId: "@cashierId"}, isArray: false}
                    }),
                    collectionSheetResource: defineResource(apiVer + "/collectionsheet", {}, {
                    }),
                    workingDaysResource: defineResource(apiVer + "/workingdays", {}, {
                        get: {method: 'GET', params: {}},
                        put: {method: 'PUT', params:{}}
                    }),
                    workingDaysResourceTemplate: defineResource(apiVer + "/workingdays/template", {}, {
                       get: {method: 'GET', params: {}}
                    }),
                    passwordPrefTemplateResource: defineResource(apiVer + "/passwordpreferences/template", {}, {
                        get: {method: 'GET', params: {}, isArray : true},
                        put: {method: 'PUT', params:{}}
                    }),
                    passwordPrefResource : defineResource(apiVer + "/passwordpreferences", {}, {
                        put: {method: 'PUT', params:{}}
                    }),
                    paymentTypeResource: defineResource(apiVer + "/paymenttypes/:paymentTypeId/:resourceType", {paymentTypeId: "@paymentTypeId",resourceType: '@resourceType'}, {
                        getAll: {method: 'GET', params: {}, isArray: true},
                        get: {method: 'GET' , params: {paymentTypeId: '@paymentTypeId'}},
                        update: {method: 'PUT', params: {paymentTypeId: '@paymentTypeId'}}
                    }),
                    externalServicesS3Resource: defineResource(apiVer + "/externalservice/S3", {},{
                        get: {method: 'GET', params: {}, isArray : true},
                        put: {method: 'PUT', params:{}}
                    }),
                    externalServicesSMTPResource: defineResource(apiVer + "/externalservice/SMTP", {},{
                        get: {method: 'GET', params: {}, isArray : true},
                        put: {method: 'PUT', params:{}}
                    }),
                    externalServicesResource: defineResource(apiVer + "/externalservice/:id", {id: '@id'},{
                        get: {method: 'GET', params: {}, isArray : true},
                        put: {method: 'PUT', params:{}}
                    }),
                    otherExternalServicesResource: defineResource(apiVer + "/otherexternalservices/:serviceId", {serviceId: '@serviceId'},{
                        getAll: {method: 'GET', params: {}, isArray : true},
                        get: {method: 'GET', params: {}}
                    }),
                    otherExternalServicePropertiesResource: defineResource(apiVer + "/otherexternalservices/:serviceId/properties", {serviceId: '@serviceId'},{
                        put: {method: 'PUT', params:{}}
                    }),
                    provisioningcriteria: defineResource(apiVer + "/provisioningcriteria/:criteriaId",{criteriaId:'@criteriaId'},{
                        get: {method: 'GET',params:{}},
                        getAll: {method: 'GET',params:{}, isArray : true},
                        template: {method: 'GET',params:{}},
                        post:{method:'POST',params:{}},
                        put: {method: 'PUT', params: {}}
                    }),
                    provisioningentries: defineResource(apiVer + "/provisioningentries/:entryId",{entryId:'@entryId'},{
                        get: {method: 'GET',params:{}},
                        getAll: {method: 'GET',params:{}},
                        template: {method: 'GET',params:{}},
                        post:{method:'POST',params:{}},
                        put: {method: 'PUT', params: {}},
                        createJournals:{method:'POST', params:{command : 'createjournalentry'}},
                        reCreateProvisioningEntries:{method:'POST', params:{command : 'recreateprovisioningentry'}},
                        getJournals: {method: 'GET', params: {entryId: '@entryId'}}
                    }),
                    provisioningjournals: defineResource(apiVer + "/journalentries/provisioning", {}, {
                        get: {method: 'GET', params: {}}
                    }),
                    provisioningentriesSearch: defineResource(apiVer + "/provisioningentries/entries", {}, {
                        get: {method: 'GET', params: {}}
                    }),

                    provisioningcategory: defineResource(apiVer + "/provisioningcategory", {}, {
                        getAll: {method: 'GET', params: {}, isArray : true}
                    }),

                    floatingrates: defineResource(apiVer + "/floatingrates/:floatingRateId",{floatingRateId:'@floatingRateId'},{
                        get: {method: 'GET',params:{}},
                        getAll: {method: 'GET',params:{}, isArray : true},
                        post:{method:'POST',params:{}},
                        put: {method: 'PUT', params: {}}
                    }),
                    variableinstallments: defineResource(apiVer + "/loans/:loanId/schedule",{loanId:'@loanId'},{
                        validate:{method:'POST',params:{command: 'calculateLoanSchedule'}},
                        addVariations:{method:'POST',params:{command: 'addVariations'}},
                        deleteVariations:{method:'POST',params:{command: 'deleteVariations'}}
                    }),
                    collateralsResource: defineResource(apiVer + "/collaterals/:collateralId", {collateralId:'@collateralId'}, {
                        getAll: {method: 'GET', params: {}, isArray : true},
                        get: {method: 'GET', params: {collateralId: '@collateralId'}, isArray : false},
                        getCollateralQualityStandards: {method: 'GET', params: {associations: 'qualityStandards'}, isArray : false},
                        update: {method: 'PUT', params: {}}
                    }),
                    collateralsQualityStandardsResource: defineResource(apiVer + "/collaterals/:collateralId/qualitystandards/:qualityId", {collateralId:'@collateralId',qualityId:'@qualityId'}, {
                        update: {method: 'PUT', params: {} }
                    }),
                    productCollateralsMappingResource: defineResource(apiVer + "/loanproducts/:loanProductId/collaterals/:productCollateralMappingId", {loanProductId:'@loanProductId', productCollateralMappingId:'@productCollateralMappingId'}, {
                        getAll: {method: 'GET', params: {loanProductId: '@loanProductId'}, isArray : true},
                        update: {method: 'PUT', params: {} }
                    }),
                    pledgeResource: defineResource(apiVer + "/pledges/:pledgeId/", {pledgeId:'@pledgeId'}, {
                        getCollateralDetails: {method: 'GET',params: {association: 'collateralDetails'}},
                        getAllPledges: {method: 'GET',params: {limit: 1000}},
                        getAll: {method: 'GET', params: {pledgeId: '@pledgeId'}, isArray : true},
                        deleteCollateralDetails: {method: 'DELETE', params: {collateralDetailId : '@collateralDetailId'}},
                        closePledge : {method: 'POST', params: {command : 'close'} }
                    }),
                    collateralDetailsResource: defineResource(apiVer + "/pledges/:pledgeId/collateraldetails/:collateralDetailId", {pledgeId:'@pledgeId',
                        collateralDetailId : '@collateralDetailId'}, {
                        delete: {method: 'DELETE', params: {}}

                    }),
                    taxcomponent: defineResource(apiVer + "/taxes/component/:taxComponentId",{taxComponentId:'@taxComponentId'},{
                        getAll: {method: 'GET', params: {}, isArray : true},
                        put: {method: 'PUT', params: {}}
                    }),
                    taxcomponenttemplate: defineResource(apiVer + "/taxes/component/template",{},{
                    }),
                    taxgroup: defineResource(apiVer + "/taxes/group/:taxGroupId",{taxGroupId:'@taxGroupId'},{
                        getAll: {method: 'GET', params: {}, isArray : true},
                        put: {method: 'PUT', params: {}}
                    }),
                    taxgrouptemplate: defineResource(apiVer + "/taxes/group/template",{},{
                    }),

                    productsResource: defineResource(apiVer + "/products/:productType/:resourceType",{productType:'@productType', resourceType:'@resourceType'},{
                        template: {method: 'GET',params:{}},
                        post: {method: 'POST', params:{}}
                    }),
                    shareProduct: defineResource(apiVer + "/products/share/:shareProductId",{shareProductId:'@shareProductId'},{
                        post:{method:'POST',params:{}},
                        getAll: {method: 'GET',params:{}},
                        get: {method: 'GET', params:{}},
                        put: {method: 'PUT', params:{}}
                    }),
                    shareAccountTemplateResource: defineResource(apiVer + "/accounts/share/template", {}, {
                        get: {method: 'GET', params: {}}
                    }),
                    sharesAccount: defineResource(apiVer + "/accounts/share/:shareAccountId", {shareAccountId: '@shareAccountId'}, {
                        get: {method: 'GET', params: {}},
                        post: {method: 'POST', params:{}},
                        put: {method: 'PUT', params:{}}
                    }),
                    shareproductdividendresource: defineResource(apiVer + "/shareproduct/:productId/dividend/:dividendId", {productId: '@productId', dividendId: '@dividendId'}, {
                        get: {method: 'GET', params: {}},
                        getAll: {method: 'GET',params:{}},
                        post: {method: 'POST', params:{}},
                        put: {method: 'PUT', params:{}},
                        approve: {method: 'PUT', params:{command: 'approve'}}
                    }),
                    smsResource: defineResource(apiVer + "/sms/:smsId", {smsId:'@smsId'}, {
                        getAll: {method: 'GET', params: {}},
                        get: {method: 'GET', params: {smsId: '@smsId'}, isArray : false},
                        update: {method: 'PUT', params: {}}
                    }),
                    smsCampaignResource: defineResource(apiVer +"/sms/campaign/:resourceId", {resourceId:'@resourceId', command: '@command'},{
                        getAll: {method: 'GET', params: {}, isArray : true},
                        get: {method: 'GET', params: {resourceId:'@resourceId'}, isArray : false},
                        activate:{method:'POST',params:{resourceId:'@resourceId',command: 'activate'}},
                        reactivate:{method:'POST',params:{resourceId:'@resourceId',command: 'reactivate'}},
                        close:{method:'POST',params:{resourceId:'@resourceId',command: 'close'}},
                        edit:{method:'PUT',params:{}},
                        delete: {method: 'DELETE', params: {}}

                    }),
                    bankStatementsResource: defineResource(apiVer + "/bankstatements/:bankStatementId", {bankStatementId: '@bankStatementId',command:'@command'}, {
                        getAllBankStatement: {method: 'GET', params: {}},
                        update: {method: 'PUT', params: {bankStatementId : '@bankStatementId'}},
                        getBankStatement: {method: 'GET', params: {bankStatementId : '@bankStatementId'}},
                        reconcileBankStatement: {method: 'POST', params: {command : 'reconcile'}}
                    }),
                    bulkStatementsResource: defineResource(apiVer + "/bulkcollection/:bankStatementId", {bankStatementId: '@bankStatementId',command:'@command'}, {
                        getAllBankStatement: {method: 'GET', params: {}},
                        update: {method: 'PUT', params: {bankStatementId : '@bankStatementId'}},
                        getBankStatement: {method: 'GET', params: {bankStatementId : '@bankStatementId'}},
                        reconcileBankStatement: {method: 'POST', params: {command : 'reconcile'}}
                    }),
                    deleteBankStatementsResource: defineResource(apiVer + "/bankstatements/:bankStatementId/delete", {bankStatementId: '@bankStatementId',command:'@command'}, {
                        deleteBankStatement: {method: 'POST', params: {bankStatementId : '@bankStatementId'},command:'command'}
                    }),
                    bankStatementSummaryResource: defineResource(apiVer + "/bankstatements/:bankStatementId/summary", {bankStatementId: '@bankStatementId'}, {
                        get: {method: 'GET', params: {}, isArray: false}
                    }),
                    bankStatementGeneratePortfolioResource: defineResource(apiVer + "/bankstatements/:bankStatementId/generatetransactions", {bankStatementId: '@bankStatementId'}, {
                        createPortfolioTransactions: {method: 'POST', params: {bankStatementId : '@bankStatementId'}}
                    }),
                    bulkCollectionGeneratePortfolioResource: defineResource(apiVer + "/bulkcollection/:bankStatementId/generatetransactions", {bankStatementId: '@bankStatementId'}, {
                        createPortfolioTransactions: {method: 'POST', params: {bankStatementId : '@bankStatementId'}}
                    }),
                    bankStatementDetailsResource: defineResource(apiVer + "/bankstatements/:bankStatementId/details/:bankStatementDetailId", {bankStatementId: '@bankStatementId',bankStatementDetailId: '@bankStatementDetailId' ,command:'@command'}, {
                        getBankStatementDetails: {method: 'GET', params: {bankStatementId: '@bankStatementId'}, isArray : false},
                        update :{method: 'PUT',params: {bankStatementId: '@bankStatementId', bankStatementDetailId: '@bankStatementDetailId'}},
                        reconcileBankStatement : {method: 'PUT', params: {bankStatementId: '@bankStatementId',command:'@command'}}
                    }),
                    bankStatementDocumentResource: defineResource(apiVer + "/bankstatements/document/:documentId", {documentId: '@documentId'}, {
                        getBankStatementDocument: {method: 'GET', params: {documentId : '@documentId'}}
                    }),
                    bankStatementLoanTransactionResource: defineResource(apiVer + "/bankstatements/:bankStatementId/:bankStatementDetailId/matchingloantransactions", {bankStatementId : '@bankStatementId', bankStatementDetailId : '@bankStatementDetailId'}, {
                        getLoanTransactions: {method: 'GET', params: {bankStatementId : '@bankStatementId', bankStatementDetailId : '@bankStatementDetailId'}, isArray: true}
                    }),
                    bankStatementSearchLoanTransactionResource: defineResource(apiVer + "/bankstatements/:loanId/:bankStatementDetailId/loantransactions", {loanId : '@loanId', bankStatementDetailId : '@bankStatementDetailId'}, {
                        getLoanTransaction: {method: 'GET', params: {loanId : '@loanId', bankStatementDetailId : '@bankStatementDetailId'}, isArray: true}
                    }),
                    bankResource: defineResource(apiVer + "/banks/:bankId", {bankId : '@bankId'}, {
                        getAll: {method: 'GET', params: {}, isArray: true},
                        update: {method: 'PUT', params: {bankId : '@bankId'}},
                        get: {method: 'GET', params: {bankId : '@bankId'}}
                    }),
                    bankNonPortfolioResource: defineResource(apiVer + "/bankstatements/:bankStatementId/nonportfolio", {bankStatementId: '@bankStatementId'}, {
                        createJournalEntries: {method: 'POST', params: {bankStatementId : '@bankStatementId'}}
                    }),
                    addressTemplateResource:defineResource(apiVer +"/clients/addresses/template",{},{
                        getAddressTemplate:{method: 'GET',parms: {}, isArray: true }
                    }),
                    addressResource:defineResource(apiVer+"/:entityType/:entityId/addresses",{entityType: '@entityType',entityId: '@entityId'},{
                        create:{method: 'POST',parms: {}}
                    }),
                    addressDataResource:defineResource(apiVer+"/:entityType/:entityId/addresses",{entityType: '@entityType',entityId: '@entityId'}, {
                        getAll:{method: 'GET',parms: {}, isArray: true }
                    }),
                    entityAddressResource:defineResource(apiVer+"/:entityType/:entityId/addresses/:addressId",{entityType: '@entityType',entityId: '@entityId',addressId: '@addressId'},{
                    delete: {method: 'DELETE',parms: {}},
                    update: {method: 'PUT',parms:{}},
                    getAddress: {method: 'GET',parms:{}}
                    }),
                    clientKycAddressResource:defineResource(apiVer+"/clientkyc/",{clientId:'@clientId'}, {
                        get: {method: "GET",params:{}}
                    }),
                    centerLookupResource: defineResource(apiVer + "/centers/:centerId/memberaccountdetails", {centerId:'@centerId'}, {
                        get: {method: 'GET', params: {}, isArray : true}
                    }),
                    transactionAuthenticationTemplateResource: defineResource(apiVer + "/transactions/authentication/template", {},{
                       getTemplate: {method: 'GET', params: {}}
                    }),
                    transactionAuthenticationResource: defineResource(apiVer + "/transactions/authentication/:transactionAuthenticationId", {transactionAuthenticationId: '@transactionAuthenticationId'}, {
                        getAllTransactionAuthenticationDetails: {method: 'GET', params: {}, isArray: true},
                        getByTransactionAuthenticationId: {method: 'GET', params: {}},
                        save: {method: 'POST', params: {}},
                        update: {method: 'PUT', params: {}},
                        delete: {method: 'DELETE', params: {}}
                    }),
                    viewTransactionAuthenticationServicesResource: defineResource(apiVer + "/external/authentications/services/:serviceId",{serviceId: '@serviceId'}, {
                        get: {method: 'GET', params: {}},
                        update: {method: 'PUT', params: {}}
                    }),
                    creditBureauResource: defineResource(apiVer +"/creditbureau/:resourceId", {resourceId:'@resourceId', command: '@command'},{
                        activate:{method:'POST',params:{resourceId:'@resourceId',command: 'activate'}},
                        deactivate:{method:'POST',params:{resourceId:'@resourceId',command: 'deactivate'}},
                        get: {method: 'GET', isArray: true }
                    }),
                    creditBureauLoanProductResource: defineResource(apiVer +"/loanproducts/:productId/creditbureau/:creditBureauId", {productId:'@productId',creditBureauId:'@creditBureauId', command: '@command'}, {
                        post: {method: 'POST', params: {}},
                        update: {method: 'PUT', params: {}},
                        activate: {method: 'POST', params: {resourceId: '@resourceId', command: 'activate'}},
                        inactivate: {method: 'POST', params: {resourceId: '@resourceId', command: 'inactivate'}}
                    }),
                    loanPurposeGroupTemplateResource: defineResource(apiVer + "/loanpurposegroups/template", {}, {
                        get: {method: 'GET', params: {}}
                    }),
                    loanPurposesTemplate: defineResource(apiVer + "/loanpurposes/template", {}, {
                       get: {method: 'GET', params: {}}
                    }),
                    loanPurposeGroupResource: defineResource(apiVer + "/loanpurposegroups/:loanPurposeGroupsId", {loanPurposeGroupsId:'@loanPurposeGroupsId',isFetchLoanPurposeDatas:'@isFetchLoanPurposeDatas'}, {
                        getAll: {method: 'GET',params: {}, isArray:true},
                        get: {method: 'GET', params: {}},
                        update: {method: 'PUT', params: {command:'@inActive'}}
                    }),
                    loanPurposeResource: defineResource(apiVer + "/loanpurposes/:loanPurposeId", {loanPurposeId:'@loanPurposeId',
                        type:'@typeId', isFetchLoanPurposeGroupDatas:'@isFetchLoanPurposeGroupDatas'}, {
                        getAll: {method: 'GET',params: {}, isArray:true},
                        get: {method: 'GET', params: {isFetchLoanPurposeGroupDatas:'@isFetchLoanPurposeGroupDatas'}},
                        update: {method: 'PUT', params: {command:'@inActive'}}
                    }),
                    cashFloawCategoryTemplate: defineResource(apiVer + "/cashflowcategories/template", {}, {
                        get: {method: 'GET', params: {}}
                    }),
                    cashFlowCategoryResource: defineResource(apiVer + "/cashflowcategories/:cashFlowCategoryId",
                        {cashFlowCategoryId: '@cashFlowCategoryId'}, {
                            getAll: {method: 'GET', params: {}, isArray: true},
                            get: {method: 'GET', params: {isFetchIncomeExpenseDatas: '@isFetchIncomeExpenseDatas'}},
                            update: {method: 'PUT', params: {}}
                        }),
                    incomeExpensesTemplate: defineResource(apiVer + "/incomesorexpenses/template", {}, {
                        get: {method: 'GET', params: {}}
                    }),
                    incomeExpenses: defineResource(apiVer + "/incomesorexpenses/:incomeAndExpenseId", {incomeAndExpenseId: '@incomeAndExpenseId'}, {
                        getAll: {method: "GET", params: {cashFlowCategoryId: '@cashFlowCategoryId'}, isArray: true},
                        get: {method: "GET", params: {isFetchCashflowCategoryData: '@isFetchCashflowCategoryData'}},
                        update: {method: "PUT", params: {}}
                    }),
                    loanUtilizationCheckGroupTemplate: defineResource(apiVer + '/groups/:groupId/utilizationchecks/template', {groupId: '@groupId'}, {
                        get: {method: "GET", params: {}, isArray: true}
                    }),
                    loanUtilizationCheckCenterTemplate: defineResource(apiVer + '/centers/:centerId/utilizationchecks/template', {centerId: '@centerId'}, {
                        get: {method: "GET", params: {}, isArray: true}
                    }),
                    loanUtilizationCheck: defineResource(apiVer + "/loans/:loanId/utilizationchecks/:utilizationCheckId", {loanId:"@loanId", utilizationCheckId:'@utilizationCheckId'}, {
                        getAll: {method: 'GET', params: {}, isArray: true},
                        get: {method: 'GET', params: {}},
                        update: {method: 'PUT', params: {}}
                    }),
                    centerLoanUtilizationCheck: defineResource(apiVer + "/centers/:centerId/utilizationchecks", {centerId:'@centerId'}, {
                        getAll: {method: 'GET', params: {}, isArray: true}
                    }),
                    groupLoanUtilizationCheck: defineResource(apiVer + "/groups/:groupId/utilizationchecks", {groupId:'@groupId'}, {
                        getAll: {method: 'GET', params: {}, isArray: true}
                    }),
                    familyDetailsTemplate: defineResource(apiVer + "/clients/:clientId/familydetails/template", {clientId:'@clientId'}, {
                        get: {method: 'GET', params: {}}
                    }),
                    familyDetailsSummary: defineResource(apiVer + "/clients/:clientId/familydetailssummary/:familyDetailsSummaryId", {clientId:'@clientId',familyDetailsSummaryId:'@familyDetailsSummaryId'}, {
                        get: {method: 'GET', params: {}},
                        update: {method: 'PUT', params: {}}
                    }),
                    familyDetails: defineResource(apiVer + "/clients/:clientId/familydetails/:familyDetailId", {clientId:'@clientId', familyDetailId:'@familyDetailId', command:'@command'}, {
                        getAll: {method: 'GET', params: {}, isArray: true},
                        get: {method: 'GET', params: {}},
                        update: {method: 'PUT', params: {command:'@command'}},
                        delete: {method: 'DELETE', params: {}}
                    }),
                    incomeExpenseAndHouseHoldExpense: defineResource(apiVer + "/clients/:clientId/incomesandexpenses/:incomeAndExpenseId", {clientId:'@clientId', incomeAndExpenseId:'@incomeAndExpenseId'}, {
                        getAll: {method: 'GET', params: {}, isArray: true},
                        get: {method: 'GET', params: {}},
                        update: {method: 'PUT', params: {}},
                        delete: {method: 'DELETE', params: {}}
                    }),
                    clientExistingLoanTemplate: defineResource(apiVer + "/clients/:clientId/existingloans/template", {clientId: '@clientId'}, {
                        get: {method: 'GET', params: {}}
                    }),
                    clientExistingLoan: defineResource(apiVer + "/clients/:clientId/existingloans/:existingloanId", {clientId: '@clientId', existingloanId:'@existingloanId'}, {
                        getAll: {method: 'GET', params: {}, isArray: true},
                        get: {method: 'Get', params: {}},
                        update: {method: 'PUT', params: {}}
                    }),
                    clientCreditSummary: defineResource(apiVer + "/clients/creditsummary/:clientId", {clientId: '@clientId'}, {
                        getAll: {method: 'GET', params: {}},
                        get: {method: 'Get', params: {}},
                        update: {method: 'PUT', params: {}}
                    }),
                    riskField: defineResource(apiVer + "/risk/field",{},{
                        getAll: {method: 'GET',params:{},isArray: true}
                    }),
                    riskFactor: defineResource(apiVer + "/risk/factor/:factorId", {factorId:'@factorId'}, {
                        getAll: {method: 'GET',params: {}, isArray:true},
                        get: {method: 'GET', params: {}},
                        update: {method: 'PUT', params: {}}
                    }),
                    riskDimension: defineResource(apiVer + "/risk/dimension/:dimensionId", {dimensionId:'@dimensionId'}, {
                        getAll: {method: 'GET',params: {}, isArray:true},
                        get: {method: 'GET', params: {}},
                        update: {method: 'PUT', params: {}}
                    }),
                    riskCriteria: defineResource(apiVer + "/risk/criteria/:criteriaId", {criteriaId:'@criteriaId'}, {
                        getAll: {method: 'GET',params: {}, isArray:true},
                        get: {method: 'GET', params: {}},
                        update: {method: 'PUT', params: {}}
                    }),
                    loanProductEligibility: defineResource(apiVer + "/loanproduct/:loanProductId/eligibility", {loanProductId:'@loanProductId'}, {
                        get: {method: 'GET', params: {}},
                        update: {method: 'PUT', params: {}}
                    }),
                    riskCalculation: defineResource(apiVer + "/risk/execute/loanapplication/:loanApplicationReferenceId", {loanApplicationReferenceId:'@loanApplicationReferenceId'}, {
                        getForLoanAppId: {method: 'GET', params: {}},
                        redoForLoanAppId: {method: 'POST', params: {}}
                    }),
                    /*surveyResource: defineResource(apiVer + "/surveys/:surveyId", {surveyId:'@surveyId'}, {
                        get: {method: 'GET', params: {}, isArray: true},
                        getBySurveyId: {method: 'GET', params: {}},
                        update: {method: 'PUT', params: {}}
                    }),*/
                    surveyResourceScore: defineResource(apiVer + "/surveys/:surveyId/scorecards", {surveyId:'@surveyId'}, {
                        save: {method: 'POST', param: {}}
                    }),
                    surveyResourceScorecards: defineResource(apiVer + "/surveys/:surveyId/scorecards/clients/:clientId", {surveyId:'@surveyId', clientId:'@clientId'}, {
                        getAll: {method: 'GET', params: {}, isArray: true},
                        update: {method: 'PUT', params: {}}
                    }),
                    glimResource: defineResource(apiVer +"/grouploanindividualmonitoring/:loanId/:clientId/", {loanId:'@loanId',clientId:'@clientId'},{
                        getAll: {method: 'GET', params: {}, isArray : true},
                        getAllByLoan: {method: 'GET', params: {loanId:'@loanId'}, isArray : true},
                        getByLoanAndClient: {method: 'GET', params: {loanId:'@loanId',clientId:'@clientId'}, isArray : false}
                    }),
                    glimTransactionTemplateResource: defineResource(apiVer +"/grouploanindividualmonitoring/:loanId/transactions/template", {loanId:'@loanId', transactionDate:'@transactionDate'},{
                        get: {method: 'GET', params: {loanId : '@loanId', transactionDate:'@transactionDate'}}
                    }),
                    glimTransactionResource: defineResource(apiVer +"/grouploanindividualmonitoring/:loanId/transactions", {loanId:'@loanId'},{
                        get: {method: 'GET', params: {loanId : '@loanId'}}
                    }),
                    glimChargeResource: defineResource(apiVer +"/glimcharges/:loanId/loancharge/:loanChargeId", {loanId:'@loanId', loanChargeId:'@loanChargeId'},{
                        get: {method: 'GET', params: {loanId : '@loanId', loanChargeId:'@loanChargeId'}}
                    }),
                    glimRepaymentScheduleResource :  defineResource(apiVer +"/grouploanindividualmonitoring/viewrepaymentschedule/:glimId", { glimId:'@glimId'},{
                        getRepaymentScheduleById : {method: 'GET',params: { glimId:'@glimId', disbursedAmount: '@disbursedAmount', disbursedDate: '@disbursedDate'}, isArray : false}
                    }),
                    loanapplicationWorkflowResource: defineResource(apiVer + "/loanapplicationreferences/:loanApplicationId/workflow",
                        {loanApplicationId:'@loanApplicationId'}, {
                        get: {method: 'GET', params: {}},
                        update: {method: 'PUT', params: {}}
                    }),
                    workflowResource: defineResource(apiVer + "/loanapplicationreferences/:loanApplicationId/workflow",
                        {loanApplicationId:'@loanApplicationId'}, {
                            get: {method: 'GET', params: {}},
                            update: {method: 'PUT', params: {}}
                        }),
                    taskExecutionResource: defineResource(apiVer + "/tasks/:taskId/execute", {taskId: '@taskId'}, {
                        doAction: {method: 'POST', params: {action: '@action'}}
                    }),
                    taskExecutionTemplateResource: defineResource(apiVer + "/tasks/:taskId/execute/template", {taskId: '@taskId'}, {
                        get: {method: 'GET', params: {}}
                    }),
                    taskTemplateResource: defineResource(apiVer + "/tasks/template", {}, {
                        getAll: {method: 'GET', params: {},isArray:true}
                    }),
                    entityTaskExecutionResource: defineResource(apiVer + "/tasks/:entityType/:entityId/execute/template", {entityType: '@entityType',entityId: '@entityId'}, {
                        get: {method: 'GET', params: {}}
                    }),
                    entityEventTaskExecutionResource: defineResource(apiVer + "/tasks/:entityType/:eventType/:entityId/execute/template", {entityType: '@entityType',eventType: '@eventType',entityId: '@entityId'}, {
                        get: {method: 'GET', params: {}}
                    }),
                    initiateWorkflowResource: defineResource(apiVer + "/tasks/:entityType/:eventType/:entityId/initiate/workflow", {entityType: '@entityType',eventType: '@eventType',entityId: '@entityId'}, {
                        initiateWorkflow: {method: 'POST', params: {}}
                    }),
                    taskExecutionActionResource: defineResource(apiVer + "/tasks/:taskId/execute/actions",{taskId: '@taskId'}, {
                        getAll: {method: 'GET', params: {}, isArray: true}
                    }),
                    taskExecutionNotesResource: defineResource(apiVer + "/tasks/:taskId/execute/notes",{taskId: '@taskId'}, {
                        getAll: {method: 'GET', params: {}, isArray: true},
                        create: {method: 'POST'}
                    }),
                    taskExecutionActionLogResource: defineResource(apiVer + "/tasks/:taskId/execute/actionlog",{taskId: '@taskId'}, {
                        getAll: {method: 'GET', params: {}, isArray: true},
                        create: {method: 'POST'}
                    }),
                    taskExecutionChildrenResource: defineResource(apiVer + "/tasks/:taskId/execute/children",{taskId: '@taskId'}, {
                        getAll: {method: 'GET', params: {}, isArray: true}
                    }),
                    updateTaskConfigResource: defineResource(apiVer + "/tasks/:taskId/execute/updateconfig",{taskId:'@taskId'}, {
                        update: {method: 'PUT', params: {}}
                    }),
                    adhocTaskResource: defineResource(apiVer + "/task/adhoc", {}, {
                        create: {method: 'POST', params: {}}
                    }),
                    entitySingleTasksResource: defineResource(apiVer + "/tasks/:entityType/:entityId/singletasks", {entityType: '@entityType',entityId: '@entityId'}, {
                        getAll: {method: 'GET', params: {} ,isArray:true}
                    }),
                    reportAuditResource: defineResource(apiVer + "/reportaudits/:id", {id: '@id'}, {
                        getAll: {method: 'GET', params: {}, isArray: false},
                        get: {method: 'GET', params: {id: '@id'}, isArray: false}
                    }),
                    smartCardDataResource:defineResource(apiVer+"/clients/:entityId/:entityType/smartcard",{entityType: '@entityType',entityId: '@entityId'}, {
                        getAll: {method: 'GET', parms: {}, isArray: true },
                        update: {method: 'POST', parms:{}}
                    }),
                    workFlowStepSummaryResource: defineResource(apiVer + "/tasks/summary",{}, {
                        get: {method: 'GET', params: {}, isArray: true}
                    }),
                    taskListResource: defineResource(apiVer + "/tasks",{command:'@command'}, {
                        get: {method: 'GET', params: {filterby: '@filterby', offset: '@offset', limit: '@limit'}},
                        update:{method: 'POST',params:{command:'@command'}}
                    }),
                    taskListSearchResource: defineResource(apiVer + "/tasks/search",{command:'@command'}, {
                        get: {method: 'GET', params: {filterby: '@filterby', offset: '@offset', limit: '@limit'}, isArray: true}
                    }),
                    bankAccountDetailResource: defineResource(apiVer + "/:entityType/:entityId/bankaccountdetail/:clientBankAccountDetailAssociationId", {entityType: "@entityType",entityId: '@entityId',clientBankAccountDetailAssociationId: '@clientBankAccountDetailAssociationId'}, {
                        getAll: {method: 'GET', params: {}, isArray: true},
                        create: {method: 'POST'},
                        get: {method: 'GET'},
                        update: {method: 'PUT'},
                        delete: {method: 'DELETE'}
                    }),
                    bankAccountDetailResources: defineResource(apiVer + "/:entityType/:entityId/bankaccountdetail", {entityType: "@entityType",entityId: '@entityId'}, {
                        getAll: {method: 'GET', params: {}, isArray: true},
                        create: {method: 'POST'},
                        get: {method: 'GET'},
                        update: {method: 'PUT'},
                        delete: {method: 'DELETE'}
                    }),
                    loanBankAccountAssociationResources: defineResource(apiVer + "/:entityType/:entityId/bankaccountdetail/loans/:bankAccountId", {entityType: "@entityType",entityId: '@entityId',bankAccountId: '@bankAccountId'}, {
                        create: {method: 'POST'},
                        delete: {method: 'DELETE'}
                    }),
                    bankAccountDetailsTemplateResource: defineResource(apiVer + "/:entityType/:entityId/bankaccountdetail/template", {entityType: "@entityType",entityId: '@entityId'}, {
                        get: {method: 'GET'},
                    }),
                    bankAccountDetailActionResource: defineResource(apiVer + "/:entityType/:entityId/bankaccountdetail/:clientBankAccountDetailAssociationId/action", {entityType: "@entityType",entityId: '@entityId',clientBankAccountDetailAssociationId: '@clientBankAccountDetailAssociationId', command:'@command'}, {
                        doAction: {method: 'POST',params:{command:'@command'}}
                    }),
                    bankAccountDetailWorkflowResource: defineResource(apiVer + "/:entityType/:entityId/bankaccountdetail/workflow", {entityType: "@entityType",entityId: '@entityId'}, {
                        get: {method: 'GET', params: {}}
                    }),
                    cgtTemplateResource:defineResource(apiVer+"/cgt/template", {entityType: '@entityType', entityId: '@entityId'}, {
                        getAll: {method: 'GET', parms: {entityId : '@entityId'}, isArray: false },
                        update: {method: 'POST', parms:{}}
                    }),
                    cgtResource:defineResource(apiVer+"/cgt/:id", {id: '@id', action: '@action'}, {
                        getCgtById: {method: 'GET', parms: {}, isArray: false },
                        getAll: {method: 'GET', parms:{}, isArray: true},
                        update: {method: 'PUT', parms: {action: '@action'}, isArray: false }
                    }),
                    cgtDaysResource:defineResource(apiVer+"/cgt/:id/cgtDay/:cgtDayId", {id: '@id', cgtDayId: '@cgtDayId'}, {
                        getCgtDayByCgtId: {method: 'GET', parms: {}, isArray: false },
                        updateCgtDayByCgtId: {method: 'PUT', parms:{}},
                        completeCgtDay: {method: 'PUT', parms: {action: '@action'}},
                        getCgtDaysById: {method: 'GET', parms: {}, isArray: false}
                    }),
                    bankAccountTransferResource: defineResource(apiVer + "/banktransaction/:bankTransferId", {bankTransferId:"@bankTransferId", entityType: "@entityType",entityId: '@entityId',command:'@command'}, {
                        getAll: {method: 'GET', params: {}, isArray: true},
                        save: {method: 'POST', params: {}}
                    }),
                    bankAccountTransferTemplateResource: defineResource(apiVer + "/banktransaction/:bankTransferId/template", {bankTransferId:"@bankTransferId"}, {
                        get: {method: 'GET', params: {}}
                    }),
                    taskConfigResource: defineResource(apiVer + "/tasks/config/:withTemplate", {}, {
                        getTemplate: {method: 'GET', params: {withTemplate:"template", parentConfigId: '@parentConfigId'}}
                    }),
                    profileRatingConfigurationTemplate: defineResource(apiVer + "/profileratingconfigs/template", {}, {
                        get: {method: 'GET', params: {}}
                    }),
                    profileRatingConfiguration: defineResource(apiVer + "/profileratingconfigs/:profileRatingConfigId", {profileRatingConfigId:"@profileRatingConfigId"}, {
                        getAll: {method: 'GET', params: {}, isArray: true},
                        get: {method: 'GET', params: {}},
                        save: {method: 'POST', params: {}},
                        update: {method: 'PUT', params: {}}
                    }),
                    computeProfileRatingTemplate: defineResource(apiVer + "/computeprofileratings/template", {}, {
                        get: {method: 'GET', params: {}}
                    }),
                    computeProfileRating: defineResource(apiVer + "/computeprofileratings", {}, {
                        save: {method: 'POST', params: {}}
                    }),
                    profileRating: defineResource(apiVer + "/profileratings/:entityType/:entityId", {entityType: '@entityType', entityId: '@entityId'}, {
                        get: {method: 'GET', params: {}}
                    }),
                    loanemipack: defineResource(apiVer + "/loanemipacks/:loanProductId/:loanEMIPackId", {loanProductId: '@loanProductId', loanEMIPackId:'@loanEMIPackId'}, {
                        getAllProductsWithPacks: {method: 'GET', params: {}, isArray: true},
                        getEmiPacks: {method:'GET',params:{loanProductId: '@loanProductId'}, isArray: true},
                        getEmiPack: {method:'GET',params:{loanProductId: '@loanProductId', loanEMIPackId:'@loanEMIPackId'}},
                        add:{method:'POST',params:{loanProductId: '@loanProductId'}},
                        update:{method:'PUT',params:{loanProductId: '@loanProductId', loanEMIPackId:'@loanEMIPackId'}},
                        delete:{method:'DELETE',params:{loanProductId: '@loanProductId', loanEMIPackId:'@loanEMIPackId'}}
                    }),
                    loanemipackproducttemplate: defineResource(apiVer + "/loanemipacks/template", {}, {
                        getAllProductsWithoutPacks: {method: 'GET', params: {}, isArray: true}
                    }),
                    loanemipacktemplate: defineResource(apiVer + "/loanemipacks/:loanProductId/template", {loanProductId: '@loanProductId'}, {
                        getEmiPackTemplate: {method: 'GET', params: {loanProductId: '@loanProductId'}}
                    }),
                    tasksConfigResourceTemplate: defineResource(apiVer + "/tasksconfigurations/:entityType/:entityId/template", {}, {
                        getTemplate: {method: 'GET', params: {entityType:"@entityType", entityId: '@entityId'}}
                    }),
                    tasksConfigResource: defineResource(apiVer + "/tasksconfigurations/:entityType/:entityId", {}, {
                        create: {method: 'POST', params: {entityType:"@entityType", entityId: '@entityId'}}
                    }),    
                    fundTemplateResource: defineResource(apiVer + "/funds/template", {command: '@command'}, {
                        getTemplate: {method: 'GET', params: {command: '@command'}}
                    }),
                    countryResource: defineResource(apiVer + "/countries/:countryId", {countryId: '@countryId'}, {
                        getCountryData: {method: 'GET', params: {countryId: '@countryId'}}
                    }),
                    fundMappingSearchResource: defineResource(apiVer + "/funds/mapping/loans", {isSummary: '@isSummary'}, {
                        search: {method: 'POST', params: {isSummary: '@isSummary'}, isArray: false}
                    }),
                    taskConfigTemplateCreateResource: defineResource(apiVer + "/taskconfigtemplate/template", {}, {
                        get: {method: 'GET', params: {}}
                    }),
                    taskConfigTemplateResource: defineResource(apiVer + "/taskconfigtemplate/:templateId", {templateId:'@templateId'}, {
                        getAll: {method: 'GET', params: {},isArray:true},
                        get:{method: 'GET', params: {}},
                        save: {method: 'POST', params:{}},
                        update: {method: 'PUT', params: {}}
                    }),
                    taskAssignTemplateResource: defineResource(apiVer + "/taskassign/template", {}, {
                        get:{method: 'GET', params: {}}
                    }),
                    taskAssignResource: defineResource(apiVer + "/taskassign", {}, {
                        save:{method: 'POST', params: {}}
                    }),
                    taskConfigTemplateEntityResource: defineResource(apiVer + "/taskconfigtemplate/:templateId/template", {}, {
                        get:{method: 'GET', params: {}}
                    }),
                    voucherTemplateResource: defineResource(apiVer + "/vouchers/template", {}, {
                        get:{method: 'GET', params: {}}
                    }),
                    voucherResource: defineResource(apiVer + "/vouchers/:voucherId", {voucherId:'@voucherId', command: '@command'}, {
                        getAll: {method: 'GET', params: {}},
                        create:{method: 'POST', params: {}},
                        update:{method: 'PUT', params: {}}
                    }),
                    cryptographyPublickeyResource: defineResource(apiVer + "/cryptography/:entityType/publickey", {entityType:'@entityType'}, {
                        get:{method: 'GET', params: {}}
                    }),
                    pdcTemplateResource: defineResource(apiVer + "/pdcm/:entityType/:entityId/template", {
                        entityType: '@entityType',
                        entityId: '@entityId'
                    }, {
                        getTemplate: {method: 'GET', params: {}}
                    }),
                    pdcResource: defineResource(apiVer + "/pdcm/:entityType/:entityId", {
                        entityType: '@entityType',
                        entityId: '@entityId'
                    }, {
                        create: {method: 'POST', params: {}},
                        getAll: {method: 'GET', params: {}, isArray: true}
                    }),
                    pdcOneResource: defineResource(apiVer + "/pdcm/:pdcId", {
                        pdcId: '@pdcId', command: '@command'
                    }, {
                        get: {method: 'GET', params: {}},
                        update: {method: 'PUT', params: {}},
                        delete: {method: 'PUT', params: {pdcId:'@pdcId',command: 'delete'}}
                    }),
                    pdcSearchTemplateResource: defineResource(apiVer + "/pdcm/search/template", {

                    }, {
                        getSearchTemplate: {method: 'GET', params: {}}
                    }),
                    pdcSearchResource: defineResource(apiVer + "/pdcm/search", {

                    }, {
                        search: {method: 'POST', params: {}, isArray: true}
                    }),
                    pdcActionResource: defineResource(apiVer + "/pdcm", {
                        command: '@command'
                    }, {
                        action: {method: 'PUT', params: {}}
                    }),
                    imageResource: defineResource(apiVer + "/:entityType/:entityId/images", {entityType:'@entityType',entityId:'@entityId'}, {
                        get:{method: 'GET', params: {},isArray:true}
                    }),
                    lockOrUnlockEntityResource: defineResource(apiVer + "/locks/:entityType/:entityId", {entityType: '@entityType', entityId: '@entityId', command: '@command'}, {
                        lockOrUnlock: {method: 'POST', params: {}}
                    }),
                    districtsResource:defineResource(apiVer+"/districts/:districtId",{districtId: '@districtId'},{

                    }),
                    districtsVillageResource:defineResource(apiVer+"/districts/:districtId/villages",{districtId: '@districtId'},{
                        
                    }),
                    bulkVillageResource:defineResource(apiVer+"/villages/bulk",{},{
                        reject:{method:'POST',params:{command:'reject'}}
                    }),
                    fileProcessResource:defineResource(apiVer+"/fileprocess/:fileProcessId",{fileProcessId: '@fileProcessId'},{
                        getAllFiles: {method: 'GET', params: {limit:1000, orderBy: 'createdDate', sortOrder: 'DESC'}}
                    }),
                    fileProcessTemplateResource:defineResource(apiVer+"/fileprocess/template",{},{

                    }),
                    overdueChargeResource: defineResource(apiVer + "/loans/overduecharges/:loanIdParam", {loanId: '@loanId'}, {
                        get: {method: 'GET', params: {}},
                        run: {method: 'POST', params: {}}
                    }),
                    workflowEntityMappingResource:defineResource(apiVer + "/taskconfigs/:taskConfigId/mappings",{taskConfigId:'@taskConfigId'},{
                        save: {method: 'POST', params:{}}
                    }),
                    workflowEntityMapping:defineResource(apiVer + "/taskconfigs/mappings/:taskConfigId/:entityType",{taskConfigId:'@taskConfigId',entityType:'@entityType'},{
                        getAll: {method: 'GET', params: {},isArray:true},
                        get:{method: 'GET', params: {}},
                        save: {method: 'POST', params:{}},
                        update: {method: 'PUT', params: {}}
                    }),
                    workflowEntityMappingTemplate:defineResource(apiVer + "/taskconfigs/mappings/template",{},{
                       getTemplate: {method: 'GET', params: {}}
                    }),
                    interBranchLoanAccountResource: defineResource(apiVer + "/interbranch/loans/:loanId", {loanId: '@loanId'}, {
                        get: {method: 'GET', params: {}}
                    }),
                    interBranchLoanTxnsResource: defineResource(apiVer + "/interbranch/loans/:loanId/repayment", {loanId: '@loanId'}, {
                        repayment: {method: 'POST', params: {}}
                    }),
                    interBranchUndoLoanTxnsResource: defineResource(apiVer + "/interbranch/loans/:loanId/transactions/:transactionId/undo", {loanId: '@loanId',transactionId: '@transactionId'}, {
                        undo: {method: 'POST', params: {}}
                    }),
                    interBranchSavingDepositResource: defineResource(apiVer + "/interbranch/savingsaccounts/:savingsId/deposit", {savingsId: '@savingsId'}, {
                        deposit: {method: 'POST', params: {}}
                    }),
                    interBranchSavingWithdrawalResource: defineResource(apiVer + "/interbranch/savingsaccounts/:savingsId/withdrawal", {savingsId: '@savingsId'}, {
                        withdrawal: {method: 'POST', params: {}}
                    }),
                    interBranchUndoSavingTransactionResource: defineResource(apiVer + "/interbranch/savingsaccounts/:savingsId/transactions/:transactionId/undo", {savingsId: '@savingsId',transactionId: '@transactionId'}, {
                        undo: {method: 'POST', params: {}}
                    }),
                    interBranchSavingAccountResource: defineResource(apiVer + "/interbranch/savingsaccounts/:accountId", {accountId: '@accountId'}, {
                        get: {method: 'GET', params: {}}
                    }),
                    interBranchTransferResource: defineResource(apiVer + "/interbranch/accounttransfers", {}, {
                        transfer: {method: 'POST', params: {}}
                    }),
                    interBranchTransferTemplateResource: defineResource(apiVer + "/interbranch/accounttransfers/template", {}, {
                        get: {method: 'GET', params: {}}
                    }),
                    interBranchClientsResource: defineResource(apiVer + "/interbranch/clients/:clientId", {clientId: '@clientId'}, {
                        get: {method: 'GET', params: {}}
                    }),
                    interBranchClientAccountResource: defineResource(apiVer + "/interbranch/clients/:clientId/account", {clientId: '@clientId'}, {
                        get: {method: 'GET', params: {}}
                    }),
                    interBranchClientBasicDetailsResource: defineResource(apiVer + "/interbranch/clients/:clientId/basicdetails", {clientId: '@clientId'}, {
                        get: {method: 'GET', params: {}}
                    }),
                    interBranchPayChargeResource: defineResource(apiVer + "/interbranch/savingsaccounts/:savingsAccountId/charges/:savingsAccountChargeId/pay", {savingsAccountId: '@savingsAccountId',savingsAccountChargeId: '@savingsAccountChargeId'}, {
                        pay: {method: 'POST', params: {}}
                    }),
                    actionGroupsTemplateResource:defineResource(apiVer + "/taskactiongroups/template",{},{
                        getTemplate:{method: 'GET', params: {}}
                    }),
                    actionGroupsResource:defineResource(apiVer + "/taskactiongroups/:actionGroupId",{actionGroupId:'@actionGroupId'},{
                        save: {method: 'POST', params:{}},
                        getAll: {method: 'GET', params: {},isArray:true},
                        get: {method: 'GET', params: {}},
                        update: {method: 'PUT', params:{}}
                    }),
                    inActivateActionGroupResource:defineResource(apiVer + "/taskactiongroups/:actionGroupId/taskactions/:actionId",{actionGroupId:'@actionGroupId',actionId:'@actionId'},{
                       update:{method: 'PUT', params:{}}
                    }),
                    loanApplicationReferencesForGroupResource: defineResource(apiVer + "/loanapplicationreferences/groups", {}, {
                        get: {method: 'GET', params: {groupId: '@groupId',clientId: '@clientId'}, isArray: true}
                    }),
                    workflowConfigResource:defineResource(apiVer + "/taskconfigs/:taskConfigId",{taskConfigId:'@taskConfigId'},{
                        save: {method: 'POST', params:{}},
                        getAll: {method: 'GET', params: {},isArray:true},
                        get: {method: 'GET', params: {}},
                        update: {method: 'PUT', params:{}}
                    }),
                    workflowConfigStepsTemplateResource:defineResource(apiVer + "/taskconfigs/:taskConfigId/taskconfigsteps/template",{taskConfigId:'@taskConfigId'},{
                        get: {method: 'GET', params: {}}
                    }),
                    workflowConfigStepsResource:defineResource(apiVer + "/taskconfigs/:taskConfigId/taskconfigsteps/:taskConfigStepId",{taskConfigId:'@taskConfigId',taskConfigStepId:'@taskConfigStepId'},{
                        save: {method: 'POST', params: {}},
                        getAll:{method: 'GET', params:{}, isArray:true},
                        get: {method: 'GET', params: {}},
                        update:{method: 'PUT', params:{}}
                    }),
                    inActivateWorkflowConfigStepsResource:defineResource(apiVer + "/taskconfigs/:taskConfigId/taskconfigsteps/:taskConfigStepId/inactivate",{taskConfigId:'@taskConfigId',taskConfigStepId:'@taskConfigStepId'},{
                        update:{method: 'PUT', params:{}}
                    }),
                    clientCreditBureauEnquiry: defineResource(apiVer + "/clients/:clientId/creditbureau", {clientId:'@clientId'}, {
                    }),
                    creditBureauReportByEnquiryIdResource: defineResource(apiVer + "/enquiry/creditbureau/:enquiryId/initiate", {enquiryId: '@enquiryId'}, {
                        get: {method: 'GET', params: {}}
                    }),
                    workflowConfigStepsOderChangeResource:defineResource(apiVer + "/taskconfigs/:taskConfigId/taskconfigsteps/order",{taskConfigId:'@taskConfigId'},{
                        update:{method: 'PUT', params:{}}
                    }),
                    clientVerificationResource: defineResource(apiVer + "/clients/:clientId/:anotherresource/verificationDetails", {clientId: '@clientId', anotherresource: '@anotherresource', searchConditions: '@searchConditions'}, {
                        getClientVerificationDetails:{method:'GET', params:{command : "verificationDetails"}, isArray: false}
                    }),
                    aadharClientVerificationResource: defineResource(apiVer + "/clients/:clientId/identifiers/:identifierId/verification/aadhaar", {clientId: '@clientId', identifierId: '@identifierId'}, {
                        save:{method:'POST', params:{}}
                    }),
                    myAccountResource: defineResource(apiVer + "/myaccount/:command", {command: '@command'}, {
                        get: {method: 'GET', params: {}},
                        changePassword: {method:'POST', params:{command:'changepassword'}},
                        logout: { method: 'POST', params: { command: 'logout' } }
                    }),                    
                    userPasswordResource: defineResource(apiVer + "/users/resetpassword", {}, {
                        resetpassword: {method:'POST', params:{}}
                    }),
                    fetchCreditBureauReportByEnquiryIdResource: defineResource(apiVer + "/enquiry/creditbureau/:enquiryId/refresh", {enquiryId: '@enquiryId'}, {
                        get: {method: 'GET', params: {}, isArray: true}
                    }),
                    proxyUserMappingResource: defineResource(apiVer + "/proxyusermappings/:proxyUserMappingId", {proxyUserMappingId: '@proxyUserMappingId'}, {
                        update: {method: 'PUT', params: {}}
                    }),
                    proxyUserMappingTemplateResource: defineResource(apiVer + "/proxyusermappings/template", {}, {
                        
                    }),
                    switchUserResource: defineResource(apiVer + "/switchuser", {}, {
                        
                    }),
                    taskQueryResource: defineResource(apiVer + "/tasks/:taskId/execute/queries",{taskId:'@taskId'}, {
                        getAll: {method: 'GET', params: {}, isArray: true},
                        get: {method: 'GET', params: {}, isArray: true},
                        update: {method: 'PUT', params: {}}
                    }),
                    groupBankAccountResource: defineResource(apiVer + "/groups/:groupId/bankaccountdetails", {groupId: '@groupId'}, {
                        retrieveAll: {method: 'GET', params: {}},
                        create: {method: 'POST'}
                        
                    }),
                    groupBankAccountResourceTemplate: defineResource(apiVer + "/groups/:groupId/bankaccountdetails/template",  {groupId: '@groupId'}, {
                      get: {method: 'GET', params: {}}
                    }),
                    groupBankAccountDetailsResource: defineResource(apiVer + "/groups/:groupId/bankaccountdetails/:bankAccountDetailAssociationId",  {groupId: '@groupId', bankAccountDetailAssociationId:'@bankAccountDetailAssociationId'}, {
                      get: {method: 'GET', params: {}},
                      delete: {method: 'DELETE'},
                      update: {method: 'PUT'}
                    }),
                    groupBankAccountDetailActivateResource: defineResource(apiVer + "/groups/:groupId/bankaccountdetails/:bankAccountDetailAssociationId/activate",  {groupId: '@groupId', bankAccountDetailAssociationId:'@bankAccountDetailAssociationId'}, {
                        activate: {method: 'POST'}
                    }),
                    loanTrxnsTemplateWithBankDetailsResource: defineResource(apiVer + "/loans/:loanId/transactions/template/bankaccountdetails", {loanId: '@loanId'}, {
                        get: {method: 'GET', params: {}}
                    }),
                    loanTrxnForUtrNumberResource: defineResource(apiVer + "/loans/:loanId/transactions/:transactionId/utrnumber", {loanId: '@loanId', transactionId: '@transactionId'}, {
                        update: {method: 'PUT'}
                    }),
                    loanTransactionValueDateResource: defineResource(apiVer + "/loans/:loanId/transactions/:transactionId/updatevaluedate", {loanId: '@loanId', transactionId: '@transactionId'}, {
                        update: {method: 'PUT'}
                    }),
                    valueDateTransactionsResource: defineResource(apiVer + "/valuedatetransactions/loans", {}, {
                        update: {method: 'PUT'}
                    }),
                    clientParentGroupsResource: defineResource(apiVer + "/clients/:clientId/groupdetails", {clientId: '@clientId'}, {
                       getParentGroups: {method:'GET', params: {}, isArray: true}
                    }),
                    taskAnalyticsResource: defineResource(apiVer + "/tasks/analytics",{}, {
                        get: {method: 'GET', params: {}, isArray: true}
                    }),
                    codeHierarchyResource: defineResource(apiVer + "/codes/childCodes",{}, {
                        get: {method: 'GET', params: {}, isArray: true}
                    }),
                    customSequenceResource: defineResource(apiVer + "/sequences/:sequenceId", {sequenceId: '@sequenceId'}, {
                        retrieveAll: {method: 'GET', params: {}, isArray: true},
                        get:{method: 'GET', params: {}},
                        update: { method: 'PUT' },
                        post:{ method: 'POST' }
                    }),
                    sequenceAssociationTemplateResource: defineResource(apiVer + "/sequenceassociations/template", {}, {
                        get: {method: 'GET', params: {}}
                    }),
                    loanApplicationSequenceTemplateResource: defineResource(apiVer + "/loanapplicationreferences/loansequence",{}, {
                        get: {method: 'GET', params: {}}
                    }),
                    customSequenceAssociationResource: defineResource(apiVer + "/sequenceassociations/:sequenceEntityAssociationId", {sequenceEntityAssociationId: '@sequenceEntityAssociationId'}, {
                        retrieveAll: {method: 'GET', params: {}, isArray: true},
                        get:{method: 'GET', params: {}},
                        update: { method: 'PUT' },
                        updateStatus: {method: 'PUT', params: {command: 'updatestatus'}},
                        post:{ method: 'POST' }
                    }),
                    loanApplicationReferencesRepaymentScheduleResource: defineResource(apiVer + "/loanapplicationreferences/:loanApplicationReferenceId/repaymentschedule", {loanApplicationReferenceId: '@loanApplicationReferenceId'}, {
                       repaymentSchedule: {method: 'POST', params: {}}
                    }),
                    clientJlgLoanAccount: defineResource(apiVer + "/accounts/:type/:clientId/:groupId", {type:'@type',clientId:'@clientId',groupId:'@groupId'}, {
                        get: {method: 'GET', params: {}}
                    }),
                    loanProposalReviewTemplateResource: defineResource(apiVer + '/loans/:loanId/proposalreview/template', {loanId: '@loanId'}, {
                        get: {method: "GET", params: {}, isArray: true}
                    }),
                    loanProposalReviewResource: defineResource(apiVer + '/loans/:loanId/proposalreview', {loanId: '@loanId'}, {
                        post: {method: "POST"}
                    }),
                    loanProposalReviewHistoryResource: defineResource(apiVer +"/grouploanindividualmonitoring/:loanId/reviewhistory", {loanId:'@loanId'},{
                        getAll: {method: 'GET', params: {}, isArray : true}
                    }),
                    cgtBasicActivityResource: defineResource(apiVer + "/cgt/completiondate", {},{
                       persistCgtCompletionDate: {method: 'POST', params: {}}
                    }),
                    loanUpdateDisbursementDateResource: defineResource(apiVer + "/loans/updatedisbursementdate", {},{
                       updateexpecteddisbursementdate: {method: 'POST', params: {}}
                    }),
                    creditBureauBulkReportResource: defineResource(apiVer + "/enquiry/creditbureau/:entityType/:entityId/bulkinitiate", {entityType: '@entityType',entityId: '@entityId'}, {
                        get: {method: 'GET', params: {}, isArray : true}
                    }),
                    clientLevelTaskTrackingResource: defineResource(apiVer +"/tasktracking/clientlevel", {},{
                        get: {method: 'GET', params: {}},
                        get: {method: 'GET', params: {}, isArray: true}
                    }),
                    historyResource: defineResource(apiVer + "/:entityType/:entityId/history", {entityType:'@entityType',entityId:'@entityId'}, {
                        get: {method: 'GET', params: {},isArray: true}

                    }),
                    reportGenerateResource: defineResource(apiVer + "/:entityType/:entityId/documents/generatereport", {entityType: '@entityType', entityId: '@entityId'}, {
                        generate: {method: 'POST', params: {command:"generate"}}
                    }),
                    clientsTaskStepsTrackingResource: defineResource(apiVer +"/tasktracking/clientsstepsinfo/:centerId", {centerId:'@centerId'},{
                        get: {method: 'GET', params: {}, isArray: true}
                    }),
                    surveyResourceByName: defineResource(apiVer + "/surveys/surveyname/:surveyName", { surveyName:'@surveyName'}, {
                        getBySurveyName: {method: 'GET', params: {}}
                    }),
                    entityWorkflowResource: defineResource(apiVer + "/workflows/:entityType/:entityId", {entityType: '@entityType',entityId: '@entityId'}, {
                        getWorkflows: {method: 'GET', params: {}, isArray: true}
                    }),
                    bankApprovalListSearchResource: defineResource(apiVer + "/tasktracking/bankapprovals/search",{}, {
                        get: {method: 'GET', params: {filterby: '@filterby', offset: '@offset', limit: '@limit'}, isArray: true}
                    }),
                    bankApprovalTemplateResource: defineResource(apiVer + "/tasktracking/:trackerId/bankapproval/template",{trackerId:'@trackerId'}, {
                        get: {method: 'GET', params: {}}
                    }),
                    bankApprovalActionResource: defineResource(apiVer + "/tasktracking/bankapproval/:bankApproveId",{bankApproveId:'@bankApproveId'}, {
                        doAction: {method: 'POST', params: {}}
                    }),
                    taskClientLevelQueryResource: defineResource(apiVer + "/tasktracking/bankapproval/:bankApproveId/query/:queryId",{bankApproveId:'@bankApproveId', queryId:'@queryId'}, {
                        raiseQuery: {method: 'POST', params: {}},
                        resolveQuery: {method: 'PUT'}
                    }),
                    taskClientLevelQueryResolveTemplateResource: defineResource(apiVer + "/tasktracking/:trackerId/query/template",{trackerId:'@trackerId'}, {
                        get: {method: 'GET', params: {}}
                    }),
                    officeDropDownResource: defineResource(apiVer + "/offices/template", {}, {
                        getAllOffices: {method: 'GET', params: {}}
                    }),
                    eodProcessResource: defineResource(apiVer + "/eodprocess/:eodProcessId",{eodProcessId:'@eodProcessId',searchConditions: '@searchConditions'}, {
                        initiate: {method: 'POST', params: {}},
                        getAll:{method: 'GET', params: {},isArray: true},
                        getEodCollections:{method: 'GET', params: {}},
                        delete: {method: 'DELETE', params: {}}
                    }),
                    eodProcessTemplateResource:defineResource(apiVer + "/eodprocess/template",{}, {
                        get: {method: 'GET', params: {}}
                    }),
                    eodSummaryResource:defineResource(apiVer + "/eodsummary/:eodProcessId/:resourceName",{eodProcessId:'@eodProcessId',resourceName:'@resourceName'}, {
                        get: {method: 'GET', params: {}}
                    }),
                    initiateGroupWorkflowResource: defineResource(apiVer + "/groups/:groupId", {groupId: '@groupId'}, {
                        save:{method:'POST', params:{}}
                    }),
                    loanTopupResource: defineResource(apiVer + "/loans/:loanId/loantopupdetails", {loanId: '@loanId'}, {
                        get: {method: 'GET', params: {}, isArray: true}
                    }),
                    fieldOfficersResource: defineResource(apiVer + "/staff/loanofficers", {officeId: '@officeId'}, {
                        retrievefieldOfficers: {method: 'GET', params: {}, isArray:true},
                    }),
                    savingsInstallmentRescheduleResource: defineResource(apiVer + "/savingsaccounts/bulkrescheduleinstallments/template", {}, {
                        get: {method: 'GET', params: {}}
                    }),
                    rescheduleSavingsInstallments: defineResource(apiVer + "/savingsaccounts/bulkrescheduleinstallments", {}, {
                        reschedule:{method:'POST' , params:{}}
                    }),
                    bulkTransferTemplateResource: defineResource(apiVer + "/bulktransfer/template", {}, {
                        get:{method:'GET' , params:{}}
                    }),
                    bulkTransferResource: defineResource(apiVer + "/bulktransfer/:branchTransferId", {branchTransferId:'@branchTransferId'}, {
                        getAll:{method:'GET' , params:{}, isArray:true},
                        get:{method:'GET' , params:{branchTransferId:'@branchTransferId'}, isArray:false},                        
                        actions:{method:'POST' , params:{branchTransferId:'@branchTransferId'}}
                    })
                };
            }];
        }
    });
    mifosX.ng.services.config(function ($provide) {
        $provide.provider('ResourceFactory', mifosX.services.ResourceFactoryProvider);
    }).run(function ($log) {
        $log.info("ResourceFactory initialized");
    });
}(mifosX.services || {}));
