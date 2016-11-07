
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
;
; /* Start:/bitrix/templates/.default/components/bitrix/forum.topic.reviews/.default/script.js*/
;(function(window){
	window.FTRList = function (params) {
		this.id = 'FTRList' + params.form.id;
		this.mess = {};
		this.form = params.form;
		if (!!params["id"]) {
			for (var ii = 0; ii < params["id"].length; ii++) {
				this.bind(params["id"][ii]);
			}
		}
		this.params = {
			preorder: (params.preorder == "Y"),
			pageNumber: params.pageNumber,
			pageCount: params.pageCount
		};
		BX.addCustomEvent(this.form, 'onAdd', BX.delegate(this.add, this));
		BX.addCustomEvent(this.form, 'onRequest', BX.delegate(function () {
			if (typeof this.params.pageNumber != 'undefined') {
				var pageNumberInput = BX.findChild(this.form, {attr: {name: 'pageNumber'}});
				if (!pageNumberInput) {
					pageNumberInput = BX.create("input", {props: {type: "hidden", name: 'pageNumber'}});
					this.form.appendChild(pageNumberInput);
				}
				pageNumberInput.value = this.params.pageNumber;
			}
			if (typeof this.params.pageCount != 'undefined') {
				var pageCountInput = BX.findChild(this.form, {attr: {name: 'pageCount'}});
				if (!pageCountInput) {
					pageCountInput = BX.create("input", {props: {type: "hidden", name: 'pageCount'}});
					this.form.appendChild(pageCountInput);
				}
				pageCountInput.value = this.params.pageCount;
			}
		}, this));
		BX.addCustomEvent(this.form, 'onResponse', BX.delegate(function () {
			var input_pageno = BX.findChild(this.form, { 'attr': { 'name': 'pageNumber' }}, true);
			if (input_pageno) {
				BX.remove(input_pageno);
			}
		}, this));
	};
	window.FTRList.prototype = {
		add : function(id, result)
		{
			var
				container = BX(this.form.id + 'container'),
				listform,
				post = {className: /reviews-reply-form|reviews-collapse/},
				msgNode = window.fTextToNode(result.message);
			if (! container)
			{
				container = BX.create('div', {
					'attrs' : {
						'id' : this.form.id + 'container'},
					'props': {
						'className': 'reviews-block-container reviews-reviews-block-container'},
					'children': [
						BX.create('div', {
							'props': {
								'className': 'reviews-block-outer'
							},
							'children': [
								BX.create('div', {
									'props': {
										'className': 'reviews-block-inner'
									}
								})
							]
						})
					]
				});
				window.fReplaceOrInsertNode(container, null, BX.findChild(document, post, true).parentNode, post);
				container = BX(this.form.id + 'container');
			}
			listform = (container ? BX.findChild(container, {className: 'reviews-block-inner'}, true) : null);
			if (msgNode && listform)
			{
				if (!!result["allMessages"])
				{
					window.fReplaceOrInsertNode(msgNode, listform, BX.findChild(document, post, true).parentNode, post);

					if (!!result.navigation && !!result.pageNumber)
					{
						var navDIV = window.fTextToNode(result.navigation), i,
							navPlaceholders = (navDIV ? BX.findChildren(container.parentNode, { className : 'reviews-navigation-box' } , true) : null);
						if (navDIV)
						{
							if (!navPlaceholders) // then add ...
							{
								container.parentNode.insertBefore(BX.create('div', {props:{className:"reviews-navigation-box reviews-navigation-top"}}), container);
								var tmpDiv = container;
								// bottom
								do {
									tmpDiv = tmpDiv.nextSibling;
								} while (tmpDiv && tmpDiv.nodeType != 1);
								var bottomPager = BX.create('div', {props:{className:"reviews-navigation-box reviews-navigation-bottom"}});
								if (tmpDiv)
									container.parentNode.insertBefore( bottomPager , tmpDiv);
								else
									container.parentNode.appendChild(bottomPager);

								navPlaceholders = BX.findChildren(container.parentNode, { className : 'reviews-navigation-box' } , true);
							}
							for (i = 0; i < navPlaceholders.length; i++)
								navPlaceholders[i].innerHTML = navDIV.innerHTML;
						}

						this.params.pageNumber = result.pageNumber;
						this.params.pageCount = result.pageCount;
					}
					if (result["messagesID"] && typeof result["messagesID"] == "object")
					{
						for (var ii = 0; ii < result["messagesID"].length; ii++)
						{
							if (result["messagesID"][ii] != id)
								this.bind(result["messagesID"][ii]);
						}
					}
				}
				else if (typeof result.message != 'undefined')
				{
					if (this.params.preorder)
						listform.appendChild(msgNode);
					else
						listform.insertBefore(msgNode, listform.firstChild);
				}
				window.fRunScripts(result.message);
				this.bind(id);
			}
		},
		bind : function(id)
		{
			var node = BX('message' + id);
			if (!!node)
			{
				this.mess['m' + id] = {
					node : node,
					author : {
						id : node.getAttribute("bx-author-id"),
						name : node.getAttribute("bx-author-name")
					}
				};

				var buttons = BX.findChildren(node, {tagName : "A", className : "reviews-button-small"}, true),
					func = BX.delegate(function() { var res = BX.proxy_context; this.act(res.getAttribute("bx-act"), id); }, this),
					func2 = BX.delegate(function(){ this.act('reply', id); }, this),
					func3 = BX.delegate(function(){ this.act('quote', id); }, this);
				if (!!buttons && buttons.length > 0)
				{
					for (var ii = 0; ii < buttons.length; ii++)
					{
						if (buttons[ii].getAttribute("bx-act") == "moderate" || buttons[ii].getAttribute("bx-act") == "del")
						{
							BX.adjust(buttons[ii],
								{
									events : { click : func },
									attrs : {
										"bx-href" : buttons[ii].getAttribute("href"),
										href : "javascript:void(0);"
									}
								}
							);
						}
						else if (!!this.form)
						{
							if (buttons[ii].getAttribute("bx-act") == "reply")
							{
								BX.bind(buttons[ii], 'click', func2);
							}
							else if (buttons[ii].getAttribute("bx-act") == "quote")
							{
								BX.bind(buttons[ii], 'mousedown', func3);
							}
						}
					}
				}
			}
		},
		act : function(act, id)
		{
			if (!id || !this.mess['m' + id]) {
				BX.DoNothing();
			}
			else if (act == 'quote') {
				var selection = window.GetSelection();
				if (document["getSelection"])
				{
					selection = selection.replace(/\r\n\r\n/gi, "_newstringhere_").replace(/\r\n/gi, " ");
					selection = selection.replace(/  /gi, "").replace(/_newstringhere_/gi, "\r\n\r\n");
				}

				if (selection === "" && id > 0 && BX('message_text_' + id, true))
				{
					var message = BX('message_text_' + id, true);
					if (typeof(message) == "object" && message)
						selection = message.innerHTML;
				}

				selection = selection.replace(/[\n|\r]*<br(\s)*(\/)*>/gi, "\n");

				// Video
				var videoWMV = function(str, p1)
				{
					var result = ' ';
					var rWmv = /showWMVPlayer.*?bx_wmv_player.*?file:[\s'"]*([^"']*).*?width:[\s'"]*([^"']*).*?height:[\s'"]*([^'"]*).*?/gi;
					var res = rWmv.exec(p1);
					if (res)
						result = "[VIDEO WIDTH="+res[2]+" HEIGHT="+res[3]+"]"+res[1]+"[/VIDEO]";
					if (result == ' ')
					{
						var rFlv = /bxPlayerOnload[\s\S]*?[\s'"]*file[\s'"]*:[\s'"]*([^"']*)[\s\S]*?[\s'"]*height[\s'"]*:[\s'"]*([^"']*)[\s\S]*?[\s'"]*width[\s'"]*:[\s'"]*([^"']*)/gi;
						res = rFlv.exec(p1);
						if (res)
							result = "[VIDEO WIDTH="+res[3]+" HEIGHT="+res[2]+"]"+res[1]+"[/VIDEO]";
					}
					return result;
				}

				selection = selection.replace(/<script[^>]*>/gi, '\001').replace(/<\/script[^>]*>/gi, '\002');
				selection = selection.replace(/\001([^\002]*)\002/gi, videoWMV)
				selection = selection.replace(/<noscript[^>]*>/gi, '\003').replace(/<\/noscript[^>]*>/gi, '\004');
				selection = selection.replace(/\003([^\004]*)\004/gi, " ");

				// Quote & Code & Table
				selection = selection.replace(/<table class\=[\"]*forum-quote[\"]*>[^<]*<thead>[^<]*<tr>[^<]*<th>([^<]+)<\/th><\/tr><\/thead>[^<]*<tbody>[^<]*<tr>[^<]*<td>/gi, "\001");
				selection = selection.replace(/<table class\=[\"]*forum-code[\"]*>[^<]*<thead>[^<]*<tr>[^<]*<th>([^<]+)<\/th><\/tr><\/thead>[^<]*<tbody>[^<]*<tr>[^<]*<td>/gi, "\002");
				selection = selection.replace(/<table class\=[\"]*data-table[\"]*>[^<]*<tbody>/gi, "\004");
				selection = selection.replace(/<\/td>[^<]*<\/tr>(<\/tbody>)*<\/table>/gi, "\003");
				selection = selection.replace(/[\r|\n]{2,}([\001|\002])/gi, "\n$1");

				var ii = 0;
				while(ii++ < 50 && (selection.search(/\002([^\002\003]*)\003/gi) >= 0 || selection.search(/\001([^\001\003]*)\003/gi) >= 0))
				{
					selection = selection.replace(/\002([^\002\003]*)\003/gi, "[CODE]$1[/CODE]").replace(/\001([^\001\003]*)\003/gi, "[QUOTE]$1[/QUOTE]");
				}

				var regexReplaceTableTag = function(s, tag, replacement)
				{
					var re_match = new RegExp("\004([^\004\003]*)("+tag+")([^\004\003]*)\003", "i");
					var re_replace = new RegExp("((?:\004)(?:[^\004\003]*))("+tag+")((?:[^\004\003]*)(?:\003))", "i");
					var ij = 0;
					while((ij++ < 300) && (s.search(re_match) >= 0))
						s = s.replace(re_replace, "$1"+replacement+"$3");
					return s;
				}

				ii = 0;
				while(ii++ < 10 && (selection.search(/\004([^\004\003]*)\003/gi) >= 0))
				{
					selection = regexReplaceTableTag(selection, "<tr>", "[TR]");
					selection = regexReplaceTableTag(selection, "<\/tr>", "[/TR]");
					selection = regexReplaceTableTag(selection, "<td>", "[TD]");
					selection = regexReplaceTableTag(selection, "<\/td>", "[/TD]");
					selection = selection.replace(/\004([^\004\003]*)\003/gi, "[TABLE]$1[/TD][/TR][/TABLE]");
				}

				// Smiles
				if (BX.browser.IsIE())
					selection = selection.replace(/<img(?:(?:\s+alt\s*=\s*\"?smile([^\"\s]+)\"?)|(?:\s+\w+\s*=\s*[^\s>]*))*>/gi, "$1");
				else
					selection = selection.replace(/<img.*?alt=[\"]*smile([^\"\s]+)[\"]*[^>]*>/gi, "$1");

				// Hrefs
				selection = selection.replace(/<a[^>]+href=[\"]([^\"]+)\"[^>]+>([^<]+)<\/a>/gi, "[URL=$1]$2[/URL]");
				selection = selection.replace(/<a[^>]+href=[\']([^\']+)\'[^>]+>([^<]+)<\/a>/gi, "[URL=$1]$2[/URL]");
				selection = selection.replace(/<[^>]+>/gi, " ").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, "\"");

				selection = selection.replace(/(smile(?=[:;8]))/g, "");

				selection = selection.replace(/\&shy;/gi, "");
				selection = selection.replace(/\&nbsp;/gi, " ");
				BX.onCustomEvent(this.form, 'onQuote', [{author : this.mess['m' + id]["author"], id : id, text : selection}]);
			}
			else if (act == 'reply') {
				BX.onCustomEvent(this.form, 'onReply', [{author : this.mess['m' + id]["author"], id : id}]);
			}
			else if (act == 'del' && (!confirm(BX.message('f_cdm')))) {
				BX.DoNothing();
			}
			else if (act == 'moderate' || act == 'del') {
				var
					link = BX.proxy_context,
					href = link.getAttribute("bx-href").replace(/.AJAX_CALL=Y/g,'').replace(/.sessid=[^&]*/g, ''),
					tbl = BX.findParent(link, {'tag' : 'table'}),
					note = BX.create('a', {attrs: { className : 'reply-action-note'}}),
					replyActionDone = function() {
						BX.remove(note);
						BX.show(link.parentNode);
					};

				BX.hide(link.parentNode);
				note.innerHTML = BX.message('f_wait');
				link.parentNode.parentNode.appendChild(note);
				BX.ajax.loadJSON(href,
					{AJAX_CALL : "Y", sessid : BX.bitrix_sessid()},
					BX.delegate(function(res) {
						if (res.status && !!tbl) {
							BX.onCustomEvent(window, 'onForumCommentAJAXAction', [act]);
							if (act == 'del') {
								var curpage = window["curpage"] || top.window.location.href;
								BX.fx.hide(tbl, 'scroll', {time: 0.15, callback_complete: BX.delegate(function() {
									BX.remove(tbl);
									replyActionDone();
									var reviews = BX.findChild(BX(this.form.id + 'container'), {'class': 'reviews-post-table'}, true, true);
									if ((!reviews) || (reviews.length < 1))
										if (this.params.pageNumber > 1)
											BX.reload(curpage);
								}, this)});
							} else {
								var bHidden = BX.hasClass(tbl, 'reviews-post-hidden');
								var label = (bHidden ? BX.message('f_hide') : BX.message('f_show'));
								var tbldiv = BX.findChild(tbl, { className : 'reviews-text'}, true);
								BX.fx.hide(tbldiv, 'fade', {time: 0.1, callback_complete: function() {
									BX.toggleClass(tbl, 'reviews-post-hidden');
									link.innerHTML = label;
									href = href.replace(new RegExp('REVIEW_ACTION='+(bHidden ? 'SHOW' : 'HIDE')), ('REVIEW_ACTION='+(bHidden ? 'HIDE' : 'SHOW')));
									link.setAttribute('bx-href', href);
									BX.fx.show(tbldiv, 'fade', {time: 0.1});
									replyActionDone();
									BX.style(tbldiv, 'background-color', (bHidden ? '#FFFFFF' : '#E5F8E3')); // IE9
								}});
							}
						} else {
							BX.addClass(note, 'error');
							note.innerHTML = '<span class="errortext">'+res.message+'</span>';
						}
					}, this)
				);
			}
			return false;
		}
	};

	window.FTRForm = function(params) {
		this.id = 'FTRForm' + params.form.id;
		this.form = params.form;
		this.editorName = params.editorName;
		this.editorId = params.editorId;
		this.editor = window[params.editorName];
		this.windowEvents = {};
		if (!this.editor)
		{
			this.windowEvents.LHE_OnInit = BX.delegate(function(pEditor) { if (pEditor.id == this.editorId) { this.addParsers(pEditor); this.editor = pEditor; } }, this);
			this.windowEvents.LHE_ConstructorInited = BX.delegate(function(pEditor) { if (pEditor.id == this.editorId) { if (!this.editor) { this.addParsers(pEditor); this.editor = pEditor; } this.editor.ucInited = true; } }, this);
			BX.addCustomEvent(window, 'LHE_OnInit', this.windowEvents.LHE_OnInit);
			BX.addCustomEvent(window, 'LHE_ConstructorInited', this.windowEvents.LHE_ConstructorInited);
		} else {
			this.addParsers(this.editor);
		}
		this.params = {
			messageMax : 64000
		};

		BX.addCustomEvent(this.form, 'onQuote', BX.delegate(function(params){this.show(); this.paste(params, 'QUOTE');}, this));
		BX.addCustomEvent(this.form, 'onReply', BX.delegate(function(params){this.show(); this.paste(params, 'REPLY');}, this));
	};
	window.FTRForm.prototype = {
		addParsers : function(pEditor)
		{
			pEditor.AddParser(
				{
					name: 'postuser',
					obj: {
						Parse: function(sName, sContent, pLEditor)
						{
							sContent = sContent.replace(/\[USER\s*=\s*(\d+)\]((?:\s|\S)*?)\[\/USER\]/ig, function(str, id, name)
							{
								id = parseInt(id);
								name = BX.util.trim(name);

								return '<span id="' + pLEditor.SetBxTag(false, {tag: "postuser", params: {value : id}}) +
									'" style="color: #2067B0; border-bottom: 1px dashed #2067B0;">' + name + '</span>';
							});
							return sContent;
						},
						UnParse: function(bxTag, pNode, pLEditor)
						{
							if (bxTag.tag == 'postuser')
							{
								var name = '';
								for (var i = 0; i < pNode.arNodes.length; i++)
									name += pLEditor._RecursiveGetHTML(pNode.arNodes[i]);
								name = BX.util.trim(name);
								return "[USER=" + bxTag.params.value + "]" + name +"[/USER]";
							}
							return "";
						}
					}
				}
			);
		},
		validate : function(ajax_post)
		{
			var form = this.form,
				errors = "",
				MessageLength = form.REVIEW_TEXT.value.length;
			if (form['BXFormSubmit_save'])
				return true; // ValidateForm may be run by BX.submit one more time

			if (form.TITLE && (form.TITLE.value.length < 2))
				errors += BX.message('no_topic_name');

			if (MessageLength < 2)
				errors += BX.message('no_message');
			else if ((this.params.messageMax !== 0) && (MessageLength > this.params.messageMax))
				errors += BX.message('max_len').replace(/\#MAX_LENGTH\#/gi, this.params.messageMax).replace(/\#LENGTH\#/gi, MessageLength);

			if (errors !== "")
			{
				alert(errors);
				return false;
			}

			var btnSubmit = BX.findChild(form, {'attribute':{'name':'send_button'}}, true);
			if (btnSubmit) { btnSubmit.disabled = true; }
			var btnPreview = BX.findChild(form, {'attribute':{'name':'view_button'}}, true);
			if (btnPreview) { btnPreview.disabled = true; }

			if (ajax_post == 'Y')
			{
				BX.onCustomEvent(window, 'onBeforeForumCommentAJAXPost', [form]);
				BX.onCustomEvent(this.form, 'onRequest', [this, ajax_post]);

				setTimeout(BX.delegate(function() { BX.ajax.submit(form, BX.delegate(this.get, this)); }, this), 50);
				return false;
			}
			return true;
		},
		get : function()
		{
			this.form['BXFormSubmit_save'] = null;
			var result = window.forumAjaxPostTmp;
			window["curpage"] = window["curpage"] || top.window.location.href;

			BX.onCustomEvent(window, 'onForumCommentAJAXPost', [result, this.form]);

			if (typeof result == 'undefined' || result.reload)
			{
				BX.reload(window["curpage"]);
				return;
			}

			if (result["status"])
			{
				if (!!result["allMessages"] || typeof result["message"] != 'undefined')
				{
					BX.onCustomEvent(this.form, 'onAdd', [result["messageID"], result]);
					this.clear();
				}
				else if (!!result["previewMessage"])
				{
					var previewDIV = BX.findChild(document, {'className': 'reviews-preview'}, true),
						previewParent = BX.findChild(document, {className : /reviews-reply-form|reviews-collapse/}, true).parentNode,
						previewNode = window.fTextToNode(result["previewMessage"]);
					window.fReplaceOrInsertNode(previewNode, previewDIV, previewParent, {'className' : /reviews-reply-form|reviews-collapse/});

					window.PostFormAjaxStatus('');
					window.fRunScripts(result["previewMessage"]);
				}
				var message = (!!result["messageID"] ? BX('message'+result["messageID"]) : null);
				if (message) {
					BX.scrollToNode(message);
				}
			}

			var arr = this.form.getElementsByTagName("input");
			for (var i=0; i < arr.length; i++)
			{
				var butt = arr[i];
				if (butt.getAttribute("type") == "submit")
					butt.disabled = false;
			}

			if (result["statusMessage"])
				window.PostFormAjaxStatus(result["statusMessage"]);

			BX.onCustomEvent(this.form, 'onResponse', [result, this.form]);
			BX.onCustomEvent(window, 'onAfterForumCommentAJAXPost', [result, this.form]);
		},
		clear : function()
		{
			this.editor.ReInit('');

			if (this.editor.fAutosave)
				BX.bind(this.editor.pEditorDocument, 'keydown',
					BX.proxy(this.editor.fAutosave.Init, this.editor.fAutosave));
			if (!BX.type.isDomNode(this.form)) return;
			var previewDIV = BX.findChild(document, {'className' : 'reviews-preview'}, true);
			if (previewDIV)
				BX.remove(previewDIV);

			var i = 0, fileDIV, fileINPUT, fileINPUT1;
			while ((fileDIV = BX('upload_files_'+(i++)+'_' + this.form.index.value)) && !!fileDIV)
			{
				if ((fileINPUT = BX.findChild(fileDIV, {'tag':'input'})) && !!fileINPUT1)
				{
					fileINPUT1 = BX.clone(fileINPUT);
					fileINPUT1.value = '';
					fileINPUT.parentNode.insertBefore(fileINPUT1, fileINPUT);
					fileINPUT.parentNode.removeChild(fileINPUT);
				}
				BX.hide(fileDIV);
			}
			var attachLink = BX.findChild(this.form, {'className':"forum-upload-file-attach"}, true);
			if (attachLink)
				BX.show(attachLink);
			var attachNote = BX.findChild(this.form, {'className':"reviews-upload-info"}, true);
			if (attachNote)
				BX.hide(attachNote);

			var captchaIMAGE = null,
				captchaHIDDEN = BX.findChild(this.form, {attr : {'name': 'captcha_code'}}, true),
				captchaINPUT = BX.findChild(this.form, {attr: {'name':'captcha_word'}}, true),
				captchaDIV = BX.findChild(this.form, {'className':'reviews-reply-field-captcha-image'}, true);
			if (captchaDIV)
				captchaIMAGE = BX.findChild(captchaDIV, {'tag':'img'});
			if (captchaHIDDEN && captchaINPUT && captchaIMAGE)
			{
				captchaINPUT.value = '';
				BX.ajax.getCaptcha(function(result) {
					captchaHIDDEN.value = result["captcha_sid"];
					captchaIMAGE.src = '/bitrix/tools/captcha.php?captcha_code='+result["captcha_sid"];
				});
			}
		},
		show : function()
		{
			BX.onCustomEvent(this.form, 'onBeforeShow', [this]);
			BX.show(this.form.parentNode);
			BX.scrollToNode(BX.findChild(this.form, {'attribute': { 'name' : 'send_button' }}, true));
			setTimeout(BX.delegate(function() {
				this.editor.SetFocus();
				BX.defer(this.editor.SetFocus, this.editor)();
			}, this), 100);
			BX.onCustomEvent(this.form, 'onAfterShow', [this]);
			return false;
		},
		hide : function()
		{
			BX.onCustomEvent(this.form, 'onBeforeHide', [this]);
			BX.hide(this.form.parentNode);
			BX.onCustomEvent(this.form, 'onAfterHide', [this]);
			return false;
		},
		transverse : function()
		{
			if (this.form.parentNode.style.display == 'none')
				this.show();
			else
				this.hide();
			return false;
		},
		paste : function(params, tag)
		{
			BX.onCustomEvent(this.form, 'onPaste', [params, tag, this]);
			var author = (!!params["author"] ? params["author"] : ''),
				text = (!!params["text"] ? params["text"] : ''),
				id = (!!params["id"] ? params["id"] : '');

			if (!author)
				author = '';
			else if (this.editor.sEditorMode == 'code' && this.editor.bBBCode) { // BB Codes
				if (author.id > 0)
					author = "[USER=" + author.id + "]" + author.name + "[/USER]";
				else
					author = author.name;
			} else if (this.editor.sEditorMode == 'html') { // WYSIWYG
				author.name = author.name.replace(/</gi, '&lt;').replace(/>/gi, '&gt;');
				if (author.id > 0)
					author = '<span id="' + this.editor.SetBxTag(false, {'tag': "postuser", 'params': {'value' : author.id}}) +
						'" style="color: #2067B0; border-bottom: 1px dashed #2067B0;">' + author.name + '</span>';
				else
					author = '<span>' + author.name + '</span>';
			}

			if (tag == "QUOTE")
			{
				if (this.editor.sEditorMode == 'code' && this.editor.bBBCode) { // BB Codes
					this.editor.WrapWith("[QUOTE" + (id > 0 ? (" ID=" + id) : "") + "]", "[/QUOTE]",
						(author !== '' ? ( author + BX.message("f_author") + "\n") : '') + text);
				} else if (this.editor.sEditorMode == 'html') { // WYSIWYG
					this.editor.InsertHTML('<blockquote class="bx-quote" id="mess' + id + '">' +
						(author !== '' ? ( author + BX.message("f_author") + '<br/>') : '') +
						this.editor.ParseContent(text, true) + "</blockquote><br/>");
				}
			}
			else
			{
				text = (!!author ? (author + ', ') : "") + this.editor.ParseContent(text, true);
				if (this.editor.sEditorMode == 'code' && this.editor.bBBCode) { // BB Codes
					this.editor.WrapWith("", "", text);
				} else if (this.editor.sEditorMode == 'html') { // WYSIWYG
					this.editor.InsertHTML(text);
				}
			}
			this.editor.SetFocus();
			BX.defer(this.editor.SetFocus, this.editor)();
		}
	};
	BX.ready(function() {
		if (BX.browser.IsIE())
		{
			var posts = BX.findChildren(document, {'className':'reviews-post-table'}, true), ii, all, i;
			if (!posts) return;
			for (ii = 0; ii < posts.length; ii++) {
				all = posts[ii].getElementsByTagName('*');
				i = all.length;
				while (i--) {
					if (all[i].scrollWidth > all[i].offsetWidth) {
						all[i].style['paddingBottom'] = '20px';
						all[i].style['overflowY'] = 'hidden';
					}
				}
			}
		}
	});

	window.fTextToNode = function(text)
	{
		var tmpdiv = BX.create('div');
		tmpdiv.innerHTML = text;
		if (tmpdiv.childNodes.length > 0)
			return tmpdiv;
		else
			return null;
	};

	window.PostFormAjaxStatus = function(status)
	{
		var arNote = BX.findChild(document, { className : 'reviews-note-box'} , true, true), i;
		if (arNote)
			for (i = 0; i <= arNote.length; i++)
				BX.remove(arNote[i]);

		var msgBox = BX.findChild(document, { className : 'reviews-block-container' } , true);
		if (!msgBox) return;

		if (status.length < 1) return;

		var statusDIV = window.fTextToNode(status);
		if (!statusDIV) return;

		var beforeDivs = ['reviews-reply-form', 'reviews-collapse'];
		var tmp = msgBox;
		while ((tmp = tmp.nextSibling) && !!tmp)
		{
			if (tmp.nodeType == 1)
			{
				var insert = false;
				for (i = 0; i < beforeDivs.length; i++)
				{
					if (BX.hasClass(tmp, beforeDivs[i]))
					{
						insert = true;
						break;
					}
				}
				if (insert)
				{
					tmp.parentNode.insertBefore(statusDIV, tmp);
					break;
				}
			}
		}
	};

	window.SetReviewsAjaxPostTmp = function(text)
	{
		window.forumAjaxPostTmp = text;
	};

	window.fReplaceOrInsertNode = function(sourceNode, targetNode, parentTargetNode, beforeTargetNode)
	{
		var nextNode = null;

		if (!BX.type.isDomNode(parentTargetNode)) return false;

		if (!BX.type.isDomNode(sourceNode) && !BX.type.isArray(sourceNode) && sourceNode.length > 0)
			if (! (sourceNode = window.fTextToNode(sourceNode))) return false;

		if (BX.type.isDomNode(targetNode)) // replace
		{
			parentTargetNode = targetNode.parentNode;
			nextNode = targetNode.nextSibling;
			parentTargetNode.removeChild(targetNode);
		}

		if (!nextNode)
			nextNode = BX.findChild(parentTargetNode, beforeTargetNode, true);

		if (nextNode)
		{
			nextNode.parentNode.insertBefore(sourceNode, nextNode);
		} else {
			parentTargetNode.appendChild(sourceNode);
		}

		return true;
	};

	window.fRunScripts = function(msg)
	{
		var ob = BX.processHTML(msg, true);
		BX.ajax.processScripts(ob.SCRIPT, true);
	};

	window.ShowLastEditReason = function(checked, div)
	{
		if (div)
		{
			if (checked)
				div.style.display = 'block';
			else
				div.style.display = 'none';
		}
	};

	window.AttachFile = function(iNumber, iCount, sIndex, oObj)
	{
		var element = null;
		var bFined = false;
		iNumber = parseInt(iNumber);
		iCount = parseInt(iCount);

		document.getElementById('upload_files_info_' + sIndex).style.display = 'block';
		for (var ii = iNumber; ii < (iNumber + iCount); ii++)
		{
			element = document.getElementById('upload_files_' + ii + '_' + sIndex);
			if (!element || typeof(element) === null)
				break;
			if (element.style.display == 'none')
			{
				bFined = true;
				element.style.display = 'block';
				break;
			}
		}
		var bHide = (!bFined ? true : (ii >= (iNumber + iCount - 1)));
		if (bHide === true)
			oObj.style.display = 'none';
	};

	/**
	 * @return {string}
	 */
	window.GetSelection = function()
	{
		var range, text = '';
		if (window.getSelection) {
			range = window.getSelection();
			text = range.toString();
		} else if (document.selection) {
			range = document.selection;
			text = range.createRange().text;
		}
		return text;
	}
})(window);

/* End */
;
; /* Start:/bitrix/components/bitrix/sale.recommended.products/templates/.default/script.js*/
(function (window) {

if (!!window.JCCatalogSectionSRec)
{
	return;
}

var BasketButton = function(params)
{
	BasketButton.superclass.constructor.apply(this, arguments);
	this.nameNode = BX.create('span', {
		props : { className : 'bx_medium bx_bt_button', id : this.id },
		text: params.text
	});
	this.buttonNode = BX.create('span', {
		attrs: { className: params.ownerClass },
		style: { marginBottom: '0', borderBottom: '0 none transparent' },
		children: [this.nameNode],
		events : this.contextEvents
	});
	if (BX.browser.IsIE())
	{
		this.buttonNode.setAttribute("hideFocus", "hidefocus");
	}
};
BX.extend(BasketButton, BX.PopupWindowButton);

window.JCCatalogSectionSRec = function (arParams)
{
	this.productType = 0;
	this.showQuantity = true;
	this.showAbsent = true;
	this.secondPict = false;
	this.showOldPrice = false;
	this.showPercent = false;
	this.showSkuProps = false;
	this.visual = {
		ID: '',
		PICT_ID: '',
		SECOND_PICT_ID: '',
		QUANTITY_ID: '',
		QUANTITY_UP_ID: '',
		QUANTITY_DOWN_ID: '',
		PRICE_ID: '',
		DSC_PERC: '',
		SECOND_DSC_PERC: '',
		DISPLAY_PROP_DIV: '',
		BASKET_PROP_DIV: ''
	};
	this.product = {
		checkQuantity: false,
		maxQuantity: 0,
		stepQuantity: 1,
		isDblQuantity: false,
		canBuy: true,
		canSubscription: true,
		name: '',
		pict: {},
		id: 0,
		addUrl: '',
		buyUrl: ''
	};
	this.basketData = {
		useProps: false,
		emptyProps: false,
		quantity: 'quantity',
		props: 'prop',
		basketUrl: ''
	};

	this.defaultPict = {
		pict: null,
		secondPict: null
	};

	this.checkQuantity = false;
	this.maxQuantity = 0;
	this.stepQuantity = 1;
	this.isDblQuantity = false;
	this.canBuy = true;
	this.canSubscription = true;
	this.precision = 6;
	this.precisionFactor = Math.pow(10,this.precision);

	this.offers = [];
	this.offerNum = 0;
	this.treeProps = [];
	this.obTreeRows = [];
	this.showCount = [];
	this.showStart = [];
	this.selectedValues = {};

	this.obProduct = null;
	this.obQuantity = null;
	this.obQuantityUp = null;
	this.obQuantityDown = null;
	this.obPict = null;
	this.obSecondPict = null;
	this.obPrice = null;
	this.obTree = null;
	this.obBuyBtn = null;
	this.obDscPerc = null;
	this.obSecondDscPerc = null;
	this.obSkuProps = null;
	this.obMeasure = null;

	this.obPopupWin = null;
	this.basketUrl = '';
	this.basketParams = {};

	this.treeRowShowSize = 5;
	this.treeEnableArrow = { display: '', cursor: 'pointer', opacity: 1 };
	this.treeDisableArrow = { display: '', cursor: 'default', opacity:0.2 };

	this.lastElement = false;
	this.containerHeight = 0;

	this.errorCode = 0;

	if ('object' === typeof arParams)
	{
		this.productType = parseInt(arParams.PRODUCT_TYPE, 10);
		this.showQuantity = arParams.SHOW_QUANTITY;
		this.showAbsent = arParams.SHOW_ABSENT;
		this.secondPict = !!arParams.SECOND_PICT;
		this.showOldPrice = !!arParams.SHOW_OLD_PRICE;
		this.showPercent = !!arParams.SHOW_DISCOUNT_PERCENT;
		this.showSkuProps = !!arParams.SHOW_SKU_PROPS;

		this.visual = arParams.VISUAL;
		switch (this.productType)
		{
			case 1://product
			case 2://set
				if (!!arParams.PRODUCT && 'object' === typeof(arParams.PRODUCT))
				{
					if (this.showQuantity)
					{
						this.product.checkQuantity = arParams.PRODUCT.CHECK_QUANTITY;
						this.product.isDblQuantity = arParams.PRODUCT.QUANTITY_FLOAT;
						if (this.product.checkQuantity)
						{
							this.product.maxQuantity = (this.product.isDblQuantity ? parseFloat(arParams.PRODUCT.MAX_QUANTITY) : parseInt(arParams.PRODUCT.MAX_QUANTITY, 10));
						}
						this.product.stepQuantity = (this.product.isDblQuantity ? parseFloat(arParams.PRODUCT.STEP_QUANTITY) : parseInt(arParams.PRODUCT.STEP_QUANTITY, 10));

						this.checkQuantity = this.product.checkQuantity;
						this.isDblQuantity = this.product.isDblQuantity;
						this.maxQuantity = this.product.maxQuantity;
						this.stepQuantity = this.product.stepQuantity;
						if (this.isDblQuantity)
						{
							this.stepQuantity = Math.round(this.stepQuantity*this.precisionFactor)/this.precisionFactor;
						}
					}
					this.product.canBuy = arParams.PRODUCT.CAN_BUY;
					this.product.canSubscription = arParams.PRODUCT.SUBSCRIPTION;

					this.canBuy = this.product.canBuy;
					this.canSubscription = this.product.canSubscription;

					this.product.name = arParams.PRODUCT.NAME;
					this.product.pict = arParams.PRODUCT.PICT;
					this.product.id = arParams.PRODUCT.ID;
					if (!!arParams.PRODUCT.ADD_URL)
					{
						this.product.addUrl = arParams.PRODUCT.ADD_URL;
					}
					if (!!arParams.PRODUCT.BUY_URL)
					{
						this.product.buyUrl = arParams.PRODUCT.BUY_URL;
					}
					if (!!arParams.BASKET && 'object' === typeof(arParams.BASKET))
					{
						this.basketData.useProps = !!arParams.BASKET.ADD_PROPS;
						this.basketData.emptyProps = !!arParams.BASKET.EMPTY_PROPS;
					}
				}
				else
				{
					this.errorCode = -1;
				}
				break;
			case 3://sku
				if (!!arParams.OFFERS && BX.type.isArray(arParams.OFFERS))
				{
					if (!!arParams.PRODUCT && 'object' === typeof(arParams.PRODUCT))
					{
						this.product.name = arParams.PRODUCT.NAME;
						this.product.id = arParams.PRODUCT.ID;
					}
					this.offers = arParams.OFFERS;
					this.offerNum = 0;
					if (!!arParams.OFFER_SELECTED)
					{
						this.offerNum = parseInt(arParams.OFFER_SELECTED, 10);
					}
					if (isNaN(this.offerNum))
					{
						this.offerNum = 0;
					}
					if (!!arParams.TREE_PROPS)
					{
						this.treeProps = arParams.TREE_PROPS;
					}
					if (!!arParams.DEFAULT_PICTURE)
					{
						this.defaultPict.pict = arParams.DEFAULT_PICTURE.PICTURE;
						this.defaultPict.secondPict = arParams.DEFAULT_PICTURE.PICTURE_SECOND;
					}
				}
				else
				{
					this.errorCode = -1;
				}
				break;
			default:
				this.errorCode = -1;
		}
		if (!!arParams.BASKET && 'object' === typeof(arParams.BASKET))
		{
			if (!!arParams.BASKET.QUANTITY)
			{
				this.basketData.quantity = arParams.BASKET.QUANTITY;
			}
			if (!!arParams.BASKET.PROPS)
			{
				this.basketData.props = arParams.BASKET.PROPS;
			}
			if (!!arParams.BASKET.BASKET_URL)
			{
				this.basketData.basketUrl = arParams.BASKET.BASKET_URL;
			}
		}
		this.lastElement = (!!arParams.LAST_ELEMENT && 'Y' === arParams.LAST_ELEMENT);
	}
	if (0 === this.errorCode)
	{
		BX.ready(BX.delegate(this.Init,this));
	}
};

window.JCCatalogSectionSRec.prototype.Init = function()
{
	var i = 0,
		strPrefix = '',
		TreeItems = null;

	this.obProduct = BX(this.visual.ID);
	if (!this.obProduct)
	{
		this.errorCode = -1;
	}
	this.obPict = BX(this.visual.PICT_ID);
	if (!this.obPict)
	{
		this.errorCode = -2;
	}
	if (this.secondPict && !!this.visual.SECOND_PICT_ID)
	{
		this.obSecondPict = BX(this.visual.SECOND_PICT_ID);
	}
	this.obPrice = BX(this.visual.PRICE_ID);
	if (!this.obPrice)
	{
		this.errorCode = -16;
	}
	if (this.showQuantity && !!this.visual.QUANTITY_ID)
	{
		this.obQuantity = BX(this.visual.QUANTITY_ID);
		if (!!this.visual.QUANTITY_UP_ID)
		{
			this.obQuantityUp = BX(this.visual.QUANTITY_UP_ID);
		}
		if (!!this.visual.QUANTITY_DOWN_ID)
		{
			this.obQuantityDown = BX(this.visual.QUANTITY_DOWN_ID);
		}
	}
	if (3 === this.productType)
	{
		if (!!this.visual.TREE_ID)
		{
			this.obTree = BX(this.visual.TREE_ID);
			if (!this.obTree)
			{
				this.errorCode = -256;
			}
			strPrefix = this.visual.TREE_ITEM_ID;
			for (i = 0; i < this.treeProps.length; i++)
			{
				this.obTreeRows[i] = {
					LEFT: BX(strPrefix+this.treeProps[i].ID+'_left'),
					RIGHT: BX(strPrefix+this.treeProps[i].ID+'_right'),
					LIST: BX(strPrefix+this.treeProps[i].ID+'_list'),
					CONT: BX(strPrefix+this.treeProps[i].ID+'_cont')
				};
				if (!this.obTreeRows[i].LEFT || !this.obTreeRows[i].RIGHT || !this.obTreeRows[i].LIST || !this.obTreeRows[i].CONT)
				{
					this.errorCode = -512;
					break;
				}
			}
		}
		if (!!this.visual.QUANTITY_MEASURE)
		{
			this.obMeasure = BX(this.visual.QUANTITY_MEASURE);
		}
	}
	if (!!this.visual.BUY_ID)
	{
		this.obBuyBtn = BX(this.visual.BUY_ID);
	}

	if (this.showPercent)
	{
		if (!!this.visual.DSC_PERC)
		{
			this.obDscPerc = BX(this.visual.DSC_PERC);
		}
		if (this.secondPict && !!this.visual.SECOND_DSC_PERC)
		{
			this.obSecondDscPerc = BX(this.visual.SECOND_DSC_PERC);
		}
	}

	if (this.showSkuProps)
	{
		if (!!this.visual.DISPLAY_PROP_DIV)
		{
			this.obSkuProps = BX(this.visual.DISPLAY_PROP_DIV);
		}
	}

	if (0 === this.errorCode)
	{
		if (this.showQuantity)
		{
			if (!!this.obQuantityUp)
			{
				BX.bind(this.obQuantityUp, 'click', BX.delegate(this.QuantityUp, this));
			}
			if (!!this.obQuantityDown)
			{
				BX.bind(this.obQuantityDown, 'click', BX.delegate(this.QuantityDown, this));
			}
			if (!!this.obQuantity)
			{
				BX.bind(this.obQuantity, 'change', BX.delegate(this.QuantityChange, this));
			}
		}
		switch (this.productType)
		{
			case 1://product
				break;
			case 3://sku
				TreeItems = BX.findChildren(this.obTree, {tagName: 'li'}, true);
				if (!!TreeItems && 0 < TreeItems.length)
				{
					for (i = 0; i < TreeItems.length; i++)
					{
						BX.bind(TreeItems[i], 'click', BX.delegate(this.SelectOfferProp, this));
					}
				}
				for (i = 0; i < this.obTreeRows.length; i++)
				{
					BX.bind(this.obTreeRows[i].LEFT, 'click', BX.delegate(this.RowLeft, this));
					BX.bind(this.obTreeRows[i].RIGHT, 'click', BX.delegate(this.RowRight, this));
				}
				this.SetCurrent();
				break;
		}
		if (!!this.obBuyBtn)
		{
			BX.bind(this.obBuyBtn, 'click', BX.delegate(this.Basket, this));
		}
		if (this.lastElement)
		{
			this.containerHeight = parseInt(this.obProduct.parentNode.offsetHeight, 10);
			if (isNaN(this.containerHeight))
			{
				this.containerHeight = 0;
			}
			this.setHeight();
			BX.bind(window, 'resize', BX.delegate(this.checkHeight, this));
			BX.bind(this.obProduct.parentNode, 'mouseover', BX.delegate(this.setHeight, this));
			BX.bind(this.obProduct.parentNode, 'mouseout', BX.delegate(this.clearHeight, this));
		}
	}
};

window.JCCatalogSectionSRec.prototype.checkHeight = function()
{
	this.containerHeight = parseInt(this.obProduct.parentNode.offsetHeight, 10);
	if (isNaN(this.containerHeight))
	{
		this.containerHeight = 0;
	}
};

window.JCCatalogSectionSRec.prototype.setHeight = function()
{
	if (0 < this.containerHeight)
	{
		BX.adjust(this.obProduct.parentNode, {style: { height: this.containerHeight+'px'}});
	}
};

window.JCCatalogSectionSRec.prototype.clearHeight = function()
{
	BX.adjust(this.obProduct.parentNode, {style: { height: 'auto'}});
};

window.JCCatalogSectionSRec.prototype.QuantityUp = function()
{
	var curValue = 0,
		boolSet = true;

	if (0 === this.errorCode && this.showQuantity && this.canBuy)
	{
		curValue = (this.isDblQuantity ? parseFloat(this.obQuantity.value) : parseInt(this.obQuantity.value, 10));
		if (!isNaN(curValue))
		{
			curValue += this.stepQuantity;
			if (this.checkQuantity)
			{
				if (curValue > this.maxQuantity)
				{
					boolSet = false;
				}
			}
			if (boolSet)
			{
				if (this.isDblQuantity)
				{
					curValue = Math.round(curValue*this.precisionFactor)/this.precisionFactor;
				}
				this.obQuantity.value = curValue;
			}
		}
	}
};

window.JCCatalogSectionSRec.prototype.QuantityDown = function()
{
	var curValue = 0,
		boolSet = true;

	if (0 === this.errorCode && this.showQuantity && this.canBuy)
	{
		curValue = (this.isDblQuantity ? parseFloat(this.obQuantity.value): parseInt(this.obQuantity.value, 10));
		if (!isNaN(curValue))
		{
			curValue -= this.stepQuantity;
			if (curValue < this.stepQuantity)
			{
				boolSet = false;
			}
			if (boolSet)
			{
				if (this.isDblQuantity)
				{
					curValue = Math.round(curValue*this.precisionFactor)/this.precisionFactor;
				}
				this.obQuantity.value = curValue;
			}
		}
	}
};

window.JCCatalogSectionSRec.prototype.QuantityChange = function()
{
	var curValue = 0,
		boolSet = true;

	if (0 === this.errorCode && this.showQuantity)
	{
		if (this.canBuy)
		{
			curValue = (this.isDblQuantity ? parseFloat(this.obQuantity.value) : parseInt(this.obQuantity.value, 10));
			if (!isNaN(curValue))
			{
				if (this.checkQuantity)
				{
					if (curValue > this.maxQuantity)
					{
						boolSet = false;
						curValue = this.maxQuantity;
					}
					else if (curValue < this.stepQuantity)
					{
						boolSet = false;
						curValue = this.stepQuantity;
					}
				}
				if (!boolSet)
				{
					this.obQuantity.value = curValue;
				}
			}
			else
			{
				this.obQuantity.value = this.stepQuantity;
			}
		}
		else
		{
			this.obQuantity.value = this.stepQuantity;
		}
	}
};

window.JCCatalogSectionSRec.prototype.QuantitySet = function(index)
{
	if (0 === this.errorCode)
	{
		this.canBuy = this.offers[index].CAN_BUY;
		if (this.canBuy)
		{
			BX.addClass(this.obBuyBtn, 'bx_bt_button');
			BX.removeClass(this.obBuyBtn, 'bx_bt_button_type_2');
			this.obBuyBtn.innerHTML = BX.message('MESS_BTN_BUY');
		}
		else
		{
			BX.addClass(this.obBuyBtn, 'bx_bt_button_type_2');
			BX.removeClass(this.obBuyBtn, 'bx_bt_button');
			this.obBuyBtn.innerHTML = BX.message('MESS_NOT_AVAILABLE');
		}
		if (this.showQuantity)
		{
			this.isDblQuantity = this.offers[index].QUANTITY_FLOAT;
			this.checkQuantity = this.offers[index].CHECK_QUANTITY;
			if (this.isDblQuantity)
			{
				this.maxQuantity = parseFloat(this.offers[index].MAX_QUANTITY);
				this.stepQuantity = Math.round(parseFloat(this.offers[index].STEP_QUANTITY)*this.precisionFactor)/this.precisionFactor;
			}
			else
			{
				this.maxQuantity = parseInt(this.offers[index].MAX_QUANTITY, 10);
				this.stepQuantity = parseInt(this.offers[index].STEP_QUANTITY, 10);
			}

			this.obQuantity.value = this.stepQuantity;
			this.obQuantity.disabled = !this.canBuy;
			if (!!this.obMeasure)
			{
				if (!!this.offers[index].MEASURE)
				{
					BX.adjust(this.obMeasure, { html : this.offers[index].MEASURE});
				}
				else
				{
					BX.adjust(this.obMeasure, { html : ''});
				}
			}
		}
	}
};

window.JCCatalogSectionSRec.prototype.SelectOfferProp = function()
{
	var i = 0,
		value = '',
		strTreeValue = '',
		arTreeItem = [],
		RowItems = null,
		target = BX.proxy_context;

	if (!!target && target.hasAttribute('data-treevalue'))
	{
		strTreeValue = target.getAttribute('data-treevalue');
		arTreeItem = strTreeValue.split('_');
		if (this.SearchOfferPropIndex(arTreeItem[0], arTreeItem[1]))
		{
			RowItems = BX.findChildren(target.parentNode, {tagName: 'li'}, false);
			if (!!RowItems && 0 < RowItems.length)
			{
				for (i = 0; i < RowItems.length; i++)
				{
					value = RowItems[i].getAttribute('data-onevalue');
					if (value === arTreeItem[1])
					{
						BX.addClass(RowItems[i], 'bx_active');
					}
					else
					{
						BX.removeClass(RowItems[i], 'bx_active');
					}
				}
			}
		}
	}
};

window.JCCatalogSectionSRec.prototype.SearchOfferPropIndex = function(strPropID, strPropValue)
{
	var strName = '',
		arShowValues = false,
		i, j,
		arCanBuyValues = [],
		index = -1,
		arFilter = {},
		tmpFilter = [];

	for (i = 0; i < this.treeProps.length; i++)
	{
		if (this.treeProps[i].ID === strPropID)
		{
			index = i;
			break;
		}
	}

	if (-1 < index)
	{
		for (i = 0; i < index; i++)
		{
			strName = 'PROP_'+this.treeProps[i].ID;
			arFilter[strName] = this.selectedValues[strName];
		}
		strName = 'PROP_'+this.treeProps[index].ID;
		arShowValues = this.GetRowValues(arFilter, strName);
		if (!arShowValues)
		{
			return false;
		}
		if (!BX.util.in_array(strPropValue, arShowValues))
		{
			return false;
		}
		arFilter[strName] = strPropValue;
		for (i = index+1; i < this.treeProps.length; i++)
		{
			strName = 'PROP_'+this.treeProps[i].ID;
			arShowValues = this.GetRowValues(arFilter, strName);
			if (!arShowValues)
			{
				return false;
			}
			if (this.showAbsent)
			{
				arCanBuyValues = [];
				tmpFilter = [];
				tmpFilter = BX.clone(arFilter, true);
				for (j = 0; j < arShowValues.length; j++)
				{
					tmpFilter[strName] = arShowValues[j];
					if (this.GetCanBuy(tmpFilter))
					{
						arCanBuyValues[arCanBuyValues.length] = arShowValues[j];
					}
				}
			}
			else
			{
				arCanBuyValues = arShowValues;
			}
			if (!!this.selectedValues[strName] && BX.util.in_array(this.selectedValues[strName], arCanBuyValues))
			{
				arFilter[strName] = this.selectedValues[strName];
			}
			else
			{
				arFilter[strName] = arCanBuyValues[0];
			}
			this.UpdateRow(i, arFilter[strName], arShowValues, arCanBuyValues);
		}
		this.selectedValues = arFilter;
		this.ChangeInfo();
	}
	return true;
};

window.JCCatalogSectionSRec.prototype.RowLeft = function()
{
	var i = 0,
		strTreeValue = '',
		index = -1,
		target = BX.proxy_context;

	if (!!target && target.hasAttribute('data-treevalue'))
	{
		strTreeValue = target.getAttribute('data-treevalue');
		for (i = 0; i < this.treeProps.length; i++)
		{
			if (this.treeProps[i].ID === strTreeValue)
			{
				index = i;
				break;
			}
		}
		if (-1 < index && this.treeRowShowSize < this.showCount[index])
		{
			if (0 > this.showStart[index])
			{
				this.showStart[index]++;
				BX.adjust(this.obTreeRows[index].LIST, { style: { marginLeft: this.showStart[index]*20+'%' }});
				BX.adjust(this.obTreeRows[index].RIGHT, { style: this.treeEnableArrow });
			}

			if (0 <= this.showStart[index])
			{
				BX.adjust(this.obTreeRows[index].LEFT, { style: this.treeDisableArrow });
			}
		}
	}
};

window.JCCatalogSectionSRec.prototype.RowRight = function()
{
	var i = 0,
		strTreeValue = '',
		index = -1,
		target = BX.proxy_context;

	if (!!target && target.hasAttribute('data-treevalue'))
	{
		strTreeValue = target.getAttribute('data-treevalue');
		for (i = 0; i < this.treeProps.length; i++)
		{
			if (this.treeProps[i].ID === strTreeValue)
			{
				index = i;
				break;
			}
		}
		if (-1 < index && this.treeRowShowSize < this.showCount[index])
		{
			if ((this.treeRowShowSize - this.showStart[index]) < this.showCount[index])
			{
				this.showStart[index]--;
				BX.adjust(this.obTreeRows[index].LIST, { style: { marginLeft: this.showStart[index]*20+'%' }});
				BX.adjust(this.obTreeRows[index].LEFT, { style: this.treeEnableArrow });
			}

			if ((this.treeRowShowSize - this.showStart[index]) >= this.showCount[index])
			{
				BX.adjust(this.obTreeRows[index].RIGHT, { style: this.treeDisableArrow });
			}
		}
	}
};

window.JCCatalogSectionSRec.prototype.UpdateRow = function(intNumber, activeID, showID, canBuyID)
{
	var i = 0,
		showI = 0,
		value = '',
		countShow = 0,
		strNewLen = '',
		obData = {},
		pictMode = false,
		extShowMode = false,
		isCurrent = false,
		selectIndex = 0,
		obLeft = this.treeEnableArrow,
		obRight = this.treeEnableArrow,
		currentShowStart = 0,
		RowItems = null;

	if (-1 < intNumber && intNumber < this.obTreeRows.length)
	{
		RowItems = BX.findChildren(this.obTreeRows[intNumber].LIST, {tagName: 'li'}, false);
		if (!!RowItems && 0 < RowItems.length)
		{
			pictMode = ('PICT' === this.treeProps[intNumber].SHOW_MODE);
			countShow = showID.length;
			extShowMode = this.treeRowShowSize < countShow;
			strNewLen = (extShowMode ? (100/countShow)+'%' : '20%');
			obData = {
				props: { className: '' },
				style: {
					width: strNewLen
				}
			};
			if (pictMode)
			{
				obData.style.paddingTop = strNewLen;
			}
			for (i = 0; i < RowItems.length; i++)
			{
				value = RowItems[i].getAttribute('data-onevalue');
				isCurrent = (value === activeID);
				if (BX.util.in_array(value, canBuyID))
				{
					obData.props.className = (isCurrent ? 'bx_active' : '');
				}
				else
				{
					obData.props.className = (isCurrent ? 'bx_active bx_missing' : 'bx_missing');
				}
				obData.style.display = 'none';
				if (BX.util.in_array(value, showID))
				{
					obData.style.display = '';
					if (isCurrent)
					{
						selectIndex = showI;
					}
					showI++;
				}
				BX.adjust(RowItems[i], obData);
			}

			obData = {
				style: {
					width: (extShowMode ? 20*countShow : 100)+'%',
					marginLeft: '0%'
				}
			};
			if (pictMode)
			{
				BX.adjust(this.obTreeRows[intNumber].CONT, {props: {className: (extShowMode ? 'bx_item_detail_scu full' : 'bx_item_detail_scu')}});
			}
			else
			{
				BX.adjust(this.obTreeRows[intNumber].CONT, {props: {className: (extShowMode ? 'bx_item_detail_size full' : 'bx_item_detail_size')}});
			}
			if (extShowMode)
			{
				if (selectIndex +1 === countShow)
				{
					obRight = this.treeDisableArrow;
				}
				if (this.treeRowShowSize <= selectIndex)
				{
					currentShowStart = this.treeRowShowSize - selectIndex - 1;
					obData.style.marginLeft = currentShowStart*20+'%';
				}
				if (0 === currentShowStart)
				{
					obLeft = this.treeDisableArrow;
				}
				BX.adjust(this.obTreeRows[intNumber].LEFT, {style: obLeft });
				BX.adjust(this.obTreeRows[intNumber].RIGHT, {style: obRight });
			}
			else
			{
				BX.adjust(this.obTreeRows[intNumber].LEFT, {style: {display: 'none'}});
				BX.adjust(this.obTreeRows[intNumber].RIGHT, {style: {display: 'none'}});
			}
			BX.adjust(this.obTreeRows[intNumber].LIST, obData);
			this.showCount[intNumber] = countShow;
			this.showStart[intNumber] = currentShowStart;
		}
	}
};

window.JCCatalogSectionSRec.prototype.GetRowValues = function(arFilter, index)
{
	var i = 0,
		j,
		arValues = [],
		boolSearch = false,
		boolOneSearch = true;

	if (0 === arFilter.length)
	{
		for (i = 0; i < this.offers.length; i++)
		{
			if (!BX.util.in_array(this.offers[i].TREE[index], arValues))
			{
				arValues[arValues.length] = this.offers[i].TREE[index];
			}
		}
		boolSearch = true;
	}
	else
	{
		for (i = 0; i < this.offers.length; i++)
		{
			boolOneSearch = true;
			for (j in arFilter)
			{
				if (arFilter[j] !== this.offers[i].TREE[j])
				{
					boolOneSearch = false;
					break;
				}
			}
			if (boolOneSearch)
			{
				if (!BX.util.in_array(this.offers[i].TREE[index], arValues))
				{
					arValues[arValues.length] = this.offers[i].TREE[index];
				}
				boolSearch = true;
			}
		}
	}
	return (boolSearch ? arValues : false);
};

window.JCCatalogSectionSRec.prototype.GetCanBuy = function(arFilter)
{
	var i = 0,
		j,
		boolSearch = false,
		boolOneSearch = true;

	for (i = 0; i < this.offers.length; i++)
	{
		boolOneSearch = true;
		for (j in arFilter)
		{
			if (arFilter[j] !== this.offers[i].TREE[j])
			{
				boolOneSearch = false;
				break;
			}
		}
		if (boolOneSearch)
		{
			if (this.offers[i].CAN_BUY)
			{
				boolSearch = true;
				break;
			}
		}
	}
	return boolSearch;
};

window.JCCatalogSectionSRec.prototype.SetCurrent = function()
{
	var i = 0,
		j = 0,
		arCanBuyValues = [],
		strName = '',
		arShowValues = false,
		arFilter = {},
		tmpFilter = [],
		current = this.offers[this.offerNum].TREE;

	for (i = 0; i < this.treeProps.length; i++)
	{
		strName = 'PROP_'+this.treeProps[i].ID;
		arShowValues = this.GetRowValues(arFilter, strName);
		if (!arShowValues)
		{
			break;
		}
		if (BX.util.in_array(current[strName], arShowValues))
		{
			arFilter[strName] = current[strName];
		}
		else
		{
			arFilter[strName] = arShowValues[0];
			this.offerNum = 0;
		}
		if (this.showAbsent)
		{
			arCanBuyValues = [];
			tmpFilter = [];
			tmpFilter = BX.clone(arFilter, true);
			for (j = 0; j < arShowValues.length; j++)
			{
				tmpFilter[strName] = arShowValues[j];
				if (this.GetCanBuy(tmpFilter))
				{
					arCanBuyValues[arCanBuyValues.length] = arShowValues[j];
				}
			}
		}
		else
		{
			arCanBuyValues = arShowValues;
		}
		this.UpdateRow(i, arFilter[strName], arShowValues, arCanBuyValues);
	}
	this.selectedValues = arFilter;
	this.ChangeInfo();
};

window.JCCatalogSectionSRec.prototype.ChangeInfo = function()
{
	var i = 0,
		j,
		index = -1,
		obData = {},
		boolOneSearch = true,
		strPrice = '';

	for (i = 0; i < this.offers.length; i++)
	{
		boolOneSearch = true;
		for (j in this.selectedValues)
		{
			if (this.selectedValues[j] !== this.offers[i].TREE[j])
			{
				boolOneSearch = false;
				break;
			}
		}
		if (boolOneSearch)
		{
			index = i;
			break;
		}
	}
	if (-1 < index)
	{
		if (!!this.obPict)
		{
			if (!!this.offers[index].PREVIEW_PICTURE)
			{
				BX.adjust(this.obPict, {style: {backgroundImage: 'url('+this.offers[index].PREVIEW_PICTURE.SRC+')'}});
			}
			else
			{
				BX.adjust(this.obPict, {style: {backgroundImage: 'url('+this.defaultPict.pict.SRC+')'}});
			}
		}
		if (this.secondPict && !!this.obSecondPict)
		{
			if (!!this.offers[index].PREVIEW_PICTURE_SECOND)
			{
				BX.adjust(this.obSecondPict, {style: {backgroundImage: 'url('+this.offers[index].PREVIEW_PICTURE_SECOND.SRC+')'}});
			}
			else if (!!this.offers[index].PREVIEW_PICTURE.SRC)
			{
				BX.adjust(this.obSecondPict, {style: {backgroundImage: 'url('+this.offers[index].PREVIEW_PICTURE.SRC+')'}});
			}
			else if (!!this.defaultPict.secondPict)
			{
				BX.adjust(this.obSecondPict, {style: {backgroundImage: 'url('+this.defaultPict.secondPict.SRC+')'}});
			}
			else
			{
				BX.adjust(this.obSecondPict, {style: {backgroundImage: 'url('+this.defaultPict.pict.SRC+')'}});
			}
		}
		if (this.showSkuProps && !!this.obSkuProps)
		{
			if (0 === this.offers[index].DISPLAY_PROPERTIES.length)
			{
				BX.adjust(this.obSkuProps, {style: {display: 'none'}, html: ''});
			}
			else
			{
				BX.adjust(this.obSkuProps, {style: {display: ''}, html: this.offers[index].DISPLAY_PROPERTIES});
			}
		}
		if (!!this.obPrice)
		{
			strPrice = this.offers[index].PRICE.PRINT_DISCOUNT_VALUE;
			if (this.showOldPrice && (this.offers[index].PRICE.DISCOUNT_VALUE !== this.offers[index].PRICE.VALUE))
			{
				strPrice += ' <span>'+this.offers[index].PRICE.PRINT_VALUE+'</span>';
			}
			BX.adjust(this.obPrice, {html: strPrice});
			if (this.showPercent)
			{
				if (this.offers[index].PRICE.DISCOUNT_VALUE !== this.offers[index].PRICE.VALUE)
				{
					obData = {
						style: {
							display: ''
						},
						html: this.offers[index].PRICE.DISCOUNT_DIFF_PERCENT
					};
				}
				else
				{
					obData = {
						style: {
							display: 'none'
						},
						html: ''
					};
				}
				if (!!this.obDscPerc)
				{
					BX.adjust(this.obDscPerc, obData);
				}
				if (!!this.obSecondDscPerc)
				{
					BX.adjust(this.obSecondDscPerc, obData);
				}
			}
		}
		this.offerNum = index;
		this.QuantitySet(this.offerNum);
	}
};

window.JCCatalogSectionSRec.prototype.InitBasketUrl = function()
{
	switch (this.productType)
	{
		case 1://product
		case 2://set
			this.basketUrl = this.product.addUrl;
			break;
		case 3://sku
			this.basketUrl = this.offers[this.offerNum].ADD_URL;
			break;
	}
	this.basketParams = {
		'ajax_basket': 'Y'
	};
	if (this.showQuantity)
	{
		this.basketParams[this.basketData.quantity] = this.obQuantity.value;
	}
};

window.JCCatalogSectionSRec.prototype.FillBasketProps = function()
{
	if (!this.visual.BASKET_PROP_DIV)
	{
		return;
	}
	var
		i = 0,
		propCollection = null,
		foundValues = false,
		obBasketProps = null;

	if (this.basketData.useProps && !this.basketData.emptyProps)
	{
		if (!!this.obPopupWin && !!this.obPopupWin.contentContainer)
		{
			obBasketProps = this.obPopupWin.contentContainer;
		}
	}
	else
	{
		obBasketProps = BX(this.visual.BASKET_PROP_DIV);
	}
	if (!obBasketProps)
	{
		return;
	}
	propCollection = obBasketProps.getElementsByTagName('select');
	if (!!propCollection && !!propCollection.length)
	{
		for (i = 0; i < propCollection.length; i++)
		{
			if (!propCollection[i].disabled)
			{
				switch(propCollection[i].type.toLowerCase())
				{
					case 'select-one':
						this.basketParams[propCollection[i].name] = propCollection[i].value;
						foundValues = true;
						break;
					default:
						break;
				}
			}
		}
	}
	propCollection = obBasketProps.getElementsByTagName('input');
	if (!!propCollection && !!propCollection.length)
	{
		for (i = 0; i < propCollection.length; i++)
		{
			if (!propCollection[i].disabled)
			{
				switch(propCollection[i].type.toLowerCase())
				{
					case 'hidden':
						this.basketParams[propCollection[i].name] = propCollection[i].value;
						foundValues = true;
						break;
					case 'radio':
						if (propCollection[i].checked)
						{
							this.basketParams[propCollection[i].name] = propCollection[i].value;
							foundValues = true;
						}
						break;
					default:
						break;
				}
			}
		}
	}
	if (!foundValues)
	{
		this.basketParams[this.basketData.props] = [];
		this.basketParams[this.basketData.props][0] = 0;
	}
};

window.JCCatalogSectionSRec.prototype.SendToBasket = function()
{
	if (!this.canBuy)
	{
		return;
	}
	this.InitBasketUrl();
	this.FillBasketProps();
	BX.ajax.loadJSON(
		this.basketUrl,
		this.basketParams,
		BX.delegate(this.BasketResult, this)
	);
};

window.JCCatalogSectionSRec.prototype.Basket = function()
{
	var contentBasketProps = '';
	if (!this.canBuy)
	{
		return;
	}
	switch (this.productType)
	{
	case 1://product
	case 2://set
		if (this.basketData.useProps && !this.basketData.emptyProps)
		{
			this.InitPopupWindow();
			this.obPopupWin.setTitleBar({
				content: BX.create('div', {
					style: { marginRight: '30px', whiteSpace: 'nowrap' },
					text: BX.message('TITLE_BASKET_PROPS')
				})
			});
			if (BX(this.visual.BASKET_PROP_DIV))
			{
				contentBasketProps = BX(this.visual.BASKET_PROP_DIV).innerHTML;
			}
			this.obPopupWin.setContent(contentBasketProps);
			this.obPopupWin.setButtons([
				new BasketButton({
					ownerClass: this.obProduct.parentNode.parentNode.parentNode.className,
					text: BX.message('BTN_MESSAGE_SEND_PROPS'),
					events: {
						click: BX.delegate(this.SendToBasket, this)
					}
				})
			]);
			this.obPopupWin.show();
		}
		else
		{
			this.SendToBasket();
		}
		break;
	case 3://sku
		this.SendToBasket();
		break;
	}
};

window.JCCatalogSectionSRec.prototype.BasketResult = function(arResult)
{
	var strContent = '',
		strName = '',
		strPict = '',
		successful = true,
		buttons = [];

	if (!!this.obPopupWin)
	{
		this.obPopupWin.close();
	}
	if ('object' !== typeof arResult)
	{
		return false;
	}
	successful = ('OK' === arResult.STATUS);
	if (successful)
	{
		BX.onCustomEvent('OnBasketChange');
		strName = this.product.name;
		switch(this.productType)
		{
		case 1://
		case 2://
			strPict = this.product.pict.SRC;
			break;
		case 3:
			strPict = (!!this.offers[this.offerNum].PREVIEW_PICTURE ?
				this.offers[this.offerNum].PREVIEW_PICTURE.SRC :
				this.defaultPict.pict.SRC
			);
			break;
		}
		strContent = '<div style="width: 96%; margin: 10px 2%; text-align: center;"><img src="'+strPict+'" height="130"><p>'+strName+'</p></div>';
		buttons = [
			new BasketButton({
				ownerClass: this.obProduct.parentNode.parentNode.parentNode.className,
				text: BX.message("BTN_MESSAGE_BASKET_REDIRECT"),
				events: {
					click: BX.delegate(function(){
						location.href = (!!this.basketData.basketUrl ? this.basketData.basketUrl : BX.message('BASKET_URL'));
					}, this)
				}
			})
		];
	}
	else
	{
		strContent = (!!arResult.MESSAGE ? arResult.MESSAGE : BX.message('BASKET_UNKNOWN_ERROR'));
		buttons = [
			new BasketButton({
				ownerClass: this.obProduct.parentNode.parentNode.parentNode.className,
				text: BX.message('BTN_MESSAGE_CLOSE'),
				events: {
					click: BX.delegate(this.obPopupWin.close, this.obPopupWin)
				}
			})
		];
	}
	this.InitPopupWindow();
	this.obPopupWin.setTitleBar({
		content: BX.create('div', {
			style: { marginRight: '30px', whiteSpace: 'nowrap' },
			text: (successful ? BX.message('TITLE_SUCCESSFUL') : BX.message('TITLE_ERROR'))
		})
	});
	this.obPopupWin.setContent(strContent);
	this.obPopupWin.setButtons(buttons);
	this.obPopupWin.show();
};

window.JCCatalogSectionSRec.prototype.InitPopupWindow = function()
{
	if (!!this.obPopupWin)
	{
		return;
	}
	this.obPopupWin = BX.PopupWindowManager.create('CatalogSectionBasket_'+this.visual.ID, null, {
		autoHide: false,
		offsetLeft: 0,
		offsetTop: 0,
		overlay : true,
		closeByEsc: true,
		titleBar: true,
		closeIcon: {top: '10px', right: '10px'}
	});
};
})(window);
/* End */
;; /* /bitrix/templates/.default/components/bitrix/catalog/catalog-new/bitrix/catalog.element/.default/script.js*/
; /* /bitrix/templates/.default/components/bitrix/forum.topic.reviews/.default/script.js*/
; /* /bitrix/components/bitrix/sale.recommended.products/templates/.default/script.js*/
