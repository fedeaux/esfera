(function(exports) {
    "use strict";

    /*
     *@extends {Annotations.MarkupAnnotation}
     */
    var CustomDiamondAnnotation = function() {
        Annotations.MarkupAnnotation.call(this);
        this.Subject = "Custom Diamond";
        this.Custom = "save this field"; // the 'Custom' field is a built-in attribute
        this.myCustomAttribute = "customValue"; //you can define your own attributes as well
        this['elementName'] = "custom-diamond"; // the XFDF element name for the custom annotation
        
    };
    CustomDiamondAnnotation.prototype = $.extend(new Annotations.MarkupAnnotation(), {
        /**
         * Override the default draw method.
         * Coordinate space is relative to the X,Y position, in the unmirrored quandrant:
         * i.e. two mouse points used to create the annotations are (0,0) and (Width, Height)
         * Mirroring is automatically applied if NoResize is false.
         * @override
         */
        draw: function(ctx) {
            this.setStyles(ctx);
            ctx.lineWidth = this.StrokeThickness;
            
            //draw diamond
            //--------------------
            ctx.beginPath();
            ctx.moveTo(this.Width / 2, 0);
            ctx.lineTo(this.Width, this.Height / 2);
            ctx.lineTo(this.Width / 2 , this.Height);
            ctx.lineTo(0 , this.Height / 2);
            ctx.lineTo(this.Width / 2, 0);
            ctx.stroke();
            ctx.fill();
            
        //draw rectangle
        //--------------------
            
        //            ctx.beginPath();
        //            ctx.moveTo(0, 0);
        //            ctx.lineTo(this.Width, this.Height);
        //            ctx.stroke();
        //            
        //            var rectSize = 5;
        //            ctx.fillRect(this.Width - rectSize, this.Height - rectSize, rectSize, rectSize);
            
            
        //draw rectangle
        //--------------------
        //ctx.fillRect(0,0, this.Width, this.Height);

        //draw ellipse
        //--------------------
        //var whRatio = this.Width/this.Height;
        //if (isNaN(whRatio) || whRatio === Infinity) return;
        //ctx.translate((1 - whRatio) * this.GetWidth() / 2, 0);
        //ctx.scale(whRatio, 1);
        //ctx.beginPath();
        //ctx.arc(this.Width / 2, this.Height / 2, this.Height / 2, 0, Math.PI * 2, false);
        //ctx.fill()
        //ctx.stroke();
        },
        serialize: function(xmlWriter){
            var me = this;
            Annotations.MarkupAnnotation.prototype.serialize.call(this, xmlWriter, this.elementName, function(){
                //serialize custom attributes
                xmlWriter.writeAttributeString("myCustomAttribute", me.myCustomAttribute);
            });
        },
        deserialize: function(jsonObject){            
            var me = this;
            //console.log("Custom annotation value: " + jsonObject.myCustomAttribute);
            me.myCustomAttribute = jsonObject.myCustomAttribute;
        }
    });
    
    /**
     * CustomDiamondCreateTool
     * -for shape annotations based on two mouse points, extend from GenericAnnotationCreateTool/
     */
    var CustomDiamondCreateTool = function(docViewer) {
        //pass in the constructor to the custom Annotation
        Tools.GenericAnnotationCreateTool.call(this, docViewer, CustomDiamondAnnotation);
    };
    CustomDiamondCreateTool.prototype = new Tools.GenericAnnotationCreateTool();
    CustomDiamondCreateTool.prototype.mouseLeftUp = function(e){
        Tools.GenericAnnotationCreateTool.prototype.mouseLeftUp.call(this,e);
        //access the annotation created through this.annotation
        
        // switch out the tool 
        //var ToolModes = this.docViewer.ToolModes;
        //this.docViewer.SetToolMode(ToolModes.AnnotationEdit);
    };
    
    /**
     * Override the default double click behavior for the AnnotationEditTool
     */
    //Tools.AnnotationEditTool.prototype.mouseDoubleClick = function(e){
    //  Tools.AnnotationEditTool.prototype.mouseDoubleClick.call(this,e);
    //}
    

    /*Register the custom tool to DocumentViewer*/
    exports.CoreControls.DocumentViewer.prototype.ToolModes.CustomDiamond = CustomDiamondCreateTool;
    
    $(document).bind("documentLoaded", function(){
        //document finished loading
        var am = readerControl.getDocumentViewer().GetAnnotationManager();
        am.RegisterCustomAnnotation("custom-diamond", CustomDiamondAnnotation);
    });
    
}(window));