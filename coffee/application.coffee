$(() ->

  console.log JSON.stringify {name: "My Web App", main: 'index.html'}

  isNumber = (n) ->
    !isNaN(parseFloat(n)) and isFinite(n)

  get_iframed_document = (selector) ->
    $(selector)[0].contentWindow

  base_url = document.URL.replace 'index.html', ''

  get_files_directory = () =>
    base_url+'files/Biologia/120.xod'

  remote_element_viewer = document.getElementById 'remote_viewer'
  local_element_viewer = document.getElementById 'local_viewer'
  local_url = document.URL

  overlay_controller = new OverlayController $ '#remote_viewer'
  sb = new ScreenBlocker $ '#wrapper'

  f = (e, d) ->
    doc = get_iframed_document '#remote_viewer iframe'
    doc.readerControl.docViewer.SetLinkReadyCallback (linkElement, link) ->
      linkElement.onclick = () ->
        overlay_controller.create_iframe link

    sb.unblock()

    new ScreenFitter '.pdf_viewer', {
      container: $(window),
      onResize: overlay_controller.update_overlay_dimensions
    }   

  $(window).bind 'documentLoaded', f

  pdfs =
    '1' : 'MWNiYmRhYmUtZmZmMy00OTBlLWJhN2ItODI3ODQ3Nzk4OTRk'
    '2' : 'ZDljMzU3OGEtNmE5YS00NzUzLWIxN2MtZGEwYTE4NDgxNTVm'

  pdf = pdfs['1']

  bio = get_files_directory()

  remote_web_viewer = new PDFTron.WebViewer(
    initialDoc : bio #"https://api.pdftron.com/v1/view/NjYzMDI3YTMtNmYwOS00MmZmLTliMTUtMzNhN2JmMGYyMzVi"//
    type: 'html5,html5Mobile'
    enableAnnotations: true
    cloudApiId : pdf
    #ZWExY2Q1MmQtNTBkOC00ZDUwLWE5MTAtMGEzMzczOTRhMmFk
    path : "js/pdf/"

    # config : js ui configuration
    serverUrl : '' # called to annotate
    ,
    remote_element_viewer)

)
