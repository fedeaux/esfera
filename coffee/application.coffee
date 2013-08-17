$(() ->
  fs = require 'fs'

  new Reloader()
  setup_urls()

  overlay_controller = new OverlayController $('#remote_viewer'), base_url+'files/ObjTest/'

  screen_blocker = new ScreenBlocker $('#wrapper'),
    img_src: 'img/everywhere-logo.png'
    img_width: 210
    img_height: 65

  remote_element_viewer = document.getElementById 'remote_viewer'
  local_element_viewer = document.getElementById 'local_viewer'

  f = (e, d) ->
    doc = get_iframed_document '#remote_viewer iframe'
    doc.readerControl.docViewer.SetLinkReadyCallback (linkElement, link) ->
      linkElement.onclick = () ->
        overlay_controller.create_iframe link

    screen_blocker.unblock()

    new ScreenFitter '.pdf_viewer', {
      container: $(window),
      onResize: overlay_controller.update_overlay_dimensions
      strategy: 'match_screen'
    }

    change_vendor_behaviour(doc)

  $(window).bind 'documentLoaded', f

  bio = get_files_directory()

  remote_web_viewer = new PDFTron.WebViewer(
    initialDoc : bio
    type: 'html5,html5Mobile'
    enableAnnotations: true
    cloudApiId : pdf
    path : "js/pdf/"
    serverUrl : '' # called to annotate
    ,
    remote_element_viewer)

)
