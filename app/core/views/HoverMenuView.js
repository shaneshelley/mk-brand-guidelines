'use strict';

var $         = require('jquery'),
    _         = require('lodash'),
    Backbone  = require('backbone'),
    MenuView  = require('./MenuView');

module.exports = MenuView.extend({
  events: {
    'mouseenter li'         : 'handleNavActive',
    'mouseleave li'         : 'handleNavInactive',
    'mouseenter .dropdown'  : 'handleMenuMouseEnter',
    'mouseleave .dropdown'  : 'handleMenuMouseLeave'
  },

  customSetup: function() {
    this.DELAY      = 400;
    this.$dkNav     = this.$('.dk');

    _.bindAll(this, 'handleMenuMouseEnter', 'handleMenuMouseLeave', 'handleNavActive', 'handleNavInactive');
  },

  closeMenu: function(){
    var _this = this;

    this.closeTimeout = setTimeout(function(){
      _this.$el.removeClass('show-menu');
      _this.$('.active').removeClass('active');
    }, _this.DELAY);
  },

  openMenu: function(){
    this.$el.addClass('show-menu');
  },

  selectNav: function(page) {
    this.$('[data-menu=' + page + ']').addClass('selected');
  },

  setContent: function(contentId){
    var content = "#" + contentId;
    this.$('.dd-inner').html($(content).html());
    if (contentId === 'destination-kors' || contentId === 'search') {
      this.$menu.addClass('short');
    }
    else {
      this.$menu.removeClass('short');
    }
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
