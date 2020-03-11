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

            this.downloadFile = function(url,type,fileName){
                http.get(url, {responseType: 'arraybuffer'}).
                success((data, status, headers, config) => {
                    var fileType = '';
                    var contentType = headers('Content-Type');
                    if(type !== " "){
                        contentType = 'application/'+type;
                        fileType = type;
                    }else if(contentType){
                        fileType = contentType.split("/").pop();
                    }
                    var blob =  new Blob([data], {type: contentType});
                    var url = window.URL.createObjectURL(blob);
                    var doc = document.createElement("a");
                    document.body.appendChild(doc);
                    doc.href = url;
                    doc.target = '_blank';
                    var now = new Date();
                    var n = now.toLocaleDateString() + "_" + now.toLocaleTimeString();
                    fileName = this.getDownloadableFileName(fileName);
                    doc.download = fileName+'_'+n+'.'+fileType;
                    doc.click();
                    setTimeout(function(){
                        window.URL.revokeObjectURL(url)
                    , 100});
                });
            }

            this.getDownloadableFileName = function (fileName) {
                try {
                    if (fileName.includes(".")) {
                        fileName = fileName.substr(0, fileName.lastIndexOf('.'));
                    }
                } catch (error) {
                    fileName = "document"
                } finally {
                    return fileName;
                }
            }
        }
    });
    mifosX.ng.services.service('CommonUtilService', ['$rootScope','webStorage','$http',mifosX.services.CommonUtilService]).run(function ($log) {
        $log.info("CommonUtilService initialized");
    });
}(mifosX.services || {}));