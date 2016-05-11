'use strict';

var $         = require('jquery'),
    _         = require('lodash'),
    Backbone  = require('backbone');

module.exports = Backbone.View.extend({
  initialize: function(options) {
    this.vent       = options.vent;
    this.$navItems  = this.$('li');
    this.$menu      = options.menu;

    this.customSetup();
  },

  customSetup: function() {

  },

  openMenu: function(){
    var _this = this;
    this.$el.addClass('show-menu');
  },

  selectNav: function(page) {
    this.$('[data-menu=' + page + ']').addClass('selected');
  },

  /* Event Handlers */
  handleNavInactive: function() {
    this.closeMenu();
  },

  handleNavActive: function(e) {
    clearTimeout(this.closeTimeout);
    this.openMenu();

    /* determine mouse direction */
    var $prevItem = this.$('.active');
    var $nextItem = $(e.currentTarget);
    var prevIndex = this.$navItems.index($prevItem);
    var nextIndex = this.$navItems.index($nextItem);

    var direction = (prevIndex < nextIndex) ? 'left' : 'right'

    if (direction === 'right') {
      $prevItem.removeClass('right');
      $nextItem.addClass('right');
    }
    else {
      $prevItem.addClass('right');
      $nextItem.removeClass('right');
    }

    this.$('.active').removeClass('active');
    $(e.currentTarget).addClass('active');
    this.setContent($(e.currentTarget).attr('data-menu'));
  },

  handleMenuMouseEnter: function() {
    clearTimeout(this.closeTimeout);
  },

  handleMenuMouseLeave: function() {
    this.closeMenu();
  }
});
