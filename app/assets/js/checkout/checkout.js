var omni_error_track_restrict3 = false;
var localeName = $("#nonPrimaryLocale").val();
var mobileRequest = $("#isMobileRequest").val();
if (localeName == null) {
	localeName = "";
}
sessionexpurl = "";
internalServerError = "";
if(mobileRequest == 'true'){
	sessionexpurl=localeName + '/mobile/account_signIn.jsp?error=409';
	internalServerError=localeName +'/mobile/common/serverError.jsp';
} else {
	sessionexpurl=localeName + '/myaccount/createAccount.jsp?error=409';
	internalServerError=localeName +'/common/serverError.jsp';
}

//Start : added for ajax overlay on click of AJAX call
$(document).ajaxStart(function() { 
	var overlay = $('<div></div>').addClass('ajax_overlay');
	$('body').append(overlay);
}).ajaxStop(function() { 
	setTimeout(function(){ $('.ajax_overlay').remove();}, 1000);
});
//End : added for ajax overlay on click of AJAX call
$(document).ready(function(){
	/*
	* slick initialize option <waseem> 
	*/
	var mkoptions = {
		slick: {
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
		}
	};
	$('body').on("click", "#viewFullSiteLink", function(e) {
		e.preventDefault();
		$("form#viewFullSite").submit();
	});
	$('.successMessage p').hide();
	initializeEditAddMonoLink();
	
	$(document).on('click', '.removeMonoFromBag', function(e) {
		e.preventDefault();
		hideMessage();
		$.ajax({           
			url: $(this).attr('href'),
			type: "post",
			dataType: "json",
			success: function(data) {
				if("failure" == data.result){
					var errors = data.errors;
					$('.alert-message--error').removeClass("hidden");
					for(i in errors){
						$('.serverErrors').text(errors[i].message);
						$('.serverErrors').show();
						$('.noLongerErrorMsg').hide();
						$('.ajaxErrorMessage').hide();
					}
				} else {
					$.ajax({           
						url: localeName+'/checkout/includes/shoppingCartInclude.jsp',
						type:'POST',
						dataType: "text",
						success: function(data) { 
							$('#completeShoppingBag').html(data);
							$('.itemRemove').show();
							if(disabledRR == 'true') {													
								$("#shopping-bag-container").show();								
							}
							responseReset();
							$('.successMessage').show();
							$('.successMessage p').hide();
							$('.successMessage , .successMessage .monogram').show();
							initializeEditAddMonoLink();
							if(disabledRR == 'false') {
								initRREvent();
							}
						}
					});
				}
				
			},
			error: function(xhr, ajaxOptions, thrownError) {
				newCheckoutMkobj.errorHandle(xhr, ajaxOptions, thrownError);
			}
		});
	}); 
	
	$('body').on("click", 'a.remove-gift-card-Link', function(e){ 
		e.preventDefault();
		$("form#delete-giftcard-form").find("#giftCardId").val($(e.currentTarget).attr('data-giftCardId'));
		ajaxFormSubmit($("form#delete-giftcard-form"));
	});
	
	$('body').on("click", 'a.order-review-dummy-button', function(e){ 
		e.preventDefault();
		$("#place-order-button").click();
	});
	
	
	
	var disableCheckout = $('#disableCheckout').val()
	if(disableCheckout == "true"){
		$('.alert-message--error').removeClass("hidden");
		$('.noLongerErrorMsg').show();
		$('.ajaxErrorMessage').hide();
		$('.serverErrors').hide();
		
	}
	/*
	* ajax submit
	*/
	function ajaxFormSubmit(form){
		formId = $(form).attr("id");
		formDataPopulation(formId);
		fieldsArray = $(form).serializeArray();
		fieldsArray.push({
			name : "formName",
			value : formId
		});
		fieldsArray = $.grep(fieldsArray, function(n, i) { 
			return n.name != "successUrl";
		});
		fieldsArray = $.grep(fieldsArray, function(n, i) { 
			return n.name != "errorUrl";
		});
		successUrl = $(form).find('#successUrl').val();
		errorUrl = $(form).find('#errorUrl').val();
		pageName = $(form).find('#pageFrom').val();
		$.ajax({
			url : localeName + '/checkout/common/ajaxFormSubmit.jsp',
			type : "post",
			data : fieldsArray,
			dataType : "json",
			cache : false,
			beforeSend : function() {
				if($(form).attr('id') == 'addCartItem') {
					var val=  $(form).find('.adding_input').val();
					$(form).find('#addToBag').val(val);
				}
			},
			success : function(data) {
				if(data.result == "success"){
					renderAjaxSuccessCallBack(data, formId, successUrl);
					responseReset();
				}				
				if(data.result == "error"){
					var errors = data.errors;
					if(formId == "orderPromotionForm") {
						for(i in errors){
							$('#errorMessage').text(errors[i].message);
							$('#errorMessage').css("color","red");
							$('#errorMessage').show();
						}
					} else if (formId == "addCartItem") {
						for(i=0;i<data.errors.length;i++) {
		                     var message = data.errors[i].message;
		                     $('.popUpErrorMessage .ajaxErrorMessage').html(message);
		            	 }
		         		$('.popUpErrorMessage .alert-message--error').removeClass('hidden');
		         		$('.popUpErrorMessage').show();
						$('.popUpErrorMessage p').hide();					
						$('.popUpErrorMessage .ajaxErrorMessage').show();
						var $changedInput = $(formId).find('.changed_input');
						var val1= $(formId).find('.default_input').val();
						$changedInput.val(val1);						
					}else if(formId == "gitcard-balance-form"){
						$("p#giftcard-error-message").text("");
						$("p#giftcard-message").hide();
						$("#giftcard-error-container").show();
						$("#giftcard-error-container .alert-message--error").removeClass("hidden").show();
						for(var key in data.errors){
							var errorMessage = $("p#giftcard-error-message").text();
							if(errorMessage != ""){
								errorMessage = errorMessage + "<br/>" +data.errors[key];
							}else{
								errorMessage = data.errors[key].message;
							}
							$("p#giftcard-error-message").text(errorMessage);
						}
					}else if(formId == "apply-giftcard-form"){
                        $("p#apply-giftcard-error-message").text("");
                        $("#apply-giftcard-success-container").hide();
                        $("#apply-giftcard-error-container").show();
                        $("#apply-giftcard-error-container .alert-message--error").removeClass("hidden").show();
                        for(var key in data.errors){
                               var errorMessage = $("p#apply-giftcard-error-message").text();
                               if(errorMessage != ""){
                            	   errorMessage = errorMessage + "<br/>" +data.errors[key].message; /*GWUAT-129 <dattaprasad> fixed on 03-12-2015*/
                               }else{
                                      errorMessage = data.errors[key].message;
                               }
                               $("p#apply-giftcard-error-message").html(errorMessage);	/*GWUAT-129 <dattaprasad> fixed on 03-12-2015*/	
                               $("#"+formId).find(".alert-message").show();
                        }
					} else if(formId == "updateCart"){						
						for(i=0;i<data.errors.length;i++) {
		                     var message = data.errors[i].message;
		                     $('.popUpErrorMessage .ajaxErrorMessage').html(message);
		            	 }
		         		$('.popUpErrorMessage .alert-message--error').removeClass('hidden');
		         		$('.popUpErrorMessage').show();
						$('.popUpErrorMessage p').hide();					
						$('.popUpErrorMessage .ajaxErrorMessage').show();
					} else if(formId == "orderPromotionFormForMobile") {
						var errors = data.errors;
						for(i in errors){
							$('.errorMessageMobile').text(errors[i].message);
							$('.errorMessageMobile').css("color","red");
							$('#wizardPanels .slick-list').css("height","auto");/* Baskar GWSIT-486 fixed*/
							$('.errorMessageMobile').show();
						}
					} else if(formId == "expressOrderForm") {
						var errors = data.errors;
						$('.alert-message--error').removeClass("hidden");
						$('.successMessage').hide();
						for(i in errors){
							$('.serverErrors').text(errors[i].message);
							$('.serverErrors').show();
							$('.noLongerErrorMsg').hide();
							$('.ajaxErrorMessage').hide();
						}
					}
				}
			},			
			error: function(xhr, ajaxOptions, thrownError) {
				newCheckoutMkobj.errorHandle(xhr, ajaxOptions, thrownError);
			}

		});
	}

	function renderAjaxSuccessCallBack(data, formId, successUrl){
		switch (formId) {
			case "updateCart" :
				localStorage.setItem("cartUpdatesuccessmsg",'true');
				location.href = successUrl+"?isEditCart=true";//Added for to call order re-price
				break;
			case "gift-wrap-notes-form" :
				giftWrapNoteUpdate();
				$('#gift-wrap-modal').modal('hide');
				//$('#js-giftwrap-cancel').click();
				break;
			case "orderPromotionForm" :
				var promoApplied = true;
				if(pageName == "checkout") {
					updateCheckoutOrderSummary(promoApplied);
				} else {
					updateShoppingBag(promoApplied);
				}
				break;
			case "orderPromotionFormForMobile" :
				var promoApplied = true;
				updateCheckoutOrderSummaryForMobile(promoApplied);
				break;
			case "expressOrderForm" :
				location.href = successUrl;
				break;
			case "gift-card-edit-form" :				
				localStorage.setItem("giftEditsuccessmsg",'true');
				location.href = successUrl;
				break;
			case "addressCreationEmailForm" :
				localStorage.setItem("giftEditsuccessmsg",'true');
				location.href = successUrl;
				break;
			case "delete-giftcard-form" :
				if(data.result == "success"){
					$("#billingContainer").attr("data-submitvalidate", "false");
					$("#billingContainer").load(localeName+"/checkout/includes/containerBilling.jsp", function(){
						$("#payment-step").removeClass("hidden");
						wizardInit(1);
						billingInit();
						initializeBillingZipcode();
					    initializeBillingAddress1(); 
					    $("#billingContainer").find('.selectpicker').selectpicker('refresh');
					});
				}
				break;
			case "apply-giftcard-form" :
				$("#apply-giftcard-error-container").hide();
				$("#apply-giftcard-success-container").show();
				$("#billingContainer").attr("data-submitvalidate", "false");
				$("#billingContainer").load(localeName+"/checkout/includes/containerBilling.jsp", function(){
					$("#payment-step").removeClass("hidden");
					wizardInit(1);
					billingInit();
					initializeBillingZipcode();
				    initializeBillingAddress1(); 
				    $("#billingContainer").find('.selectpicker').selectpicker('refresh');
				});
				break;
			case "gitcard-balance-form" :
				//location.href = successUrl;
				$("p#giftcard-message").text(data.giftcardBalance).show();
				$("#giftcard-error-container").hide();
				break;
			case "addCartItem" :
				localStorage.setItem("addedFromYouMayLike",'true');
				var cform = '#'+formId;
				var skuId = $(cform).find(".omniSku").val();
				var itemCount = $("#itemCount").val();
				if(itemCount==0 && dtmEnabledFlag == "true"){
					addToCartOmni(skuId);
				}
				else if(dtmEnabledFlag == "true"){
					addToCartOmniScAdd(skuId);
				}
				postAddItemToCart(cform);
				addItemToRRCart(formId);
				break;
				
			case "sign-in-form":
				var formObj = $("#"+formId)
				var emailId = formObj.find("#sign-in-email-address").val();
				if(data.result == "error"){
					$.each(data.errors,function(key,value){					
						var propertyName = value.propertyName;
						propertyName = propertyName + "Error";
						/*<dattaprasad> GWSIT-550 fixed on 03-11-2015 starts*/
						$("."+propertyName).html(value.message).removeClass("hiddenErrorMsg").show();
						if(value.propertyName == "globalError"){
							$(".globalError").html(value.message).removeClass("hiddenErrorMsg");
						}
						/*<dattaprasad> GWSIT-550 fixed on 03-11-2015 ends*/
					});
					if(dtmEnabledFlag == "true"){
					window.omniture_errorCapture("sign-in-form");
					}
				}
				else if(data.result == "success" && dtmEnabledFlag == "true"){
					mkorsData.profile = {"userID" : emailId};
					loginPage(emailId,successUrl);
					//location.href = successUrl;
				}
				else{
					location.href = successUrl;
				}
		}
	}

	/*
	* local set of error message
	*/
	var getmsg=localStorage.getItem("cartUpdatesuccessmsg");
	if(getmsg=='true'){
		$('.successMessage , .successMessage .itemUpdate').show();
		localStorage.setItem("cartUpdatesuccessmsg",'');
	}
	var giftEditsuccessmsg=localStorage.getItem("giftEditsuccessmsg");
	if(giftEditsuccessmsg=='true'){
		$('.successMessage , .successMessage .giftcardUpdate').show();
		localStorage.setItem("giftEditsuccessmsg",'');
	}
	var addedFromYouMayLike= localStorage.getItem("addedFromYouMayLike",'true');
	if(addedFromYouMayLike == 'true') {
		$('.successMessage , .successMessage .itemAdd').show();
		localStorage.setItem("addedFromYouMayLike",'');
	}
	var accountCreate= localStorage.getItem("accountCreate",'true');
	if(accountCreate == 'true') {
		$("#confirmation-thanks-box").removeClass("hidden");
		$("#confirmCreateAccount").removeClass("hidden");
		$("#loggedInUserSignature").addClass("hidden");
		localStorage.setItem("accountCreate",'');
	}
	
	function formDataPopulation(formId){
		switch (formId) {
		case "gift-wrap-notes-form" :
			var maxCount = document.getElementById("max_count_value").value;
			var giftWrapValues = new Array();
			var giftWrapValuesMob = new Array();
			var giftWrapMessages = "";
			var inputElements = document.getElementsByTagName("input");
			for (i=0; i<maxCount; i++){
				var num = i+1;
				giftWrapValues[i] = $("input#desktop-toggle-note-c"+num).is(":checked");
				giftWrapValuesMob[i] = $("input#mobile-toggle-note-c"+num).is(":checked");
				/*if($("#mobile-giftWrap").length > 0){
					var numb = num+1 ;
					giftWrapValuesMob[i] = $("input#add-note-"+numb).is(":checked");
				}*/
				if(i==0){
					giftWrapMessages = $("textarea#gift-text-"+num).val();
				}else{
					giftWrapMessages = giftWrapMessages + "@@@@"+ $("textarea#gift-text-"+num).val();
				}
				
			}
			if($('.mob-gfWrap').is(':visible')){
				document.getElementById("giftWrapOpt").value = giftWrapValuesMob;
			}else{
				document.getElementById("giftWrapOpt").value = giftWrapValues;
			}
			document.getElementById("giftMessages").value = giftWrapMessages;
			break;
		}
	}
	function postAddItemToCart(formId){
		var val=  $(formId).find('.added_input').val();
		var $changedInput = $(formId).find('.changed_input');
		$changedInput.val(val);
		setTimeout(function(){
			var val1= $(formId).find('.default_input').val();
			$changedInput.val(val1);
		},2000);
	}
    
    
    $('#apply-gift-card-modal , #gift-card-balance-modal').on('hidden.bs.modal', function(){
    	$("p#giftcard-message").hide();
    	$("#apply-giftcard-success-container , #giftcard-error-container , #apply-giftcard-error-container").hide();
    });

	function updateShoppingBag(promoApplied){
		$.ajax({           
			url: localeName+'/checkout/includes/shoppingCartInclude.jsp?promoApplied='+promoApplied,
			type:'POST',
			dataType: "text",
			success: function(data) { 
				$('#completeShoppingBag').html(data);				
				responseReset();
				if(promoApplied != true){
					$('.successMessage').show();
					$('.successMessage p').hide();
					$('.successMessage , .successMessage .quantityUpdate').show();
				}
				$.post(localeName+'/checkout/includes/updateShipMethod.jsp', {shipMethod : $("select#shippingMethod").val()}, function(data) {	
		    		$("#summary").load(localeName+"/checkout/common/orderSummaryOnCheckout.jsp", function(){
		    			responseReset();
		    		});
		    	});
			},
			complete: function(){
				newCheckoutMkobj.promoToggle();
			}
		});
	}
	
	function modelReset(targetModel){
		var $form = targetModel.find('form')
    	if ($form.length > 0) {
          $form[0].reset();
          console.log($form.find('.selectpicker').length);
          $form.parsley().reset();
        }
		if($('[data-toggle="tooltip"]').length > 0){
			$('[data-toggle="tooltip"]').tooltip();
		}
		var tabpanel = targetModel.find('.js-tabsPanel');
		if(tabpanel.length > 0){
			$('.js-tabsPanel').tabsPanel();
		}
		targetModel.find('.selectpicker').selectpicker('render');
        Placeholders.enable();
    }
    
	function responseReset(){
    	$('.selectpicker').selectpicker('render');    	
    	if($('form').length > 0){
	    	for(var index in $('form').toArray()){
	    	    $($('form')[index]).parsley();
	    	}
    	}
		if(!($('.responsive-carousel').hasClass('slick-initialized'))){
			initSlick();
		}
		disableSelectPicker();
		$('[data-toggle="tooltip"]').tooltip();
    }
	
    function initSlick(){
		$('.responsive-carousel').slick(mkoptions.slick);
	}
	
	$(document).on('submit', '.submitFormAjaxForCheckout', function(e) {
		e.preventDefault();
		hideMessage();
		ajaxFormSubmit(this);
	});
	
	$(document).on('submit', '#orderPromotionForm', function(e) {
		  e.preventDefault();
		  hideMessage();
		  var form = $("#orderPromotionForm");
		  var valid= true;
		  valid = $("#orderPromotionForm").parsley().validate();
		  if(valid){
					var promoCodeVal = $('#orderPromotionForm .enter_promo').val();
					var parsedPromo = parseInt(promoCodeVal);
					$('#orderPromotionForm .enter_promo').removeClass('redCol');
					if (promoCodeVal == "") {
						$('#main_container').find(".global_error_msg_container").html("Please enter a valid promo code.").show();
						$('#orderPromotionForm .enter_promo').addClass('redCol');
					} else {
						var ajax_result = ajaxFormSubmit(form);
					}
		  }
		  else{
			  if(!omni_error_track_restrict3){
					omni_error_track_restrict = false;
				}
			  
		  }
	});	
	
	$(document).on('submit', '#orderPromotionFormForMobile', function(e) {
		  e.preventDefault();
		  hideMessage();
		  var form = $(this);
		  var valid= true;
		  valid = $(this).parsley().validate();
		  if(valid){
					var promoCodeVal = $('#orderPromotionFormForMobile .enter_promo').val();
					var parsedPromo = parseInt(promoCodeVal);
					$('#orderPromotionFormForMobile .enter_promo').removeClass('redCol');
					if (promoCodeVal == "") {
						$('#main_container').find(".global_error_msg_container").html("Please enter a valid promo code.").show();
						$('#orderPromotionFormForMobile .enter_promo').addClass('redCol');
					} else {
						var ajax_result = ajaxFormSubmit(form);
					}
		  }
		  else{
			  if(!omni_error_track_restrict3){
					omni_error_track_restrict = false;
				}
			  
		  }
	});
	
	$(document).on('submit', '#addCartItem', function(e) {		
		 e.preventDefault();
		  var form = $("#addCartItem");
		  $parent = $(this).parents('#shopping-bag-add-item-modal');
		  var selected = $($parent).find('#qvChangeSizeValue').val();
		  var selectSizeLength =  $parent.find('select[name=edit_item_size]').length;
		  var sizeText = $($parent).find('#chooseSizeText').val();
		  var SizeInCapsText = $('#chooseSizeInCapsText').val();
		  if(selectSizeLength <= 0 || (selected != '' && selected !== sizeText && selected !== SizeInCapsText)){
			var ajax_result = ajaxFormSubmit(form);
		  } else {
			$parent.find('.selSizeErrMsg').show();
		  }
	});
	
	$(document).on('click', '.remove-item', function(e) {
		e.preventDefault();
		hideMessage();
		$.ajax({           
			url: $(this).attr('href'),
			type: "post",
			dataType: "json",
			cache : false,
			success: function(data) {
				if("failure" == data.result){
					var errors = data.errors;
					$('.alert-message--error').removeClass("hidden");
					for(i in errors){
						$('.serverErrors').text(errors[i].message);
						$('.serverErrors').show();
						$('.noLongerErrorMsg').hide();
						$('.ajaxErrorMessage').hide();
					}
				} else {
					$.ajax({           
						url: localeName+'/checkout/includes/shoppingCartInclude.jsp?isRepriceRequired=true',//Added for to call order re-price
						type:'POST',
						dataType: "text",
						success: function(data) { 
							$('#completeShoppingBag').html(data);
							$('.itemRemove').show();
							if(disabledRR == 'true') {													
								$("#shopping-bag-container").show();								
							}
							responseReset();
							$('#DTMUpdateContainer').load("/includes/updateCartForDTM.jsp");
							$('.successMessage').show();
							$('.successMessage p').hide();
							$('.successMessage , .successMessage .itemRemove').show();
							if(disabledRR == 'false') {
								initRREvent();
							} 
							//Starts - Added for monogramming - MKFP-175
								initializeEditAddMonoLink();
							//Ends - Added for monogramming - MKFP-175
							}
					});
				}
				
			},
			error: function(xhr, ajaxOptions, thrownError) {
				newCheckoutMkobj.errorHandle(xhr, ajaxOptions, thrownError);
			}
		});
	}); 
	
	$(document).on('show.bs.modal', '#shopping-bag-edit-item-modal', function(event){
		hideMessage();
		$("#shopping-bag-edit-item-modal .modal-body").load($(event.relatedTarget).attr("data-url"), function(){
			var targetModel = $("#shopping-bag-edit-item-modal");
    		modelReset(targetModel);
    	});
    });
	
	$(document).on('show.bs.modal', '#shopping-bag-add-item-modal', function(event){
		hideMessage();
    	$("#shopping-bag-add-item-modal .modal-body").load($(event.relatedTarget).attr("data-url"), function(){
			var targetModel = $("#shopping-bag-add-item-modal");
    		modelReset(targetModel);
    	});
    });
	
	$(document).on('show.bs.modal', '#size-guide-modal', function(event){		
		$("#size-guide-modal").find("#sizeGuideImage").attr('src',$(event.relatedTarget).attr("data-url"));
    	var targetModel = $("#size-guide-modal");    	
    	modelReset(targetModel);
    });
    /*<Baskar> GWUAT-102 fixed on 24-11-2015 starts*/
	$(document).on('hidden.bs.modal', '#size-guide-modal', function(event){		
		$('body').addClass("modal-open");
    });
	/*<Baskar> GWUAT-102 fixed on 24-11-2015 ends*/
	var autoCompleteByAddress = $("#autoCompleteByAddress").val();
	var autoCompleteByZipCode = $("#autoCompleteByZipCode").val();
	var autoCompByAddressInBilling = $("#autoCompByAddressInBilling").val();
	var autoCompByZipCodeInBilling = $("#autoCompByZipCodeInBilling").val();
	
	
	if($('.checkout').length > 0){
		if(typeof autoCompleteByAddress != undefined && autoCompleteByAddress != null && autoCompleteByAddress){
			initializeAddress1();
		}
		if(typeof autoCompleteByZipCode != undefined && autoCompleteByZipCode != null && autoCompleteByZipCode){
			initializeZipcode();
		}
		if(typeof autoCompByAddressInBilling != undefined && autoCompByAddressInBilling != null && autoCompByAddressInBilling){
			initializeBillingAddress1(); 
		}
		if(typeof autoCompByZipCodeInBilling != undefined && autoCompByZipCodeInBilling != null && autoCompByZipCodeInBilling){
			initializeBillingZipcode();
		}
	}
   
    
    //Shopping Cart 
    $(document).on('click', '.shipping-method', function(e) {   
    	hideMessage();
    	$.post(localeName+'/checkout/includes/updateShipMethod.jsp', {shipMethod : $(e.currentTarget).val()}, function(data) {	
    		$("#totalOrderSummary").load(localeName+"/checkout/includes/checkoutOrderTotalSummary.jsp?isShipping=true", function(){
    			newCheckoutMkobj.promoToggle();
    		});
    	});
    }); 
    
    
    $(document).on('click', '#gift-checkbox-top', function(e) {    	
    	$('#review-gift-checkbox').prop('checked', $(this).is(":checked"));
    }); 
    
    $(document).on('click', '#review-gift-checkbox', function(e) {    	
    	$('#gift-checkbox-top').prop('checked', $(this).is(":checked"));
    }); 
    
    
    
    if($("select#shippingMethod").val() == undefined || $("select#shippingMethod").val() == ""){
    	hideMessage();
    	$($('[data-id="shippingMethod"]').parent()).find("ul.dropdown-menu li a").first().click();
    	$('.selectpicker').selectpicker('refresh');
    }
    
    $(document).on('changed.bs.select', 'select#shippingMethod', function(e) {
    	hideMessage();
    	$.post(localeName+'/checkout/includes/updateShipMethod.jsp', {shipMethod : $(e.currentTarget).val()}, function(data) {	
    		/*$("#summary").load(localeName+"/checkout/common/orderSummaryOnCheckout.jsp", function(){
    			responseReset();
    		});*/  
    		/*<dattaprasad> GWSIT-386 on 29-10-2015 starts*/
    		$.ajax({
                 url : localeName + '/checkout/common/orderSummaryOnCheckout.jsp',
                 type : "post",
                 dataType : "html",
                 cache : false,                    
                 success : function(data) { 
					$("#summary").html(data);
					responseReset();
                 }
      		 });
    		/*<dattaprasad> GWSIT-386 on 29-10-2015 Ends*/		
    		$("#displayOrderTotal").load(localeName+"/checkout/includes/displayOrderTotal.jsp");
    	});
    }); 
    /*Start : Added to handle shipping price and tax on load document*/
    $.post(localeName+'/checkout/includes/updateShipMethod.jsp', {shipMethod : $("#shippingMethod").val()}, function(data) {	
		$("#summary").load(localeName+"/checkout/common/orderSummaryOnCheckout.jsp", function(){
			responseReset();
		});
		
		$("#displayOrderTotal").load(localeName+"/checkout/includes/displayOrderTotal.jsp");
	});
    /*End : Added to handle shipping price and tax on load document*/
    /*Start : IRIS Defect 29 Fix*/
	$(document).on('select-change', '#shipping-form .selectpicker', function(e) {    	
    	$(this).selectpicker('refresh');
    	$("#shippingMethodsContainer").load(localeName+"/checkout/includes/shippingMethod.jsp?shippingState="+$("#shipping-form select#state").val(), function(){
    		var selShipMethod = $("#shipping-form .shipping-method:checked").val();
			if(selShipMethod == undefined || selShipMethod == ""){
				$("#shipping-form .shipping-method").first().click();
			}
    	});
    });
	
	   /*End : IRIS Defect 29 Fix*/
	$(document).on('change', '#shipping-form select#state', function(e) {    	
    	$(this).selectpicker('refresh');
    	$("#shippingMethodsContainer").load(localeName+"/checkout/includes/shippingMethod.jsp?shippingState="+$("#shipping-form select#state").val(), function(){
    		var selShipMethod = $("#shipping-form .shipping-method:checked").val();
			if(selShipMethod == undefined || selShipMethod == ""){
				$("#shipping-form .shipping-method").first().click();
			}
    	});
    });
	
	$(document).on('change', '.qtySubmitFormAjaxForCheckout', function(e) {
		e.preventDefault();
		hideMessage();	
		form = $(this);
		formId = $(this).attr("id");
		var FormIdStart = $(this).find('.productIndex').val();
		var CheckFormId = "qtyCartChange_"+FormIdStart;
		// To do, need to remove later if not require
		fieldsArray = form.serializeArray();
		fieldsArray.push({name:"formName", value:formId});
		fieldsArray = $.grep(fieldsArray, function(n, i){ 
			return n.name != "successUrl";
		});
		fieldsArray = $.grep(fieldsArray, function(n, i){
			return n.name != "errorUrl";
		});
		$.ajax({
			url : localeName + '/checkout/common/ajaxFormSubmit.jsp',
			type : "post",
			data : fieldsArray,
			dataType : "json",
			cache : false,			
			success : function(data) {				
				if(data.result == "success"){
					$.ajax({           
						url: localeName+'/checkout/includes/updateShoppingCartItems.jsp',
						type: "post",
						data: fieldsArray,
						dataType: "json",
						cache: false,
						success: function(data) {   
							if("error" == data.result){
								var errors = data.errors;
								$('.alert-message--error').removeClass("hidden");
								for(i in errors){
									$('.serverErrors').text(errors[i].message);
									$('.serverErrors').show();
									$('.noLongerErrorMsg').hide();
									$('.ajaxErrorMessage').hide();
								}
							} else {
								if(data.shoppingCartItems != ""){
									$('#shoppingCartItems').html(data.shoppingCartItems);
								}
								
								if(data.cartSummary != ""){
									$('#cartSummary').html(data.cartSummary);
								}
								if(data.orderTotal != ""){
									$('#orderTotal').html(data.orderTotal);
								}
								$('#DTMUpdateContainer').load(localeName+"/includes/updateCartForDTM.jsp");
								$('.successMessage').show();
								$('.successMessage p').hide();
								$('.successMessage .quantityUpdate').show();
								responseReset();
							}
						}
					});
				}
				if(data.result == "error"){
					var errors = data.errors;
					$('.alert-message--error').removeClass("hidden");
					for(i in errors){
						$('.serverErrors').text(errors[i].message);
						$('.serverErrors').show();
						$('.noLongerErrorMsg').hide();
						$('.ajaxErrorMessage').hide();
					}
				}
			},
			error: function(xhr, ajaxOptions, thrownError) {
				newCheckoutMkobj.errorHandle(xhr, ajaxOptions, thrownError);
			}		
		});
	});
	
	$(document).on('submit', '.express-order-form', function(e) {
		e.preventDefault();
		hideMessage();
		var valid= true;
		valid = $(this).parsley().validate();
		if(valid){
			ajaxFormSubmit(this);
		}
	});
	
	function applyPromoCode(trackEvent, pageName, action){
	    var promoCode = "";
	    if($("#couponCodeLine").length > 0){
	           promoCode = $('#couponCodeLine #globalError').val();
	    }else if($("#istcouponCodeLine").length > 0){
	           promoCode = $('#istcouponCodeLine #globalError').val(); 
	    }      
	}


	$(document).on('click','.removeFromCoupons',function(e){
	    e.preventDefault();
	    hideMessage();
	    var $this = $(this);
	    $.ajax({          
	          url: $this.attr('href'),
	          type: "post",
	          dataType: "json",
	          success: function(data) {
	              if("failure" == data.result){
						var errors = data.errors;
						$('.alert-message--error').removeClass("hidden");
						for(i in errors){
							$('.serverErrors').text(errors[i].message);
							$('.serverErrors').show();
							$('.noLongerErrorMsg').hide();
							$('.ajaxErrorMessage').hide();
						}
	              } else {
	            	  if($('#pageFrom').val() == 'checkout'){
	            		  updateCheckoutOrderSummary(true);
	            	  } else {
	            		  updateShoppingBag(true);
	            	  }
	            	  
	              }
	          },
	          error: function(xhr, ajaxOptions, thrownError) {
					newCheckoutMkobj.errorHandle(xhr, ajaxOptions, thrownError);
				}
	    });
	});
	
	$(document).on('click','.removeFromCouponsForMobile',function(e){
	    e.preventDefault();
	    hideMessage();
	    var $this = $(this);
	    $.ajax({          
	          url: $this.attr('href'),
	          type: "post",
	          dataType: "json",
	          success: function(data) {
	              if("failure" == data.result){
						var errors = data.errors;
						$('.alert-message--error').removeClass("hidden");
						for(i in errors){
							$('.serverErrors').text(errors[i].message);
							$('.serverErrors').show();
							$('.noLongerErrorMsg').hide();
							$('.ajaxErrorMessage').hide();
						}
	              } else {
	            	  	updateCheckoutOrderSummaryForMobile(true);
	              }
	          },
	          error: function(xhr, ajaxOptions, thrownError) {
					newCheckoutMkobj.errorHandle(xhr, ajaxOptions, thrownError);
				}
	    });
	});
	
	

	$(document).on('change','.change_size', function() {
		var $this=$(this);
		var ajaxUrl = $this.attr('data-url')+"&skuId="+$this.val();
		var identifier = $this.attr('data-identifier');
		if(identifier == 'true') {
			$("#shopping-bag-add-item-modal .modal-body").load(ajaxUrl, function(){
	    		var targetModel = $("#shopping-bag-add-item-modal");
				modelReset(targetModel);
	    	});
		} else {
			$("#shopping-bag-edit-item-modal .modal-body").load(ajaxUrl, function(){
	    		var targetModel = $("#shopping-bag-edit-item-modal");
				modelReset(targetModel);
	    	});
		}
	});
	
	
	$(document).on('click','.change_color', function(e) {
		e.preventDefault();
		var $this=$(this);
		var ajaxUrl = $this.attr('data-url');
		var identifier = $this.attr('data-identifier');
		if(identifier == 'true') {
			$("#shopping-bag-add-item-modal .modal-body").load(ajaxUrl, function(){
	    		var targetModel = $("#shopping-bag-add-item-modal");
				modelReset(targetModel);
	    	});
		} else {
			$("#shopping-bag-edit-item-modal .modal-body").load(ajaxUrl, function(){
	    		var targetModel = $("#shopping-bag-edit-item-modal");
				modelReset(targetModel);
	    	});
		}
	});
	$(document).on('click','.addOrRemoveToFav',function(e){		
		e.preventDefault();
		hideMessage();
		var $this=$(this);
		addOrRemoveFavourite($this);
	});

	$(document).on('click','.singleItemAddTobag', function(e) {
		hideMessage();
		e.preventDefault();		
		var $this=$(this);
		singleItemAddToBag($this);
	});
	
	function updateShoppingCart(className) {				
		$.ajax({           
			url: localeName+'/checkout/includes/shoppingCartInclude.jsp',
			type: "post",			
			dataType: "html",
			cache: false,
			success: function(data) {   
				$('#completeShoppingBag').html(data);
				$('#DTMUpdateContainer').load("/includes/updateCartForDTM.jsp");
				$('.successMessage').show();
				$('.successMessage p').hide();
				$('.successMessage .'+className).show();
				responseReset();					
			},
			error: function(xhr, ajaxOptions, thrownError) {
				location.reload();
			}
		});	
	}
	function singleItemAddToBag($this) {
		var val0 = $this.find('.singleItemAddTobag').text();		
		  $.ajax({
	  		url: $this.attr('href'),
	  		dataType:  "JSON",
	  		type: "POST",
	  		beforeSend:function(xhr) {},
	  		success: function(data){
	  			 if(data.result=="success"){
	  				localStorage.setItem("addedFromYouMayLike",'true');
	         		var nonPrimarylocale  = $("#nonPrimaryLocale").val();        	    		     	    	     
	         		addItemToRRCart($this.attr('name'));	         		
	         	 } else if (data.result == 'error') {	         	
	         		for(i=0;i<data.errors.length;i++) {
	                     var message = data.errors[i].message;
	                     $('.ajaxErrorMessage').html(message);
	            	 }
	         		$('.alert-message--error').removeClass('hidden');	         						
					$('.ajaxErrorMessage').show();
	         	 }
	  		},
	  		error: function(xhr, status, msg){
	  			location.reload();
	  		}
	  	});	
	}	
	function addItemToRRCart(form){
		if(disabledRR == 'false') {			
			var localeName = $("#nonPrimaryLocale").val();
			var catId = '';
			var formObj = $("#"+form);
			var skuId = '';
			var prodId = '';
			var isSingle = false;
			if(form == 'addCartItem') {
				skuId = $("#"+form).find('#rrSkuId').val();
				prodId = $("#"+form).find('#rrProductId').val();					
				catId = $('#rrCategoryId_'+prodId).val();
			} else {
				isSingle = true;
				prodId = form;
				skuId = $('#rrSkuId_'+prodId).val();								
				catId = $('#rrCategoryId_'+prodId).val();
			}
			jQuery.ajax({           
				url: localeName+'/rrRecommendations/rrFragments/rrAddToCartEvent.jsp',
				type: 'POST',
				data: {rrSkuId:skuId, rrProductId: prodId, rrCategoryId: catId},
				dataType:"html",
				async: false,
				success: function(data) { 
					$('#pageType').val("addToCart");
					$('#rrAddTocartEvent').html("");
					$('#rrAddTocartEvent').html(data);				
				},
				complete : function(){
					focusTop();
					location.reload();
				}
			});
		} else {
			focusTop();
			location.reload();
		}
	}
	function focusTop(){
		$(window).scrollTop(0);
	}
	function addOrRemoveFavourite($this){
		  $.ajax({
	  		url: $this.attr('href'),
	  		dataType:  "JSON",
	  		type: "POST",
	  		success: function(data){
	  			if(data.errorMessage != undefined) {
					var errors = data.errors;
					$('.alert-message--error').removeClass("hidden");
					for(i in errors){
						$('.serverErrors').text(errors[i].message);
						$('.serverErrors').show();
						$('.noLongerErrorMsg').hide();
						$('.ajaxErrorMessage').hide();
					}
	  			} else {
					var idValue = '#addOrRemoveToFav'+data.catalogRefID;
					var pageName = data.pageName;
					 $this.attr('href',data.url);
					 $this.attr('title',data.title);
					 $this.attr('class','link-secondary addOrRemoveToFav');
					 if(pageName == "quickViewPopup"){
						 $(idValue).text("");
						 $('.popSuccessMessage').show();
						 $('.favorites').text(data.successMessage);
						 $('.favorites').show();
					 } else {
						 $(idValue).text("");
						 $('.successMessage').show();
						 $('.successMessage p').hide();
						 $('.addToFav').text(data.successMessage);
						 $('.addToFav').show();
					 }
	  			}
	  		},
	  		error: function(xhr, ajaxOptions, thrownError) {
				newCheckoutMkobj.errorHandle(xhr, ajaxOptions, thrownError);
			}
	  	});

	}
	
	
		
	 /* start of edit gift card */
	
	$(document).on('show.bs.modal', '#shopping-bag-edit-gift-card-step-one-modal', function(event){
		hideMessage();
    	$("#shopping-bag-edit-gift-card-step-one-modal .modal-body").load($(event.relatedTarget).attr("data-url"), function(){
			var targetModel = $("#shopping-bag-edit-gift-card-step-one-modal");
    		modelReset(targetModel);
    	});
    });  
	 /* maintains the state for showing the 2nd modal on edit gift card flow */
	 var IS_EMAIL_GIFT_CARD = false;
	 var modelTwo;
	 var giftcardAmount = '';
	 $(document).on('click', '#continue-gift-card-edit' ,function(e){
		 e.preventDefault();
		 var minAmount = $('#giftcardMinLimit').val();
		 var maxAmount = $('#giftcardMaxLimit').val();
		 var userAmount = $('#SelectInput').val();
		 giftcardAmount = $('#giftCardAmount option:selected').val();
		 if(giftcardAmount == "other"){
			 userAmount = userAmount; 
		  }else{
			  userAmount = giftcardAmount; 
		  }
		 if(userAmount != undefined && userAmount != ''){
			 userAmount = userAmount.replace('$', "");
			 userAmount = parseFloat(userAmount);
		 }
		 if(minAmount != undefined && minAmount != ''){
			 minAmount = parseFloat(minAmount);
		 }
		 if(maxAmount != undefined && maxAmount != ''){
			 maxAmount = parseFloat(maxAmount);
		 }
		 if(userAmount < minAmount || maxAmount < userAmount){
			 $('#giftCardMaxLimitErrors #minAmount').text('$'+minAmount);
			 $('#giftCardMaxLimitErrors #maxAmount').text('$'+maxAmount);
			 $('#giftCardMaxLimitErrors').css('display', 'block');
		 }else{
			 $('#giftCardMaxLimitErrors').css('display', 'none');
			 modelTwo = $(this).closest('form').find('#continue-gift-card-edit-modelTwo').val();
		 
		 /* reset e-mail gift card state */
		 IS_EMAIL_GIFT_CARD = false;
		 $('#SelectInput').parsley({}).on('field:error', window.KOR.util.dontValidateHiddenField);
	
		 if($('#gift-card-edit-form').parsley().validate()){
			 $('#giftAmountPop').val(userAmount);
			  /* hide the edit gift card modal, step 1 */
			  $('#shopping-bag-edit-gift-card-step-one-modal').modal('hide');
		
			  IS_EMAIL_GIFT_CARD = ($('select[name=giftCardSendByDropdown]').val() === 'true');
			  if(IS_EMAIL_GIFT_CARD == false){
					//Write the ajax trigger function here
					ajaxFormSubmit($("#gift-card-edit-form"));
			  }
	    }
		}
	 });
		
	/* show the e-mail gift card modal if the state was selected and
	the first modal has closed completely */
	$('#shopping-bag-edit-gift-card-step-one-modal').on('hidden.bs.modal', function () {
		if (IS_EMAIL_GIFT_CARD) {
		  giftcardAmount = $(this).find('#giftCardAmount option:selected').val();
		  if(giftcardAmount == "other"){
			giftcardAmount = $('#SelectInput').val();
			giftcardAmount = giftcardAmount.replace('$', "");
		  }
		  IS_EMAIL_GIFT_CARD = false;
		  $('#shopping-bag-edit-gift-card-step-two-modal').modal('show');
	    }
	});
	
	/*e-mail gift card modal load content*/
	$("#shopping-bag-edit-gift-card-step-two-modal").on('show.bs.modal', function(event){
		$("#shopping-bag-edit-gift-card-step-two-modal .modal-body").load(modelTwo , function(){
			$('.js-tabsPanel').tabsPanel();
			$('#shopping-bag-edit-gift-card-step-two-modal').find('#giftAmountPop').val(giftcardAmount);
			
			var toName = $('#gift-card-edit-form').find('#toName').val();
			var fromName = $('#gift-card-edit-form').find('#fromName').val();
			var recipientEmail = $('#gift-card-edit-form').find('#recipientEmail').val();
			var message = $('#gift-card-edit-form').find('#message').val();
			
			$('#shopping-bag-edit-gift-card-step-two-modal').find('#giftCardTo').val(toName);
			$('#shopping-bag-edit-gift-card-step-two-modal').find('#giftCardFrom').val(fromName);
			$('#shopping-bag-edit-gift-card-step-two-modal').find('#recipientsEmail').val(recipientEmail);
			$('#shopping-bag-edit-gift-card-step-two-modal').find('#message').val(message);
			$('#shopping-bag-edit-gift-card-step-two-modal').find('#retypeEmail').val(recipientEmail);
			$('#shopping-bag-edit-gift-card-step-two-modal').find('#giftcardOtherAmount').val(giftcardAmount);
			
			var $form = $(this).find('form');
			$form.parsley().reset();
		});
		
	});
	
	$(document).on('change', '#giftCardAmount', function(){
		var val = $(this).val();
		if(val == 'other'){
			$('#SelectInput').parsley().reset();
			$('#edit_GiftCardOther_val').collapse('show');
		}
		else{
			$('#edit_GiftCardOther_val').collapse('hide');
		}
		
	  });
	/* end of edit gift card */
	disableSelectPicker();
	
	function updateCheckoutOrderSummary(promoApplied){
		$("#shippingMethodsContainer").load(localeName+"/checkout/includes/shippingMethod.jsp", function(){
			$.post(localeName+'/checkout/includes/updateShipMethod.jsp', {shipMethod : $(".shipping-method:checked").val()}, function(data) {	
				$.ajax({           
					url: localeName+'/checkout/includes/updateCheckoutRightContent.jsp?promoApplied='+promoApplied+'&isShipping=true',
					type:'POST',
					dataType: "json",
					success: function(data) {
						if(data.promotionSection != ""){
							$('#applyPromotion').html(data.promotionSection);
						}
						var $deskCurrentstep = $('.panel-group .panel.current').index();
						if(data.orderSummarySection != "" && $deskCurrentstep == 0){
							$('#totalOrderSummary').html(data.orderSummarySection);
						}
						if(data.miniCartSection != ""){
							$('#miniCartSection').html(data.miniCartSection);
							$('#miniCartSectionMobile').html(data.miniCartSection);
						}	
						
						
						if($deskCurrentstep == 1){
							$("#billingContainer").attr("data-submitvalidate", "false");
							$("#billingContainer").load(localeName+"/checkout/includes/containerBilling.jsp", function(){
								$("#payment-step").removeClass("hidden");
								wizardInit(1);
								billingInit(true);
								initializeBillingZipcode();
							    initializeBillingAddress1(); 
							    $("#billingContainer").find('.selectpicker').selectpicker('refresh');
							});
						}
					},
					complete: function(){
						newCheckoutMkobj.promoToggle();
					}
				});
			});
		});
	}
	
	function updateCheckoutOrderSummaryForMobile(promoApplied){
		
		$("#shippingMethodsContainer").load(localeName+"/checkout/includes/shippingMethod.jsp", function(){
			$.post(localeName+'/checkout/includes/updateShipMethod.jsp', {shipMethod : $(".shipping-method:checked").val()}, function(data) {	
				$.ajax({           
					url: localeName+'/checkout/includes/updatePromotionContentForMobile.jsp?promoApplied='+promoApplied,
					type:'POST',
					dataType: "json",
					success: function(data) {
						if(data.promotionSectionForMobileShipping != ""){
							$('.promotionSectionForMobileShipping').html(data.promotionSectionForMobileShipping);
						}
						
						if(data.promotionSectionForMobileBilling != ""){
							$('.promotionSectionForMobileBilling').html(data.promotionSectionForMobileBilling);
						}
						
						var $mobCurrentstep = $('.panel-group .panel.slick-current').index();
						
						if(data.orderSummarySectionForMobile != "" && $mobCurrentstep == 0){
							$('#totalOrderSummary').html(data.orderSummarySectionForMobile);
						}
					},
					complete : function(){
						
						var $mobCurrentstep = $('.panel-group .panel.slick-current').index();
						
						if($mobCurrentstep == 1){
							$("#billingContainer").attr("data-submitvalidate", "false");
							$("#billingContainer").load(localeName+"/checkout/includes/containerBilling.jsp", function(){
								$("#payment-step").removeClass("hidden");
								wizardInit(1);
								billingInit(true);
								initializeBillingZipcode();
							    initializeBillingAddress1(); 
							    setTimeout(function(){
								    if($("#payment-step #promocodediscounttable").length > 0){
								    	$(".promotionSectionForMobileBilling .js-boxToggle").trigger('click');
								    }
							    }, 1000);
							});
						}else if($mobCurrentstep == 0){
							setTimeout(function(){
							var panelGroup = $('.panel-group');
						      if(panelGroup.hasClass('slick-initialized')){
						    	  panelGroup[0].slick.setOption("speed",0);
						        panelGroup[0].slick.setPosition();
						      }
							},10);
							newCheckoutMkobj.promoToggle();
						}
						/*setTimeout(function(){
					      var panelGroup = $('.panel-group');
					      if(panelGroup.hasClass('slick-initialized')){
					        panelGroup[0].slick.setPosition();
					      }
						});*/
					}
				
				});
			});
		});
		
	}
	
	$(document).on("focus click dbclick", "#shopping-bag-promo", function(){
		setTimeout(function(){
		var panelGroup = $('.panel-group');
	      if(panelGroup.hasClass('slick-initialized')){
	    	  panelGroup[0].slick.setOption("speed",0);
	        panelGroup[0].slick.setPosition();
	      }
		},10);
	});
	/*<dattaprasad> for sign-in-form in shopping cart page starts*/
	$(document).on("submit", '#sign-in-form', function(e) {
		e.preventDefault();
		var localeName = $("#nonPrimaryLocale").val();
		if (localeName == null) {
			localeName = "";
		}		
		form = $(this);
		formId = $(this).attr("id");		
		form.find('label.error').addClass('hiddenErrorMsg'); /*<dattaprasad> GWSIT-550 fixed on 03-11-2015*/
		fieldsArray = form.serializeArray();
		fieldsArray.push({
			name : "formName",
			value : formId
		});
		successUrl = $(this).find('#successUrl').val();
		errorUrl = $(this).find('#errorUrl').val();
		jQuery.ajax({
			url : localeName + '/checkout/common/ajaxFormSubmit.jsp',
			type : "post",
			data : fieldsArray,
			dataType : "json",
			cache : false,
			success : function(data) {
				renderAjaxSuccessCallBack(data, formId, successUrl);
			},
			error: function(xhr, ajaxOptions, thrownError) {
				newCheckoutMkobj.errorHandle(xhr, ajaxOptions, thrownError);
			}
		});
	});
	/*<dattaprasad> for sign-in-form in shopping cart page ends*/
	

	$(document).on('click', '#shopping-bag-promo', function(){
		hideMessage();
		var errorMessage = $('#errorMessage').text();
		var errorMessageMobile = $('.errorMessageMobile').text();
		$('#wizardPanels .slick-list').css("height","auto");/* Baskar GWSIT-486 fixed*/
		if(errorMessage.length > 0 || errorMessageMobile.length > 0){
			$('#errorMessage').css("display","none");
			$('.errorMessageMobile').css("display","none");
		}
	});
	
	$(document).on('hide.bs.collapse' , '#cartPromotion , #checkoutPromotion , #billingPromotion , #shippingPromotion', function(){
		$(this).find('.promo-code-form').parsley().reset();
		$(this).find('#shopping-bag-promo').val('');
		$('#errorMessage').hide();
		$('.errorMessageMobile').hide();
	});
	
	/* gift card confirm email validation */
	$(document).on('change', '#recipientsEmail', function(){
		$('#retypeEmail').trigger('change');
	});
	
	function giftWrapNoteUpdate(){
		$('#gift_wrap_note').load(localeName+"/checkout/includes/giftWrapSelection.jsp", function(){
			setTimeout(function(){
		      var panelGroup = $('.panel-group');
		      if(panelGroup.hasClass('slick-initialized')){
		        panelGroup[0].slick.setPosition();
		      }
			});
		});
		$('#totalOrderSummary').load(localeName+"/checkout/includes/checkoutOrderTotalSummary.jsp");
		$('#miniCartSection').load(localeName+"/checkout/includes/checkOutCartLineItems.jsp");
		$('#miniCartSectionMobile').load(localeName+"/checkout/includes/checkOutCartLineItems.jsp", function(){
			newCheckoutMkobj.promoToggle();
		});
		
	}
	
	/*sign in model reset <waseem> GWSIT 270 date 4-11-15*/
	$("#checkout-sign-in-modal").on("hidden.bs.modal", function(){
		$('#checkout-sign-in-modal').find('label.error').addClass('hiddenErrorMsg');
		$('#sign-in-submit').removeClass('btn-primary');
		$('#sign-in-submit').addClass('btn-disabled');
	});
});

	function updateBagPopupChangeQty(productId , qty) { 
		var qtyId = "#qty_sel_"+productId
		$(qtyId).val(qty);
	}
	

var autocompleteZip={};
var autocompleteAdd={};
var autocompleteBillingZip={};
var autocompleteBillingAdd={};
var componentForm = {
	administrative_area_level_1 : 'short_name',
	locality : 'long_name',
	postal_code : 'short_name',
	street_number : 'long_name', 
	route : 'long_name',
	sublocality_level_1 : 'long_name',
	country: 'short_name'
};

var formFields = {
	administrative_area_level_1 : 'state',
	locality : 'locality',
	postal_code : 'zip-code',
	street_number : 'addr-1',
	route : 'addr-1',
	sublocality_level_1 : 'addr-2',
	country: "country-select"
};

var countryCode = $("#defaultCntry").val();

function initializeZipcode() {
	// Create the autocomplete object, restricting the search
	// to geographical location types.
	autocompleteZip = new google.maps.places.Autocomplete((document.getElementById('shipping-form').elements.namedItem("zip-code")),{types: ['geocode'],componentRestrictions: {country: countryCode}});
	// When the user selects an address from the dropdown,
	// populate the address fields in the form.
	google.maps.event.addListener(autocompleteZip, 'place_changed', function() {
		fillInAddress(autocompleteZip, "shipping-form");
		$('#shipping-form').find("#addr-1, #zip-code, #locality").trigger('change');
		$('#shipping-form').find("#state").trigger("focusout");
	});
}
function initializeAddress1() {
	// Create the autocomplete object, restricting the search
	// to geographical location types.
	autocompleteAdd = new google.maps.places.Autocomplete((document.getElementById('shipping-form').elements.namedItem("addr-1")),{types: ['address'],componentRestrictions: {country: countryCode}});
	// When the user selects an address from the dropdown,
	// populate the address fields in the form.
	google.maps.event.addListener(autocompleteAdd, 'place_changed', function() {
		fillInAddress(autocompleteAdd, "shipping-form");
		$('#shipping-form').find("#addr-1, #zip-code, #locality").trigger('change');
		$('#shipping-form').find("#state").trigger("focusout");
	});
}

function initializeBillingZipcode() {
	// Create the autocomplete object, restricting the search
	// to geographical location types.
	autocompleteBillingZip = new google.maps.places.Autocomplete((document.getElementById('payment-form').elements.namedItem("zip-code")),{types: ['geocode']});
	// When the user selects an address from the dropdown,
	// populate the address fields in the form.
	google.maps.event.addListener(autocompleteBillingZip, 'place_changed', function() {
		fillInAddress(autocompleteBillingZip, "payment-form");
		$('#payment-form').find("#addr-1, #zip-code, #locality, #country-select").trigger('change');
	});
}
function initializeBillingAddress1() {
	// Create the autocomplete object, restricting the search
	// to geographical location types.
	autocompleteBillingAdd = new google.maps.places.Autocomplete((document.getElementById('payment-form').elements.namedItem("addr-1")),{types: ['address']});
	// When the user selects an address from the dropdown,
	// populate the address fields in the form.
	google.maps.event.addListener(autocompleteBillingAdd, 'place_changed', function() {
		fillInAddress(autocompleteBillingAdd, "payment-form");
		$('#payment-form').find("#addr-1, #zip-code, #locality, #country-select").trigger('change');
	});
}



function fillInAddress(autocompleteValue, formName) {
	var clocality = false;
	// Get the place details from the autocomplete object.
	var place = autocompleteValue.getPlace();
	for ( var i = 0; i < place.address_components.length; i++) {
		var addressType = place.address_components[i].types[0];
		if(addressType == "locality"){
			clocality = true;
		}
	}
	for (var component in formFields) {
		document.getElementById(formName).elements.namedItem(formFields[component]).value = '';
	}
	// Get each component of the address from the place details
	// and fill the corresponding field on the form.
	for ( var i = 0; i < place.address_components.length; i++) {
		var addressType = place.address_components[i].types[0];
		if (componentForm[addressType]) {
			var val = document.getElementById(formName).elements.namedItem(formFields[addressType]).value;
			if(val == undefined || val==""){
				val = place.address_components[i][componentForm[addressType]];
			}else{
				val = val + " " + place.address_components[i][componentForm[addressType]];
			}
			if(formFields[addressType] == 'state'){
				if(formName == "payment-form"){
					billingstate = val;
				}
				
				if(formName == "payment-form"){
					var states = document.getElementById(formName).elements.namedItem(formFields[addressType]);
					for(var j = 0; j < states.length; j++){
						if(!states[j].disabled){
							states[j].value = val;
							fireCustomEvent(states[j], "select-change");
							break;
						}
					}
				}else{
					document.getElementById(formName).elements.namedItem(formFields[addressType]).value = val;
					fireCustomEvent(document.getElementById(formName).elements.namedItem(formFields[addressType]), "select-change");
				}
			}else{
				document.getElementById(formName).elements.namedItem(formFields[addressType]).value = val;
			}
			if(!clocality && formFields[addressType] == 'addr-2'){
				document.getElementById(formName).elements.namedItem(formFields[addressType]).value = '';
				document.getElementById(formName).elements.namedItem(formFields['locality']).value = val;
			}
			if(formFields[addressType] == 'country-select'){
				fireCustomEvent(document.getElementById(formName).elements.namedItem(formFields[addressType]), "select-change");				
			}
		}
	}
}

function fireCustomEvent(element, eventName){
	var event; 
	if (document.createEvent) {
	  event = document.createEvent("HTMLEvents");
	  event.initEvent(eventName, true, true);
	} else {
	  event = document.createEventObject();
	  event.eventType = eventName;
	}
	event.eventName = eventName;
	if (document.createEvent) {
	  element.dispatchEvent(event);
	} else {
		element.fireEvent("on" + event.eventType, event);
	}

}

function geolocate() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			var geolocation = new google.maps.LatLng(position.coords.latitude,
					position.coords.longitude);
			var circle = new google.maps.Circle({
				center : geolocation,
				radius : position.coords.accuracy
			});
			autocompleteZip.setBounds(circle.getBounds());
			
		});
	}
}
function geolocateAdd() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			var geolocation = new google.maps.LatLng(position.coords.latitude,
					position.coords.longitude);
			var circle = new google.maps.Circle({
				center : geolocation,
				radius : position.coords.accuracy
			});
			autocompleteAdd.setBounds(circle.getBounds());
		});
	}
}

//$("#shopping-bag-edit-gift-card-step-one-modal").on('show.bs.modal', function(event){
//    $("#shopping-bag-edit-gift-card-step-one-modal .modal-body").load($(event.relatedTarget).attr("data-url"));
//    
//}); //Commented as part of defect fix GWSIT-215 - Manjula - Editgiftcard modal is getting called twice

function geolocateBillZip() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			var geolocation = new google.maps.LatLng(position.coords.latitude,
					position.coords.longitude);
			var circle = new google.maps.Circle({
				center : geolocation,
				radius : position.coords.accuracy
			});
			autocompleteBillingZip.setBounds(circle.getBounds());
			
		});
	}
}
function geolocateBillAdd() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			var geolocation = new google.maps.LatLng(position.coords.latitude,
					position.coords.longitude);
			var circle = new google.maps.Circle({
				center : geolocation,
				radius : position.coords.accuracy
			});
			autocompleteBillingAdd.setBounds(circle.getBounds());
		});
	}
}

//Starts - Added for monogramming - MKFP-175
function updateSessionVariables(cid, hrefValue){
	var successUrl = hrefValue;
	$.ajax({ 
		url: localeName+'/checkout/includes/setSessionVariable.jsp?cid='+cid, 
		contentType: 'text/plain',
		type:'GET',
		dataType: 'html',
		success: function(data) { 
			window.location=localeName+successUrl;
		},
		error: function(xhr, ajaxOptions, thrownError) {
			newCheckoutMkobj.errorHandle(xhr, ajaxOptions, thrownError);
		}
		});
}

function initializeEditAddMonoLink(){
	$('.edit_monogram').on('click',function(e){
		e.preventDefault();
		var hrefValue = $(this).attr('href');
		var cid = $(this).closest('.monoItem').find('#commItemId').val();
		 updateSessionVariables(cid,hrefValue);
	});
	
	$('.addAmonogramCart').on('click',function(e){
		e.preventDefault();
		var hrefValue = $(this).attr('href');
		var cid = $(this).closest('.nonMonoItem').find('#commItemId').val();
		 updateSessionVariables(cid, hrefValue);
	});
}
//ends - Added for monogramming - MKFP-175
function disableSelectPicker(){
	$('.selectpicker.disabledSelectBox').each(function(){
		$(this).attr("disabled","disabled");
	});
}

function chekcoutSingIn(){
	mkorsData.page.name="Checkout:Login";
	mkorsData.page.channel="checkout";
	mkorsData.page.type="Checkout:Login";
	mkorsData.page.siteSectionLevel2="Checkout:Login";
	mkorsData.page.siteSectionLevel3="Checkout:Login";
	_satellite.track("Checkout login");
}
function updatedtmSessionVariables(rrPagename){
	$.ajax({ 
		url: localeName+'/checkout/includes/dtmSessionVariable.jsp?rrPagename='+rrPagename, 
		contentType: 'text/plain',
		type:'GET',
		dataType: 'json',
		success: function(data) { 
			 return true;
		},error: function(err){
			return false;
		}
		});
}

/*<Dattaprasad> starts here*/
$(function(){
	$("#createAccountForm").submit(function(e){
		e.preventDefault();
		$('.accountErrorMessage').addClass('hidden');
		if($('#createAccountForm').parsley().validate()){
			var localeName = $("#nonPrimaryLocale").val();
			if (localeName == null) {
				localeName = "";
			}
			var currentObj = $(this);
			var formId = currentObj.attr("id");
			var fieldsArray = currentObj.serializeArray();
			fieldsArray.push({
				name : "formName",
				value : formId
			});
			$.ajax({
				url : localeName + '/checkout/common/ajaxFormSubmit.jsp',
				type : "post",
				data : fieldsArray,
				dataType : "json",
				cache : false,
				success : function(data) {					
					if(data.result == "success"){
						localStorage.setItem("accountCreate",'true');						
						if(dtmEnabledFlag == "true"){
							try {
								registrationConfirmPage();
							}catch(err)  {								
							}
						}	
						location.reload();
					}else if(data.result == "error"){	
						var currentSiteId = $('#mkSiteId').val();
						for(i=0;i<data.errors.length;i++) {
		                     var message = data.errors[i].message;
		                     if(message.indexOf(currentSiteId) != -1){
		                    	 message = message.replace(currentSiteId,"");
		                    	 $('.accountErrorMessage .ajaxErrorMessage').html(message);
		                     } else {
		                    	 $('.accountErrorMessage .ajaxErrorMessage').html(message);
		                     }
		                     
		            	 }						
		         		$('.accountErrorMessage').removeClass('hidden');
		         		$('.alert-message--error').removeClass('hidden');
		         		$('.ajaxErrorMessage').show();	
					}
				},
				error: function(xhr, ajaxOptions, thrownError) {
					newCheckoutMkobj.errorHandle(xhr, ajaxOptions, thrownError);
				}
			});
		}
	})
	billingstate = "";
	$(document).on('change', '#country-select', function(){
		var countryVal = $(this).val();
		$.ajax({
			url : localeName + '/checkout/includes/billingAddressStates.jsp?selectedCountry='+countryVal+'&selectedState='+billingstate,
			type : "post",			
			dataType : "html",
			cache : false,
			beforeSend : function() {
				$("#custState").val("");
			},
			success : function(data) {	
				$("#payment-form").find("#statedropdown").show();
				$("#payment-form").find("#custStateText").hide();
				$("#payment-form").find('#statedropdown select[name="state"]').prop("disabled",false);
				$("#payment-form").find('#custStateText input[name="state"]').prop("disabled",true);
				if(typeof data != undefined && data != "" && data != null){
					$("#payment-form").find("#state").html(data);	
				}else{
					$('#custState').parsley().reset();
					$("#payment-form").find("#statedropdown").hide();
					$("#payment-form").find("#custStateText").show();
					$("#payment-form").find('#statedropdown select[name="state"]').prop("disabled",true);
					$("#payment-form").find('#custStateText input[name="state"]').prop("disabled",false);
				}
			},
			error: function(xhr, ajaxOptions, thrownError) {
				newCheckoutMkobj.errorHandle(xhr, ajaxOptions, thrownError);
			},
			complete: function(){
				/*added to refresh state error*/
				$('#payment-form').find("#state").trigger("focusout");
				$("#payment-form").find("#state").selectpicker('refresh');
				billingstate = "";
			}
		});
	});
});
/*<Dattaprasad> ends here*/

function setCurrentURLInCookie(obj) {
	var $this=$(obj);
	var name = $this.attr('name');	
	var expires = "expires=-1"
	 var rlCurrentURL;
	if(name != undefined) {
		rlCurrentURL = name;
	} else {
		rlCurrentURL = $('#rlCurrentURL').val();
	}
	if(rlCurrentURL != undefined) {
		var path = "path=/";
		//console.log("Setting cookie for the current URL"+rlCurrentURL);			    
		document.cookie = "rlCurrentURL" + "=" + rlCurrentURL + "; path=/;";
	}
}
function trackRRLinkURL(productId){	
	var rrLinkURL = $('#rrLinkURL_'+productId).val();
	if(rrLinkURL != undefined && rrLinkURL != '' && rrLinkURL != null){
		$('#rrQvTrack').attr('src', rrLinkURL);
	}
}

function hideMessage() {
	$('.popUpErrorMessage .alert-message--error').addClass('hidden');
	$('.errorMessage .alert-message--error').addClass('hidden');
	$('.alert-message--error').addClass("hidden");
	$('.successMessage').hide();
	$('.popSuccessMessage').hide();
	$('.serverErrors').hide();
	$('.noLongerErrorMsg').hide();
	$('.ajaxErrorMessage').hide();
	$('.successMessage').hide();	 
	$('.AnonyFavorites').hide();
}

$(function(){
	/*Fix for GWSIT-405 starts*/
	$(document).on('click',".address-add-collection-link",function(){		
		$('#saved-address-dropdown option[value="new"]').prop('selected', true);
		$("#saved-address-dropdown").selectpicker('refresh');
	});	
	/*Fix for GWSIT-405 ends*/
	/*Fix for GWSIT-428 starts*/
	$(document).on('click',".credit-add-collection-link",function(){		
		$('#saved-cards-dropdown option[value="new"]').prop('selected', true);
		$("#saved-cards-dropdown").selectpicker('refresh');
	});
	/*Fix for GWSIT-428 ends*/

	/*<dattaprasad> GWSIT-626 Fixed on 23-11-2015*/
	$('#gift-wrap-modal').on('hidden.bs.modal', function () {
		$.ajax({
			url : localeName + '/checkout/includes/giftWrapSelection.jsp',
			type : "post",			
			dataType : "html",
			cache : false,			
			success : function(data) {	
				$("#gift_wrap_note").html(data)
			},
			error: function(xhr, ajaxOptions, thrownError) {
				newCheckoutMkobj.errorHandle(xhr, ajaxOptions, thrownError);
			}
		});
	});
	/*<dattaprasad> GWSIT-626 Fixed on 23-11-2015 ends*/
});
