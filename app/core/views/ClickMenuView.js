'use strict';

var $         = require('jquery'),
    _         = require('lodash'),
    Backbone  = require('backbone'),
    MenuView  = require('./MenuView');

module.exports = MenuView.extend({
  events: {
    'click #filter-labels li'   : 'handleNavClick',
    'click .close'              : 'closeMenu',
    'mouseenter'                : 'handleMouseEnter',
    'mouseleave'                : 'handleMouseLeave'
  },

  customSetup: function(){
    var _this         = this;
    this.$caret       = this.$('#filter-labels .caret');
    this.$filterLists = this.$('.filter-contents .filter-list');
    this.activeMenu   = null;
    this.isOpen       = false;
    this.isOverMenu   = false;

    // event listeners
    this.listenTo(this.vent, 'filters:apply', this.closeMenu);
    this.listenTo(this.vent, 'filters:affixed', this.closeMenu);

    $(document).scroll(function() {
      if (!_this.isOverMenu) {
        _this.closeMenu();
      }
    });

    _.bindAll(this, 'handleNavClick', 'handleMouseLeave', 'handleMouseEnter');
  },

  closeMenu: function(){
    this.activeMenu = '';
    this.$caret.removeClass('animate');
    $('.tabs .active').removeClass('active');
    this.$el.removeClass('show-menu');
    this.isOpen = false;
    this.docListener = null;
  },

  openMenu: function(){
    var _this = this;
    this.$el.addClass('show-menu');
    this.isOpen = true;

    // close the menu on click outside menu
    this.docListener = $(document).on('click', function(e) {
      if (!$(e.target).closest(_this.$el).length) {
        _this.closeMenu();
      }
    });
  },

  selectNav: function(page) {
    this.$('[data-menu=' + page + ']').addClass('selected');
  },

  setActiveNav: function($el, menuIsOpen) {
    this.activeMenu = $el.attr('data-menu');

    if (menuIsOpen) {
      this.$caret.addClass('animate');
    }

    var center = $el.position().left + ($el.outerWidth() / 2) - (this.$caret.outerWidth() / 2);

    this.$caret.css({
      left: center
    });

    this.$('.tabs .active').removeClass('active');
    $el.addClass('active');
    this.setContent($el.attr('data-menu'));
  },

  setContent: function(contentId){
    var content       = "#" + contentId;
    var $filterLists  = this.$filterLists;
    var activeIndex   = $filterLists.index($($(content)));

    _.each($filterLists, function(list){
      var $list = $(list);

      if ($filterLists.index($list) > activeIndex) {
        $list.addClass('right').removeClass('left');
      }
      else if ($filterLists.index($list) < activeIndex) {
        $list.addClass('left').removeClass('right');
      }
      else {
        $list.removeClass('left').removeClass('right');
      }
    });

    this.$('.filter-list.active').removeClass('active');
    this.$(content).addClass('active');
    this.vent.trigger('menu:changed', this.$(content).attr('id'));
  },

  handleNavClick: function(e) {
    e.preventDefault();

    if (this.activeMenu === $(e.currentTarget).attr('data-menu')) {
      this.closeMenu();
    }
    else {
      this.setActiveNav($(e.currentTarget), this.isOpen);
      this.openMenu();
    }
  },

  handleMouseEnter: function() {
    this.isOverMenu = true;
  },

  handleMouseLeave: function() {
    this.isOverMenu = false;
  },

  handleClose: function(e) {
    e.preventDefault();
    this.closeMenu();
  }
});
