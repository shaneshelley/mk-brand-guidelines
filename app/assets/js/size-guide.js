$(document).ready(function(){
  // Swipe hint overlay
  var swipeOverlay = function() {
    var $measurements = $('.tab-content .active .measurements');
    var contentWidth  = $measurements.find('table').width()
    var windowWidth   = $measurements.width();

    if (contentWidth > windowWidth) {
      var overlay = $('<div id="swipe-overlay"> </div>');

      $measurements.append(overlay);
      $measurements.find('#swipe-overlay').fadeIn(500);

      timeout = setTimeout(function() {
        $('.measurements #swipe-overlay').fadeOut(500, function(){
          $('.measurements #swipe-overlay').remove();
        });
      }, 1000);
    }
  }

  swipeOverlay();

  // Inches/CM toggle
  $('#units-toggle .btn-toggle').on('click', function(e) {
    $('.dimensions-table').attr('id', $(this).find('input').attr('id'));
  });

  // change country
  $('.select-country').on('change', function() {
    var country = $(this).find('option:selected').val();

    $('.nav-tabs li a').each(function(){
      var href = $(this).attr('href');
      var replaced = href.replace(/^.+-/, '#' + country + '-');

      $(this).attr('href', replaced);
    });

    var newTab = $('.nav-tabs .active a').attr('href');

    $('.tab-content .active').removeClass('active');
    $('.tab-content').find(newTab).each(function(){
      $(this).addClass('active');

      swipeOverlay();
    });
  });

  var $mobileConversionTabs = $('.tab-content.mobile-only');

  $('a[data-toggle="tab"]').on('click', function (e) {
    $mobileConversionTabs.find('.active').removeClass('active');
    $mobileConversionTabs.find($(e.currentTarget).attr('href')).addClass('active');
  });

  $('a[data-toggle="tab"]').on('shown.bs.tab', function() {
    swipeOverlay();
  });

  $('.sizes-table').delegate('tbody td', 'mouseover mouseleave', function (e) {
    var current_table = $(this).parents('table'), // get table current cell is in
      tab_pane  = $(this).parents('.tab-pane'),
      col_index = $(this).index(), // get current cell column index (zero based)
      row_index = $(this).parent().index();

    if (e.type === 'mouseover') {
      $(tab_pane).addClass('mouseover');
      // add passive-hover class to current row and colgroup
      $(this).parent().addClass('passive-hover');
      $('.size-table tr', tab_pane).eq(row_index + 1).addClass('passive-hover');
      $('.dimensions-table tr', tab_pane).eq(row_index + 1).addClass('passive-hover');
      $(current_table).find('colgroup').eq(col_index).addClass('passive-hover');

      // add hover class to current element
      $(this).addClass('hover');

      // add hover class to all elements in current row with class ref
      $('.size-table tr').eq(row_index + 1).addClass('passive-hover');
    } else {
      $(tab_pane).removeClass('mouseover');

      // remove passive-hover class from current row and colgroup
      $(this).parent().removeClass('passive-hover');
      $('.size-table tr', tab_pane).eq(row_index + 1).removeClass('passive-hover');
      $('.dimensions-table tr', tab_pane).eq(row_index + 1).removeClass('passive-hover');
      $(current_table).find('colgroup').eq(col_index).removeClass('passive-hover');

      // remove hover class from current element
      $(this).removeClass('hover');
    }
  });
})
