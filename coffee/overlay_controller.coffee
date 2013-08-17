class @OverlayController
  constructor: (@container, @base_url) ->
    @overlays = []
    @set_dimensions @container

  update_overlay_dimensions: () =>
    @set_dimensions()

    for overlay in @overlays
      overlay.resize @dimensions

  set_dimensions: (obj = @container) =>
    offset = obj.offset()

    @dimensions =
      width: obj.width()
      height: obj.height()
      offset: offset

  create_iframe: (link) ->
    @set_dimensions @container
    overlay = new iFrameOverlay @container, @dimensions, @base_url+link.target, this
    @overlays.push overlay
    console.log @overlays.length
