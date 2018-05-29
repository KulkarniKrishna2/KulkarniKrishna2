define(['Q', 'underscore', 'mifosX'], function (Q) {
    var components = {
        models: [
            'clientStatus',
            'LoggedInUser',
            'roleMap',
            'Langs'
        ],
        services: [
            'ResourceFactoryProvider',
            'HttpServiceProvider',
            'AuthenticationService',
            'SessionManager',
            'Paginator',
            'PaginatorUsingOffset',
            'UIConfigService',
            'CommonUtilService',
            'ExcelExportTableService',
            'PopUpUtilService'
        ],
        controllers: [
            'main/MainController',
            'main/LoginFormController',
            'main/TaskController',
            'main/SearchController',
            'main/NavigationController',
            'collection/ProductiveCollectionSheetController',
            'collection/CollectionSheetController',
            'collection/IndividualCollectionSheetController',
            'loanAccount/ViewLoanDetailsController',
            'loanAccount/AdjustRepaymentSchedule',
            'loanAccount/NewLoanApplicationReference',
            'loanAccount/ViewLoanApplicationReference',
            'loanAccount/DisburseLoanApplicationReference',
            'loanAccount/NewLoanAccAppController',
            'loanAccount/UpdateLoanApplicationReference',
            'loanAccount/ApproveLoanApplicationReference',
            'loanAccount/ManageCoApplicantsController',
            'loanAccount/CreditBureauReportController',
            'loanAccount/LoanAccountActionsController',
            'loanAccount/AddLoanChargeController',
            'loanAccount/AddLoanCollateralController',
            'loanAccount/AssignLoanOfficerController',
            'loanAccount/EditLoanAccAppController',
            'loanAccount/ViewLoanCollateralController',
            'loanAccount/EditLoanCollateralController',
            'loanAccount/ViewLoanChargeController',
            'loanAccount/EditLoanChargeController',
            'loanAccount/NewJLGLoanAccAppController',
            'loanAccount/LoanDocumentController',
            'loanAccount/MandateController',
            'system/ViewMandatesController',
            'system/DownloadMandatesController',
            'system/UploadMandatesController',
            'system/DownloadTransactionsController',
            'system/UploadTransactionsController',
            'system/ViewMandatesSummaryController',
            'loanAccount/ViewLoanTransactionController',
            'loanAccount/LoanScreenReportController',
            'loanAccount/RescheduleLoansRequestController',
            'loanAccount/ViewRescheduleRequestController',
            'loanAccount/ApproveLoanRescheduleRequestController',
            'loanAccount/RejectLoanRescheduleRequestController',
            'loanAccount/PreviewLoanRepaymentScheduleController',
            'loanAccount/LoanForeclosureController',
            'groups/AssignStaffController',
            'client/ClientController',
            'client/EditClientController',
            'client/ViewClientController',
            'client/CreateNewClientController',
            'client/ClientCreationController',
            'client/TransactionClientController',
            'client/ClientActionsController',
            'client/ClientDocumentController',
            'client/ClientIdentifierController',
            'client/EditClientIdentifierController',
            'client/UploadClientIdentifierDocumentController',
            'client/ClientScreenReportController',
            'client/AddNewClientChargeController',
            'client/PayClientChargeController',
            'client/ViewClientChargeController',
            'client/ViewClientRecurringChargeController',
            'client/ClientChargesOverviewController',
            'client/SurveyController',
            'client/ClientAddressController',
            'client/EditClientAddressController',
            'client/ClientGuaranteeController',
            'product/LoanProductController',
            'product/CreateLoanProductController',
            'product/CreateSavingProductController',
            'product/EditSavingProductController',
            'product/EditLoanProductController',
            'product/ChargeController',
            'product/ViewChargeController',
            'product/floatingrates/FloatingRatesController',
            'product/floatingrates/CreateFloatingRateController',
            'product/floatingrates/ViewFloatingRateController',
            'product/floatingrates/EditFloatingRateController',
            'product/SavingProductController',
            'product/ViewSavingProductController',
            'product/ShareProductController',
            'product/ViewShareProductController',
            'product/CreateShareProductController',
            'product/EditShareProductController',
            'product/ShareProductDividendController',
            'product/ViewShareProductDividendController',
            'product/ShareProductActionsController',
            'product/ViewLoanProductController',
            'product/FixedDepositProductController',
            'product/ViewFixedDepositProductController',
            'product/CreateFixedDepositProductController',
            'product/EditFixedDepositProductController',
            'product/RecurringDepositProductController',
            'product/ViewRecurringDepositProductController',
            'product/CreateRecurringDepositProductController',
            'product/EditRecurringDepositProductController',
            'product/InterestRateChartController',
            'product/CreateInterestRateChartController',
            'product/EditInterestRateChartController',
            'user/UserController',
            'user/UserFormController',
            'user/UserSettingController',
            'user/UserListController',
            'user/ViewUserController',
            'organization/RoleController',
            'organization/ViewRoleController',
            'organization/CreateRoleController',
            'organization/EditRoleController',
            'organization/MakerCheckerController',
            'organization/OfficesController',
            'organization/ViewOfficeController',
            'organization/CreateOfficeController',
            'organization/EditOfficeController',
            'organization/CurrencyConfigController',
            'organization/CreateUserController',
            'organization/CreateUserCommonController',
            'organization/EditUserController',
            'organization/ViewEmployeeController',
            'organization/EditEmployeeController',
            'organization/EmployeeController',
            'organization/CreateEmployeeController',
            'organization/funds/ManageFundsController',
            'organization/ViewPaymentTypeController',
            'organization/CreatePaymentTypeController',
            'organization/EditPaymentTypeController',
            'organization/OverdueChargeController',
            'accounting/provisioning/CreateProvisoningEntriesController',
            'accounting/provisioning/ViewProvisioningEntryController',
            'accounting/provisioning/ViewAllProvisoningEntriesController',
            'accounting/provisioning/ViewProvisioningJournalEntriesController',
            'accounting/AccFreqPostingController',
            'accounting/AccCoaController',
            'accounting/AccCreateGLAccountController',
            'accounting/AccViewGLAccountContoller',
            'accounting/AccEditGLAccountController',
            'accounting/ViewTransactionController',
            'accounting/JournalEntryController',
            'accounting/SearchTransactionController',
            'accounting/AccountingClosureController',
            'accounting/ViewAccountingClosureController',
            'accounting/AccountingRuleController',
            'accounting/AccCreateRuleController',
            'accounting/AccEditRuleController',
            'accounting/ViewAccRuleController',
            'accounting/FinancialActivityMappingsController',
            'accounting/AddFinancialMappingController',
            'accounting/ViewFinancialActivityController',
            'accounting/EditFinancialActivityMappingController',
            'accounting/PeriodicAccrualAccountingController',
            'system/CodeController',
            'system/EditCodeController',
            'system/ViewCodeController',
            'system/AddCodeController',
            'system/HookController',
            'system/ViewHookController',
            'system/CreateHookController',
            'system/EditHookController',
            'system/ViewDataTableController',
            'system/DataTableController',
            'system/ReportsController',
            'system/ViewReportController',
            'system/CreateReportController',
            'system/EditReportController',
            'system/CreateDataTableController',
            'system/EditDataTableController',
            'system/MakeDataTableEntryController',
            'system/DataTableEntryController',
            'system/SchedulerJobsController',
            'system/ViewSchedulerJobController',
            'system/EditSchedulerJobController',
            'system/EntityToEntityMappingController',
            'system/ViewSchedulerJobHistoryController',
            'system/AccountNumberPreferencesController',
            'system/ViewAccountNumberPreferencesController',
            'system/AddAccountNumberPreferencesController',
            'system/EditAccountNumberPreferencesController',
            'system/ViewExternalAuthenticationServices',
            'organization/HolController',
            'organization/ViewHolController',
            'organization/EditHolidayController',
            'organization/AddHolController',
            'reports/ViewReportsController',
            'organization/EditHolidayController',
            'organization/EditWorkingDaysController',
            'organization/EditPasswordPreferencesController',
            'reports/RunReportsController',
            'reports/XBRLController',
            'reports/XBRLReportController',
            'savings/CreateSavingAccountController',
            'savings/ViewSavingDetailsController',
            'shares/CreateShareAccountController',
            'shares/ViewShareAccountController',
            'shares/EditShareAccountController',
            'shares/ShareAccountActionsController',
            'groups/GroupController',
            'groups/ViewGroupController',
            'groups/AttachMeetingController',
            'groups/EditMeetingController',
            'groups/EditMeetingBasedOnMeetingDatesController',
            'savings/EditSavingAccountController',
            'savings/SavingAccountActionsController',
            'savings/ListOnHoldTransactionController',
            'accounttransfers/ViewAccountTransferDetailsController',
            'accounttransfers/MakeAccountTransferController',
            'accounttransfers/CreateStandingInstructionController',
            'accounttransfers/ListStandingInstructionController',
            'accounttransfers/ListTransactionsController',
            'accounttransfers/EditStandingInstructionController',
            'accounttransfers/ViewStandingInstructionController',
            'accounttransfers/StandingInstructionsHistoryController',
            'savings/ViewSavingsTransactionController',
            'savings/AddNewSavingsChargeController',
            'savings/ViewSavingChargeController',
            'savings/AssignSavingsOfficerController',
            'savings/UnAssignSavingsOfficerController',
            'deposits/fixed/FixedDepositAccountActionsController',
            'deposits/fixed/ViewFixedDepositAccountDetailsController',
            'deposits/fixed/CreateFixedDepositAccountController',
            'deposits/fixed/EditDepositAccountController',
            'deposits/fixed/AddNewFixedDepositChargeController',
            'deposits/fixed/ViewFixedDepositTransactionController',
            'deposits/recurring/RecurringDepositAccountActionsController',
            'deposits/recurring/ViewRecurringDepositAccountDetailsController',
            'deposits/recurring/CreateRecurringDepositAccountController',
            'deposits/recurring/EditRecurringDepositAccountController',
            'deposits/recurring/AddNewRecurringDepositChargeController',
            'deposits/recurring/ViewRecurringDepositTransactionController',
            'groups/CreateGroupController',
            'groups/EditGroupController',
            'groups/GroupAttendanceController',
            'groups/CloseGroupController',
            'groups/AddRoleController',
            'groups/MemberManageController',
            'groups/TransferClientsController',
            'centers/CenterController',
            'centers/ViewCenterController',
            'centers/CreateCenterController',
            'centers/EditCenterController',
            'centers/CloseCenterController',
            'centers/CenterAttendanceController',
            'centers/ManageGroupMembersController',
            'centers/BulkUndoTransactionsController',
            'villages/VillageController',
            'villages/ViewVillageController',
            'villages/CreateVillageController',
            'villages/EditVillageController',
            'villages/AddVillageAddressController',
            'villages/EditVillageAddressController',
            'product/CreateChargeController',
            'product/EditChargeController',
            'configurations/GlobalConfigurationController',
            'configurations/EditConfigurationController',
            'product/productmix/ProductMixController',
            'product/productmix/ViewProductMixController',
            'product/productmix/AddProductMixController',
            'organization/BulkLoanReassignmentController',
            'system/AuditController',
            'system/ViewAuditController',
            'template/TemplateController',
            'template/CreateTemplateController',
            'template/ViewTemplateController',
            'template/EditTemplateController',
            'loanAccount/GuarantorController',
            'loanAccount/EditGuarantorController',
            'loanAccount/ListGuarantorController',
            'main/ViewCheckerinboxController',
            'main/ExpertSearchController',
            'main/RichDashboard',
            'main/ProfileController',
            'main/ViewMakerCheckerTaskController',
            'main/AdHocQuerySearchController',
            'accounting/AccOGMController',
            'organization/cashmgmt/TellersController',
            'organization/cashmgmt/CreateTellerController',
            'organization/cashmgmt/ViewTellerController',
            'organization/cashmgmt/EditTellerController',
            'organization/cashmgmt/ViewCashiersForTellerController',
            'organization/cashmgmt/CreateCashierForTellerController',
            'organization/cashmgmt/ViewCashierController',
            'organization/cashmgmt/EditCashierController',
            'organization/cashmgmt/CashierTransactionsController',
            'organization/cashmgmt/CashierFundsAllocationSettlementController',
            'organization/provisioning/CreateProvisioningCriteriaController',
            'organization/provisioning/ViewAllProvisoningCriteriaController',
            'organization/provisioning/ViewProvisioningCriteriaController',
            'organization/provisioning/EditProvisioningCriteriaController',
            'accounting/DefineOpeningBalancesController',
            'configurations/ExternalServicesController',
            'configurations/EditExternalServicesConfigurationController',
            'configurations/ViewExternalServicesController',
            'configurations/ViewOtherExternalServicesController',
            'configurations/EditOtherExternalServicesConfigurationController',
            'collaterals/CollateralController',
            'collaterals/CreateCollateralController',
            'collaterals/CollateralQualityStandardsController',
            'collaterals/ProductCollateralMappingsController',
            'collaterals/CreateProductCollateralMappingController',
            'collaterals/EditProductCollateralMappingController',
            'collaterals/CollateralValueCalculatorController',
            'collaterals/EditCollateralController',
            'collaterals/ViewPledgeController',
            'collaterals/SerachPledgeController',
            'collaterals/AttachPledgeToExistingCustomerController',
            'collaterals/EditCollateralController',
            'collaterals/ViewPledgeController',
            'collaterals/SerachPledgeController',
            'collaterals/CollateralValueCalculatorController',
            'collaterals/EditPledgeController',
            'collaterals/EditCollateralQualityStandardsController',
            'product/tax/CreateTaxComponentController',
            'product/tax/ViewTaxComponentController',
            'product/tax/EditTaxComponentController',
            'product/tax/TaxComponentController',
            'product/tax/CreateTaxGroupController',
            'product/tax/ViewTaxGroupController',
            'product/tax/EditTaxGroupController',
            'product/tax/TaxGroupController',
            'product/ViewTransactionAuthenticationController',
            'product/EditTransactionAuthentication',
            'product/CreateTransactionAuthentication',
            'sms/SendSmsController',
            'sms/TrackSmsController',
            'sms/CreateSmsCampaignController',
            'sms/ViewSmsCampaignController',
            'sms/EditSmsCampaignController',
            'sms/CloseSmsCampaignController',
            'sms/ActivateSmsCampaignController',
            'sms/ReactivateCampaignController',
            'bankstatements/ViewBankStatementController',
            'bankstatements/ViewBankStatementDetailsController',
            'bankstatements/UploadBankStatementController',
            'bankstatements/UpdateBankStatementController',
            'bankstatements/ViewBankStatementDetailJournalEntryController',
            'bankstatements/ViewBankController',
            'bankstatements/UpdateBankController',
            'bankstatements/CreateBankController',
            'savings/JlgSavingsAccountController',
            'savings/JlgSavingsAccountGroupController',
            'configurations/ViewCreditBureauSummaryController',
            'configurations/AddNewCreditBureauController',
            'configurations/MapCreditBureauToLpController',
            'product/CreditBureauLoanProductsController',
            'product/CreateCreditbureauLoanProductController',
            'product/EditCreditbureauLoanProductController',
            'product/ViewCreditbureauLoanProductController',
            'organization/riskconfig/LoanPurposeGroupsController',
            'organization/riskconfig/CreateLoanPurposeController',
            'organization/riskconfig/CreateLoanPurposeGroupsController',
            'organization/riskconfig/LoanPurposeController',
            'organization/riskconfig/EditLoanPurposeGroupsController',
            'organization/riskconfig/EditLoanPurposeController',
            'organization/riskconfig/ViewLoanPurposeGroupController',
            'organization/riskconfig/ViewLoanPurposeController',
            'organization/riskconfig/OccupationCatagoryController',
            'organization/riskconfig/CreateOccupationCategoryController',
            'organization/riskconfig/CreateRiskFactorController',
            'organization/riskconfig/RiskFactorController',
            'organization/riskconfig/ViewRiskFactorController',
            'organization/riskconfig/EditRiskFactorController',
            'organization/riskconfig/CreateRiskDimensionController',
            'organization/riskconfig/RiskDimensionController',
            'organization/riskconfig/ViewRiskDimensionController',
            'organization/riskconfig/EditRiskDimensionController',
            'organization/riskconfig/CreateRiskCriteriaController',
            'organization/riskconfig/RiskCriteriaController',
            'organization/riskconfig/ViewRiskCriteriaController',
            'organization/riskconfig/EditRiskCriteriaController',
            'organization/riskconfig/CreateLoanProductEligibilityController',
            'organization/riskconfig/ViewLoanProductEligibilityController',
            'organization/riskconfig/EditLoanProductEligibilityController',
            'organization/riskconfig/LoanProductEligibilityController',
            'organization/riskconfig/EditOccupationCatagoryController',
            'organization/riskconfig/ViewOccupationCategoryController',
            'organization/riskconfig/OccupationController',
            'organization/riskconfig/CreateOccupationController',
            'organization/riskconfig/EditOccupationController',
            'organization/riskconfig/ViewOccupationController',
            'groups/EditLoanUtilizationCheckController',
            'groups/CreateCenterLoanUtilization',
            'groups/ListLoanUtilizationCheckController',
            'client/CreateFamilyMemberSummaryController',
            'client/ListFamilyDetailController',
            'client/CreateFamilyMemberController',
            'client/ViewFamilyMemberDetailsController',
            'client/EditFamilyMemberController',
            'client/CreateClientOccupationController',
            'client/EditClientOccupationController',
            'client/EditClientAssetController',
            'client/EditHouseHoldExpenseController',
            'client/CreateExistingLoanController',
            'client/EditExistingLoanController',
            'client/ViewExistingLoanController',
            'client/ViewClientChargeTransactionController',
            'common/defaultUIConfigController',
            'organization/riskconfig/IncomeExpenseGeneratingController',
            'organization/riskconfig/CreateIncomeGeneratingAssetController',
            'organization/riskconfig/EditIncomeGeneratingController',
            'organization/riskconfig/HouseHoldExpenseController',
            'organization/riskconfig/CreateHouseHoldExpenseController',
            'organization/riskconfig/EditHouseHoldExpController',
            'organization/riskconfig/ViewHouseHoldExpController',
            'organization/riskconfig/ExpenseController',
            'organization/riskconfig/CreateExpenseController',
            'organization/riskconfig/ViewExpenseController',
            'organization/riskconfig/EditExpenseController',
            'organization/riskconfig/IncomeAssetController',
            'organization/riskconfig/CreateIncomeAssetController',
            'organization/riskconfig/EditIncomeAssetController',
            'organization/riskconfig/ViewIncomeAssetController',
            'loanAccount/ListSurveyController',
            'loanAccount/ViewScoreCardController',
            'bankstatements/ViewMiscellaneousBankStatementDetailsController',
            'bankstatements/ViewReconciledBankStatementDetailsController',
            'bankstatements/ViewBankStatementSummaryController',
            'loanAccount/GLIMLoanAccountWaiveChargeController',
            'loanAccount/GLIMPrepayLoanController',
            'loanAccount/GLIMRecoveryPaymentController',
            'loanAccount/ViewGlimRepaymentScheduleController',
            'survey/SurveysController',
            'survey/CreateSurveyController',
            'survey/EditSurveyController',
            'survey/ViewSurveyController',
            'survey/ViewEntityTypeSurveys',
            'survey/TakeNewSurveyController',
            'bankstatements/ViewGeneratePortfolioTransactionsController',
            'task/WorkflowTaskController',
            'task/SingleTaskController',
            'task/ViewTaskController',
            'task/activity/defaultActivityController',
            'task/activity/AssignVillageStaffController',
            'task/activity/datatableActivityController',
            'task/activity/adhocActivityController',
            'task/showcase/LoanApplicationWorkflowController',
            'task/taskconfigtemplate/CreateTaskConfigTemplateController',
            'task/taskconfigtemplate/TaskConfigTemplateController',
            'task/taskconfigtemplate/EditTaskConfigTemplateController',
            'task/createtask/CreateTaskController',
            'task/showcase/GroupOnboardingWorkflowController',
            'task/activity/loanapplicationapprovalActivityController',
            'task/activity/familyDetailActivityController',
            'task/activity/clientdocumentActivityController',
            'task/activity/existingLoanActivityController',
            'task/activity/creditbureauActivityController',
            'task/activity/surveyActivityController',
            'task/activity/loanapplicationdisbursalActivityController',
            'task/activity/bankaccountActivityController',
            'task/activity/checkerbankaccountActivityController',
            'task/activity/reviewbankaccountActivityController',
            'task/activity/kycActivityController',
            'task/activity/camActivityController',
            'task/activity/cashflowActivityController',
            'task/activity/criteriacheckActivityController',
            'task/activity/banktransactionActivityController',
            'task/activity/groupmembersActivityController',
            'task/activity/loanAppCoApplicantActivityController',
            'task/activity/ClientDeDuplicationActivityController',
            'task/activity/AddressActivityController',
            'task/activity/clientActivationActivityController',
            'task/activity/CoApplicantActivityController',
            'task/activity/AssociateToGroupController',
            'task/activity/takepictureActivityController',
            'task/activity/viewbankaccountActivityController',
            'task/activity/villageActivationActivityController',
            'task/activity/districtActivationActivityController',
            'task/activity/groupActivationActivityController',
            'task/activity/officeActivationActivityController',
            'task/activity/villageRejectionActivityController',
            'task/activity/UserActivityController',
            'reports/AuditReportController',
            'reports/ViewAuditReportController',
            'dashboard/WorkFlowStepDashboardController',
            'dashboard/TaskListController',
            'bankaccountdetails/BankAccountDetailController',
            'bankaccountdetails/common/BankAccountCommonController',
            'bankaccountdetails/common/CheckerBankAccountCommonController',
            'bankaccountdetails/common/ReviewBankAccountCommonController',
            'bankaccountdetails/common/ViewBankAccountCommonController',
            'cgt/CgtCreationController',
            'cgt/ViewCgtController',
            'cgt/updateCgtDayController',
            'cgt/ViewCgtDaysController',
            'cgt/CgtCompleteOrRejectController',
            'accounttransfers/ViewAccountTransferDetailsController',
            'accounttransfers/ViewBankAccountTransferDetailsController',
            'organization/profilerating/ViewProfileRatingConfigurationController',
            'organization/profilerating/CreateProfileRatingConfigurationController',
            'organization/profilerating/EditProfileRatingConfigurationController',
            'organization/profilerating/RiskProfileRatingComputeController',
            'product/loanemipacks/LoanEMIPacksController',
            'product/loanemipacks/ViewLoanEMIPacksController',
            'product/loanemipacks/AddLoanEMIPacksController',
            'product/loanemipacks/EditLoanEMIPacksController',
            'task/config/CreateWorkflowTasksConfigController',
            'organization/profilerating/RiskProfileRatingComputeController',
            'organization/funds/CreateFundController',
            'organization/funds/ViewFundController',
            'organization/funds/EditFundController',
            'organization/funds/AssignFundController',
            'main/AdvancedSearchController',
            'configurations/DedupController',
            'accounting/voucherentry/CreateVoucherTypeController',
            'accounting/voucherentry/CreateVoucherTypeFormController',
            'accounting/voucherentry/CreateVoucherTypeInterBranchTransferController',
            'accounting/voucherentry/SearchVoucherController',
            'accounting/voucherentry/ViewVoucherTypeController',
            'accounting/voucherentry/ViewVoucherTypeDetailsController',
            'accounting/voucherentry/VoucherTypeController',
            'bulkoperations/BulkPortfolioTransactionsController',
            'bulkoperations/ViewBulkPortfolioTransactionsController',
            'bulkoperations/UploadBulkCollectionController',
            'limitsmodule/CreateClientAccountLimitsController',
            'limitsmodule/ViewCustomerAccountLimitsController',
            'pdc/CreatePDCController',
            'pdc/DisplayPDCListController',
            'pdc/ViewPDCDetailController',
            'pdc/ManagePDCController',
            'pdc/ActionOnPDCController',
            'task/showcase/VillageOnboardingWorkflowController',
            'task/showcase/OfficeOnboardingWorkflowController',
            'task/showcase/DistrictOnboardingWorkflowController',
            'districts/DistrictController',
            'fileprocess/FileProcessController',
            'fileprocess/UploadFileProcessController',
            'task/config/ViewWorkflowEntityMappingController',
            'task/config/WorkflowEntityMappingsController',
            'task/config/CreateWorkflowEntityMappingController',
            'interbranch/SearchDetailsController',
            'task/config/AddActionGroupsController',
            'task/config/DisplayActionGroupsController',
            'task/config/ViewActionGroupController',
            'task/activity/CGTActivityController',
            'task/activity/groupLoanApprovalActivityController',
            'task/activity/groupLoanDisbursalActivityController',
            'task/config/AddWorkflowController',
            'task/config/ViewWorkflowController',
            'task/config/WorkflowsConfigController',
            'task/config/AddWorkflowStepsController',
            'task/config/ViewWorkflowStepController',
            'creditbureau/CreateCreditBureauReportController',
            'creditbureau/ViewCreditBureauReportController',
            'client/ClientVerificationCommonController',
            'client/ClientVerificationDetailsController',
            'client/ClientVerificationActivityController',
            'fileprocess/UploadBulkBankAccountVerificationFileProcessController',
            'fileprocess/BulkBankAccountVerificationFileProcessController',
            'groups/GroupCreditBureauSummaryController',
            'groups/ViewLoanUtilizationCheckController',
            'proxyuser/ProxyUserMappingsController',
            'proxyuser/CreateProxyUserMappingController',
            'proxyuser/ViewProxyUserMappingsController',
            'proxyuser/EditProxyUserMappingController',
            'proxyuser/SwitchUserController',
            'groups/groupbankaccountdetails/GroupBankAccountDetailsController',
            'groups/groupbankaccountdetails/CreateGroupBankAccountController',
            'groups/groupbankaccountdetails/ViewGroupBankAccountController',
            'task/analytics/TaskAnalyticsController',
            'customsequence/SequenceDetailsListController',
            'customsequence/ViewSequenceDetailsController',
            'customsequence/CreateSequenceDetailsController',
            'customsequence/SequenceEntityAssociationListController',
            'customsequence/CreateSequenceEntityAssociationController',
            'customsequence/SequenceEntityAssociationCommonController'
        ],
        filters: [
            'StatusLookup',
            'DateFormat',
            'DateTimeFormat',
            'DayMonthFormat',
            'YesOrNo',
            'UrlToString',
            'sort',
            'DotRemove',
            'FormatNumber',
            'TranslateDataTableColumn',
            'SearchFilter',
            'AddUpTotalFor',
            'IconLookup'
        ],
        directives: [
            'DialogDirective',
            'PanelDirective',
            'BigPanelDirective',
            'OnBlurDirective',
            'LateValidateDirective',
            'TreeviewDirective',
            'CkEditorDirective',
            'AutofocusDirective',
            'SummaryDirective',
            'FormValidateDirective',
            'FormSubmitValidateDirective',
            'ApiValidationDirective',
            'HasPermissionDirective',
            'ActivitiesDisplayPanelDirective',
            'ScrollbarTopDirective',
            'ChosenComboboxDirective',
            'NumberFormatDirective',
            'SuccessfulResponsesDirective',
            'UnSuccessfulResponseDirective',
            'TabsPersistenceDirective',
            'AuditLogDirevtive',
            'TabsPersistenceDirective',
            'ExpressionBuilderDirective',
            'ImageViewerDirective',
            'ViewDocumentDirective'
        ]
    };

    return function() {
        var defer = Q.defer();
        require(_.reduce(_.keys(components), function (list, group) {
            return list.concat(_.map(components[group], function (name) {
                return group + "/" + name;
            }));
        }, [
            'routes',
            'initialTasks',
            'webstorage-configuration'
        ]), function(){
            defer.resolve();
        });
        return defer.promise;
    }
});
