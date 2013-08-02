/**
 * ReaderControl config file
 * ------------------------------
 * This js file is meant to simplify configuring commonly used settings for ReaderControl.
 * You can override default settings through ReaderControl.config properties, or add JavaScript code directly here.
 */

(function() {

    //===========================================================================
    // Override the default style with ReaderControl.config
    // For more jQuery UI themes, visit: http://jqueryui.com/themeroller/
    //===========================================================================
    $.extend(ReaderControl.config, {
        customScript : 'defaultScriptExtension.js',
        serverURL : "annotationHandler.php",    //The server-side script that handles saving/loading of annotations
        defaultUser: 'Guest',
        customStyle: 'http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.0/themes/hot-sneaks/jquery-ui.css' //the css file can also be from an external source
    });

})();