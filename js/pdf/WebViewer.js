

/**
 *The namespace reserved for PDFTron technologies
 *@namespace PDFTron PDFTron namespace
 */
var PDFTron = PDFTron || {};

if (typeof console == "undefined") {
    window.console = {
        log: function (){},
        warn: function(){},
        error: function(){}
    };
}

/**
 * Creates a WebViewer instance and embeds it on the HTML page.
 *
 * @class PDFTron.WebViewer Represents a WebViewer which is a document viewer built using either HTML5, Silverlight or Flash technologies.
 * @param options           options passed to the specific WebViewer. Options can have the following:
 * <ul>
 * <li><b>type:</b> the type of WebViewer to load. Values must be comma-separated in order of preferred WebViewer.</li>
 * <li><b>initialDoc:</b> the URL path to a xod document to load on startup, it is recommended to use absolute paths.</li>
 * <li><b>streaming:</b> a boolean indicating whether to use http or streaming PartRetriever, it is recommended to keep streaming false for better performance. (default false)</li>
 * <li><b>enableAnnotations:</b> a boolean to enable annotations on supported viewer types.(HTML5 only, default false)</li>
 * <li><b>enableOfflineMode:</b> a boolean to enable offline mode.(HTML5 only, default false)</li>
 * <li><b>enableReadOnlyMode:</b> a boolean to enable annotations read-only mode.(HTML5 only, default false)</li>
 * <li><b>config:</b> a URL path to a JavaScript configuration file that holds UI customizations. (HTML5 only)</li>
 * <li><b>serverUrl:</b> a URL to the server-side script that handles annotations. (HTML5 only, required for full annotation support)</li>
 * <li><b>annotationUser:</b> a user identifier for annotations. All annotations created will have this as the author. It is used for permission checking: user only permitted to modify annotations where annotationUser and author matches. (HTML5 only)</li>
 * <li><b>annotationAdmin:</b> a boolean indicating this user has permission to modify all annotations, even if the annotationUser and author does not match. (HTML5 only)</li>
 * <li><b>documentId:</b> an identifier for the document to be used with annotations. (HTML5 only, required for full annotation support)</li>
 * <li><b>cloudApiId:</b> the share ID or session ID created from <a href="http://www.pdftron.com/pdfnet/cloud" target="_blank">PDFNet Cloud API</a>. Note: the browser must have CORS support. (optional, ignored when initialDoc is also set)</li>
 * <li><b>custom:</b> a string of custom data that can be retrieved by the ReaderControl (HTML5 only)</li>
 * <li><b>encryption:</b> an object containing encryption properties (HTML5 and Flash only)</li>
 * <li><b>silverlightObjectParams:</b> an object containing properties that will be adding as param tags under the Silverlight object tag (Silverlight only)</li>
 * <li><b>showSilverlightControls:</b> [Deprecated] a boolean to show/hide the controls on the Silverlight ReaderControl. (Silverlight only, default true)</li>
 * <li><b>errorPage:</b> a path to an HTML page to display errors. (optional)</li>
 * <li><b>path:</b> an alternative path to the WebViewer root folder. (optional)</li>
 * <li><b>html5:</b> an alternative path to the HTML5 WebViewer, relative to the "path" option. (optional)</li>
 * <li><b>html5Mobile:</b> an alternative path to the HTML5 Mobile WebViewer, relative to the "path" option. (optional)</li>
 * <li><b>silverlight:</b> an alternative path to the Silverlight WebViewer, relative to the "path" option. (optional)</li>
 * <li><b>flash:</b> an alternative path to the Flash WebViewer, relative to the "path" option. (optional)</li>
 * </ul>
 * @example e.g. 
 *var viewerElement = document.getElementById('viewer');
 *myWebViewer = new PDFTron.WebViewer({
 *	type: "html5,html5Mobile,silverlight,flash",
 *	initialDoc : "/host/GettingStarted.xod",
 *	enableAnnotations: true,
 *	streaming : false
 * 	}, viewerElement);
 * @param element the html element that will contain the web viewer (e.g. the <div> element that will be parent of the WebViewer). This can be obtained through document.getElementById(), or through JQuery selector.
 * @return {PDFTron.WebViewer}  the instance of the WebViewer class
 */
PDFTron.WebViewer = function WebViewer(options, element) {
    this.options = $.extend(true, {}, this.defaultOptions, options);
    //set up alternate viewer paths.
    if (typeof options.path !== 'undefined') {
        //alternate path provided
        var lastCharIndex = this.options.path.length - 1;
        if (lastCharIndex > 0 && this.options.path[lastCharIndex] !== '/') {
            this.options.path += '/';
        }
        this.options.flash = this.options.path + this.options.flash;
        this.options.html5 = this.options.path + this.options.html5;
        this.options.html5Mobile = this.options.path + this.options.html5Mobile;
        this.options.silverlight = this.options.path + this.options.silverlight;
    }
    
    this.element = element;
    $(this.element).css('overflow', 'hidden');
    
    var me = this;  
    if (typeof this.options.initialDoc !== 'undefined') {
        var docPath = this._correctRelativePath(this.options.initialDoc);
        docPath = encodeURIComponent(docPath); //url-encode the doc path
        this.options.initialDoc = docPath;
        this._create();
    } else if (typeof this.options.cloudApiId !== 'undefined') {    
        $.get('https://api.pdftron.com/v2/download/' + this.options.cloudApiId + "?type=xod&redirect=false" , function(data) {
            if (typeof data.url === "undefined") {
                me.loadErrorPage();       
            } else {
                me.options.initialDoc = encodeURIComponent(data.url);
                me._create();    
            }
        }, 'json')
        .error(function() {
            me.loadErrorPage();       
        });   
    }
    
}


PDFTron.WebViewer.prototype = {    
    version : '1.5.0',
    defaultOptions : {
        type: "html5,silverlight,html5Mobile,flash",
        path: '',
        flash: "flash/ReaderControl.swf",
        html5: "html5/ReaderControl.html",
        html5Mobile: "html5/MobileReaderControl.html",
        silverlight: "silverlight/ReaderControl.xap",
        initialDoc: undefined,
        cloudApiId: undefined,
        enableAnnotations: false,
        enableOfflineMode: false,
        enableReadOnlyMode: false,
        errorPage: undefined,
        serverUrl: undefined,
        documentId: undefined,
        streaming: false,
        config: undefined,
        encryption: undefined,
        showSilverlightControls: true,
        silverlightObjectParams: {}
    },
    
    _create: function () {       
        //called by the constructor only once
        var me = this;
        me.rcId = (((1+Math.random())*0x10000)|0).toString(16).substring(1); //random id
        if((typeof this._trigger) == 'undefined'){
            this._trigger = function( type, event, data ) {
                data = data || {};
                event = $.Event( event );
                event.type = type
                // the original event may come from any element
                // so we need to reset the target on the new event
                event.target = $(this.element)[ 0 ];
                event.data = data;
                $(this.element).trigger( event, data );            
            };
        }
          
        //get the selected type
        var viewers = this.options.type.replace(' ', '').split(",");
        if (viewers.length < 1) viewers[0] = "html5"; //use html5 as default
        
        me._flashVer = "10.2";
        // FABridgeId has to match FABridgeId in swf file
        me._flashFABridgeId = "ReaderControl";
        me._silverlightVer = "4.0";
        me._createViewer(viewers);
        
    },
    _createViewer: function(viewers){
        var me = this;
        me.selectedType = "none";
        if (this.isMobileDevice()) {
            viewers = Array("html5Mobile");
            // if mobile device is detected, only the html5mobile (redirect) is allowed
            var newLocation = this.options.html5Mobile + this._getHTML5OptionsURL();
            
            me.selectedType = "html5Mobile";
            window.location = newLocation;
            return; //redirect to newLocation    
        }
        var allowHTML5 = false;
        var allowSilverlight = false;
        var allowFlash = false;

        for (var i = 0; i < viewers.length; i++) {
            if (viewers[i].toLowerCase() === "html5mobile") {
                allowHTML5 = true;
                if (me._testHTML5()) {
                    me.selectedType = "html5Mobile";
                    break;
                }
            }
            if (viewers[i].toLowerCase() === "html5") {
                allowHTML5 = true;
                if (me._testHTML5()) {
                    me.selectedType = "html5";
                    break;
                }
            }
            else if (viewers[i].toLowerCase() === "silverlight") {
                allowSilverlight = true;
                if (me._testSilverlight(me._silverlightVer)) {
                    me.selectedType = "silverlight";
                    break;
                }
            }
            else if (viewers[i].toLowerCase() === "flash") {
                allowFlash = true;
                if (me._testFlash(me._flashVer)) {
                    me.selectedType = "flash";
                    break;
                }
            }
        }
        if (me.selectedType === "html5") {
            me._createHTML5();
        } else if (me.selectedType === "html5Mobile") {
            me._createHTML5Mobile();
        } else if (me.selectedType === "silverlight") {
            me._createSilverlight();
        } else if (me.selectedType === "flash") {
            me._createFlash();
        } else {
            var supportErrorArray = new Array("Please");

            if (allowHTML5) {
                supportErrorArray.push("use an HTML5 compatible browser");
                if (allowSilverlight || allowFlash) {
                    supportErrorArray.push("or");
                }
            }

            if (allowSilverlight || allowFlash) {
                var runtimesStr = "(" + (allowSilverlight ? "Silverlight" : '') + (allowSilverlight && allowFlash ? " or " : '') + (allowFlash ? "Flash" : '') + ")";
                supportErrorArray.push("install the necessary runtime " + runtimesStr);
            }

            $(me.element).append("<div id=\"webviewer-browser-unsupported\">" + (supportErrorArray.join(' ')) + ".</div>");
        }
    },
    
    _viewerLoaded: function(iframe) {
        var me = this;
        me._trigger('ready');
        
        var viewerWindow = iframe.contentWindow;
        
        if (typeof me.options.encryption !== "undefined") {
            var decrypt = viewerWindow.CoreControls.Encryption.Decrypt;
            var doc = decodeURIComponent(me.options.initialDoc);
            
            var streaming = me.options.streaming;
            
            viewerWindow.ControlUtils.byteRangeCheck(function(status) {
            // if the range header is supported then we will receive a status of 206
            if (status === 200) {
                streaming = true;
            }
            me.instance.loadDocument(doc, streaming, decrypt, me.options.encryption);
            
            }, function() {
                // some browsers that don't support the range header will return an error
                streaming = true;
                me.instance.loadDocument(doc, streaming, decrypt, me.options.encryption);
            });
        }
        
        if (me.instance.docViewer.GetDocument() == null) {
            //note, we need bind using the iframe window's instance of jQuery
            viewerWindow.$(iframe.contentDocument).bind('documentLoaded', function(event) {
                me._trigger(event.type);
            });
        } else {
            //a document is already loaded, trigger the documentLoaded event directly
            me._trigger('documentLoaded');
        }
        
        //bind the rest of the events/callbacks here 
        viewerWindow.$(iframe.contentDocument).bind
        ('displayModeChanged zoomChanged pageChanged fitModeChanged toolModeChanged', function(event, data) {
            //relay event
            me._trigger(event.type, null, data);
        });
    },
    
    _getHTML5OptionsURL: function() {
        var options = this.options;
        var url = "";
        
        if (typeof options.initialDoc !== 'undefined') {
            url += "?d=" + options.initialDoc;
            if (options.streaming) {
                url += "&streaming=true";
            }
            if (options.encryption) {
                // we want to stop the document from automatically loading if it's encrypted as we'll do that later passing the options to it
                url += "&auto_load=false";
            }
            if (options.enableAnnotations) {
                url += "&a=1";
            }
            if (typeof options.serverUrl !== 'undefined') {
                var serverUrl = this._correctRelativePath(options.serverUrl);
                serverUrl = encodeURIComponent(serverUrl);
                url += "&server_url=" + serverUrl;
            }
            if (typeof options.documentId !== 'undefined') {
                url += "&did=" + options.documentId;
            }
            if (typeof options.config !== 'undefined') {
                var config = this._correctRelativePath(options.config);
                config = encodeURIComponent(config);
                url += "&config=" + config;
            }
            if (options.enableOfflineMode) {
                url += "&offline=1";
            }
            if (options.enableReadOnlyMode) {
                url += "&readonly=1";
            }
            if (typeof options.annotationUser !== 'undefined') {
                url += "&user=" + options.annotationUser;
            }
            if (typeof options.annotationAdmin !== 'undefined') {
                url += "&admin=" + (options.annotationAdmin ? 1 : 0);
            }
            if (typeof options.custom !== "undefined") {
                url += "&custom=" + encodeURIComponent(options.custom);
            }
        }
        
        return url;
    },
    
    _createHTML5: function(){
        var me = this;
        var iframeSource =  this.options.html5 + this._getHTML5OptionsURL();
         
        var $rcFrame = $(document.createElement('iframe'));
        $rcFrame.attr({
            id: this.rcId,
            src: iframeSource,
            frameborder: 0,
            width: "100%",
            height: "100%",
            allowFullScreen:true,
            webkitallowfullscreen: true,
            mozallowfullscreen: true
        });

        var outerWindow = window;

        $rcFrame.load(function(){
            me.instance = this.contentWindow.readerControl;
            outerWindow.CoreControls = this.contentWindow.CoreControls;
            
            var iframe = this;
            
            if (typeof me.instance === "undefined") {
                this.contentWindow.$(this.contentDocument).bind('viewerLoaded', function(event) {
                    me.instance = iframe.contentWindow.readerControl;
                    me._viewerLoaded(iframe);
                });
            } else {
                me._viewerLoaded(iframe);
            }
        });
        
        $(this.element).append($rcFrame);
        return $rcFrame;
    },
    
    _createHTML5Mobile: function(){
        // use the correct type if mobile
        var me = this;
        var iframeSource =  this.options.html5Mobile + this._getHTML5OptionsURL();
        
        var $rcFrame = $(document.createElement('iframe'));
        $rcFrame.attr({
            id: this.rcId,
            src: iframeSource,
            frameborder: 0
        //            width: "100%",
        //            height: "100%"
        });
        $rcFrame.css('width', '100%').css("height", "100%");
        $rcFrame.load(function() {
            me.instance = this.contentWindow.readerControl;
            
            var iframe = this;
            
            if (typeof me.instance === "undefined") {
                this.contentWindow.$(this.contentDocument).bind('viewerLoaded', function(event) {
                    me.instance = iframe.contentWindow.readerControl;
                    me._viewerLoaded(iframe);
                });
            } else {
                me._viewerLoaded(iframe);
            }
        });
        $(this.element).append($rcFrame);
        //$(this.element).load(iframeSource);
        return $rcFrame;
    },
	
	_getSilverlightInitParam: function() {
        var options = this.options;
        var initParam = "";
        
		if (options.showSilverlightControls) {
			initParam += "UseJavaScript=false";
		}
		else {
			initParam += "UseJavaScript=true";
		}
		if (typeof options.initialDoc !== 'undefined') {
			initParam += ",DocumentUri=" + (function decode(str){
				return unescape(str.replace(/\+/g, " "));
			})(options.initialDoc);
			
			if (options.streaming) {
				initParam += ",Streaming=true";
			}
			else {
				initParam += ",Streaming=false";
			}
			if (options.enableAnnotations) {
				initParam += ",a=true";
			}
			if (typeof options.serverUrl !== 'undefined') {
				var serverUrl = this._correctRelativePath(options.serverUrl);
				serverUrl = encodeURIComponent(serverUrl);
				initParam += ",server_url=" + serverUrl;
			}
			if (typeof options.documentId !== 'undefined') {
				initParam += ",did=" + options.documentId;
			}
			if (typeof options.config !== 'undefined') {
				initParam += ",config=" + options.config;
			}
			if (options.enableOfflineMode) {
				initParam += ",offline=true";
			}
			if (options.enableReadOnlyMode) {
				initParam += ",readonly=true";
			}
			if (typeof options.annotationUser !== 'undefined') {
				initParam += ",user=" + options.annotationUser;
			}
			if (typeof options.annotationAdmin !== 'undefined') {
				if (options.annotationAdmin) {
					initParam += ",admin=true";
				}
				else {
					initParam += ",admin=false";
				}
			}
			if (typeof options.custom !== 'undefined') {
				initParam += ",custom=" + encodeURIComponent(options.custom);
			}
		}
		return initParam;
    },
	
    _createSilverlight: function() {
        var me = this;
        var options = this.options;
        var initParam = this._getSilverlightInitParam();
            
        var objectParams = {
            'source': options.silverlight,
            'background': 'white',
            'minRuntimeVersion': '4.0.50401.0',
            'autoUpgrade' : 'true'
        };
        $.extend(objectParams, options.silverlightObjectParams);
        
        var objectElement = Silverlight.createObject( options.silverlight , null, me.rcId , objectParams, {
            onLoad : function(sender, args){
                //args is always null
                me.instance = sender.Content.ReaderControl;
                me.instance.EnableAnnotations = options.enableAnnotations;
                me.instance.onPropertyChanged = function(sender2, args2) {
                    switch(args2.name) {
                        case "CurrentPageNumber":
                            me._trigger('pageChanged', null, {
                                pageNumber : args2.pageNumber
                            });
                            break;
                        case "DisplayMode":
                            me._trigger('displayModeChanged');
                            break;
                        case "Zoom":
                            me._trigger('zoomChanged');
                            break;
                        case "FitMode":
                            me._trigger('fitModeChanged');
                            break;
                        case "ToolMode":
                            me._trigger('toolModeChanged');
                            break;
                    }
                };
                me._trigger('ready');

                //we assume onDocumentLoaded will not have been called before this point
                me.instance.onDocumentLoaded = function(sender3, args3) {
                    me._trigger('documentLoaded');
                }
                
            },
            onError : function() {
                console.error("Silverlight onError");
            }
        }, initParam, null );
        $(objectElement).attr({
            'width': '100%',
            'height': '100%'
        }).appendTo(me.element);
        
    },
    _createFlash: function(){
        var me = this;
        var options = this.options;
        var swfUrlStr = options.flash;
        var flashObj = document.createElement("object");
        flashObj.setAttribute("id", me.rcId);
        $(flashObj).appendTo(me.element);
        var xiSwfUrl = ""; // flash player installer
        var flashvars = {};
        flashvars.bridgeName = me._flashFABridgeId;
        if (options.initialDoc != undefined)
        {
            flashvars.d = options.initialDoc;
        }
        if (options.streaming != undefined)
        {
            flashvars.streaming = options.streaming;
        }
        
        ///////////////////////////////////////////////////////////////////////////////////
        // to use Flash Sockets (HttpPartRetriever) switch the NonStreamingMode to SOCKETS.
        // See flash/README.rtf for more details.
        flashvars.NonStreamingMode = 'AJAX'; // 'SOCKETS'
        ///////////////////////////////////////////////////////////////////////////////////
        var params = {};
        var attributes = {};
        attributes.id = me._flashFABridgeId;
        attributes.name = me._flashFABridgeId;
        
        if (typeof options.encryption !== "undefined") {
            // this has to be called before embedSWF
            createHttpAjaxPartRetriever(me._flashFABridgeId, decodeURIComponent(flashvars.d), window.CoreControls.Encryption.DecryptSynchronous, options.encryption);
        }
        
        swfobject.embedSWF(swfUrlStr, me.rcId, "100%", "100%", me._flashVer, xiSwfUrl, flashvars, params, attributes, 
            function(e){
                if (e.success) {
                    FABridge.addInitializationCallback(me._flashFABridgeId, function(e) {
                        me.instance = FABridge.ReaderControl.root();
                        
                        var _cb = function(event)
                        {
                            me._trigger(event.getType());
                        }
                        var _errorcb = function(event)
                        {
                            console.error(event.getText());
                        }

                        me.instance.addEventListener('zoomChanged', _cb);
                        me.instance.addEventListener('pageChanged', _cb);
                        me.instance.addEventListener('displayModeChanged', _cb);
                        me.instance.addEventListener('toolModeChanged', _cb);
                        me.instance.addEventListener('errorEvent', _errorcb);
                        
                        me._trigger('ready');
                        if (me.instance.IsDocLoaded()) {
                            me._trigger('documentLoaded');
                        }
                        else {
                            me.instance.addEventListener('documentLoaded', function(event) { 
                                me._trigger('documentLoaded'); 
                            } );
                        }
                    });
                }
                else {
                    console.error("swfobject.embedSWF failed");
                }
            }
            );
    },
    _init:function(){
    //console.log("_init");
    },
    /**
     * Gets the instance of the ReaderControl object loaded by WebViewer.
     * @return a ReaderControl instance 
     */
    getInstance: function(){
        return (this.instance);
    },

    loadErrorPage: function(){
        if(typeof this.options.errorPage == 'undefined')  {
            $(this.element).append("<h2 style='text-align:center;margin-top:100px'>We're sorry, an error has occurred.</h2>");
        }else{
            $(this.element).load(this.options.errorPage);
        }
    },
    /**
     * Gets the value whether the side window is visible or not.
     * Not supported for mobile viewer.
     * @return true if the side window is shown
     */
    getShowSideWindow : function() {
        if (this.selectedType === "html5" || this.selectedType === "html5Mobile") {
            return this.getInstance().getShowSideWindow();
            
        } else if (this.selectedType === "silverlight" || this.selectedType === "flash") {
            return (this.getInstance().GetShowSideWindow());   
        }
    },
    /**
     * Sets the value whether the side window is visible or not.
     * Not supported for mobile viewer.
     * @param value true to show the side window
     */
    setShowSideWindow: function(value) {
        if (this.selectedType === "html5" || this.selectedType === "html5Mobile") {
            this.getInstance().setShowSideWindow(value);
        }
        else if (this.selectedType === "silverlight") {
            this.getInstance().SetShowSideWindow(value);
        }
        else if (this.selectedType === "flash") {
            this.getInstance().SetShowSideWindow(value == "true");
        }
    },
    /**
     * Gets the current page number of the document loaded in the WebViewer.
     * @return the current page number of the document
     */
    getCurrentPageNumber: function() {
        if (this.selectedType === "html5" || this.selectedType === "html5Mobile") {
            return this.getInstance().getCurrentPageNumber();
            
        } else if (this.selectedType === "flash") {
            return this.getInstance().GetCurrentPage();
            
        } else if (this.selectedType === "silverlight") {
            return this.instance.CurrentPageNumber;
        }
    },
    /**
     * Sets the current page number of the document loaded in the WebViewer.
     * @param pageNumber the page number of the document to set
     */
    setCurrentPageNumber: function(pageNumber) {
        if (this.selectedType === "html5"|| this.selectedType === "html5Mobile") {
            this.getInstance().setCurrentPageNumber(pageNumber);
            
        } else if (this.selectedType === "flash") {
            this.getInstance().SetCurrentPage(pageNumber);
            
        } else if (this.selectedType === "silverlight") {
            this.getInstance().CurrentPageNumber = pageNumber;
        }
    },
    
    /**
     * Gets the total number of pages of the loaded document.
     * @return the total number of pages of the loaded document
     */
    getPageCount: function() {
        if (this.selectedType === "html5" || this.selectedType === "html5Mobile") {
            return this.getInstance().getPageCount();
            
        } else if (this.selectedType === "flash") {
            return this.getInstance().GetPageCount();
            
        } else if (this.selectedType === "silverlight") {
            return this.getInstance().PageCount;
        }
    },
    
    /**
     * Gets the zoom level of the document.
     * @return the zoom level of the document
     */
    getZoomLevel: function() {
        if (this.selectedType === "html5" || this.selectedType === "html5Mobile") {
            return this.getInstance().getZoomLevel();
            
        } else if (this.selectedType === "flash") {
            return this.getInstance().GetZoomLevel();
            
        } else if (this.selectedType === "silverlight") {
            return this.getInstance().ZoomLevel;
        }
    },

    /**
     * Sets the zoom level of the document.
     * @param zoomLevel the new zoom level to set
     */
    setZoomLevel: function(zoomLevel) {
        if (this.selectedType === "html5" || this.selectedType === "html5Mobile") {
            this.getInstance().setZoomLevel(zoomLevel);
            
        } else if (this.selectedType === "flash") {
            this.getInstance().SetZoomLevel(zoomLevel);
            
        } else if (this.selectedType === "silverlight") {
            this.getInstance().ZoomLevel = zoomLevel;
        }
    },

    /**
     * Rotates the document in the WebViewer clockwise.
     * Not supported for mobile viewer.
     */
    rotateClockwise: function() {
        if (this.selectedType === "html5" || this.selectedType === "html5Mobile") {
            this.getInstance().rotateClockwise();
            
        } else if (this.selectedType === "flash") {
            this.getInstance().RotateClockwise();
            
        } else if (this.selectedType === "silverlight") {
            this.getInstance().RotateClockwise();
        }
    },

    /**
     * Rotates the document in the WebViewer counter-clockwise.
     * Not supported for mobile viewer.
     */
    rotateCounterClockwise: function() {
        if (this.selectedType === "html5" || this.selectedType === "html5Mobile") {
            this.getInstance().rotateCounterClockwise();
            
        } else if (this.selectedType === "flash") {
            this.getInstance().RotateCounterClockwise();
            
        } else if (this.selectedType === "silverlight") {
            this.getInstance().RotateCounterClockwise();
        }
    },

    /**
     * Gets the layout mode of the document in the WebViewer.
     * Not supported for mobile viewer.
     * @return the layout mode of the document
     */
    getLayoutMode: function() {
        if (this.selectedType === "html5") {
            var layoutMode = this.getInstance().getLayoutMode();
            var displayModes = CoreControls.DisplayModes;
            
            // the HTML5 viewer has different naming schemes for this
            if (layoutMode === displayModes.Single) {
                return PDFTron.WebViewer.LayoutMode.Single;
            } else if (layoutMode === displayModes.Continuous) {
                return PDFTron.WebViewer.LayoutMode.Continuous;
            } else if (layoutMode === displayModes.Facing) {
                return PDFTron.WebViewer.LayoutMode.Facing;
            } else if (layoutMode === displayModes.FacingContinuous) {
                return PDFTron.WebViewer.LayoutMode.FacingContinuous;
            } else if (layoutMode === displayModes.Cover) {
                return PDFTron.WebViewer.LayoutMode.FacingCoverContinuous;
            } else if (layoutMode === displayModes.CoverFacing) {
                return PDFTron.WebViewer.LayoutMode.FacingCover;
            } else {
                return undefined;
            }
        }
        // else if(this.selectedType == "html5Mobile"){
        //     var ppw = this.getInstance().nPagesPerWrapper;
        //     if(ppw == 1){
        //         return PDFTron.WebViewer.LayoutMode.Single;
        //     }else if(ppw ==2){
        //         return PDFTron.WebViewer.LayoutMode.Facing;
        //     }
        // }
        else if (this.selectedType === "html5Mobile") {
            this.getInstance().getLayoutMode();
        } else if (this.selectedType === "silverlight" || this.selectedType === "flash") {
            return (this.getInstance().GetLayoutMode());
        }
    },

    /**
     * Sets the layout mode of the document in the WebViewer.
     * Not supported for mobile viewer.
     * @param layout    the layout mode to set (see PDFTron.WebViewer.LayoutMode)
     */
    setLayoutMode: function(layoutMode) {
        if (this.selectedType === "html5") {
            var displayModes = CoreControls.DisplayModes;

            var displayMode = displayModes.Continuous;

            // the HTML5 viewer have different naming schemes for this
            if (layoutMode === PDFTron.WebViewer.LayoutMode.Single) {
                displayMode = displayModes.Single;
            } else if (layoutMode === PDFTron.WebViewer.LayoutMode.Continuous) {
                displayMode = displayModes.Continuous;
            } else if (layoutMode === PDFTron.WebViewer.LayoutMode.Facing) {
                displayMode = displayModes.Facing;
            } else if (layoutMode === PDFTron.WebViewer.LayoutMode.FacingContinuous) {
                displayMode = displayModes.FacingContinuous;
            } else if (layoutMode === PDFTron.WebViewer.LayoutMode.FacingCover) {
                displayMode = displayModes.CoverFacing;
                //displayMode = displayModes.Cover;
            } else if (layoutMode === PDFTron.WebViewer.LayoutMode.FacingCoverContinuous) {
                displayMode = displayModes.Cover;
                //displayMode = displayModes.CoverContinuous;
            }

            this.getInstance().setLayoutMode(displayMode);
            
        } else if (this.selectedType === "html5Mobile") {
            this.getInstance().setLayoutMode(layoutMode);
            
        } else if (this.selectedType === "silverlight" || this.selectedType === "flash") {
            this.getInstance().SetLayoutMode(layoutMode);
        }
    },

    /**
     * Gets the current tool mode of the WebViewer.
     * Not supported for mobile viewer.
     * @return the current tool mode of the WebViewer
     */
    getToolMode: function() {
        if (this.selectedType === "html5") {
            // Currently, there are only 2 tool modes for HTML5
            var toolMode = this.getInstance().getToolMode();
            var toolModes = this.getInstance().docViewer.ToolModes;

            if (toolMode instanceof toolModes.Pan) {
                return (PDFTron.WebViewer.ToolMode.Pan);
            } else if (toolMode instanceof toolModes.TextSelect) {
                return (PDFTron.WebViewer.ToolMode.TextSelect);
            } else if (toolMode instanceof toolModes.AnnotationEdit) {
                return (PDFTron.WebViewer.ToolMode.AnnotationEdit);
            } else if (toolMode instanceof toolModes.EllipseCreate) {
                return (PDFTron.WebViewer.ToolMode.AnnotationCreateEllipse);
            } else if (toolMode instanceof toolModes.FreeHandCreate) {
                return (PDFTron.WebViewer.ToolMode.AnnotationCreateFreeHand);
            } else if (toolMode instanceof toolModes.LineCreate) {
                return (PDFTron.WebViewer.ToolMode.AnnotationCreateLine);
            } else if (toolMode instanceof toolModes.RectangleCreate) {
                return (PDFTron.WebViewer.ToolMode.AnnotationCreateRectangle);
            } else if (toolMode instanceof toolModes.StickyCreate) {
                return (PDFTron.WebViewer.ToolMode.AnnotationCreateSticky);
            } else if (toolMode instanceof toolModes.TextHighlightCreate) {
                return (PDFTron.WebViewer.ToolMode.AnnotationCreateTextHighlight);
            } else if (toolMode instanceof toolModes.TextStrikeoutCreate) {
                return (PDFTron.WebViewer.ToolMode.AnnotationCreateTextStrikeout);
            } else if (toolMode instanceof toolModes.TextUnderlineCreate) {
                return (PDFTron.WebViewer.ToolMode.AnnotationCreateTextUnderline);
            } else if (toolMode instanceof toolModes.CustomLineCreate) {
                return (PDFTron.WebViewer.ToolMode.AnnotationCreateCustom);
            } else {
                return null;
            }
        } else if (this.selectedType === "html5Mobile") {
            return this.getInstance().getToolMode();
            
        } else if (this.selectedType === "silverlight" || this.selectedType === "flash") {
            return this.getInstance().GetToolMode();
        }
    },

    /**
     * Sets the tool mode of the WebViewer.
     * Not supported for mobile viewer.
     * @param toolMode  must be one of the PDFTron.WebViewer.ToolMode
     */
    setToolMode: function(toolMode) {
        if (this.selectedType === "html5") {
            // Currently, there are only 2 tool modes for HTML5
            var toolModes = this.getInstance().docViewer.ToolModes;
            var modeToSet = toolModes.Pan;
        
            if (toolMode === PDFTron.WebViewer.ToolMode.Pan) {
                modeToSet = toolModes.Pan;
            } else if (toolMode === PDFTron.WebViewer.ToolMode.TextSelect) {
                modeToSet = toolModes.TextSelect;
            // TODO: Add support for other tool modes
            } else if (toolMode === PDFTron.WebViewer.ToolMode.AnnotationEdit) {
                modeToSet = toolModes.AnnotationEdit;
            } else if (toolMode === PDFTron.WebViewer.ToolMode.AnnotationCreateEllipse) {
                modeToSet = toolModes.EllipseCreate;
            } else if (toolMode === PDFTron.WebViewer.ToolMode.AnnotationCreateFreeHand) {
                modeToSet = toolModes.FreeHandCreate;
            } else if (toolMode === PDFTron.WebViewer.ToolMode.AnnotationCreateLine) {
                modeToSet = toolModes.LineCreate;
            } else if (toolMode === PDFTron.WebViewer.ToolMode.AnnotationCreateRectangle) {
                modeToSet = toolModes.RectangleCreate;
            } else if (toolMode === PDFTron.WebViewer.ToolMode.AnnotationCreateSticky) {
                modeToSet = toolModes.StickyCreate;
            } else if (toolMode === PDFTron.WebViewer.ToolMode.AnnotationCreateTextHighlight) {
                modeToSet = toolModes.TextHighlightCreate;
            } else if (toolMode === PDFTron.WebViewer.ToolMode.AnnotationCreateTextStrikeout) {
                modeToSet = toolModes.TextStrikeoutCreate;
            } else if (toolMode === PDFTron.WebViewer.ToolMode.AnnotationCreateTextUnderline) {
                modeToSet = toolModes.TextUnderlineCreate;
            } else if (toolMode === PDFTron.WebViewer.ToolMode.AnnotationCreateCustom) {
                modeToSet = toolModes.CustomLineCreate;
            }
            
            this.getInstance().setToolMode(modeToSet);
            
        } else if (this.selectedType === "html5Mobile") {
            this.getInstance().setToolMode(toolMode);
            
        } else if (this.selectedType === "silverlight" || this.selectedType === "flash") {
            this.getInstance().SetToolMode(toolMode);
        }
    },

    /**
     * Controls if the document's Zoom property will be adjusted so that the width of the current page or panel
     * will exactly fit into the available space. 
     * Not supported for mobile viewer.
     */
    fitWidth: function() {
        if (this.selectedType === "html5" || this.selectedType === "html5Mobile") {
            this.getInstance().fitWidth();
        } else if (this.selectedType === "flash") {
            this.getInstance().FitWidth();
            
        } else if (this.selectedType === "silverlight") {
            this.getInstance().FitWidth();
        }
    },

    /**
     * Controls if the document's Zoom property will be adjusted so that the height of the current page or panel
     * will exactly fit into the available space. 
     * Not supported for mobile viewer.
     */
    fitHeight: function() {
        if (this.selectedType === "html5" || this.selectedType === "html5Mobile") {
            this.getInstance().fitHeight();
            
        } else if (this.selectedType === "flash") {
            console.warn("Unsupported method fitHeight.");
            
        } else if (this.selectedType === "silverlight") {
            this.getInstance().FitHeight();
        }
    },

    /**
     * Controls if the document's Zoom property will be adjusted so that the width and height of the current page or panel
     * will fit into the available space.
     * Not supported for mobile viewer.
     */
    fitPage: function() {
        if (this.selectedType === "html5" || this.selectedType === "html5Mobile") {
            this.getInstance().fitPage();
            
        } else if (this.selectedType === "flash") {
            this.getInstance().FitPage();
            
        } else if (this.selectedType === "silverlight") {
            this.getInstance().FitPage();
        }
    },

    /**
     * Controls if the document's Zoom property will be freely adjusted and not constrained with the width and height of the
     * current page or panel.
     * Not supported for mobile viewer.
     */
    zoom: function() {
        if (this.selectedType === "html5" || this.selectedType === "html5Mobile") {
            this.getInstance().fitZoom();
            
        } else if (this.selectedType === "flash") {
            this.getInstance().FitZoom();
            
        } else if (this.selectedType === "silverlight") {
            this.getInstance().Zoom();
        }
    },

    /**
     * Goes to the first page of the document. Makes the document viewer display the first page of the document.
     */
    goToFirstPage: function() {
        if (this.selectedType === "html5" || this.selectedType === "html5Mobile") {
            this.getInstance().goToFirstPage();
            
        } else if (this.selectedType === "flash") {
            this.getInstance().GoToFirstPage();
            
        } else if (this.selectedType === "silverlight") {
            this.getInstance().CurrentPageNumber = 1;
        }
    },

    /**
     * Goes to the last page of the document. Makes the document viewer display the last page of the document.
     */
    goToLastPage: function() {
        if (this.selectedType === "html5"|| this.selectedType === "html5Mobile") {
            this.getInstance().goToLastPage();
            
        } else if (this.selectedType === "flash") {
            this.getInstance().GoToLastPage();
            
        } else if (this.selectedType === "silverlight") {
            var totalPages = this.getInstance().PageCount;
            this.getInstance().CurrentPageNumber = totalPages;
        }
    },

    /**
     * Goes to the next page of the document. Makes the document viewer display the next page of the document.
     */
    goToNextPage: function() {
        if (this.selectedType === "html5" || this.selectedType === "html5Mobile") {
            this.getInstance().goToNextPage();
            
        } else if (this.selectedType === "flash") {
            this.getInstance().GoToNextPage();
            
        } else if (this.selectedType === "silverlight") {
            var currentPage = this.getInstance().CurrentPageNumber;

            if (currentPage <= 0)
                return;

            currentPage = currentPage + 1;
            this.getInstance().CurrentPageNumber = currentPage;
        }
    },

    /**
     * Goes to the previous page of the document. Makes the document viewer display the previous page of the document.
     */
    goToPrevPage: function() {
        if (this.selectedType === "html5" || this.selectedType === "html5Mobile") {
            this.getInstance().goToPrevPage();
            
        } else if (this.selectedType === "flash") {
            this.getInstance().GoToPrevPage();
            
        } else if (this.selectedType === "silverlight") {
            var currentPage = this.getInstance().CurrentPageNumber;

            if (currentPage <= 1)
                return;

            currentPage = currentPage - 1;
            this.getInstance().CurrentPageNumber = currentPage;
        }
    },

    /**
     * Loads a document to the WebViewer.
     * @param url url of the document to be loaded (relative urls may not work, it is recommended to use absolute urls)
     */
    loadDocument: function(url) {
        if (this.selectedType === "html5" || this.selectedType === "html5Mobile") {
            this.getInstance().loadDocument(this._correctRelativePath(url), this.options.streaming);
        } else {
            this.getInstance().LoadDocument(this._correctRelativePath(url), this.options.streaming);
        }
    },

    /**
     * Searches the loaded document finding for the matching pattern.
     *
     * Search mode includes:
     * <ul>
     * <li>None</li>
     * <li>CaseSensitive</li>
     * <li>WholeWord</li>
     * <li>SearchUp</li>
     * <li>PageStop</li>
     * <li>ProvideQuads</li>
     * <li>AmbientString</li>
     * </ul>
     *
     * @param pattern       the pattern to look for
     * @param searchMode    must one or a combination of the above search modes. To
     *                      combine search modes, simply pass them as comma separated
     *                      values in one string. i.e. "CaseSensitive,WholeWord"
     */
    searchText: function(pattern, searchModes) {
        var mode = 0;
        var modes = searchModes;
        if (typeof modes == 'string') {
            modes = searchModes.split(',');
        }
        if (typeof searchModes != "undefined") {
            for (var i = 0; i < modes.length; i++) {
                if (searchModes[i] === "CaseSensitive") {
                    mode += 0x1;
                }
                else if (searchModes[i] === "WholeWord") {
                    mode += 0x2;
                }
                else if (searchModes[i] === "SearchUp") {
                    mode += 0x4;
                }
                else if (searchModes[i] === "PageStop") {
                    mode += 0x8;
                }
                else if (searchModes[i] === "ProvideQuads") {
                    mode += 0x10;
                }
                else if (searchModes[i] === "AmbientString") {
                    mode += 0x20;
                }
            }
        }
        
        if (this.selectedType === "html5" || this.selectedType === "html5Mobile") {
            if (typeof searchModes == 'undefined') {
                this.getInstance().searchText(pattern);
            } else {
                this.getInstance().searchText(pattern, mode);
            }
            
        }
        else if (this.selectedType === "silverlight") {
            var modeString = $.isArray(searchModes) ? searchModes.join(',') : searchModes;
            this.getInstance().SearchText(pattern, modeString);
        }
        else if (this.selectedType === "flash") {
            if (typeof searchModes == 'undefined') {
                this.getInstance().SearchText(pattern);
            } else {
                this.getInstance().SearchText(pattern, mode);
            }
            
        }
    },

    /**
     * Registers a callback when the document's page number is changed. (Silverlight only)
     * [Deprecated]
     * @param callback  the JavaScript function to invoke when the document page number is changed
     */
    setOnPageChangeCallback: function(callback) {
        if (this.selectedType === "html5" || this.selectedType === "html5Mobile") {
            this.getInstance().setOnPageChangeCallback(callback);
            
        } else if (this.selectedType === "flash") {
            alert("Not yet supported");
        }
        else if (this.selectedType === "silverlight") {
            this.getInstance().OnPageChangeCallback = callback;
        }
    },

    /**
     * Registers a callback when the document's zoom level is changed. (Silverlight only)
     * [Deprecated]
     * @param callback the JavaScript function to invoke when the document zoom level is changed
     */
    setOnPageZoomCallback : function(callback) {
        if (this.selectedType === "html5" || this.selectedType === "html5Mobile") {
            this.getInstance().setOnPageZoomCallback(callback);
            
        } else if (this.selectedType === "flash") {
            alert("Not yet supported");
            
        } else if (this.selectedType === "silverlight") {
            this.getInstance().OnPageZoomCallback = callback;
        }
    },
    
    //JQuery UI Widget option method
    option: function( key, value ){
        //console.log("option");
        // optional: get/change options post initialization
        // ignore if you don't require them.        
        
        // signature: $('#viewer').webViewer({ type: 'html5,silverlight' });
        if( $.isPlainObject( key ) ){
            this.options = $.extend( true, this.options, key );

        // signature: $('#viewer').option('type'); - getter
        } else if ( key && typeof value === "undefined" ){
            return this.options[ key ];

        // signature: $('#viewer').webViewer('option', 'type', 'html5,silverlight');
        } else {
            this.options[ key ] = value;
        }

        // required: option must return the current instance.
        // When re-initializing an instance on elements, option
        // is called first and is then chained to the _init method.
        return this;
    },

    //make relative paths absolute
    _correctRelativePath: function(path){
        //get current url
        var curdir = window.location.href.substr(0, window.location.href.lastIndexOf('/'));
        //pattern begins with --> https:// or http:// or file:// or / or %2F (%2F is '/' url encoded. Necessary to work with S3 signatures)
        var pattern = /^(https?:\/\/|file:\/\/|\/|%2F)/i;
        //correct relative paths by prepending "../"
        return pattern.test(path) ? path : curdir + '/' +  path;
    },
    _testSilverlight: function(v){
        try{
            return (Silverlight && Silverlight.isInstalled(v));
        }catch(e){
            console.warn(e);
            return false;
        }
    },
    _testHTML5: function(){
        try{
            var c=document.createElement('canvas');
            return (c && c.getContext('2d'));
        }catch(e){
            console.warn(e);
            return false;
        }
    },
    _supports: function(type){
        if(type == this.selectedType){
            return true;
        }
        for (var i = 1; i < arguments.length; i++) {
            if(arguments[i] == this.selectedType){
                return true;
            }
        }
        return false;
    },
    /**
     * Detects if the current browser is on a mobile device.
     * @return {boolean} true if this page is loaded on a mobile device.
     */
    isMobileDevice: function() {
        return (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i)
            || navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPod/i)
            || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/Touch/i)
            || navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/Silk/i));
    },
    _testFlash: function(v) {
        return swfobject.hasFlashPlayerVersion(v);
    }
};



/**
 *A jQuery event bound on the element, triggered when the viewer is ready, before a document is loaded.
 *@name PDFTron.WebViewer#ready
 *@example e.g. $('#viewer').bind('ready', function(event, data){//event triggered});
 *@event
 */
/**
 *A jQuery event bound on the element, triggered when a document has been loaded in the viewer.
 *@name PDFTron.WebViewer#documentLoaded
 *@event
 *@example e.g. $('#viewer').bind('documentLoaded', function(event, data){//event triggered});
 */
/**
 *A jQuery event bound on the element, triggered when the page number has changed.
 *@name PDFTron.WebViewer#pageChanged
 *@event
 *@example e.g. $('#viewer').bind('pageChanged', function(event, data){//event triggered});
 */
/**
 *A jQuery event bound on the element, triggered when the zoom level has changed.
 *@name PDFTron.WebViewer#zoomChanged
 *@event
 *@example e.g. $('#viewer').bind('zoomChanged', function(event, data){//event triggered});
 */
/**
 *A jQuery event bound on the element, triggered when the display mode has changed.
 *@name PDFTron.WebViewer#displayModeChanged
 *@event
 *@example e.g. $('#viewer').bind('displayModeChanged', function(event, data){//event triggered});
 */
/**
 *A jQuery event bound on the element, triggered when the tool mode has changed.
 *@name PDFTron.WebViewer#toolModeChanged
 *@event
 *@example e.g. $('#viewer').bind('toolModeChanged', function(event, data){//event triggered});
 */

//if JQuery UI framework is present, create widget for WebViewer
if(typeof $.widget == 'function'){
    $.widget( "PDFTron.webViewer" , PDFTron.WebViewer.prototype);    
}


/**
 * Lists the possible modes for displaying pages.
 *
 * @name PDFTron.WebViewer.LayoutMode
 * @namespace
 */
PDFTron.WebViewer.LayoutMode =
{
    /**
     * Only the current page will be visible.
     *
     * @name PDFTron.WebViewer.LayoutMode.Single
     */                
    Single : "SinglePage",

    /**
     * All pages are visible in one column.
     *
     * @name PDFTron.WebViewer.LayoutMode.Continuous
     */      
    Continuous : "Continuous",

    /**
     * Up to two pages will be visible, with an odd numbered page rendered first.
     *
     * @name PDFTron.WebViewer.LayoutMode.Facing
     */      
    Facing : "Facing",

    /**
     * All pages visible in two columns.
     *
     * @name PDFTron.WebViewer.LayoutMode.FacingContinuous
     */      
    FacingContinuous : "FacingContinuous",

    /**
     * All pages visible, with an even numbered page rendered first.
     *
     * @name PDFTron.WebViewer.LayoutMode.FacingCover
     */      
    FacingCover : "FacingCover",

    /**
     * 
     *
     * @name PDFTron.WebViewer.LayoutMode.FacingCoverContinuous
     */      
    FacingCoverContinuous : "CoverContinuous"
}

/**
 * Lists the possible modes for the tool control.
 *
 * @name PDFTron.WebViewer.ToolMode
 * @namespace
 */
PDFTron.WebViewer.ToolMode =
{
    /**
     * @name PDFTron.WebViewer.ToolMode.Pan
     */                
    Pan : "Pan",
    /**
     * @name PDFTron.WebViewer.ToolMode.TextSelect
     */        
    TextSelect : "TextSelect",
    /**
     * @name PDFTron.WebViewer.ToolMode.PanAndAnnotationEdit
     */        
    PanAndAnnotationEdit : "PanAndAnnotationEdit",
    /**
     * @name PDFTron.WebViewer.ToolMode.AnnotationEdit
     */        
    AnnotationEdit : "AnnotationEdit",
    /**
     * @name PDFTron.WebViewer.ToolMode.AnnotationCreateCustom
     */        
    AnnotationCreateCustom : "AnnotationCreateCustom",
    /**
     * @name PDFTron.WebViewer.ToolMode.AnnotationCreateEllipse
     */        
    AnnotationCreateEllipse : "AnnotationCreateEllipse",
    /**
     * @name PDFTron.WebViewer.ToolMode.AnnotationCreateFreeHand
     */        
    AnnotationCreateFreeHand : "AnnotationCreateFreeHand",
    /**
     * @name PDFTron.WebViewer.ToolMode.AnnotationCreateLine
     */        
    AnnotationCreateLine : "AnnotationCreateLine",
    /**
     * @name PDFTron.WebViewer.ToolMode.AnnotationCreateRectangle
     */
    AnnotationCreateRectangle : "AnnotationCreateRectangle",
    /**
     * @name PDFTron.WebViewer.ToolMode.AnnotationCreateSticky
     */        
    AnnotationCreateSticky : "AnnotationCreateSticky",
    /**
     * @name PDFTron.WebViewer.ToolMode.AnnotationCreateTextHighlight
     */        
    AnnotationCreateTextHighlight : "AnnotationCreateTextHighlight",
    /**
     * @name PDFTron.WebViewer.ToolMode.AnnotationCreateTextStrikeout
     */        
    AnnotationCreateTextStrikeout : "AnnotationCreateTextStrikeout",
    /**
     * @name PDFTron.WebViewer.ToolMode.AnnotationCreateTextUnderline
     */        
    AnnotationCreateTextUnderline : "AnnotationCreateTextUnderline"
}