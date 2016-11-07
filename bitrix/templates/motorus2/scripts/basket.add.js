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
