
; /* Start:/bitrix/templates/motorus2/components/bitrix/news.list/spares_brands/script.js*/
$(function(){
	$(".brands-list-item .item-read-more").click(function(){
		var $searchPanel = $(this).parents(".brands-list-item").find(".search-panel");

		if($searchPanel.is(":visible")){
			$searchPanel.slideUp();
		}else{
			$(".search-panel").slideUp();
			$searchPanel.slideDown();


			var searchInput =  $searchPanel.find(".search-input").attr("id");
			var searchList =  $searchPanel.find(".search-list").attr("id");
			if(searchInput && searchList) {
				$("#"+searchList).listSearch("#"+searchInput);
			}
		}
		$(this).parents(".brands-list-item").find('.scroll-pane').jScrollPane({
					verticalDragMinHeight: 80,
					verticalDragMaxHeight: 80
				});
		return false;
	});

	$(".search-panel-close").click(function(){
		$(this).parents(".brands-list-item").find(".search-panel").slideUp();
		return false;
	});

	var hash = window.location.hash;
	var brand = hash.substring(1);
	if(brand) {
		var $item = $('.brands-list-item[data-name="' + brand + '"]');
		var $searchPanel = $item.find(".search-panel");
		$searchPanel.slideDown();

		var searchInput =  $searchPanel.find(".search-input").attr("id");
		var searchList =  $searchPanel.find(".search-list").attr("id");
		if(searchInput && searchList) {
			$("#"+searchList).listSearch("#"+searchInput);
		}
	}
});
/* End */
;; /* /bitrix/templates/motorus2/components/bitrix/news.list/spares_brands/script.js*/
