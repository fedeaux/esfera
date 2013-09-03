class @RemotePdfViewer extends PdfViewer
  constructor: (@args) ->
    super @args

    @default_pdf = 'NzliNjNlMmMtYTBlNi00NmE1LWI0NGMtZTJjN2JhNTlhNzUy'

    @current_pdf = window._get['pdf'] or @default_pdf
    @view @current_pdf

  view: (@current_pdf) ->
    @web_viewer_arguments.cloudApiId = @current_pdf
    @web_viewer_instance = new PDFTron.WebViewer @web_viewer_arguments, @viewer_element

