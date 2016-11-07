var item_template;
var catalog_template;
var SITE_TEMPLATE_PATH='/bitrix/templates/motorus2'
var price_min;
var price_max;
var data = {
    'data': [],
    'total': 0,
    'perPage': 10
}
function loadScript(url, callback) {
    // adding the script tag to the head as suggested before
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;

    // then bind the event to the callback function
    // there are several events for cross browser compatibility
    script.onreadystatechange = callback;
    script.onload = callback;

    // fire the loading
    head.appendChild(script);
}

var search_name_timeout = 0;

function filter_by_text(params){
    param_count = params.length;
    for (param_index=0; param_index < param_count; param_index++){
        param = params[param_index];
        name = param['name'];
        value = param['value'];
        if (value) {
            OpenAjax.hub.publish('AddParam', {type:'text', 'name':name, 'value':value});
        } else {
            OpenAjax.hub.publish('DeleteParam', {type:'text', 'name':name, 'value':value});
        }
    }
}

function recompare(){
    $('.compare-form a').each(function(){
        var attr = $(this).attr('item_id');
        if(attr!==undefined){
            var el = $('.c_'+attr);
            if(el.length>0){
                el.addClass('comparison-select');
                el.find('a.controls-comparison').hide();
                el.find('a.controls-comparison-delete').css('display','inline');
            }
        }
    })
}

function copyArr(data){
    var arr =[];
    for(var i in data){
        if(data[i]){
           arr.push(data[i]) 
        }
    }
    return arr;
}

function reset_slider($slider){
    var min = $slider.attr("data-min");
    var max = $slider.attr("data-max");
    var prop_name = $slider.parent().find(".left").attr("name");
    var prop_id = prop_name.match(/arrFilter_pf\[([^\]]+)\].*/)[1];
    if (prop_id == "0") {
        min=price_min;
        max=price_max;
        $slider.attr("data-min", min);
        $slider.attr("data-max", max);
        $slider.slider({
                min:min, 
                max:max,
                values:[min, max]
            });
        $input_min = $slider.parent().find(".min-range input");
        $input_min.val(min);
        $input_max = $slider.parent().find(".max-range input");
        $input_max.val(max);

    } else {
        $slider.slider("option", "values", [min, max]);
        $input_min = $slider.parent().find(".min-range input");
        $input_min.val(min);
        $input_max = $slider.parent().find(".max-range input");
        $input_max.val(max);
    }
}

function setup_renderer() {
    var href = $('.catalog-section-list .section-item.selected ul').not(".regular-links");
    if(href.length>0){
        href.delegate('a','click',function(e){
            e.preventDefault()
            window.Singletone.newData = jQuery.extend(true, {}, data);
            var $this = $(this);
            OpenAjax.hub.publish('Clear');
            window.location.hash = $this.attr('href').replace(/^.*#/,'#');
            OpenAjax.hub.publish('RenderHref',{hash:$this.attr('href').replace(/^.*#/,'#')})
        })
    }

    window.Singletone = {}
    window.Singletone.Index = 0;
    window.Singletone.template = item_template;
    window.Singletone.newData = jQuery.extend(true, {}, data);
    window.Singletone.filter = {
        checkbox:{},
        text:{},
        slider:{},
        count:0
    }

    $(".slider-range").each(function(element_index, element){
        reset_slider($(element));
    });

    OpenAjax.hub.subscribe('Clear',function(){
        window.Singletone.filter = {
            checkbox:{count:0},
            slider:{},
            count:0
        }
        $('.slider-range-container').each(function(){
            var $this = $(this);
            var val =  $this.find('.min-range input').attr('data-range').split('|')
            $this.find('.slider-range').slider({ values: val })
            $this.find('.min-range input').val(val[0])
            $this.find('.max-range input').val(val[1])
        });
        $('form[name="arrFilter_form"] input[type="checkbox"]').attr('checked',false);
        var wrap = $('.transform-checkbox-wrapper a');
        if(wrap.length>0){
            wrap.removeClass('transform-checked');
        }
    })

    $.Controller("Catalog", {
        init:function () {
            OpenAjax.hub.subscribe('Catalog:render', function (e, data) {
                Singletone.newData.data = quickSort(Singletone.newData.data, 'PRICE')
                this.render();
            }, this);
//                OpenAjax.hub.publish('Catalog:render');
        },
        render:function () {
            var c = $('.filter-choose');
            if (c.length) {
                var count = window.Singletone.Index + parseInt(window.Singletone.newData.perPage);
                if (count > window.Singletone.newData.total) {
                    count = window.Singletone.newData.total;
                }
                c.html(count + ' из ' + window.Singletone.newData.total);
            }

            var w = new $.EJS({text:window.Singletone.template}).render(Singletone.newData);
            
            $('.catalog-list').html(w);
            $(".filter .caption .num span").text(Singletone.newData.total + " из " + data.total);
            recompare();
        },

        '.catalog-pagination click':function (el, ev) {
            ev.preventDefault()
            var c = $('.filter-choose');
            if (c.length) {
                var count = window.Singletone.Index + parseInt(window.Singletone.newData.perPage);
                if (count > window.Singletone.newData.total) {
                    count = window.Singletone.newData.total;
                }
                c.html(count + ' из ' + window.Singletone.newData.total);
            }
            $('.catalog-list .catalog-pagination').remove();
            //$('.catalog-list .float-clear').remove();
            $('.catalog-list').append(new $.EJS({text:window.Singletone.template}).render(Singletone.newData));
            recompare();
        }
    });

    $.Controller("Filter", {
        init:function () {

        },
        'input[type="checkbox"] change':function (el, ev) {
            if (el.is(':checked')) {
                OpenAjax.hub.publish('AddParam', {type:'checkbox', 'name':el.attr('name'), 'value':el.val()});
            } else {
                OpenAjax.hub.publish('DeleteParam', {type:'checkbox', 'name':el.attr('name'), 'value':el.val()});
            }
        },
        '.hot-search>input[type="text"] change':function (el, ev) {
            if (el.val()) {
                OpenAjax.hub.publish('AddParam', {type:'text', 'name':el.attr('name'), 'value':el.val()});
            } else {
                OpenAjax.hub.publish('DeleteParam', {type:'text', 'name':el.attr('name'), 'value':el.val()});
            }
        }
    })

    $.Class('MapReduce', {
        init:function () {
            OpenAjax.hub.subscribe('AddParam', function (ev, data) {
                this.addParam(data);
            }, this);
            OpenAjax.hub.subscribe('DeleteParam', function (ev, data) {
                this.removeParam(data);
            }, this);
            OpenAjax.hub.subscribe('UpdateParam', function (ev, data) {
                if (typeof data != 'object' && !data['name'] && !data['values']) {
                    return;
                }

                if (data['type'] == 'slider') {
                    this.updateSlider(data['name'], data['values']);
                }
            }, this);
        },
        updateSlider:function (name, values) {
            if (!Singletone.filter.slider[name]) {
                Singletone.filter.slider[name] = [];
                Singletone.filter.count = Singletone.filter.count + 1;
            }
            Singletone.filter.slider[name] = [values[0], values[1]];
            this.reFilter();
        },
        removeParam:function (data) {
            if (typeof data != 'object' || !data['name']) {
                return;
            }

            if (data['type'] == 'checkbox') {
                this.removeCheckbox(data['name'], data['value']);
            }
            
            if (data['type'] == 'text') {
                
                this.removeText(data['name'], data['value']);
            }                
        },
        addParam:function (data) {

            if (typeof data != 'object' || !data['name'] || !data['value']) {
                return;
            }

            if (data['type'] == 'checkbox') {
                this.addCheckbox(data['name'], data['value']);
            }
            if (data['type'] == 'text') {
                this.addText(data['name'], data['value']);
            }
            
        },
        addCheckbox:function (name, val) {
            name = name.replace(/^([^\[]*)/, '').replace(/\[/g, '').replace(/\]/g, '');
            if (!Singletone.filter.checkbox[name]) {
                Singletone.filter.checkbox[name] = {};
                Singletone.filter.checkbox[name]['count'] = 0;
            }
            if(Singletone.filter.checkbox[name][val]){
                return;
            }

            Singletone.Index = 0;
            Singletone.filter.count = Singletone.filter.count + 1;

            Singletone.filter.checkbox[name]['count'] = Singletone.filter.checkbox[name]['count'] + 1;
            Singletone.filter.checkbox[name][val] = true;
            this.reFilter();
            return;
        },
        addText:function (name, val) {
            if (!Singletone.filter.text[name]) {
                Singletone.filter.text[name] = {};
            }

            Singletone.filter.text[name] = val
            this.reFilter();
            return;
        },
        removeCheckbox:function (name, val) {
            name = name.replace(/^([^\[]*)/, '').replace(/\[/g, '').replace(/\]/g, '');
            window.Singletone.Index = 0;
            /**
             * Если не осталось фильтров перезаписываем структуру
             */
            Singletone.filter.count = Singletone.filter.count - 1;
            if (Singletone.filter.count <= 0) {
                Singletone.filter.count = 0;
                Singletone.filter.slider = {};
                Singletone.filter.checkbox = {};
                Singletone.newData = jQuery.extend(true, {}, data);
                OpenAjax.hub.publish('Catalog:render');
                return;
            }
            /**
             * Если в группе не осталось группы чекбоксов пробегаемся переинициализируем фильтры
             */
            Singletone.filter.checkbox[name]['count'] = Singletone.filter.checkbox[name]['count'] - 1;
            if (Singletone.filter.checkbox[name]['count'] <= 0) {
                delete Singletone.filter.checkbox[name];
                this.reFilter();
                return;
            }
            Singletone.filter.checkbox[name][val] = false;
            delete Singletone.filter.checkbox[name][val];
            /**
             * Удаляем эелементы на которые не выставлен чекбокс
             */
            for (var i in Singletone.newData['data']) {
                if (!Singletone.newData['data'][i][name]) {
                    continue;
                }
                if (Singletone.newData['data'][i][name] == val) {
                    delete Singletone.newData['data'][i];
                    Singletone.newData['total'] = Singletone.newData['total'] - 1;
                }
            }

            var j = 0;
            /**
             * Восстанавливаем структуру ID
             */
            var tmpObj = copyArr(Singletone.newData['data']);
            Singletone.newData['data'] = []
            Singletone.newData['data'] = copyArr(tmpObj)

            OpenAjax.hub.publish('Catalog:render');
        },
        removeText:function (name, val) {
            new_text = {}
            for (param_name in Singletone.filter.text){
                if (param_name != name){
                    new_text[param_name] = Singletone.filter.text[param_name];
                }
            }
            Singletone.filter.text[name] = val
            this.reFilter();
            return;
        },            
        reFilter:function () {
            function empty(o) {
                for (var i in o)
                    if (o.hasOwnProperty(i))
                        return false;

                return true;
            }

            window.Singletone.Index = 0;
            var total = 0;
            var new2Data = copyArr( data.data);
            var newData = [];
            var filteredGroup = [];
            var i;
            var j;
            var count = 0;
            
            function getSliderFilter(data, name, values) {
                var newData = [];
                var q = 0;
                for (var i in data) {
                    if (!data[i][name]) {
                        continue;
                    }
                    if (parseInt(data[i][name]) >= values[0] && parseInt(data[i][name]) <= values[1]) {
                        newData[q] = data[i];
                        q++;
                    }
                }
                Singletone.newData.total = q;
                return newData;
            }

            if (!empty(Singletone.filter.slider)) {
                for (i in Singletone.filter.slider) {
//                        count++;
                    new2Data = getSliderFilter(new2Data, i, Singletone.filter.slider[i]);
                }
            }
            if (!empty(Singletone.filter.text)) {
                data_new = [];
                for (element_index in new2Data){
                    data_element = new2Data[element_index];
                    for (name in Singletone.filter.text) {
                        if (name in data_element) {
                            value = Singletone.filter.text[name];
                            search_subject = data_element[name].toLowerCase();
                            pattern = value.toLowerCase();
                            if (data_element && (name in data_element) && (search_subject.search(pattern) >= 0)){
                                data_new.push(data_element);
                                break;
                            }
                        }
                    }
                }
                new2Data = data_new
            }
            if (!empty(Singletone.filter.checkbox)) {
                var filGroups = {}


                for (i in Singletone.filter.checkbox) {
					if (i == 'count') {
						continue;
					}					
                    filteredGroup = i;
                    break;
                }

                filGroups[filteredGroup] = true;
                var q = 0;
                var dataName;
                for (dataName in new2Data) {
                    for (i in Singletone.filter.checkbox[filteredGroup]) {
                        if (i == 'count') {
                            continue;
                        }
                        if (!new2Data[dataName][filteredGroup]) {
                            continue;

                        }
                        if (new2Data[dataName][filteredGroup] != i) {
                            continue;
                        }
                        if (!new2Data[dataName]["PRICE"]){
                            continue;
                        }
                        newData[q] = new2Data[dataName];
                        q++;
                    }
                }
                total = q;
                q = 0;
                var z = 0;

                function filter(data, name) {
                    var newData = []
                    var q = 0;
                    for (dataName in data) {
                        for (var j in Singletone.filter.checkbox[name]) {
                            if (j == 'count') {
                                continue;
                            }
                            if (!data[dataName][i]) {
                                continue;
                            }
                            if (data[dataName][i] != j) {
                                continue;
                            }
                            newData[q] = data[dataName];
                            q++;
                        }
                    }
                    total = q;
                    return newData

                }

                for (i in Singletone.filter.checkbox) {
                    if (filGroups[i]) {
                        continue;
                    }
                    if(i=='count'){
                        continue;
                    }
                    newData = filter(newData, i);
                    filGroups[i] = true;
                }

                if (z == 0) {
                    q = total;
                }

                Singletone.newData.data = newData;
                Singletone.newData.total = q;
            } else {
                Singletone.newData.data = new2Data;
            }
            new2Data = null;
            newData = null;
            filteredGroup = null;
            i = null;
            j = null;
            OpenAjax.hub.publish('Catalog:render');
        }
    });

    $.Class('HashTag', {
        init:function () {
            OpenAjax.hub.subscribe('UpdateParam', function (ev, data) {
                if (typeof data != 'object' && !data['name'] && !data['values']) {
                    return;
                }
                if(data['no-hash']){
                    return;
                }
                if (data['type'] == 'slider') {
                    this.addHashTag(data);
                }
            }, this);

            this.rawHash = window.location.hash;
            OpenAjax.hub.subscribe('AddParam', function (ev, data) {
                if(data['no-hash']){
                    return;
                }
                if (data['nohash']) {
                    return;
                }
                this.addHashTag(data);
            }, this);
            OpenAjax.hub.subscribe('DeleteParam', function (ev, data) {
                this.removeHashTag(data);
            }, this);
        },
        addHashTag:function (data) {
            if (typeof data != 'object' || !data['name']) {
                return;
            }

            var tag = window.location.hash;
            var resultStr = '';
            if (data['type'] == 'checkbox') {
                resultStr = encodeURI('ch_' + data['name'].replace(/^([^\[]*)/, '').replace(/\[/g, '').replace(/\]/g, '') + '=' + data['value']);
            }
            if (data['type'] == 'slider') {
                resultStr = encodeURI('sl_' + data['name'] + '=');
            }
            if (!this.hasHashTag()) {
                if (data['type'] == 'checkbox') {
                    window.location.hash = '#!/' + resultStr;
                }
                if (data['type'] == 'slider') {
                    window.location.hash = '#!/' + encodeURI(decodeURI(resultStr) + data['values'].join('+++'))
                }
                return;
            }

            tag = tag.replace(/^#!\//, '');

            var hashArray = tag.split('|');
            var length = hashArray.length;
            var bool = true;
            var updated = false;
            for (var i = length - 1; i >= 0; i--) {
                if (data['type'] == 'checkbox' && hashArray[i].match(/^ch_/)) {
                    if (encodeURI(hashArray[i]).indexOf(resultStr) == 0) {
                        bool = false;
                        updated = true;
                        break;
                    }
                }
                if (data['type'] == 'slider' && hashArray[i].match(/^sl_/)) {
                    if (encodeURI(hashArray[i]).indexOf(resultStr) == 0) {
                        updated=true;
                        hashArray[i] = encodeURI(decodeURI(resultStr) + data['values'].join('+++'))
                        break;
                    }
                }
            }
            if(!updated && data['type'] == 'slider'){
                hashArray.push(encodeURI(decodeURI(resultStr) + data['values'].join('+++')));
            }

            if(!updated && data['type'] == 'checkbox'){
                hashArray.push(resultStr);
            }
            if (bool) {
                tag = hashArray.join('|');
                window.location.hash = '#!/' + tag;
            }
        },
        removeHashTag:function (data) {
            if (typeof data != 'object' || !data['name'] || !data['value']) {
                return;
            }

            var tag = window.location.hash;
            var resultStr = '';
            if (data['type'] == 'checkbox') {
                resultStr = encodeURI('ch_' + data['name'].replace(/^([^\[]*)/, '').replace(/\[/g, '').replace(/\]/g, '') + '=' + data['value']);
            }
            if (!this.hasHashTag()) {
                window.location.hash = '#!/' + resultStr;
                return;
            }

            tag = tag.replace(/^#!\//, '');

            var hashArray = tag.split('|');
            var length = hashArray.length;
            for (var i = length - 1; i >= 0; i--) {
                if (data['type'] == 'checkbox' && hashArray[i].match(/^ch_/)) {
                    if(hashArray[i].indexOf('%')>=0){
                        if (hashArray[i].indexOf(resultStr) == 0) {
                            hashArray.splice(i, 1);
                        }
                    } else {
                        if (encodeURI(hashArray[i]).indexOf(resultStr) == 0) {
                            hashArray.splice(i, 1);
                        }
                    }


                }
            }
            var result = hashArray.join('|');
            if (result) {
                window.location.hash = '#!/' + hashArray.join('|');
            } else {
                window.location.hash = '#no-filter'
            }

        },
        hasHashTag:function (tag) {
            if(!tag){
                this.rawHash = window.location.hash
            } else {
                this.rawHash = tag;
            }

            if (!this.rawHash) {
                return false;
            }
            if (!this.rawHash.match(/^#!\//)) {
                return false;
            }
            if (this.rawHash.replace(/^#!\//, '') == "") {
                return false;
            }
            return true;

        },
        update:function () {

        },
        parse:function (tag) {
            var tag = tag.hash;
            if (!this.hasHashTag(tag)) {
                $(".slider-range").each(function(element_index, element){
                    $slider = $(element);
                });

                OpenAjax.hub.publish('Catalog:render')
                return;
            }
            var sliders_set = [];

            tag = tag.replace(/^#!\//, '');
            var hashArray = tag.split('|');
            var length = hashArray.length;
            var data = '';
            $('input').attr('checked',false);
            if($('input').siblings('a').length>0){
                $('input').siblings('a').removeClass('transform-checked');
            }
            
            for (var i = length - 1; i >= 0; i--) {
                if (hashArray[i].match(/^ch_/)) {
                    data = decodeURI(hashArray[i]).replace(/^ch_/, '').split('=');
                    var input = $('input[name=' + '"arrFilter_pf[' + data[0] + '][]"' + '][value="' + data[1] + '"]');
                    input.attr('checked',true);
                    if(input.siblings('a').length>0){
                        input.siblings('a').addClass('transform-checked');
                    }
                    OpenAjax.hub.publish('AddParam', {type:'checkbox',name:"arrFilter_pf[" + data[0] + "][]",value:data[1],'no-hash':true});
                }
                if (hashArray[i].match(/^sl_/)) {
                    data = decodeURI(hashArray[i]).replace(/^sl_/, '').split('=');
                    if(!data[1]){
                        continue;
                    }
                    var node = $('.slider-range-container input[name="arrFilter_pf['+data[0]+'][LEFT]"]');
                    if(node.length==0){
                        continue;
                    }
                    node = node.parent();
                    var value = data[1].split('+++')
                    $slider = node.find('.slider-range');
                    $slider.slider({ values: value });
                    sliders_set.push($slider);
                    node.find('.min-range input').val(value[0]);
                    node.find('.max-range input').val(value[1]);

                    OpenAjax.hub.publish('UpdateParam', {type:'slider',name:data[0],values:value,'no-hash':true});
                }
            }
            $(".slider-range").each(function(element_index, element){
                $slider = $(element);
            });
        }
    })
    
    $('.filter .search').html(
            '<form action="" onsubmit="return false;">'+
                '<input type="text" class="text" name="NAME" placeholder="Наименование или артикул"/>'+
            '</form>');
    $('.filter .search input').keyup(function (event) {
        name = $(this).attr("name");
        value = $(this).val();
        clearTimeout(search_name_timeout);
        search_name_timeout = setTimeout(function(){ filter_by_text([{'name':name, 'value':value}, {'name':'CML2_ARTICLE', 'value':value}]); }, 1000);
    });
    var catalog = new Catalog('.catalog-list');
//            catalog.destroy();
    var filter = new Filter('.filter-form');
    var mapReduce = new MapReduce();
    var hashTag = new HashTag();
    hashTag.parse({hash:window.location.hash});
    OpenAjax.hub.subscribe('RenderHref',function(ev,data){
        hashTag.parse(data);
    })
}

$(function(){
    if (!catalog_template) {
        catalog_template = "catalog_item.html"
    }
    $.getJSON("ajax", function(json_data){
        data.data = json_data;
        data.total = json_data.length;
        $.get(SITE_TEMPLATE_PATH + "/jstmpl/"+catalog_template, function(template_data){
            item_template = template_data;
            price_min = null;
            price_max = 0;
            for (var element_index in data.data) {
                var element = data.data[element_index];
                var price = parseFloat(element.PRICE);
                if ((price < price_min) || (price_min == null)) {
                    price_min = price;
                }
                if (price > price_max) {
                    price_max = price;
                }
            }
            setup_renderer();
        });
    });
});



