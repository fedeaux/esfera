class @PdfViewer
  constructor: (@args) ->
    $(window).bind 'documentLoaded', @on_document_load
    @viewer_element = document.getElementById @args.viewer_element_id
    @before_document_load()

    @web_viewer_arguments =
      type: 'html5,html5Mobile'
      enableAnnotations: true
      path : 'js/pdf'
      config : 'js/pdf_viewer_configuration.js'
      serverUrl : '' # called to annotate

  on_document_load: (e, d) =>
    doc = get_iframed_document '#remote_viewer iframe'

    overlay_controller = @overlay_controller

    doc.readerControl.docViewer.SetLinkReadyCallback (linkElement, link) =>
      linkElement.onclick = () =>
        overlay_controller.create_iframe link

    @screen_blocker.unblock()

    new ScreenFitter '.pdf_viewer', {
      container: $(window),
      on_resize: overlay_controller.update_overlay_dimensions
      strategy: 'match_screen'
    }

  before_document_load: () ->
    @overlay_controller = new OverlayController $('#remote_viewer'), base_url+'files/ObjTest/'

    @screen_blocker = new ScreenBlocker $('#wrapper'),
      img_src: 'img/everywhere-logo.png'
      img_width: 210
      img_height: 65
