/**
 * Created by CT on 09-05-2017.
 */
(function (module) {
    mifosX.services = _.extend(module, {
        CommonUtilService: function ($rootScope,webStorage,http) {
            this.onDayTypeOptions = function () {
                var onDayTypeOptions = [];
                for (var i = 1; i <= 28; i++) {
                    onDayTypeOptions.push(i);
                }
                return onDayTypeOptions;
            };

            this.encrypt = function (data) {
                if (publicKey && publicKey != undefined && publicKey != null && publicKey.toString().trim().length > 0) {
                    var encrypt = new JSEncrypt();
                    encrypt.setPublicKey(publicKey);
                    return encrypt.encrypt(data);
                }
                return data;
            };

            this.commonParamsForNewWindow = function(){
                var sessionData = webStorage.get('sessionData');
                var authentication = "";
                if(sessionData.authenticationKey){
                   authentication = '&access_token='+sessionData.authenticationKey;
                }
                return 'tenantIdentifier='+$rootScope.tenantIdentifier + authentication;
            }

            this.downloadFile = function(url,type){
                http.get(url, {responseType: 'arraybuffer'}).
                success(function (data, status, headers, config) {
                    var fileType = '';
                    var contentType = headers('Content-Type');
                    if(contentType){
                        fileType = contentType.split("/").pop();
                    }else if( type){
                        contentType = 'application/'+type;
                        fileType = type;
                    }
                    var blob =  new Blob([data], {type: contentType});
                    var url = window.URL.createObjectURL(blob);
                    var doc = document.createElement("a");
                    document.body.appendChild(doc);
                    doc.href = url;
                    doc.target = '_blank';
                    var n = Date.now();
                    doc.download = 'document_'+n+'.'+fileType;
                    doc.click();
                    setTimeout(function(){
                        window.URL.revokeObjectURL(url)
                      , 100});
                });
            }
        }
    });
    mifosX.ng.services.service('CommonUtilService', ['$rootScope','webStorage','$http',mifosX.services.CommonUtilService]).run(function ($log) {
        $log.info("CommonUtilService initialized");
    });
}(mifosX.services || {}));