/*jshint unused:false */

$(function() {
    var readerControl = window.readerControl;
    var am = readerControl.docViewer.GetAnnotationManager();
    var $toolModePicker = $('#toolModePicker');
    var $fillColorPicker = $('#fillColorPicker');
    var $strokeColorPicker = $('#strokeColorPicker');
    var $thicknessSlider = $("#thicknessSlider");

    //set up the intial UI for the tool panel
    setupToolPanel();
    
    $(document).bind('toolModeChanged', function(event, data) {
        var toolmode = readerControl.docViewer.GetToolMode();
        $("#toolModePicker li").removeClass('ui-state-active');
        var ToolModes = readerControl.docViewer.ToolModes;
        if (toolmode instanceof ToolModes.AnnotationEdit) {
            $('#annot-button-edit').addClass('ui-state-active');
        } else if (toolmode instanceof ToolModes.StickyCreate) {
            $('#annot-button-sticky').addClass('ui-state-active');
        } else if (toolmode instanceof ToolModes.TextHighlightCreate) {
            $('#annot-button-highlight').addClass('ui-state-active');
        } else  if (toolmode instanceof ToolModes.TextUnderlineCreate) {
            $('#annot-button-underline').addClass('ui-state-active');
        } else if (toolmode instanceof ToolModes.TextStrikeoutCreate) {
            $('#annot-button-strikeout').addClass('ui-state-active');
        } else if (toolmode instanceof ToolModes.RectangleCreate) {
            $('#annot-button-rectangle').addClass('ui-state-active');
        } else if (toolmode instanceof ToolModes.EllipseCreate) {
            $('#annot-button-ellipse').addClass('ui-state-active');
        } else if (toolmode instanceof ToolModes.LineCreate) {
            $('#annot-button-line').addClass('ui-state-active');
        } else if (toolmode instanceof ToolModes.FreeHandCreate) {
            $('#annot-button-freehand').addClass('ui-state-active');
        } else if (toolmode instanceof ToolModes.CustomDiamond) {
            $('#annot-button-custom-diamond').addClass('ui-state-active');
        }
    });
    
    $(document).bind("documentLoaded", function() {
        //important, we need to get the new annotation manager if a new document is loaded
        //and reattach the annotation changed callback
        am = readerControl.docViewer.GetAnnotationManager();
        var $annotationList = $('#annotationList');
        $annotationList.empty();
        
        /*
        // example of customizing the popup element + attaching any custom events to the popup
        // here are the default child elements in the popup:
        // minimize button: $popupel.find('.popup-minimize-button')
        // comment textarea: $popupel.find('.popup-comment')
        am.SetAnnotationPopupCreatedCallback(function(annotation, $popupel) {
            var popupcomment = $popupel.find('.popup-comment');
            popupcomment[0].style.backgroundColor = 'red';
            popupcomment.bind("keyup", function(e) {
                annotation.SetCustom(e.target.value);
            });
        });
        */
        
        //Register the annotation changed callback
        am.SetAnnotationChangedCallback(function(annotation, action) {
            var $annotationList =  $('#annotationList');
            if (action === "add") {
                var $li = createAnnotationListItem(annotation);
                $annotationList.append($li).selectable("refresh");
            } else if (action === "delete") {
                var liList = $annotationList.children('li');
                for (var i = 0; i < liList.length; i++) {
                    if ($(liList[i]).data("annot") === annotation) {
                        $(liList[i]).remove();
                    }
                }
            } else if (action === "modify") {
                $annotationList.find('li').each(function(i, ele) {
                    if ($(ele).data("annot") === annotation) {
                        var comment = annotation.GetPopupComment();
                        if (typeof comment === 'string') {
                            comment = comment.substring(0, 30);
                            $(ele).find('.comment').text(comment);
                        }
                    }
                });
            // implement custom logic here for annotation modified callback
            }
        });
    });

            
    
    am.SetAnnotationFilteredCallback(function(annotations) {
        var $annotationList = $('#annotationList');
        var liList = $annotationList.children('li');
        for (var i = 0; i < liList.length; i++) {
            $(liList[i]).remove();
        }
        for (i = 0; i < annotations.length; i++) {
            var annot = annotations[i];
            if (!annot.Filtered) {
                var $li = createAnnotationListItem(annot);
                $annotationList.append($li).selectable("refresh");
            }
        }
    });
    
    am.SetAnnotationToggledCallback(function(markupOff, annotations, useFilter) {
        var $annotationList = $('#annotationList');
        var $toggleButton = $('#toggleAnnotationsButton');
        var liList = $annotationList.children('li');
        var i;
        if (markupOff) {
            $toggleButton.attr('data-i18n', 'sidepanel.annotationTab.buttonShow');
            $toggleButton.i18n();
            for (i = 0; i < liList.length; i++) {
                $(liList[i]).remove();
            }
            return;
        } else {
            $toggleButton.attr('data-i18n', 'sidepanel.annotationTab.buttonHide');
            $toggleButton.i18n();
        }
        
        for (i = 0; i < annotations.length; i++) {
            var annot = annotations[i];
            if (!useFilter || !annot.Filtered) {
                var $li = createAnnotationListItem(annot);
                $annotationList.append($li).selectable("refresh");
            }
        }
    });
    
    am.SetAnnotationSelectedCallback(function(annotations, action) {
        /*jshint shadow:true, loopfunc:true */
        var $annotationList = $('#annotationList');
        if (action === "selected") {
                        
            if (annotations.length === 1) {
                //single annotation was selected;
                var annotation = annotations[0];
    
                var strokeColor = annotation.StrokeColor;
                var fillColor = annotation.FillColor;
                
                var numProperties = 3;
                if (strokeColor !== null && typeof strokeColor !== "undefined") {
                    var strokeColorName = colorRGBtoName(strokeColor.R, strokeColor.G, strokeColor.B, strokeColor.A);
                    $strokeColorPicker.find('li').removeClass('ui-state-active');
                    $strokeColorPicker.find('li[data-color="' + strokeColorName + '"]')
                    .addClass('ui-state-active');
                    $strokeColorPicker.show();
                } else {
                    $strokeColorPicker.hide();
                    numProperties--;
                }
                
                if (fillColor !== null && typeof fillColor !== "undefined") {
                    var fillColorName = colorRGBtoName(fillColor.R, fillColor.G, fillColor.B, fillColor.A);
                    $fillColorPicker.find('li').removeClass('ui-state-active');
                    $fillColorPicker.find('li[data-color="' + fillColorName + '"]')
                    .addClass('ui-state-active');
                    $fillColorPicker.show();
                } else {
                    $fillColorPicker.hide();
                    numProperties--;
                }
                
                if (annotation.StrokeThickness !== null && typeof annotation.StrokeThickness !== "undefined") {
                    $("#thicknessPicker").show();
                    $thicknessSlider.slider('value', annotation.StrokeThickness);
                } else {
                    $("#thicknessPicker").hide();
                    numProperties--;
                }
                
                if (numProperties > 0) {
                    $('#defaultButton').show();
                } else {
                    $('#defaultButton').hide();
                }
            
                $('#annotationProperties').show();
                resizeAnnotationList();
            } else {
                // more than one annotation selected
                $('#annotationProperties').hide();
            }
            for (var i = 0; i < annotations.length; i++){
                var ann = annotations[i];
                $annotationList.find('li').filter(function() {
                    return $(this).data('annot') === ann;
                }).addClass('ui-state-active');
            }
        } else if(action === "deselected") {
            $('#annotationProperties').hide();
            resizeAnnotationList();
            
            if (annotations === null || typeof annotations === 'undefined') {
                //no annotations argument is null, deselected all
                $annotationList.find("li").removeClass("ui-state-active");
            } else {
                
                //specific annotations to deselect
                for (var i = 0; i < annotations.length; i++) {
                    var ann = annotations[i];
                    $annotationList.find('li').filter(function() {
                        return $(this).data('annot') === ann;
                    }).removeClass('ui-state-active');
                }
            }
            
        }
    });
        

    //------------------------------------------------------------
    // Customize the annotation SelectionBox appearance here.
    //------------------------------------------------------------
    //
    //am.SetSelectionBoxDrawCallback(function(annotation, ctx, x, y, width, height){
    //    ctx.strokeStyle = "rgb(255,0,0)";
    //    ctx.strokeRect(x,y,width,height);
    //}
    //);
    //
    //am.SetControlPointDrawCallback(function(annotation, ctx, x, y, width, height){
    //    ctx.strokeStyle= "rgb(255,0,0)";
    //    ctx.fillStyle = "rgb(255,255,255)";
    //    ctx.strokeRect(x,y,width,height);
    //    ctx.fillRect(x,y,width,height);
    //}
    //);
       
    
    
    function setupToolPanel() {
        $('#saveAnnotationsButton').click(function() {
            readerControl.saveAnnotations();
        });
        
        // Comment out filter box for now
        /*
        $('#filterBox').keyup(function(e){
            var am = readerControl.docViewer.GetAnnotationManager();
            am.FilterAnnotations(e.target.value);
        });
         */
        
        $('#toggleAnnotationsButton').click(function() {
            var am = readerControl.docViewer.GetAnnotationManager();
            am.ToggleAnnotations();
            $toolModePicker.find('li').removeClass('ui-state-active');
            var ToolModes = readerControl.docViewer.ToolModes;
            readerControl.docViewer.SetToolMode(ToolModes.TextSelect);
        });

		
        $('.colorPicker li').each(function(i, n) {
            var color = $(this).attr('data-color');
            var $colorSquare = $("<div/>");
            if (color === "transparent") {
                $colorSquare.addClass("ui-icon ui-icon-cancel-small");
            } else {
                $colorSquare.css('background-color', color);
            }
            $(this).append($colorSquare);
        });
    
        
        $toolModePicker.click(function(e) {
            var $li = $(e.target).closest('li');
            var ToolModes = readerControl.docViewer.ToolModes;
            //$toolModePicker.find('li').removeClass('ui-state-active');
            if ($li !== undefined) {
                if ($li.attr('id') !== 'annot-button-edit' && am.GetReadOnly()) {
                    if (readerControl.docViewer.onAlert) {
                        readerControl.docViewer.onAlert("readOnlyCreate");
                    } else {
                        alert(i18n.t("annotations.readOnlyCreate"));
                    }
                    return;
                }
                if ($li.attr('id') !== 'annot-button-edit' && am.GetMarkupOff()) {
                    if (readerControl.docViewer.onAlert) {
                        readerControl.docViewer.onAlert("markupOffCreate");
                    } else {
                        alert(i18n.t("annotations.markupOffCreate"));
                    }
                    return;
                }
                //$li.addClass('ui-state-active');
                switch($li.attr('id')) {
                    case 'annot-button-edit':
                        readerControl.docViewer.SetToolMode(ToolModes.AnnotationEdit);
                        break;
                    case 'annot-button-sticky':
                        readerControl.docViewer.SetToolMode(ToolModes.StickyCreate);
                        break;
                    case 'annot-button-highlight':
                        readerControl.docViewer.SetToolMode(ToolModes.TextHighlightCreate);
                        break;
                    case 'annot-button-underline':
                        readerControl.docViewer.SetToolMode(ToolModes.TextUnderlineCreate);
                        break;
                    case 'annot-button-strikeout':
                        readerControl.docViewer.SetToolMode(ToolModes.TextStrikeoutCreate);
                        break;
                    case 'annot-button-rectangle':
                        readerControl.docViewer.SetToolMode(ToolModes.RectangleCreate);
                        break;
                    case 'annot-button-ellipse':
                        readerControl.docViewer.SetToolMode(ToolModes.EllipseCreate);
                        break;
                    case 'annot-button-line':
                        readerControl.docViewer.SetToolMode(ToolModes.LineCreate);
                        break;
                    case 'annot-button-freehand':
                        readerControl.docViewer.SetToolMode(ToolModes.FreeHandCreate);
                        break;
                    case 'annot-button-custom-diamond':
                        readerControl.docViewer.SetToolMode(ToolModes.CustomDiamond);
                        break;
                    default:
                        break;
                }
            }
        })
        .on("hover", "li", function(event) {
            if (event.type === 'mouseenter') {
                $(this).addClass("ui-state-hover");
            } else {
                $(this).removeClass("ui-state-hover");
            }
        });

        function mayEditAnnotation(annotation) {
            var currUser = am.GetCurrentUser();
            var permitted;
            if (readerControl.docViewer.onPermissionCheck) {
                permitted = readerControl.docViewer.onPermissionCheck(annotation.Author);
            } else {
                permitted = am.GetIsAdminUser();
                permitted = permitted || currUser === annotation.Author  || annotation.Author === null || annotation.Author === undefined;
            }

            if (am.GetReadOnly()) {
                if (readerControl.docViewer.onAlert) {
                    readerControl.docViewer.onAlert("readOnlyEdit");
                } else {
                    alert(i18n.t("annotations.readOnlyEdit"));
                }
                return false;
            }
            if (!permitted) {
                if (readerControl.docViewer.onAlert) {
                    readerControl.docViewer.onAlert("permissionEdit");
                } else {
                    alert(i18n.t("annotations.permissionEdit"));
                }
                return false;
            }
            
            return true;
        }

        $fillColorPicker.on("click", "li", function(event) {
            var selectedAnnotations = am.GetSelectedAnnotations();
            if (selectedAnnotations.length <= 0) {
                return;
            }
            var annotation = selectedAnnotations[0];
            if (!mayEditAnnotation(annotation)) {
                return;
            }
            
            $fillColorPicker.find('li').removeClass('ui-state-active');
            $(this).addClass('ui-state-active');
            var color = colorNameToRGB($(this).attr('data-color'));
            if (color) {
                annotation.FillColor = color;
                am.UpdateAnnotation(annotation);
                if (am.annotationChangedCallback) {
                    am.annotationChangedCallback(annotation, "modify");
                }
            }
            
        });
        
        $strokeColorPicker.on('click', 'li', function(event) {
            var selectedAnnotations = am.GetSelectedAnnotations();
            if (selectedAnnotations.length <= 0) {
                return;
            }
            var annotation = selectedAnnotations[0];
            if (!mayEditAnnotation(annotation)) {
                return;
            }
            
            $strokeColorPicker.find('li').removeClass('ui-state-active');
            $(this).addClass('ui-state-active');
            var color = colorNameToRGB($(this).attr('data-color'));
            if (color) {
                annotation.StrokeColor = color;
                am.UpdateAnnotation(annotation);
                if (am.annotationChangedCallback) {
                    am.annotationChangedCallback(annotation, "modify");
                }
            }
        });
    
        $thicknessSlider.slider({
            min: 1,
            max: 5,
            value: 1,
            slide: function( event, ui ) {
                var selectedAnnotations = am.GetSelectedAnnotations();
                if (selectedAnnotations.length <= 0) {
                    return;
                }
                var annotation = selectedAnnotations[0];
                if (!mayEditAnnotation(annotation)) {
                    return;
                }
                
                annotation.StrokeThickness = (ui.value);
                am.UpdateAnnotation(annotation);
                if (am.annotationChangedCallback) {
                    am.annotationChangedCallback(annotation, "modify");
                }
            }
        });
        
        $('#annotationList').selectable({
            stop: function() {
                var selectedItems = $( ".ui-state-active", this );
                am.DeselectAllAnnotations();
                $('#annot-button-edit').click();
                if (selectedItems.length === 1) {
                    var annotation = selectedItems.data('annot');
                    am.SelectAnnotation(annotation);
                    am.JumpToAnnotation(annotation);
                } else if (selectedItems.length > 1) {
                    var annotations = Array();
                    for(var i = 0; i < selectedItems.length; i++) {
                        annotations.push($(selectedItems[i]).data('annot'));
                    }
                    am.SelectAnnotations(annotations);
                }
            },
            unselected: function() {
                $("li.ui-state-active", this).each(function() {
                    $(this).removeClass('ui-state-active');
                });
            },
            selected: function(event, ui) {
                $("li.ui-selected", this).each(function() {
                    $(this).addClass('ui-state-active');
                });
            }
        })
        .on("hover", "li", function(event) {
            if(event.type === 'mouseenter' ) {
                $(this).addClass("ui-state-hover");
            } else {
                $(this).removeClass("ui-state-hover");
            }
        });
        
        
                
        $('#defaultButton').click(function() {
            if ($fillColorPicker.is(':visible')) {
                var fillColor = $fillColorPicker.find('li.ui-state-active').data('color');
                am.defaultFillColor = colorNameToRGB(fillColor);
            }

            if ($strokeColorPicker.is(':visible')) {
                var strokeColor = $strokeColorPicker.find('li.ui-state-active').data('color');
                am.defaultStrokeColor = colorNameToRGB(strokeColor);
            }
           
            if ($thicknessSlider.is(':visible')) {
                var strokeThickness = $thicknessSlider.slider('value');
                am.defaultStrokeThickness = strokeThickness;
            }
        });
          
        //Re-calculate the annotations list control on tab events and window resize
        $('#tabs').on("tabsload tabsactivate", function(event, ui) {
            resizeAnnotationList();
        });
        $(window).resize(function() {
            resizeAnnotationList();
        });
    }
           
    function resizeAnnotationList() {
        //calculate the max-height for annotations list
        var height = ($('#tabs').height())
            - ($('#tabs .ui-tabs-nav').outerHeight(true))
            - ($('#annot-head').outerHeight(true))
            - ($('#annotationListHeader').outerHeight(true))
            - ($('#annot-foot').outerHeight(true));
        
        $('#annotationListScroll').css('max-height', height + "px")
        //$('#annot-content').css('max-height', height + "px")
        .css('height', height+ "px");
    }
    
    function colorRGBtoName(r, g, b, a) {
        if (a === 0) {
            return "transparent";
        }
        
        if (r === 255 && g === 0 && b === 0) {
            return "red";
        } else if (r === 255 && g === 128 && b === 64) {
            return "orange";
        } else if (r === 255 && g === 255 && b === 0) {
            return "yellow";
        } else if (r === 50 && g === 205 && b === 50) {
            return "lightgreen";
        } else if (r === 0 && g === 128 && b === 0) {
            return "green";
        } else if (r === 0 && g === 0 && b === 255) {
            return "blue";
        } else if (r === 0 && g === 0 && b === 0) {
            return "black";
        } else if (r === 255 && g === 255 && b === 255) {
            return "white";
        } else {
            return "";
        }
    }
    
    function colorNameToRGB(name) {
        switch(name) {
            case "red":
                return new Annotations.Color(255, 0, 0);
            case "orange":
                return new Annotations.Color(255, 128, 64);
            case "yellow":
                return new Annotations.Color(255, 255, 0);
            case "lightgreen":
                return new Annotations.Color(50, 205, 50);
            case "green":
                return new Annotations.Color(0,128, 0);
            case "blue":
                return new Annotations.Color(0, 0, 255);
            case "black":
                return new Annotations.Color(0, 0, 0);
            case "white":
                return new Annotations.Color(255, 255, 255);
            case "transparent":
                return new Annotations.Color(255, 255, 255, 0);
            default:
                return null;
        }
        
    }
     
    function createAnnotationListItem(annotation) {
        var message = "<div class=\"annotListItem\"> <span class=\"subject\" >" + annotation.Subject +
            "</span><span class=\"page\" data-i18n='annotations.pageNumber' data-i18n-options='{\"number\": " + annotation.PageNumber + "}'></span>";
        
        if (typeof annotation.Author === 'string' && annotation.Author.length > 0) {
            message += "<div><span><img src=\"Resources/user.png\"></span> " + annotation.Author + "</div>";
        }
            
        var commentString = annotation.GetPopupComment();
        if (commentString !== null && typeof commentString !== 'undefined') {
            commentString = commentString.substring(0, 30);
        } else {
            commentString = '';
        }
        message += "<div class=\"comment\">" + commentString +  "</div>";
        message += "</div>";
        var $li = $('<li>').append(message).data("annot", annotation).addClass("ui-widget-content");
        $li.i18n();
        return $li;
    }
    
});
