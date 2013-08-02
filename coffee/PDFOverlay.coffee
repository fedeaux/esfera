class @iFrameOverlay
  constructor: (@container, @dimensions, @link) ->
    @create_markup()
    @position_element()

  set_toolbar: (@toolbar) ->

  create_markup: () ->
    @wrapper = $ '<div class="overlay_wrapper"></div>'
    @iframe = $ '<iframe class="overlay_iframe" src="'+@link.target+'"></iframe>'
    @close = $ '<div class="close"> X </div>'
    @close.click () ->
      $(this).parent().remove()

    @container.after @wrapper

    @wrapper.html @iframe
    @wrapper.prepend @close

  resize: (@dimensions) ->
    @position_element()

  position_element: () ->
    @wrapper.offset @dimensions.offset
    @wrapper.width @dimensions.width
    @wrapper.height @dimensions.height