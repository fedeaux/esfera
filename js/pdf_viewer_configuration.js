(function() {
    i18n.setLng('pt_br', function() {
     	$('body').i18n();
    });

    $('#fullScreenButton').remove();
    $('#rotateButton').remove();
    $('[data-display-mode=facing]').remove();
    $('[data-display-mode=facing-cont]').remove();
    $('[data-display-mode=cover]').remove();
    $('.separator:first').remove();
    $('.separator:last').remove();
})();

/**
 * ReaderControl config file
 * ------------------------------
 * This js file is meant to simplify configuring commonly used settings for ReaderControl.
 * You can override default settings through ReaderControl.config properties, or add JavaScript code directly here.
 */

(function() {
    //=========================================================
    // Hide a UI component through ReaderControl.config
    //=========================================================
    $.extend(ReaderControl.config, {
        //configuration options go here
        customScript : 'defaultScriptExtension.js',
        ui:{
            hideZoom : false
        }
    });

    //=========================================================
    // Add a button to the toolbar
    //=========================================================
    //  Add an about button to the tool bar that pops up
    //  a dialog with viewer branding and information.
    $("<button>").attr({
        'id': 'optionsButton',
        'class' : 'ui-ele'
    })
    .text('About')
        .prependTo($("#control")).button({
            text: false,
            icons: {
                primary: "ui-icon-info"
            }
        }).click(function(){
            var message = '<div style="margin: 5px 0"><img src="//www.pdftron.com/assets/images/logos/pdftron_logo.gif"></div>';
            message += '<div>HTML5 WebViewer Version ' + readerControl.docViewer.version 
            +'<br/><a href="http://www.pdftron.com" target="_blank">www.pdftron.com</a></div>';
            message += ''
            message += "<p>The ReaderControl is a full-featured and customizable web component extended from the PDFNet WebViewer library.</p>";
        
        
            $.alert(message, "About ReaderControl");
        });
        
        
    //=========================================================
    // Add a button with a dropdown menu to the toolbar
    //=========================================================
    $('<ul>').addClass('ui-widget ui-menu-dropdown').attr('id', 'optionsMenuList').hide()
        .append("<li><a href=\"#\">Option 1</a></li>")
        .append("<li><a href=\"#\">Option 2</a></li>")
        .appendTo('body');
            
    $("<button>").attr({
        'id': 'optionsButton',
        'class' : 'ui-ele'
    })
    .text('Options')
        .prependTo($("#control")).button({
            text: false,
            icons: {
                primary: "ui-icon-gear"
            //            secondary: "ui-icon-triangle-1-s"
            }
        }).click(function(){      
           
            var menu = $( '#optionsMenuList' );
            if(menu.data("isOpen")){
                menu.hide();
                menu.data("isOpen", false);
            }else{
                menu.show().position({
                    my: "left top",
                    at: "left bottom",
                    of: this
                });
                       
                $( document ).one( "click", function() {
                    menu.hide();
                    menu.data("isOpen", false);
                });
                menu.data("isOpen", true);
            }
            return false;
        });

    var rc = this;

    //=========================================================
    // Hide a button
    //=========================================================
    $('#fullScreenButton').hide();


    //=========================================================
    // Skip to page 3 on document load
    //=========================================================
    $(document).bind("documentLoaded", function(event){
        //document finished loading
        readerControl.setCurrentPageNumber(3);
    });

    $(document).bind("pageCompleted", function(event, pageNumber) {
        //a page has finished rendering
        console.log(pageNumber);
    });
    
});
