
; /* Start:/bitrix/templates/motorus2/scripts/script.js*/
function loadImage(element) {
    $(element).parent().css("background","none");
    $(element).show();
}

$(function(){

    $('.transform').find('input').bind('click', function(event){
        var $parent = $(event.target).parents('div.transform');
        if($parent.size()>0){
//            $('body').trigger('filter/updated', $parent);
        }
    });

    //Активация подменю
    $('.ca-item a').click(function(){
        $('.ca-item a').removeClass('active');
        $(this).addClass('active');
    });

	$(".slide-caption").click(function(){
		$(this).parent().find(".slide-controls").slideToggle(
			function(){
				$(this)
					.parent()
					.toggleClass('slide-open');
			});
		return false;
	});

    function CatalogTopItems(){
        $('.catalog-all-top').css('overflow','hidden');
        cw = $('.catalog-all-top').width();
        c = $('.catalog-all-top li').length;
        var w = 0;
        $('.catalog-all-top li').each(function(){
            w += $(this).outerWidth();
        });
        $('.catalog-all-top li').css('margin-left',(cw-w)/c - 5+'px');
        $('.catalog-all-top li:first-child').css('margin-left','0px');
    }

    $('.catalog-view a').click(function(){
        $('.catalog-all').show();
        $('.catalog-all').addClass('show-panel');
        CatalogTopItems();
        return false;
    });

    $(document).click(function(){
        if (!$(this).parents('.catalog-all').hasClass('show-panel')){
            $('.catalog-all').hide();
            $('.catalog-all').removeClass('show-panel');
        }
    });


    $('.filter-form.filter').submit(function(e){
        e.preventDefault();
    })
    var inp = $('.filter .slider-range-container input[type="text"]');
    if(inp.length){
        inp.keyup(function(ev){
            var $this = $(this)
            var range = $this.attr('data-range').split('|');

            var node = $('.filter-slider input[name="'+$this.attr('name').replace(/_$/,"")+'"]');
            if(node.length==0){
                return;
            }
            node = node.parent();
            var val1 = node.find('.min-range input').val()
            var val2 = node.find('.max-range input').val()
            node.find('.slider-range').slider({ values: [val1,val2] })
            OpenAjax.hub.publish('UpdateParam',{type:"slider",name:$this.attr('name').replace(/_$/,"").replace(/[^\[]+\[/,'').replace(/\]\[.+/,''),values:[val1,val2]})

        })
    }

    $(".slider-range").slider({
        range: true,
        min: 1,
        max: 30,
        values: [ 1, 30 ],
        slide: function( event, ui ) {
            var $parent = $(this).parent();
            var $el = $(event.target)
            var min = $el.slider("option", "min");
            var max = $el.slider("option", "max");
            var left = ui.values[0] <= min ? min : ui.values[0];
            var right = ui.values[1]>= max ? max : ui.values[1];
            $parent.find('input.left' ).attr('value', left);
            $parent.find('input.right').attr('value', right);
            $parent.find(".min-range input").val( ui.values[ 0 ] );
            $parent.find(".max-range input").val( ui.values[ 1 ] );
        },
        stop: function(event, ui) {
            var $parent = $(event.target).parents('div.filter-slider');
            var name = $(event.target).parent().find('input.left' ).attr('name').replace(/[^\[]+\[/,'').replace(/\]\[.+/,'');

            OpenAjax.hub.publish('UpdateParam',{type:"slider",name:name,values:[ui.values[0],ui.values[1]]})
        },
        create: function( event, ui ) {
            var sMin = $(this).attr('data-min');
            var sMax = $(this).attr('data-max');
            var sLeft = $(this).attr('data-left');
            var sRight = $(this).attr('data-right');
            var $el = $(event.target);
            var left  = (sLeft <= sMin)?sMin:sLeft;
            var right  = (sRight >= sMax)?sMax:sRight;
            var name = $(event.target).parent().find('input.left' ).attr('name').replace(/[^\[]+\[/,'').replace(/\]\[.+/,'');
            $el.parent().find('input.left' ).attr('value', left);
            $el.parent().find('input.right').attr('value', right);
            $el.slider("option", "min", Number(sMin));
            $el.slider("option", "max", Number(sMax));
            //$el.slider("option", "values", [ Number(sLeft), Number(sRight) ]);
            $el.slider("option", "values", [ 118, 300 ]);
            var $input_min = $el.parent().find('.min-range input');
            $input_min.val(sLeft);
            var $input_max = $el.parent().find('.max-range input');
            $input_max.val(sRight);
            $el.parent().find('.min-range input, .max-range input').change(function(){
                var values = [$input_min.val(), $input_max.val()];
                $el.slider({'values': values});
                OpenAjax.hub.publish('UpdateParam',{type:"slider",'name':name,'values':values});
            });
        }
    });

    $('body').bind('basket/trychange',function(event){
        var h = $(window).height() / 2 +  $(document).scrollTop() - 50;
        var w = $('.wrapper').width() / 2;

        $('#product-alert-loading').css({
            'top': h,
            'left': w - 150
        });
        $('#product-alert-loading').fadeIn();
    });

    $('body').bind('basket/success',function(event){
        var h = $(window).height() / 2 +  $(document).scrollTop() - 50;
        var w = $('.wrapper').width() / 2;
        $('#product-alert-loading').fadeOut();
        $('#product-alert').css({
            'top': h,
            'left': w - 150,
            'width':'300px',
            'height':'100px',
            'opacity':'1'
        });
        $('#product-alert')
            .show()
            .delay(1500)
            .animate({
                'top': 0,
                'left': $('.wrapper').width() - 300 + 'px',
                'width': 0,
                'height': 0,
                'opacity':'0'
            });
    });

    $('body').bind('basket/fail',function(event){
        var h = $(window).height() / 2 +  $(document).scrollTop() - 50;
        $('#product-alert-loading').fadeOut();
        $('#product-alert-fail').css('top', h);
        $('#product-alert-fail').fadeIn().delay(800).fadeOut();
    });

        $('body').bind('loading_cursor/stop', function(event){
            $('#loading').css('visibility','hidden');
        })

        $('body').bind('loading_cursor/run',function(event){
            $('#loading').css('visibility','visible');
        })



        $('body').bind('mousemove.loading',function(event){
            mouseMove(event)
        })
        $('body').bind('scroll.loading',function(event){
            mouseMove(event)
        })

    $('body').bind('loading/finished',function(){

    })


    function fixEvent(e) {
        // получить объект событие для IE
        e = e || window.event

        // добавить pageX/pageY для IE
        if ( e.pageX == null && e.clientX != null ) {
            var html = document.documentElement
            var body = document.body
            e.pageX = e.clientX + (html && html.scrollLeft || body && body.scrollLeft || 0) - (html.clientLeft || 0)
            e.pageY = e.clientY + (html && html.scrollTop || body && body.scrollTop || 0) - (html.clientTop || 0)
        }

        // добавить which для IE
        if (!e.which && e.button) {
            e.which = e.button & 1 ? 1 : ( e.button & 2 ? 3 : ( e.button & 4 ? 2 : 0 ) )
        }
        return e
    }

    function mouseMove(event){
        event = fixEvent(event);
        var wwidth=(window.innerWidth)?window.innerWidth: ((document.all)?document.body.offsetWidth:null);
        if((event.pageX+70)>wwidth) event.pageX = wwidth - 10;
        $('#loading').css("left", event.pageX + 10);
        $('#loading').css("top", event.pageY - 20);//22
    }

    //скрипт для работы вкладок
    $('dl.tabs dt').click(function(){
    $(this).siblings().removeClass('selected').end().next('dd').andSelf().addClass('selected');
    });

    // DropDown('.spares-breadcrumbs-list-item');
});

// drop down
$(function() {

    $('.spares-breadcrumbs-list-item > a').each(function() {
        $(this).click(function(){
            $('.spares-breadcrumbs-list-item').removeClass('active');
            $(this).parent().toggleClass('active');
            return false;
        });
    });

    $(document).click(function() {
        // all dropdowns
        $('.spares-breadcrumbs-list-item').removeClass('active');
    });

});

$(document).ready(function() {

    $('.callback-popup-city select').styler();

    $('.city-fancybox').fancybox({
        wrapCSS : 'city-fancybox'
    });

    $('.header-links li.phone a').on('click', function(e) {
        e.preventDefault();

        $(this).parents('.header-links li.phone').addClass('open');
    });

    $('.city-popup ul a').on('click', function(e) {
        e.preventDefault();

        var city = $(this).text();
        var phone = $(this).data('phone');

        $.post('/ajax/save-city.php', {city: city, phone: phone});

        $('#site-city').html(city);
        $('#site-phone').html(phone);
        $.fancybox.close();
    });

    $('.callback-popup-close').on('click', function(e) {
        e.preventDefault();

        $(this).parents('.header-links li.phone').removeClass('open');
    });

    $('.-form-validate').each(function() {
        $(this).validate({
            invalidHandler: function() {
                setTimeout(function() {
                    $('.-form-validate input, .-form-validate select').trigger('refresh');
                }, 1)
            },
            errorPlacement: function(error, element) {}
        });
    });


    $('.callback-popup-city select').on('change', function() {
        var $this = $(this);
        setTimeout(function() {
            $this.trigger('refresh');
        }, 1)
    });

    $('.-form-submit').each(function() {

        $(this).addClass('-form-submit-active');

        $(this).on('submit', function(e) {

            e.preventDefault();

            var errors = false;

            if ($(this).hasClass('-form-validate') && !$(this).valid()) {
                errors = true;
            }

            if (!errors) {

                var formObj  = $(this),
                    formURL  = formObj.attr('action'),
                    formData = new FormData(this),
                    sessid   = BX.bitrix_sessid();

                formData.append('iblock', formObj.data('iblock'));
                formData.append('sessid', sessid);

                formObj.find('input[type="submit"]').prop('disabled', true);

                var request  = $.ajax({
                    url         : formURL,
                    type        : 'POST',
                    data        : formData,
                    processData : false,
                    contentType : false
                });

                request.done(function() {

                    var response = $.parseJSON(request.responseText);

                    formObj.hide();

                    var responseClass = '-form-error';

                    if (response.result == true) {
                        responseClass = '-form-success';
                    }

                    formObj.parent().find('.-form-response').addClass(responseClass).show('fast', function() {
                        $(this).html(response.message);
                    });
                });

                request.fail(function() {
                    alert(statusText);
                });

                request.always(function() {
                    formObj.find('input[type="submit"]').removeAttr('disabled');
                });
            }
        });

    });

});
/* End */
;
; /* Start:/bitrix/templates/motorus2/scripts/basket.add.js*/
var closePopupTimer;
var popupTimerValue = 5;

function declination(a, b, c, s) {
    var words = [a, b, c];
    var index = s % 100;

    if (index >=11 && index <= 14) { index = 0; }
    else { index = (index %= 10) < 5 ? (index > 2 ? 2 : index): 0; }

    return(words[index]);
}

function updatePopup() {
    popupTimerValue--;
    if (popupTimerValue > 0) {
        var text = popupTimerValue + ' ' + declination("секунд", "секунду", "секунды", popupTimerValue);
        $('#basket-popup #popup-time').text(text);
    } else {
        $.fancybox.close(true);
        popupTimerValue = 5;
        clearTimeout(closePopupTimer);
    }
}

function basket_event(event, element, type) {
    event.preventDefault();
    
    if(type === "form-element"){
        var basket_url = '/catalog/add2basket.php?' + $(element).parent().serialize();//+$(element).attr('href').split("?")[1];//$(element).attr('href');
        var $item = $(element).parents('.product-details');
        var picture = $(".catalog-item-image input").val();
        var title = $(".catalog-item-title").text();
    }
    else if(type === "form-list"){
        var basket_url = '/catalog/add2basket.php?' + $(element).parent().serialize();
        var $box = $(element).parent().parent().parent().parent().parent();
        var picture = $box.find(".item-image input").val();
        var title = $box.find(".item-title a").text();
    }
    else if(type === "form-required"){
        var basket_url = '/catalog/add2basket.php?' + $(element).parent().serialize(),
            product_id = $(element).data('id'),
            title = $('.dont-forget-list').find('.item').filter('[data-id='+product_id+']').data().title,
            picture = $(element).data('img');
    }
    
    $.fancybox.showLoading();

    $.ajax({
        url: basket_url,
        dataType: 'json',
        success: function(data){
        
            if(data.status=='ok')
            {
                $('#basket-popup #popup-time').text('5 секунд');
                $('#basket-popup .basket-popup-picture img').attr('src', picture);
                $('#basket-popup .basket-popup-title span').text(title);

                $.fancybox($('#basket-popup'),{
                    padding     : 23,
                    scrolling   : 'no',
                    afterLoad  : function(){
                        closePopupTimer = setInterval(updatePopup, 1000);
                        $('#basket-popup .close-popup').click(function(){
                            $.fancybox.close(true);
                            return false;
                        });
                    },
                    afterClose : function(){
                        clearTimeout(closePopupTimer);
                    }
                });

                $('body').trigger('basket/success');
                $('body').trigger('basket/add', data);
            }
            else
            {
                $.fancybox(
                    '<div class="message-popup-container">'+
                        '<div class="popup-caption">Ошибка</div>'+
                        '<div class="message-popup-container">Ошибка добавления товара в корзину.</div>'+
                    '</div>', {
                    padding     : 23,
                    scrolling   : 'no'
                });

                $('body').trigger('basket/fail');
                $('body').trigger('basket/add', data);
            }
        }
    });
    return false;
}

// новое добавление товара в корзину
function AddToBasket(element) {
    var data = $(element).parents('form').serialize();
    data += '&action=ADD2BASKET';

    $.fancybox.showLoading();
    $.post(
        '/ajax/cart.ajax.php',
        data,
        function(data){
            if(data) {
                var title = $(element).attr('data-name');
                var picture = $(element).attr('data-picture');
                
                $('#basket-popup #popup-time').text('5 секунд');
                $('#basket-popup .basket-popup-picture img').attr('src', picture);
                $('#basket-popup .basket-popup-title span').text(title);

                $.fancybox($('#basket-popup'),{
                    padding     : 23,
                    scrolling   : 'no',
                    afterLoad  : function(){
                        closePopupTimer = setInterval(updatePopup, 1000);
                        $('#basket-popup .close-popup').click(function(){
                            $.fancybox.close(true);
                            return false;
                        });
                    },
                    afterClose : function(){
                        clearTimeout(closePopupTimer);
                    }
                });

                $('body').trigger('basket/success');
                $('body').trigger('basket/add', data);
            }
            else {
                $.fancybox(
                    '<div class="message-popup-container">'+
                        '<div class="popup-caption">Ошибка</div>'+
                        '<div class="message-popup-container">Ошибка добавления товара в корзину.</div>'+
                    '</div>', {
                    padding     : 23,
                    scrolling   : 'no'
                });

                $('body').trigger('basket/fail');
                $('body').trigger('basket/add', data);
            }
        }
    );
    return false;
}

$(function(){

    /**
     * Отправляем Ajax запрос на добавление товара в корзину
     */
    $('.catalog-item-to-cart form [type="submit"]').click(function(event){  basket_event(event, this, "form-element"); });
    $(document).on('click', '.item-box .item-buy form [type="submit"]', function(event){ basket_event(event, this, "form-list"); });
    $('.catalog-item-analog-list .item form [type="submit"]').click(function(event){ basket_event(event, this, "form-list"); });
    //$(".product-details .buy a").click(function(event){ basket_event(event, this); });
    //$(".dont-forget-list .item-buy a").click(function(event){ basket_event(event, this, "a"); });
    $('.dont-forget-list .item-buy form [type="submit"]').click(function(event){ basket_event(event, this, "form-required"); });
});

/* End */
;
; /* Start:/bitrix/templates/motorus2/components/bitrix/sale.basket.basket.small/header/script.js*/
$(function() {
    /**
     * Добавление товара в корзину
     */
    $('body').bind('basket/add', function(data){
        updateSmallBasket();
    });
    /**
     * Удаление товара из корзины
     */
    $('body').bind('basket/remove', function(data){
        updateSmallBasket();
    });
});



function updateSmallBasket() {
    $.get('/ajax/sale.basket.basket.small.php', function(data){
        $('#small-basket').html(data);
    });
}
/* End */
;
; /* Start:/bitrix/templates/motorus2/components/bitrix/sale.basket.basket/sidebar/script.js*/
var showBasketItems = 1;

$(function(){
//    console.log("init basket");
    assignCartActions();
});

$(document).ready(function() {
    $('body').append('<div id="loading" class="loading" />');
});


function assignCartActions()
{
    var url = '/ajax/store.sale.basket.basket.php';
    var selector = '#basket_form_container';
    var curQuantity;

    ShowBasketItems(showBasketItems);

    $('.delete-basket-single').live('click',function(event){
        event.preventDefault();
        if(!confirm('Вы уверены?'))
            return;
        re = /\d+/i;
        var rowId = $(this).parents('tr').attr('id');
        var productId = parseInt(rowId.match(re));
        $(this).parents('tr').find('.quantity-del').remove();
        deleteRow('#'+rowId);
        var data = {action : 'delete', id : productId};
        loadContent(selector, url, data);
    });

    $('.deley-basket').live('click',function(event){
        event.preventDefault();
        if(!confirm('Вы уверены?'))
            return;
        re = /\d+/i;
        var rowId = $(this).parents('tr').attr('id');
        var productId = parseInt(rowId.match(re));
        deleteRow('#'+rowId);
        var data = {action : 'shelve', id : productId};
        loadContent(selector, url, data);
    });

    $('.add-deley-basket').live('click',function(event){
        event.preventDefault();
        re = /\d+/i;
        var rowId = $(this).parents('tr').attr('id');
        var productId = parseInt(rowId.match(re));
        deleteRow('#'+rowId);
        var data = {action : 'add', id : productId};
        loadContent(selector, url, data);
    });

    $('.delete-basket-all').live('click',function(event){
        event.preventDefault();
        if(!confirm('Вы уверены?'))
            return;
//        $('.basket-items table tbody tr').each(function(){$(this).fadeOut();});
        var data = {action : 'clean'};
        var selector = $(this).parents('.basket-container').attr('id');
        $('#basket_form').fadeOut();
        $('#basket_form_container').html('Ваша корзина пуста');
        loadContent(selector, url, data);
    });

    var timeOutId;
    var sendData;
    function doLoadContent()
    {
        loadContent(selector, url, sendData);
    }




    $('.ui-spinner-button').live('click',function(event){
        $('body').trigger('loading_cursor/run');
        clearTimeout(timeOutId);
        var inputObj = $(this).parents('td').find(':input');
        re = /\d+/i;
        var rowId = $(this).parents('tr').attr('id');
        var basketId = parseInt(rowId.match(re));
        var productId = parseInt(inputObj.attr('name'));
        var itemQuantity = parseInt(inputObj.val());
        sendData =  {action : 'quantity', basket_id : basketId, product_id:productId, quantity : itemQuantity};
        timeOutId = setTimeout(doLoadContent,1000);
    });

    $('.quantity').live('keyup',function(event){
        $('body').trigger('loading_cursor/run');
        clearTimeout(timeOutId);
        var inputObj = $(this);
        re = /\d+/i;
        var rowId = $(this).parents('tr').attr('id');
        var basketId = parseInt(rowId.match(re));
        var productId = parseInt(inputObj.attr('name'));
        var itemQuantity = parseInt(inputObj.val());
        sendData =  {action : 'quantity', basket_id : basketId, product_id:productId, quantity : itemQuantity};
        timeOutId = setTimeout(doLoadContent,1000);
    });

}
function loadContent(selector, url, data)
{
    $('body').trigger('loading_cursor/run', data);
        $.ajax({
            url: url,
            type: 'get',
            data: data,
            dataType: 'html',
            success: function(answer){
                $(selector).html(answer);
                $('.cart-list input.quantity').each(function(index, elem){
                    $(elem).spinner({
                        min: 1,
                        max: 99999
                    });
                });
//                assignCartActions();
//                $('body').trigger('basket/add', data);
                $.get('/ajax/sale.basket.basket.small.php', function(data){
                    $('#small_basket').html(data);
                });
                ShowBasketItems(showBasketItems);
                $('body').trigger('loading_cursor/stop', data);

            }
        });
}

function deleteRow(selector)
{
    $(selector).fadeOut(1000);
}

function ShowBasketItems(val)
{
    if(parseInt(val)>0)
        showBasketItems = val;
    if(showBasketItems == 2)
    {
        if(document.getElementById("id-cart-list"))
            document.getElementById("id-cart-list").style.display = 'none';
        if(document.getElementById("id-shelve-list"))
            document.getElementById("id-shelve-list").style.display = 'block';
        //if(document.getElementById("id-na-list"))
        //document.getElementById("id-na-list").style.display = 'none';
    }
    else if(showBasketItems == 3)
    {
        if(document.getElementById("id-cart-list"))
            document.getElementById("id-cart-list").style.display = 'none';
        if(document.getElementById("id-shelve-list"))
            document.getElementById("id-shelve-list").style.display = 'none';
        //if(document.getElementById("id-na-list"))
        //document.getElementById("id-na-list").style.display = 'block';
    }
    else
    {
        if(document.getElementById("id-cart-list"))
            document.getElementById("id-cart-list").style.display = 'block';
        if(document.getElementById("id-shelve-list"))
            document.getElementById("id-shelve-list").style.display = 'none';
        //if(document.getElementById("id-na-list"))
        //document.getElementById("id-na-list").style.display = 'none';
    }
}
/* End */
;
; /* Start:/bitrix/templates/motorus2/scripts/plugins/customselect/customselect.js*/
(function($){
 $.fn.extend({
 
 	customSelect : function(options) {
	  if(!$.browser.msie || ($.browser.msie&&$.browser.version>6)){
	  var defaults = { customClass: null };
	  var options = $.extend(defaults, options);
	  
	  return this.each(function() {
	  
			var currentSelected = $(this).find(':selected');
			var html = currentSelected.html() || '&nbsp;';
			var customSelectInnerSpan = $('<span class="customSelectInner" />').append(html);
			var customSelectSpan = $('<span class="customSelect" />').append(customSelectInnerSpan);
			if(options.customClass){customSelectSpan.addClass(options.customClass);}
			$(this).after(customSelectSpan);
			var selectBoxWidth = parseInt($(this).outerWidth()) - (parseInt(customSelectSpan.outerWidth()) - parseInt(customSelectSpan.width()) );			
			customSelectSpan.css({display:'inline-block'});
			customSelectInnerSpan.css({width:selectBoxWidth, display:'inline-block'});
			var selectBoxHeight = customSelectSpan.outerHeight();
			$(this).css({'-webkit-appearance':'menulist-button',width:customSelectSpan.outerWidth(),position:'absolute', opacity:0,height:selectBoxHeight,fontSize:$(this).next().css('font-size')}).change(function(){
				customSelectInnerSpan.text($(this).find(':selected').text()).parent().addClass('customSelectChanged');
				setTimeout(function(){customSelectSpan.removeClass('customSelectOpen');},60);
			}).bind('mousedown',function(){
				customSelectSpan.toggleClass('customSelectOpen');
			}).focus(function(){
				customSelectSpan.addClass('customSelectFocus');
			}).blur(function(){
				customSelectSpan.removeClass('customSelectFocus customSelectOpen');
			});
			
	  });
	  }
	}
 });
})(jQuery);

/* End */
;; /* /bitrix/templates/motorus2/scripts/script.js*/
; /* /bitrix/templates/motorus2/scripts/basket.add.js*/
; /* /bitrix/templates/motorus2/components/bitrix/sale.basket.basket.small/header/script.js*/
; /* /bitrix/templates/motorus2/components/bitrix/sale.basket.basket/sidebar/script.js*/
; /* /bitrix/templates/motorus2/scripts/plugins/customselect/customselect.js*/
