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
            .when('/createsavingproduct', {
                templateUrl: 'views/products/createsavingproduct.html'
            })
            .when('/editsavingproduct/:id', {
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
            .when('/clientscreenreport/:clientId', {
                templateUrl: 'views/clients/clientscreenreport.html'
            })
            .when('/client/:id/:action', {
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
            .when('/approveloanapplicationreference/:loanApplicationReferenceId', {
                templateUrl: 'views/loans/approveloanapplicationreference.html'
            })
            .when('/creditbureaureport/:loanApplicationReferenceId', {
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
            .when('/viewloantrxn/:accountId/trxnId/:id', {
                templateUrl: 'views/loans/view_loan_transaction.html'
            })
            .when('/organization', {
                templateUrl: 'views/administration/organization.html'
            })
            .when('/system', {
                templateUrl: 'views/administration/system.html'
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
                templateUrl: 'views/organization/managefunds.html'
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
            .when('/reports', {
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
            .when('/createPaymentType/', {
                templateUrl: 'views/organization/createpaymenttype.html'
            })
            .when('/editPaymentType/:id', {
                templateUrl: 'views/organization/editpaymenttype.html'
            })
            .when('/reports/:type', {
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
            .when('/sms/createcampaign', {
                templateUrl: 'views/sms/createsmscampaign.html'
            })
            .when('/sms/viewcampaign', {
                templateUrl: 'views/sms/viewsmscampaign.html'
            })
            .when('/sms/campaign/close/:campaignId', {
                templateUrl: 'views/sms/closesmscampaign.html'
            })
            .when('/sms/campaign/reactivate/:campaignId', {
                templateUrl: 'views/sms/reactivatesmscampaign.html'
            })
            .when('/sms/campaign/activate/:campaignId', {
                templateUrl: 'views/sms/activatesmscampaign.html'
            })
            .when('/sms/campaign/edit/:campaignId', {
                templateUrl: 'views/sms/editsmscampaign.html'
            })
            .when('/bankstatements', {
                templateUrl: 'views/bankstatements/viewbankstatement.html'
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
            .when('/client/:clientId/editclientoccupation/:occupationId', {
                 templateUrl: 'views/clients/editclientoccupationdetail.html'
            })
            .when('/clients/:clientId/createclientassetdetails', {
                templateUrl: 'views/clients/createclientassetdetail.html'
            })
            .when('/client/:clientId/editclientasset/:assetId', {
                templateUrl: 'views/clients/editclientassetdetail.html'
            })
            .when('/clients/:clientId/createclienthouseholddetails', {
                templateUrl: 'views/clients/createclienthouseholddetail.html'
            })
            .when('/client/:clientId/editclienthouseholdexpense/:houseHoldExpenseId', {
                templateUrl: 'views/clients/edithouseholdexpense.html'
            })
            .when('/clients/:clientId/createexistingloan', {
                templateUrl: 'views/clients/createexistingloan.html'
            })
            .when('/client/:clientId/editclientexistingloan/:existingloanId', {
                templateUrl: 'views/clients/editexistingloan.html'
            })
            .when('/client/:clientId/viewclientexistingloan/:existingloanId', {
                templateUrl: 'views/clients/viewexistingloan.html'
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
                templateUrl: 'views/dashboard/workflowstepdashboard.html'
            })
            .when('/workflowtasks', {
                templateUrl: 'views/dashboard/workflowtasks.html'
            })
            .when('/viewtask/:taskId', {
                templateUrl: 'views/task/viewtask.html'
            })
            .when('/workflowtask/:entityType/:entityId', {
                templateUrl: 'views/task/workflowtask.html'
            });
        $locationProvider.html5Mode(false);
    };
    mifosX.ng.application.config(defineRoutes).run(function ($log) {
        $log.info("Routes definition completed");
    });
}(mifosX || {}));
