/*global Modernizr */
(function(exports) {
    "use strict";
    
    exports.ReaderControl = exports.ReaderControl || {};
    
    var Text = XODText;
    var CoreControls = exports.CoreControls;
    // var Annotations = exports.Annotations;
    // var Tools = exports.Tools;

    /**
     *
     * Creates a new instance of ReaderControl
     * @name ReaderControl
     * @class Represents the full-featured ReaderControl reusable UI component that extends DocumentViewer.
     * @see ReaderControl.html ReaderControl.js ReaderControl.css
     * @param {element} viewerElement an element containing a DocumentViewer.
     **/
    exports.ReaderControl = function(viewerElement, enableAnnot, enableOffline) {
        var me = this;
        
        this.enableAnnotations  = enableAnnot ? true : false;
        this.enableOffline = enableOffline ? true : false;
        this.docViewer = new exports.CoreControls.DocumentViewer();
        this.docViewer.SetOptions({
            enableAnnotations: this.enableAnnotations
        });
        this.onLoadedCallback = null;
        this.doc_id = null;
        this.server_url = null;
        this.currUser = '';
        
        if (typeof ReaderControl.config !== "undefined" && typeof ReaderControl.config.defaultUser !== "undefined") {
            this.currUser = ReaderControl.config.defaultUser;
            
            //load custom CSS file
            if (typeof ReaderControl.config.customStyle !== "undefined") {
                $("<link>").appendTo("head").attr({
                    rel: "stylesheet",
                    type: "text/css",
                    href: ReaderControl.config.customStyle
                });
            }
            
            //load custom javaScript file
            if (typeof ReaderControl.config.customScript !== "undefined") {
                $.getScript(ReaderControl.config.customScript, function(data, textStatus, jqxhr) {
                    /*jshint unused:false */
                    //custom script was loaded
                });
            }
        }
        
        if (typeof ReaderControl.config !== "undefined" && typeof ReaderControl.config.serverURL !== "undefined") {
            this.server_url = ReaderControl.config.serverURL;
        }
        
        this.isAdmin = false;
        this.readOnly = undefined;

        this.thumbContainerWidth = 180;
        this.thumbContainerHeight = 200;
        this.thumbs = [];
        this.requestedThumbs = [];
        this.clickedThumb = -1;

        this.clickedSearchResult = -1;
        this.clickedBookMark = -1;
        
        // Key binding.
        var ctrlDown = false;
        var altDown = false;
        var fKey = 70;
        var ctrlKey = 17;
        var altKey = 18;
        var leftArrowKey = 37;
        var upArrowKey = 38;
        var rightArrowKey = 39;
        var downArrowKey = 40;
        var cKey = 67;
        var vKey = 86;
        var sKey = 83;
        var tKey = 84;
        // var pageUpKey = 33, pageDownKey = 34;
        
        this.initUI();

        $(exports).keydown(function(e) {
            if (e.keyCode === ctrlKey || e.metaKey || e.ctrlKey) {
                ctrlDown = true;
            }
            if (e.keyCode === altKey) {
                altDown = true;
            }
            
            var am = me.docViewer.GetAnnotationManager();
            if (ctrlDown) {
                if (e.keyCode === fKey) {
                    document.getElementById('searchBox').focus();
                    return false;
                } else {
                    // Document navigation
                    var currentPage = me.docViewer.GetCurrentPage();
                    if (e.keyCode === leftArrowKey) {
                        if (currentPage > 1) {
                            me.docViewer.SetCurrentPage(currentPage - 1);
                        }
                    } else if (e.keyCode === upArrowKey) {
                        if (currentPage > 1) {
                            me.docViewer.SetCurrentPage(currentPage - 1);
                        }
                    } else if (e.keyCode === rightArrowKey) {
                        if (currentPage <= me.docViewer.GetPageCount()) {
                            me.docViewer.SetCurrentPage(currentPage + 1);
                        }
                    } else if (e.keyCode === downArrowKey) {
                        if (currentPage <= me.docViewer.GetPageCount()) {
                            me.docViewer.SetCurrentPage(currentPage + 1);
                        }
                    } else if (e.keyCode === cKey && me.enableAnnotations) {
                        if (am) {
                            am.UpdateCopiedAnnotations();
                        }
                    } else if (e.keyCode === vKey && me.enableAnnotations) {
                        if (am) {
                            am.PasteCopiedAnnotations();
                        }
                    }
                }
            }
            else if (altDown) {
                if (e.keyCode === sKey && me.enableAnnotations) {
                    me.saveAnnotations();
                } else if (e.keyCode === tKey && me.enableAnnotations) {
                    if (am) {
                        am.ToggleAnnotations();
                        var ToolModes = me.docViewer.ToolModes;
                        me.docViewer.SetToolMode(ToolModes.TextSelect);
                    }
                }
            }
            // else {
            //     var displayMode = me.docViewer.GetDisplayModeManager().GetDisplayMode();
                
                // if (displayMode.mode === 'Single') { //|| displayMode === me.docViewer.DisplayMode.Cover || displayMode === me.docViewer.DisplayMode.Facing) {
                //     if (e.keyCode == pageDownKey) {

                //         //http://stackoverflow.com/questions/3898130/how-to-check-if-a-user-has-scrolled-to-the-bottom
                //         if ($(exports).scrollTop() + $(exports).height() == $(iframe.contentDocument).height()) {
                //             e.preventDefault(); //prevent the default page down behavior to affect us after we scroll to the top
                //             me.GoToNextPage();
                //             $(iframe.contentDocument).scrollTop(0);
                //         }
                //     } else if (e.keyCode == pageUpKey) {
                //         if ($(exports).scrollTop() == 0) {
                //             e.preventDefault(); //prevent the default page up behavior to affect us after we scroll to the bottom
                //             me.GoToPrevPage();
                //             $(iframe.contentDocument).scrollTop($(iframe.contentDocument).height());
                //         }
                //     }
                // }
            // }
            
        }).keyup(function(e) {
            if (e.keyCode === ctrlKey || e.metaKey || e.ctrlKey) {
                ctrlDown = false;
            }
            else if (e.keyCode === altKey) {
                altDown = false;
            }
        });

        var $viewerElement = $(viewerElement);
        $viewerElement.bind('mousewheel', function(event, delta) {
            var displayMode = me.docViewer.GetDisplayModeManager().GetDisplayMode();
            if (displayMode.IsContinuous()) {
                // don't need to scroll between pages if we're in continuous mode
                return;
            }
            
            var pageNum;
            if (delta < 0) {
                // scrolling down
                if ($viewerElement.scrollTop() + $viewerElement.height() >= $viewerElement[0].scrollHeight) {
                    pageNum = getChangedPageIndex(1);
                    if (pageNum >= 0) {
                        me.docViewer.SetCurrentPage(pageNum + 1);
                    }
                }
            } else if (delta > 0) {
                // scrolling up
                if ($viewerElement.scrollTop() === 0) {
                    pageNum = getChangedPageIndex(-1);
                    if (pageNum >= 0) {
                        me.docViewer.SetCurrentPage(pageNum + 1);
                        // scroll to the bottom of the new page
                        $viewerElement.scrollTop($viewerElement[0].scrollHeight);
                    }
                }
            }
        });
        
        // Get the updated page index when increasing the row by "change", returns -1 if that row would be invalid
        var getChangedPageIndex = function(change) {
            var displayMode = me.docViewer.GetDisplayModeManager().GetDisplayMode();
            var cols = (displayMode.mode === exports.CoreControls.DisplayModes.Single) ? 1 : 2;
            
            var rowNum;
            if (displayMode.mode === exports.CoreControls.DisplayModes.CoverFacing) {
                rowNum = Math.floor(me.docViewer.GetCurrentPage() / cols);
            } else {
                rowNum = Math.floor((me.docViewer.GetCurrentPage() - 1) / cols);
            }
            
            rowNum += change;
            var pageIndex = rowNum * cols;
            
            if (displayMode.mode === exports.CoreControls.DisplayModes.CoverFacing) {
                if (pageIndex === 0) {
                    return 0;
                } else if (pageIndex < (me.docViewer.GetPageCount() + 1)) {
                    return pageIndex - 1;
                } else {
                    return -1;
                }
            } else {
                if (pageIndex < me.docViewer.GetPageCount()) {
                    return pageIndex;
                } else {
                    return -1;
                }
            }
        };
        
        //use this to avoid dependency on underscore. i.e. //me.docViewer.SetDocumentLoadedCallback( _(this.onDocumentLoaded).bind(this));
        me.docViewer.SetDocumentLoadedCallback(function() {
            me.onDocumentLoaded.call(me);
        });
        
        me.docViewer.SetAlertCallback(function(type) {
            switch (type) {
                case "permissionEdit":
                    alert(i18n.t("annotations.permissionEdit"));
                    break;
                case "permissionDelete":
                    alert(i18n.t("annotations.permissionDelete"));
                    break;
                case "readOnlyCreate":
                    alert(i18n.t("annotations.readOnlyCreate"));
                    break;
                case "readOnlyDelete":
                    alert(i18n.t("annotations.readOnlyDelete"));
                    break;
                case "readOnlyEdit":
                    alert(i18n.t("annotations.readOnlyEdit"));
                    break;
                case "markupOffCreate":
                    alert(i18n.t("annotations.markupOffCreate"));
                    break;
            }
        });
        
        this.$thumbnailViewContainer = $("#thumbnailView");
        this.$thumbnailViewContainer.scroll(function() {
            clearTimeout(me.thumbnailRenderTimeout);
       
            me.thumbnailRenderTimeout = setTimeout(function() {
                me.appendThumbs(me.getVisibleThumbs());
            }, 80);
        });
        
        $('#lastPage').bind('click', function() {
            me.docViewer.DisplayLastPage();
        });
        
        $('#zoomBox').bind('change', function() {
            var input = this.value;
            var number = parseInt(input, 10);
            if (isNaN(number)) {
                alert("'" + input + "' is not a valid zoom level.");
            } else {
                var zoom = number / 100.0;
                if (zoom <= 0.05) {
                    zoom = 0.05;
                } else if (zoom > 5.0) {
                    zoom = 5.0;
                }
                me.docViewer.ZoomTo(zoom);
            }
        });
        
        me.docViewer.SetZoomUpdatedCallback(function(zoom) {
            var zoomVal = Math.round(zoom * 100);
            
            $('#zoomBox').val(zoomVal);
            if ($("#slider").slider("value") !== zoomVal) {
                $("#slider").slider({
                    value: zoomVal
                });
            }
            me.fireEvent('zoomChanged', [zoom]);
        });
        
        function resizeWindow() {
            //find the height of the internal page
            var scrollContainer = document.getElementById('DocumentViewer');
                
            //change the height of the viewer element
            var viewerHeight = window.innerHeight;
            var $controlToolbar = $("#control");
            if ($controlToolbar.is(':visible')) {
                viewerHeight -= $controlToolbar.outerHeight();
            }
            
            $(scrollContainer).height(viewerHeight);
            scrollContainer.width = window.innerWidth;
            
            $('#sidePanel').css('height', viewerHeight);
            $('#tabs').css('height', viewerHeight - 7);
            $('#fullSearchView').css('height', viewerHeight - 120);
            $('#bookmarkView').css('height', viewerHeight - 53);
            $('#thumbnailView').css('height', viewerHeight - 53);
        }
        resizeWindow();
        
        $(window).resize(function() {
            resizeWindow();
            $("#thumbnailView").trigger('scroll');
        });
        
        $("#slider").slider({
            slide: function(event, ui) {
                var number = parseInt(ui.value, 10);
                if (isNaN(number)) {
                    alert("'" + number + "' is not a valid zoom level.");
                } else {
                    clearTimeout(me.zoomSliderTimeout);
                    me.zoomSliderTimeout = setTimeout(function() {
                        me.docViewer.ZoomTo(number / 100.0);
                    }, 50);
                }
            }
        });
        
        $('#pageNumberBox').keyup(function(e) {
            // check for the enter key
            if (e.keyCode === 13) {
                var input = this.value;
                var number = parseInt(input, 10);
                if (isNaN(number) || number > me.docViewer.GetPageCount()) {
                    $('#pageNumberBox').val(me.docViewer.GetCurrentPage());
                } else {
                    me.docViewer.SetCurrentPage(number);
                }
            }
        });
        
        me.docViewer.SetToolModeUpdatedCallback(function(toolMode) {
            
            var pan = $('#pan');
            var textSelect = $('#textSelect');
            pan.get(0).checked = false;
            textSelect.get(0).checked = false;
            if (toolMode === me.docViewer.ToolModes.Pan) {
                pan.get(0).checked = true;
            } else if (toolMode === me.docViewer.ToolModes.TextSelect) {
                textSelect.get(0).checked = true;
            }
            pan.button("refresh");
            textSelect.button("refresh");
            me.fireEvent('toolModeChanged', [toolMode]);
        });

        me.docViewer.SetPageNumberUpdatedCallback(function(pageNumber) {
            $('#pageNumberBox').val(pageNumber);
            var pageIndex = pageNumber - 1;
            
            if (me.clickedThumb !== -1) {
                $("#thumbContainer" + me.clickedThumb).removeClass('ui-state-active');
            }

            if (typeof me.thumbnailsElement !== 'undefined') {
                var divTop = me.thumbnailsElement.scrollTop;
                var divBottom = divTop + me.thumbnailsElement.offsetHeight;
                var top = pageIndex * me.thumbContainerHeight;
                var bottom = top + me.thumbContainerHeight;

                if (!(top >= divTop && bottom <= divBottom)) {
                    me.thumbnailsElement.scrollTop = pageIndex * me.thumbContainerHeight;
                }
            }
            
            me.clickedThumb = pageIndex;
            $("#thumbContainer" + pageIndex).addClass('ui-state-active');
            
            me.fireEvent('pageChanged',[pageNumber]);
        });
        
        $('#fitWidth').click(function() {
            me.docViewer.SetFitMode(me.docViewer.FitMode.FitWidth);
        });
        
        $('#fitPage').click(function() {
            me.docViewer.SetFitMode(me.docViewer.FitMode.FitPage);
        });
        
        $("#pan").click(function() {
            me.docViewer.SetToolMode(me.docViewer.ToolModes.Pan);
        });
        
        $("#textSelect").click(function() {
            me.docViewer.SetToolMode(me.docViewer.ToolModes.TextSelect);
        });

        $('#fullScreenButton').click(function() {
            if (document.fullscreen) {
                document.exitFullscreen();
                return;
            } else if (document.mozFullScreen) {
                document.mozCancelFullScreen();
                return;
            } else if(document.webkitIsFullScreen) {
                document.webkitCancelFullScreen();
                return;
            }
            
            var docElm = document.documentElement;
            if (docElm.requestFullscreen) {
                docElm.requestFullscreen();
            } else if (docElm.mozRequestFullScreen) {
                docElm.mozRequestFullScreen();
            } else if (docElm.webkitRequestFullScreen) {
                docElm.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
            }
        });
        
        me.docViewer.SetTextSelectedCallback(function(quads, text) {
            var $clipboard = $("#clipboard");
            var clipboard = $clipboard.get(0);

            clipboard.value = text;
            if (text.length > 0) {
                $clipboard.show();
                clipboard.focus();
                clipboard.selectionStart = 0;
                clipboard.setSelectionRange(0, clipboard.value.length);
            } else {
                $clipboard.hide();
            }
        });
        
        me.docViewer.GetDisplayModeManager().SetDisplayModeUpdatedCallback(function() {
            var displayMode = me.docViewer.GetDisplayModeManager().GetDisplayMode();
            var displayModes = exports.CoreControls.DisplayModes;
            var title = "Single";
            var displayModeIconClass = 'ui-icon-custom-page-single';
            
            if (displayMode.mode === displayModes.Single) {
                title = "Single";
                displayModeIconClass = 'ui-icon-custom-page-single';
            } else if (displayMode.mode === displayModes.Continuous) {
                title = "Continuous";
                displayModeIconClass = 'ui-icon-custom-page-single-cont';
            } else if (displayMode.mode === displayModes.Facing) {
                title = "Facing";
                displayModeIconClass = 'ui-icon-custom-page-facing';
            } else if (displayMode.mode === displayModes.FacingContinuous) {
                title = "Facing Continuous";
                displayModeIconClass = 'ui-icon-custom-page-facing-cont';
            } else if (displayMode.mode === displayModes.Cover) {
                // title = "Cover";
                // displayModeIconClass = 'ui-icon-custom-page-cover';
                title = "Cover Continuous";
                displayModeIconClass = 'ui-icon-custom-page-cover-cont';
            } else if (displayMode.mode === displayModes.CoverFacing) {
                // title = "Cover Continuous";
                // displayModeIconClass = 'ui-icon-custom-page-cover-cont';
                title = "Cover";
                displayModeIconClass = 'ui-icon-custom-page-cover';
            }
            
            $("#displayModeMenuButton")
            .button( "option", {
                //label: title,
                icons: {
                    primary: displayModeIconClass,
                    secondary: "ui-icon-triangle-1-s"
                }
            });

            me.fireEvent('displayModeChanged', [displayMode]);
        });
        
        me.docViewer.SetFitModeUpdatedCallback(function(fitMode) {
            var fitWidth = $('#fitWidth');
            var fitPage = $('#fitPage');
            
            if (fitMode === me.docViewer.FitMode.FitWidth) {
                fitWidth[0].checked = true;
                fitPage[0].checked = false;
            } else if (fitMode === me.docViewer.FitMode.FitPage) {
                fitWidth[0].checked = false;
                fitPage[0].checked = true;
            } else {
                // Zoom mode.
                fitWidth[0].checked = false;
                fitPage[0].checked = false;
            }
            fitWidth.button("refresh");
            fitPage.button("refresh");
            
            me.fireEvent('fitModeChanged', [fitMode]);
        });
        
        // //Example of overriding the default link appearance and behavior
        // //==============================================================
        // me.docViewer.SetLinkReadyCallback(function(linkElement, link){
        //    if(link instanceof CoreControls.Hyperlink){
        //        linkElement.onclick = function(){
        //            //external link clicked
        //            window.open(link.GetTarget());
        //        };
    
        //    }else if(link instanceof CoreControls.Link) {
        //        linkElement.parentClick = linkElement.onclick;
        //        linkElement.onclick = function(){
        //            this.parentClick();
        //        //override the default behavior of internal links
        //        };
        //    }
        // });

        ////Example of inserting custom content on top of a page
        ////==============================================================
        //me.docViewer.SetPageCompleteCallback(function(pageIndex){
        //    var pageContainer = me.getPageContainer(pageIndex);
        //    pageContainer.append('<div style="position:relative; float:right">Watermark Text</div>');
        //    //note that dom elements appended need to have the position:relative style to show up correctly
        //    //also by default, text selection on div elements is disabled
        //});
        
        me.docViewer.SetPageCompleteCallback(function(pageIndex) {
            if (me.hideAnnotations) {
                var pageAnnotCanvas = me.docViewer.getAuxiliaryCanvas(pageIndex);
                $(pageAnnotCanvas).hide();
            }
            
            me.fireEvent("pageCompleted", [pageIndex + 1]);
        });
    };

    exports.ReaderControl.prototype = {
        /**
         * Initialize UI controls.
         * @ignore
         */
        initUI: function(){
            var me = this;
            $("#fitWidth").button({
                text: false,
                icons: {
                    primary: 'ui-icon-custom-fit-width'
                }
            });
            $("#fitPage").button({
                text: false,
                icons: {
                    primary: 'ui-icon-custom-fit-page'
                }
            });
            $("#pan").button({
                text: false,
                icons: {
                    primary: 'ui-icon-custom-tool-pan'
                }
            });
            $("#textSelect").button({
                text: false,
                icons: {
                    primary: 'ui-icon-custom-tool-text'
                }
            });
        
            $("#beginning").button({
                text: false,
                icons: {
                    primary: "ui-icon-seek-start"
                }
            });
            $("#prevPage").button({
                text: false,
                icons: {
                    primary: "ui-icon-custom-prev"
                }
            });
            $("#nextPage").button({
                text: false,
                icons: {
                    primary: "ui-icon-custom-next"
                }
            });
            $("#rotateButton").button({
                text: false,
                icons: {
                    primary: "ui-icon-custom-rotate"
                }
            });
            $("#searchButton").button({
                text: false,
                icons: {
                    primary: "ui-icon-custom-search"
                }
            });
            $("#toggleSidePanel").button({
                text: false,
                icons: {
                    primary: "ui-icon-pin-s"
                }
            }).click(function() {
                $("#sidePanel").toggle();
                var iconClass = $('#sidePanel').is(':visible') ? "ui-icon-pin-s" : "ui-icon-pin-w";
                $(this).button("option", {
                    icons: {
                        primary: iconClass
                    }
                });
            });
        
            
            $("#fitModes").buttonset();
            $("#tools").buttonset();
                
            $("#slider").slider({
                min: 5,
                max: 500,
                value: 100,
                animate: true
            });
            
            
            $("#displayModeMenuButton")
            .button({
                text: false,
                icons: {
                    primary: "ui-icon-custom-page-single",
                    secondary: "ui-icon-triangle-1-s"
                }
            })
            .click(function() {
                var menu = $('#displayModeMenuList');
                if (menu.data("isOpen")) {
                    menu.hide();
                    menu.data("isOpen", false);
                } else {
                    menu.show().position({
                        my: "left top",
                        at: "left bottom",
                        of: this
                    });
                   
                    $(document).one("click", function() {
                        menu.hide();
                        menu.data("isOpen", false);
                    });
                    menu.data("isOpen", true);
                }
                return false;
            });
            
            $('#optionsMenuList').hide().menu();
            
            $('#displayModeMenuList').hide()
            .data("isOpen", false)
            .menu({
                select: function(event, ui) {
                    var displayModeVal = $(ui.item).data('display-mode');
                    var displayModes = exports.CoreControls.DisplayModes;
                    var displayMode;
                    switch(displayModeVal) {
                        case 'single':
                            displayMode = new exports.CoreControls.DisplayMode(me.docViewer, displayModes.Single);
                            break;
                        case 'single-cont':
                            displayMode = new exports.CoreControls.DisplayMode(me.docViewer, displayModes.Continuous);
                            break;
                        case 'facing':
                            displayMode = new exports.CoreControls.DisplayMode(me.docViewer, displayModes.Facing);
                            break;
                        case 'facing-cont':
                            displayMode = new exports.CoreControls.DisplayMode(me.docViewer, displayModes.FacingContinuous);
                            break;
                        case 'cover':
                            displayMode = new exports.CoreControls.DisplayMode(me.docViewer, displayModes.CoverFacing);
                            //displayMode = me.docViewer.DisplayMode.Cover;
                            break;
                        case 'cover-cont':
                            displayMode = new exports.CoreControls.DisplayMode(me.docViewer, displayModes.Cover);
                            //displayMode = me.docViewer.DisplayMode.CoverFacing;
                            break;
                    }
                    me.docViewer.GetDisplayModeManager().SetDisplayMode(displayMode);
                }
            });
            
            
            var $tabs = $("#tabs");
            $tabs.tabs({
                cache: true
            });

            var annotInitialized = false;
            if (this.enableAnnotations) {
                /*Ajax load the annotation panel.
                 *Note: loading it directly here because we want the JS to run right away.
                 */
                if (!ReaderControl.config.ui.hideAnnotationPanel && !annotInitialized) {
                    var li = $('<li><a href="#tabs-4"><span class="ui-icon ui-icon-custom-note" data-i18n="[title]sidepanel.annotations"/></a></li>');
                    $tabs.find(".ui-tabs-nav").append(li);
                    $("#tabs-4").load('AnnotationPanel.html', function() {
                        // translate the tab when finished loading
                        $('#tabs-4').i18n();
                    }).appendTo($tabs);
                    
                    $tabs.tabs("refresh");
                }
            }
            
            var $sidePanel = $("#sidePanel");
            if (!Modernizr.csstransitions) {
                /*Animate the side panel if CSS3 transitions is not supported*/
                $sidePanel.hover(function() {
                    $sidePanel.stop(true).animate({
                        left: '0px'
                    }, {
                        duration: 250
                    });
                }, function() {
                    $sidePanel.stop(true).delay(3000).animate({
                        left: '-188px'
                    }, {
                        duration: 400
                    });
                });
            }
            
            if (Modernizr.fullscreen) {
                $("#fullScreenButton").button({
                    text: false,
                    icons: {
                        primary: "ui-icon-custom-screen"
                    }
                });
            } else {
                $("#fullScreenButton").hide().next('div.separator').hide();
            }
            
            if (!ReaderControl.config.ui.hideControlBar) {
                $("#control").show();
                
                if (ReaderControl.config.ui.hideDisplayModes) {
                    document.getElementById('displayModes').parentNode.style.visibility = 'hidden';
                }
                
                var par, separator;
                if (ReaderControl.config.ui.hideTextSearch) {
                    var searchButton = document.getElementById('searchButton');
                    par = searchButton.parentNode;
                    par.removeChild(searchButton);
                    var searchBox = document.getElementById('searchBox');
                    separator = searchBox.nextElementSibling;
                    par.removeChild(searchBox);
                    par.removeChild(separator);
                }
                if (ReaderControl.config.ui.hideZoom) {
                    var zoomBox = document.getElementById('zoomBox');
                    par = zoomBox.parentNode;
                    par.removeChild(zoomBox);
                    var slider = document.getElementById('slider');
                    par.removeChild(slider);
                    var zoomPercent = document.getElementById('zoomPercent');
                    separator = zoomPercent.nextElementSibling;
                    par.removeChild(zoomPercent);
                    par.removeChild(separator);
                }
            }
            
            if (!ReaderControl.config.ui.hideSidePanel) {
                $("#sidePanel").show();
            } else {
                document.getElementById('toggleSidePanel').style.visibility = 'hidden';
            }
            
            if (this.onLoadedCallback) {
                this.onLoadedCallback();
            }
            /*http://forum.jquery.com/topic/chrome-text-select-cursor-on-drag */
            document.onselectstart = function (e) {
                if (!$(e.target).is('input')) {
                    return false;
                }
            };
            
            $.extend({
                alert: function (message, title) {
                    
                    $(document.createElement('div'))
                    .html(message)
                    .dialog({
                        // buttons: {
                        //     OK: function() {
                        //         $(this).dialog('close');
                        //     }
                        // },
                        close: function() {
                            $(this).remove();
                        },
                        dialogClass: 'alert',
                        title: title,
                        //draggable: true,
                        modal: true,
                        resizable: false
                        //width: 'auto'
                    });
        
                    // $("<div></div>").dialog( {
                    //     buttons: {
                    //         "Ok": function () {
                    //             $(this).dialog("close");
                    //         }
                    //     },
                    //     close: function (event, ui) {
                    //         $(this).remove();
                    //     },
                    //     resizable: false,
                    //     title: title,
                    //     modal: true
                    // }).text(message);
                }
            });
        },
        
        setLoadedCallback: function(callback) {
            this.onLoadedCallback = callback;
        },
        
        onDocumentLoaded: function() {
            var me = this;
            me.clearSidePanelData();
            me.initBookmarkView();
            me.initThumbnailView();
            me.initSearchView();
            me.setInterfaceDefaults();
            me.bindEvents();
                    
                
            //// Programmatically create a rectangle
            ////----------------------------------------------
            //var am = me.docViewer.GetAnnotationManager();
            //var rectAnnot = new Annotations.RectangleAnnotation();
            //rectAnnot.X =(500);
            //rectAnnot.Y =(100);
            //rectAnnot.Width =(500);
            //rectAnnot.Height =(100);
            //rectAnnot.PageNumber = 1;
            //rectAnnot.Author = this.currUser;
            //rectAnnot.FillColor = new Annotations.Color(0,255,0);
            //rectAnnot.StrokeColor =  new Annotations.Color(255,0,0);
            //rectAnnot.StrokeThickness = 1;
            //am.AddAnnotation(rectAnnot);

            ////Load existing annotations for this document
            ////----------------------------------------------
            var am = me.docViewer.GetAnnotationManager();
            am.SetCurrentUser(this.currUser);
            am.SetIsAdminUser(this.isAdmin);
            am.SetReadOnly(this.readOnly);

            if (this.server_url === null) {
                console.warn("Server URL was not specified.");
            } else {
                var queryData = {};
                
                var query = '';
                if (this.doc_id !== null && this.doc_id.length > 0) {
                    queryData = {
                        'did': this.doc_id
                    };
                    query = '?did=' + this.doc_id;
                }else{
                    query = '';
                    //Document id is not available. did will not be set for server-side annotation handling.
                }

                $.ajax({
                    url: this.server_url + query,
                    cache: false,
                    data : queryData,
                    success: function(data) {
                        if (data !== null) {
                            am.externalAnnotsExist = true;
                            am.LoadAnnotations(data);
                        }
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        /*jshint unused:false */
                        console.warn("Annotations could not be loaded from the server.");
                        am.externalAnnotsExist = false;
                        //am.LoadAnnotations();
                    },
                    dataType: 'xml'
                });

                ////Enable timer for auto-saving
                ////----------------------------------------------
                //var updateAnnotsID = setInterval(this.updateAnnotations.bind(this), 300000);
            }
            
            
            if (this.enableOffline && (Modernizr.indexeddb || Modernizr.websqldatabase)) {
                me.docViewer.GetDocument().InitOfflineDB(function() {
                    me.offlineReady();
                });
            }
            
            me.fireEvent('documentLoaded');
        },
        
        offlineReady: function() {
            var me = this;
            
            var controlGroup = $('#control');
            $('<div>').addClass('separator ui-ele').appendTo(controlGroup);
            
            // download button
            $('<button>').attr({
                'id': 'offlineDownloadButton',
                'class': 'ui-ele'
            })
            .attr('data-i18n', '[title]offline.downloadOfflineViewing')
            .data("downloading", false)
            .appendTo(controlGroup)
            .button({
                text: false,
                icons: {
                    primary: "ui-icon-custom-arrow-d"
                }
            })
            .i18n();

            // toggle button
            $('<label>').attr({
                'for': 'toggleOfflineButton',
                'id': 'toggleOfflineLabel',
                'class': 'ui-ele'
            })
            .attr('data-i18n', '[title]offline.enableOffline')
            // need this element to keep the button the correct size
            .append('<span id="toggleOfflineLabelSpan" data-i18n="offline.enableOffline"></span>')
            .appendTo(controlGroup)
            .i18n();
            
            $('<input>').attr({
                'type': 'checkbox',
                'id': 'toggleOfflineButton'
            })
            .appendTo(controlGroup)
            .button({
                text: false,
                icons: {
                    primary: "ui-icon-custom-offline"
                }
            });
            
            
            var doc = me.docViewer.GetDocument();
            
            $('#offlineDownloadButton').click(function() {
                var that = this;
            
                var isDownloading = $(this).data("downloading");
            
                if (isDownloading) {
                    // allow cancelling while the download is happening
                    $(this).data("downloading", false);
                    doc.CancelOfflineModeDownload();
                } else {
                    $(this).data("downloading", true);
                    
                    doc.StoreOffline(function() {
                        $(that).data("downloading", false);
                        
                        $(that).button('option', {
                            icons: {
                                primary: 'ui-icon-custom-arrow-d'
                            }
                        });
                        
                        if (doc.IsDownloaded()) {
                            $('#toggleOfflineButton').button('enable');
                        }
                        
                        $(that).attr('data-i18n', '[title]offline.downloadOfflineViewing').i18n();
                    });
                    
                    // switch to the cancel icon while the download is going on
                    $(this).button('option', {
                        icons: {
                            primary: 'ui-icon-custom-cancel'
                        }
                    });
                    
                    $(this).attr('data-i18n', '[title]offline.cancelDownload').i18n();
                }
            });
            
            $('#toggleOfflineButton').click(function() {
                var offlineEnabled = !doc.GetOfflineModeEnabled();
                doc.SetOfflineModeEnabled(offlineEnabled);
                
                var label = $('#toggleOfflineLabel');
                
                if (offlineEnabled) {
                    label.find('#toggleOfflineLabelSpan').attr('data-i18n', 'offline.disableOffline');
                    label.attr('data-i18n', '[title]offline.disableOffline').i18n();
                } else {
                    label.find('#toggleOfflineLabelSpan').attr('data-i18n', 'offline.enableOffline');
                    label.attr('data-i18n', '[title]offline.enableOffline').i18n();
                }
            });
            
            if (!doc.IsDownloaded()) {
                $('#toggleOfflineButton').button('disable');
            }
        },
        
        updateAnnotations: function() {
            if (this.server_url === null) {
                console.warn("Server URL was not specified.");
                return;
            }
            
            var am = this.docViewer.GetAnnotationManager();
            var saveAnnotUrl = this.server_url;
            if (this.doc_id !== null) {
                saveAnnotUrl += "?did=" + this.doc_id;
            }
            
            var command = am.GetAnnotCommand();
            $.ajax({
                type: 'POST',
                url: saveAnnotUrl,
                data: {
                    'data': command
                },
                contentType: 'xml',
                success: function(data) {
                    /*jshint unused:false */
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    /*jshint unused:false */
                },
                dataType: 'xml'
            });
        },
        
        saveAnnotations: function() {
            //---------------------------
            // Save annotations
            //---------------------------
            // You'll need server-side communication here
            
            // 1) local saving
            //var xfdfString = this.docViewer.GetAnnotationManager().SaveAnnotations();
            //var uriContent = "data:text/xml," + encodeURIComponent(xfdfString);
            //newWindow = window.open(uriContent, 'XFDF Document');
            
            // 2) saving to server (simple)
            if (this.server_url === null) {
                console.warn("Not configured for server-side annotation saving.");
                return;
            }

            var query = '?did=' + this.doc_id;
            if (this.doc_id === null) {
                //Document id is not available. did will not be set for server-side annotation handling.
                query = '';
            }
            var am = this.docViewer.GetAnnotationManager();
            if (am) {
                var xfdfString = am.SaveAnnotations();
                $.ajax({
                    type: 'POST',
                    url: this.server_url + query,
                    data: {
                        'data': xfdfString
                    },
                    success: function(data) {
                        /*jshint unused:false */
                        //Annotations were sucessfully uploaded to server
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        /*jshint unused:false */
                        console.warn("Failed to send annotations to server.");
                    }
                });
            }
            
            // 3) saving to server (avoid conflicts)
            // NOT IMPLEMENTED
        },
        
        initBookmarkView: function() {
            var me = this;
            var doc = this.docViewer.GetDocument();

            displayBookmarks(doc.GetBookmarks(), $("#bookmarkView"), 0);

            //delegate event
            $("#bookmarkView").on("hover", "div.bookmarkWrapper", function(event) {
                if (event.type === 'mouseenter') {
                    //$("#bookmarkView > li").removeClass("ui-state-hover");
                    $(this).addClass("ui-state-hover");
                } else {
                    $(this).removeClass("ui-state-hover");
                }
            });
            
            function displayBookmarks(bookmarks, currentNode, id) {
                /*jshint loopfunc:true */
                for (var i = 0; i < bookmarks.length; i++) {
                    var node = document.createElement('span');
                    node.id = "bookmark" + id;
                    node.innerHTML = bookmarks[i].name;
                    
                    var newNode;
                    if (bookmarks[i].children.length > 0) {
                        newNode = $("<li class=\"closed\"></li>");
                        node.className="Node";
                    } else {
                        newNode = $("<li></li>");
                        node.className="Leaf";
                    }
                    var otherNode = $(node);
                    var wrapper = $("<div class='bookmarkWrapper' id=bookmarkWrapper" + id + "></div>");
                    newNode.append(wrapper.append(otherNode));
                    
                    wrapper.data('data', {
                        bookmark: bookmarks[i],
                        id: id++
                    })
                    .click(function() {
                        if (me.clickedBookmark !== -1) {
                            $("#bookmarkWrapper" + me.clickedBookmark).removeClass('ui-state-active');
                            me.clickedBookmark = -1;
                        }
                        me.clickedBookmark = $(this).data("data").id;
                        $(this).addClass('ui-state-active');
                        
                        me.docViewer.DisplayBookmark($(this).data("data").bookmark);
                    });
                    
                    currentNode.append(newNode);

                    if (bookmarks[i].children.length > 0) {
                        var $list = $("<ul></ul>");
                        newNode.append($list);
                        
                        id = displayBookmarks(bookmarks[i].children, $list, id);
                    }
                }
                
                if (i === 0) {
                    $("#bookmarkView").append('<div style="padding:5px 3px;" data-i18n="sidepanel.outlineTab.noOutlines"></div>');
                    $("#bookmarkView").i18n();
                }
                
                return id;
            }
            $("#bookmarkView").treeview();
        },
        
        initThumbnailView: function() {
            /*jshint loopfunc: true */
            var me = this;

            var nPages = this.docViewer.GetPageCount();
            for (var i = 0; i < nPages; i++) {
                this.requestedThumbs[i] = false;
            }
            
            //delegate event
            $("#thumbnailView").on("hover", "div.ui-widget-content", function(event) {
                if (event.type === 'mouseenter') {
                    $(this).addClass("ui-state-hover");
                } else {
                    $(this).removeClass("ui-state-hover");
                }
            });

            this.thumbnailsElement = this.$thumbnailViewContainer.get(0);
            
            for (var pageIndex = 0; pageIndex < nPages; pageIndex++) {
                
                var thumbContainer = document.createElement('div');
                thumbContainer.id = "thumbContainer" + pageIndex;
                thumbContainer.style.height = me.thumbContainerHeight + "px";
                thumbContainer.className = "thumbContainer ui-widget-content";
                var $thumbContainer = $(thumbContainer);
                $thumbContainer.append($("<div class=\"thumbdiv\"><span style=\"height:150px\"></span></div>"));
                var div = document.createElement('div');
                div.style.textAlign = "center";
                div.innerHTML = (pageIndex + 1);
                $thumbContainer.append(div);
                
                this.$thumbnailViewContainer.append($thumbContainer
                    .data('data', {
                        pageNumber: pageIndex + 1
                    })
                    .click(function() {
                        var pageIndex = $(this).data("data").pageNumber - 1;
                    
                        if (me.clickedThumb !== -1) {
                            $("#thumbContainer" + me.clickedThumb)
                            .removeClass('ui-state-active');
                        }
                        me.clickedThumb = pageIndex;

                        $(this).addClass('ui-state-active');

                        var divTop = me.thumbnailsElement.scrollTop;
                        var divBottom = divTop + me.thumbnailsElement.offsetHeight;
                    
                        var top = pageIndex * me.thumbContainerHeight;
                        var bottom = top + me.thumbContainerHeight;

                        if (!(top >= divTop && bottom <= divBottom)) {
                            me.thumbnailsElement.scrollTop = pageIndex * me.thumbContainerHeight;
                            if (bottom > divBottom) {
                                me.thumbnailsElement.scrollTop = me.thumbnailsElement.scrollTop - me.thumbnailsElement.clientHeight + me.thumbContainerHeight;
                            }
                        }
                        setTimeout(function() {
                            me.docViewer.SetCurrentPage(pageIndex + 1);
                        }, 0);
                    })  //END Click
                    );  //END Append
               
            }

            var thumbs = this.getVisibleThumbs();
            this.appendThumbs(thumbs);
        },
        
        initSearchView: function() {
            //delegate event
            $("#fullSearchView").on("hover", "div.searchResultLine", function(event) {
                if (event.type === 'mouseenter') {
                    $(this).addClass("ui-state-hover");
                } else {
                    $(this).removeClass("ui-state-hover");
                }
            });
        },
        
        appendThumbs: function(visibleThumbs) {
            /*jshint loopfunc: true */
            var me = this;
            var doc = this.docViewer.GetDocument();
                                    
            for (var i = 0; i < visibleThumbs.length; i++) {
                (function() {
                    var once = false;
                
                    var pageIndex = visibleThumbs[i];
                    if (me.requestedThumbs[pageIndex] === true) {
                        return;
                    }
                    
                    me.requestedThumbs[pageIndex] = true;
                    doc.LoadThumbnailAsync(pageIndex, function(thumb) {
                        if (once === true) {
                            return;
                        }
                        
                        once = true;

                        var width, height, ratio;
                        if (thumb.width > thumb.height) {
                            ratio = thumb.width / 150;
                            height = thumb.height / ratio;
                            width = 150;
                        } else {
                            ratio = thumb.height / 150;
                            width = thumb.width / ratio;
                            height = 150;
                        }
                        thumb.style.width = width + 'px';
                        thumb.style.height = height + 'px';
                        
                        thumb.className = "thumb";
                        
                        var $thumbContainer = $("#thumbContainer" + pageIndex);
                        $($thumbContainer).find(".thumbdiv").empty().append(thumb);

                        // Vertical centering of canvas
                        var pad = document.createElement('div');
                        pad.className = "thumbPad";
                        var pHeight = me.thumbContainerHeight - height;
                        var size = parseInt(pHeight / 2.0, 10);

                        pad.style.marginBottom = size + 'px';
                        
                        $thumbContainer.prepend(pad);
                    });
                })();
            }
        },
        
        getVisibleThumbs: function(){
            var thumbIndexes = [];
            var thumbContainerHeight = this.$thumbnailViewContainer.height(); //height of the current viewport
            var thumbItemHeight = $('.thumbContainer').outerHeight(true); //outer height including margin
            if (typeof this.thumbnailsElement === 'undefined') {
                return thumbIndexes;
            }
            var scrollTop = this.thumbnailsElement.scrollTop;
            var scrollBottom = scrollTop + thumbContainerHeight;
            
            var topVisiblePageIndex =  Math.floor(scrollTop / thumbItemHeight);
            var bottomVisiblePageIndex = Math.ceil(scrollBottom / thumbItemHeight) - 1;
            var totalVisiblePages = bottomVisiblePageIndex - topVisiblePageIndex  + 1;

            //keep around/pre-load surrounding thumbnails that are not immediately visible.
            var topVisibleWithCache = topVisiblePageIndex - totalVisiblePages;
            if (topVisibleWithCache < 0) {
                topVisibleWithCache = 0;
            }
            var nPages = this.docViewer.GetPageCount();
            var bottomVisibleWithCache = bottomVisiblePageIndex + (totalVisiblePages);
            if (bottomVisibleWithCache >= nPages) {
                bottomVisibleWithCache = (nPages - 1);
            }
            
            for (var i = topVisibleWithCache; i <= bottomVisibleWithCache; i++ ) {
                thumbIndexes.push(i);
            }
            return thumbIndexes;
        },
        
        getScrollbarWidth: function() {
            var div = $('<div style="width:50px;height:50px;overflow:hidden;position:absolute;top:-200px;left:-200px;"><div style="height:100px;"></div></div>');
            $('body').append(div);
            var w1 = $('div', div).innerWidth();
            div.css('overflow-y', 'auto');
            var w2 = $('div', div).innerWidth();
            $(div).remove();
            return (w1 - w2);
        },
        
        clearSidePanelData: function() {
            var fullSearchView = $('#fullSearchView').get(0);
            if (typeof fullSearchView !== 'undefined') {
                while (fullSearchView.hasChildNodes()) {
                    fullSearchView.removeChild(fullSearchView.firstChild);
                }
            }
            
            var bookmarkView = $('#bookmarkView').get(0);
            if (typeof bookmarkView !== 'undefined') {
                while (bookmarkView.hasChildNodes()) {
                    bookmarkView.removeChild(bookmarkView.firstChild);
                }
            }
            
            var thumbnailView = $('#thumbnailView').get(0);
            if (typeof thumbnailView !== 'undefined') {
                while (thumbnailView.hasChildNodes()) {
                    thumbnailView.removeChild(thumbnailView.firstChild);
                }
            }
        },
        
        searchText: function(pattern, mode) {
            var me = this;
            if (pattern !== '') {
                if (typeof mode === 'undefined') {
                    mode = me.docViewer.SearchMode.e_page_stop | me.docViewer.SearchMode.e_highlight;
                }
                me.docViewer.TextSearchInit(pattern, mode, false);
            }
        },
        
        fullTextSearch: function(pattern) {
            var pageResults = [];
            
            function clearSearch() {
                var searchResults = $('#fullSearchView').get(0);
                while (searchResults.hasChildNodes()) {
                    searchResults.removeChild(searchResults.firstChild);
                }
            }
            clearSearch();
           
            var me = this;
            var searchResultLineId = 0;
            if (pattern !== '') {
                var mode = me.docViewer.SearchMode.e_page_stop | me.docViewer.SearchMode.e_ambient_string | me.docViewer.SearchMode.e_highlight;
                if ($('#wholeWordSearch').attr('checked')) {
                    mode = mode | me.docViewer.SearchMode.e_whole_word;
                }
                if ($('#caseSensitiveSearch').attr('checked')) {
                    mode = mode | me.docViewer.SearchMode.e_case_sensitive;
                }
                me.docViewer.TextSearchInit(pattern, mode, true,
                    // onSearchCallback
                    function(result) {
                        if (result.resultCode === Text.ResultCode.e_found){
                            pageResults.push(result.page_num);
                            var $resultLine = $("<div id=\"searchResultLine" + searchResultLineId + "\">").addClass("searchResultLine ui-widget-content");
                            $('<span>').text(result.ambient_str.slice(0, result.result_str_start)).appendTo($resultLine);
                            $('<b>').text(result.ambient_str.slice(result.result_str_start, result.result_str_end)).appendTo($resultLine);
                            $('<span>').text(result.ambient_str.slice(result.result_str_end, result.ambient_str.length)).appendTo($resultLine);
                            $resultLine.data('data', {
                                result: result,
                                quads: result.quads,
                                searchResultLineId: searchResultLineId++
                            })
                            .click(function() {
                                if (me.clickedSearchResult !== -1) {
                                    $("#searchResultLine" + me.clickedSearchResult).removeClass('ui-state-active');
                                    me.clickedSearchResult = -1;
                                }
                                me.clickedSearchResult = $(this).data("data").searchResultLineId;
                     
                                $(this).addClass('ui-state-active');

                                me.docViewer.DisplaySearchResult($(this).data("data").result);
                            }).appendTo($("#fullSearchView"));
                            if (searchResultLineId === 1) {
                                $resultLine.click();
                            }
                        } else if (result.resultCode === Text.ResultCode.e_done) {
                            // All pages searched.
                            var $fullSearchView = $("#fullSearchView");
                            if ($fullSearchView.is(':empty')) {
                                $fullSearchView.append("<div data-i18n='sidepanel.searchTab.noResults'></div>");
                                $fullSearchView.i18n();
                            }
                        }
                    });
            }
        },
        
        bindEvents: function() {
            var me = this;
            $('#firstPage').bind('click', function() {
                me.docViewer.DisplayFirstPage();
            });
       
            $('#prevPage').bind('click', function() {
                var currentPage = me.docViewer.GetCurrentPage();
                if (currentPage > 1) {
                    me.docViewer.SetCurrentPage(currentPage - 1);
                }
            });
        
            $('#nextPage').bind('click', function() {
                var currentPage = me.docViewer.GetCurrentPage();
                if (currentPage <= me.docViewer.GetPageCount()) {
                    me.docViewer.SetCurrentPage(currentPage + 1);
                }
            });
        
            $('#lastPage').bind('click', function() {
                me.docViewer.DisplayLastPage();
            });
            
            $('#rotateButton').bind('click', function() {
                me.docViewer.RotateClockwise();
            });
                    
            $('#searchButton').bind('click', function() {
                me.searchText($('#searchBox').val());
            });
        
            $('#searchBox').bind('keypress', function(e) {
                var code = (e.keyCode ? e.keyCode : e.which);
                if (code === 13) { //Enter keycode
                    me.searchText($(this).val());
                }
            });
            
            // Side Panel events
            $('#fullSearchButton').click(function(){
                me.fullTextSearch($('#fullSearchBox').val());
            });
        
            $('#fullSearchBox').bind('keypress', function(e) {
                var code = (e.keyCode ? e.keyCode : e.which);
                if(code === 13) { //Enter keycode
                    me.fullTextSearch($(this).val());
                }
            });
        },
        
        fireEvent: function(type, data) {
            $(document).trigger(type, data);
        },
        
        getPageContainer: function(pageIndex) {
            return $('#DocumentViewer').find('#pageContainer' + pageIndex);
        },
        
        getDocumentViewer: function() {
            return this.docViewer;
        },
        
        setInterfaceDefaults: function() {
            var pageIndex = this.docViewer.GetCurrentPage() - 1;
            
            $('#totalPages').text('/' + this.docViewer.GetPageCount());
            var zoom = Math.round(this.docViewer.GetZoom() * 100);
            $('#zoomBox').val(zoom);
            $('#slider').slider({
                value: zoom
            });
            $('#pageNumberBox').val(pageIndex + 1);
            var pan = $('#pan');
            pan[0].checked = false;
            var textSelect = $('#textSelect');
            textSelect[0].checked = true;
            pan.button("refresh");
            textSelect.button("refresh");
            
            this.clickedThumb = pageIndex;
            $("#thumbContainer" + pageIndex).addClass('ui-state-active');
        },
        
        //==========================================================
        // Implementation to the WebViewer.js interface
        //==========================================================
        /**
         * Loads a XOD document into the ReaderControl
         * @function
         * @param {string} doc a URL path to a XOD file
         * @param {boolean} [streaming=false] indicates if streaming mode should be used. For the best performance, set streaming to false.
         */
        loadDocument: function(doc, streaming, decrypt, decryptOptions) {
            // Example of how to decrypt a document thats been XORed with 0x4B
            // It is passed as a parameter to the part retriever constructor.
            // e.g. partRetriever = new window.CoreControls.PartRetrievers.HttpPartRetriever(doc, true, decrypt);
            /*var decrypt = function(data) {

                var arr = new Array(1024);
                var j = 0;
                var responseString = "";

                while (j < data.length) {
                    
                    for (var k = 0; k < 1024 && j < data.length; ++k) {
                        arr[k] = data.charCodeAt(j) ^ 0x4B;
                        ++j;
                    }
                    responseString += String.fromCharCode.apply(null, arr.slice(0,k));
                }
                return responseString;
            };*/
            
            var queryParams = window.ControlUtils.getQueryStringMap();
            var path = queryParams.getString('p');
            var partRetriever;
            try {
                var cacheHinting = exports.CoreControls.PartRetrievers.CacheHinting;
                if (path !== null) {
                    partRetriever = new CoreControls.PartRetrievers.ExternalHttpPartRetriever(doc, path);
                } else if (streaming === true) {
                    partRetriever = new CoreControls.PartRetrievers.StreamingPartRetriever(doc, cacheHinting.CACHE, decrypt, decryptOptions);
                } else {
                    partRetriever = new CoreControls.PartRetrievers.HttpPartRetriever(doc, cacheHinting.CACHE, decrypt, decryptOptions);
                }
            } catch(err) {
                console.error(err);
            }
            this.docViewer.LoadAsync(partRetriever);
            
        },
        
        getShowSideWindow: function() {
            if ($("#sidePanel").css('display') === "block") {
                return true;
            }
            return false;
        },
        
        setShowSideWindow: function(value) {
            if (value === "true") {
                if ($("#sidePanel").css('display') === 'none') {
                    $("#toggleSidePanel").click();
                }
            } else {
                if ($("#sidePanel").css('display') === 'block') {
                    $("#toggleSidePanel").click();
                }
            }
        },

        getCurrentPageNumber: function() {
            return this.docViewer.GetCurrentPage();
        },

        setCurrentPageNumber: function(pageNumber) {
            this.docViewer.SetCurrentPage(pageNumber);
        },

        getPageCount: function() {
            return this.docViewer.GetPageCount();
        },

        getZoomLevel: function() {
            return this.docViewer.GetZoom();
        },

        setZoomLevel: function(zoomLevel) {
            this.docViewer.ZoomTo(zoomLevel);
        },

        rotateClockwise: function() {
            this.docViewer.RotateClockwise();
        },

        rotateCounterClockwise: function() {
            this.docViewer.RotateCounterClockwise();
        },

        getToolMode: function() {
            return this.docViewer.GetToolMode();
        },

        setToolMode: function(toolMode) {
            this.docViewer.SetToolMode(toolMode);
        },

        fitWidth: function() {
            this.docViewer.SetFitMode(this.docViewer.FitMode.FitWidth);
        },

        fitPage: function() {
            this.docViewer.SetFitMode(this.docViewer.FitMode.FitPage);
        },

        fitZoom: function() {
            this.docViewer.SetFitMode(this.docViewer.FitMode.Zoom);
        },

        goToFirstPage: function() {
            this.docViewer.DisplayFirstPage();
        },

        goToLastPage: function() {
            this.docViewer.DisplayLastPage();
        },

        goToNextPage: function() {
            var currentPage = this.docViewer.GetCurrentPage();
            if (currentPage <= 0) {
                return;
            }
            currentPage = currentPage + 1;
            this.docViewer.SetCurrentPage(currentPage);
        },

        goToPrevPage: function() {
            var currentPage = this.docViewer.GetCurrentPage();
            if (currentPage <= 1) {
                return;
            }
            currentPage = currentPage - 1;
            this.docViewer.SetCurrentPage(currentPage);
        },
        
        getLayoutMode: function() {
            return this.docViewer.GetDisplayModeManager().GetDisplayMode().mode;
        },
        
        setLayoutMode: function(layoutMode) {
            var newDisplayMode = new exports.CoreControls.DisplayMode(this.docViewer, layoutMode);
            this.docViewer.GetDisplayModeManager().SetDisplayMode(newDisplayMode);
        },
        
        /**
         *Sets the search mode.
         *All sub-sequent text searches will use the search mode that was set.
         */
        SetSearchModes: function(searchModes) {
            if (!searchModes) {
                return;
            }
            if (searchModes.CaseSensitive) {
                $('#caseSensitiveSearch').attr('checked', true);
            }
            if (searchModes.WholeWord) {
                $('#wholeWordSearch').attr('checked', true);
            }
        }
    };

    exports.ReaderControl.prototype = $.extend(new exports.WebViewerInterface(), exports.ReaderControl.prototype);
    
    
/* ReaderControl event doclet */

/**
 * A global DOM event that is triggered when a document has been loaded.
 * @name ReaderControl#documentLoaded
 * @event
 * @param e a JavaScript event object
 */
 
/** A global DOM event that is triggered when the document view's zoom level has changed.
 * @name ReaderControl#zoomChanged
 * @event
 * @param e a JavaScript event object
 * @param {number} zoom the new zoom level value
 */



/** A global DOM event that is triggered when the current page number has changed.
 * @name ReaderControl#pageChanged
 * @event
 * @param e a JavaScript event object
 * @param {integer} pageNumber the new 1-based page number
 */

/** A global DOM event that is triggered when the display mode has changed
 * @name ReaderControl#displayModeChanged
 * @event
 * @param e a JavaScript event object
 * @param {object} toolMode the new display mode
 */

/** A global DOM event that is triggered when the fit mode has changed
 * @name ReaderControl#fitModeChanged
 * @event
 * @param e a JavaScript event object
 * @param {object} toolMode the new fit mode
 */

/** A global DOM event that is triggered when a page had finished rendering.
 * @name ReaderControl#pageCompleted
 * @event
 * @param e a JavaScript event object
 * @param {integer} pageNumber the 1-based page number that finished rendering
 */
})(window);

$(function() {

    i18n.init(window.ControlUtils.getI18nOptions(), function() {
        $('body').i18n();
    });

    var unsupported = false;
    if (!window.CanvasRenderingContext2D) {
        unsupported = true;
        $('body').children().hide();
        $('#unsupportedErrorMessage').show();
    }

    if (unsupported) {
        //unsupported browser detected, show error message
        $('body').children().hide();
        $('#unsupportedErrorMessage').show();
        return;
    }
    
    var viewerElement = document.getElementById("DocumentViewer");
    
    var queryParams = window.ControlUtils.getQueryStringMap();
    var configScript = queryParams.getString('config');
        
    function initializeReaderControl() {
        var enableAnnot = queryParams.getBoolean('a', false);
        var enableOffline = queryParams.getBoolean('offline', false);
            
        window.readerControl = new ReaderControl(viewerElement, enableAnnot, enableOffline);
        
        var doc = queryParams.getString('d');
        
        var doc_id = queryParams.getString('did');
        if (doc_id !== null) {
            window.readerControl.doc_id = doc_id;
        }
        
        var server_url = queryParams.getString('server_url');
        if (server_url !== null) {
            window.readerControl.server_url = server_url;
        }
        
        var user = queryParams.getString('user');
        if (user !== null) {
            window.readerControl.currUser = user;
        }
    
        var admin = queryParams.getBoolean('admin', window.readerControl.isAdmin);
        window.readerControl.isAdmin = admin;
    
        var readOnly = queryParams.getBoolean('readonly');
        if (readOnly !== null) {
            window.readerControl.readOnly = readOnly;
        }
    
        var streaming = queryParams.getBoolean('streaming', false);
        
        var auto_load = queryParams.getBoolean('auto_load', true);
        
        window.readerControl.fireEvent("viewerLoaded");
        
        // auto loading may be set to false by webviewer if it wants to trigger the loading itself at a later time
        if (doc === null || auto_load === false) {
            return;
        }
        window.ControlUtils.byteRangeCheck(function(status) {
            // if the range header is supported then we will receive a status of 206
            if (status === 200) {
                streaming = true;
            }
            window.readerControl.loadDocument(doc, streaming);
        
        }, function() {
            // some browsers that don't support the range header will return an error
            streaming = true;
            window.readerControl.loadDocument(doc, streaming);
        });
    }
    
    
    if(configScript !== null && configScript.length > 0) {
        //override script path found, prepare ajax script injection
        $.getScript(configScript)
        .done(function(script, textStatus) {
            /*jshint unused:false */
            //override script successfully loaded
            initializeReaderControl();
        })
        .fail(function(jqxhr, settings, exception) {
            /*jshint unused:false */
            console.warn("Config script could not be loaded. The default configuration will be used.");
            initializeReaderControl();
        });
    } else {
        //no override script path, use default
        initializeReaderControl();
    }
});