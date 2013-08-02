// Code that is shared between ReaderControl.js and MobileReaderControl.js
(function(exports) {
    "use strict";

    exports.ControlUtils = {};

    // polyfill for console object
    exports.console = exports.console || {
        log: function () { },
        warn: function () { },
        error: function () { },
        assert: function () { }
    };

    var isUndefined = function(val) {
        return typeof val === "undefined";
    };

    // get a map of the query string parameters
    exports.ControlUtils.getQueryStringMap = function() {
        var varMap = {};
        var queryString = window.location.search.substring(1);
        var fieldValPairs = queryString.split("&");
    
        for (var i = 0; i < fieldValPairs.length; i++) {
            var fieldVal = fieldValPairs[i].split("=");
            varMap[fieldVal[0]] = fieldVal[1];
        }
    
        return {
            getBoolean: function(field, defaultValue) {
                var value = varMap[field];
            
                if (!isUndefined(value)) {
                    value = value.toLowerCase();
                
                    if (value === "true" || value === "yes" || value === "1") {
                        return true;
                    } else if (value === "false" || value === "no" || value === "0") {
                        return false;
                    } else {
                        // convert to boolean
                        return !!field;
                    }
                } else {
                    if (isUndefined(defaultValue)) {
                        return null;
                    } else {
                        return defaultValue;
                    }
                }
            },
        
            getString: function(field, defaultValue) {
                var value = varMap[field];
            
                if (!isUndefined(value)) {
                    // convert '+' to spaces and unescape the string
                    return unescape(value.replace(/\+/g, " "));
                } else {
                    if (isUndefined(defaultValue)) {
                        return null;
                    } else {
                        return defaultValue;
                    }
                }
            }
        };
    };
    
    exports.ControlUtils.getCustomData = function() {
        var queryParams = exports.ControlUtils.getQueryStringMap();
        var customData = queryParams.getString("custom");
        if (customData === null) {
            return null;
        }
        
        return decodeURIComponent(customData);
    };

    exports.ControlUtils.getI18nOptions = function() {
        return {
            useCookie: false,
            useDataAttrOptions: true,
            defaultValueFromContent: false,
            fallbackLng: 'en',
            resGetPath: 'Resources/i18n/__ns__-__lng__.json',
            lng: 'en'
        };
    };

    // determine if the browser and server support the range header so we can decide to stream or not
    // note that this will not handle the case where the document is on a different domain than the viewer
    // and one server supports range requests and the other doesn't
    exports.ControlUtils.byteRangeCheck = function(onSuccess, onError) {
        $.ajax({
            url: window.location.href,
            type: "GET",
            cache: false,
            headers: {
                "Range": "bytes=0-0"
            },
            success: function(data, textStatus, jqXHR) {
                onSuccess(jqXHR.status);
            },
            error: function() {
                onError();
            }
        });
    };

}(window));