@change_vendor_behaviour = (doc) ->
  @sidePanel = doc.readerControl.$thumbnailViewContainer.parents '#sidePanel'
  console.log @sidePanel.length

  dafuq =
    "transition": "none !important"
    "-moz-transition": "none !important"
    "-webkit-transition": "none !important"
    "-o-transition": "none !important"
    "-ms-transition": "none !important"

  @sidePanel.css dafuq
