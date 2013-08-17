class @OverlayController
  constructor: (@container, @base_url) ->
    @overlays = []
    @set_dimensions @container

  update_overlay_dimensions: () =>
    @set_dimensions()
    overlay.resize @dimensions for overlay in @overlays

  set_dimensions: (obj = @container) =>
    offset = obj.offset()

    @dimensions =
      width: obj.width()
      height: @container.height()
      offset: offset

  create_iframe: (link) ->
    @set_dimensions @container
    overlay = new iFrameOverlay @container, @dimensions, @base_url+link.target, this
    @overlays.push overlay
