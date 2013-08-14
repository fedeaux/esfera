class @ScreenFitter
  constructor: (@target_selector, _args = {}) ->
    @target = $ @target_selector

    defs =
      strategy: 'fit_paper'
      container: @target.parent()
      lazy_apply_strategy_delay: 250
      onResize: null
      max_width: 960

    @args = {}

    for key, val of defs
      if _args[key]?
        @args[key] = _args[key]
      else
        @args[key] = val

    @width = @target.width()
    @height = @target.height()

    @container = @args.container

    @container.resize @lazy_apply_strategy
    @apply_strategy()

  lazy_apply_strategy: () =>
    if @lazy_apply_strategy_timeout
      clearTimeout @lazy_apply_strategy_timeout

    @lazy_apply_strategy_timeout = setTimeout @apply_strategy, @args.lazy_apply_strategy_delay

  set_containers_values: () ->
    @container_width = @container.width()
    @container_height = @container.height()

  apply_strategy: () =>
    @set_containers_values()

    if @args.strategy == 'fit_paper'
      @fit_paper()

    else if @args.strategy == 'match_screen'
      @match_screen()

  is_portrait: () ->
    @container_height > @container_width

  set_target_dimensions: (width, height) ->
    # @target.width width
    # @target.height height
    if width < @container_width
      margin_left = (@container_width - width)/2
    else
      margin_left = 0

    @target.width width
    @target.height height
    @target.offset {left: margin_left}
    #@args.onResize(@target) if @args.onResize?

  fit_paper: () ->
    dim = Math.min @container_width, @args.max_width
    @set_target_dimensions dim, dim * 4/3

  match_screen: () ->
    @set_target_dimensions @container_width, @container_height
