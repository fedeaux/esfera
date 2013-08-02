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

    if @args.custom_css?
      for name, value of @args.custom_css
        @blocker.css name, value
