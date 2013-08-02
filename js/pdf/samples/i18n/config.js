/**
 * ReaderControl config file
 * ------------------------------
 * This js file is meant to simplify configuring commonly used settings for ReaderControl.
 * You can override default settings through ReaderControl.config properties, or add JavaScript code directly here.
 */

(function() {
    //=========================================================
    // Add a button with a dropdown menu to the toolbar
    //=========================================================
    $('<ul>').addClass('ui-widget ui-menu-dropdown').attr('id', 'optionsMenuList').hide()
        .append("<li data-lang='en'><a href=\"#\">English</a></li>")
        .append("<li data-lang='fr'><a href=\"#\">Français</a></li>")
        .append("<li data-lang='ru'><a href=\"#\">Русский</a></li>")
        .append("<li data-lang='pt_br'><a href=\"#\">Português Brasileiro</a></li>")
        .append("<li data-lang='es'><a href=\"#\">Español</a></li>")
        .append("<li data-lang='gl'><a href=\"#\">Galego</a></li>")
        .menu({
            select: function(event, ui) {
                var languageCode = $(ui.item).data('lang');

                i18n.setLng(languageCode, function() {
                    $('body').i18n();
                });
            }
        })
        .appendTo('body');
    
    $('<div>').addClass('separator ui-ele').appendTo($('#control'));
    
    $("<button>").attr({
        'id': 'optionsButton',
        'class' : 'ui-ele'
    })
    .text('Set Language')
    .appendTo($("#control")).button({
        text: false,
        icons: {
            primary: "ui-icon-flag"
        }
    }).click(function() {      
       
        var menu = $('#optionsMenuList');
        if (menu.data("isOpen")) {
            menu.hide();
            menu.data("isOpen", false);
        } else {
            menu.show().position({
                my: "left top",
                at: "left bottom",
                of: this
            });
                   
            $(document).one( "click", function() {
                menu.hide();
                menu.data("isOpen", false);
            });
            menu.data("isOpen", true);
        }
        return false;
    });
    
})();