
; /* Start:/bitrix/templates/.default/components/bitrix/catalog/catalog-new/bitrix/catalog.element/.default/script.js*/
$(document).ready(function() {
	$(".fancybox-photos").fancybox({
		prevEffect		: 'none',
		nextEffect		: 'none',
		closeBtn		: true,
		padding			: 25,
		helpers		: {
			title	: { type : 'inside' }
		},
		afterLoad : function() {
			this.title = 'Фотография ' + (this.index + 1) + ' из ' + this.group.length + (this.title ? ' - ' + this.title : '');
		}
	});

	$(".tab-panel .tabs a").click(function() {
		var id = $(this).attr("href");
		var $tabs = $(".tab-panel .tabs a");
		var $panel = $(id);
		var $panels = $(".tab-panel .panel");

		$panels.hide();
		$panel.show();

		$tabs.removeClass("selected");
		$(this).addClass("selected");

		return false;
	});

	$(".tab-panel .tabs a").first().click();

	$('.credit-info').fancybox();

	$(".bk_buy_button").click(function() {
		$.fancybox.close(true);
	});
});
/* End */
;; /* /bitrix/templates/.default/components/bitrix/catalog/catalog-new/bitrix/catalog.element/.default/script.js*/
