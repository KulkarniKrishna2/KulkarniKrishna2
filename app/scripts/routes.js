
(function (mifosX) {
    var defineRoutes = function ($routeProvider, $locationProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/home.html'
            })
            .when('/login', {
                templateUrl: 'views/login.html'
            })
            .when('/home', {
                templateUrl: 'views/home.html'
            })
            .when('/richdashboard', {
                templateUrl: 'views/private/rich_dashboard.html'
            })
            .when('/products', {
                templateUrl: 'views/products/products.html'
            })
            .when('/templates', {
                templateUrl: 'views/templates/templates.html'
            })
            .when('/createstandinginstruction/:officeId/:clientId/:accountType', {
                templateUrl: 'views/accounttransfers/create_standinginstruction.html'
            })
            .when('/editstandinginstruction/:instructionId/:from', {
                templateUrl: 'views/accounttransfers/edit_standinginstruction.html'
            })
            .when('/viewstandinginstruction/:instructionId', {
                templateUrl: 'views/accounttransfers/view_standinginstruction.html'
            })
            .when('/liststandinginstructions/:officeId/:clientId', {
                templateUrl: 'views/accounttransfers/list_standinginstruction.html'
            })
            .when('/listaccounttransactions/:instructionId', {
                templateUrl: 'views/accounttransfers/list_transactions.html'
            })
            .when('/standinginstructions/history', {
                templateUrl: 'views/accounttransfers/standinginstructions_history.html'
            })
            .when('/createtemplate', {
                templateUrl: 'views/templates/createtemplate.html'
            })
            .when('/viewtemplate/:id', {
                templateUrl: 'views/templates/viewtemplate.html'
            })
            .when('/edittemplate/:id', {
                templateUrl: 'views/templates/edittemplate.html'
            })
            .when('/createloanproduct', {
                templateUrl: 'views/products/createloanproduct.html'
            })
            .when('/editloanproduct/:id', {
                templateUrl: 'views/products/editloanproduct.html'
            })
            .when('/loanproducts/:id/:action', {
                templateUrl: 'views/products/editloanproduct.html'
            })
            .when('/createsavingproduct', {
                templateUrl: 'views/products/createsavingproduct.html'
            })
            .when('/editsavingproduct/:id', {
                templateUrl: 'views/products/editsavingproduct.html'
            })
            .when('/savingproducts/:id/:action', {
                templateUrl: 'views/products/editsavingproduct.html'
            })
            .when('/admin/viewrole/:id', {
                templateUrl: 'views/administration/viewrole.html'
            })
            .when('/admin/roles', {
                templateUrl: 'views/administration/roles.html'
            })
            .when('/admin/addrole', {
                templateUrl: 'views/administration/addrole.html'
            })
            .when('/admin/viewmctasks', {
                templateUrl: 'views/administration/makerchecker.html'
            })
            .when('/admin/users', {
                templateUrl: 'views/administration/users.html'
            })
            .when('/clients', {
                templateUrl: 'views/clients/clients.html'
            })
            .when('/createclient', {
                templateUrl: 'views/clients/createnewclient.html'
            })
            .when('/clientcreation', {
                templateUrl: 'views/clients/createclient.html'
            })
            .when('/editclient/:id', {
                templateUrl: 'views/clients/editclient.html'
            })
            .when('/viewclient/:id', {
                templateUrl: 'views/clients/viewclient.html'
            })
            .when('/viewclient/:id/addcharge', {
                templateUrl: 'views/clients/addnewclientcharge.html'
            })
            .when('/viewclient/:id/paycharge/:chargeid', {
                templateUrl: 'views/clients/payclientcharge.html'
            })
            .when('/viewclient/:clientId/charges/:chargeId', {
                templateUrl: 'views/clients/viewclientcharge.html'
            })
            .when('/viewclient/:clientId/recurringcharges/:recurringChargeId', {
                templateUrl: 'views/clients/viewclientrecurringcharge.html'
            })
            .when('/viewclient/:id/chargeoverview', {
                templateUrl: 'views/clients/clientchargeoverview.html'
            })
            .when('/viewclient/:id/:loanApplicationReferenceId', {
                templateUrl: 'views/clients/viewclient.html'
            })
            .when('/clientscreenreport/:clientId', {
                templateUrl: 'views/clients/clientscreenreport.html'
            })
            .when('/client/:id/:action', {
                templateUrl: 'views/clients/clientactions.html'
            })
            .when('/client/:id/:action/:loanApplicationReferenceId', {
                templateUrl: 'views/clients/clientactions.html'
            })
            .when('/transferclient/:id', {
                templateUrl: 'views/clients/transferclient.html'
            })
            .when('/addclientdocument/:clientId', {
                templateUrl: 'views/clients/addclientdocument.html'
            })
            .when('/clientclosedloanaccount/:clientId', {
                templateUrl: 'views/clients/clientclosedloanaccount.html'
            })
            .when('/clientclosedsavingaccount/:clientId', {
                templateUrl: 'views/clients/clientclosedsavingaccount.html'
            })
            .when('/addclientidentifier/:clientId', {
                templateUrl: 'views/clients/addclientidentifier.html'
            })
            .when('/clients/:clientId/identifiers/:id', {
                templateUrl: 'views/clients/editclientidentifier.html'
            })
            .when('/addclientidentifierdocument/:clientId/:resourceId', {
                templateUrl: 'views/clients/addclientidentifierdocument.html'
            })
            .when('/survey/:clientId', {
                templateUrl: 'views/clients/survey.html'
            })
            .when('/addclientaddress/:officeId/:clientId', {
                templateUrl: 'views/clients/addclientaddress.html'
            })
            .when('/editaddress/:clientId/:addressId', {
                templateUrl: 'views/clients/editclientaddress.html'
            })
            .when('/newloanapplicationreference/:clientId', {
                templateUrl: 'views/loans/newloanapplicationreference.html'
            })
            .when('/viewloanapplicationreference/:loanApplicationReferenceId', {
                templateUrl: 'views/loans/viewloanapplicationreference.html'
            })
            .when('/updateloanapplicationreference/:loanApplicationReferenceId', {
                templateUrl: 'views/loans/updateloanapplicationreference.html'
            })
            .when('/managecoapplicants/:loanApplicationReferenceId', {
                templateUrl: 'views/loans/managecoapplicants.html'
            })
            .when('/approveloanapplicationreference/:loanApplicationReferenceId', {
                templateUrl: 'views/loans/approveloanapplicationreference.html'
            })
            .when('/creditbureaureport/:loanApplicationReferenceId/:clientId', {
                templateUrl: 'views/loans/creditbureaureport.html'
            })
            .when('/creditbureaureport/:entityType/:entityId/:clientId', {
                templateUrl: 'views/loans/creditbureaureport.html'
            })
            .when('/creditbureaureport/:entityType/:entityId/:trancheDisbursalId/:clientId', {
                templateUrl: 'views/loans/creditbureaureport.html'
            })
            .when('/disburseloanapplicationreference/:loanApplicationReferenceId', {
                templateUrl: 'views/loans/disburseloanapplicationreference.html'
            })
            .when('/newclientloanaccount/:clientId', {
                templateUrl: 'views/loans/newloanaccount.html'
            })
            .when('/newgrouploanaccount/:groupId', {
                templateUrl: 'views/loans/newloanaccount.html'
            })
            .when('/newindividualjlgloanapplicationreference/:groupId/:clientId', {
                templateUrl: 'views/loans/newloanapplicationreference.html'
            })
            .when('/newindividualjlgloanaccount/:groupId/:clientId', {
                templateUrl: 'views/loans/newloanaccount.html'
            })
            .when('/newjlgloanaccount/:groupId', {
                templateUrl: 'views/loans/newjlgloanaccount.html'
            })
            .when('/viewloanaccount/:id', {
                templateUrl: 'views/loans/viewloanaccountdetails.html'
            })
            .when('/adjustrepaymentschedule/:accountId', {
                templateUrl: 'views/loans/AdjustRepaymentSchdule.html'
            })
            .when('/loanaccount/:id/:action', {
                templateUrl: 'views/loans/loanaccountactions.html'
            })
            .when('/loanaccount/:id/:action/type/:type', {
                templateUrl: 'views/loans/loanaccountactions.html'
            })
            .when('/loanaccountcharge/:id/:action/:chargeId', {
                templateUrl: 'views/loans/loanaccountactions.html'
            })
            .when('/loandisbursedetail/:id/:action/:disbursementId', {
                templateUrl: 'views/loans/loanaccountactions.html'
            })
            .when('/loandisbursedetail/:id/:action', {
                templateUrl: 'views/loans/loanaccountactions.html'
            })
            .when('/editloanaccount/:id', {
                templateUrl: 'views/loans/editloanaccount.html'
            })
            .when('/loanscreenreport/:loanId', {
                templateUrl: 'views/loans/loanscreenreport.html'
            })
            .when('/addloancharge/:id', {
                templateUrl: 'views/loans/addloancharge.html'
            })
            .when('/addcollateral/:id', {
                templateUrl: 'views/loans/addloancollateral.html'
            })
            .when('/loan/:loanId/editcollateral/:id', {
                templateUrl: 'views/loans/editloancollateral.html'
            })
            .when('/loan/:loanId/viewcollateral/:id', {
                templateUrl: 'views/loans/viewloancollateral.html'
            })
            .when('/loan/:loanId/viewcharge/:id', {
                templateUrl: 'views/loans/viewloancharge.html'
            })
            .when('/loan/:loanId/editcharge/:id', {
                templateUrl: 'views/loans/editloancharge.html'
            })
            .when('/assignloanofficer/:id', {
                templateUrl: 'views/loans/assignloanofficer.html'
            })
            .when('/addloandocument/:loanId', {
                templateUrl: 'views/loans/addloandocument.html'
            })
            .when('/mandate/:loanId/:command/:mandateId', {
                templateUrl: 'views/loans/mandate.html'
            })
            .when('/mandate/:loanId/:command', {
                templateUrl: 'views/loans/mandate.html'
            })
            .when('/mandates', {
                templateUrl: 'views/system/mandates.html'
            })
            .when('/viewmandates', {
                templateUrl: 'views/system/viewmandates.html'
            })
            .when('/viewmandatessummary', {
                templateUrl: 'views/system/viewmandatessummary.html'
            })
            .when('/downloadmandates', {
                templateUrl: 'views/system/downloadmandates.html'
            })
            .when('/uploadmandates', {
                templateUrl: 'views/system/uploadmandates.html'
            })
            .when('/downloadtransactions', {
                templateUrl: 'views/system/downloadtransactions.html'
            })
            .when('/uploadtransactions', {
                templateUrl: 'views/system/uploadtransactions.html'
            })
            .when('/viewloantrxn/:accountId/trxnId/:id', {
                templateUrl: 'views/loans/view_loan_transaction.html'
            })
            .when('/viewclientchargetrxn/:clientId/transactionId/:transactionId', {
                templateUrl: 'views/clients/view_client_charge_transaction.html'
            })
            .when('/organization', {
                templateUrl: 'views/administration/organization.html'
            })
            .when('/system', {
                templateUrl: 'views/administration/system.html'
            })
            .when('/notification/management', {
                templateUrl: 'views/notification/notificationmanagement.html'
            })
            .when('/notification/configuration', {
                templateUrl: 'views/notification/notificationconfiguration.html'
            })
            .when('/notification/configuration/create', {
                templateUrl: 'views/notification/createnotificationconfiguration.html'
            })
            .when('/notification/configuration/modify/:notificationConfigId', {
                templateUrl: 'views/notification/updatenotificationconfiguration.html'
            })
            .when('/notification/configuration/:id',{
                templateUrl: 'views/notification/viewnotificationconfigurationdetails.html'
            })
            .when('/notification/configuration/:notificationConfigId/campaign',{
                templateUrl: 'views/notification/createnotificationcampaign.html'
            })
            .when('/notification/configuration/:notificationConfigId/campaign/:id',{
                templateUrl: 'views/notification/viewnotificationcampaignndetails.html'
            })
            .when('/notification/configuration/:notificationConfigId/campaign/:id/modify',{
                templateUrl: 'views/notification/updatenotificationcampaign.html'
            })
            .when('/notification/configuration/:notificationConfigId/eventmapping', {
                templateUrl: 'views/notification/createnotificationeventmapping.html'
            })
            .when('/notification/configuration/:notificationConfigId/editeventmapping/:eventId', {
                templateUrl: 'views/notification/editnotificationeventmapping.html'
            })
            .when('/notification/configuration/:notificationConfigId/jobmapping', {
                templateUrl: 'views/notification/createnotificationjobmapping.html'
            })
            .when('/notification/configuration/:notificationConfigId/editjobmapping/:jobId', {
                templateUrl: 'views/notification/editnotificationjobmapping.html'
            })  
            .when('/bulkoperations', {
                templateUrl: 'views/bulkoperations/bulkoperations.html'
            })
            .when('/loanproducts', {
                templateUrl: 'views/products/loanproducts.html'
            })
            .when('/charges', {
                templateUrl: 'views/products/charges.html'
            })
            .when('/viewcharge/:id', {
                templateUrl: 'views/products/viewcharge.html'
            })
            .when('/floatingrates', {
                templateUrl: 'views/products/floatingrates/FloatingRates.html'
            })
            .when('/createfloatingrate', {
                templateUrl: 'views/products/floatingrates/CreateFloatingRate.html'
            })
            .when('/viewfloatingrate/:floatingRateId', {
                templateUrl: 'views/products/floatingrates/ViewFloatingRate.html'
            })
            .when('/editfloatingrate/:floatingRateId', {
                templateUrl: 'views/products/floatingrates/EditFloatingRate.html'
            })

            .when('/savingproducts', {
                templateUrl: 'views/products/savingproducts.html'
            })
            .when('/shareproducts', {
                templateUrl: 'views/products/shareproducts.html'
            })
            .when('/createshareproduct', {
                templateUrl: 'views/products/createshareproduct.html'
            })
            .when('/editshareproduct/:id', {
                templateUrl: 'views/products/editshareproduct.html'
            })
            .when('/viewshareproduct/:id', {
                templateUrl: 'views/products/viewshareproduct.html'
            })
            .when('/viewsavingproduct/:id', {
                templateUrl: 'views/products/viewsavingproduct.html'
            })
            .when('/fixeddepositproducts', {
                templateUrl: 'views/products/fixeddepositproducts.html'
            })
            .when('/viewfixeddepositproduct/:productId', {
                templateUrl: 'views/products/viewfixeddepositproduct.html'
            })
            .when('/createfixeddepositproduct', {
                templateUrl: 'views/products/createfixeddepositproduct.html'
            })
            .when('/editfixeddepositproduct/:productId', {
                templateUrl: 'views/products/editfixeddepositproduct.html'
            })
            .when('/fixeddepositproducts/:productId/:action', {
                templateUrl: 'views/products/editfixeddepositproduct.html'
            })
            .when('/recurringdepositproducts', {
                templateUrl: 'views/products/recurringdepositproducts.html'
            })
            .when('/viewrecurringdepositproduct/:productId', {
                templateUrl: 'views/products/viewrecurringdepositproduct.html'
            })
            .when('/createrecurringdepositproduct', {
                templateUrl: 'views/products/createrecurringdepositproduct.html'
            })
            .when('/editrecurringdepositproduct/:productId', {
                templateUrl: 'views/products/editrecurringdepositproduct.html'
            })
            .when('/recurringdepositproducts/:productId/:action', {
                templateUrl: 'views/products/editrecurringdepositproduct.html'
            })
            .when('/createinterestratechart/:productId/:productName/:productType', {
                templateUrl: 'views/products/createinterestratechart.html'
            })
            .when('/interestratecharts/:productId/:productName/:productType', {
                templateUrl: 'views/products/interestratecharts.html'
            })
            .when('/editinterestratecharts/:chartId/:productId/:productName/:productType', {
                templateUrl: 'views/products/editinterestratechart.html'
            })
            .when('/offices', {
                templateUrl: 'views/organization/offices.html'
            })
            .when('/createoffice', {
                templateUrl: 'views/organization/createoffice.html'
            })
            .when('/viewoffice/:id', {
                templateUrl: 'views/organization/viewoffice.html'
            })
            .when('/editoffice/:id', {
                templateUrl: 'views/organization/editoffice.html'
            })
            .when('/tasks', {
                templateUrl: 'views/tasks.html'
            })
            .when('/currconfig', {
                templateUrl: 'views/organization/currencyconfig.html'
            })
            .when('/search/:query', {
                templateUrl: 'views/search/glresults.html'
            })
            .when('/viewloanproduct/:id', {
                templateUrl: 'views/products/viewloanproduct.html'
            })
            .when('/usersetting', {
                templateUrl: 'views/administration/usersettings.html'
            })
            .when('/users/', {
                templateUrl: 'views/administration/userslist.html'
            })
            .when('/createuser/', {
                templateUrl: 'views/administration/createuser.html'
            })
            .when('/viewuser/:id', {
                templateUrl: 'views/administration/viewuser.html'
            })
            .when('/edituser/:id', {
                templateUrl: 'views/administration/edituser.html'
            })
            .when('/employees', {
                templateUrl: 'views/organization/employees.html'
            })
            .when('/viewemployee/:id', {
                templateUrl: 'views/organization/viewemployee.html'
            })
            .when('/editemployee/:id', {
                templateUrl: 'views/organization/editemployee.html'
            })
            .when('/createemployee/', {
                templateUrl: 'views/organization/createemployee.html'
            })
            .when('/managefunds/', {
                templateUrl: 'views/organization/funds/managefunds.html'
            })
            .when('/nav/offices', {
                templateUrl: 'views/navigation/offices.html'
            })
            .when('/accounting', {
                templateUrl: 'views/accounting/accounting.html'
            })
            .when('/accounting_coa', {
                templateUrl: 'views/accounting/accounting_coa.html'
            })
            .when('/createglaccount', {
                templateUrl: 'views/accounting/createglaccounting.html'
            })
            .when('/viewglaccount/:id', {
                templateUrl: 'views/accounting/viewglaccounting.html'
            })
            .when('/editglaccount/:id', {
                templateUrl: 'views/accounting/editglaccounting.html'
            })
            .when('/freqposting', {
                templateUrl: 'views/accounting/freqposting.html'
            })
            .when('/viewtransactions/:transactionId', {
                templateUrl: 'views/accounting/view_transactions.html'
            })
            .when('/journalentry/:transactionId', {
                templateUrl: 'views/accounting/journalentry_posting.html'
            })
            .when('/journalentry/:transactionId/:resourceId', {
                templateUrl: 'views/accounting/journalentry_posting.html'
            })
            .when('/journalentry', {
                templateUrl: 'views/accounting/journalentry_posting.html'
            })
            .when('/searchtransaction', {
                templateUrl: 'views/accounting/search_transaction.html'
            })
            .when('/accounts_closure', {
                templateUrl: 'views/accounting/accounts_closure.html'
            })
            .when('/view_close_accounting/:id', {
                templateUrl: 'views/accounting/view_close_accounting.html'
            })
            .when('/accounting_rules', {
                templateUrl: 'views/accounting/accounting_rules.html'
            })
            .when('/viewaccrule/:id', {
                templateUrl: 'views/accounting/view_acc_rule.html'
            })
            .when('/add_accrule', {
                templateUrl: 'views/accounting/add_acc_rule.html'
            })
            .when('/editaccrule/:id', {
                templateUrl: 'views/accounting/edit_acc_rule.html'
            })
            .when('/run_periodic_accrual',{
                templateUrl: 'views/accounting/periodic_accrual_accounting.html'
            })
            .when('/openingbalances',{
                templateUrl: 'views/accounting/openingbalances.html'
            })
            .when('/viewprovisioningentries',{
                templateUrl: 'views/accounting/provisioning/ProvisioningEntries.html'
            })
            .when('/createprovisioningentries',{
                templateUrl: 'views/accounting/provisioning/CreateProvisioningEntries.html'
            })
            .when('/viewprovisioningentry/:entryId',{
                templateUrl: 'views/accounting/provisioning/ViewProvisioningEntry.html'
            })
            .when('/viewprovisioningjournalentry/:entryId',{
                templateUrl: 'views/accounting/provisioning/ViewProvisioningJournalEntries.html'
            })
            .when('/viewcode/:id', {
                templateUrl: 'views/system/viewcode.html'
            })
            .when('/datatables', {
                templateUrl: 'views/system/datatables.html'
            })           
            .when('/viewdatatable/:tableName', {
                templateUrl: 'views/system/viewdatatable.html'
            })
            .when('/createdatatable', {
                templateUrl: 'views/system/createdatatable.html'
            })
            .when('/editdatatable/:tableName', {
                templateUrl: 'views/system/editdatatable.html'
            })
            .when('/makedatatableentry/:tableName/:entityId', {
                templateUrl: 'views/system/makedatatableentry.html'
            })
            .when('/viewdatatableentry/:tableName/:entityId/:resourceId', {
                templateUrl: 'views/system/viewdatatableentry.html'
            })
            .when('/viewsingledatatableentry/:tableName/:entityId', {
                templateUrl: 'views/system/viewdatatableentry.html'
            })
            .when('/addcode', {
                templateUrl: 'views/system/addcode.html'
            })
            .when('/jobs', {
                templateUrl: 'views/system/schedulerjobs.html'
            })
            .when('/viewschedulerjob/:id', {
                templateUrl: 'views/system/viewschedulerjob.html'
            })
            .when('/editschedulerjob/:id', {
                templateUrl: 'views/system/editschedulerjob.html'
            })
            .when('/viewhistory/:id', {
                templateUrl: 'views/system/viewschedulerjobhistory.html'
            })
            .when('/codes', {
                templateUrl: 'views/system/codes.html'
            })
            .when('/editcode/:id', {
                templateUrl: 'views/system/editcode.html'
            })
            .when('/hooks', {
                templateUrl: 'views/system/hooks.html'
            })
            .when('/viewhook/:id', {
                templateUrl: 'views/system/viewhook.html'
            })
            .when('/addhook', {
                templateUrl: 'views/system/addhook.html'
            })
            .when('/edithook/:id', {
                templateUrl: 'views/system/edithook.html'
            })
            .when('/entitytoentitymapping', {
                templateUrl: 'views/system/entitytoentitymapping.html'
            })
            .when('/managereports', {
                templateUrl: 'views/system/reports.html'
            })
            .when('/system/viewreport/:id', {
                templateUrl: 'views/system/viewreport.html'
            })
            .when('/createreport', {
                templateUrl: 'views/system/createreport.html'
            })
            .when('/editreport/:id', {
                templateUrl: 'views/system/editreport.html'
            })
            .when('/accountnumberpreferences', {
                templateUrl: 'views/system/accountnumberpreferences.html'
            })
            .when('/addaccountnumberpreferences', {
                templateUrl: 'views/system/addaccountnumberpreferences.html'
            })
            .when('/viewaccountnumberpreferences/:id', {
                templateUrl: 'views/system/viewaccountnumberpreferences.html'
            })
            .when('/editaccountnumberpreferences/:id', {
                templateUrl: 'views/system/editaccountnumberpreferences.html'
            })
            .when('/holidays', {
                templateUrl: 'views/organization/holidays.html'
            })
            .when('/createholiday', {
                templateUrl: 'views/organization/createholiday.html'
            })
            .when('/viewholiday/:id', {
                templateUrl: 'views/organization/viewholiday.html'
            })
            .when('/editholiday/:id', {
                templateUrl: 'views/organization/editholiday.html'
            })
            .when('/workingdays', {
                templateUrl: 'views/organization/workingdays.html'
            })
            .when('/passwordpreferences', {
                templateUrl: 'views/organization/passwordpreferences.html'
            })
            .when('/viewpaymenttype/', {
                templateUrl: 'views/organization/viewpaymenttype.html'
            })
            .when('/createpaymenttype/', {
                templateUrl: 'views/organization/createpaymenttype.html'
            })
            .when('/editpaymenttype/:id', {
                templateUrl: 'views/organization/editpaymenttype.html'
            })
            .when('/reports/', {
                templateUrl: 'views/reports/view_reports.html'
            })
            .when('/run_report/:name', {
                templateUrl: 'views/reports/run_reports.html'
            })
            .when('/xbrl', {
                templateUrl: 'views/reports/xbrl.html'
            })
            .when('/xbrlreport', {
                templateUrl: 'views/reports/xbrlreport.html'
            })
            .when('/new_client_saving_application/:clientId', {
                templateUrl: 'views/savings/new_saving_account_application.html'
            })
            .when('/new_group_saving_application/:groupId', {
                templateUrl: 'views/savings/new_saving_account_application.html'
            })
            .when('/new_group_saving_application/:groupId/:centerEntity', {
                templateUrl: 'views/savings/new_saving_account_application.html'
            })
            .when('/new_jlg_saving_application/:groupId/:clientId', {
                templateUrl: 'views/savings/new_saving_account_application.html'
            })
            .when('/viewsavingaccount/:id', {
                templateUrl: 'views/savings/view_saving_account_details.html'
            })
            .when('/savings/:savingId/viewcharge/:id', {
                templateUrl: 'views/savings/viewsavingscharge.html'
            })
            .when('/viewonholdtransactions/:savingsId/:fromPath/:fromPathId', {
                templateUrl: 'views/savings/list_onhold_transactions.html'
            })
            .when('/groups', {
                templateUrl: 'views/groups/groups.html'
            })
            .when('/creategroup', {
                templateUrl: 'views/groups/creategroup.html'
            })
            .when('/attachmeeting/:id/:entityType', {
                templateUrl: 'views/groups/attachmeeting.html'
            })
            .when('/editcalendarbasedonmeetingdates/:entityType/:groupOrCenterId/:calendarId', {
                templateUrl: 'views/groups/editmeeting_based_on_meeting_date.html'
            })
            .when('/editcalendar/:entityType/:groupOrCenterId/:calendarId', {
                templateUrl: 'views/groups/editmeeting.html'
            })
            .when('/editsavingaccount/:id', {
                templateUrl: 'views/savings/edit_saving_account_application.html'
            })
            .when('/savingaccount/:id/:action', {
                templateUrl: 'views/savings/saving_account_actions.html'
            })
            .when('/savingaccount/:id/:action/:amount', {
                templateUrl: 'views/savings/saving_account_actions.html'
            })
            .when('/savingaccountcharge/:id/:action/:chargeId', {
                templateUrl: 'views/savings/saving_account_actions.html'
            })
            .when('/savingaccounts/:id/charges', {
                templateUrl: 'views/savings/addnewsavingscharge.html'
            })
            .when('/viewaccounttransfers/:id', {
                templateUrl: 'views/accounttransfers/view_accounttransfer.html'
            })
            .when('/accounttransfers/:accountType/:accountId', {
                templateUrl: 'views/accounttransfers/make_accounttransfer.html'
            })
            .when('/viewsavingtrxn/:accountId/trxnId/:id', {
                templateUrl: 'views/savings/view_saving_transaction.html'
            })
            .when('/newclientfixeddepositaccount/:clientId', {
                templateUrl: 'views/deposits/fixed/newapplication.html'
            })
            .when('/viewfixeddepositaccount/:id', {
                templateUrl: 'views/deposits/fixed/viewaccountdetails.html'
            })
            .when('/editfixeddepositaccount/:id', {
                templateUrl: 'views/deposits/fixed/edit_account_application.html'
            })
            .when('/fixeddepositaccount/:id/charges', {
                templateUrl: 'views/deposits/fixed/add_new_fixed_deposit_charge.html'
            })
            .when('/fixeddepositaccount/:id/:action', {
                templateUrl: 'views/deposits/fixed/fixed_deposit_account_actions.html'
            })
            .when('/fixeddepositaccountcharge/:id/:action/:chargeId', {
                templateUrl: 'views/deposits/fixed/fixed_deposit_account_actions.html'
            })
            .when('/viewfixeddepositaccounttrxn/:accountId/:transactionId', {
                templateUrl: 'views/deposits/fixed/view_fixed_deposit_transaction.html'
            })
            .when('/newclientrecurringdepositaccount/:clientId', {
                templateUrl: 'views/deposits/recurring/newapplication.html'
            })
            .when('/viewrecurringdepositaccount/:id', {
                templateUrl: 'views/deposits/recurring/viewaccountdetails.html'
            })
            .when('/editrecurringdepositaccount/:id', {
                templateUrl: 'views/deposits/recurring/edit_account_application.html'
            })
            .when('/recurringdepositaccount/:id/charges', {
                templateUrl: 'views/deposits/recurring/add_new_recurring_deposit_charge.html'
            })
            .when('/recurringdepositaccount/:id/:action', {
                templateUrl: 'views/deposits/recurring/recurring_deposit_account_actions.html'
            })
            .when('/recurringdepositaccountcharge/:id/:action/:chargeId', {
                templateUrl: 'views/deposits/recurring/recurring_deposit_account_actions.html'
            })
            .when('/viewrecurringdepositaccounttrxn/:accountId/:transactionId', {
                templateUrl: 'views/deposits/recurring/view_recurring_deposit_transaction.html'
            })
            .when('/viewgroup/:id', {
                templateUrl: 'views/groups/viewgroup.html'
            })
            .when('/editgroup/:id', {
                templateUrl: 'views/groups/editgroup.html'
            })
            .when('/addmember', {
                templateUrl: 'views/clients/createnewclient.html'
            })
            .when('/groupattendance', {
                templateUrl: 'views/groups/groupattendance.html'
            })
            .when('/closegroup/:id', {
                templateUrl: 'views/groups/closegroup.html'
            })
            .when('/groupclosedloanaccount/:groupId', {
                templateUrl: 'views/groups/groupclosedloanaccount.html'
            })
            .when('/groupclosedsavingaccount/:groupId', {
                templateUrl: 'views/groups/groupclosedsavingaccount.html'
            })
            .when('/addrole/:id', {
                templateUrl: 'views/groups/addrole.html'
            })
            .when('/membermanage/:id', {
                templateUrl: 'views/groups/membermanage.html'
            })
            .when('/transferclients/:id', {
                templateUrl: 'views/groups/transferclients.html'
            })
            .when('/centers', {
                templateUrl: 'views/centers/centers.html'
            })
            .when('/viewcenter/:id', {
                templateUrl: 'views/centers/viewcenter.html'
            })
            .when('/jlgsavingAccountcenterby/:centerId', {
                templateUrl: 'views/savings/jlgsavingAccountcenterby.html'
            })
            .when('/jlgsavingsAccountgroupby/:groupId', {
                templateUrl: 'views/savings/jlgsavingsAccountgroupby.html'
            })
            .when('/createcenter', {
                templateUrl: 'views/centers/createcenter.html'
            })
            .when('/editcenter/:id', {
                templateUrl: 'views/centers/editcenter.html'
            })
            .when('/closecenter/:id', {
                templateUrl: 'views/centers/closecenter.html'
            })
            .when('/managegroupmembers/:id', {
                templateUrl: 'views/centers/managegroupmembers.html'
            })
            .when('/addgroup', {
                templateUrl: 'views/groups/creategroup.html'
            })
            .when('/centerattendance', {
                templateUrl: 'views/centers/centerattendance.html'
            })
            .when('/bulkundotransactions/:centerId', {
                templateUrl: 'views/centers/bulkundotransactions.html'
            })
            .when('/villages', {
                templateUrl: 'views/villages/villages.html'
            })
            .when('/viewvillage/:id', {
                templateUrl: 'views/villages/viewvillage.html'
            })
            .when('/createvillage', {
                templateUrl: 'views/villages/createvillage.html'
            })
            .when('/addvillageAddress/:id', {
                templateUrl: 'views/villages/addvillageaddress.html'
            })
            .when('/editvillage/:id', {
                templateUrl: 'views/villages/editvillage.html'
            })
            .when('/editvillageaddress/:id/:addressId', {
                templateUrl: 'views/villages/editvillageaddress.html'
            })
            .when('/createcharge', {
                templateUrl: 'views/products/createcharge.html'
            })
            .when('/editcharge/:id', {
                templateUrl: 'views/products/editcharge.html'
            })
            .when('/charges/:id/:action', {
                templateUrl: 'views/products/editcharge.html'
            })
            .when('/productivesheet/:officeId/:officeName/:meetingDate/:staffId', {
                templateUrl: 'views/collection/productivecollectionsheet.html'
            })
            .when('/entercollectionsheet', {
                templateUrl: 'views/collection/collectionsheet.html'
            })
            .when('/individualcollectionsheet', {
                templateUrl: 'views/collection/individualcollectionsheet.html'
            })
            .when('/assignstaff/:id/:entityType', {
                templateUrl: 'views/groups/assignstaff.html'
            })
            .when('/global', {
                templateUrl: 'views/administration/global.html'
            })
            .when('/configurations/:configId/editconfig', {
                templateUrl: 'views/administration/editGlobalConfiguration.html'
            })
            .when('/productmix', {
                templateUrl: 'views/products/productmix/productmix.html'
            })
            .when('/viewproductmix/:id', {
                templateUrl: 'views/products/productmix/viewproductmix.html'
            })
            .when('/editproductmix/:id', {
                templateUrl: 'views/products/productmix/editproductmix.html'
            })
            .when('/addproductmix', {
                templateUrl: 'views/products/productmix/addproductmix.html'
            })
            .when('/bulkloan', {
                templateUrl: 'views/organization/bulkloan.html'
            })
             .when('/bulkLoanReschedule', {
                templateUrl: 'views/organization/bulkloanreschedule.html'
            })
            .when('/audit', {
                templateUrl: 'views/system/audit.html'
            })
            .when('/viewaudit/:id', {
                templateUrl: 'views/system/viewaudit.html'
            })
            .when('/createclosure', {
                templateUrl: 'views/accounting/createclosure.html'
            })
            .when('/guarantor/:id', {
                templateUrl: 'views/loans/guarantor.html'
            })
            .when('/listguarantors/:id', {
                templateUrl: 'views/loans/list_guarantor.html'
            })
            .when('/viewcheckerinbox/:id', {
                templateUrl: 'views/system/viewcheckerinbox.html'
            })
            .when('/editguarantor/:id/:loanId', {
                templateUrl: 'views/loans/editguarantor.html'
            })
            .when('/viewguarantortransactions/:savingsId/:fundingId/:fromPath/:fromPathId', {
                templateUrl: 'views/savings/list_onhold_transactions.html'
            })
            .when('/expertsearch', {
                templateUrl: 'views/expertsearch.html'
            })
            .when('/profile', {
                templateUrl: 'views/profile.html'
            })
            .when('/viewMakerCheckerTask/:commandId', {
                templateUrl: 'views/system/viewMakerCheckerTask.html'
            })
            .when('/help', {
                templateUrl: 'views/help.html'
            })
            .when('/checkeractionperformed', {
                templateUrl: 'views/system/checkerActionPerformed.html'
            })
            .when('/advsearch', {
                templateUrl: 'views/search/advsearch.html'
            })
            .when('/editfinancialactivitymapping/:mappingId', {
                templateUrl: 'views/accounting/edit_financial_activity_mapping.html'
            })
            .when('/viewfinancialactivitymapping/:mappingId', {
                templateUrl: 'views/accounting/view_financial_activity.html'
            })
            .when('/financialactivityaccountmappings', {
                templateUrl: 'views/accounting/financial_accounting_mapping.html'
            })
            .when('/addfinancialmapping', {
                templateUrl: 'views/accounting/add_financial_accounting_mapping.html'
            })
            .when('/assignsavingsofficer/:id', {
                templateUrl: 'views/savings/assignsavingsofficer.html'
            })
            .when('/unassignsavingsofficer/:id', {
                templateUrl: 'views/savings/unassignsavingsofficer.html'
            })
            .when('/tellers', {
                templateUrl: 'views/organization/cashmgmt/tellers.html'
            })
            .when('/createTeller', {
                templateUrl: 'views/organization/cashmgmt/createTeller.html'
            })
            .when('/viewtellers/:id', {
                templateUrl: 'views/organization/cashmgmt/viewTeller.html'
            })
            .when('/tellers/:tellerId/cashiers', {
                templateUrl: 'views/organization/cashmgmt/cashiersForTeller.html'
            })
            .when('/tellers/:tellerId/cashiers/:cashierId', {
                templateUrl: 'views/organization/cashmgmt/viewCashiersForTeller.html'
            })
            .when('/tellers/:tellerId/cashiers/:cashierId/txns/:currencyCode', {
                templateUrl: 'views/organization/cashmgmt/cashierTransactions.html'
            })
            .when('/tellers/:tellerId/cashiers/:cashierId/actions/:action', {
                templateUrl: 'views/organization/cashmgmt/cashierFundsAllocationSettlement.html'
            })
            .when('/tellers/:tellerId/cashiers/:cashierId/settle', {
                templateUrl: 'views/organization/cashmgmt/cashierFundsAllocationSettlement.html'
            })
            .when('/tellers/:tellerId/createCashierForTeller', {
                templateUrl: 'views/organization/cashmgmt/createCashier.html'
            })
            .when('/editteller/:id', {
                templateUrl: 'views/organization/cashmgmt/editTeller.html'
            })
            .when('/tellers/:tellerId/editcashier/:id', {
                templateUrl: 'views/organization/cashmgmt/editcashier.html'
            })
            .when('/externalservices', {
                templateUrl: 'views/administration/externalServices.html'
            })
            .when('/externalservices/:externalServicesType', {
                templateUrl: 'views/administration/viewExternalServicesConfiguration.html'
            })
            .when('/externalservices/:externalServicesType/editconfig', {
                templateUrl: 'views/administration/editExternalServicesConfiguration.html'
            })
            .when('/otherexternalservices/:serviceId', {
                templateUrl: 'views/administration/externalservices/viewOtherExternalServicesConfiguration.html'
            })
            .when('/otherexternalservices/:serviceId/editconfig', {
                templateUrl: 'views/administration/externalservices/editOtherExternalServicesConfiguration.html'
            })
            .when('/loans/:loanId/reschedule/', {
                templateUrl: 'views/loans/rescheduleloans.html'
            })
            .when('/loans/:loanId/viewreschedulerequest/:requestId', {
                templateUrl: 'views/loans/viewreschedulerequest.html'
            })
            .when('/loans/:loanId/approvereschedulerequest/:requestId', {
                templateUrl: 'views/loans/approveloanreschedule.html'
            })
            .when('/loans/:loanId/rejectreschedulerequest/:requestId', {
                templateUrl: 'views/loans/rejectloanreschedule.html'
            })
            .when('/loans/:loanId/previewloanrepaymentschedule/:requestId', {
                templateUrl: 'views/loans/previewloanrepaymentschedule.html'
            })
            .when('/viewallprovisionings', {
                templateUrl: 'views/organization/provisioning/ViewAllProvisioningCriteria.html'
            })
            .when('/createprovisioningcriteria', {
                templateUrl: 'views/organization/provisioning/CreateProvisioningCriteria.html'
            })
            .when('/viewprovisioningcriteria/:criteriaId', {
                templateUrl: 'views/organization/provisioning/ViewProvisioningCriteria.html'
            })
            .when('/editprovisioningcriteria/:criteriaId', {
                templateUrl: 'views/organization/provisioning/EditProvisioningCriteria.html'
            })
            .when('/collaterals', {
                templateUrl: 'views/collaterals/viewcollaterals.html'
            })
            .when('/createcollateral', {
                templateUrl: 'views/collaterals/createcollateral.html'
            })
            .when('/editcollateral/:collateralId', {
                templateUrl: 'views/collaterals/editcollateral.html'
            })
            .when('/viewcollateralqualitystandards/:collateralId', {
                templateUrl: 'views/collaterals/viewCollateralQualityStandards.html'
            })
            .when('/editcollateralqualitystandards/:collateralId/:qualityStandardId', {
                templateUrl: 'views/collaterals/editcollateralqualitystandards.html'
            })
            .when('/viewproductcollateralmapping/', {
                templateUrl: 'views/collaterals/viewProductCollateralMappings.html'
            })
            .when('/createproductcollateralmapping/', {
                templateUrl: 'views/collaterals/createProductCollateralMapping.html'
            })
            .when('/editproductcollateralmapping/:loanProductId/:productCollateralMappingId', {
                templateUrl: 'views/collaterals/editProductCollateralMapping.html'
            })
            .when('/searchpledge', {
                templateUrl: 'views/collaterals/searchpledge.html'
            })
            .when('/viewpledge/:pledgeId', {
                templateUrl: 'views/collaterals/viewpledge.html'
            })
            .when('/collateralvaluecalculator', {
                templateUrl: 'views/collaterals/collateralvaluecalculator.html'
            })
            .when('/collateralvaluecalculator/:clientId', {
                templateUrl: 'views/collaterals/collateralvaluecalculator.html'
            })
            .when('/attachpledgetoclient/:pledgeId', {
                templateUrl: 'views/collaterals/attachpledgetoexistingcustomer.html'
            })
            .when('/searchpledge', {
                templateUrl: 'views/collaterals/searchpledge.html'
            })
            .when('/viewpledge/:pledgeId', {
                templateUrl: 'views/collaterals/viewpledge.html'
            })
            .when('/createclient/:pledgeId', {
                templateUrl: 'views/clients/createnewclient.html'
            })
            .when('/editpledge/:pledgeId', {
                templateUrl: 'views/collaterals/editpledge.html'
            })
            .when('/taxconfiguration',{
                templateUrl: 'views/products/tax/TaxConfigurations.html'
            })
            .when('/createtaxcomponent', {
                templateUrl: 'views/products/tax/CreateTaxComponent.html'
            })
            .when('/taxcomponents', {
                templateUrl: 'views/products/tax/TaxComponents.html'
            })
            .when('/viewtaxcomponent/:taxComponentId', {
                templateUrl: 'views/products/tax/ViewTaxComponent.html'
            })
            .when('/edittaxcomponent/:taxComponentId', {
                templateUrl: 'views/products/tax/EditTaxComponent.html'
            })
            .when('/createtaxgroup', {
                templateUrl: 'views/products/tax/CreateTaxGroup.html'
            })
            .when('/taxgroups', {
                templateUrl: 'views/products/tax/TaxGroups.html'
            })
            .when('/viewtaxgroup/:taxGroupId', {
                templateUrl: 'views/products/tax/ViewTaxGroup.html'
            })
            .when('/edittaxgroup/:taxGroupId', {
                templateUrl: 'views/products/tax/EditTaxGroup.html'
            })
            .when('/createshareaccount/:clientId', {
                templateUrl: 'views/shares/createshareaccount.html'
            })
            .when('/viewshareaccount/:id', {
                templateUrl: 'views/shares/viewshareaccount.html'
            })
            .when('/editshareaccount/:accountId', {
                templateUrl: 'views/shares/editshareaccount.html'
            })
            .when('/shareaccount/:accountId/:action', {
                templateUrl: 'views/shares/shareaccountactions.html'
            })
            .when('/shareaccount/:accountId/purchasedshares/:purchasedSharesId/:action', {
                templateUrl: 'views/shares/shareaccountactions.html'
            })
            .when('/dividends/:productId/', {
                templateUrl: 'views/products/dividendlisting.html'
            })
            .when('/dividends/:productId/dividend/:dividendId/:status', {
                templateUrl: 'views/products/viewdividends.html'
            })
            .when('/shareproduct/:productId/:action', {
                templateUrl: 'views/products/shareproductactions.html'
            })
            .when('/shareproduct/:productId/:dividendId/:action', {
                templateUrl: 'views/products/shareproductactions.html'
            })
            .when('/:sendertype/:senderid/sms', {
                templateUrl: 'views/sms/sendsms.html'
            })
            .when('/smsconfiguration', {
                templateUrl: 'views/sms/smsconfiguration.html'
            })
            .when('/sms', {
                templateUrl: 'views/sms/tracksms.html'
            })
            .when('/bankstatements', {
                templateUrl: 'views/bankstatements/viewbankstatement.html'
            })
            .when('/bulkcollection', {
                templateUrl: 'views/bulkoperations/bulkportfoliotransactions.html'
            })
            .when('/bulkportfoliotransactions', {
                templateUrl: 'views/bulkoperations/bulkportfoliotransactions.html'
            })
            .when('/uploadbulkcollection', {
                templateUrl: 'views/bulkoperations/uploadbulkcollection.html'
            })
            .when('/bankstatementsdetails/:bankStatementId/viewportfoliotransactions', {
                templateUrl: 'views/bulkoperations/viewportfoliotransactions.html'
            }) 
            .when('/bankstatementsdetails/:bankStatementId/portfoliotransaction', {
                templateUrl: 'views/bankstatements/viewbankstatementdetails.html'
            })
            .when('/bankstatementsdetails/:bankStatementId/nonportfoliotransaction', {
                templateUrl: 'views/bankstatements/viewbankstatementdetailjournalentry.html'
            })
            .when('/bankstatementsdetails/:bankStatementId/miscellaneoustransaction', {
                templateUrl: '../views/bankstatements/viewmiscellaneousbankstatementdetails.html'
            })
            .when('/bankstatementsdetails/:bankStatementId/reconciledtransaction', {
                templateUrl: '../views/bankstatements/viewreconciledbankstatementdetails.html'
            })
            .when('/bankstatement/:bankStatementId/summary', {
                templateUrl: '../views/bankstatements/viewbankstatementsummary.html'
            })
            .when('/bankstatementsdetails/:bankStatementId/generateportfoliotransactions', {
                templateUrl: 'views/bankstatements/viewgenerateportfoliotransactions.html'
            })
            .when('/uploadbankstatements', {
                templateUrl: 'views/bankstatements/uploadbankstatement.html'
            })
            .when('/updatebankstatements/:bankStatementId', {
                templateUrl: 'views/bankstatements/updatebankstatement.html'
            })
            .when('/viewbank', {
                templateUrl: 'views/bankstatements/viewbank.html'
            })
            .when('/updatebank/:bankId', {
                templateUrl: 'views/bankstatements/updatebank.html'
            })
            .when('/createbank', {
                templateUrl: 'views/bankstatements/createbank.html'
            })
            .when('/loanforeclosure/:id', {
                templateUrl: 'views/loans/loanforeclosure.html'
            })
            .when('/viewtransactionauthentication',{
                templateUrl: 'views/products/viewtransactionauthentication.html'
            })
            .when('/edittransactionauthentication/:id',{
                templateUrl: 'views/products/edittransactionauthentication.html'
            })
            .when('/createtransactionauthentication', {
                templateUrl: 'views/products/createtransactionauthentication.html'
            })
            .when('/viewexternalauthenticationservices', {
                templateUrl: 'views/system/viewexternalauthenticationservices.html'
            })
            .when('/externalservicesCB/CreditBureau/addcb', {
                templateUrl: 'views/administration/addNewCreditBureau.html'
             })
            .when('/externalservicesCB/CreditBureau', {
                templateUrl: 'views/administration/CreditBureauSummary.html'
             })
            .when('/externalservicesCB/CreditBureau/mapcblp', {
                templateUrl: 'views/administration/MapCreditBureauToLP.html'
             })
            .when('/createcreditbureauloanproduct',{
                templateUrl:'views/products/createcreditbureauloanproduct.html'
            })
            .when('/editcreditbureauloanproduct/:loanProductId',{
                templateUrl:'views/products/editcreditbureauloanproduct.html'
            })
            .when('/viewcreditbureauloanproduct/:loanProductId',{
                templateUrl:'views/products/viewcreditbureauloanproduct.html'
            })
            .when('/creditbureauloanproducts', {
                templateUrl: 'views/products/creditbureauloanproducts.html'
            })
            .when('/riskrating', {
                templateUrl: 'views/organization/riskconfig/riskrating.html'
            })
            .when('/viewprofileratingconfigs', {
                templateUrl: 'views/organization/profilerating/viewprofileratingconfigs.html'
            })
            .when('/loanpurposegroups', {
                templateUrl: 'views/organization/riskconfig/loanpurposegroup.html'
            })
            .when('/createloanpurposegroup', {
                templateUrl: 'views/organization/riskconfig/createloanpurposegroup.html'
            })
            .when('/:entityType/editloanpurposegroup/:id', {
                templateUrl: 'views/organization/riskconfig/editloanpurposegroup.html'
            })
            .when('/viewloanpurposegroup/:id', {
                templateUrl: 'views/organization/riskconfig/viewloanpurposegroup.html'
            })
            .when('/loanpurpose', {
                templateUrl: 'views/organization/riskconfig/loanpurpose.html'
            })
            .when('/loanpurpose/:id', {
                templateUrl: 'views/organization/riskconfig/loanpurpose.html'
            })
            .when('/:entityType/createloanpurpose', {
                templateUrl: 'views/organization/riskconfig/createloanpurpose.html'
            })
            .when('/:entityType/:entityId/createloanpurpose', {
                templateUrl: 'views/organization/riskconfig/createloanpurpose.html'
            })
            .when('/viewloanpurpose/:id', {
                templateUrl: 'views/organization/riskconfig/viewloanpurpose.html'
            })
            .when('/editloanpurpose/:id', {
                templateUrl: 'views/organization/riskconfig/editloanpurpose.html'
            })
            .when('/:entityType/editloanpurpose/:id', {
                templateUrl: 'views/organization/riskconfig/editloanpurpose.html'
            })
            .when('/loanpurposeandtagging', {
                templateUrl: 'views/organization/riskconfig/loanpurposeandtagging.html'
            })
            .when('/occupationcatagory', {
                templateUrl: 'views/organization/riskconfig/occupationcatagory.html'
            })
            .when('/incomegeneratingasset', {
                templateUrl: 'views/organization/riskconfig/incomegeneratingasset.html'
            })
            .when('/createincomegeneratingasset', {
                templateUrl: 'views/organization/riskconfig/createincomegeneratingasset.html'
            })
            .when('/editincomegeneratingasset/:id', {
                templateUrl: 'views/organization/riskconfig/editincomegenerating.html'
            })
            .when('/:entityType/editincomegeneratingasset/:id', {
                templateUrl: 'views/organization/riskconfig/editincomegenerating.html'
            })
            .when('/viewincomegeneratingasset/:id', {
                templateUrl: 'views/organization/riskconfig/viewincomegenerating.html'
            })
            .when('/assets/:incomeGeneratingAssetId', {
                templateUrl: 'views/organization/riskconfig/asset.html'
            })
            .when('/:entityType/:entityId/assets/:assetId', {
                templateUrl: 'views/organization/riskconfig/asset.html'
            })
            .when('/:entityId/assets/:assetId', {
                templateUrl: 'views/organization/riskconfig/asset.html'
            })
            .when('/:entityType/createasset/:incomeGeneratingAssetId', {
                templateUrl: 'views/organization/riskconfig/addasset.html'
            })
            .when('/:entityType/:entityId/editasset/:assetId', {
                templateUrl: 'views/organization/riskconfig/editasset.html'
            })
            .when('/:entityType/editasset/:assetId', {
                templateUrl: 'views/organization/riskconfig/editasset.html'
            })
            .when('/:entityId/viewasset/:assetId', {
                templateUrl: 'views/organization/riskconfig/viewasset.html'
            })
            .when('/householdexpense', {
                templateUrl: 'views/organization/riskconfig/householdexpense.html'
            })
            .when('/addhouseholdexpense', {
                templateUrl: 'views/organization/riskconfig/addhouseholdexpense.html'
            })
            .when('/edithouseholdexpense/:id', {
                templateUrl: 'views/organization/riskconfig/edithouseholdexpense.html'
            })
            .when('/:entityType/edithouseholdexpense/:id', {
                templateUrl: 'views/organization/riskconfig/edithouseholdexpense.html'
            })
            .when('/viewhouseholdexpense/:id', {
                templateUrl: 'views/organization/riskconfig/viewhouseholdexpense.html'
            })
            .when('/risk/createfactor', {
                templateUrl: 'views/organization/riskconfig/createriskfactor.html'
            })
            .when('/risk/editfactor/:id', {
                templateUrl: 'views/organization/riskconfig/editriskfactor.html'
            })
            .when('/risk/factor/:id', {
                templateUrl: 'views/organization/riskconfig/viewriskfactor.html'
            })
            .when('/risk/factor', {
                templateUrl: 'views/organization/riskconfig/riskfactor.html'
            })
            .when('/risk/createdimension', {
                templateUrl: 'views/organization/riskconfig/createriskdimension.html'
            })
            .when('/risk/editdimension/:id', {
                templateUrl: 'views/organization/riskconfig/editriskdimension.html'
            })
            .when('/risk/dimension/:id', {
                templateUrl: 'views/organization/riskconfig/viewriskdimension.html'
            })
            .when('/risk/dimension', {
                templateUrl: 'views/organization/riskconfig/riskdimension.html'
            })
            .when('/risk/createcriteria', {
                templateUrl: 'views/organization/riskconfig/createriskcriteria.html'
            })
            .when('/risk/editcriteria/:id', {
                templateUrl: 'views/organization/riskconfig/editriskcriteria.html'
            })
            .when('/risk/criteria/:id', {
                templateUrl: 'views/organization/riskconfig/viewriskcriteria.html'
            })
            .when('/risk/criteria', {
                templateUrl: 'views/organization/riskconfig/riskcriteria.html'
            })
            .when('/loanproduct/createeligibility', {
                templateUrl: 'views/organization/riskconfig/createloanproducteligibility.html'
            })
            .when('/loanproduct/:id/vieweligibility', {
                templateUrl: 'views/organization/riskconfig/viewloanproducteligibility.html'
            })
            .when('/loanproduct/listeligibility', {
                templateUrl: 'views/organization/riskconfig/loanproducteligibility.html'
            })
            .when('/loanproduct/:id/editeligibility', {
                templateUrl: 'views/organization/riskconfig/editloanproducteligibility.html'
            })
            .when('/createoccupationcatagory', {
                templateUrl: 'views/organization/riskconfig/createoccupationcatagory.html'
            })
            .when('/:entityType/editoccupationcategory/:id', {
                templateUrl: 'views/organization/riskconfig/editoccupationcategory.html'
            })
            .when('/viewoccupationcategory/:id', {
                templateUrl: 'views/organization/riskconfig/viewoccupationcategory.html'
            })
            .when('/expenses/:houseHoldExpenseId', {
                templateUrl: 'views/organization/riskconfig/expense.html'
            })
            .when('/:entityType/:houseHoldExpenseId/expenses', {
                templateUrl: 'views/organization/riskconfig/expense.html'
            })
            .when('/:entityType/createexpense/:houseHoldExpenseId', {
                templateUrl: 'views/organization/riskconfig/createexpense.html'
            })
            .when('/:entityType/:entityId/viewexpense/:houseHoldExpenseId', {
                templateUrl: 'views/organization/riskconfig/viewexpense.html'
            })
            .when('/:entityType/:houseHoldExpenseId/editexpense/:entityId', {
                templateUrl: 'views/organization/riskconfig/editexpense.html'
            })
            .when('/occupation/:cashFlowCategoryId', {
                templateUrl: 'views/organization/riskconfig/occupation.html'
            })
            .when('/:entityType/createoccupation/:cashFlowCategoryId', {
                templateUrl: 'views/organization/riskconfig/createoccupation.html'
            })
            .when('/occupation/:cashFlowCategoryId/viewoccupation/:incomeAndExpenseId', {
                templateUrl: 'views/organization/riskconfig/viewoccupation.html'
            })
            .when('/viewoccupation/:incomeAndExpenseId', {
                templateUrl: 'views/organization/riskconfig/viewoccupation.html'
            })
            .when('/editoccupation/:incomeAndExpenseId', {
                templateUrl: 'views/organization/riskconfig/editoccupation.html'
            })
            .when('/:occupation/:cashFlowCategoryId/editoccupation/:incomeAndExpenseId', {
                templateUrl: 'views/organization/riskconfig/editoccupation.html'
            })
            .when('/:entityType/:entityId/createutilizationcheck', {
                templateUrl: 'views/groups/createutilizationcheck.html'
            })
            .when('/:entityType/:entityId/loans/:loanId/editloanutilization/:utilizationCheckId', {
                templateUrl: 'views/groups/editloanutilizationcheck.html'
            })
            .when('/:entityType/:entityId/listgrouploanutillization', {
                templateUrl: 'views/groups/listgouputilizationcheck.html'
            })
            .when('/groups/:groupId/creditbureausummary', {
                templateUrl: 'views/groups/groupcreditbureausummary.html'
            })
            .when('/createfamilydetailsummary/:clientId', {
                templateUrl: 'views/clients/createfamilydetailsummary.html'
            })
            .when('/listfamilydetails/:clientId', {
                templateUrl: 'views/clients/listfamilydetail.html'
            })
            .when('/createfamilydetails/:clientId', {
                templateUrl: 'views/clients/createfamilydetail.html'
            })
            .when('/clients/:clientId/viewfamilydetails/:familyDetailId', {
                templateUrl: 'views/clients/viewfamilydetails.html'
            })
            .when('/clients/:clientId/editfamilydetails/:familyDetailId', {
                templateUrl: 'views/clients/editfamilydetail.html'
            })
            .when('/clients/:clientId/createclientoccupationdetails', {
                templateUrl: 'views/clients/createclientoccupationdetail.html'
            })
            .when('/clients/:clientId/editclientoccupation/:occupationId', {
                 templateUrl: 'views/clients/editclientoccupationdetail.html'
            })
            .when('/clients/:clientId/createclientassetdetails', {
                templateUrl: 'views/clients/createclientassetdetail.html'
            })
            .when('/clients/:clientId/editclientasset/:assetId', {
                templateUrl: 'views/clients/editclientassetdetail.html'
            })
            .when('/clients/:clientId/createclienthouseholddetails', {
                templateUrl: 'views/clients/createclienthouseholddetail.html'
            })
            .when('/clients/:clientId/editclienthouseholdexpense/:houseHoldExpenseId', {
                templateUrl: 'views/clients/edithouseholdexpense.html'
            })
            .when('/clients/:clientId/createexistingloan', {
                templateUrl: 'views/clients/createexistingloan.html'
            })
            .when('/clients/:clientId/editclientexistingloan/:existingloanId', {
                templateUrl: 'views/clients/editexistingloan.html'
            })
            .when('/clients/:clientId/viewclientexistingloan/:existingloanId', {
                templateUrl: 'views/clients/viewexistingloan.html'
            })
            .when('/clients/:clientId/guarantees', {
                templateUrl: 'views/clients/viewclientguarantees.html'
            })
            .when('/viewclient/:clientId/viewloanapplicationreference/:loanApplicationReferenceId/surveys', {
                templateUrl: 'views/loans/listsurvey.html'
            })
            .when('/viewclient/:clientId/viewloanapplicationreference/:loanApplicationReferenceId/viewscorecards/:surveyId', {
                templateUrl: 'views/loans/viewscorecard.html'
            })
            .when('/newgrouploanindividualmonitoringloanaccount/:groupId', {
                templateUrl: 'views/loans/newloanaccount.html'
            })
            .when('/glimloanaccountcharge/:loanId/waivecharge', {
                templateUrl: 'views/loans/glimwaivecharge.html'
            })
            .when('/glimloanaccountprepay/:loanId', {
                templateUrl: 'views/loans/glimprepay.html'
            })
            .when('/glimrecoverypayment/:loanId', {
                templateUrl: 'views/loans/glimrecoverypayment.html'
            })
            .when('/viewglimrepaymentschedule/:glimId', {
                templateUrl: 'views/loans/viewglimrepaymentschedule.html'
            })
            .when('/admin/system/surveys', {
                templateUrl: 'views/survey/surveys.html'
            })
            .when('/admin/system/surveys/create', {
                templateUrl: 'views/survey/createsurvey.html'
            })
            .when('/admin/system/surveys/edit/:surveyId', {
                templateUrl: 'views/survey/editsurvey.html'
            })
            .when('/admin/system/surveys/view/:surveyId', {
                templateUrl: 'views/survey/viewsurvey.html'
            })
            .when('/:entityType/:entityId/surveys', {
                templateUrl: 'views/survey/viewentitytypesurveys.html'
            })
            .when('/:entityType/:entityId/takesurvey', {
                templateUrl: 'views/survey/takesurvey.html'
            })
            .when('/creditbureauloanproducts',{
                templateUrl:'views/products/creditbureauloanproducts.html'
            })
            .when('/loanapplication/:loanApplicationId/workflow', {
                templateUrl: 'views/task/showcase/loanapplicationworkflow.html'
            })
            .when('/grouponboarding/:groupId/workflow', {
                templateUrl: 'views/task/showcase/grouponboardingworkflow.html'
            })
            .when('/villageworkflow/:villageId/workflow', {
                templateUrl: 'views/task/showcase/villageonboardingworkflow.html'
            })
            .when('/officeworkflow/:officeId/workflow', {
                templateUrl: 'views/task/showcase/officeonboardingworkflow.html'
            })
            .when('/districtworkflow/:districtId/workflow', {
                templateUrl: 'views/task/showcase/districtonboardingworkflow.html'
            })
            .when('/admin/editrole/:id', {
                templateUrl: 'views/administration/editrole.html'
            })
            .when('/auditreport', {
                templateUrl: 'views/reports/auditreport.html'
            })
            .when('/auditreport/:id', {
                templateUrl: 'views/reports/viewauditreport.html'
            })
            .when('/workflowtaskdashboard', {
                templateUrl: 'views/dashboard/workflowdashboard.html'
            })
            .when('/tasklist', {
                templateUrl: 'views/dashboard/tasklist.html'
            })
            .when('/viewtask/:taskId', {
                templateUrl: 'views/task/viewtask.html'
            })
            .when('/workflowtask/:entityType/:entityId', {
                templateUrl: 'views/task/workflowtask.html'
            })
            .when('/bankaccountdetails/:entityType/:entityId', {
                templateUrl: 'views/bankaccountdetails/bank_account_details.html'
            })
            .when('/client/:clientId/bankaccountdetails/loan/:entityId', {
                templateUrl: 'views/bankaccountdetails/common/bank_account_details.html'
            })
            .when('/clients/:clientId/bankaccountdetails', {
                templateUrl: 'views/clients/clientbankaccountdetails.html'
            })
            .when('/groups/:groupId/bankaccountdetails/:groupBankAccountDetailAssociationId', {
                templateUrl: 'views/groups/bankaccountdetails/viewgroupbankaccountdetails.html'
             })
            .when('/:entityType/:entityId/bankaccountdetails/:bankAccountDetailsId', {
                templateUrl: 'views/bankaccountdetails/bank_account_details.html'
            })
            .when('/groups/:groupId/addbankaccountdetail', {
                templateUrl: 'views/groups/bankaccountdetails/creategroupbankaccount.html'
            })
            .when('/:entityType/:entityId/addbankaccountdetail', {
                templateUrl: 'views/bankaccountdetails/common/createbankaccount.html'
            })
            .when('/createcgt', {
                templateUrl: 'views/cgt/createcgt.html'
            })
            .when('/viewcgt/:cgtId', {
                templateUrl: 'views/cgt/viewcgt.html'
            })
            .when('/updatecgtdays/:cgtDayId', {
                templateUrl: 'views/cgt/updatecgtdays.html'
            })
            .when('/viewcgtdays/:cgtDayId', {
                templateUrl: 'views/cgt/viewcgtdays.html'
            })
            .when('/completecgt/:cgtId', {
                templateUrl: 'views/cgt/cgtcompleteorreject.html'
            })
            .when('/rejectcgt/:cgtId', {
                templateUrl: 'views/cgt/cgtcompleteorreject.html'
            })
            .when('/viewbankaccounttransfers/:entityType/:entityId/:transferId', {
                templateUrl: 'views/accounttransfers/view_bank_accounttransfer.html'
            })
            .when('/viewbanktransfer/:entityType/:entityId/:transferId', {
                templateUrl: 'views/accounttransfers/viewbanktransferdetail.html'
            })
            .when('/organizations/profieratings/create', {
                templateUrl: 'views/organization/profilerating/createprofileratingconfiguration.html'
            })
            .when('/organizations/profieratings/edit/:profileRatingConfigId', {
                templateUrl: 'views/organization/profilerating/editprofileratingconfiguration.html'
            })
            .when('/riskprofileratingcompute', {
                templateUrl: 'views/organization/profilerating/riskprofileratingcompute.html'
            })
            .when('/loanemipacks', {
                templateUrl: 'views/products/loanemipacks/loanemipacks.html'
            })
            .when('/viewloanemipacks/:loanProductId', {
                templateUrl: 'views/products/loanemipacks/viewloanemipacks.html'
            })
            .when('/addloanemipacks/:loanProductId', {
                templateUrl: 'views/products/loanemipacks/addloanemipacks.html'
            })
            .when('/dedup', {
                templateUrl: 'views/administration/dedup.html'
            })
            .when('/editloanemipacks/:loanProductId/:loanEMIPackId', {
                templateUrl: 'views/products/loanemipacks/editloanemipacks.html'
            })
            .when('/workflowtasksconfig', {
                templateUrl: 'views/task/config/createworkflowtasksconfig.html'
            })    
            .when('/createfund', {
                templateUrl: 'views/organization/funds/createfund.html'
            })
            .when('/viewfunds', {
                templateUrl: 'views/organization/funds/viewfunds.html'
            })
            .when('/viewfund/:fundId', {
                templateUrl: 'views/organization/funds/viewfund.html'
            })
            .when('/editfund/:fundId', {
                templateUrl: 'views/organization/funds/editfund.html'
            })
            .when('/assignfund', {
                templateUrl: 'views/organization/funds/assignfund.html'
            })
            .when('/fundmapping', {
                templateUrl: 'views/search/advancedsearch.html'
            })
            .when('/taskconfigtemplate/template', {
                templateUrl: 'views/task/taskconfigtemplate/createtaskconfigtemplate.html'
            })
            .when('/taskconfigtemplate', {
                templateUrl: 'views/task/taskconfigtemplate/taskconfigtemplate.html'
            })
            .when('/taskconfigtemplate/edittemplate/:id', {
                templateUrl: 'views/task/taskconfigtemplate/edittaskconfigtemplate.html'
            })
            .when('/taskcreate', {
                templateUrl: 'views/task/createtask/createtask.html'
            })
            .when('/accounting/voucherentry/:voucherTypeId', {
                templateUrl: 'views/accounting/voucherentry/createvouchertype.html'
            })
            .when('/voucherentry', {
                templateUrl: 'views/accounting/voucherentry/vouchertype.html'
            })
            .when('/searchvoucherentries', {
                templateUrl: 'views/accounting/voucherentry/searchvoucher.html'
            })
            .when('/accounting/view/voucherentry/:voucherCode/:voucherId', {
                templateUrl: 'views/accounting/voucherentry/viewvouchertype.html'
            })
            .when('/accountlimits', {
                templateUrl: 'views/limitsmodule/clientaccountlimits.html'
            })
            .when('/clients/:clientId/accountlimits', {
                templateUrl: 'views/limitsmodule/viewclientaccountlimits.html'
            })
            .when('/clients/:clientId/createclientaccountlimits', {
                templateUrl: 'views/limitsmodule/clientaccountlimits.html'
            })
            .when('/clients/:clientId/editclientaccountlimits', {
                templateUrl: 'views/limitsmodule/clientaccountlimits.html'
            })
            .when('/pdc/view/:pdcId', {
                templateUrl: 'views/pdc/pdcdetailview.html'
            })
            .when('/managepdc', {
                templateUrl: 'views/pdc/managepdc.html'
            })
            .when('/pdcreport', {
                templateUrl: 'views/pdc/pdcreport.html'
            })
            .when('/districts', {
                templateUrl: 'views/districts/districts.html'
            })
            .when('/fileprocess', {
                templateUrl: 'views/fileprocess/fileprocess.html'
            })
            .when('/fileprocess/:fileProcessCategory', {
                templateUrl: 'views/fileprocess/fileprocess.html'
            })
            .when('/viewfileprocess/:fileProcessIdentifier', {
                templateUrl: 'views/fileprocess/viewfileprocess.html'
            })
            .when('/uploadfileprocess', {
                templateUrl: 'views/fileprocess/uploadfileprocess.html'
            })
            .when('/uploadfileprocess/:fileProcessIdentifier', {
                templateUrl: 'views/fileprocess/uploadfileprocess.html'
            })
            .when('/run_overdue_charges',{
                templateUrl: 'views/organization/overduecharge.html'
            })
            .when('/workflowentitymappings',{
                templateUrl:'views/task/config/workflowentitymappings.html'
            })
            .when('/viewworkflowentitymapping/:taskConfigId/:entityType',{
                templateUrl:'views/task/config/viewworkflowentitymapping.html'
            })
            .when('/createworkflowentitymapping',{
                templateUrl:'views/task/config/createworkflowentitymapping.html'
            })
            .when('/interbranchsearch', {
                templateUrl: 'views/interbranch/search-details.html'
            })
            .when('/addactiongroups', {
                templateUrl: 'views/task/config/addactiongroups.html'
            })
            .when('/displayactiongroups', {
                templateUrl: 'views/task/config/displayactiongroups.html'
            })
            .when('/addactiongroups/:actionGroupId', {
                templateUrl: 'views/task/config/addactiongroups.html'
            })
            .when('/viewactiongroup/:actionGroupId', {
                templateUrl: 'views/task/config/viewactiongroup.html'
            })
            .when('/tasklist/:parentConfigId/:officeId/:childConfigId', {
                templateUrl: 'views/dashboard/tasklist.html'
            })
            .when('/workflowmanagement', {
                templateUrl: 'views/task/config/workflowmanagement.html'
            })
            .when('/workflows', {
                templateUrl: 'views/task/config/workflows.html'
            })
            .when('/addworkflow', {
                templateUrl: 'views/task/config/addworkflow.html'
            })
            .when('/addworkflow/:taskConfigId', {
                templateUrl: 'views/task/config/addworkflow.html'
            })
            .when('/viewworkflow/:taskConfigId', {
                templateUrl: 'views/task/config/viewworkflow.html'
            })
            .when('/workflow/:taskConfigId/addworkflowsteps', {
                templateUrl: 'views/task/config/addworkflowsteps.html'
            })
            .when('/viewworkflowstep/:taskConfigId/:taskConfigStepId', {
                templateUrl: 'views/task/config/viewworkflowstep.html'
            })
            .when('/workflow/:taskConfigId/addworkflowsteps/:taskConfigStepId', {
                templateUrl: 'views/task/config/addworkflowsteps.html'
            })
            .when('/create/creditbureau/:entityType/:entityId', {
                templateUrl: 'views/creditbureau/createcreditbureaureport.html'
            })
            .when('/clients/:clientId/view/creditbureau/:enquiryId/summary', {
                templateUrl: 'views/creditbureau/viewcreditbureaureport.html'
            })
            .when('/clientverificationdetails/:clientId', {
                templateUrl: 'views/clients/clientverificationdetails.html'
            })
            .when('/bulkbankaccountverification',{
                templateUrl: 'views/fileprocess/bulkbankaccountverification.html'
            })
            .when('/uploadbulkbankaccountverificationfileprocess', {
                templateUrl: 'views/fileprocess/uploadbulkbankaccountverificationfileprocess.html'
            })
            .when('/:entityType/:entityId/loans/:loanId/viewloanutilization/:utilizationCheckId', {
                templateUrl: 'views/groups/viewloanutilizationcheck.html'
            })
            .when('/admin/proxyusermappings', {
                templateUrl: 'views/administration/proxyuser/proxyusermappings.html'
            })
            .when('/admin/createproxyusermapping', {
                templateUrl: 'views/administration/proxyuser/createproxyusermapping.html'
            })
            .when('/admin/editproxyusermapping/:id', {
                templateUrl: 'views/administration/proxyuser/editproxyusermapping.html'
            })
            .when('/admin/viewproxyusermapping/:id', {
                templateUrl: 'views/administration/proxyuser/viewproxyusermapping.html'
            })
            .when('/switchuser', {
                templateUrl: 'views/administration/proxyuser/switchuser.html'
            })
            .when('/groups/:groupId/bankaccountdetails', {
                templateUrl: 'views/groups/bankaccountdetails/groupbankaccountdetails.html'
            })
            .when('/workflowanalytics', {
                templateUrl: 'views/task/analytics/taskanalytics.html'
            })
            .when('/sequencepattern',{
                templateUrl: 'views/customsequence/sequencepatternlist.html'
            })
            .when('/sequencepattern/addsequencepattern',{
                templateUrl: 'views/customsequence/createsequencepattern.html'
            })
            .when('/sequencepattern/:id',{
                templateUrl: 'views/customsequence/viewsequencepattern.html'
            })
            .when('/customsequences',{
                templateUrl: 'views/customsequence/sequencedetailslist.html'
            })
            .when('/sequences/:id',{
                templateUrl: 'views/customsequence/viewsequencedetails.html'
            })
            .when('/customsequence/addsequence',{
                templateUrl: 'views/customsequence/createsequencedetails.html'
            })
            .when('/sequencemanagement',{
                templateUrl: 'views/customsequence/sequencemanagement.html'
            })
            .when('/sequenceassociations',{
                templateUrl: 'views/customsequence/sequenceentityassociationlist.html'
            })
            .when('/customsequence/mapsequencetoentity',{
                templateUrl: 'views/customsequence/createsequenceentityassociation.html'
            })
            .when('/sequenceassociations/:id',{
                templateUrl: 'views/customsequence/viewsequenceentityassociation.html'
            })
            .when('/editSequenceEntityAssociation/:id',{
                templateUrl: 'views/customsequence/editsequenceentityassociation.html'
            }) 
            .when('/loanaccountrectification/:loanId', {
                templateUrl: 'views/loans/loanrectification.html'
            })
            .when('/centeronboarding/:centerId/workflow', {
                templateUrl: 'views/task/showcase/centeronboardingworkflow.html'
            })
            .when('/centeronboarding/:eventType/:centerId/workflow', {
                templateUrl: 'views/task/showcase/centeronboardingworkflow.html'
            })
            .when('/history/:entityType/:entityId',{
                templateUrl: 'views/common/viewhistory.html'
            })
            .when('/workflowbankapprovallist',{
                templateUrl: 'views/dashboard/workflowbankapprovallist.html'
            })    
            .when('/workflowbankapprovalaction/:trackerId/:workflowBankApprovalId',{
                templateUrl: 'views/task/bankapproval/workflowbankapprovalaction.html'
            })
            .when('/clientlevelqueryresolve/:trackerId/:workflowBankApprovalId',{
                templateUrl: 'views/task/bankapproval/clientlevelqueryresolve.html'
            })
            .when('/eodprocess', {
                templateUrl: 'views/accounting/eodprocess/eodprocess.html'
            })
            .when('/initiateeodprocess', {
                templateUrl: 'views/accounting/eodprocess/initiateeodprocess.html'
            })
            .when('/eodonboarding/:eventType/:eodprocessId/workflow', {
                templateUrl: 'views/accounting/eodprocess/eodonboardingworkflow.html'
            })
            .when('/reports/:id/:action', {
                templateUrl: 'views/reports/individualaccountreport.html'
            })
            .when('/bulkreschedule', {
                templateUrl: 'views/organization/bulkreschedule.html'
            })
            .when('/reschedulesavingsinstallmentduedate', {
                templateUrl: 'views/organization/bulksavingsaccountinstallmentreschedule.html'
            })            
            .when('/viewbulktransfer', {
                templateUrl: 'views/organization/bulktransfer/bulktransfermenu.html'
            })
            .when('/bulktransfer', {
                templateUrl: 'views/organization/bulktransfer/bulktransfer.html'
            })
            .when('/viewbulktransfer/:id', {
                templateUrl: 'views/organization/bulktransfer/viewbulktransfer.html'
            })
            .when('/initiatebulktransfer', {
                templateUrl: 'views/organization/bulktransfer/initiatebulktransfer.html'
            })
            .when('/loans/pendingvaluedatetransactions', {
                templateUrl: 'views/loans/pendingvaluedatetransactions.html'
            })
            .when('/organization/registereddevices', {
                templateUrl: 'views/organization/registereddevices/registereddevices.html'
            })
            .when('/organization/registereddevices/:registeredDeviceId', {
                templateUrl: 'views/organization/registereddevices/viewregistereddevice.html'
            })
            .when('/addofficeaddress/:officeId', {
                templateUrl: 'views/organization/addofficeaddress.html'
            })
            .when('/editofficeaddress/:officeId/:addressId', {
                templateUrl: 'views/organization/editofficeaddress.html'
            })
            .when('/transfer', {
                templateUrl: 'views/transfer/transfer.html'
            })
            .when('/transfer/viewclienttransfer', {
                templateUrl: 'views/transfer/viewtransferclient.html'
            })
            .when('/transfer/client', {
                templateUrl: 'views/transfer/transferclient.html'
            })
            .when('/transfer/viewcentertransfer', {
                templateUrl: 'views/transfer/viewtransfercenter.html'
            })
            .when('/transfer/center', {
                templateUrl: 'views/transfer/transfercenter.html'
            })
            .when('/transferhistory/:entityType/:entityId',{
                templateUrl: 'views/common/viewtransferhistory.html'
            })
            .when('/assigntask',{
                templateUrl: 'views/dashboard/assigntask.html'
            })
            .when('/clients/:clientId/viewpolicy', {
                templateUrl: 'views/policy/viewpolicy.html'
            })
            .when('/clients/:clientId/createpolicy', {
                templateUrl: 'views/policy/createpolicy.html'
            })
            .when('/clients/:clientId/editpolicy', {
                templateUrl: 'views/policy/editpolicy.html'
            })
            .when('/clients/:clientId/viewdeceased', {
                templateUrl: 'views/clients/clientdeceased.html'
            })
            .when('/accounting/transaciontypemappings/postentries', {
                templateUrl: 'views/accounting/transaciontypemapping_journalentry.html'
            })
            .when('/bc', {
                templateUrl: 'views/accounting/bc.html'
            })
            .when('/transactiontypemapping', {
                templateUrl: 'views/accounting/transactiontypemapping.html'
            })
            .when('/createtransactiontype', {
                templateUrl: 'views/accounting/createtransactiontype.html'
            })
            .when('/transactiontypemapping/viewtransactiontype/:mappingId', {
                templateUrl: 'views/accounting/viewtransactiontype.html'
            })
            .when('/transactiontypemapping/edittransactiontype/:mappingId', {
                templateUrl: 'views/accounting/edittransactiontype.html'
            })
            .when('/exchange/client', {
                templateUrl: 'views/transfer/memberexchange.html'
            })
            .when('/transfer/viewmemberexchange', {
                templateUrl: 'views/transfer/viewmemberexchange.html'
            })            
            .when('/transfer/memberexchange', {
                templateUrl: 'views/transfer/memberexchange.html'
            })
            .when('/operationalaccounting', {
                templateUrl: 'views/accounting/operational_accounting.html'
            })
            .when('/fldg', {
                templateUrl: 'views/accounting/fldg.html'
            })
            .when('/gstinvoicing', {
                templateUrl: 'views/accounting/gst_invoicing.html'
            })
            .when('/gstmapping', {
                templateUrl: 'views/accounting/gst_mapping.html'
            })
            .when('/gstdatapush', {
                templateUrl: 'views/accounting/gst_data_push.html'
            })
            .when('/gstmapping/loanproducts', {
                templateUrl: 'views/accounting/loanproduct_gst_mapping.html'
            })
            .when('/gstmapping/savingsproducts', {
                templateUrl: 'views/accounting/savingsproduct_gst_mapping.html'
            })
            .when('/gstmapping/charges', {
                templateUrl: 'views/accounting/charges_gst_mapping.html'
            })
            .when('/gstmapping/addcharges', {
                templateUrl: 'views/accounting/addcharges_gst_mapping.html'
            })
            .when('/gstmapping/addloanproducts', {
                templateUrl: 'views/accounting/addloanproduct_gst_mapping.html'
            })
            .when('/gstmapping/addsavingsproducts', {
                templateUrl: 'views/accounting/addsavingsproduct_gst_mapping.html'
            })
            .when('/viewtranche', {
                templateUrl: 'views/accounting/view_tranche.html'
            })
            .when('/createtranche', {
                templateUrl: 'views/accounting/create_tranche.html'
            })    
            .when('/centers/:centerId/apscRepayment', {
                templateUrl: 'views/accounttransfers/make_apscrepayment.html'
            })
            .when('/fldgsettlement/:trancheId', {
                templateUrl: 'views/accounting/fldg_settlement.html'
            })
            .when('/editgstmapping/:entityType/:entityId', {
                templateUrl: 'views/accounting/edit_gstmapping.html'
            })
            .when('/transferwhileactivation/:clientId', {
                templateUrl: 'views/clients/transferclientwhileactivation.html'
            })
            .when('/reassignstaff/:isStaffReassignment', {
                templateUrl: 'views/organization/bulktransfer/bulkstaffreassign.html'
            })
            .when('/fldgManualsettlement/:trancheId', {
                templateUrl: 'views/accounting/fldg_manual_settlement.html'
            })
            .when('/tellers/:tellerId/cashiers/:cashierId/summary/:currencyCode', {
                templateUrl: 'views/organization/cashmgmt/viewCashierSummary.html'
            })
            .when('/accountingstatemappings', {
                templateUrl: 'views/accounting/accounting_state_mappings.html'
            })
            .when('/createaccountingmappings', {
                templateUrl: 'views/accounting/create_accounting_mappings.html'
            })
            .when('/createaccountingmappingsdetails/:mappingId', {
                templateUrl: 'views/accounting/create_mappings_details.html'
            })
            .when('/viewaccountingmappingsdetails/:mappingId', {
                templateUrl: 'views/accounting/View_accounting_mapping_details.html'
            })
            .when('/viewaccountingglmappings/:mappingId/accstate/:accStateId', {
                templateUrl: 'views/accounting/accstate_to_gl_mappings.html'
            })
            .when('/createglmappings/:mappingId/accstate/:accStateId', {
                templateUrl: 'views/accounting/create_gl_mappings.html'
            })
            .when('/editglmappings/:mappingId/accstate/:accStateId', {
                templateUrl: 'views/accounting/edit_gl_mappings.html'
            })
            .when('/accountingstate/productmappings', {
                templateUrl: 'views/accounting/accstate_product_mapping.html'
            })
            .when('/createaccountingstate/productmappings', {
                templateUrl: 'views/accounting/create_accstate_product_mapping.html'
            })
            .when('/editaccountingmappings/:mappingId', {
                templateUrl: 'views/accounting/edit_accounting_mappings.html'
            })
            .when('/editaccountingmappingsdetails/:mappingId/accstate/:accStateId', {
                templateUrl: 'views/accounting/edit_mapping_details.html'
            })
            .when('/editaccountingmappingsdetails/:mappingId/accstate/:accStateId/subtype/:subTypeId', {
                templateUrl: 'views/accounting/edit_mapping_details.html'
            })
            .when('/workflowbankrejectloanaction/:trackerId/:workflowBankApprovalId/:loanId',{
                templateUrl: 'views/task/bankapproval/workflowbankrejectloanaction.html'
            })            
            .when('/gstdebittransaction', {
                templateUrl: 'views/accounting/gst_debit_transaction.html'
            })
            .when('/gstdebittransaction/:id', {
                templateUrl: 'views/accounting/gst_debit_transaction_details.html'
            })
            .when('/viewallcollections', {
                templateUrl: 'views/bulkoperations/viewallcollections.html'
            })
            .when('/viewallcollections/:collectionSheetId',{
                templateUrl: 'views/collection/collectionSheetDetail.html'
            })
            .when('/gstmapping/officeMappings', {
                templateUrl: 'views/accounting/office_tax_mappings.html'
            })
            .when('/gstmapping/createOfficeMappings', {
                templateUrl: 'views/accounting/create_office_tax_mapping.html'
            })
            .when('/gstmapping/editOfficeMappings/:entityType/:entityId', {
                templateUrl: 'views/accounting/edit_office_tax_mapping.html'
            })
            .when('/gstinvoicing/view', {
                templateUrl: 'views/accounting/view_gst_invoice.html'
            })
            .when('/reactivateuser/:id', {
                templateUrl: 'views/administration/reactivateuser.html'
            })
            .when('/country/:countryId/state/:stateId/newdistricts', {
                templateUrl: 'views/districts/createdistricts.html'
            })
            .when('/districts/:districtId', {
                templateUrl: 'views/districts/viewdistrict.html'
            })
            .when('/districts/:districtId/newtalukas', {
                templateUrl: 'views/districts/createtaluka.html'
            })
            .when('/cbreview', {
                templateUrl: 'views/dashboard/cbreview.html'
            })
            .when('/loandpdetails', {
                templateUrl: 'views/loandpdetails/loandpdetails.html'
            })
            .when('/addloandpdetails/loanproduct/:id', {
                templateUrl: 'views/loandpdetails/addloandpdetails.html'
            })
            .when('/viewloandpdetails/loanproduct/:id', {
                templateUrl: 'views/loandpdetails/viewloandpdetails.html'
            })
            .when('/editloandpdetails/loanproduct/:id',{
                templateUrl: 'views/loandpdetails/editloandpdetails.html'
            })
            .when('/gstmapping/officeMappings', {
                templateUrl: 'views/accounting/office_tax_mappings.html'
            })
            .when('/gstmapping/createOfficeMappings', {
                templateUrl: 'views/accounting/create_office_tax_mapping.html'
            })
            .when('/gstmapping/editOfficeMappings/:entityType/:entityId', {
                templateUrl: 'views/accounting/edit_office_tax_mapping.html'
            })
            .when('/gstinvoicing/view', {
                templateUrl: 'views/accounting/view_gst_invoice.html'
            })
            .when('/reactivateuser/:id', {
                templateUrl: 'views/administration/reactivateuser.html'
            })
            .when('/newglimloanproductmapping', {
                templateUrl: 'views/products/glimloanproductmapping/newglimloanproductmapping.html'
            })
            .when('/glimloanproductmappings', {
                templateUrl: 'views/products/glimloanproductmapping/glimloanproductmappings.html'
            })
            .when('/editglimloanproductmapping/:id', {
                templateUrl: 'views/products/glimloanproductmapping/editglimloanproductmapping.html'
            })
            .when('/loan/:id/editactiveloan', {
                templateUrl: 'views/loans/editActiveLoan.html'
            })
            .when('/country/:countryId/state/:stateId/newdistricts', {
                templateUrl: 'views/districts/createdistricts.html'
            })
            .when('/districts/:districtId', {
                templateUrl: 'views/districts/viewdistrict.html'
            })
            .when('/districts/:districtId/newtalukas', {
                templateUrl: 'views/districts/createtaluka.html'
            })
            .when('/insurancedetails/:status', {
                templateUrl: 'views/insurance/viewinsurancedetails.html'
            })
            .when('/financialyearclosures', {
                templateUrl: 'views/accounting/financialyearclosures/financialyearclosures.html'
            })
            .when('/financialyearclosures/create', {
                templateUrl: 'views/accounting/financialyearclosures/createfinancialyearclosure.html'
            })
            .when('/financialyearclosures/:id', {
                templateUrl: 'views/accounting/financialyearclosures/viewfinancialyearclosure.html'
            })
            .when('/smscampaigns', {
                templateUrl: 'views/organization/smscampaigns/smscampaigns.html'
            })
            .when('/createsmscampaign', {
                templateUrl: 'views/organization/smscampaigns/createsmscampaign.html'
            })
            .when('/viewsmscampaign/:campaignId', {
                templateUrl: 'views/organization/smscampaigns/viewsmscampaign.html'
            })
            .when('/editsmscampaign/:campaignId', {
                templateUrl: 'views/organization/smscampaigns/editsmscampaign.html'
            })
            .when('/smsproviders', {
                templateUrl: 'views/organization/smscampaigns/smsproviders.html'
            })
            .when('/insurancedetails', {
                templateUrl: 'views/insurance/viewinsurancedetails.html'
            })
            .when('/insurance/intimationapprovalpending/:id', {
                templateUrl: 'views/insurance/viewintimationapproval.html'
            })
            .when('/insurance/documentsupload/:id', {
                templateUrl: 'views/insurance/documentsupload.html'
            })
            .when('/insurance/claimverificationpending/:id', {
                templateUrl: 'views/insurance/claimverificationpending.html'
            })
            .when('/insurance/verifiedClaims/:id', {
                templateUrl: 'views/insurance/verifiedclaimdetail.html'
            })
            .when('/insurance/rejectedclaiminsurance/:id', {
                templateUrl: 'views/insurance/rejectedclaiminsurance.html'
            })
            .when('/insurance/settlementPending/:id', {
                templateUrl: 'views/insurance/insurancesettelmentpending.html'
            })
            .when('/insurance/settledClaims/:id', {
                templateUrl: 'views/insurance/viewsettledclaim.html'
            })
            .when('/clients/:clientId/credithistory', {
                templateUrl: 'views/clients/credithistory.html'
            })
            .when('/transfer/viewvillagetransfer', {
                templateUrl: 'views/transfer/viewvillagetransfer.html'
            })
            .when('/transfer/village', {
                templateUrl: 'views/transfer/villagetransfer.html'
            })
            .when('/loan/:id/restructure', {
                templateUrl: 'views/loans/loanrestructure.html'
            })
            .when('/productivesheet/:officeId/:officeName/:meetingDate/:staffId/:newtransactionDate', {
                templateUrl: 'views/collection/productivecollectionsheet.html'
            })
        $locationProvider.html5Mode(false);
    };
    mifosX.ng.application.config(defineRoutes).run(function ($log) {
        $log.info("Routes definition completed");
    });
}(mifosX || {}));