(function (module) {
    mifosX.models = _.extend(module, {
        ClientStatus: function () {

            this.getStatus = function (status) {
                return this.statusTypes[status];
            };

            this.allStatusTypes = function () {
                return Object.keys(this.statusTypes);
            };

            this.statusKnown = function (status) {
                return this.allStatusTypes().indexOf(status) > -1;
            };

            this.statusTypes = {
                "Pending": [{
                        name: "label.button.newloanapplicationreferences",
                        href: "#/newloanapplicationreference",
                        icon: "icon-plus",
                        taskPermissionName: "CREATE_LOANAPPLICATIONREFERENCE",
                        isEnableButton: false
                    },
                    {
                        name: "label.button.bankaccountdetails",
                        href: "#/clients",
                        subhref: "bankaccountdetails",
                        icon: "",
                        taskPermissionName: "READ_BANKACCOUNTDETAIL"
                    },
                    {
                        name: "label.button.close",
                        href: "#/client",
                        subhref: "close",
                        icon: "icon-remove-circle",
                        taskPermissionName: "CLOSE_CLIENT"
                    },
                    {
                        name: "label.button.reject",
                        href: "#/client",
                        subhref: "reject",
                        icon: "icon-remove-circle",
                        taskPermissionName: "REJECT_CLIENT"
                    },
                    {
                        name: "label.button.withdraw",
                        href: "#/client",
                        subhref: "withdraw",
                        icon: "icon-remove-circle",
                        taskPermissionName: "WITHDRAW_CLIENT"
                    }
                ],
                "Closed": [{
                        name: "label.button.reactivate",
                        href: "#/client",
                        subhref: "reactivate",
                        icon: "icon-ok-sign",
                        taskPermissionName: "REACTIVATE_CLIENT"
                    }

                ],
                "Rejected": [{
                        name: "label.button.undoReject",
                        href: "#/client",
                        subhref: "undoReject",
                        icon: "icon-ok-sign",
                        taskPermissionName: "UNDOREJECT_CLIENT"
                    }

                ],
                "Withdrawn": [{
                        name: "label.button.undoWithdrawn",
                        href: "#/client",
                        subhref: "undoWithdrawn",
                        icon: "icon-ok-sign",
                        taskPermissionName: "UNDOWITHDRAWAL_CLIENT"
                    }


                ],
                "Active": [{
                        name: "label.button.newloanapplicationreferences",
                        href: "#/newloanapplicationreference",
                        icon: "icon-plus",
                        taskPermissionName: "CREATE_LOANAPPLICATIONREFERENCE",
                        isEnableButton: false
                    },
                    {
                        name: "label.button.newloan",
                        href: "#/newclientloanaccount",
                        icon: "icon-plus",
                        taskPermissionName: "CREATE_LOAN"
                    },
                    {
                        name: "label.button.bankaccountdetails",
                        href: "#/clients",
                        subhref: "bankaccountdetails",
                        icon: "",
                        taskPermissionName: "READ_BANKACCOUNTDETAIL"
                    },
                    {
                        name: "label.button.newsaving",
                        href: "#/new_client_saving_application",
                        icon: "icon-plus",
                        taskPermissionName: "CREATE_SAVINGSACCOUNT"
                    },
                    {
                        name: "label.button.newcharge",
                        href: "#/viewclient",
                        subhref: "addcharge",
                        icon: "icon-plus",
                        taskPermissionName: "CREATE_CLIENTCHARGE"
                    },
                    {
                        name: "label.button.transferclient",
                        href: "#/transferclient",
                        icon: "icon-arrow-right",
                        taskPermissionName: "PROPOSETRANSFER_CLIENT"
                    },
                    {
                        name: "label.button.close",
                        href: "#/client",
                        subhref: "close",
                        icon: "icon-remove-circle",
                        taskPermissionName: "CLOSE_CLIENT"
                    },
                    {
                        name: "label.button.blacklist",
                        href: "#/client",
                        subhref: "blacklist",
                        icon: "icon-ban-circle",
                        taskPermissionName: "BLACKLIST_CLIENT"
                    },
                    {
                        name: "label.button.markasdeceased",
                        href: "#/clients",
                        subhref: "viewdeceased",
                        icon: "icon-plus",
                        taskPermissionName: "CREATE_DECEASED_WORKFLOW"
                    }
                ],
                "Transfer in progress": [{
                        name: "label.button.accepttransfer",
                        href: "#/client",
                        subhref: "acceptclienttransfer",
                        icon: "icon-check-sign",
                        taskPermissionName: "ACCEPTTRANSFER_CLIENT"
                    },
                    {
                        name: "label.button.rejecttransfer",
                        href: "#/client",
                        subhref: "rejecttransfer",
                        icon: "icon-remove",
                        taskPermissionName: "REJECTTRANSFER_CLIENT"
                    },
                    {
                        name: "label.button.undotransfer",
                        href: "#/client",
                        subhref: "undotransfer",
                        icon: "icon-undo",
                        taskPermissionName: "WITHDRAWTRANSFER_CLIENT"
                    }
                ],
                "Transfer on hold": [{
                    name: "label.button.undotransfer",
                    href: "#/client",
                    subhref: "undotransfer",
                    icon: "icon-undo",
                    taskPermissionName: "WITHDRAWTRANSFER_CLIENT"
                }],
                "Dedupe": [{
                    name: "label.button.activate",
                    href: "#/client",
                    subhref: "activate",
                    icon: "icon-ok-sign",
                    taskPermissionName: "ACTIVATE_CLIENT"
                }],
                "Assign Staff": {
                    name: "label.button.assignstaff",
                    href: "#/client",
                    subhref: "assignstaff",
                    icon: "icon-user",
                    taskPermissionName: "ASSIGNSTAFF_CLIENT"
                }
            }
        }
    });
}(mifosX.models || {}));