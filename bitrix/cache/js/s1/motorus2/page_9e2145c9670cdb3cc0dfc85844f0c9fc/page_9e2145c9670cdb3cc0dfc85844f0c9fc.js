
; /* Start:/bitrix/templates/motorus2/components/bitrix/news.detail/spares_units/script.js*/
jQuery.expr[":"].Contains = jQuery.expr.createPseudo(function(arg) {
	return function( elem ) {
		return jQuery(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
	};
});

$(function(){
	// spinner
	$('.spares-table-buy-input').each(function(index, elem){
		$(elem).numberMask({
			beforePoint: 3
		});

		$(elem).keyup(function(event) {
			if(($(elem).val().length <= 1) && 
				 (event.which == 48 || event.which == 96)) {
				$(elem).val("1");
			}
		});

		$(elem).keydown(function(event) {
			if(($(elem).val().length <= 1) && 
			   (event.which == 8 || event.which == 46)) {
				$(elem).select();
				return false;
			}
			if($(elem).val() == "0") {
				return false;
			}
		});

		$(elem).spinner({
			min: 1,
			max: 999
		});
	});

	// фильтр по названию
	function FilterTable() {
		var q = $('#search-name').val();

		if (q) {
			$('#table-data tr').hide().removeClass('visible').addClass('hide');
			$('#table-data tr').find('td:eq(1):Contains("'+q+'")').parent('tr').show().removeClass('hide').addClass('visible');
			$('#table-data tr').find('td:eq(2):Contains("'+q+'")').parent('tr').show().removeClass('hide').addClass('visible');
			$('#search-num').val('');
		} else 
			$('#table-data tr').show().removeClass('hide').addClass('visible');

		TablePaginated();	
	}

	$('#search-name+input').click(function() {
		FilterTable();
	});

	$('#search-name').keydown(function(e) {
		if(e.keyCode == 13)
		{
			FilterTable();
			return false;
		}
	});

	// фильтр по номеру
	function FilterNumber(){
		var q = $('#search-num').val();

		if (q) {
			$('#table-data tr').each(function() {
				if($(this).find('td:eq(0)').text() == q)
					$(this).show().removeClass('hide').addClass('visible');
				else
					$(this).hide().removeClass('visible').addClass('hide');
			});
			$('#search-name').val('');
		} else
			$('#table-data tr').show().removeClass('hide').addClass('visible');

		TablePaginated();
	}

	$('#search-num').numberMask({
		beforePoint: 3
	});

	$('#search-num+input').click(function() {
		FilterNumber();
	});

	$('#search-num').keydown(function(e) {
		if(e.keyCode == 13)
		{
			FilterNumber();
			return false;
		}
	});

	// пагинация
	function TablePaginated() {
		var currentPage = 0;
		var numPerPage = 20;
		var activePage = 0;
		var $table = $('table.paginated');
		var $separation = $('<div class="spares-table-show-more"><i></i></div>');

		if($('.spares-table-pagination').length)
			$('.spares-table-pagination').remove();

		if($('.spares-table-show-more').length)
			$('.spares-table-show-more').remove();

		$table.bind('repaginate', function() {
			$table.find('tbody tr.visible').hide().slice(currentPage * numPerPage, (currentPage + 1) * numPerPage).show();
		});

		$table.bind('reseparation', function() {
			if($table.find('tbody tr.visible').length <= (currentPage + 1) * numPerPage) {
				$separation.hide();
			} else {
				$separation.show();
			}
		});

		$separation = $('<div class="spares-table-show-more"><i></i></div>');
		$separation.insertAfter($table);
		$('<a href="#">Показать ещё</a>').bind('click',function(){
			currentPage++;
			$table.find('tbody tr.visible').hide().slice(activePage, (currentPage + 1) * numPerPage).show();
			$('.spares-table-pagination-buttons').find('a').eq(currentPage).addClass('active');
			$table.trigger('reseparation');
			return false;
		}).appendTo($separation).wrap('<span/>');
		

		$table.trigger('repaginate');
		$table.trigger('reseparation');
		var numRows = $table.find('tbody tr.visible').length;
		var numPages = Math.ceil(numRows / numPerPage);

		var $pagination = $('<div class="spares-table-pagination"/>');
		var $label = $('<div class="spares-table-pagination-label">На страницу</div>');
		var $buttons = $('<div class="spares-table-pagination-buttons"/>');

		for (var page = 0; page < numPages; page++) {
			$('<a href="#page-'+ parseInt(page + 1) +'"></a>').text(page + 1).bind('click', {
				newPage: page
			}, function(event) {
				if(!$(this).hasClass('active')) {
					currentPage = event.data['newPage'];
					activePage = currentPage;
					$table.trigger('repaginate');
					$table.trigger('reseparation');
					$(this).addClass('active').siblings().removeClass('active');
				}
				return false;
			}).appendTo($buttons);
		}
		$pagination.append($label).append($buttons).insertAfter($separation).find('a:first').addClass('active');
	}

	$('#table-data tr').addClass('visible');
	TablePaginated();
});
/* End */
;; /* /bitrix/templates/motorus2/components/bitrix/news.detail/spares_units/script.js*/
