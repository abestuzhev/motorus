$(document).ready(function(){

		var ajaxScriptName = "index.php", pageParamName = "", nextPage = 1, totalCount, itemInPage, totalPages, fullHref;
			
		totalCount = $(".catalog-category .page-navigation .record-count").text();
        itemInPage = $(".catalog-category .page-navigation .record-in-page").text();
		totalPages = $(".catalog-category .page-navigation .page-count").text();
		
		$(".catalog-category .page-navigation .more-products a").each(function(){
			fullHref = $(this).attr("href");
			if(fullHref.indexOf("PAGEN_") > -1){
			   pageParamName = fullHref.substring(fullHref.indexOf("?")+1);
			   return false;
			}
		});

		
		$(".catalog-category .page-navigation").remove();
		preparingPagination();


		$(document).on("click", ".catalog-pagination .more a", function(event){
		

			event.preventDefault();
			
			var pagParam = "";
			var emArray = /[\.]*(PAGEN_[\d]+)=([\d]+)/ig.exec(pageParamName);
			if(emArray == null){
				return false;
			}
			else{
			    pageParamName = pageParamName.replace(emArray[1] + "=" + emArray[2], "")
			    pageParamName += emArray[1] + "=" + (++nextPage);
			}
			
			$.get(window.location.pathname, pageParamName , function(data){

                var beginStr = '<!--#begin-list-items#-->';
		        var listItem = data.substring(data.indexOf(beginStr) + beginStr.length, data.indexOf('<!--#end-list-items#-->'));
				$(".catalog-pagination").remove();
				$(".catalog-category-list").append(listItem);
				$(".clear-both").remove();
				$(".catalog-category-list .item").removeAttr("style");
				 
				if($(".catalog-category-display .display-line").attr("class").indexOf("active") > -1){
					$(".catalog-category-list .item .item-box").css({height:209});
				}
				
				preparingPagination();

			});

		});


		function preparingPagination(){
		
		    //$(".catalog-category-list .item").removeAttr("style");
		
			if(totalPages > nextPage){
				
				$(".content").after('<div class="catalog-pagination clearfix"><div class="view">показано <strong>10 товаров</strong></div><div class="all">всего <strong>50 товаров</strong></div><div class="more"><a href="#" data-curpage="1"><span>показать еще</span></a></div></div>');
				$(".catalog-pagination").css({
					'position':'relative',
					'top':-parseInt($(".content").css("margin-bottom")+5),
					'width':$(".content").outerWidth(),
					'margin-top':-4,
					'z-index':2,
					'left':parseInt($(".content").css("margin-left")),
					'box-shadow': '2px 1px 3px 0px rgba(0, 0, 0, 0.3)'
				});

				$(window).resize(function()
				{
					$(".catalog-pagination").css({
					'width':$(".content").outerWidth(),
					});
				})

				$(".catalog-pagination .view strong").text(nextPage*itemInPage + " товаров");
				$(".catalog-pagination .all strong").text(totalCount + " товаров");

			}
			else{
			
			    $(".catalog-category .page-navigation").remove();
				$(".catalog-pagination").remove();
				
			}
		
		}

		
		$(document).on("click", ".display-grid a", function(){$(".catalog-category-list .item .item-box").removeAttr("style"); $(".catalog-category-list .item").removeAttr("style");})
		$(document).on("click", ".display-line a", function(){$(".catalog-category-list .item .item-box").css({height:209});})
		

});
