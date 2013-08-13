class @ScreenBlocker
  constructor: (@target, @args = {}) ->
    @block()
    @target.css('opacity', '0')

  unblock: ->
    @blocker.remove()
    @target.css('opacity', '1')

  block: ->
    @create_blocker()
    @target.after @blocker

  create_blocker: ->
    @blocker = $ '<div class="screen_blocker"></div>'

    @wrapper = $ '<div class="screen_blocker_image_wrapper"></div>'

    @img = $ '<img src="'+@args['img_src']+'"
                   height="'+@args.img_height+'"
                   width="'+@args.img_width+'"/>'

    @blocker.html @wrapper
    @wrapper.html @img

    if @args.custom_css?
      for name, value of @args.custom_css
        @blocker.css name, value

    wrapper_margin_left = (-parseInt(@args.img_width)/2)+'px'
    wrapper_margin_top = (-parseInt(@args.img_height)/2)+'px'

    @wrapper
      .width(@img.width())
      .height(@img.height())
      .css('margin-left', wrapper_margin_left)
      .css('margin-top', wrapper_margin_top)

    Animations.blink @img
