/**
 * Created by CT on 09-05-2017.
 */
(function (module) {
    mifosX.services = _.extend(module, {
        CommonUtilService: function ($rootScope,webStorage,http,dateFilter) {
            this.onDayTypeOptions = function () {
                var onDayTypeOptions = [];
                for (var i = 1; i <= 28; i++) {
                    onDayTypeOptions.push(i);
                }
                return onDayTypeOptions;
            };

            this.encrypt = function (data) {
                if (publicKey && publicKey != undefined && publicKey != null && publicKey.toString().trim().length > 0) {
                    data = stringToArrayBuffer(data);
                    return window.crypto.subtle.encrypt(
                        {
                            name: "RSA-OAEP",
                            //label: Uint8Array([...]) //optional
                        },
                        publicKey, //from generateKey or importKey above
                        data //ArrayBuffer of data you want to encrypt
                    )
                }
            };

            this.encryptWithRsaOaep = function (data,successCallBack,failureCallBack) {
                if (publicKey && publicKey != undefined && publicKey != null && publicKey.toString().trim().length > 0) {
                    data = stringToArrayBuffer(data);
                    window.crypto.subtle.encrypt(
                        {
                            name: "RSA-OAEP",
                            //label: Uint8Array([...]) //optional
                        },
                        publicKey, //from generateKey or importKey above
                        data //ArrayBuffer of data you want to encrypt
                    ).then(function(encriptedText) {
                        encriptedText = arrayBufferToString(encriptedText);
                        encriptedText = window.btoa(encriptedText);
                        successCallBack(encriptedText);
                    }).catch (function (err){
                        failureCallBack(err);            
                    })
                }
            };

            this.convertEncriptedArrayToText = function(encriptedText){
                encriptedText = arrayBufferToString(encriptedText);
                return window.btoa(encriptedText);
            }

            this.importRsaKey = function(keyValue, successCallBack,failureCallBack) {
                // base64 decode the string to get the binary data
                const binaryDerString = window.atob(keyValue);
                // convert from a binary string to an ArrayBuffer
                const binaryDer = stringToArrayBuffer(binaryDerString);
            	
                 window.crypto.subtle.importKey(
                  "spki",
                  binaryDer,
                  {
                    name: "RSA-OAEP",
                    hash: "SHA-256"
                  },
                  true,
                  ["encrypt"]
                ).then(function(publicKey1){
                    publicKey = publicKey1;
                    successCallBack();
                }).catch(function(err){
                    failureCallBack(err);
                })
              };

              function stringToArrayBuffer(str) {
                const buf = new ArrayBuffer(str.length);
                const bufView = new Uint8Array(buf);
                for (let i = 0, strLen = str.length; i < strLen; i++) {
                  bufView[i] = str.charCodeAt(i);
                }
                return buf;
              }

              function arrayBufferToString(str){
                var byteArray = new Uint8Array(str);
                var byteString = '';
                for(var i=0; i < byteArray.byteLength; i++) {
                    byteString += String.fromCodePoint(byteArray[i]);
                }
                return byteString;
            }

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
                    var currDate = dateFilter(now, 'yyyy-MM-dd-HH-mm-ss');              
                    fileName = this.getDownloadableFileName(fileName);
                    fileName = fileName.replaceAll(' ', '-');
                    doc.download = fileName+'-'+currDate+'.'+fileType;
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

            this.titleCase = function(str) { 
            str = str.toLowerCase().split(' '); 
            for (var i = 0; i < str.length; i++) { 
            str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);  
            } 
            return str.join(' '); 
            }

            this.generateTimeString = function(hour, minute,second){
            period = "AM";
            if(hour > 12 ){
                period = "PM";
                hour = hour- 12;
            }
            if(minute < 10)  minute = '0'+minute;
            if(second < 10) second = '0'+second;
            return ","+hour + ":"+minute+":"+second+period;
        }
        }
    });
    mifosX.ng.services.service('CommonUtilService', ['$rootScope','webStorage','$http','dateFilter',mifosX.services.CommonUtilService]).run(function ($log) {
        $log.info("CommonUtilService initialized");
    });
}(mifosX.services || {}));