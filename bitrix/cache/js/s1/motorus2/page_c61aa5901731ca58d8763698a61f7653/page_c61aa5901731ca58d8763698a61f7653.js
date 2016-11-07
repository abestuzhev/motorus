
; /* Start:/bitrix/templates/.default/components/bitrix/sale.order.ajax/order/script.js*/
(function($) {
/**
 * Debounce and throttle function's decorator plugin 1.0.5
 *
 * Copyright (c) 2009 Filatov Dmitry (alpha@zforms.ru)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 */
$.extend({
	debounce : function(fn, timeout, invokeAsap, ctx) {
		if(arguments.length == 3 && typeof invokeAsap != 'boolean') {
			ctx = invokeAsap;
			invokeAsap = false;
		}
		var timer;
		return function() {
			var args = arguments;
            ctx = ctx || this;
			invokeAsap && !timer && fn.apply(ctx, args);
			clearTimeout(timer);
			timer = setTimeout(function() {
				!invokeAsap && fn.apply(ctx, args);
				timer = null;
			}, timeout);
		};
	}
});
})(jQuery);

function SetKladr() {
	var token = '51dfe5d42fb2b43e3300006e';
	var key = '86a2c2a06f1b2451a87d05512cc2c3edfdf41969';

	var $zip = $('#ORDER_PROP_4').add($('#ORDER_PROP_16'));
	var $city = $('#ORDER_PROP_5_val').add($('#ORDER_PROP_5'));
	var $street = $('#ORDER_PROP_20').add($('#ORDER_PROP_24'));
	var $house = $('#ORDER_PROP_21').add($('#ORDER_PROP_25'));
	var $housing = $('#ORDER_PROP_22').add($('#ORDER_PROP_26'));
	var $room = $('#ORDER_PROP_23').add($('#ORDER_PROP_27'));
	var $address = $('#ORDER_PROP_7').add($('#ORDER_PROP_19'));
	var $streetFormat = $('#ORDER_PROP_29').add('#ORDER_PROP_30');
	$address.parents('.element-form').after('<div id="address" class="element-form"/>');
	var $addressFormat = $('#address');

	var location = $city.val(),
		locationSplit = location && location.split(", "),
		cityName = locationSplit && locationSplit.length && locationSplit[0],
		zip = $zip.val();

	// after reload update cityObj
	if (cityName.length > 0) {
		// if got zip-code - get region id
		if (zip.length > 0) {
			$.kladrapi({
				token: token,
				key: key,
				zip: zip,
				contentType: $.ui.kladrObjectType.BUILDING,
				withParent: 1,
				limit: 1
			}, function(resp) {
				// check city with region as parent
				if (resp && resp.result.length) {
					var regionId = resp.result[0].parents[0].id; // 1st parent is region
					$.kladrapi({
						token: token,
						key: key,
						contentType: $.ui.kladrObjectType.CITY,
						query: cityName,
						withParent: 1,
						limit: 1,
						regionId: regionId
					}, function(resp) {
						if (resp.result) {
							$city.data('kladr-obj', resp.result[0]);

							$street.kladr('option', {
								parentType: $.ui.kladrObjectType.CITY,
								parentId: resp.result[0].id
							});
							$house.kladr('option', {
								parentType: $.ui.kladrObjectType.CITY,
								parentId: resp.result[0].id
							});

							// check 4 streets
							$.kladrapi({
								token: token,
								key: key,
								contentType: $.ui.kladrObjectType.STREET,
								cityId: resp.result[0].id,
								limit: 5
							}, function(resp) {
								if (!resp.result.length) { // means NO STREETS
									// disable streets field
									$street.val('нет');
									if ($street.is(':visible')) {
										$street.closest('.element-form').hide();
									}

									// no house autocomplete
									$house.kladr('destroy');
								} else {
									// enable streets field
									if (!$street.is(':visible')) {
										$street.closest('.element-form').show();
									}

									if ($street.val() == 'нет') {
										$street.val('');
									}
								}
							});

							AddressUpdate();
						}
					});
				}
			});
		} else {
			$.kladrCheck({
				token: token,
				key: key,
				type: $.ui.kladrObjectType.CITY,
				value: cityName
			},function(result){
				if (result) {
					$city.data( "kladr-obj", result );
					$street.kladr( 'option', {
						parentType: $.ui.kladrObjectType.CITY,
						parentId: result.id
					});
					if ($house.data('kladr')) {
						$house.kladr('option', {
							parentType: $.ui.kladrObjectType.CITY,
							parentId: result.id
						});
					}
					AddressUpdate();
				}
			});
		}
	}

	// city autocomplete
	$city.kladr({
		token: token,
		key: key,
		limit: 30,
		type: $.ui.kladrObjectType.CITY,
		withParents: true,
		label: function( obj, query ){
			var label = obj.typeShort + '. ' + obj.name;

			if (obj.parents && obj.parents.length) {
				label += ' (' + obj.parents[0].name + ' ';
				if (obj.parents[0].type.toString().toLowerCase() == obj.parents[0].typeShort) {
					// kray == Kray.toLowerCase(), no dot
					label += obj.parents[0].typeShort + ')';
				} else {
					// obl != Oblast.toLowerCase(), use dot
					label += obj.parents[0].typeShort + '.)';
				}
			}

			return label;
		},
		select: function(event, ui) {
			$city.data('kladr-obj', ui.item.obj);

			if (!ui.item.obj.zip) {
				$zip.val('');
			}

			$street.kladr('option', {
				parentType: $.ui.kladrObjectType.CITY,
				parentId: ui.item.obj.id
			});
			AddressUpdate();
		}
	});

	// street autocomplete [needs correct city]
	$street.kladr({
        token: token,
        key: key,
        limit: 20,
        type: $.ui.kladrObjectType.STREET,
        select: function(event, ui) {
        	$street.data( "kladr-obj", ui.item.obj );
    		$house.kladr('option', {
    			parentType: $.ui.kladrObjectType.STREET,
    			parentId: ui.item.obj.id
			});
			// clear houseNo, housingNo, roomNo
			$house.data('kladr-obj', null).val('');
			$housing.val('');
			$room.val('');

			AddressUpdate();
    	}
    });

	// houseNo autocomplete [needs correct street]
	if ($street.is(':visible')) {
	    $house.kladr({
	        token: token,
	        key: key,
	        limit: 20,
	        type: $.ui.kladrObjectType.BUILDING,
	        select: function(event, ui) {
	        	$house.data( "kladr-obj", ui.item.obj );
	        	AddressUpdate();
			},
			change: function(event, ui) {
				var rexp = /^([\d\/]*)(.*)$/;
				if (ui.item.value.indexOf('к') !== -1) { // present
					var q = ui.item.value.split('к');

					$house.val(q[0]);
					$housing.val(q[1]).trigger('change');
				} else if (rexp.test(ui.item.value)) {
					var q = ui.item.value.match(rexp);

					$house.val(q[1]);
					$housing.val(q[2]).trigger('change');
				}
			}
	    });
	}

    // корпус
    $housing.change(function(){
	    AddressUpdate();
	});

    // квартира
	$room.change(function(){
	    AddressUpdate();
	});

	$zip.on('keypress change', $.debounce(function() {
		// `this` refers to input[name=zip].value
		// check index - if valid then fill city
		var $self = $(this),
			query = {
				token: token,
				key: key,
				zip: this.value,
				contentType: $.ui.kladrObjectType.BUILDING,
				withParent: 1,
				limit: 10
			};

		$.kladrapi(query, function(resp) {
			if (!resp.result.length) {
				// empty response
				$self.css('color', 'red');
			} else {
				$self.css('color', '');
				// fill city
				for(var i = 0, parents = resp.result[0].parents, len = parents.length; i < len; i++) {
					if (parents[i].contentType == $.ui.kladrObjectType.CITY) {
						$city
							.val(parents[i].name)
							.data('kladr-obj', parents[i])
							.trigger('change', {sender: 'zip'});
						break;
					}
				}
			}
		});
	}, 300));

	// $zip.change(function(){
	// 	console.log(this.value);
	//     AddressUpdate();
	// });

	// проверка на верное заполнение города
	$city.change(function(evt, data){
		if (data.sender && data.sender == 'zip') {
			// get regionId by zip
			$.kladrapi({
				token: token,
				key: key,
				zip: $zip.val(),
				contentType: $.ui.kladrObjectType.BUILDING,
				withParent: 1,
				limit: 1
			}, function(resp) {
				// check city with region as parent
				if (resp && resp.result.length) {
					var regionId = resp.result[0].parents[0].id; // 1st parent is region
					$.kladrapi({
						token: token,
						key: key,
						contentType: $.ui.kladrObjectType.CITY,
						query: $city.val(),
						withParent: 1,
						limit: 1,
						regionId: regionId
					}, function(resp) {
						if (resp.result) {
							$city.data('kladr-obj', resp.result[0]);
							$street.kladr('option', {
								parentType: $.ui.kladrObjectType.CITY,
								parentId: resp.result[0].id
							});
							if ($house.data('kladr')) {
								$house.kladr('option', {
									parentType: $.ui.kladrObjectType.CITY,
									parentId: resp.result[0].id
								});
							}

							AddressUpdate();
						}
					});
				}
			});
		} else {
			var query = {
				token: token,
				key: key,
				value: $city.val(),
				type: $.ui.kladrObjectType.CITY
			};

			$.kladrCheck(query, function(obj) {
				if (obj) {
					$city.val(obj.name);
					$city.data('kladr-obj', obj);
					$street.kladr('option', {parentType: $.ui.kladrObjectType.CITY, parentId: obj.id});
				} else {
					$city.data('kladr-obj', null);
					$city.css('color', 'red');
				}

				AddressUpdate();
			});
		}
	});

	// проверка на верное заполнение улицы
	$street.change(function(){
		var query = {
            token: token,
            key: key,
            value: $street.val(),
            type: $.ui.kladrObjectType.STREET
        };

        var cityObj = $city.data( "kladr-obj" );
        if(cityObj){
            query['parentType'] = $.ui.kladrObjectType.CITY;
            query['parentId'] = cityObj.id;
        }

        $.kladrCheck(query, function(obj){
            if(obj) {
                $street.val(obj.name);
                $street.data( "kladr-obj", obj );
                $house.kladr( 'option', { parentType: $.ui.kladrObjectType.STREET, parentId:  obj.id } );
            } else {
                $street.data( "kladr-obj", null );
                $street.css('color', 'red');
            }

            AddressUpdate();
        });
	});

	// проверка на верное заполнение дома
	$house.change(function(){
        var query = {
            token: token,
            key: key,
            value: $house.val(),
            type: $.ui.kladrObjectType.BUILDING,
        };

        var cityObj = $city.data( "kladr-obj" );
        if(cityObj){
            query['parentType'] = $.ui.kladrObjectType.CITY;
            query['parentId'] = cityObj.id;
        }

        var streetObj = $street.data( "kladr-obj" );

        if(streetObj && streetObj.id) {
            query['parentType'] = $.ui.kladrObjectType.STREET;
            query['parentId'] = streetObj.id;

	        $.kladrCheck(query, function(obj){
	            if(obj && (obj.name == $house.val())){
	                $house.val(obj.name);
	                $house.data( "kladr-obj", obj );
	            }

	            AddressUpdate();
	        });

        } else {
        	AddressUpdate();
        }

    });

	var $fields = $city.add($city).add($street);
	$fields.keydown(function(){
        $(this).css('color', 'black');
	});

	//$zip.parents('.element-form').hide();
	$address.parents('.element-form').hide();
	$streetFormat.parents('.element-form').hide();
	if($streetFormat.val().length == false)
		$streetFormat.val($street.val());

	$room.numberMask({
		beforePoint: 6
	});

	var AddressUpdate = function() {
        var address = '',
        	zip = $zip.val(),
        	cityObj = $city.data( "kladr-obj" ),
        	persType = $('input[name=PERSON_TYPE_OLD]').val(),
        	locationFieldCode = (persType == 1 ? '#ORDER_PROP_5' : '#ORDER_PROP_18'),
        	$locationField = $(locationFieldCode);

        if (cityObj) {
            if(address) address += ', ';
            address += cityObj.typeShort + '. ' + cityObj.name;

            if (cityObj.zip) {
            	zip = cityObj.zip;
            }

        	// update 'location' field
			$.post('/bitrix/tools/locationsearch.php', {
					search: cityObj.name,
					zip: zip
				}, function(data) {
					var location = $locationField.val();

					if (data.status == 'FOUND') {
						// valid city && location != city.ID
						if (data.result[0].ID && location != data.result[0].ID) {
							
							$locationField.val(data.result[0].ID);
							$zip.val(data.result[0].ZIP[0]); // first element
							
							//console.log(data.result[0].NAME);
							$('input#ORDER_PROP_5_val').val(data.result[0].NAME);
							$('input#ORDER_PROP_5').val(data.result[0].ID);
							// update form
							submitForm(); // see template.php
						}
					} else {
						// save selected location {$city.data('kladr-obj')}
						var sessid = $('[name=sessid]').val();

						$.post('/bitrix/tools/locationadd.php', {
								sessid: sessid,
								result: cityObj
							}, function(data) {
								if (data.status == 'OK') {
									$locationField.val(data.location_id);
									$zip.val(zip);
									// update form
									submitForm();
								}
							}, 'json');
					}

/*
				if (!resp.length) {
					// get city info, then add new location
					$.kladrapi({
						token: token,
						key: key,
						contentType: $.ui.kladrObjectType.CITY,
						withParent: 1,
						query: cityObj.name,
						limit: 1
					}, function(resp) {
						debugger;
						if (resp.result.length) {
							var sessid = $('[name=sessid]').val();

							$.post('/bitrix/tools/locationadd.php', {
									sessid: sessid,
									result: resp.result[0]
								}, function(resp) {
									console.log(resp);
								}, 'json');
						}
					});

				} else {
					// valid city && location != city.ID
					if (resp[0].ID && location != resp[0].ID) {
						$('#ORDER_PROP_5').val(resp[0].ID);
						// update form
						submitForm(); // see template.php
					}
				}
*/
			}, 'json');
		}

        var streetObj = $street.data("kladr-obj");
        if(streetObj){
            if(address) address += ', ';
            address += streetObj.typeShort + '. ' + streetObj.name;

            if(streetObj.zip) zip = streetObj.zip;
        } else {
        	var streetValue = $.trim($street.val());
        	if(streetValue.length && streetValue != 'нет')
        		address += ', ' + streetValue;
        }

        if(streetObj){
            $streetFormat.val(streetObj.typeShort + '. ' + streetObj.name);
        } else {
        	$streetFormat.val($street.val());
        }


        var houseVal = $.trim($house.val());
        if(houseVal){
            var houseObj = $house.data( "kladr-obj" );

            if(address) address += ', ';
            address += 'д. ' + houseVal;

            if(houseObj && houseObj.zip) zip = houseObj.zip;
        }

        var housingVal = $.trim($housing.val());
        if(housingVal){
			if(address) address += ', ';
			if (/^\d/.test(housingVal)) {
				address += 'к. ' + housingVal;
			} else {
				address += housingVal;
			}
        }

        var roomVal = $.trim($room.val());
        if(roomVal){
            if(address) address += ', ';
            address += 'кв. ' + roomVal;
        }

        if (cityObj.zip && cityObj.parents.length) {
        	address = cityObj.parents[0].name + ' ' + cityObj.parents[0].typeShort + '., ' + address;
        }

        if (zip) {
        	$zip.val(zip);
        	address = zip +', '+ address;
        }
        $address.text(address);
        $addressFormat.html('Проверьте адрес:<br><big>' + address + '</big>');
    }
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

function EditName(){
	var name1 = $.trim($('#TMP_NAME').val());
	var name2 = $.trim($('#TMP_LAST_NAME').val()).capitalize();
	var name3 = $.trim($('#TMP_MIDDLE_NAME').val()).capitalize();
	var value = '';

	if(name1 != '' && name2 != '' && name3 != '')
		var value = name2+' '+ name1+' '+ name3;

	$('#ORDER_PROP_1').val(value);

	$('#HNAME').val($.trim(name2+' '+ name1+' '+ name3));
}

function ReplaceName(e, code, h){
	if ( ! e || ! code) {
		console.log('Error. Item not found.');
		return false;
	}

	var value = h.val();
	var arValue = value.split(" ");
	var list = e.parents('.element-form');

	if (arValue == null) arValue = [];
	for (var i = 0; i < 3; i++) {
		if ( ! arValue[i] && arValue) arValue[i] = '';
		code = code.replace('{ELEMENT_VALUE_'+i+'}', arValue[i]);
	}

	list.after(code);
	list.css({
		'display': 'none',
		'height': '0',
		'overflow': 'hidden'
	});
}

function SetName(){
	var $inputName = $('#ORDER_PROP_1');
	var code =  '<input type="text" maxlength="250" class="text" size="40" onchange="EditName()" value="{ELEMENT_VALUE_1}" name="TMP_NAME" id="TMP_NAME" placeholder="Ваше имя*">'+
			    '<input type="text" maxlength="250" class="text" size="40" onchange="EditName()" value="{ELEMENT_VALUE_0}" name="TMP_LAST_NAME" id="TMP_LAST_NAME" placeholder="Фамилия*">'+
			    '<input type="text" maxlength="250" class="text" size="40" onchange="EditName()" value="{ELEMENT_VALUE_2}" name="TMP_MIDDLE_NAME" id="TMP_MIDDLE_NAME" placeholder="Отчество*">';

	if ($inputName.length > 0)
		ReplaceName($inputName, code, $('#HNAME'));
}

function SetPhone(){
	var $inputPhone = $('#ORDER_PROP_3').add($('#ORDER_PROP_14'));
	$inputPhone.mask('+7 (999) 999-99-99');
}

function SetRS(){
	var $inputRS = $('#ID_PAY_SYSTEM_ID_10 + label');
	if(window.location.hash == '#rs')
		$inputRS.click();
}

function SetForm(){
	$('form.classic .text').each(function(){
		$(this).wrap('<div class="input-text"></div>');
	});

	$('form.classic textarea').each(function(){
		$(this).wrap('<div class="textarea"></div>');
	});
}

$(document).ready(function(){
	SetName();
	SetPhone();
	SetRS();

	SetKladr();
});

if (window.jsAjaxUtil){
	jsAjaxUtil._CloseLocalWaitWindow = jsAjaxUtil.CloseLocalWaitWindow;
	jsAjaxUtil.CloseLocalWaitWindow = function (TID, cont){
		jsAjaxUtil._CloseLocalWaitWindow(TID, cont);

		SetName();
		SetForm();
		SetPhone();
		SetRS();

		SetKladr();
	}
}

/* End */
;
; /* Start:/bitrix/templates/motorus2/components/bitrix/sale.ajax.locations/.default/proceed.js*/
function getLocation(country_id, region_id, city_id, arParams, site_id)
{
	BX.showWait();
	
	property_id = arParams.CITY_INPUT_NAME;
	
	function getLocationResult(res)
	{
		BX.closeWait();
		
		var obContainer = document.getElementById('LOCATION_' + property_id);
		if (obContainer)
		{
			obContainer.innerHTML = res;
		}
	}

	arParams.COUNTRY = parseInt(country_id);
	arParams.REGION = parseInt(region_id);
	arParams.SITE_ID = site_id;

	var url = '/bitrix/components/bitrix/sale.ajax.locations/templates/.default/ajax.php';
	BX.ajax.post(url, arParams, getLocationResult)
}

function getLocationByZip(zip, propertyId)
{
	BX.showWait();
	
	property_id = propertyId;
	
	function getLocationByZipResult(res)
	{
		BX.closeWait();
		
		var obContainer = document.getElementById('LOCATION_' + property_id);
		if (obContainer)
		{
			obContainer.innerHTML = res;
		}
	}

	var url = '/bitrix/components/bitrix/sale.ajax.locations/templates/.default/ajax.php';
	BX.ajax.post(url, 'ZIPCODE=' + zip.value, getLocationByZipResult)
}
/* End */
;
; /* Start:/bitrix/templates/motorus2/components/bitrix/sale.ajax.locations/popup/proceed.js*/
if (typeof oObject != "object")
	window.oObject = {};

function JsSuggest(oHandler, sParams, sParser, domain)
{
	var
		t = this,
		tmp = 0;

	t.oObj = oHandler;
	t.sParams = sParams;
	t.domain = domain;
	// Arrays for data
	if (sParser)
	{
		t.sExp = new RegExp("["+sParser+"]+", "i");
	}
	else
	{
		t.sExp = new RegExp(",");
	}
	t.oLast = {"str":false, "arr":false};
	t.oThis = {"str":false, "arr":false};
	t.oEl = {"start":false, "end":false};
	t.oUnfinedWords = {};
	// Flags
	t.bReady = true, t.eFocus = true;
	// Array with results & it`s showing
	t.aDiv = null, t.oDiv = null;
	// Pointers
	t.oActive = null, t.oPointer = Array(), t.oPointer_default = Array(), t.oPointer_this = 'input_field';

	t.oObj.onblur = function(){t.eFocus = false;}
	t.oObj.onfocus = function(){if (!t.eFocus){t.eFocus = true; setTimeout(function(){t.CheckModif('focus')}, 500);}}

	t.oLast["arr"] = t.oObj.value.split(t.sExp);
	t.oLast["str"] = t.oLast["arr"].join(":");

	setTimeout(function(){t.CheckModif('this')}, 500);

	this.CheckModif = function(__data)
	{
		var
			sThis = false, tmp = 0,
			bUnfined = false, word = "",
			cursor = {};

		if (!t.eFocus)
			return;

		if (t.bReady && t.oObj.value.length > 0)
		{
			// Preparing input data
			t.oThis["arr"] = t.oObj.value.split(t.sExp);
			t.oThis["str"] = t.oThis["arr"].join(":");

			// Getting modificated element
			if (t.oThis["str"] && (t.oThis["str"] != t.oLast["str"]))
			{
				cursor['position'] = TCJsUtils.getCursorPosition(t.oObj);
				if (cursor['position']['end'] > 0 && !t.sExp.test(t.oObj.value.substr(cursor['position']['end']-1, 1)))
				{
					cursor['arr'] = t.oObj.value.substr(0, cursor['position']['end']).split(t.sExp);
					sThis = t.oThis["arr"][cursor['arr'].length - 1];

					t.oEl['start'] = cursor['position']['end'] - cursor['arr'][cursor['arr'].length - 1].length;
					t.oEl['end'] = t.oEl['start'] + sThis.length;
					t.oEl['content'] = sThis;

					t.oLast["arr"] = t.oThis["arr"];
					t.oLast["str"] = t.oThis["str"];
				}
			}
			if (sThis)
			{
				// Checking for UnfinedWords
				for (tmp = 2; tmp <= sThis.length; tmp++)
				{
					word = sThis.substr(0, tmp);
					if (t.oUnfinedWords[word] == '!fined')
					{
						bUnfined = true;
						break;
					}
				}
				if (!bUnfined)
					t.Send(sThis);
			}
		}
		setTimeout(function(){t.CheckModif('this')}, 500);
	},

	t.Send = function(sSearch)
	{
		if (!sSearch)
			return false;

		var TID = null, oError = Array();
		t.bReady = false;
		PShowWaitMessage('wait_container', true);
		TID = CPHttpRequest.InitThread();
		CPHttpRequest.SetAction(
			TID,
			function(data)
			{
				var result = {};
				t.bReady = true;

				try
				{
					eval("result = " + data + ";");
				}
				catch(e)
				{
					oError['result_unval'] = e;
				}

				if (TCJsUtils.empty(result))
					oError['result_empty'] = 'Empty result';

				try
				{
					if (TCJsUtils.empty(oError) && (typeof result == 'object'))
					{
						if (!(result.length == 1 && result[0]['NAME'] == t.oEl['content']))
						{
							t.Show(result);
							return;
						}
					}
					else
					{
						t.oUnfinedWords[t.oEl['content']] = '!fined';
					}
				}
				catch(e)
				{
					oError['unknown_error'] = e;
				}

				PCloseWaitMessage('wait_container', true);
				return;
			}
		);
		url = '/bitrix/components/bitrix/sale.ajax.locations/search.php';
		if(t.domain)
			url = domain + '/bitrix/components/bitrix/sale.ajax.locations/search.php';
		CPHttpRequest.Send(TID, url, {"search":sSearch, "params":t.sParams});
	},

	t.Show = function(result)
	{
		t.Destroy();
		t.oDiv = document.body.appendChild(document.createElement("DIV"));
		t.oDiv.id = t.oObj.id+'_div';

		t.oDiv.className = "search-popup";
		t.oDiv.style.position = 'absolute';

		t.aDiv = t.Print(result);
		var pos = TCJsUtils.GetRealPos(t.oObj);
		//t.oDiv.style.width = parseInt(pos["width"]) + "px";
		t.oDiv.style.width = "auto";
		TCJsUtils.show(t.oDiv, pos["left"], pos["bottom"]);
		TCJsUtils.addEvent(document, "click", t.CheckMouse);
		TCJsUtils.addEvent(document, "keydown", t.CheckKeyword);
	},

	t.Print = function(aArr)
	{
		var
			aEl = null, sPrefix = '', sColumn = '',
			aResult = Array(), aRes = Array(),
			iCnt = 0, tmp = 0, tmp_ = 0, bFirst = true,
			oDiv = null, oSpan = null;

		sPrefix = t.oDiv.id;

		for (tmp_ in aArr)
		{
			// Math
			aEl = aArr[tmp_];
			aRes = Array();
			aRes['ID'] = (aEl['ID'] && aEl['ID'].length > 0) ? aEl['ID'] : iCnt++;
			aRes['GID'] = sPrefix + '_' + aRes['ID'];
			
			locName = aEl['NAME'];
			if (aEl['REGION_NAME'].length > 0 && locName.length <= 0)
				locName = aEl['REGION_NAME'];
			else if (aEl['REGION_NAME'].length > 0)
				locName = locName +', '+ aEl['REGION_NAME'];
			
			if (aEl['COUNTRY_NAME'].length > 0)
				locName = locName +', '+ aEl['COUNTRY_NAME'];
				
			aRes['NAME'] = TCJsUtils.htmlspecialcharsEx(locName);
			
			//aRes['CNT'] = aEl['CNT'];
			aResult[aRes['GID']] = aRes;
			t.oPointer.push(aRes['GID']);
			// Graph
			oDiv = t.oDiv.appendChild(document.createElement("DIV"));
			oDiv.id = aRes['GID'];
			oDiv.name = sPrefix + '_div';

			oDiv.className = 'search-popup-row';

			oDiv.onmouseover = function(){t.Init(); this.className='search-popup-row-active';};
			oDiv.onmouseout = function(){t.Init(); this.className='search-popup-row';};
			oDiv.onclick = function(){t.oActive = this.id};

			//oSpan = oDiv.appendChild(document.createElement("DIV"));
			//oSpan.id = oDiv.id + '_NAME';
			//oSpan.className = "search-popup-el search-popup-el-cnt";
			//oSpan.innerHTML = aRes['CNT'];

			oSpan = oDiv.appendChild(document.createElement("DIV"));
			oSpan.id = oDiv.id + '_NAME';
			oSpan.className = "search-popup-el search-popup-el-name";
			oSpan.innerHTML = aRes['NAME'];

		}
		t.oPointer.push('input_field');
		t.oPointer_default = t.oPointer;
		return aResult;
	},

	t.Destroy = function()
	{
		try
		{
			TCJsUtils.hide(t.oDiv);
			t.oDiv.parentNode.removeChild(t.oDiv);
		}
		catch(e)
		{}
		t.aDiv = Array();
		t.oPointer = Array(), t.oPointer_default = Array(), t.oPointer_this = 'input_field';
		t.bReady = true, t.eFocus = true, oError = {},
		t.oActive = null;

		TCJsUtils.removeEvent(document, "click", t.CheckMouse);
		TCJsUtils.removeEvent(document, "keydown", t.CheckKeyword);
	},

	t.Replace = function()
	{
		if (typeof t.oActive == 'string')
		{
			var tmp = t.aDiv[t.oActive];
			var tmp1 = '';
			if (typeof tmp == 'object')
			{
				var elEntities = document.createElement("span");
				elEntities.innerHTML = TCJsUtils.htmlspecialcharsback(tmp['NAME']);
				tmp1 = elEntities.innerHTML;
				//document.getElementById(t.oObj.name+'_val').value = tmp['ID'];
				var n = t.oObj.name.substr(0, (t.oObj.name.length - 4));
				document.getElementById(n).value = tmp['ID'];
				
				//submit form
				submitForm();	
			}
			//this preserves leading spaces
			var start = t.oEl['start'];
			while(start < t.oObj.value.length && t.oObj.value.substring(start, start+1) == " ")
				start++;

			t.oObj.value = t.oObj.value.substring(0, start) + tmp1 + t.oObj.value.substr(t.oEl['end']);
			TCJsUtils.setCursorPosition(t.oObj, start + tmp1.length);
		}
		return;
	},

	t.Init = function()
	{
		t.oActive = false;
		t.oPointer = t.oPointer_default;
		t.Clear();
		t.oPointer_this = 'input_pointer';
	},

	t.Clear = function()
	{
		var oEl = {}, ii = '';
		oEl = t.oDiv.getElementsByTagName("div");
		if (oEl.length > 0 && typeof oEl == 'object')
		{
			for (ii in oEl)
			{
				var oE = oEl[ii];
				if (oE && (typeof oE == 'object') && (oE.name == t.oDiv.id + '_div'))
				{
					oE.className = "search-popup-row";
				}
			}
		}
		return;
	},

	t.CheckMouse = function()
	{
		t.Replace();
		t.Destroy();
	},

	t.CheckKeyword = function(e)
	{
		if (!e)
			e = window.event;
		var
			oP = null,
			oEl = null,
			ii = null;
		if ((37 < e.keyCode && e.keyCode <41) || (e.keyCode == 13))
		{
			t.Clear();

			switch (e.keyCode)
			{
				case 38:
					oP = t.oPointer.pop();
					if (t.oPointer_this == oP)
					{
						t.oPointer.unshift(oP);
						oP = t.oPointer.pop();
					}

					if (oP != 'input_field')
					{
						t.oActive = oP;
						oEl = document.getElementById(oP);
						if (typeof oEl == 'object')
						{
							oEl.className = "search-popup-row-active";
						}
					}
					t.oPointer.unshift(oP);
					break;
				case 40:
					oP = t.oPointer.shift();
					if (t.oPointer_this == oP)
					{
						t.oPointer.push(oP);
						oP = t.oPointer.shift();
					}
					if (oP != 'input_field')
					{
						t.oActive = oP;
						oEl = document.getElementById(oP);
						if (typeof oEl == 'object')
						{
							oEl.className = "search-popup-row-active";
						}
					}
					t.oPointer.push(oP);
					break;
				case 39:
					t.Replace();
					t.Destroy();
					break;
				case 13:
					t.Replace();
					t.Destroy();
					break;
			}
			t.oPointer_this	= oP;
		}
		else
		{
			t.Destroy();
		}
//		return false;
	}
}

var TCJsUtils =
{
	arEvents: Array(),

	addEvent: function(el, evname, func)
	{
		if(el.attachEvent) // IE
			el.attachEvent("on" + evname, func);
		else if(el.addEventListener) // Gecko / W3C
			el.addEventListener(evname, func, false);
		else
			el["on" + evname] = func;
		this.arEvents[this.arEvents.length] = {'element': el, 'event': evname, 'fn': func};
	},

	removeEvent: function(el, evname, func)
	{
		if(el.detachEvent) // IE
			el.detachEvent("on" + evname, func);
		else if(el.removeEventListener) // Gecko / W3C
			el.removeEventListener(evname, func, false);
		else
			el["on" + evname] = null;
	},

	getCursorPosition: function(oObj)
	{
		var result = {'start': 0, 'end': 0};
		if (!oObj || (typeof oObj != 'object'))
			return result;
		try
		{
			if (document.selection != null && oObj.selectionStart == null)
			{
				oObj.focus();
				var
					oRange = document.selection.createRange(),
					oParent = oRange.parentElement(),
					sBookmark = oRange.getBookmark(),
					sContents = sContents_ = oObj.value,
					sMarker = '__' + Math.random() + '__';

				while(sContents.indexOf(sMarker) != -1)
				{
					sMarker = '__' + Math.random() + '__';
				}

				if (!oParent || oParent == null || (oParent.type != "textarea" && oParent.type != "text"))
				{
					return result;
				}

				oRange.text = sMarker + oRange.text + sMarker;
				sContents = oObj.value;
				result['start'] = sContents.indexOf(sMarker);
				sContents = sContents.replace(sMarker, "");
				result['end'] = sContents.indexOf(sMarker);
				oObj.value = sContents_;
				oRange.moveToBookmark(sBookmark);
				oRange.select();
				return result;
			}
			else
			{
				return {
				 	'start': oObj.selectionStart,
					'end': oObj.selectionEnd
				};
			}
		}
		catch(e){}
		return result;
	},

	setCursorPosition: function(oObj, iPosition)
	{
		var result = false;
		if (typeof oObj != 'object')
			return false;

		oObj.focus();

		try
		{
			if (document.selection != null && oObj.selectionStart == null)
			{
				var oRange = document.selection.createRange();
				oRange.select();
			}
			else
			{
				oObj.selectionStart = iPosition;
				oObj.selectionEnd = iPosition;
			}
			return true;
		}
		catch(e)
		{
			return false;
		}

	},

	printArray: function (oObj, sParser, iLevel)
	{
	    try
	    {
	        var result = '',
	        	space = '',
	        	i=null, j=0;

	        if (iLevel==undefined)
	            iLevel = 0;
	        if (!sParser)
	        	sParser = "\n";

	        for (j=0; j<=iLevel; j++)
	            space += '  ';

	        for (i in oObj)
	        {
	            if (typeof oObj[i] == 'object')
	                result += space+i + " = {"+ sParser + TCJsUtils.printArray(oObj[i], sParser, iLevel+1) + ", " + sParser + "}" + sParser;
	            else
	                result += space+i + " = " + oObj[i] + "; " + sParser;
	        }
	        return result;
	    }
	    catch(e)
	    {
	        return;
	    }
	},

	empty: function(oObj)
	{
		var result = true;
		if (oObj)
		{
		    for (i in oObj)
		    {
		    	 result = false;
		    	 break;
		    }
		}
		return result;
	},

	show: function(oDiv, iLeft, iTop)
	{
		if (typeof oDiv != 'object')
			return;
		var zIndex = parseInt(oDiv.style.zIndex);
		if(zIndex <= 0 || isNaN(zIndex))
			zIndex = 100;
		oDiv.style.zIndex = zIndex;
		oDiv.style.left = iLeft + "px";
		oDiv.style.top = iTop + "px";

		return oDiv;
	},

	hide: function(oDiv)
	{
		if(oDiv)
			oDiv.style.display = 'none';
	},

	GetRealPos: function(el)
	{
		if(!el || !el.offsetParent)
			return false;
		var res=Array();
		var objParent = el.offsetParent;
		res["left"] = el.offsetLeft;
		res["top"] = el.offsetTop;
		while(objParent && objParent.tagName != "BODY")
		{
			res["left"] += objParent.offsetLeft;
			res["top"] += objParent.offsetTop;
			objParent = objParent.offsetParent;
		}
		res["right"]=res["left"] + el.offsetWidth;
		res["bottom"]=res["top"] + el.offsetHeight;
		res["width"]=el.offsetWidth;
		res["height"]=el.offsetHeight;
		return res;
	},

	htmlspecialcharsEx: function(str)
	{
		res = str.replace(/&amp;/g, '&amp;amp;').replace(/&lt;/g, '&amp;lt;').replace(/&gt;/g, '&amp;gt;').replace(/&quot;/g, '&amp;quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
		return res;
	},

	htmlspecialcharsback: function(str)
	{
		res = str.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;;/g, '"').replace(/&amp;/g, '&');
		return res;
	}
}
SuggestLoaded = true;
/* End */
;; /* /bitrix/templates/.default/components/bitrix/sale.order.ajax/order/script.js*/
; /* /bitrix/templates/motorus2/components/bitrix/sale.ajax.locations/.default/proceed.js*/
; /* /bitrix/templates/motorus2/components/bitrix/sale.ajax.locations/popup/proceed.js*/
