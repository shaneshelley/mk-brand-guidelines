var $                   = require('jquery'),
    _                   = require('lodash'),
    Backbone            = require('backbone'),
    ProductListingView  = require('plp/views/ProductListingView');

    Backbone.$ = $;

$(document).ready(function(){
  var mainView = new ProductListingView({
    el : $('#main')
  });
});
