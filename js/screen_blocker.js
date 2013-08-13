// Generated by CoffeeScript 1.4.0
(function() {

  this.ScreenBlocker = (function() {

    function ScreenBlocker(target, args) {
      this.target = target;
      this.args = args != null ? args : {};
      this.block();
      this.target.css('opacity', '0');
    }

    ScreenBlocker.prototype.unblock = function() {
      this.blocker.remove();
      return this.target.css('opacity', '1');
    };

    ScreenBlocker.prototype.block = function() {
      this.create_blocker();
      return this.target.after(this.blocker);
    };

    ScreenBlocker.prototype.create_blocker = function() {
      var name, value, wrapper_margin_left, wrapper_margin_top, _ref;
      this.blocker = $('<div class="screen_blocker"></div>');
      this.wrapper = $('<div class="screen_blocker_image_wrapper"></div>');
      this.img = $('<img src="' + this.args['img_src'] + '"\
                   height="' + this.args.img_height + '"\
                   width="' + this.args.img_width + '"/>');
      this.blocker.html(this.wrapper);
      this.wrapper.html(this.img);
      if (this.args.custom_css != null) {
        _ref = this.args.custom_css;
        for (name in _ref) {
          value = _ref[name];
          this.blocker.css(name, value);
        }
      }
      wrapper_margin_left = (-parseInt(this.args.img_width) / 2) + 'px';
      wrapper_margin_top = (-parseInt(this.args.img_height) / 2) + 'px';
      this.wrapper.width(this.img.width()).height(this.img.height()).css('margin-left', wrapper_margin_left).css('margin-top', wrapper_margin_top);
      return Animations.blink(this.img);
    };

    return ScreenBlocker;

  })();

}).call(this);
