(function (module) {
    mifosX.controllers = _.extend(module, {
        BranchCollectionController: function (scope, resourceFactory,routeParams,route, location) {
            scope.allCategory =[];
            scope.reportData = [];
            scope.allBranch =[];
            scope.allBranchId =[];//b sud be caps
            scope.branchCollection=[];
            scope.labelIndex = 0;
            scope.tdIndex = -1;
            scope.thIndex = -1;
            
            resourceFactory.runReportsResource.getReport({reportSource: 'Branch_Wise_Collection'}, function (collection) {
                        scope.branchCollection = collection.data;
                        scope.getBranches();
                        resourceFactory.runReportsResource.getReport({reportSource: 'All_Category'}, function (categroy) {//categroy
                            scope.getCategories(categroy);
                            scope.branchCollectionOverview();
                        });
            });


            scope.getCategories = function(category){//categroy
                for(var i=0; i<category.data.length;i++){
                    if(category.data[i].row[0].length>0){
                        scope.allCategory.push(category.data[i].row[0].replace('"','').replace('"',''));
                    }
                }
            };

            scope.getBranches = function(){
                    for (var i in scope.branchCollection) {
                        if(scope.allBranch.indexOf(scope.branchCollection[i].row[1])==-1){
                            scope.allBranch.push(scope.branchCollection[i].row[1]);
                            scope.allBranchId.push(scope.branchCollection[i].row[0]);                        }
                    };
            };
            
           scope.routeTo = function (id) {
                location.path('/collection/' + id);
            }; 

            scope.getLabel = function(){
                scope.labelIndex = scope.labelIndex+1;
                return (scope.labelIndex%2 != 0)?'label.heading.arrears':'label.heading.outstanding';
            };



            scope.getAmount = function(data){
               if(scope.tdIndex>scope.allCategory.length-1){
                    scope.tdIndex = 0;
                }
               scope.thIndex = scope.thIndex +1;
               var isEven = (scope.thIndex%2 == 0);
               var cat = '';
               if(isEven){
                    scope.tdIndex = scope.tdIndex + 1;  
                    if(scope.tdIndex>scope.allCategory.length-1){
                        scope.tdIndex = 0;
                    }                  
                    cat = scope.allCategory[scope.tdIndex];
                    return data[cat].arrears;
               }else{
                    cat = scope.allCategory[scope.tdIndex];
                    return data[cat].outstanding;
               }
               
            };
            

            scope.branchCollectionOverview = function(){
            //unneccesary var
                var branches = scope.allBranch;
                var categories = scope.allCategory;
                var collections = scope.branchCollection;
            
                for(var i =0; i<branches.length; i++){
                    var branchCollectionOverview = {};
                        for(var j =0;j<categories.length;j++){
                            var cat = categories[j];
                            branchCollectionOverview[cat]={};
                            for(var k in scope.branchCollection){
                               if(collections[k].row[1] == branches[i]){
                                   if(collections[k].row[4] == categories[j]){
                                        branchCollectionOverview[cat].arrears = parseFloat(collections[k].row[2]).toFixed(2);//arreas
                                        branchCollectionOverview[cat].outstanding = parseFloat(collections[k].row[3]).toFixed(2);
                                    }
                                }
                            }
                            if(branchCollectionOverview[cat].arrears == undefined){
                                branchCollectionOverview[cat].arrears =0;
                                branchCollectionOverview[cat].outstanding =0;
                            }
                        }
                        var rowData={'branchId':scope.allBranchId[i],'branch':branches[i],'data':branchCollectionOverview};
                        scope.reportData.push(rowData);

                }
            
            }
        }
    });
    mifosX.ng.application.controller('BranchCollectionController', ['$scope', 'ResourceFactory','$routeParams','$route','$location', mifosX.controllers.BranchCollectionController]).run(function ($log) {
        $log.info("BranchCollectionController initialized");
    });
}(mifosX.controllers || {}));