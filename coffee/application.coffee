$(() ->
  new Reloader()

  PdfViewerArgs =
    viewer_element_id: 'remote_viewer'

  if(is_app()) 
    setup_local_urls()
    new LocalPdfViewer PdfViewerArgs
  else
    setup_remote_urls()
    new RemotePdfViewer PdfViewerArgs
)
