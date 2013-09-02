// Generated by CoffeeScript 1.4.0
(function() {
  var _this = this,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  this.is_app = function() {
    return typeof require === 'function';
  };

  this.get_iframed_document = function(selector) {
    return $(selector)[0].contentWindow;
  };

  this.get_url_arguments = function() {
    var args;
    args = {};
    window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/g, function(m, key, value) {
      return args[key] = value;
    });
    return args;
  };

  this.setup_local_urls = function() {
    window.local_url = document.URL;
    window.base_url = document.URL.replace('index.html', '');
    return window._get = get_url_arguments();
  };

  this.setup_remote_urls = function() {
    window.local_url = document.URL;
    window.base_url = document.URL.split('?')[0];
    return window._get = get_url_arguments();
  };

  this.get_files_directory = function() {
    return base_url + 'files/ObjTest/pdf_tron.pdf.xod';
  };

  this.copy = function(obj) {
    var flags, key, newInstance;
    if (!is_object(obj)) {
      return obj;
    }
    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }
    if (obj instanceof RegExp) {
      flags = '';
      if (obj.global != null) {
        flags += 'g';
      }
      if (obj.ignoreCase != null) {
        flags += 'i';
      }
      if (obj.multiline != null) {
        flags += 'm';
      }
      if (obj.sticky != null) {
        flags += 'y';
      }
      return new RegExp(obj.source, flags);
    }
    newInstance = new obj.constructor();
    for (key in obj) {
      newInstance[key] = copy(obj[key]);
    }
    return newInstance;
  };

  this.intersection = function(a, b) {
    var value, _i, _len, _ref, _results;
    if (a.length > b.length) {
      _ref = [b, a], a = _ref[0], b = _ref[1];
    }
    _results = [];
    for (_i = 0, _len = a.length; _i < _len; _i++) {
      value = a[_i];
      if (__indexOf.call(b, value) >= 0) {
        _results.push(value);
      }
    }
    return _results;
  };

  this.extend = function(object, properties) {
    var key, val;
    for (key in properties) {
      val = properties[key];
      object[key] = val;
    }
    return object;
  };

  this.merge = function(options, overrides) {
    return extend(extend({}, options), overrides);
  };

  this.pad = function(num, places, chr) {
    var zero;
    if (chr == null) {
      chr = '0';
    }
    if (num != null) {
      zero = places - num.toString().length + 1;
      return Array(+(zero > 0 && zero)).join(chr) + num;
    }
    return chr * places;
  };

  this.break_datetime = function(d) {
    var broken_datetime, _broken_datetime;
    if (d == null) {
      d = '0000-00-00 00:00:00';
    }
    broken_datetime = /(\d\d\d\d)-(\d\d)-(\d\d)\s(\d\d):(\d\d):(\d\d)/.exec(d);
    if (broken_datetime) {
      _broken_datetime = broken_datetime.slice(1, 7);
      return {
        year: _broken_datetime[0],
        month: _broken_datetime[1],
        day: _broken_datetime[2],
        hour: _broken_datetime[3],
        minute: _broken_datetime[4],
        second: _broken_datetime[5]
      };
    }
    return '';
  };

  this.break_time = function(t) {
    var broken_time, _broken_time;
    if (t == null) {
      t = '00:00:00';
    }
    broken_time = /(\d\d):(\d\d):(\d\d)/.exec(t);
    if (broken_time != null) {
      _broken_time = broken_time.slice(1, 4);
      return {
        hours: _broken_time[0],
        minutes: _broken_time[1],
        seconds: _broken_time[2]
      };
    }
    return '';
  };

  this.break_date = function(d) {
    var broken_date, _broken_date;
    if (d == null) {
      d = '0000-00-00';
    }
    broken_date = /(\d\d\d\d)-(\d\d)-(\d\d)/.exec(d);
    if (broken_date != null) {
      _broken_date = broken_date.slice(1, 4);
      return {
        year: _broken_date[0],
        month: _broken_date[1],
        day: _broken_date[2]
      };
    }
    return '';
  };

  this.looks_like_a_name = function(s) {
    return !/[#.+>]/.test(s);
  };

  this.mysql_date_string_to_int = function(d) {
    return parseInt(d.replace(/[\ :-]/g, ''));
  };

  this.mysql_date = function(d) {
    if (d == null) {
      d = new Date();
    }
    return d.mysql();
  };

  this.get_args = function(list, e) {
    var a, args, i;
    args = {};
    while (e[0].tagName !== "BODY" && list.length > 0) {
      for (i in list) {
        a = list[i];
        if (typeof (e.attr(a)) !== "undefined") {
          args[a] = e.attr(a);
          list.splice(i, i);
        }
      }
      e = e.parent();
    }
    if (list.length > 0) {
      for (i in list) {
        a = list[i];
        if (args[a] === undefined) {
          args[a] = null;
        }
      }
    }
    return args;
  };

  String.prototype.lpad = function(padString, length) {
    var str;
    str = this;
    while (str.length < length) {
      str = padString + str;
    }
    return str;
  };

  String.prototype.rpad = function(padString, length) {
    var str;
    str = this;
    while (str.length < length) {
      str = str + padString;
    }
    return str;
  };

  Date.prototype.mysql = function() {
    var d, m;
    m = new String(this.getMonth() + 1);
    d = new String(this.getDate());
    return this.getFullYear() + "-" + m.lpad("0", 2) + "-" + d.lpad("0", 2);
  };

  this.is_array = function(a) {
    return $.isArray(a);
  };

  this.is_string = function(s) {
    return typeof s === 'string';
  };

  this.is_function = function(s) {
    return typeof s === 'function';
  };

  this.is_object = function(o) {
    return typeof o === 'object';
  };

  this.is_number = function(n) {
    return (typeof n === 'number') && !isNaN(parseFloat(n)) && isFinite(n);
  };

  this.fill_form_assign = function(input, val) {
    var type;
    if (!input.hasClass('skip_fill_form_assign')) {
      type = input.attr('type');
      if ((type === 'text' || type === 'password' || type === 'hidden' || type === 'number' || type === 'select') || !(type != null)) {
        input.val(val);
      } else if (type === 'radio') {
        $('[value="' + val + '"]').click();
      } else if (type === 'checkbox') {
        input.click();
      } else {
        console.log('ERROR: Unrecognized input type ', input, input.attr('type'));
      }
      input.change();
      return Form._clear_field_check(input);
    }
  };

  this.fill_form = function(obj, map, _form) {
    var form, input, name, val, _results;
    if (map == null) {
      map = {};
    }
    if (_form == null) {
      _form = '.main_form';
    }
    form = $(_form);
    _results = [];
    for (name in obj) {
      val = obj[name];
      if (looks_like_a_name(name)) {
        input = $('[name=' + name + ']', form);
      } else {
        input = $(name, form);
      }
      if (input.length === 0) {
        continue;
      }
      _results.push(fill_form_assign(input, val));
    }
    return _results;
  };

  this.replace_last = function(subject, search, replace) {
    var _subject;
    _subject = subject.split(search);
    if (_subject.length === 1) {
      return _subject.join('');
    }
    return _subject.slice(0, -1).join(search) + replace + _subject[_subject.length - 1];
  };

  this.format = function(subject, _not_null, _null) {
    if (_null == null) {
      _null = "";
    }
    if (subject != null) {
      if (is_string(_not_null)) {
        return _not_null + subject;
      } else if (is_object(_not_null)) {
        return _not_null.before + subject + _not_null.after;
      } else {
        return subject;
      }
    } else {
      return _null;
    }
  };

  this.capitalize = function(string) {
    if (string != null) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
    return '';
  };

}).call(this);
