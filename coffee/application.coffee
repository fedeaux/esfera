$(() ->
  new Reloader()
  setup_urls()

  PdfViewerArgs =
    viewer_element_id: 'remote_viewer'

  if(is_app())
    new LocalPdfViewer PdfViewerArgs
  else
    new RemotePdfViewer PdfViewerArgs
)
