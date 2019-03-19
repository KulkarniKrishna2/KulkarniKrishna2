(function (module) {
    mifosX.directives = _.extend(module, {
        NumberFormatDirective: function ($filter, $locale, $parse) {
            return {
                replace: false,
                require: 'ngModel',
                link: function (scope, element, attrs, modelCtrl) {
                    var filter = $filter('number');

                    function number(value, fractionLength) {
                        return filter(value, fractionLength);
                    };
                    function  withDecimal(n) {
                        var whole ;
                        if(n != "NaN") {
                            var nums = n.toString().split('.')
                            whole = convertNumberToWords(nums[0]);
                            decimal = nums[1];
                            if (nums.length == 2) {
                                if(decimal.length > 2) {
                                    decimal = decimal.slice(0,2);
                                }
                                var fraction = convertNumberToWords(decimal);
                                return whole + 'dot ' + fraction;
                            } else {
                                return whole;
                            }
                        }
                    };
                    function convertNumberToWords (amount) {
                        var words = new Array();
                        words[0] = '';
                        words[1] = 'One';
                        words[2] = 'Two';
                        words[3] = 'Three';
                        words[4] = 'Four';
                        words[5] = 'Five';
                        words[6] = 'Six';
                        words[7] = 'Seven';
                        words[8] = 'Eight';
                        words[9] = 'Nine';
                        words[10] = 'Ten';
                        words[11] = 'Eleven';
                        words[12] = 'Twelve';
                        words[13] = 'Thirteen';
                        words[14] = 'Fourteen';
                        words[15] = 'Fifteen';
                        words[16] = 'Sixteen';
                        words[17] = 'Seventeen';
                        words[18] = 'Eighteen';
                        words[19] = 'Nineteen';
                        words[20] = 'Twenty';
                        words[30] = 'Thirty';
                        words[40] = 'Forty';
                        words[50] = 'Fifty';
                        words[60] = 'Sixty';
                        words[70] = 'Seventy';
                        words[80] = 'Eighty';
                        words[90] = 'Ninety';

                        amount = amount.toString();
                        var atemp = amount.split(".");
                        var number = atemp[0].split(",").join("");
                        var n_length = number.length;
                        var words_string = "";
                        if (n_length <= 9) {
                            var n_array = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0);
                            var received_n_array = new Array();
                            for (var i = 0; i < n_length; i++) {
                                received_n_array[i] = number.substr(i, 1);
                            }

                            for (var i = 9 - n_length, j = 0; i < 9; i++, j++) {
                                n_array[i] = received_n_array[j];
                            }

                            for (var i = 0, j = 1; i < 9; i++, j++) {
                                if (i == 0 || i == 2 || i == 4 || i == 7) {
                                    if (n_array[i] == 1) {
                                        n_array[j] = 10 + parseInt(n_array[j]);
                                        n_array[i] = 0;
                                    }
                                }
                            }
                            value = "";
                            for (var i = 0; i < 9; i++) {
                                if (i == 0 || i == 2 || i == 4 || i == 7) {
                                    value = n_array[i] * 10;
                                } else {
                                    value = n_array[i];
                                }
                                if (value != 0) {
                                    words_string += words[value] + " ";
                                }
                                if ((i == 1 && value != 0) || (i == 0 && value != 0 && n_array[i + 1] == 0)) {
                                    words_string += "Crores ";
                                }
                                if ((i == 3 && value != 0) || (i == 2 && value != 0 && n_array[i + 1] == 0)) {
                                    words_string += "Lakhs ";
                                }
                                if ((i == 5 && value != 0) || (i == 4 && value != 0 && n_array[i + 1] == 0)) {
                                    words_string += "Thousand ";
                                }
                                if (i == 6 && value != 0 && (n_array[i + 1] != 0 && n_array[i + 2] != 0)) {
                                    words_string += "Hundred and ";
                                } else if (i == 6 && value != 0) {
                                    words_string += "Hundred ";
                                }
                            }
                            words_string = words_string.split("  ").join(" ");
                        }
                        return words_string;
                    };

                    function initialNumber(value) {
                        var DECIMAL_SEP = '.';
                        var decimalSep = $locale.NUMBER_FORMATS.DECIMAL_SEP;
                        var stringValue = modelCtrl.$modelValue + '';
                        var num = stringValue.toString();
                        if(stringValue != undefined && stringValue.indexOf(decimalSep) >0 && decimalSep != DECIMAL_SEP) {
                            num = num.replace(decimalSep, DECIMAL_SEP);
                        }
                        var fractionLength = (num.split(DECIMAL_SEP)[1] || []).length;

                        var initialnumber = $filter('number')(num, fractionLength);
                        if (stringValue != undefined && stringValue.indexOf(DECIMAL_SEP) > 0 &&  decimalSep!= DECIMAL_SEP) {
                            num = num.replace(DECIMAL_SEP, decimalSep);
                            var modelGetter = $parse(attrs['ngModel']);
                            // This returns a function that lets us set the value of the ng-model binding expression:
                            var modelSetter = modelGetter.assign;
                            // This is how you can use it to set the value 'bar' on the given scope.
                            modelSetter(scope, num);
                        }
                        return initialnumber;
                    }

                    function initialNumberToWords(value) {
                        if(value) {
                            scope.amountInwords = withDecimal(value);
                            return scope.amountInwords;
                        }
                    }

                    modelCtrl.$formatters.push(initialNumber, initialNumberToWords);

                    modelCtrl.$parsers.push(function (stringValue) {
                        if (stringValue) {
                            var index = stringValue.indexOf($locale.NUMBER_FORMATS.DECIMAL_SEP),
                                decimal,
                                fraction,
                                fractionLength;
                            if (index >= 0) {
                                decimal = stringValue.substring(0, index);
                                fraction = stringValue.substring(index + 1);
                                if (index != stringValue.length - 1)
                                    fractionLength = fraction.length;
                                else
                                    fractionLength = 0;
                            } else {
                                decimal = stringValue;
                                fraction = '';
                            }
                            decimal = decimal.replace(/[^0-9]/g, '');
                            fraction = fraction.replace(/[^0-9]/g, '');
                            var result = decimal;
                            if (fraction.length > 0) {
                                result = result + $locale.NUMBER_FORMATS.DECIMAL_SEP + fraction;
                            }
                            var viewValue = +(decimal + '.' + fraction);
                            if (result !== modelCtrl.$modelValue) {
                                scope.$evalAsync(function () {
                                    scope.amountInwords = withDecimal(viewValue);
                                    modelCtrl.$viewValue = number(viewValue, fractionLength);
                                    modelCtrl.$render();
                                });
                            }
                            return result;
                        }
                    });

                    scope.$on('$localeChangeSuccess', function (event, localeId) {
                        modelCtrl.$viewValue = $filter('number')(modelCtrl.$modelValue);
                        modelCtrl.$render();
                    });

                }
            };
        }
    });
}(mifosX.directives || {}));
mifosX.ng.application.directive("numberFormat", ['$filter', '$locale','$parse', mifosX.directives.NumberFormatDirective]).run(function ($log) {
    $log.info("NumberFormatDirective initialized");
});

