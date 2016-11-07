
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
var cityName;

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
	
	if(cityName == undefined)
		cityName = "";
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
;; /* /bitrix/templates/.default/components/bitrix/sale.order.ajax/order/script.js*/
