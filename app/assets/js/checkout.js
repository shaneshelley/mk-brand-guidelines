'use strict';

window.KOR = window.KOR || {};
window.KOR.breakpoints = window.KOR.breakpoints || {
  xs: 700,
  md: 1020,
  lg: 1440,
  xl: 10000 // Hack for unslicking
};

window.KOR.util = window.KOR.util || {};
window.KOR.util.dontValidateHiddenField = function(fieldInstance) {
  if (!$(fieldInstance.$element).is(':visible')) {
    var ret = fieldInstance.validationResult = true;
    return ret;
  }
};

/*
 * Collection form plugin (used for 'add edit address' and 'add edit credit cards')
 */
'use strict';
(function() {
  function CollectionForm(element, options){
    var that = this;
    this.element = element;
    this.options = options;

    this.populateSelect(this.options.collection);

    $(that.options.selectEl).change(function(event){
      that.onChoiceChange.apply(that, [event]);
    });

    this.onChoiceChange(0);

    $(this.element).find('.' + this.options.name + '-edit-collection-link').click(function(e){
      e.preventDefault();
      var value = parseInt($(that.options.selectEl).val());
      if(value !== 'add_new'){
        that.editItem.apply(that, [parseInt($(that.options.selectEl).val())]);
      }
    });
    $(this.element).find('.' + this.options.name + '-add-collection-link').click(function(e){
      e.preventDefault();
      that.addNewItem.apply(that, []);
      $(that.options.selectEl).val('add_new');
    });
  }

  CollectionForm.prototype.onChoiceChange = function(){
    var value = $(this.options.selectEl).val();
    if(value === 'add_new'){
      this.addNewItem();
    }
    else {
      this.displayItem(value);
    }
  };

  CollectionForm.prototype.displayItem = function(index){
    var data = this.options.collection[index];

    if(this.options.onEditableItemSelect) {
      this.options.onEditableItemSelect.apply(this, []);
    }

    $(this.options.editDisplayForm).collapse('show');
    $(this.options.newForm).collapse('hide');
    for(var key in data){
      var el = $(this.options.editDisplayForm).find('.' + key);
      if(el.length > 0){
        if(key === 'title'){
          $(el[0]).text(data[key] + '.');
        }
        else {
          $(el[0]).text(data[key]);
        }
      }
    }
  };

  CollectionForm.prototype.addNewItem = function(){
    $(this.options.editDisplayForm).collapse('hide');
    if(this.options.editForm !== this.options.newForm){
      $(this.options.editForm).collapse('hide');
    }
    $(this.options.newForm).collapse('show');
    $(this.options.newForm).find('.toggle-add-edit').text(this.options.newTitle);
    if(this.options.onNewItemSelect){
      this.options.onNewItemSelect.apply(this, []);
    }
    this.options.populateForm.apply(this, [{}, this.options.newForm]);
    $($(this.options.newForm).closest('form')).parsley().reset();
  };

  CollectionForm.prototype.editItem = function(index){
    $(this.options.newForm).collapse('hide');
    $(this.options.editDisplayForm).collapse('hide');
    $(this.options.editForm).collapse('show');
    if(this.options.onEditableItemSelect) {
      this.options.onEditableItemSelect.apply(this, []);
    }
    $($(this.options.editForm).closest('form')).parsley().reset();
    $(this.options.editForm).find('.toggle-add-edit').text(this.options.editTitle);
    this.options.populateForm.apply(this, [this.options.collection[index], this.options.editForm]);
  };

  CollectionForm.prototype.populateSelect = function(choices){
    var that = this;
    for(var i = 0; i < choices.length; i++){
      $(that.options.selectEl)
        .append($('<option></option>')
        .attr('value', i)
        .text(that.options.selectValue.apply(that, [i])));
    }

    $(that.options.selectEl)
      .append($('<option></option>')
      .attr('value', 'add_new')
      .text(this.options.addNewItemText));
  };

  $(function(){
    $.fn.collectionForm = function(options) {
      if (this.length) {
        return this.each(function(){
          var collectionForm = new CollectionForm(this, options);
          $.data(this, 'collection-form', collectionForm);
        });
      }
    };
  });
})($);

'use strict';

$(function(){
  $.fn.isInViewPort = function(offset) {
    var $window = $(window);
    var docViewTop = $window.scrollTop();
    var elemTop = this.offset().top;

    return (elemTop <= (docViewTop + $(window).height() + offset));
  };
});

/*!
 * The MIT License
 *
 * Copyright (c) 2012 James Allardice
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

( function ( global ) {

  'use strict';

  //
  // Test for support. We do this as early as possible to optimise for browsers
  // that have native support for the attribute.
  //

  var test = document.createElement('input');
  var nativeSupport = test.placeholder !== void 0;

  global.Placeholders = {
    nativeSupport: nativeSupport,
    disable: nativeSupport ? noop : disablePlaceholders,
    enable: nativeSupport ? noop : enablePlaceholders
  };

  if ( nativeSupport ) {
    return;
  }

  //
  // If we reach this point then the browser does not have native support for
  // the attribute.
  //

  // The list of input element types that support the placeholder attribute.
  var validTypes = [
    'text',
    'search',
    'url',
    'tel',
    'email',
    'password',
    'number',
    'textarea'
  ];

  // The list of keycodes that are not allowed when the polyfill is configured
  // to hide-on-input.
  var badKeys = [

    // The following keys all cause the caret to jump to the end of the input
    // value.

    27, // Escape
    33, // Page up
    34, // Page down
    35, // End
    36, // Home

    // Arrow keys allow you to move the caret manually, which should be
    // prevented when the placeholder is visible.

    37, // Left
    38, // Up
    39, // Right
    40, // Down

    // The following keys allow you to modify the placeholder text by removing
    // characters, which should be prevented when the placeholder is visible.

    8, // Backspace
    46 // Delete
  ];

  // Styling variables.
  var placeholderStyleColor = '#ccc';
  var placeholderClassName = 'placeholdersjs';
  var classNameRegExp = new RegExp('(?:^|\\s)' + placeholderClassName + '(?!\\S)');

  // The various data-* attributes used by the polyfill.
  var ATTR_CURRENT_VAL = 'data-placeholder-value';
  var ATTR_ACTIVE = 'data-placeholder-active';
  var ATTR_INPUT_TYPE = 'data-placeholder-type';
  var ATTR_FORM_HANDLED = 'data-placeholder-submit';
  var ATTR_EVENTS_BOUND = 'data-placeholder-bound';
  var ATTR_OPTION_FOCUS = 'data-placeholder-focus';
  var ATTR_OPTION_LIVE = 'data-placeholder-live';
  var ATTR_MAXLENGTH = 'data-placeholder-maxlength';

  // Various other variables used throughout the rest of the script.
  var UPDATE_INTERVAL = 100;
  var head = document.getElementsByTagName('head')[ 0 ];
  var root = document.documentElement;
  var Placeholders = global.Placeholders;
  var keydownVal;

  // Get references to all the input and textarea elements currently in the DOM
  // (live NodeList objects to we only need to do this once).
  var inputs = document.getElementsByTagName('input');
  var textareas = document.getElementsByTagName('textarea');

  // Get any settings declared as data-* attributes on the root element.
  // Currently the only options are whether to hide the placeholder on focus
  // or input and whether to auto-update.
  var hideOnInput = root.getAttribute(ATTR_OPTION_FOCUS) === 'false';
  var liveUpdates = root.getAttribute(ATTR_OPTION_LIVE) !== 'false';

  // Create style element for placeholder styles (instead of directly setting
  // style properties on elements - allows for better flexibility alongside
  // user-defined styles).
  var styleElem = document.createElement('style');
  styleElem.type = 'text/css';

  // Create style rules as text node.
  var styleRules = document.createTextNode(
    '.' + placeholderClassName + ' {' +
      'color:' + placeholderStyleColor + ';' +
    '}'
  );

  // Append style rules to newly created stylesheet.
  if ( styleElem.styleSheet ) {
    styleElem.styleSheet.cssText = styleRules.nodeValue;
  } else {
    styleElem.appendChild(styleRules);
  }

  // Prepend new style element to the head (before any existing stylesheets,
  // so user-defined rules take precedence).
  head.insertBefore(styleElem, head.firstChild);

  // Set up the placeholders.
  var placeholder;
  var elem;

  for ( var i = 0, len = inputs.length + textareas.length; i < len; i++ ) {

    // Find the next element. If we've already done all the inputs we move on
    // to the textareas.
    elem = i < inputs.length ? inputs[ i ] : textareas[ i - inputs.length ];

    // Get the value of the placeholder attribute, if any. IE10 emulating IE7
    // fails with getAttribute, hence the use of the attributes node.
    placeholder = elem.attributes.placeholder;

    // If the element has a placeholder attribute we need to modify it.
    if ( placeholder ) {

      // IE returns an empty object instead of undefined if the attribute is
      // not present.
      placeholder = placeholder.nodeValue;

      // Only apply the polyfill if this element is of a type that supports
      // placeholders and has a placeholder attribute with a non-empty value.
      if ( placeholder && inArray(validTypes, elem.type) ) {
        newElement(elem);
      }
    }
  }

  // If enabled, the polyfill will repeatedly check for changed/added elements
  // and apply to those as well.
  var timer = setInterval(function () {
    for ( var i = 0, len = inputs.length + textareas.length; i < len; i++ ) {
      elem = i < inputs.length ? inputs[ i ] : textareas[ i - inputs.length ];

      // Only apply the polyfill if this element is of a type that supports
      // placeholders, and has a placeholder attribute with a non-empty value.
      placeholder = elem.attributes.placeholder;

      if ( placeholder ) {

        placeholder = placeholder.nodeValue;

        if ( placeholder && inArray(validTypes, elem.type) ) {

          // If the element hasn't had event handlers bound to it then add
          // them.
          if ( !elem.getAttribute(ATTR_EVENTS_BOUND) ) {
            newElement(elem);
          }

          // If the placeholder value has changed or not been initialised yet
          // we need to update the display.
          if (
            placeholder !== elem.getAttribute(ATTR_CURRENT_VAL) ||
            ( elem.type === 'password' && !elem.getAttribute(ATTR_INPUT_TYPE) )
          ) {

            // Attempt to change the type of password inputs (fails in IE < 9).
            if (
              elem.type === 'password' &&
              !elem.getAttribute(ATTR_INPUT_TYPE) &&
              changeType(elem, 'text')
            ) {
              elem.setAttribute(ATTR_INPUT_TYPE, 'password');
            }

            // If the placeholder value has changed and the placeholder is
            // currently on display we need to change it.
            if ( elem.value === elem.getAttribute(ATTR_CURRENT_VAL) ) {
              elem.value = placeholder;
            }

            // Keep a reference to the current placeholder value in case it
            // changes via another script.
            elem.setAttribute(ATTR_CURRENT_VAL, placeholder);
          }
        }
      } else if ( elem.getAttribute(ATTR_ACTIVE) ) {
        hidePlaceholder(elem);
        elem.removeAttribute(ATTR_CURRENT_VAL);
      }
    }

    // If live updates are not enabled cancel the timer.
    if ( !liveUpdates ) {
      clearInterval(timer);
    }
  }, UPDATE_INTERVAL);

  // Disabling placeholders before unloading the page prevents flash of
  // unstyled placeholders on load if the page was refreshed.
  addEventListener(global, 'beforeunload', function () {
    Placeholders.disable();
  });

  //
  // Utility functions
  //

  // No-op (used in place of public methods when native support is detected).
  function noop() {}

  // Avoid IE9 activeElement of death when an iframe is used.
  //
  // More info:
  //  - http://bugs.jquery.com/ticket/13393
  //  - https://github.com/jquery/jquery/commit/85fc5878b3c6af73f42d61eedf73013e7faae408
  function safeActiveElement() {
    try {
      return document.activeElement;
    } catch ( err ) {
      console.log(err);
    }
  }

  // Check whether an item is in an array. We don't use Array.prototype.indexOf
  // so we don't clobber any existing polyfills. This is a really simple
  // alternative.
  function inArray( arr, item ) {
    for ( var i = 0, len = arr.length; i < len; i++ ) {
      if ( arr[ i ] === item ) {
        return true;
      }
    }
    return false;
  }

  // Cross-browser DOM event binding
  function addEventListener( elem, event, fn ) {
    if ( elem.addEventListener ) {
      return elem.addEventListener(event, fn, false);
    }
    if ( elem.attachEvent ) {
      return elem.attachEvent('on' + event, fn);
    }
  }

  // Move the caret to the index position specified. Assumes that the element
  // has focus.
  function moveCaret( elem, index ) {
    var range;
    if ( elem.createTextRange ) {
      range = elem.createTextRange();
      range.move('character', index);
      range.select();
    } else if ( elem.selectionStart ) {
      elem.focus();
      elem.setSelectionRange(index, index);
    }
  }

  // Attempt to change the type property of an input element.
  function changeType( elem, type ) {
    try {
      elem.type = type;
      return true;
    } catch ( e ) {
      // You can't change input type in IE8 and below.
      return false;
    }
  }

  function handleElem( node, callback ) {

    // Check if the passed in node is an input/textarea (in which case it can't
    // have any affected descendants).
    if ( node && node.getAttribute(ATTR_CURRENT_VAL) ) {
      callback(node);
    } else {

      // If an element was passed in, get all affected descendants. Otherwise,
      // get all affected elements in document.
      var handleInputs = node ? node.getElementsByTagName('input') : inputs;
      var handleTextareas = node ? node.getElementsByTagName('textarea') : textareas;

      var handleInputsLength = handleInputs ? handleInputs.length : 0;
      var handleTextareasLength = handleTextareas ? handleTextareas.length : 0;

      // Run the callback for each element.
      var len = handleInputsLength + handleTextareasLength;
      var elem;
      for ( var i = 0; i < len; i++ ) {

        elem = i < handleInputsLength ?
          handleInputs[ i ] :
          handleTextareas[ i - handleInputsLength ];

        callback(elem);
      }
    }
  }

  // Return all affected elements to their normal state (remove placeholder
  // value if present).
  function disablePlaceholders( node ) {
    handleElem(node, hidePlaceholder);
  }

  // Show the placeholder value on all appropriate elements.
  function enablePlaceholders( node ) {
    handleElem(node, showPlaceholder);
  }

  // Hide the placeholder value on a single element. Returns true if the
  // placeholder was hidden and false if it was not (because it wasn't visible
  // in the first place).
  function hidePlaceholder( elem, keydownValue ) {

    var valueChanged = !!keydownValue && elem.value !== keydownValue;
    var isPlaceholderValue = elem.value === elem.getAttribute(ATTR_CURRENT_VAL);

    if (
      ( valueChanged || isPlaceholderValue ) &&
      elem.getAttribute(ATTR_ACTIVE) === 'true'
    ) {

      elem.removeAttribute(ATTR_ACTIVE);
      elem.value = elem.value.replace(elem.getAttribute(ATTR_CURRENT_VAL), '');
      elem.className = elem.className.replace(classNameRegExp, '');

      // Restore the maxlength value. Old FF returns -1 if attribute not set.
      // See GH-56.
      var maxLength = elem.getAttribute(ATTR_MAXLENGTH);
      if ( parseInt(maxLength, 10) >= 0 ) {
        elem.setAttribute('maxLength', maxLength);
        elem.removeAttribute(ATTR_MAXLENGTH);
      }

      // If the polyfill has changed the type of the element we need to change
      // it back.
      var type = elem.getAttribute(ATTR_INPUT_TYPE);
      if ( type ) {
        elem.type = type;
      }

      return true;
    }

    return false;
  }

  // Show the placeholder value on a single element. Returns true if the
  // placeholder was shown and false if it was not (because it was already
  // visible).
  function showPlaceholder( elem ) {

    var val = elem.getAttribute(ATTR_CURRENT_VAL);

    if ( elem.value === '' && val ) {

      elem.setAttribute(ATTR_ACTIVE, 'true');
      elem.value = val;
      elem.className += ' ' + placeholderClassName;

      // Store and remove the maxlength value.
      var maxLength = elem.getAttribute(ATTR_MAXLENGTH);
      if ( !maxLength ) {
        elem.setAttribute(ATTR_MAXLENGTH, elem.maxLength);
        elem.removeAttribute('maxLength');
      }

      // If the type of element needs to change, change it (e.g. password
      // inputs).
      var type = elem.getAttribute(ATTR_INPUT_TYPE);
      if ( type ) {
        elem.type = 'text';
      } else if ( elem.type === 'password' && changeType(elem, 'text') ) {
        elem.setAttribute(ATTR_INPUT_TYPE, 'password');
      }

      return true;
    }

    return false;
  }

  // Returns a function that is used as a focus event handler.
  function makeFocusHandler( elem ) {
    return function () {

      // Only hide the placeholder value if the (default) hide-on-focus
      // behaviour is enabled.
      if (
        hideOnInput &&
        elem.value === elem.getAttribute(ATTR_CURRENT_VAL) &&
        elem.getAttribute(ATTR_ACTIVE) === 'true'
      ) {

        // Move the caret to the start of the input (this mimics the behaviour
        // of all browsers that do not hide the placeholder on focus).
        moveCaret(elem, 0);
      } else {

        // Remove the placeholder.
        hidePlaceholder(elem);
      }
    };
  }

  // Returns a function that is used as a blur event handler.
  function makeBlurHandler( elem ) {
    return function () {
      showPlaceholder(elem);
    };
  }

  // Returns a function that is used as a submit event handler on form elements
  // that have children affected by this polyfill.
  function makeSubmitHandler( form ) {
    return function () {

        // Turn off placeholders on all appropriate descendant elements.
        disablePlaceholders(form);
    };
  }

  // Functions that are used as a event handlers when the hide-on-input
  // behaviour has been activated - very basic implementation of the 'input'
  // event.
  function makeKeydownHandler( elem ) {
    return function ( e ) {
      keydownVal = elem.value;

      // Prevent the use of the arrow keys (try to keep the cursor before the
      // placeholder).
      if (
        elem.getAttribute(ATTR_ACTIVE) === 'true' &&
        keydownVal === elem.getAttribute(ATTR_CURRENT_VAL) &&
        inArray(badKeys, e.keyCode)
      ) {
        if ( e.preventDefault ) {
            e.preventDefault();
        }
        return false;
      }
    };
  }

  function makeKeyupHandler(elem) {
    return function () {
      hidePlaceholder(elem, keydownVal);

      // If the element is now empty we need to show the placeholder
      if ( elem.value === '' ) {
        elem.blur();
        moveCaret(elem, 0);
      }
    };
  }

  function makeClickHandler(elem) {
    return function () {
      if (
        elem === safeActiveElement() &&
        elem.value === elem.getAttribute(ATTR_CURRENT_VAL) &&
        elem.getAttribute(ATTR_ACTIVE) === 'true'
      ) {
        moveCaret(elem, 0);
      }
    };
  }

  // Bind event handlers to an element that we need to affect with the
  // polyfill.
  function newElement( elem ) {

    // If the element is part of a form, make sure the placeholder string is
    // not submitted as a value.
    var form = elem.form;
    if ( form && typeof form === 'string' ) {

      // Get the real form.
      form = document.getElementById(form);

      // Set a flag on the form so we know it's been handled (forms can contain
      // multiple inputs).
      if ( !form.getAttribute(ATTR_FORM_HANDLED) ) {
        addEventListener(form, 'submit', makeSubmitHandler(form));
        form.setAttribute(ATTR_FORM_HANDLED, 'true');
      }
    }

    // Bind event handlers to the element so we can hide/show the placeholder
    // as appropriate.
    addEventListener(elem, 'focus', makeFocusHandler(elem));
    addEventListener(elem, 'blur', makeBlurHandler(elem));

    // If the placeholder should hide on input rather than on focus we need
    // additional event handlers
    if (hideOnInput) {
      addEventListener(elem, 'keydown', makeKeydownHandler(elem));
      addEventListener(elem, 'keyup', makeKeyupHandler(elem));
      addEventListener(elem, 'click', makeClickHandler(elem));
    }

    // Remember that we've bound event handlers to this element.
    elem.setAttribute(ATTR_EVENTS_BOUND, 'true');
    elem.setAttribute(ATTR_CURRENT_VAL, placeholder);

    // If the element doesn't have a value and is not focussed, set it to the
    // placeholder string.
    if ( hideOnInput || elem !== safeActiveElement() ) {
      showPlaceholder(elem);
    }
  }

}(this) );

( function ( $, global ) {

  'use strict';

  var originalValFn = $.fn.val;
  var originalPropFn = $.fn.prop;

  if ( !global.Placeholders.nativeSupport ) {

    $.fn.val = function ( val ) {
      var originalValue = originalValFn.apply(this, arguments);
      var placeholder = this.eq(0).data('placeholder-value');
      if (
        val === undefined &&
        this.eq(0).data('placeholder-active') &&
        originalValue === placeholder
      ) {
        return '';
      }
      return originalValue;
    };

    $.fn.prop = function ( name, val ) {
      if (
        val === undefined &&
        this.eq(0).data('placeholder-active') &&
        name === 'value'
      ) {
        return '';
      }
      return originalPropFn.apply(this, arguments);
    };
  }
}(jQuery, this) );

/*
* jQuery Simply Countable plugin
* Provides a character counter for any text input or textarea
*
* @version  0.4.2
* @homepage http://github.com/aaronrussell/jquery-simply-countable/
* @author   Aaron Russell (http://www.aaronrussell.co.uk)
*
* Copyright (c) 2009-2010 Aaron Russell (aaron@gc4.co.uk)
* Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
* and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
*/

'use strict';
(function($){

  $.fn.simplyCountable = function(options){
    options = $.extend({
      counter: '#counter',
      countType: 'characters',
      maxCount: 140,
      strictMax: false,
      countDirection: 'down',
      safeClass: 'safe',
      overClass: 'over',
      thousandSeparator: ',',
      onOverCount: function(){},
      onSafeCount: function(){},
      onMaxCount: function(){}
    }, options);

    var navKeys = [33, 34, 35, 36, 37, 38, 39, 40];

    return $(this).each(function(){

      var countable = $(this);
      var counter = $(options.counter);
      if (!counter.length) { return false; }

      var countCheck = function(){

        var count;
        var revCount;

        var reverseCount = function(ct){
          return ct - (ct * 2) + options.maxCount;
        };

        var countInt = function(){
          return (options.countDirection === 'up') ? revCount : count;
        };

        var numberFormat = function(ct){
          var prefix = '';
          if (options.thousandSeparator){
            ct = ct.toString();
            // Handle large negative numbers
            if (ct.match(/^-/)) {
              ct = ct.substr(1);
              prefix = '-';
            }
            for (var i = ct.length - 3; i > 0; i -= 3){
              ct = ct.substr(0, i) + options.thousandSeparator + ct.substr(i);
            }
          }
          return prefix + ct;
        };

        var changeCountableValue = function(val){
          countable.val(val).trigger('change');
        };

        /* Calculates count for either words or characters */
        if (options.countType === 'words'){
          count = options.maxCount - $.trim(countable.val()).split(/\s+/).length;
          if (countable.val() === ''){ count += 1; }
        }
        else { count = options.maxCount - countable.val().length; }
        revCount = reverseCount(count);

        /* If strictMax set restrict further characters */
        if (options.strictMax && count <= 0){
          var content = countable.val();
          if (count < 0) {
            options.onMaxCount(countInt(), countable, counter);
          }
          if (options.countType === 'words'){
            var allowedText = content.match( new RegExp('\\s?(\\S+\\s+){' + options.maxCount + '}') );
            if (allowedText) {
              changeCountableValue(allowedText[0]);
            }
          }
          else { changeCountableValue(content.substring(0, options.maxCount)); }
          count = 0;
          revCount = options.maxCount;
        }

        counter.text(numberFormat(countInt()));

        /* Set CSS class rules and API callbacks */
        if (!counter.hasClass(options.safeClass) && !counter.hasClass(options.overClass)){
          if (count < 0){ counter.addClass(options.overClass); }
          else { counter.addClass(options.safeClass); }
        }
        else if (count < 0 && counter.hasClass(options.safeClass)){
          counter.removeClass(options.safeClass).addClass(options.overClass);
          options.onOverCount(countInt(), countable, counter);
        }
        else if (count >= 0 && counter.hasClass(options.overClass)){
          counter.removeClass(options.overClass).addClass(options.safeClass);
          options.onSafeCount(countInt(), countable, counter);
        }

      };

      countCheck();

      countable.on('keyup blur paste', function(e) {
        switch(e.type) {
          case 'keyup':
            // Skip navigational key presses
            if ($.inArray(e.which, navKeys) < 0) { countCheck(); }
            break;
          case 'paste':
            // Wait a few miliseconds if a paste event
            setTimeout(countCheck, (e.type === 'paste' ? 5 : 0));
            break;
          default:
            countCheck();
            break;
        }
      });

    });
  };
})(jQuery);

/*
 * Tabs Panel plugin
 */
'use strict';
(function() {
  function TabsPanel(element){
    this.element = element;

    /* CSS CLASSES */
    var NAV_ITEM_SELECTOR = '.tabs-panel__nav-item',
    NAV_ITEM_ACTIVE_CLASS = 'tabs-panel__nav-item--active',
    TAB_PANEL_ITEM_SELECTOR = '.tabs-panel__body-item',
    TAB_PANEL_ACTIVE_CLASS = 'tabs-panel__body-item--active';

    /* JS WIDGET ELEMENTS */
    var $tabsPanelNav = $(this.element).find('.js-tabsPanelNav'),
    $tabsPanelBody = $(this.element).find('.js-tabsPanelBody');

    /* Tab click event */
    $tabsPanelNav.children().each(function() {
      $(this).find('a').click(function(e) {
        e.preventDefault();

        if (!$(this).parent(NAV_ITEM_SELECTOR).hasClass(NAV_ITEM_ACTIVE_CLASS)) {

          var target = $(this).attr('href');

          /* update the active states */
          $tabsPanelNav.find(NAV_ITEM_SELECTOR)
                        .removeClass(NAV_ITEM_ACTIVE_CLASS);

          $(this).parent(NAV_ITEM_SELECTOR).addClass(NAV_ITEM_ACTIVE_CLASS);

          $tabsPanelBody.find(TAB_PANEL_ITEM_SELECTOR)
                          .removeClass(TAB_PANEL_ACTIVE_CLASS);

          $tabsPanelBody.find(target).addClass(TAB_PANEL_ACTIVE_CLASS);
        }
      });
    });
  }

  $(function(){
    $.fn.tabsPanel = function() {
      if (this.length) {
        return this.each(function(){
          var tabsPanel = new TabsPanel(this);
          $.data(this, 'tabs-panel', tabsPanel);
        });
      }
    };
  });

})($);

/**
 * Slider and Collapse Wizards for the Checkout process
 *
 * These wizards are exposed to the user via a jQuery extension, and are initialized like this:
 *
 * $('.wizard').wizard(options);
 *
 * Several options are required to make the wizard work.  These are:
 * {
 *   backLink: jQuery select of any dom elements that can trigger a backwards move of the wizard
 *   previousPage: URL of wherer the user should go in the case of a back button click on the first step
 *   steps: An array of the steps the wizard should show.  Each step is further configured like so:
 *     {
 *        form: The jQuery selector of the form in the step.  This will be the form that is
 *              automatically parsley validated on step transition
 *        onStepComplete: A function to be run during a transition from this step to the next step.
 *                        This function *must* return a 'Promise' object (and resolve/reject it based on some criteria)
 *        onStepShown: Simliar to onStepComplete but run right after a transition to a step (thus on its initial display)
 *                     This function also has to return a 'Promise'.
 *     }
 *    slick: JSON object configuring a slick carousel.
 *    onWizardComplete: Function that is run after all steps are complete. This can be used to
 *                    take the user to wherever they need to go after the wizard is done.
 *
 *                    This function *must* return a 'Promise object'
 * }
 */

'use strict';

$(function(){
  $.fn.wizard = function(options) {
    if (this.length) {
      return this.each(function(){
        var wizard;
        if($(window).width() <= window.KOR.breakpoints.xs) {
          wizard = new SliderWizard(this, options);
        }
        else {
          wizard = new CollapseWizard(this, options);
        }
        $.data(this, 'wizard', wizard);
      });
    }
  };
});


//Base class from which the SliderWizard and CollapseWizards inherit
function BaseWizard(element, options){
  var that = this;
  this.element = element;
  this.$element = $(element);

  this.$element.find('.panel').removeClass('current');
  this.$element.find('.panel').removeClass('complete');

  this.$panelGroup = this.$element.find('.panel-group');
  this.$panelCollapse = this.$element.find('.kor-panel-collapse');

  if(this.$panelGroup.hasClass('slick-initialized')) {
    this.$panelGroup.slick('unslick');
  }

  this.options = options;

  if(options && options.steps){
    this.runStepShownHook(0);
  }

  if(options && options.onWizardComplete){
    $('.wizard-complete').unbind('click');
    $('.wizard-complete').click(function(event){
      that.onWizardComplete.apply(that, [event]);
    });
  }

  $('.step-number').click(function(e){
    e.preventDefault();
  });

  this.currentStep = 0;
}

/**
 * Common functionality run during step transitions
 * @param {number} index - The destination step of transition
 * @param {number} target (optional) The dom element that triggered the transition
 *
 * @return {promise} Either successful or rejected promose.
 */

BaseWizard.prototype.beforeShowingStep = function(index, target){
  var deferred = $.Deferred();
  var that = this;
  var $destination = $(that.stepElement(index));

  //Going backwards in the wizard is always successful
  if(index < this.currentStep){
    $($destination.closest('.panel')).removeClass('complete');
    this.currentStep = index;
    this.setStepFocus();
    deferred.resolve();
  }
  else {
    //perform parsley form validation
    var valid = true;
    var currentStep = this.options.steps[this.currentStep];
    if(currentStep.form && document.location.href.indexOf('novalidate') < 0) {
      valid = $(currentStep.form).parsley().validate();
    }

    //form validation succesfull
    if(valid){
      var ladda;
      if(target && $(target).hasClass('ladda-button')){
        ladda = Ladda.create(target);
        ladda.start();
      }
      //run any step complete hooks (this would run any supplied ajax requests, etc..)
      currentStep.onStepComplete().done(function(result){
        //step transition successful, move on to next step
        that.currentStep = index;
        if(ladda) {
          ladda.stop();
        }
        that.setStepFocus();
        deferred.resolve(result);
      }).fail(function(error){
        //user supplied hook failed
        if(ladda){
          ladda.stop();
        }
        deferred.reject(error);
      });
    }
    //form validation failed
    else {
      deferred.reject({parsley: false});
    }
  }

  return deferred.promise();
};

/**
 * Utiliy method that returns the panel container for a particular step
 * @param {number} index
 * @return {DomElement} a kor-collapse-panel
 */
BaseWizard.prototype.stepElement = function(index){
  return this.$element.find('.kor-panel-collapse').toArray()[index];
};

/**
 * Utility method returns the step identifier that an element points to.  This href is used
 * to update the url during step transitions and also to scroll to the right place after
 * step transitions.
 * @param {clickEvent} event that is triggering a possible step transition
 * @return {String} some href ('payment','shipping', ect..)
 */
BaseWizard.prototype.eventTarget = function(event){
  return $(event.target).attr('href') || $($(event.target).parent()).attr('href');
};

/**
 * Utility method that finds the dom element of a whole step based on a string identifier
 * (the string identifier may come from the 'eventTarget' method)
 * @param {String} string identifier of step
 * @return {DomElement} dom element of step
 */
BaseWizard.prototype.nextStep = function(target){
  return $('.kor-panel-collapse').toArray().indexOf($(target + '-step')[0]);
};

/**
 * This method forwards the wizard to some non initial step.  The use case
 * is when the page is loaded and we want to show the user the 2nd, 3rd, ect.. step
 * in the wizard.  The destination is derived from a hash in the url.
 * @param {Function} The transition function to call when transitioning between steps.  This is usually
 *                   the transition function of the child wizard object (SliderWizard or CollapseWizard).
 */
BaseWizard.prototype.fastForward = function(fn){
  var that = this;
  var goToStep = this.nextStep(window.location.hash);
  function loop(index){
    fn.apply(that, [index]).then(function(){
      if(that.currentStep < goToStep){
        loop.apply(that, [index + 1]);
      }
    });
  }

  if(goToStep && goToStep > 0){
    loop(1);
  }
};

/**
 * Runs any configured hook for an initial load of step.
 * @param {number} index of step
 */
BaseWizard.prototype.runStepShownHook = function(index){
  this.options.steps[index].onStepShown();
};

/**
 * Runs a configured hook when the user has succesfully passed through all the wizard steps.
 *
 * @param {Event} Event that triggered this action (might be a 'proceed somewhere else button')
 */
BaseWizard.prototype.onWizardComplete = function(event){
  var ladda = Ladda.create(event.target);
  ladda.start();
  this.options.onWizardComplete().then(function(){
    /*console.log('success');*/
  }).fail(function(error){
    console.log(error);
    if(ladda){
      ladda.stop();
    }
  });
};

/**
 * Takes the wizard one step back.
 */
BaseWizard.prototype.back = function(){
  if(this.currentStep === 0){
    window.location.href = this.options.previousPage;
  }
};

/**
 * Utility method that animate scrolls the page to a given position.
 * @param {number} position to scroll to
 */
BaseWizard.prototype.scrollToPosition = function(position){
  $('html, body').animate({
    scrollTop: position
  }, 500);
};

/**
 * Utility method that gives us a step identifier hash based on a step index (by doing some dom traversing)
 * @param {number} index of step
 * @return {String} step identifier
 */
BaseWizard.prototype.hashForStep = function(index){
  return $($($('.panel-heading')[index]).find('[data-toggle="wizard"]')[0]).attr('href').substring(1);
};

/**
 * Focuses on an invisible element to perserve tabbing flow on showing of new step
 * without automatically highlighting the first tabable element for users who
 * arent actually tabbing.
 */
BaseWizard.prototype.setStepFocus = function(){
  var $element = $(this.stepElement(this.currentStep)).parent().find('.js-tab-index-focus');
  $element.focus();
};

/**
 * Decides whether a certain event (click of button, click of link, etc...) should initiate a step change.
 * Allows step changes from elements within a step panel (for example, a button at the end of the step to move onto the next step).
 * Does not allow clicking into future steps directly.
 *
 * @param {event} the event that is trying to trigger a step transition.
 * @return {Boolean} whether the transition is allowed to continue.
 */
BaseWizard.prototype.allowStepChange = function(event){
  var nextStep = this.nextStep(this.eventTarget(event));
  var actionFromStepNumber = $('.panel').toArray().indexOf($(event.target).closest('.panel')[0]);
  return (nextStep <= this.currentStep || actionFromStepNumber === this.currentStep);
};

/**
 * This subclass of BaseWizard is for the desktop and tablet checkout process.  Its a collapsable panel view.
 * This object should be initialized by using the jQuery extension
 *
 * $('.wizard').wizard(options);
 *
 * @param {DomElement} the root element for the whole wizard
 * @param {JSON object} options to configure wizard.
 * @return {}
 */
function CollapseWizard(element, options){
  BaseWizard.call(this, element, options);

  this.$panelGroup.unbind('shown.bs.collapse');
  this.$panelGroup.unbind('hidden.bs.collapse');

  var that = this;
  this.$element.find('[data-toggle="wizard"]').unbind('click');
  this.$element.find('[data-toggle="wizard"]').click(function(event){
    if(that.allowStepChange(event)){
      that.onToggle.apply(that, [that.nextStep(that.eventTarget(event)), event.target]);
      window.location.hash = that.eventTarget(event);
      return false;
    }
    else {
      event.preventDefault();
    }
  });

  this.updateTabHeaders(0);
  this.updateStepEditLinks();
  this.fastForward.apply(this, [that.onToggle]);

  $(this.options.backLink).unbind('click');
  $(this.options.backLink).click(function(event){
    that.onBack.apply(that, [event]);
  });
}

CollapseWizard.prototype = new BaseWizard();

/**
 * Takes the wizard one step back;
 */
CollapseWizard.prototype.onBack = function(){
  this.back();
  this.onToggle(this.currentStep - 1);
};

/**
 * This temporarily disables the user from tabbing on the page and is used during step transition
 * animations to prevent the user from tabbing somewhere illogical on the page before
 * the next set of fields in the next step are ready to be tabbed into.
 */
CollapseWizard.prototype.preventTab = function(){
  $(document).on('keydown', function( e ) {
    if( e.which === 9 ) {
      e.preventDefault();
    }
  });
};

/**
 * Undoes 'preventTab'
 */
CollapseWizard.prototype.enableTab = function(){
  $(document).off('keydown');
};

/**
 * This method preforms a step transition.  It does that by running all the common logic on step transition
 * defined in BaseWizard, and then also by preforming CollapseWizard specific transition logic.
 * @param {number} The next step the wizard is trying to show
 * @return {DomElement} The dom element that triggered the step transition.
 */
CollapseWizard.prototype.onToggle = function(nextStep, target){
  var currentStep = this.currentStep;
  var $currentStep = $(this.stepElement(this.currentStep));
  var $destination = $(this.stepElement(nextStep));
  var that = this;

  $('.panel.complete').unbind('click');
  return this.beforeShowingStep(nextStep, target).done(function(){
    if(nextStep >= currentStep){
      setTimeout(function(){
        $($currentStep.closest('.panel')).addClass('complete');
        window.scrollTo(0, $(window.location.hash + '-step').offset().top - 70);
        that.updateStepEditLinks();
        that.updateCompleteStepClickHandlers();
        that.enableTab();
      }, 1000);
      $destination.removeClass('hidden');
      $currentStep.removeClass('hidden');
      $($destination.closest('.panel')).removeClass('complete');
      that.preventTab();
    }
    else {
      $currentStep.addClass('hidden');
      that.updateCompleteStepClickHandlers();
    }
    setTimeout(function(){
      that.scrollToPosition($(window.location.hash + '-step').offset().top - 70);
    }, 10);

    that.runStepShownHook(nextStep);
    that.updateTabHeaders(nextStep);
    that.updateStepEditLinks();
  }).fail(function(error){
    that.updateCompleteStepClickHandlers();
    console.log(error);
  });
};

/**
 * Adds a css class to the current wizard step so that it gets
 * the UI elements associated with being a current step
 * @param {number} Curent step
 */
CollapseWizard.prototype.updateTabHeaders = function(currentStep){
  $('.panel').removeClass('current');
  var $panels = $('.panel').toArray();
  $($panels[currentStep]).addClass('current');
};

/**
 * Updates the display of edit links in step headers (currently 'edit' for complete steps)
 * and 'Step x of x' for current/future steps
 */
CollapseWizard.prototype.updateStepEditLinks = function(){
  var $panels = $('.panel').toArray();
  for(var i = 0; i < $panels.length; i++){
    var $panel = $($panels[i]);
    if($panel.hasClass('complete')){
      $panel.find('.step-number').text('Edit');
      $panel.find('.step-number').addClass('underline');
    }
    else {
      $panel.find('.step-number').text('Step ' + (i + 1) + ' of ' + this.options.steps.length);
      $panel.find('.step-number').removeClass('underline');
    }
  }
};

/**
 * Sets click events on completed steps which open the step for edit.
 */
CollapseWizard.prototype.updateCompleteStepClickHandlers = function(){
  var that = this;

  setTimeout(function(){
    $('.panel.complete').unbind('click');
    $('.panel.complete').click(function(event){
      $(this).unbind('click');
      var index = $('.panel').toArray().indexOf($(event.target).closest('.panel')[0]);
      window.location.hash = that.hashForStep(index);
      that.onToggle(index);
    });
  }, 10);
};

/**
 * This subclass of BaseWizard is for the mobile slider view.
 * This object should be initialized by using the jQuery extension
 *
 * $('.wizard').wizard(options);
 *
 * @param {DomElement} the root element for the whole wizard
 * @param {JSON object} options to configure wizard.
 * @return {}
 */
function SliderWizard(element, options){
  BaseWizard.call(this, element, options);
  var that = this;

  this.$panelCollapse.removeClass('collapse');
  this.$panelGroup.slick(options.slick);

  this.$element.find('[data-toggle="wizard"]').unbind('click');
  this.$element.find('[data-toggle="wizard"]').click(function(event){
    if(that.allowStepChange(event)){
      if((window.pageYOffset || document.documentElement.scrollTop) > 200){
        setTimeout(function(){
          that.scrollToPosition(70);
        });
        setTimeout(function(){
          that.changeSlides.apply(that, [that.nextStep(that.eventTarget(event)), true, event.target]);
        }, 600);
      }
      else {
        that.changeSlides.apply(that, [that.nextStep(that.eventTarget(event)), true, event.target]);
      }
    }
    return false;
  });

  $(document).on('shown.bs.collapse', function(){
    that.onSlideHeightChange();
  });

  $(document).on('hidden.bs.collapse', function(){
    that.onSlideHeightChange();
  });

  this.updateSlideHeaders(0);
  this.$panelGroup.on('afterChange', function(event){
    event.preventDefault();
  });

  $(this.options.backLink).unbind('click');
  $(this.options.backLink).click(function(event){
    that.onBack.apply(that, [event]);
  });

  $(this.$element).find('.wizard-step-link').unbind('click');
  $(this.$element).find('.wizard-step-link').click(function(){
    that.changeSlides($(this).data('step'), true);
  });

  this.fastForward(that.changeSlides);

  setTimeout(function(){
    that.onSlideHeightChange();
  }, 500);
}

SliderWizard.prototype = new BaseWizard();

/**
 * Calls a slick carousel hook to recalculate height of current slide.  Used after side change to make sure
 * that the current slide has no extra whitespace and is tall enough to show all its content.
 * @param {}
 * @return {}
 */
SliderWizard.prototype.onSlideHeightChange = function(){
  if(this.$panelGroup[0].slick){
    this.$panelGroup[0].slick.setPosition();
  }
};

/**
 * This method moves the wizard from one step to another.
 * @param {number} Destination step
 * @param {boolean} Whether the url should be updated with the destination step hash (optional)
 * @param {DomElement} The dom element that triggered the transition (optional)
 */
SliderWizard.prototype.changeSlides = function(nextStep, updateUrl, target){
  var $destination = $(this.stepElement(nextStep));
  var $currentStep = $(this.stepElement(this.currentStep));
  var that = this;
  var deferred = $.Deferred();

  $destination.removeClass('hidden');
  this.beforeShowingStep(nextStep, target).done(function(result){
    $($currentStep.closest('.panel')).addClass('complete');
    that.$panelGroup[0].slick.slickGoTo(nextStep);
    window.setTimeout(function(){
      window.scrollTo(0, 70);
      if(updateUrl){
        window.location.hash = $destination.attr('id').replace('-step', '');
      }
      that.runStepShownHook(nextStep);
      deferred.resolve(result);
    }, 300);
    that.onSlideHeightChange();
    that.updateSlideHeaders(nextStep);
  }).fail(function(error){
    that.onSlideHeightChange();
    console.log(error);
    deferred.reject(error);
  });

  return deferred.promise();
};

/**
 * Updates the arrow style display on top of the mobile wizard, currently highlighting the current step
 * in orange, past steps in black and future steps in grey.
 * @param {number} currentStep
 */
SliderWizard.prototype.updateSlideHeaders = function(currentStep){
  var buttons = $('.mobile-nav').find('.arrow-container');
  buttons.removeClass('current');
  var buttonsArray = buttons.toArray();
  for(var i = 0; i < buttonsArray.length; i++){
    var $button = $(buttonsArray[i]);
    if(i < currentStep){
      $button.addClass('complete');
    }
    else if (i === currentStep){
      $button.removeClass('complete');
      $button.addClass('current');
    }
  }
};

/**
 * Moves the wizard a step back;
 */
SliderWizard.prototype.onBack = function(){
  this.back();
  this.changeSlides(this.currentStep - 1, true);
};

/**
 * Javascript that applies to the whole site (as opposed to specific pages)
 */

'use strict';
$(function(){

  window.setTimeout(function() {
    Placeholders.enable();
  }, 100);

  /* Seed the array of keys to allow for numbers-only inputs */
  var NUMBERS_INPUT_ARRAY = [];

  /* backspace key */
  NUMBERS_INPUT_ARRAY.push(8);

  /* delete key */
  NUMBERS_INPUT_ARRAY.push(46);

  /* tab key */
  NUMBERS_INPUT_ARRAY.push(9);

  /* standard number keys, 0-9 */
  for (var i = 48; i < 58; i++) {
      NUMBERS_INPUT_ARRAY.push(i);
  }

  /* numpad number keys, 0-9 */
  for (var j = 96; j < 106; j++) {
      NUMBERS_INPUT_ARRAY.push(j);
  }

  $('select').mousedown(function(){
    $('meta[name=viewport]').remove();
    $('head').append('<meta name="viewport" content="width=device-width, maximum-scale=1.0, user-scalable=0">');
    $(this).css('color', '#565656');
  });

  $('select').focusout(function(){
    $('meta[name=viewport]').remove();
    $('head').append('<meta name="viewport" content="width=device-width, initial-scale=yes">' );
    if($(this).val()){
      $(this).css('color', '#565656');
    }
    else {
      $(this).css('color', '#707070');
    }
  });

  // Setup Tooltips
  $('[data-toggle="tooltip"]').tooltip();


  // Setup Slick Carousel
  $('.responsive-carousel').slick({
    dots: false,
    infinite: true,
    speed: 300,
    slidesToShow: 4,
    slidesToScroll: 4,
    adaptiveHeight: true,
    responsive: [{
        breakpoint: window.KOR.breakpoints.lg,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 4,
          infinite: true
        }
      }, {
        breakpoint: window.KOR.breakpoints.md,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3
        }
      }, {
        breakpoint: window.KOR.breakpoints.xs,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
      // You can unslick at a given breakpoint now by adding:
      // settings: 'unslick'
      // instead of a settings object
    ]
  });

  // Setup Tabs Panels
  $('.js-tabsPanel').tabsPanel();

  $('[data-toggle="collapse"]').click(function (event) {
    var targetId = $(event.target).attr('href'),
        $targetEl = $(targetId);

    if($targetEl.hasClass('collapsing')){
      return;
    }

    var $iconEl = $('[data-icon-href="' + targetId + '"]');
    if($iconEl.hasClass('icon-expand')){
      $iconEl.removeClass('icon-expand');
      $iconEl.addClass('icon-collapse');
    }
    else if($iconEl.hasClass('icon-collapse')){
      $iconEl.removeClass('icon-collapse');
      $iconEl.addClass('icon-expand');
    }
    else if ($iconEl.hasClass('icon-open')) {
      $iconEl.removeClass('icon-open');
      $iconEl.addClass('icon-close-');
    }
    else if ($iconEl.hasClass('icon-close-')) {
      $iconEl.removeClass('icon-close-');
      $iconEl.addClass('icon-open');
    }
  });

  $('.js-btnDisabled').click(function(e) {
    e.preventDefault();
  });

  /* Set up validation for any form in any modal window */
  $('.js-korModal').on('show.bs.modal', function() {
    var $form = $(this).find('form');

    if ($form.length > 0) {
      $form[0].reset();
      console.log($form.find('.selectpicker').length);
      $form.find('.selectpicker').selectpicker('render');
      $form.parsley().reset();
    }
    Placeholders.enable();
  });

  /* Disable SHIFT key on certain inputs */
  $('.js-disableShift').keydown(function(event) {
    if(event.shiftKey) {
      event.preventDefault();
      return false;
    }
  });

  /* Disable ALT key + any other key on certain inputs */
  var altPressed = false;

  $('.js-disableAlt').keydown(function(event) {
    if(event.which === 18) {
      altPressed = true;
    } else if (altPressed) {
      event.preventDefault();
      return false;
    }
  }).keyup(function(event) {
    if(event.which === 18) {
      altPressed = false;
    }
  });

  /* Disable PASTE on certain inputs */
  $('.js-disablePaste').bind('paste', function (e) {
    e.preventDefault();
    return false;
  });

  /* Initialize any character limit counters */
  $.each($('.js-charLimit').toArray(), function(index, obj){
    $(obj).simplyCountable({
      counter: $(obj).data('counter'),
      maxCount: $(obj).data('counter-max-length'),
      strictMax: true
    });
  });

  /* Restrict certain inputs to numbers only */
  $('.js-numberInput').keydown(function(e) {
      var k = e.which;

      if (!($.inArray(k, NUMBERS_INPUT_ARRAY) >= 0)) {
          e.preventDefault();
      }
  });

  $('.js-footer-email-signup-form').parsley();
  $('#js-store-finder-form').parsley();

  $('.nav-links-detail').on('show.bs.collapse', function(){
    $('.follow-us').removeClass('hidden');
    $('.social-summmary').addClass('hidden');
    $('.desktop-footer-toggle-icon').addClass('icon-collapse');
    $('.desktop-footer-toggle-icon').removeClass('icon-expand');
  });

  $('.nav-links-detail').on('hide.bs.collapse', function(){
    $('.follow-us').addClass('hidden');
    $('.social-summmary').removeClass('hidden');
    $('.desktop-footer-toggle-icon').removeClass('icon-collapse');
    $('.desktop-footer-toggle-icon').addClass('icon-expand');
  });

  window.onscroll = function () {
    var offset = $('#shopping-bag-container').length > 0 ? -150 : -50;
    if($('#page-footer').isInViewPort(offset)){
      $('.mobile-scroll-to-top').removeClass('opacity-hidden');
    }
    else {
      $('.mobile-scroll-to-top').addClass('opacity-hidden');
    }
  };

  $('.mobile-scroll-to-top').click(function(){
    $('html, body').animate({
      scrollTop: 0
    }, 500);
  });

  //custom parsley validators
  window.ParsleyValidator
    .addValidator('ccard', function (value, ccEl) {
      return $(ccEl).validateCreditCard().valid;
    }, 32)
    .addMessage('en', 'ccard', 'Please enter a valid Card Number.');

  //this was erased in the past, it needs to be here for password validation.
  window.ParsleyValidator
    .addValidator('korpassword', function (value) {
      return /^(?=.*[a-zA-Z])(?=.*\d).+$/.test(value) && /^\S{6,20}$/.test(value);
    }, 32)
    .addMessage('en', 'korpassword', 'Please enter a valid Password.');

  window.ParsleyValidator
    .addValidator('fancyname', function (value) {
      return /^[a-zA-Z\s]*$/.test(value) && $.trim(value) === value;
    }, 32);

  //hack to fix bootstrap ios modal issue
  //where clicking into inputs inside a modal causes the background to scroll instead of the modal itself.
  //https://github.com/twbs/bootstrap/issues/14839
  $('body').on('shown.bs.modal', function() {
    $('body').addClass('modal-open-fix');
  });

  $('body').on('hide.bs.modal', function() {
    $('body').removeClass('modal-open-fix');
  });
});

/**
 * Footer JS
 */

'use strict';
$(function(){
  $('.js-footer-email-signup-form').parsley();
  $('#js-store-finder-form').parsley();

  $('.nav-links-detail').on('show.bs.collapse', function(){
    $('.follow-us').removeClass('hidden');
    $('.social-summmary').addClass('hidden');
    $('.desktop-footer-toggle-icon').addClass('icon-collapse');
    $('.desktop-footer-toggle-icon').removeClass('icon-expand');
  });

  $('.nav-links-detail').on('hide.bs.collapse', function(){
    $('.follow-us').addClass('hidden');
    $('.social-summmary').removeClass('hidden');
    $('.desktop-footer-toggle-icon').removeClass('icon-collapse');
    $('.desktop-footer-toggle-icon').addClass('icon-expand');
  });

  window.onscroll = function () {
    var offset = $('#shopping-bag-container').length > 0 ? -150 : -50;
    if($('#page-footer').isInViewPort(offset)){
      $('.mobile-scroll-to-top').removeClass('opacity-hidden');
    }
    else {
      $('.mobile-scroll-to-top').addClass('opacity-hidden');
    }
  };

  $('.mobile-scroll-to-top').click(function(){
    $('html, body').animate({
      scrollTop: 0
    }, 500);
  });
});

/**
 * Header JS
 */

'use strict';
$(function(){
  var accountTooltipContent = '<ul class="header-account-tooltip">' +
      '<li class="text-left"><a class="link-primary  link-primray--no-underline" href="https://www.michaelkors.com/myaccount/accountInformation.jsp"> MY ACCOUNT</a></li>' +
      '<li class="text-left row--push-05"><a class="link-primary link-primray--no-underline" href="https://www.michaelkors.com/myaccount/accountInformation.jsp?tabName=addresBookTab">ADDRESS BOOK</a></li>' +
      '<li class="text-left row--push-05"><a class="link-primary link-primray--no-underline" href="https://www.michaelkors.com/myaccount/accountInformation.jsp?tabName=paymentInfoTab">PAYMENT INFORMATION</a></li>' +
      '<li class="text-left row--push-05"><a class="link-primary link-primray--no-underline" href="https://www.michaelkors.com/myaccount/accountInformation.jsp?tabName=orderHistoryTab">ORDER HISTORY</a></li>' +
      '<li class="text-left row--push-05"><a class="link-primary link-primray--no-underline" href="https://www.michaelkors.com/myaccount/accountInformation.jsp?tabName=favoritesTab">FAVORITES</a></li>' +
      '<li class="text-left row--push-05"><a class="link-primary link-primray--no-underline" href="https://www.michaelkors.com/myaccount/createAccount.jsp?_requestid=91900">SIGN OUT</a></li>' +
      '<ul>';

  $('.js-account-link-desktop').tooltip({
    placement: 'bottom',
    html: true,
    container: $('.js-account-link-desktop'),
    title: accountTooltipContent,
    trigger: 'hover'
  });

  $('.js-account-link-tablet').tooltip({
    placement: 'bottom',
    html: true,
    container: $('.js-account-link-tablet'),
    title: accountTooltipContent,
    trigger: 'click'
  });

  var countrySelectorTooltipContent = '<div class="row"><div class="col-md-12">' +
  '<span class="h4">Select a country and currency</span>' +
  '</div></div>' +
  '<div class="col-md-12 country-selector">' +
  '  <div class="row row--push-15">' +
  '    <div class="col-xs-12 vertical-middle uppercase text-left">' +
  '      <div class="relative inline-block country-container">' +
  '        <div class="text-center country-selected">' +
  '          <icon class="icon-usa flag-icon"></icon>' +
  '          <a class="link-primary" href="#"" data-toggle="modal" data-target="#change-country-confirm-modal">ENGLISH USD</a>' +
  '        </div>' +
  '      </div>' +
  '    </div>' +
  '  </div>' +
  '  <div class="row row--push-15">' +
  '    <div class="col-xs-12 vertical-middle uppercase text-left">' +
  '      <div class="relative inline-block country-container">' +
  '        <div class="text-center">' +
  '          <icon class="icon-canada flag-icon"></icon>' +
  '          <a class="link-primary" href="#" data-toggle="modal" data-target="#change-country-confirm-modal">ENGLISH CAD</a>' +
  '        </div>' +
  '      </div>' +
  '    </div>' +
  '  </div>' +
  '  <div class="row row--push-15 row--pull-20">' +
  '    <div class="col-xs-12 vertical-middle uppercase text-left">' +
  '      <div class="relative inline-block country-container">' +
  '        <div class="text-center">' +
  '          <icon class="icon-canada flag-icon"></icon>' +
  '          <a class="link-primary" href="#" data-toggle="modal" data-target="#change-country-confirm-modal">Français CAD</a>' +
  '        </div>' +
  '      </div>' +
  '    </div>' +
  '  </div>' +
  '</div>';

  $('.js-country-selector-tablet').tooltip({
    placement: 'bottom',
    html: true,
    container: $('.js-country-selector-tablet'),
    title: countrySelectorTooltipContent,
    trigger: 'click'
  });

  $('.js-country-selector-desktop').tooltip({
    placement: 'bottom',
    html: true,
    container: $('.js-country-selector-desktop'),
    title: countrySelectorTooltipContent,
    trigger: 'hover'
  });
});

'use strict';
$(function() {
  //wizard configuration
  var options = {
    backLink: '#header-back-link',
    previousPage: '/shopping-bag.html',
    steps: [
      {
        form: '#shipping-form',
        onStepComplete: function(){
          var deferred = $.Deferred();
          setTimeout(function(){
            deferred.resolve();
          }, 1);
          return deferred.promise();
        },
        onStepShown: function(){
          var deferred = $.Deferred();
          $('.hidable-place-order').addClass('hidden');
          $('.sign-in-button').removeClass('hidden');
          deferred.resolve();
          return deferred.promise();
        }
      },
      {
        form: '#payment-form',
        onStepComplete: function(){
          var deferred = $.Deferred();
          setTimeout(function(){
            deferred.resolve();
          }, 1);
          return deferred.promise();
        },
        onStepShown: function(){
          var deferred = $.Deferred();
          $('.hidable-place-order').addClass('hidden');
          $('.sign-in-button').addClass('hidden');
          deferred.resolve();
          return deferred.promise();
        }
      },
      {
        form: '#order-review',
        onStepComplete: function(){
          var deferred = $.Deferred();
          setTimeout(function(){
            deferred.resolve();
          }, 1);
          return deferred.promise();
        },
        onStepShown: function(){
          var deferred = $.Deferred();
          $('.hidable-place-order').removeClass('hidden');
          deferred.resolve();
          return deferred.promise();
        }
      }
    ],
    slick: {
      dots: false,
      swipe: false,
      infinite: false,
      speed: 300,
      slide: '.panel',
      slidesToShow: 1,
      slidesToScroll: 1,
      adaptiveHeight: true,
      prevArrow: false,
      nextArrow: false
    },
    onWizardComplete: function(){
      var deferred = $.Deferred();
      setTimeout(function(){
        window.location.href = window.location.origin + '/confirmation.html';
        deferred.resolve();
      }, 1000);
      return deferred.promise();
    }
  };

  //run wizard initially and any time screen width changes.
  var width;
  var setup = function(){
    if(window.location.href.indexOf('signed-in-checkout') > -1){
      options.steps[1].form = '#saved-cards-form';
    }
    var currentWidth = $(document).width();
    if(currentWidth !== width){
      width = currentWidth;
      $('.wizard').wizard(options);
    }
  };

  var timeout;
  $(window).resize(function() {
    if(timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(setup, 500);
  });

  setup();

  if ($('#shipping-form').length > 0) {
    $('#shipping-form').parsley({}).on('field:error', window.KOR.util.dontValidateHiddenField);
  }
  $('#payment-shipping-form').on('show.bs.collapse', function(){
    var fields = $(this).find('input,select').toArray();
    for(var i = 0; i < fields.length; i++){
      $(fields[i]).parsley().reset();
    }
  });
  $('#shipping-phone').inputmask('999-999-9999', {'placeholder': '_'});
  $('#payment-card-ccv').inputmask('9999', {'placeholder': ''});
  if($('#send-cart-to-email-form').length > 0) {
    $('#send-cart-to-email-form').parsley();
  }

  for(var index in $('.promo-code-form').toArray()){
    $($('.promo-code-form')[index]).parsley();
  }

  $('.nested-promo-submit').click(function(e){
    e.preventDefault();
    $(this).closest('.nested-promo-code-form').find('input').parsley().validate();
  });


  if($('#payment-card-number').length > 0) {
    $('#payment-card-number').inputmask('9999999999999999', {'placeholder': ''});

    var creditCards = ['visa', 'amex', 'mastercard', 'discover'];
    $('#payment-card-number').keyup(function(){
      var cardInfo = $(this).validateCreditCard().card_type;

      var icon = $(this).closest('.credit-card-input-group').find('.card-type-icon');
      if(cardInfo && cardInfo.name){
        icon.removeClass('icon-generic-card');
        icon.addClass('icon-' + cardInfo.name);
      }
      else {
        for(var i in creditCards){
          icon.removeClass('icon-' + creditCards[i]);
        }
        icon.addClass('icon-generic-card');
      }
    });
  }

  if ($('#payment-card-expiration').length > 0) {
    $('#payment-card-expiration').inputmask('99/9999', {'placeholder': '_'});
  }

  if($('#sign-in-form').length > 0){
    var toggleSignInButton = function(){
      if($('#sign-in-email-address').parsley().isValid()
        && $('#sign-in-password').parsley().isValid()){
        $('#sign-in-submit').removeClass('btn-disabled');
        $('#sign-in-submit').addClass('btn-primary');
      }
      else {
        $('#sign-in-submit').removeClass('btn-primary');
        $('#sign-in-submit').addClass('btn-disabled');
      }
    };

    $('#sign-in-form').parsley();
    $('#sign-in-email-address').change(toggleSignInButton);
    $('#sign-in-password').change(toggleSignInButton);
  }

  $('.payment-card-ccv').inputmask('9999', {'placeholder': ''});
  if($('.payment-card-ccv').length > 0 && !$('.payment-card-ccv').css('-webkit-text-security')){
    $('.payment-card-ccv').remove();
    $('.payment-card-ccv-ie').removeClass('hidden');
  }

  //toggles paypal and credit card forms
  if ($('input[name="checkout-payment-methods"]').length > 0) {
    $('input[name="checkout-payment-methods"]').change(function(){
      if($(this).attr('id') === 'paypal-payment'){
        $('#paypal-form').collapse('show');
        $('#credit-card-form').collapse('hide');
        //hack for ie9
        setTimeout(function(){
          $('#cc-continue-container').css('display', 'none');
        }, 100);
      }
      else {
        $('#paypal-form').collapse('hide');
        $('#credit-card-form').collapse('show');
        $('#cc-continue-container').css('display', 'block');
      }
    });
  }

  //connects gift wrapping checkbox with gift reciept checkbox
  $('#gift-wrapping-checkbox').change(function(){
    var that = this;
    if(this.checked){
      $('#gift-wrap-modal').modal('show');
    }
    $.each($('.gift-reciept-container').find('input[type="checkbox"]').toArray(), function(){
      this.checked = that.checked;
    });
  });

  $.each($('.js-add-note-container').find('textarea').toArray(), function(index, obj){
    $(obj).simplyCountable({
      counter: $(obj).data('counter'),
      maxCount: 140,
      strictMax: true
    });
  });

  $('.js-add-note-link').on('click', function(){
    if(!$($(this).attr('href')).hasClass('collapsing')){
      if($(this).text() === 'Add Note'){
        $(this).text('Remove Note');
      }
      else {
        $($(this).attr('href')).find('textarea').val('');
        $(this).text('Add Note');
      }
    }
  });

  $('.product-checkbox-desktop').find('input[type="checkbox"]').on('change', function(){
    if(this.checked){
      $($(this).attr('href')).collapse('show');
    }
    else {
      $($(this).attr('href')).collapse('hide');
    }
  });

  $('#js-giftwrap-cancel').click(function(){
    $('#gift-wrap-modal').find('textarea').val('');
    $('.js-add-note-container').collapse('hide');
    $('.product-checkbox-desktop').find('input[type="checkbox"]').attr('checked', false);
  });

  if($('#payment-form').length > 0) {
    $('#payment-form').parsley({}).on('field:error', window.KOR.util.dontValidateHiddenField);
  }
});

$(function(){
  'use strict';

  var equalizeBoxes = function(){
    var $signature = $('#mk-signature-container');
    if(window.KOR.breakpoints.xs < window.innerWidth && $signature.length > 0){
      setTimeout(function(){
        var height = $('.js-sigSizer').height()
          + parseInt($('.js-sigSizer').css('padding-top'))
          + parseInt($('.js-sigSizer').css('padding-bottom'));
        $signature.css('height', height);
        $signature.css('display', 'block');
      }, 400);
    }
  };
  equalizeBoxes();

  var timeout;
  $(window).resize(function() {
    if(timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(equalizeBoxes, 500);
  });

  if($('#confirmation-create-account-form').length > 0){
    $('#confirmation-create-account-form').parsley();
  }
});

'use strict';

$(function() {
	if($('#shopping-bag-container').length > 0){
		$('#page-footer').addClass('padded-footer');
		$('.mobile-scroll-to-top').css('bottom', '100px');
	}

  /* maintains the state for showing the 2nd modal on edit gift card flow */
  var IS_EMAIL_GIFT_CARD = false;

  $('#continue-gift-card-edit').click(function(e){
    e.preventDefault();

    /* reset e-mail gift card state */
    IS_EMAIL_GIFT_CARD = false;

    if($('#gift-card-edit-form').parsley().validate()){

      /* hide the edit gift card modal, step 1 */
      $('#shopping-bag-edit-gift-card-step-one-modal').modal('hide');

      IS_EMAIL_GIFT_CARD = ($('select[name=edit_gift_card_send_by]').val().toString() === '2');
    }
  });

  /* show the e-mail gift card modal if the state was selected and
    the first modal has closed completely */
  $('#shopping-bag-edit-gift-card-step-one-modal').on('hidden.bs.modal', function () {
    if (IS_EMAIL_GIFT_CARD) {

      IS_EMAIL_GIFT_CARD = false;
      $('#shopping-bag-edit-gift-card-step-two-modal').modal('show');
    }
  });
});

$(function(){
  'use strict';

  if($('#saved-cards-form').length > 0) {
    $('#saved-cards-form').parsley().on('field:error', window.KOR.util.dontValidateHiddenField);
  }

  var options = {};
  options.collection = [{
    title: 'mrs',
    first_name: 'Eleanor',
    last_name: 'Bonchanté',
    addr_1: '65 W. Broadway',
    addr_2: 'Apt. 2',
    zip: '10012',
    city: 'New York',
    state: 'NY',
    phone: '917-555-1212',
    email: 'e.bonchanté@gmail.com'
  }];

  options.selectEl = '#saved-address-dropdown';
  options.selectValue = function(key){
    var ret = this.options.collection[key].addr_1;
    if(this.options.collection[key].addr_2){
      ret += (', ' + this.options.collection[key].addr_2.replace(/\./g, ' '));
    }
    return ret.toUpperCase();
  };
  options.addNewItemText = 'Add a new address';
  options.editDisplayForm = '.address-display';
  options.newForm = options.editForm = '.address-edit-form';
  options.newTitle = 'Add a new address';
  options.editTitle = 'Edit address';

  options.populateForm = function(data, form){
    $(form).find('select[name=title]').val(data.title);
    $(form).find('input[name="first-name"]').val(data.first_name);
    $(form).find('input[name="last-name"]').val(data.last_name);
    $(form).find('input[name="addr-1"]').val(data.addr_1);
    $(form).find('input[name="addr-2"]').val(data.addr_2);
    $(form).find('input[name="zip-code"]').val(data.zip);
    $(form).find('input[name="city"]').val(data.city);
    $(form).find('select[name="state"]').val(data.state);
    $(form).find('input[name="phone"]').val(data.phone);
    $(form).find('input[name="email"]').val(data.email);
  };

  options.onNewItemSelect = function(){
    $(this.element).find('.address-edit-collection-link').css('display', 'none');
    $(this.element).find('.address-add-collection-link').css('display', 'none');
  };

  options.onEditableItemSelect = function(){
    $(this.element).find('.address-edit-collection-link').css('display', 'inline');
    $(this.element).find('.address-add-collection-link').css('display', 'inline');
  };

  options.name = 'address';

  $('#saved-addresses').collectionForm(options);

  var paymentOptions = {};
  paymentOptions.collection = [{
    card_name: 'Snack Wellington',
    card_number: '************1111',
    cvv: '123',
    expiry: '12/2014',
    card_type: 'visa'
    }
  ];

  paymentOptions.selectEl = '#saved-cards-dropdown';
  paymentOptions.selectValue = function(key){
    var number = this.options.collection[key].card_number;
    return 'VISA ending in ' + number.substring(number.length - 4, number.length);
  };
  paymentOptions.addNewItemText = 'Add a new card';
  paymentOptions.editDisplayForm = '.card-display';
  paymentOptions.newForm = '.card-new-form';
  paymentOptions.editForm = '.card-edit-form';
  paymentOptions.newTitle = 'Add a new card';
  paymentOptions.editTitle = 'Edit card';
  paymentOptions.populateForm = function(data, form){
    $(form).find('input[name="card-name"]').val(data.card_name);
    $(form).find('input[name="expiry"]').val(data.expiry);
    var ccInput = $(form).find('input[name="card-number"]');
    ccInput.val(data.card_number);
    if(data.card_number){
      var icon = ccInput.closest('.credit-card-input-group').find('.card-type-icon');
      icon.removeClass('icon-generic-card');
      icon.addClass('icon-' + data.card_type);
    }
  };

  paymentOptions.onNewItemSelect = function(){
    $(this.element).find('.hide-on-new').collapse('hide');
  };

  paymentOptions.onEditableItemSelect = function(){
    $(this.element).find('.hide-on-new').collapse('show');
  };

  paymentOptions.name = 'credit';

  $('#saved-cards').collectionForm(paymentOptions);

  var billingAddressOptions = {};
  billingAddressOptions.collection = [{
    title: 'mr',
    first_name: 'foo',
    last_name: 'bar',
    addr_1: 'foo street',
    addr_2: 'apt 1',
    zip: '12345',
    city: 'Foolington',
    state: 'CA',
    phone: '123-123-1231',
    email: 'foo@bar.com'
    },
    {
      title: 'mrs',
      first_name: 'who',
      last_name: 'car',
      addr_1: 'dar street',
      addr_2: 'apt 1',
      zip: '12345',
      city: 'Coolington',
      state: 'CA',
      phone: '123-123-1231',
      email: 'snack@bar.com'
    }
  ];
  billingAddressOptions.selectEl = '#billing-address-dropdown';
  billingAddressOptions.selectValue = function(key){
    return this.options.collection[key].first_name;
  };
  billingAddressOptions.addNewItemText = 'Add a new address';
  billingAddressOptions.editDisplayForm = '.billing-address-display';
  billingAddressOptions.newForm = billingAddressOptions.editForm = '.billing-address-edit-form';
  billingAddressOptions.newTitle = 'Add a new address';
  billingAddressOptions.editTitle = 'Edit address';
  billingAddressOptions.populateForm = function(data, form){
    $(form).find('select[name=title]').val(data.title);
    $(form).find('input[name="first-name"]').val(data.first_name);
    $(form).find('input[name="last-name"]').val(data.last_name);
    $(form).find('input[name="addr-1"]').val(data.addr_1);
    $(form).find('input[name="addr-2"]').val(data.addr_2);
    $(form).find('input[name="zip-code"]').val(data.zip);
    $(form).find('input[name="city"]').val(data.city);
    $(form).find('select[name="state"]').val(data.state);
  };

  billingAddressOptions.onEditableItemSelect = function(){
    $(this.element).find('.billing-edit-collection-link').collapse('show');
    $(this.element).find('.billing-add-collection-link').collapse('show');
  };

  billingAddressOptions.onNewItemSelect = function(){
    $(this.element).find('.billing-edit-collection-link').collapse('hide');
    $(this.element).find('.billing-add-collection-link').collapse('hide');
  };

  billingAddressOptions.name = 'billing';

  $('#billing-address').collectionForm(billingAddressOptions);
  var resizeSlick = function(){
    setTimeout(function(){
      var panelGroup = $('.panel-group');
      if(panelGroup.hasClass('slick-initialized')){
        panelGroup[0].slick.setPosition();
      }
    });
  };

  if ($('input[name="saved-cards-payment-methods"]').length > 0) {
    $('input[name="saved-cards-payment-methods"]').change(function(){
      if($(this).attr('id') === 'paypal-payment'){
        $('#paypal-form-container').removeClass('hidden');
        setTimeout(function(){
          $('#saved-cards-container').addClass('hidden');
          $('#saved-cards-container').addClass('opacity-hidden');
          window.scrollTo(0, $('#alternate-payment-method').offset().top - 20);
          resizeSlick();
        }, 600);
        resizeSlick();
        $('#cc-continue-container').css('display', 'none');
        //hack for ie9
        setTimeout(function(){
          $('#cc-continue-container').css('display', 'none');
        }, 100);

        $('html, body').animate({
          scrollTop: $('#alternate-payment-method').offset().top - 20
        }, 500);
      }
      else {
        $('#paypal-form-container').addClass('hidden');
        $('#cc-continue-container').css('display', 'block');
        $('#saved-cards-container').removeClass('hidden');
        setTimeout(function () {
          $('#saved-cards-container').removeClass('opacity-hidden');
          resizeSlick();
        }, 20);
      }
    });
  }
});
