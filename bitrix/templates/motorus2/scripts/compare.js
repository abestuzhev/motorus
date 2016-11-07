$( document ).ready(function() {
      var compareForm = $('#compare-list');
      var iblockId = compareForm.attr('iblock_id');
      var compareList = $('.sidebar-compare');
      var clicked ='<img src="/bitrix/templates/motorus2/images/clicked.png"/>';

      $('#items-list').on('click', '.compare-link', function(evt){
            evt.preventDefault();
            var data = {
                IBLOCK_ID: iblockId,
                action:'ADD_TO_COMPARE_LIST',
                id:$(this).data('item-id')
            };
            $(this).parents('.comparison-item').slideUp();
            loadCompareHtml(data);
            $(".sidebar-compare").show();

            $(this).html('в сравнении');
            $(this).attr('class','in-comparsion');
            $(this).parent().prepend(clicked);
       });

         $('#items-list').on('click', '.in-comparsion', function(evt){
            evt.preventDefault();
            $('.compare-form').submit();
        });

        $('.catalog-item-analog-list').on('click', '.in-comparsion', function(evt){
            evt.preventDefault();
            $('.compare-form').submit();
        });
        
      $('.catalog-item-analog-list').on('click', '.compare-link', function(evt){
            evt.preventDefault();
            var data = {
                IBLOCK_ID: iblockId,
                action:'ADD_TO_COMPARE_LIST',
                id:$(this).data('item-id')
            };
            $(this).parents('.comparison-item').slideUp();
            loadCompareHtml(data);
            $(".sidebar-compare").show();

            $(this).html('в сравнении');
            $(this).attr('class','in-comparsion');
            $(this).parent().prepend(clicked);
       });

      $('#compare-list').on('click', '.comparison-item-delete', function(evt){
        evt.preventDefault();
        var itemId = $(this).data('item-id');
        var data = {
            IBLOCK_ID: iblockId,
            action:'DELETE_FROM_COMPARE_LIST',
            id: itemId
        };
        $(this).parents('.comparison-item').slideUp();
        loadCompareHtml(data);
        var compareLink= $('*[data-item-id="'+itemId+'"]');
        compareLink.html('к сравнению');
        compareLink.attr('class','compare-link');
        compareLink.parent().find(':first-child').remove();
    });

});
function loadCompareHtml(data)
{
    $('#compare-list').load('/ajax/catalog.compare.list.php?'+$.param(data),
        function(response){
            if ($("#compare-list .comparison-item").length) {
                $(".sidebar-compare").show();
            } else {
                $(".sidebar-compare").hide();
                if($('.right-sidebar').children(':visible').length == 0) {
                    $('.right-sidebar').css("display","none");
                }
            }
        }
    );
}

