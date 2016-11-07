(function(){

     /*
        load template
        render template
        insert template
      */

    /**
     * Загружаем шаблончик
     */
    OpenAjax.hub.subscribe('GetUrlTemplate', function (e, url) {
        $.ajax({
            url:url,
            success:function (data) {
                OpenAjax.hub.publish('Catalog:render', {data:template});
            }
        })
    });

    /*
     * Рендерим
     */
    OpenAjax.hub.subscribe('Render', function (e, data) {
//    if (typeof data == "object" && data.template && data['data']) {
//        var data = _.template(data.template, data.data);
//    }
    });

})()
