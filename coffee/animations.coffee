@Animations =
  blink: (elem, min = .1, max = 1, time = 1000) ->
    blink_out =  null
    blink_in = () =>
      elem.fadeTo time, min, blink_out

    blink_out = () =>
      elem.fadeTo time, max, blink_in

    blink_out()
