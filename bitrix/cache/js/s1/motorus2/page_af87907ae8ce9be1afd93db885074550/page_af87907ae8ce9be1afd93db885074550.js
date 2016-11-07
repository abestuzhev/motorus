
; /* Start:/bitrix/templates/motorus2/components/bitrix/sale.basket.basket/motorus_kredit/script.js*/
var showBasketItems = 1;

$(function(){
//    console.log("init basket");
    assignCartActions();
});

$(document).ready(function() {
    $('body').append('<div id="loading" class="loading" />');

    $('.credit-info').fancybox();

    $(".bk_buy_button").click(function() {
    	$.fancybox.close(true);
    });
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
                updateSmallBasket();
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
; /* Start:/bitrix/templates/motorus2/scripts/bk.js*/
var _stopBkJqWaitTime,_stopBkTime=setTimeout(function(){if("undefined"==typeof jQuery){var b=document.getElementsByTagName("head")[0],a=document.createElement("script");a.type="text/javascript";a.src="//ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js";b.appendChild(a)}clearTimeout(_stopBkTime);bkJqWait()},1300);
function bkJqWait(){if("undefined"==typeof jQuery||void 0==jQuery)_stopBkJqWaitTime=setTimeout(bkJqWait,100);else{var b=document.getElementsByTagName("head")[0],a=document.createElement("script");a.type="text/javascript";a.src="https://birjakreditov.com/bk_main.js";b.appendChild(a);clearTimeout(_stopBkJqWaitTime)}};
/* End */
;; /* /bitrix/templates/motorus2/components/bitrix/sale.basket.basket/motorus_kredit/script.js*/
; /* /bitrix/templates/motorus2/scripts/bk.js*/
