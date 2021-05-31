(function (module) {
    mifosX.controllers = _.extend(module, {
        StaffCollectionController: function (scope, resourceFactory,routeParams,route, location) {
            scope.allCategory =[];
            scope.reportData = [];
            scope.allStaff =[];
            scope.allStaffId =[];//b sud be caps
            scope.staffCollection=[];
            scope.labelIndex = 0;
            scope.tdIndex = -1;
            scope.thIndex = -1;
            scope.branchId = routeParams.branchId;
     
            resourceFactory.runReportsResource.getReport({reportSource: 'Staff_Wise_Collection',R_officeId: scope.branchId}, function (collection) {
                        scope.staffCollection = collection.data;
                        scope.getStaff();
                        resourceFactory.runReportsResource.getReport({reportSource: 'All_Category'}, function (categroy) {//categroy
                            scope.getCategories(categroy);
                            scope.staffCollectionOverview();
                        });
            });


            scope.getCategories = function(category){//categroy
                for(var i=0; i<category.data.length;i++){
                    if(category.data[i].row[0].length>0){
                        scope.allCategory.push(category.data[i].row[0].replace('"','').replace('"',''));
                    }
                }
            };

            scope.getStaff = function(){
                    for (var i in scope.staffCollection) {
                        if(scope.allStaff.indexOf(scope.staffCollection[i].row[1])==-1){
                            scope.allStaff.push(scope.staffCollection[i].row[1]); 
                            scope.allStaffId.push(scope.staffCollection[i].row[0]);
                        }
                    };
            };
            
            scope.routeTo = function (id) {
               if(id == null){
                id =-1;
               }
               location.path('/collection/' +scope.branchId+'/'+id);
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
            

            scope.staffCollectionOverview = function(){
            //unneccesary var
            var staff = scope.allStaff;
            var categories = scope.allCategory;
            var collections = scope.staffCollection;
            
            for(var i =0; i<staff.length; i++){
                var staffCollectionOverview = {};
                for(var j =0;j<categories.length;j++){
                    var cat = categories[j];
                    staffCollectionOverview[cat]={};
                   for(var k in scope.staffCollection){
                        if(collections[k].row[1] == staff[i]){
                            if(collections[k].row[4] == categories[j]){
                                staffCollectionOverview[cat].arrears = parseFloat(collections[k].row[2]).toFixed(2);//arreas
                                staffCollectionOverview[cat].outstanding = parseFloat(collections[k].row[3]).toFixed(2);
                            }
                        }
                   }
                   if(staffCollectionOverview[cat].arrears == undefined){
                   staffCollectionOverview[cat].arrears =0;
                   staffCollectionOverview[cat].outstanding =0;
                   }
                }
                if(staff[i] == undefined){
                   staff[i] = "(unassigned)";
                }
                var rowData={'staffId':scope.allStaffId[i],'staff':staff[i],'data':staffCollectionOverview};
                scope.reportData.push(rowData);

            }
           }

        }
    });
    mifosX.ng.application.controller('StaffCollectionController', ['$scope', 'ResourceFactory','$routeParams','$route','$location', mifosX.controllers.StaffCollectionController]).run(function ($log) {
        $log.info("StaffCollectionController initialized");
    });
}(mifosX.controllers || {}));