class @LocalPdfViewer extends PdfViewer
  constructor: (@args) ->
    super @args

    @current_pdf = get_files_directory()

    @view @current_pdf

  view: (@current_pdf) ->
    @web_viewer_arguments.initialDoc = @current_pdf
    @web_viewer_instance = new PDFTron.WebViewer @web_viewer_arguments, @viewer_element
