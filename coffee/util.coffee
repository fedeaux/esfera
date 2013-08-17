@get_iframed_document = (selector) ->
  $(selector)[0].contentWindow

@setup_urls = () ->
  window.local_url = document.URL
  window.base_url = document.URL.replace 'index.html', ''

@get_files_directory = () =>
  base_url+'files/ObjTest/pdf_tron.pdf.xod'

@copy = (obj) ->
  if not is_object obj
    return obj

  if obj instanceof Date
    return new Date(obj.getTime())

  if obj instanceof RegExp
    flags = ''
    flags += 'g' if obj.global?
    flags += 'i' if obj.ignoreCase?
    flags += 'm' if obj.multiline?
    flags += 'y' if obj.sticky?
    return new RegExp(obj.source, flags)

  newInstance = new obj.constructor()

  for key of obj
    newInstance[key] = copy obj[key]

  return newInstance

@intersection = (a, b) ->
  [a, b] = [b, a] if a.length > b.length
  value for value in a when value in b

@extend = (object, properties) ->
  for key, val of properties
    object[key] = val
  object

@merge = (options, overrides) ->
  extend (extend {}, options), overrides

@pad = (num, places, chr = '0') ->
  if num?
    zero = places - num.toString().length + 1
    return (Array(+(zero > 0 && zero)).join(chr) + num)

  chr*places

@break_datetime = (d = '0000-00-00 00:00:00') ->
  broken_datetime = /(\d\d\d\d)-(\d\d)-(\d\d)\s(\d\d):(\d\d):(\d\d)/.exec(d)
  if broken_datetime
    _broken_datetime = broken_datetime[1..6]

    return {
      year : _broken_datetime[0]
      month : _broken_datetime[1]
      day : _broken_datetime[2]
      hour : _broken_datetime[3]
      minute : _broken_datetime[4]
      second : _broken_datetime[5]
    }
  return ''

@break_time = (t = '00:00:00') ->
  broken_time = /(\d\d):(\d\d):(\d\d)/.exec(t)

  if broken_time?
    _broken_time = broken_time[1..3]

    return {
      hours : _broken_time[0]
      minutes : _broken_time[1]
      seconds : _broken_time[2]
    }
  ''

@break_date = (d = '0000-00-00') ->
  broken_date = /(\d\d\d\d)-(\d\d)-(\d\d)/.exec(d)

  if broken_date?
    _broken_date = broken_date[1..3]

    return {
      year : _broken_date[0]
      month : _broken_date[1]
      day : _broken_date[2]
    }
  ''

@looks_like_a_name = (s) ->
  not /[#.+>]/.test s

@mysql_date_string_to_int = (d) ->
  parseInt(d.replace /[\ :-]/g, '')

@mysql_date = (d) ->
  d = new Date()  unless d?
  d.mysql()

@get_args = (list, e) ->
  args = {}
  while e[0].tagName isnt "BODY" and list.length > 0
    for i of list
      a = list[i]
      unless typeof (e.attr(a)) is "undefined"
        args[a] = e.attr(a)
        list.splice i, i
    e = e.parent()
  if list.length > 0
    for i of list
      a = list[i]
      args[a] = null  if args[a] is `undefined`
  args

String::lpad = (padString, length) ->
  str = this
  str = padString + str  while str.length < length
  str

String::rpad = (padString, length) ->
  str = this
  str = str + padString  while str.length < length
  str

Date::mysql = ->
  m = new String(@getMonth() + 1)
  d = new String(@getDate())
  @getFullYear() + "-" + m.lpad("0", 2) + "-" + d.lpad("0", 2)

@is_array = (a) ->
  $.isArray a

@is_string = (s) ->
  typeof s == 'string'

@is_function = (s) ->
  typeof s == 'function'

@is_object = (o) ->
  typeof o == 'object'

@is_number = (n) ->
  (typeof n == 'number') and !isNaN(parseFloat(n)) and isFinite(n)

@fill_form_assign = (input, val) ->
  unless input.hasClass 'skip_fill_form_assign'
    type = input.attr 'type'

    if type in ['text', 'password', 'hidden', 'number', 'select'] or ! type?
      input.val val
    else if type == 'radio'
      $('[value="'+val+'"]').click()
    else if type == 'checkbox'
      input.click()
    else
      console.log 'ERROR: Unrecognized input type ', input, input.attr 'type'

    input.change()

    Form._clear_field_check(input)

@fill_form = (obj, map = {}, _form = '.main_form') ->
  form = $ _form

  for name, val of obj
    #console.log name, val
    if looks_like_a_name name
      input = $ '[name='+name+']', form
    else
      input = $ name, form #tries to use "name" as a selector

    continue if input.length == 0

    fill_form_assign input, val

@replace_last = (subject, search, replace) ->
  _subject = subject.split search

  if _subject.length == 1
    return _subject.join ''

  _subject[0..-2].join(search) + replace + _subject[_subject.length-1]

@format = (subject, _not_null, _null = "") ->
  if subject?
    if is_string _not_null
      return _not_null+subject
    else if is_object _not_null
      return _not_null.before + subject + _not_null.after
    else
      return subject
  else
    return _null

@capitalize = (string) ->
  return string.charAt(0).toUpperCase() + string.slice(1) if string?
  ''
