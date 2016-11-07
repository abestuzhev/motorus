; /* /bitrix/js/fileman/light_editor/le_dialogs.js*/
; /* /bitrix/js/fileman/light_editor/le_controls.js*/
; /* /bitrix/js/fileman/light_editor/le_toolbarbuttons.js*/
; /* /bitrix/js/fileman/light_editor/le_core.js*/

; /* Start:/bitrix/js/fileman/light_editor/le_dialogs.js*/
window.LHEDailogs = {};

window.LHEDailogs['Anchor'] = function(pObj)
{
	return {
		title: BX.message.AnchorProps,
		innerHTML : '<table>' +
			'<tr>' +
				'<td class="lhe-dialog-label lhe-label-imp">' + BX.message.AnchorName + ':</td>' +
				'<td class="lhe-dialog-param"><input type="text" size="20" value="" id="lhed_anchor_name"></td>' +
			'</tr></table>',
		width: 300,
		OnLoad: function()
		{
			pObj.pName = BX("lhed_anchor_name");
			pObj.pLEditor.focus(pObj.pName);

			var pElement = pObj.pLEditor.GetSelectionObject();
			var value = "";
			if (pElement)
			{
				var bxTag = pObj.pLEditor.GetBxTag(pElement);
				if (bxTag.tag == "anchor" && bxTag.params.value)
				{
					value = bxTag.params.value.replace(/([\s\S]*?name\s*=\s*("|'))([\s\S]*?)(\2[\s\S]*?(?:>\s*?<\/a)?(?:\/?))?>/ig, "$3");
				}
			}
			pObj.pName.value = value;
		},
		OnSave: function()
		{
			var anchorName = pObj.pName.value.replace(/[^\w\d]/gi, '_');
			if(pObj.pSel)
			{
				if(anchorName.length > 0)
					pObj.pSel.id = anchorName;
				else
					pObj.pLEditor.executeCommand('Delete');
			}
			else if(anchorName.length > 0)
			{
				var id = pObj.pLEditor.SetBxTag(false, {tag: "anchor", params: {value : '<a name="' + anchorName + '"></a>'}});
				pObj.pLEditor.InsertHTML('<img id="' + id + '" src="' + pObj.pLEditor.oneGif + '" class="bxed-anchor" />');
			}
		}
	};
}

window.LHEDailogs['Link'] = function(pObj)
{
	var strHref = pObj.pLEditor.arConfig.bUseFileDialogs ? '<input type="text" size="26" value="" id="lhed_link_href"><input type="button" value="..." style="min-width: 20px; max-width: 40px;" onclick="window.LHED_Link_FDOpen();">' : '<input type="text" size="30" value="" id="lhed_link_href">';

	var str = '<table width="100%">' +
	'<tr>' +
		'<td class="lhe-dialog-label lhe-label-imp">' + BX.message.LinkText + ':</td>' +
		'<td class="lhe-dialog-param"><input type="text" size="30" value="" id="lhed_link_text"></td>' +
	'</tr>' +
	'<tr>' +
		'<td class="lhe-dialog-label lhe-label-imp">' + BX.message.LinkHref + ':</td>' +
		'<td class="lhe-dialog-param">' + strHref + '</td>' +
	'</tr>';

	if (!pObj.pLEditor.arConfig.bBBCode)
	{
		str +=
	'<tr>' +
		'<td class="lhe-dialog-label">' + BX.message.LinkTitle + ':</td>' +
		'<td class="lhe-dialog-param"><input type="text" size="30" value="" id="lhed_link_title"></td>' +
	'</tr>' +
	'<tr>' +
		'<td class="lhe-dialog-label">' + BX.message.LinkTarget + '</td>' +
		'<td class="lhe-dialog-param">' +
			'<select id="lhed_link_target">' +
				'<option value="">' + BX.message.LinkTarget_def + '</option>' +
				'<option value="_blank">' + BX.message.LinkTarget_blank + '</option>' +
				'<option value="_parent">' + BX.message.LinkTarget_parent + '</option>' +
				'<option value="_self">' + BX.message.LinkTarget_self + '</option>' +
				'<option value="_top">' + BX.message.LinkTarget_top + '</option>' +
			'</select>' +
		'</td>' +
	'</tr>';
	}
	str += '</table>';

	return {
		title: BX.message.LinkProps,
		innerHTML : str,
		width: 420,
		OnLoad: function()
		{
			pObj._selectionStart = pObj._selectionEnd = null;
			pObj.bNew = true;
			pObj.pText = BX("lhed_link_text");
			pObj.pHref = BX("lhed_link_href");

			pObj.pLEditor.focus(pObj.pHref);

			if (!pObj.pLEditor.bBBCode)
			{
				pObj.pTitle = BX("lhed_link_title");
				pObj.pTarget = BX("lhed_link_target");
			}

			if (pObj.pLEditor.sEditorMode == 'code' && pObj.pLEditor.bBBCode)
			{
				if (pObj.prevTextSelection)
					pObj.pText.value = pObj.prevTextSelection;

				if (pObj.pLEditor.pTextarea.selectionStart != undefined)
				{
					pObj._selectionStart = pObj.pLEditor.pTextarea.selectionStart;
					pObj._selectionEnd = pObj.pLEditor.pTextarea.selectionEnd;
				}
			}
			else // WYSIWYG
			{
				if(!pObj.pSel)
				{
					var bogusImg = pObj.pLEditor.pEditorDocument.getElementById('bx_lhe_temp_bogus_node');
					if (bogusImg)
					{
						pObj.pSel = BX.findParent(bogusImg, {tagName: 'A'});
						bogusImg.parentNode.removeChild(bogusImg);
					}
				}

				var parA = (pObj.pSel && pObj.pSel.tagName.toUpperCase() != 'A') ? BX.findParent(pObj.pSel, {tagName : 'A'}) : false;
				if (parA)
					pObj.pSel = parA;

				pObj.bNew = !pObj.pSel || pObj.pSel.tagName.toUpperCase() != 'A';

				// Select Link
				if (!pObj.bNew && !BX.browser.IsIE())
					pObj.pLEditor.oPrevRange = pObj.pLEditor.SelectElement(pObj.pSel);


				var
					selectedText = false,
					oRange = pObj.pLEditor.oPrevRange;

				// Get selected text
				if (oRange.startContainer && oRange.endContainer) // DOM Model
				{
					if (oRange.startContainer == oRange.endContainer && (oRange.endContainer.nodeType == 3 || oRange.endContainer.nodeType == 1))
						selectedText = oRange.startContainer.textContent.substring(oRange.startOffset, oRange.endOffset) || '';
				}
				else // IE
				{
					if (oRange.text == oRange.htmlText)
						selectedText = oRange.text || '';
				}

				if (pObj.pSel && pObj.pSel.tagName.toUpperCase() == 'IMG')
					selectedText = false;

				if (selectedText === false)
				{
					var textRow = BX.findParent(pObj.pText, {tagName: 'TR'});
					textRow.parentNode.removeChild(textRow);
					pObj.pText = false;
				}
				else
				{
					pObj.pText.value = selectedText || '';
				}

				if (!pObj.bNew)
				{
					var bxTag = pObj.pLEditor.GetBxTag(pObj.pSel);
					if (pObj.pText !== false)
						pObj.pText.value = pObj.pSel.innerHTML;

					if (pObj.pSel && pObj.pSel.childNodes && pObj.pSel.childNodes.length > 0)
					{
						for (var i = 0; i < pObj.pSel.childNodes.length; i++)
						{
							if (pObj.pSel.childNodes[i] && pObj.pSel.childNodes[i].nodeType != 3)
							{
								var textRow = BX.findParent(pObj.pText, {tagName: 'TR'});
								textRow.parentNode.removeChild(textRow);
								pObj.pText = false;
								break;
							}
						}
					}

					if (bxTag.tag == 'a')
					{
						pObj.pHref.value = bxTag.params.href;
						if (!pObj.pLEditor.bBBCode)
						{
							pObj.pTitle.value = bxTag.params.title || '';
							pObj.pTarget.value = bxTag.params.target || '';
						}
					}
					else
					{
						pObj.pHref.value = pObj.pSel.getAttribute('href');
						if (!pObj.pLEditor.bBBCode)
						{
							pObj.pTitle.value = pObj.pSel.getAttribute('title') || '';
							pObj.pTarget.value = pObj.pSel.getAttribute('target') || '';
						}
					}
				}
			}
		},
		OnSave: function()
		{
			var
				link,
				href = pObj.pHref.value;

			if (href.length  < 1) // Need for showing error
				return;

			if (pObj.pText && pObj.pText.value.length <=0)
				pObj.pText.value = href;

			// BB code mode
			if (pObj.pLEditor.sEditorMode == 'code' && pObj.pLEditor.bBBCode)
			{
				if (pObj._selectionStart != undefined && pObj._selectionEnd != undefined)
				{
					pObj.pLEditor.pTextarea.selectionStart = pObj._selectionStart;
					pObj.pLEditor.pTextarea.selectionEnd = pObj._selectionEnd;
				}

				var res = "";
				if (!pObj.pText || pObj.pText && pObj.pText.value == href)
					res = '[URL]' + href + '[/URL]';
				else
					res = '[URL=' + href + ']' + pObj.pText.value + '[/URL]';
				pObj.pLEditor.WrapWith("", "",  res);
			}
			else
			{
				// WYSIWYG mode
				var arlinks = [];
				if (pObj.pSel && pObj.pSel.tagName.toUpperCase() == 'A')
				{
					arlinks[0] = pObj.pSel;
				}
				else
				{
					var sRand = '#'+Math.random().toString().substring(5);
					var pDoc = pObj.pLEditor.pEditorDocument;

					if (pObj.pText !== false) // Simple case
					{
						pObj.pLEditor.InsertHTML('<a id="bx_lhe_' + sRand + '">#</a>');
						arlinks[0] = pDoc.getElementById('bx_lhe_' + sRand);
						arlinks[0].removeAttribute("id");
					}
					else
					{
						pDoc.execCommand('CreateLink', false, sRand);
						var arLinks_ = pDoc.getElementsByTagName('A');
						for(var i = 0; i < arLinks_.length; i++)
							if(arLinks_[i].getAttribute('href', 2) == sRand)
								arlinks.push(arLinks_[i]);
					}
				}

				var oTag, i, l = arlinks.length, link;
				for (i = 0;  i < l; i++)
				{
					link = arlinks[i];
					oTag = false;

					if (pObj.pSel && i == 0)
					{
						oTag = pObj.pLEditor.GetBxTag(link);
						if (oTag.tag != 'a' || !oTag.params)
							oTag = false;
					}

					if (!oTag)
						oTag = {tag: 'a', params: {}};

					oTag.params.href = href;
					if (!pObj.pLEditor.bBBCode)
					{
						oTag.params.title = pObj.pTitle.value;
						oTag.params.target = pObj.pTarget.value;
					}

					pObj.pLEditor.SetBxTag(link, oTag);
					SetAttr(link, 'href', href);
					// Add text
					if (pObj.pText !== false)
						link.innerHTML = BX.util.htmlspecialchars(pObj.pText.value);

					if (!pObj.pLEditor.bBBCode)
					{
						SetAttr(link, 'title', pObj.pTitle.value);
						SetAttr(link, 'target', pObj.pTarget.value);
					}
				}
			}
		}
	};
}

window.LHEDailogs['Image'] = function(pObj)
{
	var sText = '', i, strSrc;

	if (pObj.pLEditor.arConfig.bUseMedialib)
		strSrc = '<input type="text" size="30" value="" id="lhed_img_src"><input class="lhe-br-but" type="button" value="..." onclick="window.LHED_Img_MLOpen();">';
	else if (pObj.pLEditor.arConfig.bUseFileDialogs)
		strSrc = '<input type="text" size="30" value="" id="lhed_img_src"><input class="lhe-br-but" type="button" value="..." onclick="window.LHED_Img_FDOpen();">';
	else
		strSrc = '<input type="text" size="33" value="" id="lhed_img_src">';

	for (i = 0; i < 200; i++){sText += 'text ';}

	var str = '<table width="100%">' +
	'<tr>' +
		'<td class="lhe-dialog-label lhe-label-imp">' + BX.message.ImageSrc + ':</td>' +
		'<td class="lhe-dialog-param">' + strSrc + '</td>' +
	'</tr>';
	if (!pObj.pLEditor.arConfig.bBBCode)
	{
		str +=
	'<tr>' +
		'<td class="lhe-dialog-label">' + BX.message.ImageTitle + ':</td>' +
		'<td class="lhe-dialog-param"><input type="text" size="33" value="" id="lhed_img_title"></td>' +
	'</tr>' +
	'<tr>' +
		'<td class="lhe-dialog-label">' + BX.message.ImgAlign + ':</td>' +
		'<td class="lhe-dialog-param">' +
			'<select id="lhed_img_align">' +
				'<option value="">' + BX.message.LinkTarget_def + '</option>' +
				'<option value="top">' + BX.message.ImgAlignTop + '</option>' +
				'<option value="right">' + BX.message.ImgAlignRight + '</option>' +
				'<option value="bottom">' + BX.message.ImgAlignBottom + '</option>' +
				'<option value="left">' + BX.message.ImgAlignLeft + '</option>' +
				'<option value="middle">' + BX.message.ImgAlignMiddle + '</option>' +
			'</select>' +
		'</td>' +
	'</tr>' +
	'<tr>' +
		'<td colSpan="2" class="lhe-dialog-param"><span class="lhed-img-preview-label">' + BX.message.ImageSizing + ':</span>' +
		'<div class="lhed-img-size-cont"><input type="text" size="4" value="" id="lhed_img_width"> x <input type="text" size="4" value="" id="lhed_img_height"> <input type="checkbox" id="lhed_img_save_prop" checked><label for="lhed_img_save_prop">' + BX.message.ImageSaveProp + '</label></div></td>' +
	'</tr>';
	str +=
	'<tr>' +
		'<td colSpan="2" class="lhe-dialog-param"><span class="lhed-img-preview-label">' + BX.message.ImagePreview + ':</span>' +
			'<div class="lhed-img-preview-cont"><img id="lhed_img_preview" style="display:none" />' + sText + '</div>' +
		'</td>' +
	'</tr>';
	}
	str += '</table>';

	var PreviewOnLoad = function()
	{
		var w = parseInt(this.style.width || this.getAttribute('width') || this.offsetWidth);
		var h = parseInt(this.style.height || this.getAttribute('hright') || this.offsetHeight);
		if (!w || !h)
			return;
		pObj.iRatio = w / h; // Remember proportion
		pObj.curWidth = pObj.pWidth.value = w;
		pObj.curHeight = pObj.pHeight.value = h;
	};

	var PreviewReload = function()
	{
		var newSrc = pObj.pSrc.value;
		if (!newSrc) return;
		if (pObj.prevSrc != newSrc)
		{
			pObj.prevSrc = pObj.pPreview.src = newSrc;
			pObj.pPreview.style.display = "";
			pObj.pPreview.removeAttribute("width");
			pObj.pPreview.removeAttribute("height");
		}

		if (pObj.curWidth && pObj.curHeight)
		{
			pObj.pPreview.style.width = pObj.curWidth + 'px';
			pObj.pPreview.style.height = pObj.curHeight + 'px';
		}

		if (!pObj.pLEditor.bBBCode)
		{
			SetAttr(pObj.pPreview, 'align', pObj.pAlign.value);
			SetAttr(pObj.pPreview, 'title', pObj.pTitle.value);
		}
	};

	if (pObj.pLEditor.arConfig.bUseMedialib || pObj.pLEditor.arConfig.bUseFileDialogs)
	{
		window.LHED_Img_SetUrl = function(filename, path, site)
		{
			var url, srcInput = BX("lhed_img_src"), pTitle;

			if (typeof filename == 'object') // Using medialibrary
			{
				url = filename.src;
				if (pTitle = BX("lhed_img_title"))
					pTitle.value = filename.name;
			}
			else // Using file dialog
			{
				url = (path == '/' ? '' : path) + '/'+filename;
			}

			srcInput.value = url;
			if(srcInput.onchange)
				srcInput.onchange();

			pObj.pLEditor.focus(srcInput, true);
		};
	}

	return {
		title: BX.message.ImageProps,
		innerHTML : str,
		width: 500,
		OnLoad: function()
		{
			pObj.bNew = !pObj.pSel || pObj.pSel.tagName.toUpperCase() != 'IMG';
			pObj.bSaveProp = true;
			pObj.iRatio = 1;

			pObj.pSrc = BX("lhed_img_src");
			pObj.pLEditor.focus(pObj.pSrc);

			if (!pObj.pLEditor.bBBCode)
			{
				pObj.pPreview = BX("lhed_img_preview");
				pObj.pTitle = BX("lhed_img_title");
				pObj.pAlign = BX("lhed_img_align");
				pObj.pWidth = BX("lhed_img_width");
				pObj.pHeight = BX("lhed_img_height");
				pObj.pSaveProp = BX("lhed_img_save_prop");
				pObj.bSetInStyles = false;
				pObj.pSaveProp.onclick = function()
				{
					pObj.bSaveProp = this.checked ? true : false;
					if (pObj.bSaveProp)
						pObj.pWidth.onchange();
				};
				pObj.pWidth.onchange = function()
				{
					var w = parseInt(this.value);
					if (isNaN(w)) return;
					pObj.curWidth = pObj.pWidth.value = w;
					if (pObj.bSaveProp)
					{
						var h = Math.round(w / pObj.iRatio);
						pObj.curHeight = pObj.pHeight.value = h;
					}
					PreviewReload();
				};
				pObj.pHeight.onchange = function()
				{
					var h = parseInt(this.value);
					if (isNaN(h)) return;
					pObj.curHeight = pObj.pHeight.value = h;
					if (pObj.bSaveProp)
					{
						var w = parseInt(h * pObj.iRatio);
						pObj.curWidth = pObj.pWidth.value = w;
					}
					PreviewReload();
				};
				pObj.pAlign.onchange = pObj.pTitle.onchange = PreviewReload;
				pObj.pSrc.onchange = PreviewReload;
				pObj.pPreview.onload = PreviewOnLoad;
			}
			else if (pObj.pLEditor.sEditorMode == 'code' && pObj.pLEditor.bBBCode && pObj.pLEditor.pTextarea.selectionStart != undefined)
			{
				pObj._selectionStart = pObj.pLEditor.pTextarea.selectionStart;
				pObj._selectionEnd = pObj.pLEditor.pTextarea.selectionEnd;
			}

			if (!pObj.bNew) // Select Img
			{
				var bxTag = pObj.pLEditor.GetBxTag(pObj.pSel);
				if (bxTag.tag !== 'img')
					bxTag.params = {};

				pObj.pSrc.value = bxTag.params.src || '';
				if (!pObj.pLEditor.bBBCode)
				{
					pObj.pPreview.onload = function(){pObj.pPreview.onload = PreviewOnLoad;};
					if (pObj.pSel.style.width || pObj.pSel.style.height)
						pObj.bSetInStyles = true;
					pObj.bSetInStyles = false;

					var w = parseInt(pObj.pSel.style.width || pObj.pSel.getAttribute('width') || pObj.pSel.offsetWidth);
					var h = parseInt(pObj.pSel.style.height || pObj.pSel.getAttribute('height') || pObj.pSel.offsetHeight);
					if (w && h)
					{
						pObj.iRatio = w / h; // Remember proportion
						pObj.curWidth = pObj.pWidth.value = w;
						pObj.curHeight = pObj.pHeight.value = h;
					}
					pObj.pTitle.value = bxTag.params.title || '';
					pObj.pAlign.value = bxTag.params.align || '';
					PreviewReload();
				}
			}
		},
		OnSave: function()
		{
			var src = pObj.pSrc.value, img, oTag;

			if (src.length < 1) // Need for showing error
				return;

			// BB code mode
			if (pObj.pLEditor.sEditorMode == 'code' && pObj.pLEditor.bBBCode)
			{
				if (pObj._selectionStart != undefined && pObj._selectionEnd != undefined)
				{
					pObj.pLEditor.pTextarea.selectionStart = pObj._selectionStart;
					pObj.pLEditor.pTextarea.selectionEnd = pObj._selectionEnd;
				}
				pObj.pLEditor.WrapWith("", "",  '[IMG]' + src + '[/IMG]');
			}
			else
			{
				// WYSIWYG mode
				if (pObj.pSel)
				{
					img = pObj.pSel;
					oTag = pObj.pLEditor.GetBxTag(img);
					if (oTag.tag != 'img' || !oTag.params)
						oTag = false;
				}
				else
				{
					var tmpid = Math.random().toString().substring(4);
					pObj.pLEditor.InsertHTML('<img id="' + tmpid + '" src="" />');
					img = pObj.pLEditor.pEditorDocument.getElementById(tmpid);
					img.removeAttribute("id");
				}
				SetAttr(img, "src", src);

				if (!oTag)
					oTag = {tag: 'img', params: {}};

				oTag.params.src = src;

				if (!pObj.pLEditor.bBBCode)
				{
					if (pObj.bSetInStyles)
					{
						img.style.width = pObj.pWidth.value + 'px';
						img.style.height = pObj.pHeight.value + 'px';
						SetAttr(img, "width", '');
						SetAttr(img, "height", '');
					}
					else
					{
						SetAttr(img, "width", pObj.pWidth.value);
						SetAttr(img, "height", pObj.pHeight.value);
						img.style.width = '';
						img.style.height = '';
					}

					oTag.params.align = pObj.pAlign.value;
					oTag.params.title = pObj.pTitle.value;

					SetAttr(img, "align", pObj.pAlign.value);
					SetAttr(img, "title", pObj.pTitle.value);
				}

				pObj.pLEditor.SetBxTag(img, oTag);
			}
		}
	};
}

window.LHEDailogs['Video'] = function(pObj)
{
	var strPath;
	if (pObj.pLEditor.arConfig.bUseMedialib)
		strPath = '<input type="text" size="30" value="" id="lhed_video_path"><input class="lhe-br-but" type="button" value="..." onclick="window.LHED_Video_MLOpen();">';
	else if (pObj.pLEditor.arConfig.bUseFileDialogs)
		strPath = '<input type="text" size="30" value="" id="lhed_video_path"><input class="lhe-br-but" type="button" value="..." onclick="window.LHED_VideoPath_FDOpen();">';
	else
		strPath = '<input type="text" size="33" value="" id="lhed_video_path">';

	var strPreview = pObj.pLEditor.arConfig.bUseFileDialogs ? '<input type="text" size="30" value="" id="lhed_video_prev_path"><input type="button" value="..." style="width: 20px;" onclick="window.LHED_VideoPreview_FDOpen();">' : '<input type="text" size="33" value="" id="lhed_video_prev_path">';

	var sText = '', i;
	for (i = 0; i < 200; i++){sText += 'text ';}

	var str = '<table width="100%">' +
	'<tr>' +
		'<td class="lhe-dialog-label lhe-label-imp">' + BX.message.VideoPath + ':</td>' +
		'<td class="lhe-dialog-param">' + strPath + '</td>' +
	'</tr>';
	if (!pObj.pLEditor.arConfig.bBBCode)
	{
		str +=
	'<tr>' +
		'<td class="lhe-dialog-label">' + BX.message.VideoPreviewPath + ':</td>' +
		'<td class="lhe-dialog-param">' + strPreview + '</td>' +
	'</tr>';
	}
	str +=
	'<tr>' +
		'<td class="lhe-dialog-label lhe-label-imp">' + BX.message.ImageSizing + ':</td>' +
		'<td class="lhe-dialog-param">' +
		'<div class="lhed-img-size-cont"><input type="text" size="4" value="" id="lhed_video_width"> x <input type="text" size="4" value="" id="lhed_video_height"></div></td>' +
	'</tr>';
	if (!pObj.pLEditor.arConfig.bBBCode)
	{
		str +=
	'<tr>' +
		'<td class="lhe-dialog-label"></td>' +
		'<td class="lhe-dialog-param"><input type="checkbox" id="lhed_video_autoplay"><label for="lhed_video_autoplay">' + BX.message.VideoAutoplay + '</label></td>' +
	'</tr>' +
	'<tr>' +
		'<td class="lhe-dialog-label">' + BX.message.VideoVolume + ':</td>' +
		'<td class="lhe-dialog-param">' +
			'<select id="lhed_video_volume">' +
				'<option value="10">10</option><option value="20">20</option>' +
				'<option value="30">30</option><option value="40">40</option>' +
				'<option value="50">50</option><option value="60">60</option>' +
				'<option value="70">70</option><option value="80">80</option>' +
				'<option value="90" selected="selected">90</option><option value="100">100</option>' +
			'</select> %' +
		'</td>' +
	'</tr>';
	}

	window.LHED_Video_SetPath = function(filename, path, site)
	{
		var url, srcInput = BX("lhed_video_path");
		if (typeof filename == 'object') // Using medialibrary
			url = filename.src;
		else // Using file dialog
			url = (path == '/' ? '' : path) + '/' + filename;

		srcInput.value = url;
		if(srcInput.onchange)
			srcInput.onchange();

		pObj.pLEditor.focus(srcInput, true);
	};

	return {
		title: BX.message.VideoProps,
		innerHTML : str,
		width: 500,
		OnLoad: function()
		{
			pObj.pSel = pObj.pLEditor.GetSelectionObject();
			pObj.bNew = true;
			var bxTag = {};

			if (pObj.pSel)
				bxTag = pObj.pLEditor.GetBxTag(pObj.pSel);

			if (pObj.pSel && pObj.pSel.id)
				bxTag = pObj.pLEditor.GetBxTag(pObj.pSel.id);

			if (bxTag.tag == 'video' && bxTag.params)
				pObj.bNew = false;
			else
				pObj.pSel = false;

			pObj.pPath = BX("lhed_video_path");
			pObj.pLEditor.focus(pObj.pPath);
			pObj.pWidth = BX("lhed_video_width");
			pObj.pHeight = BX("lhed_video_height");

			if (!pObj.pLEditor.bBBCode)
			{
				pObj.pPrevPath = BX("lhed_video_prev_path");
				pObj.pVolume = BX("lhed_video_volume");
				pObj.pAutoplay = BX("lhed_video_autoplay");
			}
			else if (pObj.pLEditor.sEditorMode == 'code' && pObj.pLEditor.bBBCode && pObj.pLEditor.pTextarea.selectionStart != undefined)
			{
				pObj._selectionStart = pObj.pLEditor.pTextarea.selectionStart;
				pObj._selectionEnd = pObj.pLEditor.pTextarea.selectionEnd;
			}

			if (!pObj.bNew)
			{
				pObj.arParams = bxTag.params || {};

				var path, prPath, vol, w, h, autoplay;
				if (pObj.arParams.flashvars) //FLV
				{
					path = pObj.arParams.flashvars.file;
					w = pObj.arParams.width || '';
					h = pObj.arParams.height || '';
					prPath = pObj.arParams.flashvars.image || '';
					vol = pObj.arParams.flashvars.volume || '90';
					autoplay = pObj.arParams.flashvars.autostart || false;
				}
				else
				{
					path = pObj.arParams.JSConfig.file;
					w = pObj.arParams.JSConfig.width || '';
					h = pObj.arParams.JSConfig.height || '';
					prPath = pObj.arParams.JSConfig.image || '';
					vol = pObj.arParams.JSConfig.volume || '90';
					autoplay = pObj.arParams.JSConfig.autostart || false;
				}
				pObj.pPath.value = path;
				pObj.pWidth.value = w;
				pObj.pHeight.value = h;

				if (!pObj.pLEditor.bBBCode)
				{
					if (pObj.pPrevPath)
						pObj.pPrevPath.value = prPath;
					pObj.pVolume.value = vol;
					pObj.pAutoplay.checked = autoplay ? true : false;
				}
			}
		},
		OnSave: function()
		{
			var
				path = pObj.pPath.value,
				w = parseInt(pObj.pWidth.value) || 240,
				h = parseInt(pObj.pHeight.value) || 180,
				pVid, ext,
				arVidConf = pObj.pLEditor.arConfig.videoSettings;

			if (path.length  < 1) // Need for showing error
				return;

			if (pObj.pSel)
			{
				pVid = pObj.pSel;
			}
			else
			{
				pObj.videoId = "bx_video_" + Math.round(Math.random() * 100000);

				pObj.pLEditor.InsertHTML('<img id="' + pObj.videoId + '" src="' + pObj.pLEditor.oneGif + '" class="bxed-video" />');

				pVid = pObj.pLEditor.pEditorDocument.getElementById(pObj.videoId);
			}

			if (arVidConf.maxWidth && w && parseInt(w) > parseInt(arVidConf.maxWidth))
				w = arVidConf.maxWidth;
			if (arVidConf.maxHeight && h && parseInt(h) > parseInt(arVidConf.maxHeight))
				h = arVidConf.maxHeight;

			var oVideo = {width: w, height: h};
			if (path.indexOf('http://') != -1 || path.indexOf('.') != -1)
			{
				ext = (path.indexOf('.') != -1) ? path.substr(path.lastIndexOf('.') + 1).toLowerCase() : false;
				if (ext && (ext == 'wmv' || ext == 'wma')) // WMV
				{
					oVideo.JSConfig = {file: path};
					if (!pObj.pLEditor.bBBCode)
					{
						if (pObj.pPrevPath)
							oVideo.JSConfig.image = pObj.pPrevPath.value || '';
						oVideo.JSConfig.volume = pObj.pVolume.value;
						oVideo.JSConfig.autostart = pObj.pAutoplay.checked ? true : false;
						oVideo.JSConfig.width = w;
						oVideo.JSConfig.height = h;
					}
				}
				else
				{
					oVideo.flashvars= {file: path};
					if (!pObj.pLEditor.bBBCode)
					{
						if (pObj.pPrevPath)
							oVideo.flashvars.image = pObj.pPrevPath.value || '';
						oVideo.flashvars.volume = pObj.pVolume.value;
						oVideo.flashvars.autostart = pObj.pAutoplay.checked ? true : false;
					}
				}

				pVid.title= BX.message.Video + ': ' + path;
				pVid.style.width = w + 'px';
				pVid.style.height = h + 'px';
				if (pObj.pPrevPath && pObj.pPrevPath.value.length > 0)
					pVid.style.backgroundImage = 'url(' + pObj.pPrevPath.value + ')';

				oVideo.id = pObj.videoId;
				pVid.id = pObj.pLEditor.SetBxTag(false, {tag: 'video', params: oVideo});
			}
			else
			{
				pObj.pLEditor.InsertHTML('');
			}
		}
	};
}

// Table
window.LHEDailogs['Table'] = function(pObj)
{
	return {
		title: BX.message.InsertTable,
		innerHTML : '<table>' +
			'<tr>' +
				'<td class="lhe-dialog-label lhe-label-imp"><label for="' + pObj.pLEditor.id + 'lhed_table_cols">' + BX.message.TableCols + ':</label></td>' +
				'<td class="lhe-dialog-param"><input type="text" size="4" value="3" id="' + pObj.pLEditor.id + 'lhed_table_cols"></td>' +
				'<td class="lhe-dialog-label lhe-label-imp"><label for="' + pObj.pLEditor.id + 'lhed_table_rows">' + BX.message.TableRows + ':</label></td>' +
				'<td class="lhe-dialog-param"><input type="text" size="4" value="3" id="' + pObj.pLEditor.id + 'lhed_table_rows"></td>' +
			'</tr>' +
			'<tr>' +
				'<td colSpan="4">' +
					'<span>' + BX.message.TableModel + ': </span>' +
					'<div class="lhed-model-cont" id="' + pObj.pLEditor.id + 'lhed_table_model" ><div>' +
				'</td>' +
			'</tr></table>',
		width: 350,
		OnLoad: function(oDialog)
		{
			pObj.pCols = BX(pObj.pLEditor.id + "lhed_table_cols");
			pObj.pRows = BX(pObj.pLEditor.id + "lhed_table_rows");
			pObj.pModelDiv = BX(pObj.pLEditor.id + "lhed_table_model");

			pObj.pLEditor.focus(pObj.pCols, true);

			if (pObj.pLEditor.sEditorMode == 'code' && pObj.pLEditor.bBBCode && pObj.pLEditor.pTextarea.selectionStart != undefined)
			{
				pObj._selectionStart = pObj.pLEditor.pTextarea.selectionStart;
				pObj._selectionEnd = pObj.pLEditor.pTextarea.selectionEnd;
			}

			var BuildModel = function()
			{
				BX.cleanNode(pObj.pModelDiv);
				var
					rows = parseInt(pObj.pRows.value),
					cells = parseInt(pObj.pCols.value);

				if (rows > 0 && cells > 0)
				{
					var tbl = pObj.pModelDiv.appendChild(BX.create("TABLE", {props: {className: "lhe-table-model"}}));
					var i, j, row, cell;
					for(i = 0; i < rows; i++)
					{
						row = tbl.insertRow(-1);
						for(j = 0; j < cells; j++)
							row.insertCell(-1).innerHTML = "&nbsp;";
					}
				}
			};

			pObj.pCols.onkeyup = pObj.pRows.onkeyup = BuildModel;
			BuildModel();
		},
		OnSave: function()
		{
			var
				rows = parseInt(pObj.pRows.value),
				cells = parseInt(pObj.pCols.value),
				t1 = "<", t2 = ">", res = "", cellHTML = "<br _moz_editor_bogus_node=\"on\" />";

			if (pObj.pLEditor.sEditorMode == 'code' && pObj.pLEditor.bBBCode)
			{
				t1 = "[";
				t2 = "]";
				cellHTML = " ";
			}

			if (rows > 0 && cells > 0)
			{
				res = "\n" + t1 + "TABLE" + t2 + "\n";

				var i, j;
				for(i = 0; i < rows; i++)
				{
					res += "\t" + t1 + "TR" + t2 + "\n";
					for(j = 0; j < cells; j++)
						res += "\t\t" + t1 + "TD" + t2 + cellHTML + t1 + "/TD" + t2 + "\n";
					res += "\t" + t1 + "/TR" + t2 + "\n";
				}

				res += t1 + "/TABLE" + t2 + "\n";
			}

			if (pObj.pLEditor.sEditorMode == 'code' && pObj.pLEditor.bBBCode)
			{
				if (pObj._selectionStart != undefined && pObj._selectionEnd != undefined)
				{
					pObj.pLEditor.pTextarea.selectionStart = pObj._selectionStart;
					pObj.pLEditor.pTextarea.selectionEnd = pObj._selectionEnd;
				}
				pObj.pLEditor.WrapWith("", "", res);
			}
			else if (pObj.pLEditor.sEditorMode == 'code' && !pObj.pLEditor.bBBCode)
			{
				// ?
			}
			else // WYSIWYG
			{
				pObj.pLEditor.InsertHTML(res + "</br>");
			}
		}
	};
}

// Ordered and unordered lists for BBCodes
window.LHEDailogs['List'] = function(pObj)
{
	return {
		title: pObj.arParams.bOrdered ? BX.message.OrderedList : BX.message.UnorderedList,
		innerHTML : '<table class="lhe-dialog-list-table"><tr>' +
				'<td>' + BX.message.ListItems + ':</td>' +
			'</tr><tr>' +
				'<td class="lhe-dialog-list-items"><div id="' + pObj.pLEditor.id + 'lhed_list_items"></div></td>' +
			'</tr><tr>' +
				'<td align="right"><a href="javascript:void(0);" title="' + BX.message.AddLITitle + '" id="' + pObj.pLEditor.id + 'lhed_list_more">' + BX.message.AddLI + '</a>' +
			'</tr><table>',
		width: 350,
		OnLoad: function(oDialog)
		{
			if (pObj.pLEditor.sEditorMode == 'code' && pObj.pLEditor.bBBCode && pObj.pLEditor.pTextarea.selectionStart != undefined)
			{
				pObj._selectionStart = pObj.pLEditor.pTextarea.selectionStart;
				pObj._selectionEnd = pObj.pLEditor.pTextarea.selectionEnd;
			}

			pObj.pItemsCont = BX(pObj.pLEditor.id + "lhed_list_items");
			pObj.pMore = BX(pObj.pLEditor.id + "lhed_list_more");

			BX.cleanNode(pObj.pItemsCont);
			pObj.pList = pObj.pItemsCont.appendChild(BX.create(pObj.arParams.bOrdered ? "OL" : "UL"));

			var firstItemText = "";
			if (pObj.prevTextSelection)
				firstItemText = pObj.prevTextSelection;

			var addItem = function(val, pPrev, bFocus, bCheck)
			{
				var pLi = BX.create("LI");
				var pInput = pLi.appendChild(BX.create("INPUT", {props: {type: 'text', value: val || "", size: 35}}));

				if (pPrev && pPrev.nextSibling)
					pObj.pList.insertBefore(pLi, pPrev.nextSibling);
				else
					pObj.pList.appendChild(pLi);

				pInput.onkeyup = function(e)
				{
					if (!e)
						e = window.event;

					if (e.keyCode == 13) // Enter
					{
						addItem("", this.parentNode, true, true);
						return BX.PreventDefault(e);
					}
				}

				pLi.appendChild(BX.create("IMG", {props: {src: pObj.pLEditor.oneGif, className: "lhe-dialog-list-del", title: BX.message.DelListItem}})).onclick = function()
				{
					// del list item
					var pLi = BX.findParent(this, {tagName: 'LI'});
					if (pLi)
						pLi.parentNode.removeChild(pLi);
				};

				if(bFocus !== false)
					pObj.pLEditor.focus(pInput);

				if (bCheck === true)
				{
					var arInp = pObj.pList.getElementsByTagName("INPUT"), i, l = arInp.length;
					for (i = 0; i < l; i++)
						arInp[i].onfocus = (i == l - 1) ? function(){addItem("", false, false, true);} : null;
				}
			};

			addItem(firstItemText, false, firstItemText == "");
			addItem("", false, firstItemText != "");
			addItem("", false, false, true);

			pObj.pMore.onclick = function(){addItem("", false, true, true);};
		},
		OnSave: function()
		{
			var
				res = "",
				arInputs = pObj.pList.getElementsByTagName("INPUT"),
				i, l = arInputs.length;

			if (l == 0)
				return;

			res = "\n[LIST";
			if (pObj.arParams.bOrdered)
				res += "=1";
			res += "]\n";

			var i, j;
			for (i = 0; i < l; i++)
			{
				if (arInputs[i].value != "" || i == 0)
					res += "[*]" + arInputs[i].value + "\n";
			}
			res += "[/LIST]" + "\n";

			if (pObj._selectionStart != undefined && pObj._selectionEnd != undefined)
			{
				pObj.pLEditor.pTextarea.selectionStart = pObj._selectionStart;
				pObj.pLEditor.pTextarea.selectionEnd = pObj._selectionEnd;
			}
			pObj.pLEditor.WrapWith("", "", res);
		}
	};
}



/* End */
;
; /* Start:/bitrix/js/fileman/light_editor/le_controls.js*/
function LHEButton(oBut, pLEditor)
{
	if (!oBut.name)
		oBut.name = oBut.id;

	if (!oBut.title)
		oBut.title = oBut.name;
	this.disabled = false;

	this.pLEditor = pLEditor;

	this.oBut = oBut;
	if (this.oBut && typeof this.oBut.OnBeforeCreate == 'function')
		this.oBut = this.oBut.OnBeforeCreate(this.pLEditor, this.oBut);

	if(this.oBut)
		this.Create();
}


LHEButton.prototype = {
	Create: function ()
	{
		var _this = this;
		this.pCont = BX.create("DIV", {props: {className: 'lhe-button-cont'}});

		this.pWnd = this.pCont.appendChild(BX.create("IMG", {props: {src: this.oBut.src || this.pLEditor.oneGif, title: this.oBut.title, className: "lhe-button lhe-button-normal", id: "lhe_btn_" + this.oBut.id.toLowerCase()}}));

		if (this.oBut.disableOnCodeView)
			BX.addCustomEvent(this.pLEditor, "OnChangeView", BX.proxy(this.OnChangeView, this));

		if (this.oBut.width)
		{
			this.pCont.style.width = parseInt(this.oBut.width) + 5 + "px";
			this.pWnd.style.width = parseInt(this.oBut.width) + "px";
		}

		this.pWnd.onmouseover = function(e){_this.OnMouseOver(e, this)};
		this.pWnd.onmouseout = function(e){_this.OnMouseOut(e, this)};
		this.pWnd.onmousedown = function(e){_this.OnClick(e, this);};
	},

	OnMouseOver: function (e, pEl)
	{
		if(this.disabled)
			return;
		pEl.className = 'lhe-button lhe-button-over';
	},

	OnMouseOut: function (e, pEl)
	{
		if(this.disabled)
			return;

		if(this.checked)
			pEl.className = 'lhe-button lhe-button-checked';
		else
			pEl.className = 'lhe-button lhe-button-normal';
	},

	OnClick: function (e, pEl)
	{
		if(this.disabled)
			return false;

		var res = false;
		if (this.pLEditor.sEditorMode == 'code' && this.pLEditor.bBBCode && typeof this.oBut.bbHandler == 'function')
		{
			res = this.oBut.bbHandler(this) !== false;
		}
		else
		{
			if(typeof this.oBut.handler == 'function')
				res = this.oBut.handler(this) !== false;

			if(this.pLEditor.sEditorMode != 'code' && !res && this.oBut.cmd)
				res = this.pLEditor.executeCommand(this.oBut.cmd);

			this.pLEditor.SetFocus();
			BX.defer(this.pLEditor.SetFocus, this.pLEditor)();
		}

		return res;
	},

	Check: function (bFlag)
	{
		if(bFlag == this.checked || this.disabled)
			return;

		this.checked = bFlag;
		if(this.checked)
			BX.addClass(this.pWnd, 'lhe-button-checked');
		else
			BX.removeClass(this.pWnd, 'lhe-button-checked');
	},

	Disable: function (bFlag)
	{
		if(bFlag == this.disabled)
			return false;
		this.disabled = bFlag;
		if(bFlag)
			BX.addClass(this.pWnd, 'lhe-button-disabled');
		else
			BX.removeClass(this.pWnd, 'lhe-button-disabled');
	},

	OnChangeView: function()
	{
		if (this.oBut.disableOnCodeView)
			this.Disable(this.pLEditor.sEditorMode == 'code');
	}
}

// Dialog
function LHEDialog(arParams, pLEditor)
{
	this.pSel = arParams.obj || false;
	this.pLEditor = pLEditor;
	this.id = arParams.id;
	this.arParams = arParams;
	this.Create();
};

LHEDialog.prototype = {
	Create: function()
	{
		if (!window.LHEDailogs[this.id] || typeof window.LHEDailogs[this.id] != 'function')
			return;

		var oDialog = window.LHEDailogs[this.id](this);
		if (!oDialog)
			return;

		this.prevTextSelection = "";
		if (this.pLEditor.sEditorMode == 'code')
			this.prevTextSelection = this.pLEditor.GetTextSelection();

		this.pLEditor.SaveSelectionRange();

		if (BX.browser.IsIE() && !this.arParams.bCM && this.pLEditor.sEditorMode != 'code')
		{
			if (this.pLEditor.GetSelectedText(this.pLEditor.oPrevRange) == '')
			{
				this.pLEditor.InsertHTML('<img id="bx_lhe_temp_bogus_node" src="' + this.pLEditor.oneGif + '" _moz_editor_bogus_node="on" style="border: 0px !important;"/>');
				this.pLEditor.oPrevRange = this.pLEditor.GetSelectionRange();
			}
		}

		var arDConfig = {
			title : oDialog.title || this.name || '',
			width: oDialog.width || 500,
			height: 200,
			resizable: false
		};

		if (oDialog.height)
			arDConfig.height = oDialog.height;

		if (oDialog.resizable)
		{
			arDConfig.resizable = true;
			arDConfig.min_width = oDialog.min_width;
			arDConfig.min_height = oDialog.min_height;
			arDConfig.resize_id = oDialog.resize_id;
		}

		window.obLHEDialog = new BX.CDialog(arDConfig);

		var _this = this;
		BX.addCustomEvent(obLHEDialog, 'onWindowUnRegister', function()
		{
			_this.pLEditor.bPopup = false;
			if (obLHEDialog.DIV && obLHEDialog.DIV.parentNode)
				obLHEDialog.DIV.parentNode.removeChild(window.obLHEDialog.DIV);

			if (_this.arParams.bEnterClose !== false)
				BX.unbind(window, "keydown", BX.proxy(_this.OnKeyPress, _this));
		});

		if (this.arParams.bEnterClose !== false)
			BX.bind(window, "keydown", BX.proxy(this.OnKeyPress, this));

		this.pLEditor.bPopup = true;
		obLHEDialog.Show();
		obLHEDialog.SetContent(oDialog.innerHTML);

		if (oDialog.OnLoad && typeof oDialog.OnLoad == 'function')
			oDialog.OnLoad();

		obLHEDialog.oDialog = oDialog;
		obLHEDialog.SetButtons([
			new BX.CWindowButton(
				{
					title: BX.message.DialogSave,
					action: function()
					{
						var res = true;
						if (oDialog.OnSave && typeof oDialog.OnSave == 'function')
						{
							_this.pLEditor.RestoreSelectionRange();
							res = oDialog.OnSave();
						}
						if (res !== false)
							window.obLHEDialog.Close();
					}
				}),
			obLHEDialog.btnCancel
		]);
		BX.addClass(obLHEDialog.PARTS.CONTENT, "lhe-dialog");

		obLHEDialog.adjustSizeEx();
		// Hack for Opera
		setTimeout(function(){obLHEDialog.Move(1, 1);}, 100);
	},

	OnKeyPress: function(e)
	{
		if(!e)
			e = window.event
		if (e.keyCode == 13)
			obLHEDialog.PARAMS.buttons[0].emulate();
	},

	Close: function(floatDiv)
	{
		this.RemoveOverlay();
		if (!floatDiv)
			floatDiv = this.floatDiv;
		if (!floatDiv || !floatDiv.parentNode)
			return;

		this.pLEditor.bDialogOpened = false;
		jsFloatDiv.Close(floatDiv);
		floatDiv.parentNode.removeChild(floatDiv);
		if (window.jsPopup)
			jsPopup.AllowClose();
	},

	CreateOverlay: function()
	{
		var ws = BX.GetWindowScrollSize();
		this.overlay = document.body.appendChild(BX.create("DIV", {props: {id: this.overlay_id, className: "lhe-overlay"}, style: {zIndex: this.zIndex - 5, width: ws.scrollWidth + "px", height: ws.scrollHeight + "px"}}));
		this.overlay.ondrag = BX.False;
		this.overlay.onselectstart = BX.False;
	},

	RemoveOverlay: function()
	{
		if (this.overlay && this.overlay.parentNode)
			this.overlay.parentNode.removeChild(this.overlay);
	}
}

// List
function LHEList(oBut, pLEditor)
{
	if (!oBut.name)
		oBut.name = oBut.id;
	if (!oBut.title)
		oBut.title = oBut.name;
	this.disabled = false;
	this.zIndex = 5000;

	this.pLEditor = pLEditor;
	this.oBut = oBut;
	this.Create();
	this.bRunOnOpen = false;
	if (this.oBut && typeof this.oBut.OnBeforeCreate == 'function')
		this.oBut = this.oBut.OnBeforeCreate(this.pLEditor, this.oBut);

	if (this.oBut)
	{
		if (oBut.OnCreate && typeof oBut.OnCreate == 'function')
			this.bRunOnOpen = true;

		if (this.oBut.disableOnCodeView)
			BX.addCustomEvent(this.pLEditor, "OnChangeView", BX.proxy(this.OnChangeView, this));
	}
	else
	{
		BX.defer(function(){BX.remove(this.pCont);}, this)();
	}
}

LHEList.prototype = {
	Create: function ()
	{
		var _this = this;

		this.pWnd = BX.create("IMG", {props: {src: this.pLEditor.oneGif, title: this.oBut.title, className: "lhe-button lhe-button-normal", id: "lhe_btn_" + this.oBut.id.toLowerCase()}});

		this.pWnd.onmouseover = function(e){_this.OnMouseOver(e, this)};
		this.pWnd.onmouseout = function(e){_this.OnMouseOut(e, this)};
		this.pWnd.onmousedown = function(e){_this.OnClick(e, this)};

		this.pCont = BX.create("DIV", {props: {className: 'lhe-button-cont'}});
		this.pCont.appendChild(this.pWnd);

		this.pValuesCont = BX.create("DIV", {props: {className: "lhe-list-val-cont"}, style: {zIndex: this.zIndex}});

		if (this.oBut && typeof this.oBut.OnAfterCreate == 'function')
			this.oBut.OnAfterCreate(this.pLEditor, this);
	},

	OnChangeView: function()
	{
		if (this.oBut.disableOnCodeView)
			this.Disable(this.pLEditor.sEditorMode == 'code');
	},

	Disable: function (bFlag)
	{
		if(bFlag == this.disabled)
			return false;
		this.disabled = bFlag;
		if(bFlag)
			BX.addClass(this.pWnd, 'lhe-button-disabled');
		else
			BX.removeClass(this.pWnd, 'lhe-button-disabled');
	},

	OnMouseOver: function (e, pEl)
	{
		if(this.disabled)
			return;
		BX.addClass(pEl, 'lhe-button-over');
	},

	OnMouseOut: function (e, pEl)
	{
		if(this.disabled)
			return;

		BX.removeClass(pEl, 'lhe-button-over');
		if(this.checked)
			BX.addClass(pEl, 'lhe-button-checked');

		// if(this.checked)
		// pEl.className = 'lhe-button lhe-button-checked';
		// else
		// pEl.className = 'lhe-button lhe-button-normal';
	},

	OnKeyPress: function(e)
	{
		if(!e) e = window.event
		if(e.keyCode == 27)
			this.Close();
	},

	OnClick: function (e, pEl)
	{
		this.pLEditor.SaveSelectionRange();

		if(this.disabled)
			return false;

		if (this.bOpened)
			return this.Close();

		this.Open();
	},

	Close: function ()
	{
		this.pValuesCont.style.display = 'none';
		this.pLEditor.oTransOverlay.Hide();

		BX.unbind(window, "keypress", BX.proxy(this.OnKeyPress, this));
		BX.unbind(document, 'mousedown', BX.proxy(this.CheckClose, this));

		this.bOpened = false;
	},

	CheckClose: function(e)
	{
		if (!this.bOpened)
			return BX.unbind(document, 'mousedown', BX.proxy(this.CheckClose, this));

		var pEl;
		if (e.target)
			pEl = e.target;
		else if (e.srcElement)
			pEl = e.srcElement;
		if (pEl.nodeType == 3)
			pEl = pEl.parentNode;

		if (!BX.findParent(pEl, {className: 'lhe-colpick-cont'}))
			this.Close();
	},

	Open: function ()
	{
		if (this.bRunOnOpen)
		{
			if (this.oBut.OnCreate && typeof this.oBut.OnCreate == 'function')
				this.oBut.OnCreate(this);
			this.bRunOnOpen = false;
		}

		document.body.appendChild(this.pValuesCont);

		this.pValuesCont.style.display = 'block';
		var
			pOverlay = this.pLEditor.oTransOverlay.Show(),
			pos = BX.align(BX.pos(this.pWnd), parseInt(this.pValuesCont.offsetWidth) || 150, parseInt(this.pValuesCont.offsetHeight) || 200),
			_this = this;

		BX.bind(window, "keypress", BX.proxy(this.OnKeyPress, this));
		pOverlay.onclick = function(){_this.Close()};

		this.pLEditor.oPrevRange = this.pLEditor.GetSelectionRange();
		if (this.oBut.OnOpen && typeof this.oBut.OnOpen == 'function')
			this.oBut.OnOpen(this);

		this.pValuesCont.style.top = pos.top + 'px';
		this.pValuesCont.style.left = pos.left + 'px';
		this.bOpened = true;

		setTimeout(function()
		{
			BX.bind(document, 'mousedown', BX.proxy(_this.CheckClose, _this));
		},100);
	},

	SelectItem: function(bSelect)
	{
		var pItem = this.arItems[this.pSelectedItemId || 0].pWnd;
		if (bSelect)
		{
			pItem.style.border = '1px solid #4B4B6F';
			pItem.style.backgroundColor = '#FFC678';
		}
		else
		{
			pItem.style.border = '';
			pItem.style.backgroundColor = '';
		}
	}
}

function LHETransOverlay(arParams, pLEditor)
{
	this.pLEditor = pLEditor;
	this.id = 'lhe_trans_overlay';
	this.zIndex = arParams.zIndex || 100;
}

LHETransOverlay.prototype =
{
	Create: function ()
	{
		this.bCreated = true;
		this.bShowed = false;
		var ws = BX.GetWindowScrollSize();
		this.pWnd = document.body.appendChild(BX.create("DIV", {props: {id: this.id, className: "lhe-trans-overlay"}, style: {zIndex: this.zIndex, width: ws.scrollWidth + "px", height: ws.scrollHeight + "px"}}));

		this.pWnd.ondrag = BX.False;
		this.pWnd.onselectstart = BX.False;
	},

	Show: function(arParams)
	{
		if (!this.bCreated)
			this.Create();
		this.bShowed = true;
		this.pLEditor.bPopup = true;

		var ws = BX.GetWindowScrollSize();

		this.pWnd.style.display = 'block';
		this.pWnd.style.width = ws.scrollWidth + "px";
		this.pWnd.style.height = ws.scrollHeight + "px";

		if (!arParams)
			arParams = {};

		if (arParams.zIndex)
			this.pWnd.style.zIndex = arParams.zIndex;

		BX.bind(window, "resize", BX.proxy(this.Resize, this));
		return this.pWnd;
	},

	Hide: function ()
	{
		var _this = this;
		setTimeout(function(){_this.pLEditor.bPopup = false;}, 50);
		if (!this.bShowed)
			return;
		this.bShowed = false;
		this.pWnd.style.display = 'none';
		BX.unbind(window, "resize", BX.proxy(this.Resize, this));
		this.pWnd.onclick = null;
	},

	Resize: function ()
	{
		if (this.bCreated)
			this.pWnd.style.width = BX.GetWindowScrollSize().scrollWidth + "px";
	}
}


function LHEColorPicker(oPar, pLEditor)
{
	if (!oPar.name)
		oPar.name = oPar.id;
	if (!oPar.title)
		oPar.title = oPar.name;
	this.disabled = false;
	this.bCreated = false;
	this.bOpened = false;
	this.zIndex = 5000;

	this.pLEditor = pLEditor;

	this.oPar = oPar;
	this.BeforeCreate();
}

LHEColorPicker.prototype = {
	BeforeCreate: function()
	{
		var _this = this;
		this.pWnd = BX.create("IMG", {props: {src: this.pLEditor.oneGif, title: this.oPar.title, className: "lhe-button lhe-button-normal", id: "lhe_btn_" + this.oPar.id.toLowerCase()}});

		this.pWnd.onmouseover = function(e){_this.OnMouseOver(e, this)};
		this.pWnd.onmouseout = function(e){_this.OnMouseOut(e, this)};
		this.pWnd.onmousedown = function(e){_this.OnClick(e, this)};
		this.pCont = BX.create("DIV", {props: {className: 'lhe-button-cont'}});
		this.pCont.appendChild(this.pWnd);

		if (this.oPar && typeof this.oPar.OnBeforeCreate == 'function')
			this.oPar = this.oPar.OnBeforeCreate(this.pLEditor, this.oPar);

		if (this.oPar.disableOnCodeView)
			BX.addCustomEvent(this.pLEditor, "OnChangeView", BX.proxy(this.OnChangeView, this));
	},

	Create: function ()
	{
		var _this = this;
		this.pColCont = document.body.appendChild(BX.create("DIV", {props: {className: "lhe-colpick-cont"}, style: {zIndex: this.zIndex}}));

		var
			arColors = this.pLEditor.arColors,
			row, cell, colorCell,
			tbl = BX.create("TABLE", {props: {className: 'lha-colpic-tbl'}}),
			i, l = arColors.length;

		row = tbl.insertRow(-1);
		cell = row.insertCell(-1);
		cell.colSpan = 8;
		var defBut = cell.appendChild(BX.create("SPAN", {props: {className: 'lha-colpic-def-but'}, text: BX.message.DefaultColor}));
		defBut.onmouseover = function()
		{
			this.className = 'lha-colpic-def-but lha-colpic-def-but-over';
			colorCell.style.backgroundColor = 'transparent';
		};
		defBut.onmouseout = function(){this.className = 'lha-colpic-def-but';};
		defBut.onmousedown = function(e){_this.Select(false);}

		colorCell = row.insertCell(-1);
		colorCell.colSpan = 8;
		colorCell.className = 'lha-color-inp-cell';
		colorCell.style.backgroundColor = arColors[38];

		for(i = 0; i < l; i++)
		{
			if (Math.round(i / 16) == i / 16) // new row
				row = tbl.insertRow(-1);

			cell = row.insertCell(-1);
			cell.innerHTML = '&nbsp;';
			cell.className = 'lha-col-cell';
			cell.style.backgroundColor = arColors[i];
			cell.id = 'lhe_color_id__' + i;

			cell.onmouseover = function (e)
			{
				this.className = 'lha-col-cell lha-col-cell-over';
				colorCell.style.backgroundColor = arColors[this.id.substring('lhe_color_id__'.length)];
			};
			cell.onmouseout = function (e){this.className = 'lha-col-cell';};
			cell.onmousedown = function (e)
			{
				var k = this.id.substring('lhe_color_id__'.length);
				_this.Select(arColors[k]);
			};
		}

		this.pColCont.appendChild(tbl);
		this.bCreated = true;
	},

	OnChangeView: function()
	{
		if (this.oPar.disableOnCodeView)
			this.Disable(this.pLEditor.sEditorMode == 'code');
	},

	Disable: function (bFlag)
	{
		if(bFlag == this.disabled)
			return false;
		this.disabled = bFlag;
		if(bFlag)
			BX.addClass(this.pWnd, 'lhe-button-disabled');
		else
			BX.removeClass(this.pWnd, 'lhe-button-disabled');
	},

	OnClick: function (e, pEl)
	{
		this.pLEditor.SaveSelectionRange();

		if(this.disabled)
			return false;

		if (!this.bCreated)
			this.Create();

		if (this.bOpened)
			return this.Close();

		this.Open();
	},

	Open: function ()
	{
		var
			pOverlay = this.pLEditor.oTransOverlay.Show(),
			pos = BX.align(BX.pos(this.pWnd), 325, 155),
			_this = this;

		this.pLEditor.oPrevRange = this.pLEditor.GetSelectionRange();

		BX.bind(window, "keypress", BX.proxy(this.OnKeyPress, this));
		pOverlay.onclick = function(){_this.Close()};

		this.pColCont.style.display = 'block';
		this.pColCont.style.top = pos.top + 'px';
		this.pColCont.style.left = pos.left + 'px';
		this.bOpened = true;

		setTimeout(function()
		{
			BX.bind(document, 'mousedown', BX.proxy(_this.CheckClose, _this));
		},100);
	},

	Close: function ()
	{
		this.pColCont.style.display = 'none';
		this.pLEditor.oTransOverlay.Hide();
		BX.unbind(window, "keypress", BX.proxy(this.OnKeyPress, this));
		BX.unbind(document, 'mousedown', BX.proxy(this.CheckClose, this));

		this.bOpened = false;
	},

	CheckClose: function(e)
	{
		if (!this.bOpened)
			return BX.unbind(document, 'mousedown', BX.proxy(this.CheckClose, this));

		var pEl;
		if (e.target)
			pEl = e.target;
		else if (e.srcElement)
			pEl = e.srcElement;
		if (pEl.nodeType == 3)
			pEl = pEl.parentNode;

		if (!BX.findParent(pEl, {className: 'lhe-colpick-cont'}))
			this.Close();
	},

	OnMouseOver: function (e, pEl)
	{
		if(this.disabled)
			return;
		pEl.className = 'lhe-button lhe-button-over';
	},

	OnMouseOut: function (e, pEl)
	{
		if(this.disabled)
			return;
		pEl.className = 'lhe-button lhe-button-normal';
	},

	OnKeyPress: function(e)
	{
		if(!e) e = window.event
		if(e.keyCode == 27)
			this.Close();
	},

	Select: function (color)
	{
		this.pLEditor.RestoreSelectionRange();

		if (this.oPar.OnSelect && typeof this.oPar.OnSelect == 'function')
			this.oPar.OnSelect(color, this);

		this.Close();
	}
};

// CONTEXT MENU FOR EDITING AREA
function LHEContextMenu(arParams, pLEditor)
{
	this.zIndex = arParams.zIndex;
	this.pLEditor = pLEditor;
	this.Create();
}

LHEContextMenu.prototype = {
	Create: function()
	{
		this.pref = 'LHE_CM_' + this.pLEditor.id.toUpperCase()+'_';
		this.oDiv = document.body.appendChild(BX.create('DIV', {props: {className: 'lhe-cm', id: this.pref + '_cont'}, style: {zIndex: this.zIndex}, html: '<table><tr><td class="lhepopup"><table id="' + this.pref + '_cont_items"><tr><td></td></tr></table></td></tr></table>'}));

		// Part of logic of JCFloatDiv.Show()   Prevent bogus rerendering window in IE... And SpeedUp first context menu calling
		document.body.appendChild(BX.create('IFRAME', {props: {id: this.pref + '_frame', src: "javascript:void(0)"}, style: {position: 'absolute', zIndex: this.zIndex - 5, left: '-1000px', top: '-1000px', visibility: 'hidden'}}));
		this.menu = new PopupMenu(this.pref + '_cont');
	},

	Show: function(arParams)
	{
		if (!arParams.pElement || !this.FetchAndBuildItems(arParams.pElement))
			return;

		try{this.pLEditor.SelectElement(arParams.pElement);}catch(e){}
		this.pLEditor.oPrevRange = this.pLEditor.GetSelectionRange();
		this.oDiv.style.width = parseInt(this.oDiv.firstChild.offsetWidth) + 'px';

		var
			_this = this,
			w = parseInt(this.oDiv.offsetWidth),
			h = parseInt(this.oDiv.offsetHeight),
			pOverlay = this.pLEditor.oTransOverlay.Show();
		pOverlay.onclick = function(){_this.Close()};
		BX.bind(window, "keypress", BX.proxy(this.OnKeyPress, this));

		arParams.oPos.right = arParams.oPos.left + w;
		arParams.oPos.bottom = arParams.oPos.top;

		this.menu.PopupShow(arParams.oPos);
	},

	Close: function()
	{
		this.menu.PopupHide();
		this.pLEditor.oTransOverlay.Hide();
		BX.unbind(window, "keypress", BX.proxy(this.OnKeyPress, this));
	},

	FetchAndBuildItems: function(pElement)
	{
		var pElementTemp,
			i, k,
			arMenuItems = [],
			arUsed = {},
			strPath, strPath1,
			__bxtagname = false;
		this.arSelectedElement = {};

		//Adding elements
		while(pElement && (pElementTemp = pElement.parentNode) != null)
		{
			if(pElementTemp.nodeType == 1 && pElement.tagName && (strPath = pElement.tagName.toUpperCase()) && strPath != 'TBODY' && !arUsed[strPath])
			{
				strPath1 = strPath;
				if (pElement.getAttribute && (__bxtagname = pElement.getAttribute('__bxtagname')))
					strPath1 = __bxtagname.toUpperCase();

				arUsed[strPath] = pElement;
				if(LHEContMenu[strPath1])
				{
					this.arSelectedElement[strPath1] = pElement;
					if (arMenuItems.length > 0)
						arMenuItems.push('separator');
					for(i = 0, k = LHEContMenu[strPath1].length; i < k; i++)
						arMenuItems.push(LHEContMenu[strPath1][i]);
				}
			}
			else
			{
				pElement = pElementTemp;
				continue;
			}
		}

		if (arMenuItems.length == 0)
			return false;

		//Cleaning menu
		var contTbl = document.getElementById(this.pref + '_cont_items');
		while(contTbl.rows.length>0)
			contTbl.deleteRow(0);
		return this.BuildItems(arMenuItems, contTbl);
	},

	BuildItems: function(arMenuItems, contTbl, parentName)
	{
		var n = arMenuItems.length;
		var _this = this;
		var arSubMenu = {};
		this.subgroup_parent_id = '';
		this.current_opened_id = '';

		var _hide = function()
		{
			var cs = document.getElementById("__curent_submenu");
			if (!cs)
				return;
			_over(cs);
			_this.current_opened_id = '';
			_this.subgroup_parent_id = '';
			cs.style.display = "none";
			cs.id = "";
		};

		var _over = function(cs)
		{
			if (!cs)
				return;
			var t = cs.parentNode.nextSibling;
			t.parentNode.className = '';
		};

		var _refresh = function() {setTimeout(function() {_this.current_opened_id = '';_this.subgroup_parent_id = '';}, 400);}
		var i, row, cell, el_params, _atr, _innerHTML, oItem;

		//Creation menu elements
		for(var i = 0; i < n; i++)
		{
			oItem = arMenuItems[i];
			row = contTbl.insertRow(-1);
			cell = row.insertCell(-1);
			if(oItem == 'separator')
			{
				cell.innerHTML = '<div class="popupseparator"></div>';
			}
			else
			{
				if (oItem.isgroup)
				{
					var c = BX.browser.IsIE() ? 'arrow_ie' : 'arrow';
					cell.innerHTML =
						'<div id="_oSubMenuDiv_' + oItem.id + '" style="position: relative;"></div>'+
							'<table cellpadding="0" cellspacing="0" class="popupitem" id="'+oItem.id+'">'+
							'	<tr>'+
							'		<td class="gutter"></td>'+
							'		<td class="item">' + oItem.name + '</td>' +
							'		<td class="'+c+'"></td>'+
							'	</tr>'+
							'</table>';
					var oTable = cell.childNodes[1];
					var _LOCAL_CACHE = {};
					arSubMenu[oItem.id] = oItem.elements;

					oTable.onmouseover = function(e)
					{
						var pTbl = this;
						pTbl.className = 'popupitem popupitemover';
						_over(document.getElementById("__curent_submenu"));
						setTimeout(function()
						{
							//pTbl.parentNode.className = 'popup_open_cell';
							if (_this.current_opened_id && _this.current_opened_id == _this.subgroup_parent_id)
							{
								_refresh();
								return;
							}
							if (pTbl.className == 'popupitem')
								return;
							_hide();
							_this.current_opened_id = pTbl.id;

							var _oSubMenuDiv = document.getElementById("_oSubMenuDiv_" + pTbl.id);
							var left = parseInt(oTable.offsetWidth) + 1 + 'px';
							var oSubMenuDiv = BX.create('DIV', {props: {className : 'popupmenu'}, style: {position: 'absolute', zIndex: 1500, left: left, top: '-1px'}});

							_oSubMenuDiv.appendChild(oSubMenuDiv);
							oSubMenuDiv.onmouseover = function(){pTbl.parentNode.className = 'popup_open_cell';};

							var contTbl = oSubMenuDiv.appendChild(BX.create('TABLE', {props: {cellPadding:0, cellSpacing:0}}));
							_this.BuildItems(arSubMenu[pTbl.id], contTbl, pTbl.id);

							oSubMenuDiv.style.display = "block";
							oSubMenuDiv.id = "__curent_submenu";
						}, 400);
					};
					oTable.onmouseout = function(e){this.className = 'popupitem';};
					continue;
				}

				_innerHTML =
					'<table class="popupitem" id="lhe_cm__' + oItem.id + '"><tr>' +
						'	<td class="gutter"><div class="lhe-button" id="lhe_btn_' + oItem.id.toLowerCase()+'"></div></td>' +
						'	<td class="item">' + (oItem.name_edit || oItem.name) + '</td>' +
						'</tr></table>';
				cell.innerHTML = _innerHTML;

				var oTable = cell.firstChild;
				oTable.onmouseover = function(e){this.className='popupitem popupitemover';}
				oTable.onmouseout = function(e){this.className = 'popupitem';};
				oTable.onmousedown = function(e){_this.OnClick(this);};
			}
		}

		this.oDiv.style.width = contTbl.parentNode.offsetWidth;
		return true;
	},

	OnClick: function(pEl)
	{
		var oItem = LHEButtons[pEl.id.substring('lhe_cm__'.length)];
		if(!oItem || oItem.disabled)
			return false;
		this.pLEditor.RestoreSelectionRange();

		var res = false;

		if(oItem.handler)
			res = oItem.handler(this) !== false;

		if(!res && oItem.cmd)
		{
			this.pLEditor.executeCommand(oItem.cmd);
			this.pLEditor.SetFocus();
		}

		this.Close();
	},

	OnKeyPress: function(e)
	{
		if(!e) e = window.event

		if(e.keyCode == 27)
			this.Close();
	}
}
/* End */
;
; /* Start:/bitrix/js/fileman/light_editor/le_toolbarbuttons.js*/
if (!window.LHEButtons)
	LHEButtons = {};

LHEButtons['Source'] = {
	id : 'Source',
	width: 44,
	name : BX.message.Source,
	OnBeforeCreate: function(pLEditor, pBut)
	{
		if (pLEditor.bBBCode && !pLEditor.arConfig.bConvertContentFromBBCodes)
		{
			pBut.id = 'SourceBB';
			pBut.name = pBut.title = BX.message.BBSource;
		}
		pBut.title += ": " + BX.message.Off;
		return pBut;
	},
	handler : function(pBut)
	{
		var bHtml = pBut.pLEditor.sEditorMode == 'html';
		pBut.pWnd.title = pBut.oBut.name + ": " + (bHtml ? BX.message.On : BX.message.Off);
		pBut.pLEditor.SetView(bHtml ? 'code' : 'html');
		pBut.Check(bHtml);
	}
};

// BASE
LHEButtons['Anchor'] = {
	id: 'Anchor',
	name: BX.message.Anchor,
	bBBHide: true,
	OnBeforeCreate: function(pLEditor, pBut)
	{
		if (pLEditor.bBBCode)
			return false;
		return pBut;
	},
	handler: function(pBut)
	{
		pBut.pLEditor.OpenDialog({ id: 'Anchor'});
	},
	parser:
	{
		name: "anchor",
		obj: {
			Parse: function(sName, sContent, pLEditor)
			{
				return sContent.replace(
					/<a(\s[\s\S]*?)(?:>\s*?<\/a)?(?:\/?)?>/ig,
					function(sContent)
					{
						if(sContent.toLowerCase().indexOf("href") > 0)
							return sContent;

						var id = pLEditor.SetBxTag(false, {tag: "anchor", params: {value : sContent}});
						return '<img id="' + id + '" src="' + pLEditor.oneGif + '" class="bxed-anchor" />';
					}
				);
			},
			UnParse: false
		}
	}
};

LHEButtons['CreateLink'] = {
	id : 'CreateLink',
	name : BX.message.CreateLink,
	name_edit : BX.message.EditLink,
	OnBeforeCreate: function(pLEditor, pBut)
	{
		// Disable in non BBCode mode in html
		pBut.disableOnCodeView = !pLEditor.bBBCode || pLEditor.arConfig.bConvertContentFromBBCodes;
		return pBut;
	},
	handler : function (pBut)
	{
		var p = (pBut.arSelectedElement && pBut.arSelectedElement['A']) ? pBut.arSelectedElement['A'] : pBut.pLEditor.GetSelectionObject();
		pBut.pLEditor.OpenDialog({id : 'Link', obj: p, bCM: !!pBut.menu});
	},
	parser: {
		name: "a",
		obj: {
			Parse: function(sName, sContent, pLEditor)
			{
				// Link
				return sContent.replace(
					/(<noindex>)*?<a([\s\S]*?(?:.*?[^\?]{1})??)(>[\s\S]*?<\/a>)(<\/noindex>)*/ig,
					function(str, s0, s1, s2, s3)
					{
						var arParams = pLEditor.GetAttributesList(s1), i , val, res = "", bPhp = false;
						if (s0 && s3 && s0.toLowerCase().indexOf('noindex') != -1 && s3.toLowerCase().indexOf('noindex') != -1)
						{
							arParams.noindex = true;
							arParams.rel = "nofollow";
						}

						res = "<a id=\"" + pLEditor.SetBxTag(false, {tag: 'a', params: arParams}) + "\" ";
						for (i in arParams)
						{
							if (typeof arParams[i] == 'string' && i != 'id' && i != 'noindex')
							{
								res += i + '="' + BX.util.htmlspecialchars(arParams[i]) + '" ';
							}
						}
						res += s2;
						return res;
					}
				);
			},
			UnParse: function(bxTag, pNode, pLEditor)
			{
				if (!bxTag.params)
					return '';

				var i, res = '<a ';

				// Only for BBCodes
				if (pLEditor.bBBCode)
				{
					var innerHtml = "";
					for(i = 0; i < pNode.arNodes.length; i++)
						innerHtml += pLEditor._RecursiveGetHTML(pNode.arNodes[i]);

					if (BX.util.trim(innerHtml) == BX.util.trim(bxTag.params.href))
						res = "[url]" + bxTag.params.href + "[/url]";
					else
						res = "[url=" + bxTag.params.href + "]" + innerHtml + "[/url]";

					return res;
				}

				bxTag.params['class'] = pNode.arAttributes['class'] ||'';
				for (i in bxTag.params)
					if (bxTag.params[i] && i != 'noindex')
						res += i + '="' + BX.util.htmlspecialchars(bxTag.params[i]) + '" ';

				res += '>';

				for(i = 0; i < pNode.arNodes.length; i++)
					res += pLEditor._RecursiveGetHTML(pNode.arNodes[i]);

				res += '</a>';

				if (bxTag.params.noindex)
					res = '<noindex>' + res + '</noindex>';

				return res;
			}
		}
	}
};

LHEButtons['DeleteLink'] = {
	id : 'DeleteLink',
	name : BX.message.DeleteLink,
	cmd : 'Unlink',
	disableOnCodeView: true,
	handler : function(pBut)
	{
		var p = (pBut.arSelectedElement && pBut.arSelectedElement['A']) ? pBut.arSelectedElement['A'] : pBut.pLEditor.GetSelectionObject();
		if(p && p.tagName != 'A')
			p = BX.findParent(pBut.pLEditor.GetSelectionObject(), {tagName: 'A'});

		if (BX.browser.IsIE() && !p)
		{
			var oRange = pBut.pLEditor.GetSelectionRange();
			if (pBut.pLEditor.GetSelectedText(oRange) == '')
			{
				pBut.pLEditor.InsertHTML('<img id="bx_lhe_temp_bogus_node" src="' + pBut.pLEditor.oneGif + '" _moz_editor_bogus_node="on" style="border: 0px !important;"/>');
				var bogusImg = pBut.pLEditor.pEditorDocument.getElementById('bx_lhe_temp_bogus_node');
				if (bogusImg)
				{
					p = BX.findParent(bogusImg, {tagName: 'A'});
					bogusImg.parentNode.removeChild(bogusImg);
				}
			}
		}

		if (p)
		{
			if (!BX.browser.IsIE())
				pBut.pLEditor.SelectElement(p);
			pBut.pLEditor.executeCommand('Unlink');
		}
	}
};

LHEButtons['Image'] = {
	id : 'Image',
	name : BX.message.Image,
	name_edit : BX.message.EditImage,
	OnBeforeCreate: function(pLEditor, pBut)
	{
		// Disable in non BBCode mode in html
		pBut.disableOnCodeView = !pLEditor.bBBCode || pLEditor.arConfig.bConvertContentFromBBCodes;
		return pBut;
	},
	handler : function (pBut)
	{
		var p = (pBut.arSelectedElement && pBut.arSelectedElement['IMG']) ? pBut.arSelectedElement['IMG'] : pBut.pLEditor.GetSelectionObject();
		if (!p || p.tagName != 'IMG')
			p = false;
		pBut.pLEditor.OpenDialog({id : 'Image', obj: p});
	},
	parser: {
		name: "img",
		obj: {
			Parse: function(sName, sContent, pLEditor)
			{
				// Image
				return sContent.replace(
					/<img([\s\S]*?(?:.*?[^\?]{1})??)>/ig,
					function(str, s1)
					{
						var arParams = pLEditor.GetAttributesList(s1), i , val, res = "", bPhp = false;
						if (arParams && arParams.id)
						{
							var oTag = pLEditor.GetBxTag(arParams.id);
							if (oTag.tag)
								return str;
						}

						res = "<img id=\"" + pLEditor.SetBxTag(false, {tag: 'img', params: arParams}) + "\" ";
						for (i in arParams)
						{
							if (typeof arParams[i] == 'string' && i != 'id')
								res += i + '="' + BX.util.htmlspecialchars(arParams[i]) + '" ';
						}
						res += " />";
						return res;
					}
				);
			},
			UnParse: function(bxTag, pNode, pLEditor)
			{
				if (!bxTag.params)
					return '';

				// width, height
				var
					w = parseInt(pNode.arStyle.width) || parseInt(pNode.arAttributes.width),
					h = parseInt(pNode.arStyle.height) || parseInt(pNode.arAttributes.height);

				if (pLEditor.bBBCode)
				{
					var strSize = (w && h && pLEditor.bBBParseImageSize) ? ' WIDTH=' + w + ' HEIGHT=' + h : '';
					return res = "[IMG" + strSize + "]" + bxTag.params.src + "[/IMG]";
				}

				if (w && !isNaN(w))
					bxTag.params.width = w;
				if (h && !isNaN(h))
					bxTag.params.height = h;

				bxTag.params['class'] = pNode.arAttributes['class'] ||'';

				var i, res = '<img ';
				for (i in bxTag.params)
					if (bxTag.params[i])
						res += i + '="' + BX.util.htmlspecialchars(bxTag.params[i]) + '" ';

				res += ' />';

				return res;
			}
		}
	}
};

// LHEButtons['SpecialChar'] = {
	// id : 'SpecialChar',
	// name : BX.message.SpecialChar,
	// handler : function (pBut) {pBut.pLEditor.OpenDialog({id : 'SpecialChar'});}
// };

LHEButtons['Bold'] =
{
	id : 'Bold',
	name : BX.message.Bold + " (Ctrl + B)",
	OnBeforeCreate: function(pLEditor, pBut)
	{
		// Disable in non BBCode mode in html
		pBut.disableOnCodeView = !pLEditor.bBBCode || pLEditor.arConfig.bConvertContentFromBBCodes;
		return pBut;
	},
	cmd : 'Bold',
	bbHandler: function(pBut)
	{
		pBut.pLEditor.FormatBB({tag: 'B', pBut: pBut});
	}
};

LHEButtons['Italic'] =
{
	id : 'Italic',
	name : BX.message.Italic + " (Ctrl + I)",
	cmd : 'Italic',
	OnBeforeCreate: function(pLEditor, pBut)
	{
		// Disable in non BBCode mode in html
		pBut.disableOnCodeView = !pLEditor.bBBCode || pLEditor.arConfig.bConvertContentFromBBCodes;
		return pBut;
	},
	bbHandler: function(pBut)
	{
		pBut.pLEditor.FormatBB({tag: 'I', pBut: pBut});
	}
};

LHEButtons['Underline'] =
{
	id : 'Underline',
	name : BX.message.Underline + " (Ctrl + U)",
	cmd : 'Underline',
	OnBeforeCreate: function(pLEditor, pBut)
	{
		// Disable in non BBCode mode in html
		pBut.disableOnCodeView = !pLEditor.bBBCode || pLEditor.arConfig.bConvertContentFromBBCodes;
		return pBut;
	},
	bbHandler: function(pBut)
	{
		pBut.pLEditor.FormatBB({tag: 'U', pBut: pBut});
	}
};
LHEButtons['RemoveFormat'] =
{
	id : 'RemoveFormat',
	name : BX.message.RemoveFormat,
	//cmd : 'RemoveFormat',
	OnBeforeCreate: function(pLEditor, pBut)
	{
		// Disable in non BBCode mode in html
		pBut.disableOnCodeView = !pLEditor.bBBCode || pLEditor.arConfig.bConvertContentFromBBCodes;
		return pBut;
	},
	handler : function (pBut)
	{
		pBut.pLEditor.executeCommand('RemoveFormat');

		var
			pElement = pBut.pLEditor.GetSelectionObject(),
			i, arNodes = [];

		if (pElement)
		{
			var arNodes = BX.findChildren(pElement, {tagName: 'del'}, true);
			if (!arNodes || !arNodes.length)
				arNodes = [];

			var pPar = BX.findParent(pElement, {tagName: 'del'});
			if (pPar)
				arNodes.push(pPar);

			if (pElement.nodeName && pElement.nodeName.toLowerCase() == 'del')
				arNodes.push(pElement);
		}

		if (arNodes && arNodes.length > 0)
		{
			for (i = 0; i < arNodes.length; i++)
			{
				arNodes[i].style.textDecoration = "";
				pBut.pLEditor.RidOfNode(arNodes[i], true);
			}
		}
	},
	bbHandler: function(pBut)
	{
		pBut.pLEditor.RemoveFormatBB();
	}
};

LHEButtons['Strike'] = {
	id : 'Strike',
	name : BX.message.Strike,
	OnBeforeCreate: function(pLEditor, pBut)
	{
		// Disable in non BBCode mode in html
		pBut.disableOnCodeView = !pLEditor.bBBCode || pLEditor.arConfig.bConvertContentFromBBCodes;
		return pBut;
	},
	handler : function (pBut)
	{
		var
			pElement = pBut.pLEditor.GetSelectionObject(),
			arNodes = [];

		if (pElement && pElement.nodeName)
		{
			if (pElement.nodeName.toLowerCase() == 'body')
			{
				// Body ?
			}
			else
			{
				var arNodes = BX.findChildren(pElement, {tagName: 'del'}, true);
				if (!arNodes || !arNodes.length)
					arNodes = [];

				var pPar = BX.findParent(pElement, {tagName: 'del'});
				if (pPar)
					arNodes.push(pPar);

				if (pElement.nodeName.toLowerCase() == 'del')
					arNodes.push(pElement);
			}
		}

		if (arNodes && arNodes.length > 0)
		{
			for (var i = 0; i < arNodes.length; i++)
			{
				arNodes[i].style.textDecoration = "";
				pBut.pLEditor.RidOfNode(arNodes[i], true);
			}
			pBut.Check(false);
		}
		else
		{
			pBut.pLEditor.WrapSelectionWith("del");
			//this.pMainObj.OnEvent("OnSelectionChange");
		}
	},
	OnSelectionChange: function () // ????
	{
		var
			pElement = this.pMainObj.GetSelectedNode(true),
			bFind = false, st;

		while(!bFind)
		{
			if (!pElement)
				break;

			if (pElement.nodeType == 1 && (BX.style(pElement, 'text-decoration', null) == "line-through" || pElement.nodeName.toLowerCase() == 'strike'))
			{
				bFind = true;
				break;
			}
			else
				pElement = pElement.parentNode;
		}

		pBut.Check(bFind);
	},
	bbHandler: function(pBut)
	{
		pBut.pLEditor.FormatBB({tag: 'S', pBut: pBut});
	}
};

LHEButtons['Quote'] = {
	id : 'Quote',
	name : BX.message.Quote + " (Ctrl + Q)",
	OnBeforeCreate: function(pLEditor, pBut)
	{
		// Disable in non BBCode mode in html
		pBut.disableOnCodeView = !pLEditor.bBBCode || pLEditor.arConfig.bConvertContentFromBBCodes;

		pLEditor.systemCSS += "blockquote.bx-quote {border: 1px solid #C0C0C0!important; background: #fff4ca url(" + pLEditor.imagePath + "font_quote.gif) left top no-repeat; padding: 4px 4px 4px 24px; color: #373737!important;}\n";
		return pBut;
	},
	handler: function(pBut)
	{
		if (pBut.pLEditor.arConfig.bQuoteFromSelection)
		{
			var res;
			if (document.selection && document.selection.createRange)
				res = document.selection.createRange().text;
			else if (window.getSelection)
				res = window.getSelection().toString();

			res = BX.util.htmlspecialchars(res);
			res = res.replace(/\n/g, '<br />');

			var strId = '';
			if (!pBut.pLEditor.bBBCode)
				strId = " id\"=" + pBut.pLEditor.SetBxTag(false, {tag: "quote"}) + "\"";

			if (res && res.length > 0)
				return pBut.pLEditor.InsertHTML('<blockquote class="bx-quote"' + strId + ">" + res + "</blockquote> <br/>");
		}

		// Catch all blockquotes
		var
			arBQ = pBut.pLEditor.pEditorDocument.getElementsByTagName("blockquote"),
			i, l = arBQ.length;

		// Set specific name to nodes
		for (i = 0; i < l; i++)
			arBQ[i].name = "__bx_temp_quote";

		// Create new qoute
		pBut.pLEditor.executeCommand('Indent');

		// Search for created node and try to adjust new style end id
		setTimeout(function(){
			var
				arNewBQ = pBut.pLEditor.pEditorDocument.getElementsByTagName("blockquote"),
				i, l = arNewBQ.length;

			for (i = 0; i < l; i++)
			{
				if (arBQ[i].name == "__bx_temp_quote")
				{
					arBQ[i].removeAttribute("name");
				}
				else
				{
					arBQ[i].className = "bx-quote";
					arBQ[i].id = pBut.pLEditor.SetBxTag(false, {tag: "quote"});
				}
				try{arBQ[i].setAttribute("style", '');}catch(e){}

				if (!arBQ[i].nextSibling)
					arBQ[i].parentNode.appendChild(BX.create("BR", {}, pBut.pLEditor.pEditorDocument));

				if (arBQ[i].previousSibling && arBQ[i].previousSibling.nodeName && arBQ[i].previousSibling.nodeName.toLowerCase() == 'blockquote')
					arBQ[i].parentNode.insertBefore(BX.create("BR", {}, pBut.pLEditor.pEditorDocument), arBQ[i]);
			}
		}, 10);
	},
	bbHandler: function(pBut)
	{
		if (pBut.pLEditor.arConfig.bQuoteFromSelection)
		{
			if (document.selection && document.selection.createRange)
				res = document.selection.createRange().text;
			else if (window.getSelection)
				res = window.getSelection().toString();

			if (res && res.length > 0)
				return pBut.pLEditor.WrapWith('[QUOTE]', '[/QUOTE]', res);
		}

		pBut.pLEditor.FormatBB({tag: 'QUOTE', pBut: pBut});
	},
	parser: {
		name: 'quote',
		obj: {
			Parse: function(sName, sContent, pLEditor)
			{
				sContent = sContent.replace(/\[quote\]/ig, '<blockquote class="bx-quote" id="' + pLEditor.SetBxTag(false, {tag: "quote"}) + '">');
				// Add additional <br> after "quote" in the end of the text
				sContent = sContent.replace(/\[\/quote\]$/ig, '</blockquote><br/>');
				// Add additional <br> between two quotes
				sContent = sContent.replace(/\[\/quote\](<blockquote)/ig, "</blockquote><br/>$1");
				sContent = sContent.replace(/\[\/quote\]/ig, '</blockquote>');

				return sContent;
			},
			UnParse: function(bxTag, pNode, pLEditor)
			{
				if (bxTag.tag == 'quote')
				{
					var i, l = pNode.arNodes.length, res = "[QUOTE]";
					for (i = 0; i < l; i++)
						res += pLEditor._RecursiveGetHTML(pNode.arNodes[i]);
					res += "[/QUOTE]";
					return res;
				}
				return "";
			}
		}
	}
};

LHEButtons['Code'] = {
	id : 'Code',
	name : BX.message.InsertCode,
	OnBeforeCreate: function(pLEditor, pBut)
	{
		// Disable in non BBCode mode in html
		pBut.disableOnCodeView = !pLEditor.bBBCode || pLEditor.arConfig.bConvertContentFromBBCodes;

		pLEditor.systemCSS += ".lhe-code{border: 1px solid #C0C0C0!important; white-space: pre!important; padding: 5px!important; display: block;}\n .lhe-code *, .lhe-code{background: #eaeaea!important; color: #000080!important; font-weight: normal!important; line-height: normal!important; text-decoration: none!important; font-size: 11px!important;font-family:Verdana!important;}";
		return pBut;
	},
	handler : function(pBut)
	{
		var arProps = {className: "lhe-code", title: BX.message.CodeDel};
		if (!pBut.pLEditor.bBBCode)
			arProps.id = pBut.pLEditor.SetBxTag(false, {tag: "code"});

		var arEl =  pBut.pLEditor.WrapSelectionWith("pre", {props: arProps});
		if (arEl && arEl.length > 0)
		{
			var
				firstEl = arEl[0],
				lastEl = arEl[arEl.length - 1];

			if (firstEl)
				firstEl.parentNode.insertBefore(BX.create("BR", {}, pBut.pLEditor.pEditorDocument), firstEl);

			if (lastEl && lastEl.parentNode)
			{
				var pBr = BX.create("BR", {}, pBut.pLEditor.pEditorDocument);
				if (lastEl.nextSibling)
					lastEl.parentNode.insertBefore(pBr, lastEl.nextSibling);
				else
					lastEl.parentNode.appendChild(pBr);
			}
		}
		else
		{
			var strId = '';

			if (!pBut.pLEditor.bBBCode)
				strId = "id=\"" + pBut.pLEditor.SetBxTag(false, {tag: "code"}) + "\" ";

			pBut.pLEditor.InsertHTML('<br/><pre ' + strId + 'class="lhe-code" title="' + BX.message.CodeDel + '"><br id="lhe_bogus_code_br"/> </pre> <br/>');
			setTimeout(
				function()
				{
					var br = pBut.pLEditor.pEditorDocument.getElementById('lhe_bogus_code_br');
					if (br)
						pBut.pLEditor.SelectElement(br);
				},
				100
			);
		}
	},
	bbHandler: function(pBut)
	{
		pBut.pLEditor.FormatBB({tag: 'CODE', pBut: pBut});
	},
	parser: {
		name: 'code',
		obj: {
			UnParse: function(bxTag, pNode, pLEditor)
			{
				if (bxTag.tag == 'code')
					return pLEditor.UnParseNodeBB(pNode);
				return "";
			}
		}
	}
};

LHEButtons['InsertCut'] =
{
	id : 'InsertCut',
	name : BX.message.InsertCut,
	OnBeforeCreate: function(pLEditor, pBut)
	{
		// Disable in non BBCode mode in html
		pBut.disableOnCodeView = !pLEditor.bBBCode || pLEditor.arConfig.bConvertContentFromBBCodes;

		pLEditor.systemCSS += "img.bxed-cut {margin: 2px; width: 100%; height: 12px; background: transparent url(" + pLEditor.imagePath + "cut.gif) left top repeat-x;}\n";
		return pBut;
	},
	handler: function(pBut)
	{
		pBut.pLEditor.InsertHTML(pBut.pLEditor.GetCutHTML());
	},
	bbHandler: function(pBut)
	{
		// Todo: check if already exist
		pBut.pLEditor.WrapWith('', '', '[CUT]');
	},
	parser: {
		name: 'cut',
		obj: {
			Parse: function(sName, sContent, pLEditor)
			{
				return sContent.replace(/\[CUT\]/ig, pLEditor.GetCutHTML());
			},
			UnParse: function(bxTag, pNode, pLEditor)
			{
				if (bxTag.tag == 'cut')
					return "[CUT]";
				return "";
			}
		}
	}
};
LHEButtons['Translit'] = {id : 'Translit', name : BX.message.Translit, cmd : 'none'};

// Grouped buttons
LHEButtons['JustifyLeft'] =
LHEButtons['Justify'] =
{
	id : 'JustifyLeft_L',
	name : BX.message.ImgAlign + ": " + BX.message.JustifyLeft,
	type: 'List',
	OnAfterCreate: function(pLEditor, pList)
	{
		pList.arJustifyInd = {justifyleft: 0, justifycenter: 1, justifyright: 2, justifyfull: 3};
		pList.arJustify = [
			{id : 'JustifyLeft', name : BX.message.JustifyLeft, cmd : 'JustifyLeft', bb: 'LEFT'},
			{id : 'JustifyCenter', name : BX.message.JustifyCenter, cmd : 'JustifyCenter', bb: 'CENTER'},
			{id : 'JustifyRight', name : BX.message.JustifyRight, cmd : 'JustifyRight', bb: 'RIGHT'},
			{id : 'JustifyFull', name : BX.message.JustifyFull, cmd : 'JustifyFull', bb: 'JUSTIFY'}
		];

		var l = pList.arJustify.length, i;

		// Create popup
		BX.addClass(pList.pValuesCont, "lhe-justify-list");
		pList.pPopupTbl = pList.pValuesCont.appendChild(BX.create("TABLE", {props: {className: 'lhe-smiles-cont lhe-justify-cont '}}));

		for (i = 0; i < l; i++)
		{
			pList.arJustify[i].pIcon = pList.pPopupTbl.insertRow(-1).insertCell(-1).appendChild(BX.create("IMG", {props: {
				id: "lhe_btn_" + pList.arJustify[i].id.toLowerCase(),
				src: pList.pLEditor.oneGif,
				className: "lhe-button",
				title: pList.arJustify[i].name
			}}));

			pList.arJustify[i].pIcon.onmouseover = function(){BX.addClass(this, "lhe-tlbr-just-over");};
			pList.arJustify[i].pIcon.onmouseout = function(){BX.removeClass(this, "lhe-tlbr-just-over");};
			pList.arJustify[i].pIcon.onmousedown = function()
			{
				if(pList.pLEditor.sEditorMode != 'code') // Exec command for WYSIWYG
					pList.pLEditor.SelectRange(pList.pLEditor.oPrevRange);

				var ind = pList.arJustifyInd[this.id.substr("lhe_btn_".length)];
				pList.oBut.SetJustify(pList.arJustify[ind], pList);
			};
		}
	},
	SetJustify: function(Justify, pList)
	{
		// 1. Set icon
		pList.pWnd.id = "lhe_btn_" + Justify.id.toLowerCase() + "_l";
		pList.pWnd.title = BX.message.ImgAlign + ": " + Justify.name;

		// 2. Set selected
		pList.selected = Justify;

		// Exec command for BB codes
		if (pList.pLEditor.sEditorMode == 'code' && pList.pLEditor.bBBCode)
			pList.pLEditor.FormatBB({tag: Justify.bb});
		else if(pList.pLEditor.sEditorMode != 'code') // Exec command for WYSIWYG
		{
			pList.pLEditor.executeCommand(Justify.cmd);
			if (pList.pLEditor.bBBCode)
			{
				setTimeout(function()
				{
					var
						i, node,
						arNodes = [],
						arDiv = pList.pLEditor.pEditorDocument.getElementsByTagName("DIV"),
						arP = pList.pLEditor.pEditorDocument.getElementsByTagName("P");

					for(i = 0; i < arDiv.length; i++)
						arNodes.push(arDiv[i]);
					for(i = 0; i < arP.length; i++)
						arNodes.push(arP[i]);

					for(i = 0; i < arNodes.length; i++)
					{
						node = arNodes[i];
						if (node && node.nodeType == 1 && node.childNodes.length > 0 && node.getAttribute("align"))
							node.innerHTML = node.innerHTML.replace(/<span[^>]*?text-align[^>]*?>((?:\s|\S)*?)<\/span>/ig, "$1");
					}
				}, 100);
			}
		}

		// Close
		if (pList.bOpened)
			pList.Close();
	},
	parser: {
		name: 'align',
		obj:{
			Parse: function(sName, sContent, pLEditor)
			{
				if (BX.browser.IsIE())
					sContent = sContent.replace(/<span[^>]*?text\-align\:((?:\s|\S)*?);display\:block;[^>]*?>((?:\s|\S)*?)<\/span>/ig, "<p align=\"$1\">$2</p>");

				if (!pLEditor.bBBCode)
					return sContent;

				var align, key, arJus = ['left', 'right', 'center', 'justify'];

				for(key in arJus)
				{
					align = arJus[key];
					sContent = sContent.replace(new RegExp(BX.util.preg_quote("\[" + align + "\]"), "ig"), '<div align="' + align + '" id="' + pLEditor.SetBxTag(false, {tag: 'align'}) + '">');
					sContent = sContent.replace(new RegExp(BX.util.preg_quote("\[\/" + align + "\]"), "ig"), '</div>');
				}
				return sContent;
			},
			UnParse: function(bxTag, pNode, pLEditor)
			{
				// Called only for BB codes
				if (bxTag.tag == 'align' && (pNode.arAttributes.align || pNode.arStyle.textAlign))
				{
					var align = pNode.arStyle.textAlign || pNode.arAttributes.align;
					align = align.toUpperCase();
					var i, l = pNode.arNodes.length, res = "[" + align + "]";
					for (i = 0; i < l; i++)
						res += pLEditor._RecursiveGetHTML(pNode.arNodes[i]);
					res += "[/" + align + "]";
					return res;
				}
				return "";
			}
		}
	}
};

LHEButtons['InsertOrderedList'] =
{
	id : 'InsertOrderedList',
	name : BX.message.OrderedList,
	cmd : 'InsertOrderedList',
	OnBeforeCreate: function(pLEditor, pBut)
	{
		// Disable in non BBCode mode in html
		pBut.disableOnCodeView = !pLEditor.bBBCode || pLEditor.arConfig.bConvertContentFromBBCodes;
		return pBut;
	},
	bbHandler: function(pBut)
	{
		pBut.pLEditor.OpenDialog({id: 'List', obj: false, bOrdered: true, bEnterClose: false});
	}
};
LHEButtons['InsertUnorderedList'] =
{
	id : 'InsertUnorderedList',
	name : BX.message.UnorderedList,
	cmd : 'InsertUnorderedList',
	OnBeforeCreate: function(pLEditor, pBut)
	{
		// Disable in non BBCode mode in html
		pBut.disableOnCodeView = !pLEditor.bBBCode || pLEditor.arConfig.bConvertContentFromBBCodes;
		return pBut;
	},
	bbHandler: function(pBut)
	{
		pBut.pLEditor.OpenDialog({ id: 'List', obj: false, bOrdered: false, bEnterClose: false});
	}
};

LHEButtons['Outdent'] = {id : 'Outdent', name : BX.message.Outdent, cmd : 'Outdent', bBBHide: true};
LHEButtons['Indent'] = {id : 'Indent', name : BX.message.Indent, cmd : 'Indent', bBBHide: true};

LHEButtons['Video'] = {
	id: 'Video',
	name: BX.message.InsertVideo,
	name_edit: BX.message.EditVideo,
	handler: function(pBut)
	{
		pBut.pLEditor.OpenDialog({ id: 'Video', obj: false});
	},
	parser:
	{
		name: "video",
		obj:
		{
			Parse: function(sName, sContent, pLEditor)
			{
				// **** Parse WMV ****
				// b1, b3 - quotes
				// b2 - id of the div
				// b4 - javascript config
				var ReplaceWMV = function(str, b1, b2, b3, b4)
				{
					var
						id = b2,
						JSConfig, w, h, prPath, bgimg = '';

					try {eval('JSConfig = ' + b4); } catch (e) { JSConfig = false; }
					if (!id || !JSConfig)
						return '';

					w = (parseInt(JSConfig.width) || 50) + 'px';
					h = (parseInt(JSConfig.height) || 25) + 'px';

					if (JSConfig.image)
						bgimg = 'background-image: url(' + JSConfig.image + ')!important; ';

					return '<img class="bxed-video" id="' + pLEditor.SetBxTag(false, {tag: 'video', params: {id: id, JSConfig: JSConfig}}) + '" src="' + pLEditor.oneGif + '" style="' + bgimg + ' width: ' + w + '; height: ' + h + ';" title="' + BX.message.Video + ': ' + JSConfig.file + '"/>';
				}
				sContent = sContent.replace(/<script.*?silverlight\.js.*?<\/script>\s*?<script.*?wmvplayer\.js.*?<\/script>\s*?<div.*?id\s*?=\s*?("|\')(.*?)\1.*?<\/div>\s*?<script.*?jeroenwijering\.Player\(document\.getElementById\(("|\')\2\3.*?wmvplayer\.xaml.*?({.*?})\).*?<\/script>/ig, ReplaceWMV);

				// **** Parse FLV ****
				var ReplaceFLV = function(str, attr)
				{
					attr = attr.replace(/[\r\n]+/ig, ' ');
					attr = attr.replace(/\s+/ig, ' ');
					attr = BX.util.trim(attr);
					var
						arParams = {},
						arFlashvars = {},
						w, h, id, prPath, bgimg = '';

					attr.replace(/([^\w]??)(\w+?)\s*=\s*("|\')([^\3]+?)\3/ig, function(s, b0, b1, b2, b3)
					{
						b1 = b1.toLowerCase();
						if (b1 == 'src' || b1 == 'type' || b1 == 'allowscriptaccess' || b1 == 'allowfullscreen' || b1 == 'pluginspage' || b1 == 'wmode')
							return '';
						arParams[b1] = b3; return b0;
					});

					if (!arParams.flashvars || !arParams.id)
						return str;

					arParams.flashvars += '&';
					arParams.flashvars.replace(/(\w+?)=((?:\s|\S)*?)&/ig, function(s, name, val) { arFlashvars[name] = val; return ''; });
					w = (parseInt(arParams.width) || 50) + 'px';
					h = (parseInt(arParams.height) || 25) + 'px';
					arParams.flashvars = arFlashvars;

					if (arFlashvars.image)
						bgimg = 'background-image: url(' + arFlashvars.image + ')!important; ';

					return '<img class="bxed-video" id="' + pLEditor.SetBxTag(false, {tag: 'video', params: arParams}) + '" src="' + pLEditor.oneGif + '" style="' + bgimg + ' width: ' + w + '; height: ' + h + ';" title="' + BX.message.Video + ': ' + arParams.flashvars.file + '"/>';
				}

				sContent = sContent.replace(/<embed((?:\s|\S)*?player\/mediaplayer\/player\.swf(?:\s|\S)*?)(?:>\s*?<\/embed)?(?:\/?)?>/ig, ReplaceFLV);

				return sContent;
			},
			UnParse: function(bxTag, pNode, pLEditor)
			{
				if (!bxTag.params)
					return '';

				var
					arParams = bxTag.params, i, str;

				var arVidConf = pLEditor.arConfig.videoSettings;
				if (arVidConf.maxWidth && arParams.width && parseInt(arParams.width) > parseInt(arVidConf.maxWidth))
					arParams.width = arVidConf.maxWidth;
				if (arVidConf.maxHeight && arParams.height && parseInt(arParams.height) > parseInt(arVidConf.maxHeight))
					arParams.height = arVidConf.maxHeight;

				if (arParams['flashvars']) // FLV
				{
					str = '<embed src="/bitrix/components/bitrix/player/mediaplayer/player" type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" pluginspage="http:/' + '/www.macromedia.com/go/getflashplayer" ';
					str += 'id="' + arParams.id + '" ';
					if (arVidConf.WMode)
						str += 'WMode="' + arVidConf.WMode + '" ';

					for (i in arParams)
					{
						if (i == 'flashvars')
						{
							if (arVidConf.bufferLength)
								arParams[i].bufferlength = arVidConf.bufferLength;
							if (arVidConf.skin)
								arParams[i].skin = arVidConf.skin;
							if (arVidConf.logo)
								arParams[i].logo = arVidConf.logo;
							str += 'flashvars="';
							for (k in arParams[i])
								str += k + '=' + arParams[i][k] + '&';
							str = str.substring(0, str.length - 1) + '" ';
						}
						else
						{
							str += i + '="' + arParams[i] + '" ';
						}
					}
					str += '></embed>';
				}
				else // WMV
				{

					str = '<script type="text/javascript" src="/bitrix/components/bitrix/player/wmvplayer/silverlight.js" /></script>' +
				'<script type="text/javascript" src="/bitrix/components/bitrix/player/wmvplayer/wmvplayer.js"></script>' +
				'<div id="' + arParams.id + '">WMV Player</div>' +
				'<script type="text/javascript">new jeroenwijering.Player(document.getElementById("' + arParams.id + '"), "/bitrix/components/bitrix/player/wmvplayer/wmvplayer.xaml", {';

					if (arVidConf.bufferLength)
						arParams.JSConfig.bufferlength = arVidConf.bufferLength;
					if (arVidConf.logo)
						arParams.JSConfig.logo = arVidConf.logo;
					if (arVidConf.windowless)
						arParams.JSConfig.windowless = arVidConf.windowless ? true : false;

					for (i in arParams.JSConfig)
						str += i + ': "' + arParams.JSConfig[i] + '", ';
					str = str.substring(0, str.length - 2);

					str += '});</script>';
				}
				return str;
			}
		}
	}
};

LHEButtons['SmileList'] = {
	id : 'SmileList',
	name : BX.message.SmileList,
	bBBShow: true,
	type: 'List',
	OnBeforeCreate: function(pLEditor, pBut)
	{
		if (pLEditor.arConfig.arSmiles.length <= 0)
			return false;
		return pBut;
	},
	OnAfterCreate: function(pLEditor, pList)
	{
		var n = parseInt(pLEditor.arConfig.smileCountInToolbar);
		// Display some smiles just in toolbar for easy access
		if (n > 0)
		{
			var
				arSmiles = pLEditor.arConfig.arSmiles,
				i, l = arSmiles.length,
				smileTable = pList.pWnd.parentNode.appendChild(BX.create("TABLE", {props: {className: "lhe-smiles-tlbr-table"}})),
				r = smileTable.insertRow(-1),
				pImg, oSmile, pSmile, k, arImg = [];

			pList.oSmiles = {};
			for (i = 0; i < n; i++)
			{
				oSmile = arSmiles[i];
				if (typeof oSmile != 'object' || !oSmile.path || !oSmile.code)
					continue;

				k = 'smile_' + i + '_' + pLEditor.id;
				pSmile = r.insertCell(-1).appendChild(BX.create("DIV", {props: {className: 'lhe-tlbr-smile-cont', title: oSmile.name || '', id: k}}));
				pImg = pSmile.appendChild(BX.create("IMG", {props: {src: oSmile.path}}));
				pList.oSmiles[k] = oSmile;

				pSmile.onmousedown = function()
				{
					//pLEditor.oPrevRange = pLEditor.GetSelectionRange();
					pList.oBut.SetSmile(this.id, pList);
				};
				pSmile.onmouseover = function(){BX.addClass(this, "lhe-tlbr-smile-over");};
				pSmile.onmouseout = function(){BX.removeClass(this, "lhe-tlbr-smile-over");};

				arImg.push(pImg);
			}

			BX.addClass(pList.pWnd, "lhe-tlbr-smile-more");
			pList.pWnd.id = "";
			r.insertCell(-1).appendChild(pList.pWnd);
			smileTable.parentNode.style.width = (parseInt(smileTable.offsetWidth) + 16 /*left margin*/) + "px";

			var adjustSmiles = function()
			{
				var i, n = arImg.length;
				for (i = 0; i < n; i++)
				{
					arImg[i].removeAttribute('height');
					arImg[i].style.height = 'auto';
					arImg[i].style.width = 'auto';
				}

				setTimeout(function(){
					for (i = 0; i < n; i++)
					{
						var
							h = arImg[i].offsetHeight,
							w = arImg[i].offsetWidth;

						if (h > 20)
						{
							arImg[i].style.height = "20px";
							arImg[i].height = "20";
							h = 20;
						}

						arImg[i].style.marginTop = Math.round((20 - h) / 2) + "px";

						if (w > 20)
						{
							arImg[i].parentNode.style.width = arImg[i].offsetWidth + "px";
							w = 20;
						}
						arImg[i].style.marginLeft = Math.round((20 - w) / 2) + "px";
						arImg[i].style.visibility = "visible";
					}
					smileTable.parentNode.style.width = (parseInt(smileTable.offsetWidth) + 16 /*left margin*/) + "px";
				}, 10);
			};

			BX.addCustomEvent(pLEditor, 'onShow', function()
			{
				adjustSmiles();
				setTimeout(adjustSmiles, 1000);
			});
		}
	},
	OnCreate: function(pList)
	{
		var
			arSmiles = pList.pLEditor.arConfig.arSmiles,
			l = arSmiles.length, row,
		pImg, pSmile, i, oSmile, k;

		if (l <= 0)
			return;

		pList.pValuesCont.style.width = '100px';
		pList.oSmiles = {};

		var cells = Math.round(Math.sqrt(l * 4 / 3));
		var pTable = pList.pValuesCont.appendChild(BX.create("TABLE", {props: {className: 'lhe-smiles-cont'}}));
		for (i = 0; i < l; i++)
		{
			oSmile = arSmiles[i];
			if (typeof oSmile != 'object' || !oSmile.path || !oSmile.code)
				continue;

			k = 'smile_' + i + '_' + pList.pLEditor.id;
			pSmile = BX.create("DIV", {props: {className: 'lhe-smile-cont', title: oSmile.name || '', id: k}});
			pImg = pSmile.appendChild(BX.create("IMG", {props: {src: oSmile.path, className: 'lhe-smile'}}));

			pImg.onerror = function(){var d = this.parentNode; d.parentNode.removeChild(d);};

			pList.oSmiles[k] = oSmile;

			pSmile.onmousedown = function(){pList.oBut.SetSmile(this.id, pList);};
			pSmile.onmouseover = function(){this.className = 'lhe-smile-cont lhe-smile-cont-over';};
			pSmile.onmouseout = function(){this.className = 'lhe-smile-cont';};

			if (i % cells == 0)
				row = pTable.insertRow(-1);
			row.insertCell(-1).appendChild(pSmile);
		}

		while (row.cells.length < cells)
			row.insertCell(-1);

		if (pTable.offsetWidth > 0)
		{
			pList.pValuesCont.style.width = pTable.offsetWidth + 2 + "px";
		}
		else
		{
			var count = 0;
			// First attempt to adjust smiles
			var ai = setInterval(function(){
				if (pTable.offsetWidth > 0)
				{
					pList.pValuesCont.style.width = pTable.offsetWidth + 2 + "px";
					clearInterval(ai);
				}
				count++;
				if (count > 100)
				{
					clearInterval(ai);
					pList.pValuesCont.style.width = "180px";
				}
			}, 5);
		}

		// Second attempt to adjust smiles
		if (pImg)
			pImg.onload = function()
			{
				pList.pValuesCont.style.width = "";
				setTimeout(function(){pList.pValuesCont.style.width = pTable.offsetWidth + 2 + "px";}, 50);
			};
	},
	SetSmile: function(k, pList)
	{
		//pList.pLEditor.RestoreSelectionRange();
		var oSmile = pList.oSmiles[k];

		if (pList.pLEditor.sEditorMode == 'code') // In BB or in HTML
			pList.pLEditor.WrapWith(false, false, oSmile.code);
		else // WYSIWYG
			pList.pLEditor.InsertHTML('<img id="' + pList.pLEditor.SetBxTag(false, {tag: "smile", params: oSmile}) + '" src="' + oSmile.path + '" title="' + oSmile.name + '"/>');

		if (pList.bOpened)
			pList.Close();
	},
	parser:
	{
		name: "smile",
		obj: {
			Parse: function(sName, sContent, pLEditor)
			{
				// Smiles
				if (pLEditor.sortedSmiles)
				{
					// Cut tags
					var arTags = [];
					sContent = sContent.replace(/\<(?:\s|\S)*?>/ig, function(str)
					{
						arTags.push(str);
						return '#BXTAG' + (arTags.length - 1) + '#';
					});

					var i, l = pLEditor.sortedSmiles.length, smile;
					for (i = 0; i < l; i++)
					{
						smile = pLEditor.sortedSmiles[i];
						if (smile.path && smile.code)
							sContent = sContent.replace(new RegExp(BX.util.preg_quote(smile.code), 'ig'),
							'<img id="' + pLEditor.SetBxTag(false, {tag: "smile", params: smile}) + '" src="' + smile.path + '" title="' + smile.name + '"/>');
					}

					// Set tags back
					if (arTags.length > 0)
						sContent = sContent.replace(/#BXTAG(\d+)#/ig, function(s, num){return arTags[num] || s;});
				}
				return sContent;
			},
			UnParse: function(bxTag, pNode, pLEditor)
			{
				if (!bxTag.params || !bxTag.params.code)
					return '';
				return bxTag.params.code;
			}
		}
	}
};


LHEButtons['HeaderList'] = {
	id : 'HeaderList',
	name : BX.message.HeaderList,
	bBBHide: true,
	type: 'List',
	handler: function() {},
	OnCreate: function(pList)
	{
		var
			pIt, pItem, i, oItem;

		pList.arItems = [
			{value: 'p', name: BX.message.Normal},
			{value: 'h1', name: BX.message.Heading + ' 1'},
			{value: 'h2', name: BX.message.Heading + ' 2'},
			{value: 'h3', name: BX.message.Heading + ' 3'},
			{value: 'h4', name: BX.message.Heading + ' 4'},
			{value: 'h5', name: BX.message.Heading + ' 5'},
			{value: 'h6', name: BX.message.Heading + ' 6'},
			{value: 'pre', name: BX.message.Preformatted}
		];

		var innerCont = BX.create("DIV", {props: {className: 'lhe-header-innercont'}});

		for (i = 0; i < pList.arItems.length; i++)
		{
			oItem = pList.arItems[i];
			if (typeof oItem != 'object' || !oItem.name)
				continue;

			pItem = BX.create("DIV", {props: {className: 'lhe-header-cont', title: oItem.name, id: 'lhe_header__' + i}});
			pItem.appendChild(BX.create(oItem.value.toUpperCase(), {text: oItem.name}));

			pItem.onmousedown = function(){pList.oBut.Select(pList.arItems[this.id.substring('lhe_header__'.length)], pList);};
			pItem.onmouseover = function(){this.className = 'lhe-header-cont lhe-header-cont-over';};
			pItem.onmouseout = function(){this.className = 'lhe-header-cont';};

			oItem.pWnd = innerCont.appendChild(pItem);
		}
		pList.pValuesCont.appendChild(innerCont);
	},
	OnOpen: function(pList)
	{
		var
			frm = pList.pLEditor.queryCommand('FormatBlock'),
			i, v;

		if (pList.pSelectedItemId >= 0)
			pList.SelectItem(false);

		if (!frm)
			frm = 'p';
		for (i = 0; i < pList.arItems.length; i++)
		{
			v = pList.arItems[i];
			if (v.value == frm)
			{
				pList.pSelectedItemId = i;
				pList.SelectItem(true);
			}
		}
	},
	Select: function(oItem, pList)
	{
		pList.pLEditor.SelectRange(pList.pLEditor.oPrevRange);
		pList.pLEditor.executeCommand('FormatBlock', '<' + oItem.value + '>');
		pList.Close();
	}
};

LHEButtons['FontList'] = {
	id : 'FontList',
	name : BX.message.FontList,
	//bBBHide: true,
	type: 'List',
	handler: function() {},
	OnBeforeCreate: function(pLEditor, pBut)
	{
		// Disable in non BBCode mode in html
		pBut.disableOnCodeView = !pLEditor.bBBCode || pLEditor.arConfig.bConvertContentFromBBCodes;
		return pBut;
	},
	OnCreate: function(pList)
	{
		var
			pIt, pItem, i, oItem, font;

		pList.arItems = [];
		for (i in pList.pLEditor.arConfig.arFonts)
		{
			font = pList.pLEditor.arConfig.arFonts[i];
			if (typeof font == 'string')
				pList.arItems.push({value: font, name: font});
		}

		for (i = 0; i < pList.arItems.length; i++)
		{
			oItem = pList.arItems[i];
			if (typeof oItem != 'object' || !oItem.name)
				continue;

			pItem = BX.create("DIV", {props: {className: 'lhe-list-item-cont', title: oItem.name, id: 'lhe_font__' + i}});
			pItem.appendChild(BX.create('SPAN', {props: {className: 'lhe-list-font-span'}, style: {fontFamily: oItem.value}, text: oItem.name}));


			pItem.onmousedown = function(){pList.oBut.Select(pList.arItems[this.id.substring('lhe_font__'.length)], pList);};
			pItem.onmouseover = function(){this.className = 'lhe-list-item-cont lhe-list-item-cont-over';};
			pItem.onmouseout = function(){this.className = 'lhe-list-item-cont';};

			oItem.pWnd = pList.pValuesCont.appendChild(pItem);
		}
	},
	OnOpen: function(pList)
	{
		var
			frm = pList.pLEditor.queryCommand('FontName'),
			i, v;
		if (pList.pSelectedItemId >= 0)
			pList.SelectItem(false);

		if (!frm)
			frm = 'p';
		for (i = 0; i < pList.arItems.length; i++)
		{
			v = pList.arItems[i];
			if (v.value.toLowerCase() == frm.toLowerCase())
			{
				pList.pSelectedItemId = i;
				pList.SelectItem(true);
			}
		}
	},
	Select: function(oItem, pList)
	{
		pList.pLEditor.RestoreSelectionRange();

		if (pList.pLEditor.sEditorMode == 'code')
		{
			if (pList.pLEditor.bBBCode)
				pList.pLEditor.FormatBB({tag: 'FONT', pBut: pList, value: oItem.value});
		}
		else
		{
			pList.pLEditor.executeCommand('FontName', oItem.value);
		}
		pList.Close();
	}
};

LHEButtons['FontSizeList'] = {
	id : 'FontSizeList',
	name : BX.message.FontSizeList,
	type: 'List',
	handler: function() {},
	OnBeforeCreate: function(pLEditor, pBut)
	{
		// Disable in non BBCode mode in html
		pBut.disableOnCodeView = !pLEditor.bBBCode || pLEditor.arConfig.bConvertContentFromBBCodes;
		return pBut;
	},
	OnCreate: function(pList)
	{
		var
			pIt, pItem, i, oItem, fontSize;

		pList.arItems = [];
		for (i in pList.pLEditor.arConfig.arFontSizes)
		{
			fontSize = pList.pLEditor.arConfig.arFontSizes[i];
			if (typeof fontSize == 'string')
				pList.arItems.push({value: parseInt(i), name: fontSize});
		}

		for (i = 0; i < pList.arItems.length; i++)
		{
			oItem = pList.arItems[i];
			if (typeof oItem != 'object' || !oItem.name)
				continue;

			pItem = BX.create("DIV", {props: {className: 'lhe-list-item-cont', title: oItem.name, id: 'lhe_font_size__' + i}});
			pItem.appendChild(BX.create('SPAN', {props: {className: 'lhe-list-font-span'}, style: {fontSize: oItem.name}, text: oItem.name}));

			if (BX.browser.IsIE() && !BX.browser.IsDoctype())
				pItem.style.width = "200px";


			pItem.onmousedown = function(){pList.oBut.Select(pList.arItems[this.id.substring('lhe_font_size__'.length)], pList);};
			pItem.onmouseover = function(){this.className = 'lhe-list-item-cont lhe-list-item-cont-over';};
			pItem.onmouseout = function(){this.className = 'lhe-list-item-cont';};

			oItem.pWnd = pList.pValuesCont.appendChild(pItem);
		}
	},
	OnOpen: function(pList)
	{
		var
			frm = pList.pLEditor.queryCommand('FontSize'),
			i, v;
		if (pList.pSelectedItemId >= 0)
			pList.SelectItem(false);

		if (!frm)
			frm = 'p';
		frm = frm.toString().toLowerCase();
		for (i = 0; i < pList.arItems.length; i++)
		{
			v = pList.arItems[i];
			if (v.value.toString().toLowerCase() == frm)
			{
				pList.pSelectedItemId = i;
				pList.SelectItem(true);
			}
		}
	},
	Select: function(oItem, pList)
	{
		pList.pLEditor.RestoreSelectionRange();
		if (pList.pLEditor.sEditorMode == 'code')
		{
			if (pList.pLEditor.bBBCode)
				pList.pLEditor.FormatBB({tag: 'SIZE', pBut: pList, value: oItem.value});
		}
		else
		{
			pList.pLEditor.executeCommand('FontSize', oItem.value);
		}
		pList.Close();
	}
};

LHEButtons['BackColor'] = {
	id : 'BackColor',
	name : BX.message.BackColor,
	bBBHide: true,
	type: 'Colorpicker',
	OnSelect: function(color, pCol)
	{
		if(BX.browser.IsIE())
		{
			pCol.pLEditor.executeCommand('BackColor', color || '');
		}
		else
		{
			try{
				pCol.pLEditor.pEditorDocument.execCommand("styleWithCSS", false, true);
				if (!color)
					pCol.pLEditor.executeCommand('removeFormat');
				else
					pCol.pLEditor.executeCommand('hilitecolor', color);

				pCol.pLEditor.pEditorDocument.execCommand("styleWithCSS", false, false);
			}catch(e){}
		}
	}
};

LHEButtons['ForeColor'] = {
	id : 'ForeColor',
	name : BX.message.ForeColor,
	type: 'Colorpicker',
	OnBeforeCreate: function(pLEditor, pBut)
	{
		// Disable in non BBCode mode in html
		pBut.disableOnCodeView = !pLEditor.bBBCode || pLEditor.arConfig.bConvertContentFromBBCodes;
		return pBut;
	},
	OnSelect: function(color, pCol)
	{
		if (pCol.pLEditor.sEditorMode == 'code')
		{
			if (pCol.pLEditor.bBBCode)
				pCol.pLEditor.FormatBB({tag: 'COLOR', pBut: pCol, value: color});
		}
		else
		{
			if (!color && !BX.browser.IsIE())
				pCol.pLEditor.executeCommand('removeFormat');
			else
				pCol.pLEditor.executeCommand('ForeColor', color || '');
		}
	}
};

LHEButtons['Table'] = {
	id : 'table',
	name : BX.message.InsertTable,
	OnBeforeCreate: function(pLEditor, pBut)
	{
		// Disable in non BBCode mode in html
		pBut.disableOnCodeView = !pLEditor.bBBCode || pLEditor.arConfig.bConvertContentFromBBCodes;
		return pBut;
	},
	handler : function (pBut)
	{
		pBut.pLEditor.OpenDialog({ id: 'Table'});
	}
};

//CONTEXT MENU
var LHEContMenu = {};
LHEContMenu["A"] = [LHEButtons['CreateLink'], LHEButtons['DeleteLink']];
LHEContMenu["IMG"] = [LHEButtons['Image']];
LHEContMenu["VIDEO"] = [LHEButtons['Video']];
/* End */
;
; /* Start:/bitrix/js/fileman/light_editor/le_core.js*/
function JCLightHTMLEditor(arConfig) {this.Init(arConfig);}

JCLightHTMLEditor.items = {};

JCLightHTMLEditor.prototype = {
Init: function(arConfig)
{
	this.id = arConfig.id;
	JCLightHTMLEditor.items[this.id] = this;

	var _this = this;
	this.arConfig = arConfig;
	this.bxTags = {};
	this.bFocused = false;

	this.bPopup = false;
	this.buttonsIndex = {};
	this.parseAlign = true;
	this.parseTable = true;
	this.lastCursorId = 'bxed-last-cursor';
	this.bHandleOnPaste = this.arConfig.bHandleOnPaste !== false;

	this.arBBTags = ['p', 'u', 'div', 'table', 'tr', 'td', 'th', 'img', 'a', 'center', 'left', 'right', 'justify'];
	this._turnOffCssCount = 0;

	if (this.arConfig.arBBTags)
		this.arBBTags = this.arBBTags.concat(this.arConfig.arBBTags);

	this.arConfig.width = this.arConfig.width ? parseInt(this.arConfig.width) + (this.arConfig.width.indexOf('%') == -1 ? "px" : '%') : "100%";
	this.arConfig.height = this.arConfig.height ? parseInt(this.arConfig.height) + (this.arConfig.height.indexOf('%') == -1 ? "px" : '%') : "100%";
	this.SetConstants();
	this.sEditorMode = 'html';
	this.toolbarLineCount = 1;

	this.CACHE = {};
	this.arVideos = {};

	// Set content from config;
	this.content = this.arConfig.content;
	this.oSpecialParsers = {};
	BX.onCustomEvent(window, 'LHE_OnBeforeParsersInit', [this]);

	this.oSpecialParsers.cursor = {
		Parse: function(sName, sContent, pLEditor)
		{
			return sContent.replace(/#BXCURSOR#/ig, '<span id="' + pLEditor.lastCursorId + '"></span>');
		},
		UnParse: function(bxTag, pNode, pLEditor)
		{
			return '#BXCURSOR#';
		}
	};

	if (arConfig.parsers)
	{
		for (var p in arConfig.parsers)
		{
			if (arConfig.parsers[p])
				this.oSpecialParsers[p] = arConfig.parsers[p];
		}
	}

	this.bDialogOpened = false;

	// Sceleton
	this.pFrame = BX('bxlhe_frame_' + this.id);
	if (!this.pFrame)
		return;

	this.pFrame.style.display = "block";

	this.pFrame.style.width = this.arConfig.width;
	this.pFrame.style.height = this.arConfig.height;

	this.pFrameTable = this.pFrame.firstChild;
	this.pButtonsCell = this.pFrameTable.rows[0].cells[0];
	this.pButtonsCont = this.pButtonsCell.firstChild;
	this.pEditCont = this.pFrameTable.rows[1].cells[0];

	if (this.arConfig.height.indexOf('%') == -1)
	{
		var h = parseInt(this.arConfig.height) - this.toolbarLineCount * 27;
		if (h > 0)
			this.pEditCont.style.height = h + 'px';
	}

	// iFrame
	this.CreateFrame();

	// Textarea
	this.pSourceDiv = this.pEditCont.appendChild(BX.create("DIV", {props: {className: 'lha-source-div' }}));
	this.pTextarea = this.pSourceDiv.appendChild(BX.create("TEXTAREA", {props: {className: 'lha-textarea', rows: 25, id: this.arConfig.inputId}}));
	this.pHiddenInput = this.pFrame.appendChild(BX.create("INPUT", {props: {type: 'hidden', name: this.arConfig.inputName}}));

	this.pTextarea.onfocus = function(){_this.bTextareaFocus = true;};
	this.pTextarea.onblur = function(){_this.bTextareaFocus = false;};

	this.pTextarea.style.fontFamily = this.arConfig.fontFamily;
	this.pTextarea.style.fontSize = this.arConfig.fontSize;
	this.pTextarea.style.fontSize = this.arConfig.lineHeight;

	if (this.pHiddenInput.form)
	{
		BX.bind(this.pHiddenInput.form, 'submit', function(){
			try{
				_this.SaveContent();
				_this.pHiddenInput.value = _this.pTextarea.value = _this.pHiddenInput.value.replace(/#BXCURSOR#/ig, '');
			}
			catch(e){}
		});
	}

	// Sort smiles
	if (this.arConfig.arSmiles && this.arConfig.arSmiles.length > 0)
	{
		this.sortedSmiles = [];
		var i, l, smile, j, k, arCodes;
		for (i = 0, l = this.arConfig.arSmiles.length; i < l; i++)
		{
			smile = this.arConfig.arSmiles[i];
			if (!smile['codes'] || smile['codes'] == smile['code'])
			{
				this.sortedSmiles.push(smile);
			}
			else if(smile['codes'].length > 0)
			{
				arCodes = smile['codes'].split(' ');
				for(j = 0, k = arCodes.length; j < k; j++)
					this.sortedSmiles.push({name: smile.name, path: smile.path, code: arCodes[j]});
			}
		}

		//this.sortedSmiles = BX.clone(this.arConfig.arSmiles);
		this.sortedSmiles = this.sortedSmiles.sort(function(a, b){return b.code.length - a.code.length;});
	}

	if (!this.arConfig.bBBCode && this.arConfig.bConvertContentFromBBCodes)
		this.arConfig.bBBCode = true;

	this.bBBCode = this.arConfig.bBBCode;
	if (this.bBBCode)
	{
		if (this.InitBBCode && typeof this.InitBBCode == 'function')
			this.InitBBCode();
	}

	this.bBBParseImageSize = this.arConfig.bBBParseImageSize;

	if (this.arConfig.bResizable)
	{
		if (this.arConfig.bManualResize)
		{
			this.pResizer = BX('bxlhe_resize_' + this.id);
			/*this.pResizer.style.width = this.arConfig.width;*/
			this.pResizer.title = BX.message.ResizerTitle;

			if (!this.arConfig.minHeight || parseInt(this.arConfig.minHeight) <= 0)
				this.arConfig.minHeight = 100;
			if (!this.arConfig.maxHeight || parseInt(this.arConfig.maxHeight) <= 0)
				this.arConfig.maxHeight = 2000;

			this.pResizer.unselectable = "on";
			this.pResizer.ondragstart = function (e){return BX.PreventDefault(e);};
			this.pResizer.onmousedown = function(){_this.InitResizer(); return false;};
		}

		if (this.arConfig.bAutoResize)
		{
			BX.bind(this.pTextarea, 'keydown', BX.proxy(this.AutoResize, this));
			BX.addCustomEvent(this, 'onShow', BX.proxy(this.AutoResize, this));
		}
	}

	// Add buttons
	this.AddButtons();

	// Check if ALIGN tags allowed
	this.parseAlign = !!(this.buttonsIndex['Justify'] || this.buttonsIndex['JustifyLeft']);
	this.parseTable = !!this.buttonsIndex['Table'];

	if (!this.parseAlign || !this.parseTable)
	{
		var arBBTags = [];
		for (var k in this.arBBTags)
		{
			// Align tags
			if (!this.parseAlign && (
				this.arBBTags[k] == 'center' || this.arBBTags[k] ==  'left' ||
				this.arBBTags[k] ==  'right' || this.arBBTags[k] == 'justify'
			))
				continue;

			// Table tags
			if (!this.parseTable && (
				this.arBBTags[k] == 'table' || this.arBBTags[k] ==  'tr' ||
					this.arBBTags[k] ==  'td' || this.arBBTags[k] == 'th'
				))
				continue;

			arBBTags.push(this.arBBTags[k]);
		}
		this.arBBTags = arBBTags;
	}

	this.SetContent(this.content);
	this.SetEditorContent(this.content);
	this.oTransOverlay = new LHETransOverlay({zIndex: 995}, this);
	// TODO: Fix it
	//this.oContextMenu = new LHEContextMenu({zIndex: 1000}, this);

	BX.onCustomEvent(window, 'LHE_OnInit', [this, false]);

	// Init events
	BX.bind(this.pEditorDocument, 'click', BX.proxy(this.OnClick, this));
	BX.bind(this.pEditorDocument, 'mousedown', BX.proxy(this.OnMousedown, this));
	//BX.bind(this.pEditorDocument, 'contextmenu', BX.proxy(this.OnContextMenu, this));

	if (this.arConfig.bSaveOnBlur)
		BX.bind(document, "mousedown", BX.proxy(this.OnDocMousedown, this));

	if (this.arConfig.ctrlEnterHandler && typeof window[this.arConfig.ctrlEnterHandler] == 'function')
		this.ctrlEnterHandler = window[this.arConfig.ctrlEnterHandler];

	// Android < 4.x
	if (BX.browser.IsAndroid() && /Android\s[1-3].[0-9]/i.test(navigator.userAgent))
	{
		this.arConfig.bSetDefaultCodeView = true;
	}

	if (this.arConfig.bSetDefaultCodeView)
	{
		if (this.sourseBut)
			this.sourseBut.oBut.handler(this.sourseBut);
		else
			this.SetView('code');
	}

	BX.ready(function(){
		if (_this.pFrame.offsetWidth == 0 && _this.pFrame.offsetWidth == 0)
		{
			_this.onShowInterval = setInterval(function(){
				if (_this.pFrame.offsetWidth != 0 && _this.pFrame.offsetWidth != 0)
				{
					BX.onCustomEvent(_this, 'onShow');
					clearInterval(_this.onShowInterval);
				}
			}, 500);
		}
		else
		{
			BX.onCustomEvent(_this, 'onShow');
		}
	});

	this.adjustBodyInterval = 1000;
	this._AdjustBodyWidth();
	BX.removeClass(this.pButtonsCont, "lhe-stat-toolbar-cont-preload"); /**/
},

CreateFrame: function()
{
	if (this.iFrame && this.iFrame.parentNode)
	{
		this.pEditCont.removeChild(this.iFrame);
		this.iFrame = null;
	}

	this.iFrame = this.pEditCont.appendChild(BX.create("IFRAME", {props: { id: 'LHE_iframe_' + this.id, className: 'lha-iframe', src: "javascript:void(0)", frameborder: 0}}));

	if (this.iFrame.contentDocument && !BX.browser.IsIE())
		this.pEditorDocument = this.iFrame.contentDocument;
	else
		this.pEditorDocument = this.iFrame.contentWindow.document;
	this.pEditorWindow = this.iFrame.contentWindow;
},

ReInit: function(content)
{
	if (typeof content == 'undefined')
		content = '';
	this.SetContent(content);
	this.CreateFrame();
	this.SetEditorContent(this.content);
	this.SetFocus();

	BX.onCustomEvent(window, 'LHE_OnInit', [this, true]);
},

SetConstants: function()
{
	//this.reBlockElements = /^(BR|TITLE|TABLE|SCRIPT|TR|TBODY|P|DIV|H1|H2|H3|H4|H5|H6|ADDRESS|PRE|OL|UL|LI)$/i;
	this.reBlockElements = /^(TITLE|TABLE|SCRIPT|TR|TBODY|H1|H2|H3|H4|H5|H6|ADDRESS|PRE|OL|UL|LI)$/i;
	this.oneGif = this.arConfig.oneGif;
	this.imagePath = this.arConfig.imagePath;

	if (!this.arConfig.fontFamily)
		this.arConfig.fontFamily = 'Helvetica, Verdana, Arial, sans-serif';
	if (!this.arConfig.fontSize)
		this.arConfig.fontSize = '12px';
	if (!this.arConfig.lineHeight)
		this.arConfig.lineHeight = '16px';

	this.arColors = [
		'#FF0000', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#FF00FF', '#FFFFFF', '#EBEBEB', '#E1E1E1', '#D7D7D7', '#CCCCCC', '#C2C2C2', '#B7B7B7', '#ACACAC', '#A0A0A0', '#959595',
		'#EE1D24', '#FFF100', '#00A650', '#00AEEF', '#2F3192', '#ED008C', '#898989', '#7D7D7D', '#707070', '#626262', '#555', '#464646', '#363636', '#262626', '#111', '#000000',
		'#F7977A', '#FBAD82', '#FDC68C', '#FFF799', '#C6DF9C', '#A4D49D', '#81CA9D', '#7BCDC9', '#6CCFF7', '#7CA6D8', '#8293CA', '#8881BE', '#A286BD', '#BC8CBF', '#F49BC1', '#F5999D',
		'#F16C4D', '#F68E54', '#FBAF5A', '#FFF467', '#ACD372', '#7DC473', '#39B778', '#16BCB4', '#00BFF3', '#438CCB', '#5573B7', '#5E5CA7', '#855FA8', '#A763A9', '#EF6EA8', '#F16D7E',
		'#EE1D24', '#F16522', '#F7941D', '#FFF100', '#8FC63D', '#37B44A', '#00A650', '#00A99E', '#00AEEF', '#0072BC', '#0054A5', '#2F3192', '#652C91', '#91278F', '#ED008C', '#EE105A',
		'#9D0A0F', '#A1410D', '#A36209', '#ABA000', '#588528', '#197B30', '#007236', '#00736A', '#0076A4', '#004A80', '#003370', '#1D1363', '#450E61', '#62055F', '#9E005C', '#9D0039',
		'#790000', '#7B3000', '#7C4900', '#827A00', '#3E6617', '#045F20', '#005824', '#005951', '#005B7E', '#003562', '#002056', '#0C004B', '#30004A', '#4B0048', '#7A0045', '#7A0026'
	];

	this.systemCSS = "img.bxed-anchor{background-image: url(" + this.imagePath + "lhe_iconkit.gif)!important; background-position: -260px 0!important; height: 20px!important; width: 20px!important;}\n" +
		"body{font-family:" + this.arConfig.fontFamily + "; font-size: " + this.arConfig.fontSize + "; line-height:" + this.arConfig.lineHeight + "}\n" +
		"p{padding:0!important; margin: 0!important;}\n" +
		"span.bxed-noscript{color: #0000a0!important; padding: 2px!important; font-style:italic!important; font-size: 90%!important;}\n" +
		"span.bxed-noindex{color: #004000!important; padding: 2px!important; font-style:italic!important; font-size: 90%!important;}\n" +
		"img.bxed-flash{border: 1px solid #B6B6B8!important; background: url(" + this.imagePath + "flash.gif) #E2DFDA center center no-repeat !important;}\n" +
		"table{border: 1px solid #B6B6B8!important; border-collapse: collapse;}\n" +
		"table td{border: 1px solid #B6B6B8!important; padding: 2px 5px;}\n" +
		"img.bxed-video{border: 1px solid #B6B6B8!important; background-color: #E2DFDA!important; background-image: url(" + this.imagePath + "video.gif); background-position: center center!important; background-repeat:no-repeat!important;}\n" +
		"img.bxed-hr{padding: 2px!important; width: 100%!important; height: 2px!important;}\n";

	if (this.arConfig.documentCSS)
		this.systemCSS += "\n" + this.arConfig.documentCSS;

	this.tabNbsp = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"; // &nbsp; x 6
	this.tabNbspRe1 = new RegExp(String.fromCharCode(160) + String.fromCharCode(160) + String.fromCharCode(160) + String.fromCharCode(160) + String.fromCharCode(160) + String.fromCharCode(160), 'ig'); //
	this.tabNbspRe2 = new RegExp(String.fromCharCode(160) + String.fromCharCode(160) + String.fromCharCode(160) + String.fromCharCode(160) + String.fromCharCode(160) + ' ', 'ig'); //
},

OnMousedown: function(e)
{
	if (!e)
		e = window.event;
	this.bFocused = true;
},

OnClick: function(e)
{
	this.bFocused = true;
	this.CheckBr();
},

OnDblClick: function(e)
{
	return;
},

OnContextMenu: function(e, pElement)
{
	return;
	var
		_this = this,
		oFramePos,
		x, y;
	if (!e) e = this.pEditorWindow.event;

	if(e.pageX || e.pageY)
	{
		x = e.pageX - this.pEditorDocument.body.scrollLeft;
		y = e.pageY - this.pEditorDocument.body.scrollTop;
	}
	else if(e.clientX || e.clientY)
	{
		x = e.clientX;
		y = e.clientY;
	}

	oFramePos = this.CACHE['frame_pos'];
	if (!oFramePos)
		this.CACHE['frame_pos'] = oFramePos = BX.pos(this.pEditCont);

	x += oFramePos.left;
	y += oFramePos.top;

	var targ;
	if (e.target)
		targ = e.target;
	else if (e.srcElement)
		targ = e.srcElement;
	if (targ.nodeType == 3) // defeat Safari bug
		targ = targ.parentNode;

	if (!targ || !targ.nodeName)
		return;
	var res = this.oContextMenu.Show({oPos: {left : x, top : y}, pElement: targ});

	return BX.PreventDefault(e);
},

OnKeyDown: function(e)
{
	if(!e)
		e = window.event;
	BX.onCustomEvent(this, 'OnDocumentKeyDown', [e]);

	var key = e.which || e.keyCode;
	if (e.ctrlKey && !e.shiftKey && !e.altKey)
	{
		// if (!BX.browser.IsIE() && !BX.browser.IsOpera())
		// {
		switch (key)
		{
			case 66 : // B
			case 98 : // b
				this.executeCommand('Bold');
				return BX.PreventDefault(e);
			case 105 : // i
			case 73 : // I
				this.executeCommand('Italic');
				return BX.PreventDefault(e);
			case 117 : // u
			case 85 : // U
				this.executeCommand('Underline');
				return BX.PreventDefault(e);
			case 81 : // Q - quote
				if (this.quoteBut)
				{
					this.quoteBut.oBut.handler(this.quoteBut);
					return BX.PreventDefault(e);
				}
		}
		//}
	}

	if (this.bHandleOnPaste
		&&
		(
			(e.ctrlKey && !e.shiftKey && !e.altKey && e.keyCode == 86) /* Ctrl+V */
				||
				(!e.ctrlKey && e.shiftKey && !e.altKey && e.keyCode == 45) /*Shift+Ins*/
				||
				(e.metaKey && !e.shiftKey && !e.altKey && e.keyCode == 86) /* Cmd+V */
			)
		)
	{
		this.OnPaste();
	}

	// Shift +Del - Deleting code fragment in WYSIWYG
	if (this.bCodeBut && e.shiftKey && e.keyCode == 46 /* Del*/)
	{
		var pSel = this.GetSelectionObject();
		if (pSel)
		{
			if (pSel.className == 'lhe-code')
			{
				pSel.parentNode.removeChild(pSel);
				return BX.PreventDefault(e);
			}
			else if(pSel.parentNode)
			{
				var pCode = BX.findParent(pSel, {className: 'lhe-code'});
				if (pCode)
				{
					pCode.parentNode.removeChild(pCode);
					return BX.PreventDefault(e);
				}
			}
		}
	}

	// Tab
	if (key == 9 && this.arConfig.bReplaceTabToNbsp)
	{
		this.InsertHTML(this.tabNbsp);
		return BX.PreventDefault(e);
	}

	if (this.bCodeBut && e.keyCode == 13)
	{
		if (BX.browser.IsIE() || BX.browser.IsSafari() || BX.browser.IsChrome())
		{
			var pElement = this.GetSelectionObject();
			if (pElement)
			{
				var bFind = false;
				if (pElement && pElement.nodeName && pElement.nodeName.toLowerCase() == 'pre')
					bFind = true;

				if (!bFind)
					bFind = !!BX.findParent(pElement, {tagName: 'pre'});

				if (bFind)
				{
					if (BX.browser.IsIE())
						this.InsertHTML("<br/><img src=\"" + this.oneGif + "\" height=\"20\" width=\"1\"/>");
					else if (BX.browser.IsSafari() || BX.browser.IsChrome())
						this.InsertHTML(" \r\n");

					return BX.PreventDefault(e);
				}
			}
		}
	}

	// Ctrl + Enter
	if ((e.keyCode == 13 || e.keyCode == 10) && e.ctrlKey && this.ctrlEnterHandler)
	{
		this.SaveContent();
		this.ctrlEnterHandler();
	}

	if (this.arConfig.bAutoResize && this.arConfig.bResizable)
	{
		if (this._resizeTimeout)
		{
			clearTimeout(this._resizeTimeout);
			this._resizeTimeout = null;
		}

		this._resizeTimeout = setTimeout(BX.proxy(this.AutoResize, this), 200);
	}

	if (this._CheckBrTimeout)
	{
		clearTimeout(this._CheckBrTimeout);
		this._CheckBrTimeout = null;
	}

	this._CheckBrTimeout = setTimeout(BX.proxy(this.CheckBr, this), 1000);
},

OnDocMousedown: function(e)
{
	if (this.bFocused)
	{
		if (!e)
			e = window.event;

		var pEl;
		if (e.target)
			pEl = e.target;
		else if (e.srcElement)
			pEl = e.srcElement;
		if (pEl.nodeType == 3)
			pEl = pEl.parentNode;

		if (!this.bPopup && !BX.findParent(pEl, {className: 'bxlhe-frame'}))
		{
			this.SaveContent();
			this.bFocused = false;
		}
	}
},

SetView: function(sType)
{
	if (this.sEditorMode == sType)
		return;

	this.SaveContent();
	if (sType == 'code')
	{
		this.iFrame.style.display = "none";
		this.pSourceDiv.style.display = "block";
		this.SetCodeEditorContent(this.GetContent());
	}
	else
	{
		this.iFrame.style.display = "block";
		this.pSourceDiv.style.display = "none";
		this.SetEditorContent(this.GetContent());
		this.CheckBr();
	}
	this.sEditorMode = sType;
	BX.onCustomEvent(this, "OnChangeView");
},

SaveContent: function()
{
	var sContent = this.sEditorMode == 'code' ? this.GetCodeEditorContent() : this.GetEditorContent();
	if (this.bBBCode)
		sContent = this.OptimizeBB(sContent);

	this.SetContent(sContent);

	BX.onCustomEvent(this, 'OnSaveContent', [sContent]);
},

SetContent: function(sContent)
{
	this.pHiddenInput.value = this.pTextarea.value = this.content = sContent;
},

GetContent: function()
{
	return this.content.toString();
},

SetEditorContent: function(sContent)
{
	if (this.pEditorDocument)
	{
		sContent = this.ParseContent(sContent);

		if (this.pEditorDocument.designMode)
		{
			try{
				this.pEditorDocument.designMode = 'off';
			}catch(e){alert('SetEditorContent: designMode=\'off\'');}
		}

		this.pEditorDocument.open();
		this.pEditorDocument.write('<html><head></head><body>' + sContent + '</body></html>');
		this.pEditorDocument.close();

		this.pEditorDocument.body.style.padding = "8px";
		this.pEditorDocument.body.style.margin = "0";
		this.pEditorDocument.body.style.borderWidth = "0";

		this.pEditorDocument.body.style.fontFamily = this.arConfig.fontFamily;
		this.pEditorDocument.body.style.fontSize = this.arConfig.fontSize;
		this.pEditorDocument.body.style.lineHeight = this.arConfig.lineHeight;

		// Set events
		BX.bind(this.pEditorDocument, 'keydown', BX.proxy(this.OnKeyDown, this));

		if(BX.browser.IsIE())
		{
			if (this.bHandleOnPaste)
				BX.bind(this.pEditorDocument.body, 'paste', BX.proxy(this.OnPaste, this));
			this.pEditorDocument.body.contentEditable = true;
		}
		else if (this.pEditorDocument.designMode)
		{
			this.pEditorDocument.designMode = "on";
			this._TurnOffStyleWithCSS(true);
		}

		if (this.arConfig.bConvertContentFromBBCodes)
			this.ShutdownBBCode();
	}
},

_TurnOffStyleWithCSS: function(bTimeout)
{
	try{
		this._turnOffCssCount++;
		if (this._turnOffCssCount < 5 && bTimeout !== false)
			bTimeout = true;

		this.pEditorDocument.execCommand("styleWithCSS", false, false);
		try{this.pEditorDocument.execCommand("useCSS", false, true);}catch(e){}
	}
	catch(e)
	{
		if (bTimeout === true)
			setTimeout(BX.proxy(this._TurnOffStyleWithCSS, this), 500);
	}
},

_AdjustBodyWidth: function()
{
	if (!BX.browser.IsChrome())
	{
		if (this.pEditorDocument && this.pEditorDocument.body)
		{
			var html = this.pEditorDocument.body.innerHTML;
			if (html != this.lastEditedBodyHtml)
			{
				this.adjustBodyInterval = 500;
				var _this = this;
				this.pEditorDocument.body.style.width = null;
				this.lastEditedBodyHtml = html;
				setTimeout(function(){
					var scrollWidth = BX.GetWindowScrollSize(_this.pEditorDocument).scrollWidth - 16;
					if (scrollWidth > 0)
						_this.pEditorDocument.body.style.width = scrollWidth + 'px';
				}, 50);
			}
			else
			{
				this.adjustBodyInterval = 5000;
			}
		}

		setTimeout(BX.proxy(this._AdjustBodyWidth, this), this.adjustBodyInterval)
	}
},

GetEditorContent: function()
{
	var sContent = this.UnParseContent();
	return sContent;
},

SetCodeEditorContent: function(sContent)
{
	this.pHiddenInput.value = this.pTextarea.value = sContent;
},

GetCodeEditorContent: function()
{
	return this.pTextarea.value;
},

OptimizeHTML: function(str)
{
	var
		iter = 0,
		bReplasing = true,
		arTags = ['b', 'em', 'font', 'h\\d', 'i', 'li', 'ol', 'p', 'small', 'span', 'strong', 'u', 'ul'],
		replaceEmptyTags = function(){i--; bReplasing = true; return ' ';},
		re, tagName, i, l;

	while(iter++ < 20 && bReplasing)
	{
		bReplasing = false;
		for (i = 0, l = arTags.length; i < l; i++)
		{
			tagName = arTags[i];
			re = new RegExp('<'+tagName+'[^>]*?>\\s*?</'+tagName+'>', 'ig');
			str = str.replace(re, replaceEmptyTags);

			re = new RegExp('<' + tagName + '\\s+?[^>]*?/>', 'ig');
			str = str.replace(re, replaceEmptyTags);

			// Replace <b>text1</b>    <b>text2</b> ===>>  <b>text1 text2</b>
			re = new RegExp('<((' + tagName + '+?)(?:\\s+?[^>]*?)?)>([\\s\\S]+?)<\\/\\2>\\s*?<\\1>([\\s\\S]+?)<\\/\\2>', 'ig');
			str = str.replace(re, function(str, b1, b2, b3, b4)
				{
					bReplasing = true;
					return '<' + b1 + '>' + b3 + ' ' + b4 + '</' + b2 + '>';
				}
			);
		}
	}
	return str;
},

_RecursiveDomWalker: function(pNode, pParentNode)
{
	var oNode =
	{
		arAttributes : {},
		arNodes : [],
		type : null,
		text : "",
		arStyle : {}
	};

	switch(pNode.nodeType)
	{
		case 9:
			oNode.type = 'document';
			break;
		case 1:
			if(pNode.tagName.length <= 0 || pNode.tagName.substring(0, 1) == "/")
				return;

			oNode.text = pNode.tagName.toLowerCase();
			if (oNode.text == 'script')
				break;

			oNode.type = 'element';
			var
				attr = pNode.attributes,
				j, l = attr.length;

			if (pNode.nodeName.toLowerCase() == 'a' && pNode.innerHTML == '' && (this.bBBCode || !pNode.getAttribute("name")))
				return;

			for(j = 0; j < l; j++)
			{
				if(attr[j].specified || (oNode.text == "input" && attr[j].nodeName.toLowerCase()=="value"))
				{
					var attrName = attr[j].nodeName.toLowerCase();

					if(attrName == "style")
					{
						oNode.arAttributes[attrName] = pNode.style.cssText;
						oNode.arStyle = pNode.style;

						if(oNode.arStyle.display == 'none')
						{
							oNode.type = 'text';
							oNode.text = '';
							break;
						}

						if(oNode.arStyle.textAlign && (oNode.text == 'div' || oNode.text == 'p' || oNode.text == 'span'))
						{
							var align = oNode.arStyle.textAlign;
							BX.util.in_array(oNode.arStyle.textAlign, ['left', 'right', 'center', 'justify'])
							{
								oNode.arStyle = {};
								oNode.text = 'span';
								oNode.arAttributes['style'] = 'text-align:' + align + ';display:block;';
								oNode.arStyle.textAlign = align;
								oNode.arStyle.display = 'block';
							}
						}
					}
					else if(attrName=="src" || attrName=="href"  || attrName=="width"  || attrName=="height")
					{
						oNode.arAttributes[attrName] = pNode.getAttribute(attrName, 2);
					}
					else if(!this.bBBCode && attrName == 'align' && BX.util.in_array(attr[j].nodeValue, ['left', 'right', 'center', 'justify']))
					{
						oNode.text = 'span';
						oNode.arAttributes['style'] = 'text-align:' + attr[j].nodeValue + ';display:block;';
						oNode.arStyle.textAlign = attr[j].nodeValue;
						oNode.arStyle.display = 'block';
					}
					else
					{
						oNode.arAttributes[attrName] = attr[j].nodeValue;
					}
				}
			}
			break;
		case 3:
			oNode.type = 'text';
			var res = pNode.nodeValue;

			if (this.arConfig.bReplaceTabToNbsp)
			{
				res = res.replace(this.tabNbspRe1, "\t");
				res = res.replace(this.tabNbspRe2, "\t");
			}

			if(!pParentNode || (pParentNode.text != 'pre' && pParentNode.arAttributes['class'] != 'lhe-code'))
			{
				res = res.replace(/\n+/g, ' ');
				res = res.replace(/ +/g, ' ');
			}

			oNode.text = res;
			break;
	}

	if (oNode.type != 'text')
	{
		var
			arChilds = pNode.childNodes,
			i, l = arChilds.length;

		for(i = 0; i < l; i++)
			oNode.arNodes.push(this._RecursiveDomWalker(arChilds[i], oNode));
	}

	return oNode;
},

_RecursiveGetHTML: function(pNode)
{
	if (!pNode || typeof pNode != 'object' || !pNode.arAttributes)
		return "";

	var ob, res = "", id = pNode.arAttributes["id"];

	if (pNode.text == 'img' && !id) // Images pasted by Ctrl+V
		id = this.SetBxTag(false, {tag: 'img', params: {src: pNode.arAttributes["src"]}});

	if (id)
	{
		var bxTag = this.GetBxTag(id);
		if(bxTag.tag)
		{
			var parser = this.oSpecialParsers[bxTag.tag];
			if (parser && parser.UnParse)
				return parser.UnParse(bxTag, pNode, this);
			else if (bxTag.params && bxTag.params.value)
				return '\n' + bxTag.params.value + '\n';
			else
				return '';
		}
	}

	if (pNode.arAttributes["_moz_editor_bogus_node"])
		return '';

	if (this.bBBCode)
	{
		var bbRes = this.UnParseNodeBB(pNode);
		if (bbRes !== false)
			return bbRes;
	}

	bFormatted = true;

	if (pNode.text.toLowerCase() != 'body')
		res = this.GetNodeHTMLLeft(pNode);

	var bNewLine = false;

	var sIndent = '';
	if (typeof pNode.bFormatted != 'undefined')
		bFormatted = !!pNode.bFormatted;

	if (bFormatted && pNode.type != 'text')
	{
		if (this.reBlockElements.test(pNode.text) && !(pNode.oParent && pNode.oParent.text && pNode.oParent.text.toLowerCase() == 'pre'))
		{
			for (var j = 0; j < pNode.iLevel - 3; j++)
				sIndent += "  ";
			bNewLine = true;
			res = "\r\n" + sIndent + res;
		}
	}

	for (var i = 0; i < pNode.arNodes.length; i++)
		res += this._RecursiveGetHTML(pNode.arNodes[i]);

	if (pNode.text.toLowerCase() != 'body')
		res += this.GetNodeHTMLRight(pNode);

	if (bNewLine)
		res += "\r\n" + (sIndent == '' ? '' : sIndent.substr(2));

	return res;
},

// Redeclared in BBCode mode
GetNodeHTMLLeft: function(pNode)
{
	if(pNode.type == 'text')
		return BX.util.htmlspecialchars(pNode.text);

	var atrVal, attrName, res;

	if(pNode.type == 'element')
	{
		res = "<" + pNode.text;

		for(attrName in pNode.arAttributes)
		{
			atrVal = pNode.arAttributes[attrName];
			if(attrName.substring(0,4).toLowerCase() == '_moz')
				continue;

			if(pNode.text.toUpperCase()=='BR' && attrName.toLowerCase() == 'type' && atrVal == '_moz')
				continue;

			if(attrName == 'style')
			{
				if (atrVal.length > 0 && atrVal.indexOf('-moz') != -1) // Kill -moz* styles from firefox
					atrVal = BX.util.trim(atrVal.replace(/-moz.*?;/ig, ''));

				if (pNode.text == 'td') // Kill border-image: none; styles from firefox for <td>
					atrVal = BX.util.trim(atrVal.replace(/border-image:\s*none;/ig, ''));

				if(atrVal.length <= 0)
					continue;
			}

			res += ' ' + attrName + '="' + (pNode.bDontUseSpecialchars ? atrVal : BX.util.htmlspecialchars(atrVal)) + '"';
		}

		if(pNode.arNodes.length <= 0 && !this.IsPairNode(pNode.text))
			return res + " />";
		return res + ">";
	}
	return "";
},

// Redeclared in BBCode mode
GetNodeHTMLRight: function(pNode)
{
	if(pNode.type == 'element' && (pNode.arNodes.length>0 || this.IsPairNode(pNode.text)))
		return "</" + pNode.text + ">";
	return "";
},

IsPairNode: function(text)
{
	if(text.substr(0, 1) == 'h' || text == 'br' || text == 'img' || text == 'input')
		return false;
	return true;
},

executeCommand: function(commandName, sValue)
{
	this.SetFocus();
	//try{
	var res = this.pEditorWindow.document.execCommand(commandName, false, sValue);
	//}catch(e){};
	this.SetFocus();
	//this.OnEvent("OnSelectionChange");
	//this.OnChange("executeCommand", commandName);

	if (this.arConfig.bAutoResize && this.arConfig.bResizable)
		this.AutoResize();

	return res;
},

queryCommand: function(commandName)
{
	var sValue = '';
	if (!this.pEditorDocument.queryCommandEnabled || !this.pEditorDocument.queryCommandValue)
		return null;

	if(!this.pEditorDocument.queryCommandEnabled(commandName))
		return null;

	return this.pEditorDocument.queryCommandValue(commandName);
},

SetFocus: function()
{
	if (this.sEditorMode != 'html')
		return;

	BX.focus(this.pEditorWindow.focus ? this.pEditorWindow : this.pEditorDocument.body);
	this.bFocused = true;
},

SetFocusToEnd: function()
{
	this.CheckBr();
	var ss = BX.GetWindowScrollSize(this.pEditorDocument);
	this.pEditorWindow.scrollTo(0, ss.scrollHeight);

	this.SetFocus();
	this.SelectElement(this.pEditorDocument.body.lastChild);
},

SetCursorFF: function()
{
	if (this.sEditorMode != 'code' && !BX.browser.IsIE())
	{
		var _this = this;
		try{
			this.iFrame.blur();
			this.iFrame.focus();

			setTimeout(function(){
				_this.iFrame.blur();
				_this.iFrame.focus();
			}, 600);

			setTimeout(function(){
				_this.iFrame.blur();
				_this.iFrame.focus();
			}, 1000);
		}catch(e){}
	}
},

CheckBr: function()
{
	if (this.CheckBrTimeout)
	{
		clearTimeout(this.CheckBrTimeout);
		this.CheckBrTimeout = false;
	}

	var _this = this;
	this.CheckBrTimeout = setTimeout(function()
	{
		var lastChild = _this.pEditorDocument.body.lastChild;
		if (lastChild && lastChild.nodeType == 1)
		{
			var nn = lastChild.nodeName.toUpperCase();
			var reBlockElements = /^(TITLE|TABLE|SCRIPT|DIV|H1|H2|H3|H4|H5|H6|ADDRESS|PRE|OL|UL|LI|BLOCKQUOTE|FORM|CENTER|)$/i;
			if (reBlockElements.test(nn))
				_this.pEditorDocument.body.appendChild(_this.pEditorDocument.createElement("BR"));
		}
	}, 200);
},

ParseContent: function(sContent, bJustParse) // HTML -> WYSIWYG
{
	var _this = this;
	var arCodes = [];
	sContent = sContent.replace(/\[code\]((?:\s|\S)*?)\[\/code\]/ig, function(str, code)
	{
		var strId = '';
		if (!_this.bBBCode)
			strId = " id=\"" + _this.SetBxTag(false, {tag: "code"}) + "\" ";

		arCodes.push('<pre ' + strId + 'class="lhe-code" title="' + BX.message.CodeDel + '">' + BX.util.htmlspecialchars(code) + '</pre>');
		return '#BX_CODE' + (arCodes.length - 1) + '#';
	});

	if (!bJustParse)
		BX.onCustomEvent(this, 'OnParseContent');

	if (this.arConfig.bBBCode)
		sContent = this.ParseBB(sContent);

	sContent = sContent.replace(/(<td[^>]*>)\s*(<\/td>)/ig, "$1<br _moz_editor_bogus_node=\"on\">$2");

	if (this.arConfig.bReplaceTabToNbsp)
		sContent = sContent.replace(/\t/ig, this.tabNbsp);

	if (!BX.browser.IsIE())
	{
		sContent = sContent.replace(/<hr[^>]*>/ig, function(sContent)
			{
				return '<img class="bxed-hr" src="' + _this.imagePath + 'break_page.gif" id="' + _this.SetBxTag(false, {tag: "hr", params: {value : sContent}}) + '"/>';
			}
		);
	}

	for (var p in this.oSpecialParsers)
	{
		if (this.oSpecialParsers[p] && this.oSpecialParsers[p].Parse)
			sContent = this.oSpecialParsers[p].Parse(p, sContent, this);
	}

	if (!bJustParse)
		setTimeout(function(){
			_this.AppendCSS(_this.systemCSS);
			// Hack for chrome: we have to unset font family
			// because than user paste text - chrome wraps it with [FONT=.....
			setTimeout(function(){
				_this.pEditorDocument.body.style.fontFamily = '';
				_this.pEditorDocument.body.style.fontSize = '';
			}, 1);
		}, 300);

	if (arCodes.length > 0) // Replace back CODE content without modifications
		sContent = sContent.replace(/#BX_CODE(\d+)#/ig, function(s, num){return arCodes[num] || s;});

	if (this.bBBCode)
	{
		sContent = sContent.replace(/&amp;#91;/ig, "[");
		sContent = sContent.replace(/&amp;#93;/ig, "]");
	}

	sContent = BX.util.trim(sContent);

	// Add <br> in the end of the message if text not ends with <br>
	if (this.arConfig.bBBCode && !sContent.match(/(<br[^>]*>)$/ig))
		sContent += '<br/>';

	return sContent;
},

UnParseContent: function() // WYSIWYG - > html
{
	BX.onCustomEvent(this, 'OnUnParseContent');

	var sContent = this._RecursiveGetHTML(this._RecursiveDomWalker(this.pEditorDocument.body, false));

	if (this.bBBCode)
	{
		if (!BX.browser.IsIE())
			sContent = sContent.replace(/\r/ig, '');
		sContent = sContent.replace(/\n/ig, '');
	}

	var arDivRules = [
		['#BR#(#TAG_BEGIN#)', "$1"], // 111<br><div>... => 111<>
		['(#TAG_BEGIN#)(?:#BR#)*?(#TAG_END#)', "$1$2"], // [DIV]#BR#[/DIV]  ==> [DIV][/DIV]
		['(#TAG_BEGIN#)([\\s\\S]*?)#TAG_END#(?:\\n|\\r|\\s)*?#TAG_BEGIN#([\\s\\S]*?)(#TAG_END#)', function(str, s1, s2,s3,s4){return s1 + s2 + '#BR#' + s3 + s4;}, true],
		['^#TAG_BEGIN#', ""], //kill [DIV] in the begining of the text
		['([\\s\\S]*?(\\[\\/\\w+\\])*?)#TAG_BEGIN#([\\s\\S]*?)#TAG_END#([\\s\\S]*?)', function(str, s1, s2,s3,s4)
		{
			if (s2 && s2.toLowerCase && s2.toLowerCase() == '[/list]')
				return s1 + s3 + '#BR#' + s4;
			return s1 + '#BR#' + s3 + '#BR#' + s4;
		}, true], // [/list][DIV]wwww[/div]wwww => [/list]wwww#BR#wwwww, text[DIV]wwww[/div]wwww => text#BR#www#BR#
		['#TAG_END#', "#BR#"] // [/DIV] ==> \n
	];

	var re, i, l = arDivRules.length, str;
	if (this.bBBCode)
	{
		//
		if (BX.browser.IsOpera())
			sContent = sContent.replace(/(?:#BR#)*?\[\/P\]/ig, "[/P]"); // #BR#[/P]  ==> [/P] for opera

		for (i = 0; i < l; i++)
		{
			re = arDivRules[i][0];
			re = re.replace(/#TAG_BEGIN#/g, '\\[P\\]');
			re = re.replace(/#TAG_END#/g, '\\[\\/P\\]');
			re = re.replace(/\\\\/ig, '\\\\');
			re = new RegExp(re, 'igm');
			if (arDivRules[i][2] === true)
				while(true)
				{
					str = sContent.replace(re, arDivRules[i][1]);
					if (str == sContent)
						break;
					else
						sContent = str;
				}
			else
				sContent = sContent.replace(re, arDivRules[i][1]);
		}
		sContent = sContent.replace(/^((?:\s|\S)*?)(?:\n|\r|\s)+$/ig, "$1\n\n"); //kill multiple \n in the end

		// Handle  [DIV] tags from safari, chrome
		for (i = 0; i < l; i++)
		{
			re = arDivRules[i][0];
			re = re.replace(/#TAG_BEGIN#/g, '\\[DIV\\]');
			re = re.replace(/#TAG_END#/g, '\\[\\/DIV\\]');
			re = re.replace(/\\\\/ig, '\\\\');

			if (arDivRules[i][2] === true)
				while(true)
				{
					str = sContent.replace(new RegExp(re, 'igm'), arDivRules[i][1]);
					if (str == sContent)
						break;
					else
						sContent = str;
				}
			else
				sContent = sContent.replace(new RegExp(re, 'igm'), arDivRules[i][1]);
		}

		sContent = sContent.replace(/#BR#/ig, "\n");
		sContent = sContent.replace(/\[DIV]/ig, "");
		sContent = BX.util.htmlspecialcharsback(sContent);
	}

	this.__sContent = sContent;
	BX.onCustomEvent(this, 'OnUnParseContentAfter');
	sContent = this.__sContent;
	return sContent;
},

InitResizer: function()
{
	this.oTransOverlay.Show();

	var
		_this = this,
		coreContPos = BX.pos(this.pFrame),
		newHeight = false;

	var MouseMove = function(e)
	{
		e = e || window.event;
		BX.fixEventPageY(e);
		newHeight = e.pageY - coreContPos.top;

		// New height
		if (newHeight < _this.arConfig.minHeight)
		{
			newHeight = _this.arConfig.minHeight;
			document.body.style.cursor = "not-allowed";
		}
		else if (newHeight > _this.arConfig.maxHeight)
		{
			newHeight = _this.arConfig.maxHeight;
			document.body.style.cursor = "not-allowed";
		}
		else
		{
			document.body.style.cursor = "n-resize";
		}

		_this.pFrame.style.height = newHeight + "px";
		_this.ResizeFrame(newHeight);
	};

	var MouseUp = function(e)
	{
		if (_this.arConfig.autoResizeSaveSize)
			BX.userOptions.save('fileman', 'LHESize_' + _this.id, 'height', newHeight);
		_this.arConfig.height = newHeight;

		document.body.style.cursor = "";
		if (_this.oTransOverlay && _this.oTransOverlay.bShowed)
			_this.oTransOverlay.Hide();

		BX.unbind(document, "mousemove", MouseMove);
		BX.unbind(document, "mouseup", MouseUp);
	};

	BX.bind(document, "mousemove", MouseMove);
	BX.bind(document, "mouseup", MouseUp);
},

AutoResize: function()
{
	var
		heightOffset = parseInt(this.arConfig.autoResizeOffset || 80),
		maxHeight = parseInt(this.arConfig.autoResizeMaxHeight || 0),
		minHeight = parseInt(this.arConfig.autoResizeMinHeight || 50),
		newHeight,
		_this = this;

	if (this.autoResizeTimeout)
		clearTimeout(this.autoResizeTimeout);

	this.autoResizeTimeout = setTimeout(function()
	{
		if (_this.sEditorMode == 'html')
		{
			//newHeight = _this.pEditorDocument.body.offsetHeight + heightOffset;
			newHeight = _this.pEditorDocument.body.offsetHeight;
			var
				body = _this.pEditorDocument.body,
				node = body.lastChild,
				offsetTop = false, i;

			while (true)
			{
				if (!node)
					break;
				if (node.offsetTop)
				{
					offsetTop = node.offsetTop + (node.offsetHeight || 0);
					newHeight = offsetTop + heightOffset;
					break;
				}
				else
				{
					node = node.previousSibling;
				}
			}

			var oEdSize = BX.GetWindowSize(_this.pEditorDocument);
			if (oEdSize.scrollHeight - oEdSize.innerHeight > 5)
				newHeight = Math.max(oEdSize.scrollHeight + heightOffset, newHeight);
		}
		else
		{
			newHeight = (_this.pTextarea.value.split("\n").length /* rows count*/ + 5) * 17;
		}

		if (newHeight > parseInt(_this.arConfig.height))
		{
			if (BX.browser.IsIOS())
				maxHeight = Infinity;
			else if (!maxHeight || maxHeight < 10)
				maxHeight = Math.round(BX.GetWindowInnerSize().innerHeight * 0.9); // 90% from screen height

			newHeight = Math.min(newHeight, maxHeight);
			newHeight = Math.max(newHeight, minHeight);

			_this.SmoothResizeFrame(newHeight);
		}
	}, 300);
},

MousePos: function (e)
{
	if(window.event)
		e = window.event;

	if(e.pageX || e.pageY)
	{
		e.realX = e.pageX;
		e.realY = e.pageY;
	}
	else if(e.clientX || e.clientY)
	{
		e.realX = e.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft) - document.documentElement.clientLeft;
		e.realY = e.clientY + (document.documentElement.scrollTop || document.body.scrollTop) - document.documentElement.clientTop;
	}
	return e;
},

SmoothResizeFrame: function(height)
{
	var
		_this = this,
		curHeight = parseInt(this.pFrame.offsetHeight),
		count = 0,
		bRise = height > curHeight,
		timeInt = BX.browser.IsIE() ? 50 : 50,
		dy = 5;

	if (!bRise)
		return;

	if (this.smoothResizeInterval)
		clearInterval(this.smoothResizeInterval);

	this.smoothResizeInterval = setInterval(function()
		{
			if (bRise)
			{
				curHeight += Math.round(dy * count);
				if (curHeight > height)
				{
					clearInterval(_this.smoothResizeInterval);
					if (curHeight > height)
						curHeight = height;
				}
			}
			else
			{
				curHeight -= Math.round(dy * count);
				if (curHeight < height)
				{
					curHeight = height;
					clearInterval(_this.smoothResizeInterval);
				}
			}

			_this.pFrame.style.height = curHeight + "px";
			_this.ResizeFrame(curHeight);
			count++;
		},
		timeInt
	);
},

ResizeFrame: function(newHeight)
{
	var
		deltaWidth = 7,
		resizeHeight = this.arConfig.bManualResize ? 3 : 0, // resize row
		height = newHeight || parseInt(this.pFrame.offsetHeight),
		width = this.pFrame.offsetWidth;

	this.pFrameTable.style.height = height + 'px';
	var contHeight = height - this.buttonsHeight - resizeHeight;

	if (contHeight > 0)
	{
		this.pEditCont.style.height = contHeight + 'px';
		this.pTextarea.style.height = contHeight + 'px';
	}

	this.pTextarea.style.width = (width > deltaWidth) ? (width - deltaWidth) + 'px' : 'auto';
	this.pButtonsCell.style.height = this.buttonsHeight + 'px';

	/*if (this.arConfig.bResizable)
	 this.pResizer.parentNode.style.height = resizeHeight + 'px';*/
},

AddButtons: function()
{
	var
		i, l, butId, grInd, arButtons,
		toolbarConfig = this.arConfig.toolbarConfig;
	this.buttonsCount = 0;

	if(!toolbarConfig)
		toolbarConfig = [
			//'Source',
			'Bold', 'Italic', 'Underline', 'Strike', 'RemoveFormat', 'InsertHR',
			'Anchor',
			'CreateLink', 'DeleteLink', 'Image', //'SpecialChar',
			'Justify',
			'InsertOrderedList', 'InsertUnorderedList', 'Outdent', 'Indent',
			'BackColor', 'ForeColor',
			'Video',
			'StyleList', 'HeaderList',
			'FontList', 'FontSizeList',
			'Table'
			//smiles:['SmileList']
		];

	if (oBXLEditorUtils.oTune && oBXLEditorUtils.oTune[this.id])
	{
		var
			ripButtons = oBXLEditorUtils.oTune[this.id].ripButtons,
			addButtons = oBXLEditorUtils.oTune[this.id].buttons;

		if (ripButtons)
		{
			i = 0;
			while(i < toolbarConfig.length)
			{
				if (ripButtons[toolbarConfig[i]])
					toolbarConfig = BX.util.deleteFromArray(toolbarConfig, i);
				else
					i++;
			}
		}

		if (addButtons)
		{
			for (var j = 0, n = addButtons.length; j < n; j++)
			{
				if (addButtons[j].ind == -1 || addButtons[j].ind >= toolbarConfig.length)
					toolbarConfig.push(addButtons[j].but.id);
				else
					toolbarConfig = BX.util.insertIntoArray(toolbarConfig, addButtons[j].ind, addButtons[j].but.id);
			}
		}
	}

	var
		begWidth = 0,
		endWidth = 0, // 4
		curLineWidth = begWidth, pCont,
		butContWidth = parseInt(this.pButtonsCont.offsetWidth);

	this.ToolbarStartLine(true);
	for(i in toolbarConfig)
	{
		butId = toolbarConfig[i];
		if (typeof butId != 'string' || !toolbarConfig.hasOwnProperty(i))
			continue;

		if (butId == '=|=')
		{
			this.ToolbarNewLine();
			curLineWidth = begWidth;
		}
		else if (LHEButtons[butId])
		{
			if (this.bBBCode && LHEButtons[butId].bBBHide)
				continue;

			this.buttonsIndex[butId] = i;
			pCont = this.AddButton(LHEButtons[butId], butId);
			if (pCont)
			{
				curLineWidth += parseInt(pCont.style.width) || 23;
				if (curLineWidth + endWidth > butContWidth && butContWidth > 0)
				{
					butContWidth = parseInt(this.pButtonsCont.offsetWidth); // Doublecheck
					if (curLineWidth + endWidth > butContWidth && butContWidth > 0)
					{
						this.ToolbarNewLine();
						this.pButtonsCont.appendChild(pCont);
						curLineWidth = begWidth;
					}
				}
			}
		}
	}
	this.ToolbarEndLine();

	if (typeof this.arConfig.controlButtonsHeight == 'undefined')
		this.buttonsHeight = this.toolbarLineCount * 27;
	else
		this.buttonsHeight = parseInt(this.arConfig.controlButtonsHeight || 0);

	this.arConfig.minHeight += this.buttonsHeight;
	this.arConfig.maxHeight += this.buttonsHeight;

	BX.addCustomEvent(this, 'onShow', BX.proxy(this.ResizeFrame, this));
},

AddButton: function(oBut, buttonId)
{
	if (oBut.parser && oBut.parser.obj)
		this.oSpecialParsers[oBut.parser.name] = oBut.parser.obj;

	this.buttonsCount++;
	var result;
	if (!oBut.type || !oBut.type == 'button')
	{
		if (buttonId == 'Code')
			this.bCodeBut = true;

		var pButton = new window.LHEButton(oBut, this);
		if (pButton && pButton.oBut)
		{
			if (buttonId == 'Source')
				this.sourseBut = pButton;
			else if(buttonId == 'Quote')
				this.quoteBut = pButton;

			result = this.pButtonsCont.appendChild(pButton.pCont);
		}
	}
	else if (oBut.type == 'Colorpicker')
	{
		var pColorpicker = new window.LHEColorPicker(oBut, this);
		result =  this.pButtonsCont.appendChild(pColorpicker.pCont);
	}
	else if (oBut.type == 'List')
	{
		var pList = new window.LHEList(oBut, this);
		result =  this.pButtonsCont.appendChild(pList.pCont);
	}

	if (oBut.parsers)
	{
		for(var i = 0, cnt = oBut.parsers.length; i < cnt; i++)
			if (oBut.parsers[i] && oBut.parsers[i].obj)
				this.oSpecialParsers[oBut.parsers[i].name] = oBut.parsers[i].obj;
	}

	return result;
},

AddParser: function(parser)
{
	if (parser && parser.name && typeof parser.obj == 'object')
		this.oSpecialParsers[parser.name] = parser.obj;
},

ToolbarStartLine: function(bFirst)
{
	// Hack for IE 7
	if (!bFirst && BX.browser.IsIE())
		this.pButtonsCont.appendChild(BX.create("IMG", {props: {src: this.oneGif, className: "lhe-line-ie"}}));

	this.pButtonsCont.appendChild(BX.create("DIV", {props: {className: 'lhe-line-begin'}}));
},

ToolbarEndLine: function()
{
	this.pButtonsCont.appendChild(BX.create("DIV", {props: {className: 'lhe-line-end'}}));
},

ToolbarNewLine: function()
{
	this.toolbarLineCount++;
	this.ToolbarEndLine();
	this.ToolbarStartLine();
},

OpenDialog: function(arParams)
{
	var oDialog = new window.LHEDialog(arParams, this);
},

GetSelectionObject: function()
{
	var oSelection, oRange, root;
	if(this.pEditorDocument.selection) // IE
	{
		oSelection = this.pEditorDocument.selection;
		oRange = oSelection.createRange();

		if(oSelection.type=="Control")
			return oRange.commonParentElement();

		return oRange.parentElement();
	}
	else // FF
	{
		oSelection = this.pEditorWindow.getSelection();
		if(!oSelection)
			return false;

		var container, i, rangeCount = oSelection.rangeCount, obj;
		for(var i = 0; i < rangeCount; i++)
		{
			oRange = oSelection.getRangeAt(i);
			container = oRange.startContainer;
			if(container.nodeType != 3)
			{
				if(container.nodeType == 1 && container.childNodes.length <= 0)
					obj = container;
				else
					obj = container.childNodes[oRange.startOffset];
			}
			else
			{
				temp = oRange.commonAncestorContainer;
				while(temp && temp.nodeType == 3)
					temp = temp.parentNode;
				obj = temp;
			}
			root = (i == 0) ? obj : BXFindParentElement(root, obj);
		}
		return root;
	}
},

GetSelectionObjects: function()
{
	var oSelection;
	if(this.pEditorDocument.selection) // IE
	{
		oSelection = this.pEditorDocument.selection;
		var s = oSelection.createRange();

		if(oSelection.type=="Control")
			return s.commonParentElement();

		return s.parentElement();
	}
	else // FF
	{
		oSelection = this.pEditorWindow.getSelection();
		if(!oSelection)
			return false;
		var oRange;
		var container, temp;
		var res = [];
		for(var i = 0; i < oSelection.rangeCount; i++)
		{
			oRange = oSelection.getRangeAt(i);
			container = oRange.startContainer;
			if(container.nodeType != 3)
			{
				if(container.nodeType == 1 && container.childNodes.length <= 0)
					res[res.length] = container;
				else
					res[res.length] = container.childNodes[oRange.startOffset];
			}
			else
			{
				temp = oRange.commonAncestorContainer;
				while(temp && temp.nodeType == 3)
					temp = temp.parentNode;
				res[res.length] = temp;
			}
		}
		if(res.length > 1)
			return res;
		return res[0];
	}
},

GetSelectionRange: function(doc, win)
{
	try{
		var
			oDoc = doc || this.pEditorDocument,
			oWin = win || this.pEditorWindow,
			oRange,
			oSel = this.GetSelection(oDoc, oWin);

		if (oSel)
		{
			if (oDoc.createRange)
			{
				if (oSel.getRangeAt)
					oRange = oSel.getRangeAt(0);
				else
				{
					oRange = document.createRange();
					oRange.setStart(oSel.anchorNode, oSel.anchorOffset);
					oRange.setEnd(oSel.focusNode, oSel.focusOffset);
				}
			}
			else
				oRange = oSel.createRange();
		}
		else
		{
			oRange = false;
		}

	} catch(e) {oRange = false;}

	return oRange;
},

SelectRange: function(oRange, doc, win)
{
	try{ // IE9 sometimes generete JS error
		if (!oRange)
			return;

		var
			oDoc = doc || this.pEditorDocument,
			oWin = win || this.pEditorWindow;

		this.ClearSelection(oDoc, oWin);
		if (oDoc.createRange) // FF
		{
			var oSel = oWin.getSelection();
			oSel.removeAllRanges();
			oSel.addRange(oRange);
		}
		else //IE
		{
			oRange.select();
		}

	}catch(e){}
},

SelectElement: function(pElement)
{
	try{
		var
			oRange,
			oDoc = this.pEditorDocument,
			oWin = this.pEditorWindow;

		if(oWin.getSelection)
		{
			var oSel = oWin.getSelection();
			oSel.selectAllChildren(pElement);
			oRange = oSel.getRangeAt(0);
			if (oRange.selectNode)
				oRange.selectNode(pElement);
		}
		else
		{
			oDoc.selection.empty();
			oRange = oDoc.selection.createRange();
			oRange.moveToElementText(pElement);
			oRange.select();
		}
		return oRange;
	}catch(e){}
},

GetSelectedText: function(oRange)
{
	// Get selected text
	var selectedText = '';
	if (oRange.startContainer && oRange.endContainer) // DOM Model
	{
		if (oRange.startContainer == oRange.endContainer && (oRange.endContainer.nodeType == 3 || oRange.endContainer.nodeType == 1))
			selectedText = oRange.startContainer.textContent.substring(oRange.startOffset, oRange.endOffset);
	}
	else // IE
	{
		if (oRange.text == oRange.htmlText)
			selectedText = oRange.text;
	}
	return selectedText || '';
},

ClearSelection: function(doc, win)
{
	var
		oDoc = doc || this.pEditorDocument,
		oWin = win || this.pEditorWindow;

	if (oWin.getSelection)
		oWin.getSelection().removeAllRanges();
	else
		oDoc.selection.empty();
},

GetSelection: function(oDoc, oWin)
{
	if (!oDoc)
		oDoc = document;
	if (!oWin)
		oWin = window;

	var oSel = false;
	if (oWin.getSelection)
		oSel = oWin.getSelection();
	else if (oDoc.getSelection)
		oSel = oDoc.getSelection();
	else if (oDoc.selection)
		oSel = oDoc.selection;
	return oSel;
},

InsertHTML: function(sContent)
{
	try{ // Don't clear "try catch"... Some times browsers generetes failures
		this.SetFocus();

		if(BX.browser.IsIE())
		{
			var oRng = this.pEditorDocument.selection.createRange();
			if (oRng.pasteHTML)
			{
				oRng.pasteHTML(sContent);
				oRng.collapse(false);
				oRng.select();
			}
		}
		else if(BX.browser.IsIE11())
		{
			this.PasteHtmlAtCaret(sContent);
		}
		else
		{
			this.pEditorWindow.document.execCommand('insertHTML', false, sContent);
		}
	}catch(e){}

	if (this.arConfig.bAutoResize && this.arConfig.bResizable)
		this.AutoResize();
},

PasteHtmlAtCaret: function(html, selectPastedContent)
{
	var
		win = this.pEditorWindow,
		doc = this.pEditorDocument,
		sel, range;

	if (win.getSelection)
	{
		// IE9 and non-IE
		sel = win.getSelection();
		if (sel.getRangeAt && sel.rangeCount)
		{
			range = sel.getRangeAt(0);
			range.deleteContents();

			// Range.createContextualFragment() would be useful here but is
			// only relatively recently standardized and is not supported in
			// some browsers (IE9, for one)
			var el = doc.createElement("div");
			el.innerHTML = html;
			var frag = doc.createDocumentFragment(), node, lastNode;
			while ((node = el.firstChild))
				lastNode = frag.appendChild(node);

			var firstNode = frag.firstChild;
			range.insertNode(frag);

			// Preserve the selection
			if (lastNode)
			{
				range = range.cloneRange();
				range.setStartAfter(lastNode);
				if (selectPastedContent)
					range.setStartBefore(firstNode);
				else
					range.collapse(true);

				sel.removeAllRanges();
				sel.addRange(range);
			}
		}
	}
	else if ((sel = doc.selection) && sel.type != "Control")
	{
		// IE < 9
		var originalRange = sel.createRange();
		originalRange.collapse(true);
		sel.createRange().pasteHTML(html);
		if (selectPastedContent)
		{
			range = sel.createRange();
			range.setEndPoint("StartToStart", originalRange);
			range.select();
		}
	}
},

AppendCSS: function(styles)
{
	styles = BX.util.trim(styles);
	if (styles.length <= 0)
		return false;

	var
		pDoc = this.pEditorDocument,
		pHeads = pDoc.getElementsByTagName("HEAD");

	if(pHeads.length != 1)
		return false;

	if(BX.browser.IsIE())
	{
		setTimeout(function()
		{
			try{
				if (pDoc.styleSheets.length == 0)
					pHeads[0].appendChild(pDoc.createElement("STYLE"));
				pDoc.styleSheets[0].cssText += styles;
			}catch(e){}
		}, 100);
	}
	else
	{
		try{
			var xStyle = pDoc.createElement("STYLE");
			pHeads[0].appendChild(xStyle);
			xStyle.appendChild(pDoc.createTextNode(styles));
		}catch(e){}
	}
	return true;
},

SetBxTag: function(pElement, params)
{
	var id;
	if (params.id || pElement && pElement.id)
		id = params.id || pElement.id;

	if (!id)
		id = 'bxid_' + Math.round(Math.random() * 1000000);
	else if (this.bxTags[id] && !params.tag)
		params.tag = this.bxTags[id].tag;

	params.id = id;
	if (pElement)
		pElement.id = params.id;

	this.bxTags[params.id] = params;
	return params.id;
},

GetBxTag: function(id)
{
	if (id)
	{
		if (typeof id != "string" && id.id)
			id = id.id;

		if (id && id.length > 0 && this.bxTags[id] && this.bxTags[id].tag)
		{
			this.bxTags[id].tag = this.bxTags[id].tag.toLowerCase();
			return this.bxTags[id];
		}
	}

	return {tag: false};
},

GetAttributesList: function(str)
{
	str = str + " ";

	var arParams = {}, arPHP = [], bPhp = false, _this = this;
	// 1. Replace PHP by #BXPHP#
	str = str.replace(/<\?.*?\?>/ig, function(s)
	{
		arPHP.push(s);
		return "#BXPHP" + (arPHP.length - 1) + "#";
	});

	// 2.0 Parse params - without quotes
	str = str.replace(/([^\w]??)(\w+?)=([^\s\'"]+?)(\s)/ig, function(s, b0, b1, b2, b3)
	{
		b2 = b2.replace(/#BXPHP(\d+)#/ig, function(s, num){return arPHP[num] || s;});
		arParams[b1.toLowerCase()] = BX.util.htmlspecialcharsback(b2);
		return b0;
	});

	// 2.1 Parse params
	str = str.replace(/([^\w]??)(\w+?)\s*=\s*("|\')([^\3]*?)\3/ig, function(s, b0, b1, b2, b3)
	{
		// 3. Replace PHP back
		b3 = b3.replace(/#BXPHP(\d+)#/ig, function(s, num){return arPHP[num] || s;});
		arParams[b1.toLowerCase()] = BX.util.htmlspecialcharsback(b3);
		return b0;
	});

	return arParams;
},

RidOfNode: function (pNode, bHard)
{
	if (!pNode || pNode.nodeType != 1)
		return;

	var i, nodeName = pNode.tagName.toLowerCase(),
		nodes = ['span', 'strike', 'del', 'font', 'code', 'div'];

	if (BX.util.in_array(nodeName, nodes)) // Check node names
	{
		if (bHard !== true)
		{
			for (i = pNode.attributes.length - 1; i >= 0; i--)
			{
				if (BX.util.trim(pNode.getAttribute(pNode.attributes[i].nodeName.toLowerCase())) != "")
					return false; // Node have attributes, so we cant get rid of it without loosing info
			}
		}

		var arNodes = pNode.childNodes;
		while(arNodes.length > 0)
			pNode.parentNode.insertBefore(arNodes[0], pNode);

		pNode.parentNode.removeChild(pNode);
		//this.OnEvent("OnSelectionChange");
		return true;
	}

	return false;
},

WrapSelectionWith: function (tagName, arAttributes)
{
	this.SetFocus();
	var oRange, oSelection;

	if (!tagName)
		tagName = 'SPAN';

	var sTag = 'FONT', i, pEl, arTags, arRes = [];

	try{this.pEditorDocument.execCommand("styleWithCSS", false, false);}catch(e){}
	this.executeCommand("FontName", "bitrixtemp");

	arTags = this.pEditorDocument.getElementsByTagName(sTag);

	for(i = arTags.length - 1; i >= 0; i--)
	{
		if (arTags[i].getAttribute('face') != 'bitrixtemp')
			continue;

		pEl = BX.create(tagName, arAttributes, this.pEditorDocument);
		arRes.push(pEl);

		while(arTags[i].firstChild)
			pEl.appendChild(arTags[i].firstChild);

		arTags[i].parentNode.insertBefore(pEl, arTags[i]);
		arTags[i].parentNode.removeChild(arTags[i]);
	}

	if (this.arConfig.bAutoResize && this.arConfig.bResizable)
		this.AutoResize();

	return arRes;
},

SaveSelectionRange: function()
{
	if (this.sEditorMode == 'code')
		this.oPrevRangeText = this.GetSelectionRange(document, window);
	else
		this.oPrevRange = this.GetSelectionRange();
},

RestoreSelectionRange: function()
{
	if (this.sEditorMode == 'code')
		this.IESetCarretPos(this.oPrevRangeText);
	else if(this.oPrevRange)
		this.SelectRange(this.oPrevRange);
},

focus: function(el, bSelect)
{
	setTimeout(function()
	{
		try{
			el.focus();
			if(bSelect)
				el.select();
		}catch(e){}
	}, 100);
},

// Methods below used in BB-mode
// Earlier was in bb.js
InitBBCode: function()
{
	this.stack = [];
	var _this = this;
	this.pTextarea.onkeydown = BX.proxy(this.OnKeyDownBB, this);

	// Backup parser functions
	this._GetNodeHTMLLeft = this.GetNodeHTMLLeft;
	this._GetNodeHTMLRight = this.GetNodeHTMLRight;

	this.GetNodeHTMLLeft = this.GetNodeHTMLLeftBB;
	this.GetNodeHTMLRight = this.GetNodeHTMLRightBB;
},

ShutdownBBCode: function()
{
	this.bBBCode = false;
	this.arConfig.bBBCode = false;

	this.pTextarea.onkeydown = null;

	// Restore parser functions
	this.GetNodeHTMLLeft = this._GetNodeHTMLLeft;
	this.GetNodeHTMLRight = this._GetNodeHTMLRight;

	this.arConfig.bConvertContentFromBBCodes = false;
},

FormatBB: function(params)
{
	var
		pBut = params.pBut,
		value = params.value,
		tag = params.tag.toUpperCase(),
		tag_end = tag;

	if (tag == 'FONT' || tag == 'COLOR' || tag == 'SIZE')
		tag += "=" + value;

	if ((!BX.util.in_array(tag, this.stack) || this.GetTextSelection()) && !(tag == 'FONT' && value == 'none'))
	{
		if (!this.WrapWith("[" + tag + "]", "[/" + tag_end + "]"))
		{
			this.stack.push(tag);

			if (pBut && pBut.Check)
				pBut.Check(true);
		}
	}
	else
	{
		var res = false;
		while (res = this.stack.pop())
		{
			this.WrapWith("[/" + res + "]", "");
			if (pBut && pBut.Check)
				pBut.Check(false);

			if (res == tag)
				break;
		}
	}
},

GetTextSelection: function()
{
	var res = false;
	if (typeof this.pTextarea.selectionStart != 'undefined')
	{
		res = this.pTextarea.value.substr(this.pTextarea.selectionStart, this.pTextarea.selectionEnd - this.pTextarea.selectionStart);
	}
	else if (document.selection && document.selection.createRange)
	{
		res = document.selection.createRange().text;
	}
	else if (window.getSelection)
	{
		res = window.getSelection();
		res = res.toString();
	}

	return res;
},

IESetCarretPos: function(oRange)
{
	if (!oRange || !BX.browser.IsIE() || oRange.text.length != 0 /* text selected*/)
		return;

	oRange.moveStart('character', - this.pTextarea.value.length);
	var pos = oRange.text.length;

	var range = this.pTextarea.createTextRange();
	range.collapse(true);
	range.moveEnd('character', pos);
	range.moveStart('character', pos);
	range.select();
},

WrapWith: function (tagBegin, tagEnd, postText)
{
	if (!tagBegin)
		tagBegin = "";
	if (!tagEnd)
		tagEnd = ""

	if (!postText)
		postText = "";

	if (tagBegin.length <= 0 && tagEnd.length <= 0 && postText.length <= 0)
		return true;

	var bReplaceText = !!postText;
	var sSelectionText = this.GetTextSelection();

	if (!this.bTextareaFocus)
		this.pTextarea.focus(); // BUG IN IE

	var isSelect = (sSelectionText ? 'select' : bReplaceText ? 'after' : 'in');

	if (bReplaceText)
		postText = tagBegin + postText + tagEnd;
	else if (sSelectionText)
		postText = tagBegin + sSelectionText + tagEnd;
	else
		postText = tagBegin + tagEnd;

	if (typeof this.pTextarea.selectionStart != 'undefined')
	{
		var
			currentScroll = this.pTextarea.scrollTop,
			start = this.pTextarea.selectionStart,
			end = this.pTextarea.selectionEnd;

		this.pTextarea.value = this.pTextarea.value.substr(0, start) + postText + this.pTextarea.value.substr(end);

		if (isSelect == 'select')
		{
			this.pTextarea.selectionStart = start;
			this.pTextarea.selectionEnd = start + postText.length;
		}
		else if (isSelect == 'in')
		{
			this.pTextarea.selectionStart = this.pTextarea.selectionEnd = start + tagBegin.length;
		}
		else
		{
			this.pTextarea.selectionStart = this.pTextarea.selectionEnd = start + postText.length;
		}
		this.pTextarea.scrollTop = currentScroll;
	}
	else if (document.selection && document.selection.createRange)
	{
		var sel = document.selection.createRange();
		var selection_copy = sel.duplicate();
		postText = postText.replace(/\r?\n/g, '\n');
		sel.text = postText;
		sel.setEndPoint('StartToStart', selection_copy);
		sel.setEndPoint('EndToEnd', selection_copy);

		if (isSelect == 'select')
		{
			sel.collapse(true);
			postText = postText.replace(/\r\n/g, '1');
			sel.moveEnd('character', postText.length);
		}
		else if (isSelect == 'in')
		{
			sel.collapse(false);
			sel.moveEnd('character', tagBegin.length);
			sel.collapse(false);
		}
		else
		{
			sel.collapse(false);
			sel.moveEnd('character', postText.length);
			sel.collapse(false);
		}
		sel.select();
	}
	else
	{
		// failed - just stuff it at the end of the message
		this.pTextarea.value += postText;
	}
	return true;
},

ParseBB: function (sContent)  // BBCode -> WYSIWYG
{
	sContent = BX.util.htmlspecialchars(sContent);

	// Table
	sContent = sContent.replace(/[\r\n\s\t]?\[table\][\r\n\s\t]*?\[tr\]/ig, '[TABLE][TR]');
	sContent = sContent.replace(/\[tr\][\r\n\s\t]*?\[td\]/ig, '[TR][TD]');
	sContent = sContent.replace(/\[tr\][\r\n\s\t]*?\[th\]/ig, '[TR][TH]');
	sContent = sContent.replace(/\[\/td\][\r\n\s\t]*?\[td\]/ig, '[/TD][TD]');
	sContent = sContent.replace(/\[\/tr\][\r\n\s\t]*?\[tr\]/ig, '[/TR][TR]');
	sContent = sContent.replace(/\[\/td\][\r\n\s\t]*?\[\/tr\]/ig, '[/TD][/TR]');
	sContent = sContent.replace(/\[\/th\][\r\n\s\t]*?\[\/tr\]/ig, '[/TH][/TR]');
	sContent = sContent.replace(/\[\/tr\][\r\n\s\t]*?\[\/table\][\r\n\s\t]?/ig, '[/TR][/TABLE]');

	// List
	sContent = sContent.replace(/[\r\n\s\t]*?\[\/list\]/ig, '[/LIST]');
	sContent = sContent.replace(/[\r\n\s\t]*?\[\*\]?/ig, '[*]');

	var
		arSimpleTags = [
			'b','u', 'i', ['s', 'del'], // B, U, I, S
			'table', 'tr', 'td', 'th'//, // Table
		],
		bbTag, tag, i, l = arSimpleTags.length, re;

	for (i = 0; i < l; i++)
	{
		if (typeof arSimpleTags[i] == 'object')
		{
			bbTag = arSimpleTags[i][0];
			tag = arSimpleTags[i][1];
		}
		else
		{
			bbTag = tag = arSimpleTags[i];
		}

		sContent = sContent.replace(new RegExp('\\[(\\/?)' + bbTag + '\\]', 'ig'), "<$1" + tag + ">");
	}

	// Link
	sContent = sContent.replace(/\[url\]((?:\s|\S)*?)\[\/url\]/ig, "<a href=\"$1\">$1</a>");
	sContent = sContent.replace(/\[url\s*=\s*((?:[^\[\]]*?(?:\[[^\]]+?\])*[^\[\]]*?)*)\s*\]((?:\s|\S)*?)\[\/url\]/ig, "<a href=\"$1\">$2</a>");

	// Img
	var _this = this;
	sContent = sContent.replace(/\[img(?:\s*?width=(\d+)\s*?height=(\d+))?\]((?:\s|\S)*?)\[\/img\]/ig,
		function(str, w, h, src)
		{
			var strSize = "";
			w = parseInt(w);
			h = parseInt(h);

			if (w && h && _this.bBBParseImageSize)
				strSize = ' width="' + w + '" height="' + h + '"';

			return '<img  src="' + src + '"' + strSize + '/>';
		}
	);

	// Font color
	i = 0;
	while (sContent.toLowerCase().indexOf('[color=') != -1 && sContent.toLowerCase().indexOf('[/color]') != -1 && i++ < 20)
		sContent = sContent.replace(/\[color=((?:\s|\S)*?)\]((?:\s|\S)*?)\[\/color\]/ig, "<font color=\"$1\">$2</font>");

	// List
	i = 0;
	while (sContent.toLowerCase().indexOf('[list=') != -1 && sContent.toLowerCase().indexOf('[/list]') != -1 && i++ < 20)
		sContent = sContent.replace(/\[list=1\]((?:\s|\S)*?)\[\/list\]/ig, "<ol>$1</ol>");

	i = 0;
	while (sContent.toLowerCase().indexOf('[list') != -1 && sContent.toLowerCase().indexOf('[/list]') != -1 && i++ < 20)
		sContent = sContent.replace(/\[list\]((?:\s|\S)*?)\[\/list\]/ig, "<ul>$1</ul>");

	sContent = sContent.replace(/\[\*\]/ig, "<li>");

	// Font
	i = 0;
	while (sContent.toLowerCase().indexOf('[font=') != -1 && sContent.toLowerCase().indexOf('[/font]') != -1 && i++ < 20)
		sContent = sContent.replace(/\[font=((?:\s|\S)*?)\]((?:\s|\S)*?)\[\/font\]/ig, "<font face=\"$1\">$2</font>");

	// Font size
	i = 0;
	while (sContent.toLowerCase().indexOf('[size=') != -1 && sContent.toLowerCase().indexOf('[/size]') != -1 && i++ < 20)
		sContent = sContent.replace(/\[size=((?:\s|\S)*?)\]((?:\s|\S)*?)\[\/size\]/ig, "<font size=\"$1\">$2</font>");

	// Replace \n => <br/>
	sContent = sContent.replace(/\n/ig, "<br />");

	return sContent;
},

UnParseNodeBB: function (pNode) // WYSIWYG -> BBCode
{
	if (pNode.text == "br")
		return "#BR#";

	if (pNode.type == 'text')
		return false;

	//[CODE] Handle code tag
	if (pNode.text == "pre" && pNode.arAttributes['class'] == 'lhe-code')
		return "[CODE]" + this.RecGetCodeContent(pNode) + "[/CODE]";

	pNode.bbHide = true;
	if (pNode.text == 'font' && pNode.arAttributes.color)
	{
		pNode.bbHide = false;
		pNode.text = 'color';
		pNode.bbValue = pNode.arAttributes.color;
	}
	else if (pNode.text == 'font' && pNode.arAttributes.size)
	{
		pNode.bbHide = false;
		pNode.text = 'size';
		pNode.bbValue = pNode.arAttributes.size;
	}
	else if (pNode.text == 'font' && pNode.arAttributes.face)
	{
		pNode.bbHide = false;
		pNode.text = 'font';
		pNode.bbValue = pNode.arAttributes.face;
	}
	else if(pNode.text == 'del')
	{
		pNode.bbHide = false;
		pNode.text = 's';
	}
	else if(pNode.text == 'strong' || pNode.text == 'b')
	{
		pNode.bbHide = false;
		pNode.text = 'b';
	}
	else if(pNode.text == 'em' || pNode.text == 'i')
	{
		pNode.bbHide = false;
		pNode.text = 'i';
	}
	else if(pNode.text == 'blockquote')
	{
		pNode.bbHide = false;
		pNode.text = 'quote';
	}
	else if(pNode.text == 'ol')
	{
		pNode.bbHide = false;
		pNode.text = 'list';
		pNode.bbBreakLineRight = true;
		pNode.bbValue = '1';
	}
	else if(pNode.text == 'ul')
	{
		pNode.bbHide = false;
		pNode.text = 'list';
		pNode.bbBreakLineRight = true;
	}
	else if(pNode.text == 'li')
	{
		pNode.bbHide = false;
		pNode.text = '*';
		pNode.bbBreakLine = true;
		pNode.bbHideRight = true;
	}
	else if(pNode.text == 'a')
	{
		pNode.bbHide = false;
		pNode.text = 'url';
		pNode.bbValue = pNode.arAttributes.href;
	}
	else if(this.parseAlign
		&&
		(pNode.arAttributes.align || pNode.arStyle.textAlign)
		&&
		!(BX.util.in_array(pNode.text.toLowerCase(), ['table', 'tr', 'td', 'th']))
		)
	{
		var align = pNode.arStyle.textAlign || pNode.arAttributes.align;
		if (BX.util.in_array(align, ['left', 'right', 'center', 'justify']))
		{
			pNode.bbHide = false;
			pNode.text = align;
		}
		else
		{
			pNode.bbHide = !BX.util.in_array(pNode.text, this.arBBTags);
		}
	}
	else if(BX.util.in_array(pNode.text, this.arBBTags)) //'p', 'u', 'div', 'table', 'tr', 'img', 'td', 'a'
	{
		pNode.bbHide = false;
	}

	return false;
},

RecGetCodeContent: function(pNode) // WYSIWYG -> BBCode
{
	if (!pNode || !pNode.arNodes || !pNode.arNodes.length)
		return '';

	var res = '';
	for (var i = 0; i < pNode.arNodes.length; i++)
	{
		if (pNode.arNodes[i].type == 'text')
			res += pNode.arNodes[i].text;
		else if (pNode.arNodes[i].type == 'element' && pNode.arNodes[i].text == "br")
			res += (this.bBBCode ? "#BR#" : "\n");
		else if (pNode.arNodes[i].arNodes)
			res += this.RecGetCodeContent(pNode.arNodes[i]);
	}

	if (this.bBBCode)
	{
		if (BX.browser.IsIE())
			res = res.replace(/\r/ig, "#BR#");
		else
			res = res.replace(/\n/ig, "#BR#");
	}
	else if (BX.browser.IsIE())
	{
		res = res.replace(/\n/ig, "\r\n");
	}

	return res;
},

GetNodeHTMLLeftBB: function (pNode)
{
	if(pNode.type == 'text')
	{
		var text = BX.util.htmlspecialchars(pNode.text);
		text = text.replace(/\[/ig, "&#91;");
		text = text.replace(/\]/ig, "&#93;");
		return text;
	}

	var res = "";
	if (pNode.bbBreakLine)
		res += "\n";

	if(pNode.type == 'element' && !pNode.bbHide)
	{
		res += "[" + pNode.text.toUpperCase();
		if (pNode.bbValue)
			res += '=' + pNode.bbValue;
		res += "]";
	}

	return res;
},

GetNodeHTMLRightBB: function (pNode)
{
	var res = "";
	if (pNode.bbBreakLineRight)
		res += "\n";

	if(pNode.type == 'element' && (pNode.arNodes.length > 0 || this.IsPairNode(pNode.text)) && !pNode.bbHide && !pNode.bbHideRight)
		res += "[/" + pNode.text.toUpperCase() + "]";

	return res;
},

OptimizeBB: function (str)
{
	// TODO: kill links without text and names
	// TODO: Kill multiple line ends
	var
		iter = 0,
		bReplasing = true,
		arTags = ['b', 'i', 'u', 's', 'color', 'font', 'size', 'quote'],
		replaceEmptyTags = function(){i--; bReplasing = true; return ' ';},
		re, tagName, i, l;

	while(iter++ < 20 && bReplasing)
	{
		bReplasing = false;
		for (i = 0, l = arTags.length; i < l; i++)
		{
			tagName = arTags[i];
			// Replace empties: [b][/b]  ==> ""
			re = new RegExp('\\[' + tagName + '[^\\]]*?\\]\\s*?\\[/' + tagName + '\\]', 'ig');
			str = str.replace(re, replaceEmptyTags);

			if (tagName !== 'quote')
			{
				re = new RegExp('\\[((' + tagName + '+?)(?:\\s+?[^\\]]*?)?)\\]([\\s\\S]+?)\\[\\/\\2\\](\\s*?)\\[\\1\\]([\\s\\S]+?)\\[\\/\\2\\]', 'ig');
				str = str.replace(re, function(str, b1, b2, b3, spacer, b4)
					{
						if (spacer.indexOf("\n") != -1)
							return str;
						bReplasing = true;
						return '[' + b1 + ']' + b3 + ' ' + b4 + '[/' + b2 + ']';
					}
				);

				//Replace [b]1 [b]2[/b] 3[/b] ===>>  [b]1 2 3[/b]
				// re = new RegExp('(\\[' + tagName + '(?:\\s+?[^\\]]*?)?\\])([\\s\\S]+?)\\1([\\s\\S]+?)(\\[\\/' + tagName + '\\])([\\s\\S]+?)\\4', 'ig');
				// str = str.replace(re, function(str, b1, b2, b3, b4, b5)
				// {
				// bReplasing = true;
				// return b1 + b2 + b3 + b5 + b4;
				// }
				// );
			}
		}
	}
	//
	str = str.replace(/[\r\n\s\t]*?\[\/list\]/ig, "\n[/LIST]");
	str = str.replace(/[\r\n\s\t]*?\[\/list\]/ig, "\n[/LIST]");

	// Cut "\n" in the end of the message (only for BB)
	str = str.replace(/\n*$/ig, '');

	return str;
},

RemoveFormatBB: function()
{
	var str = this.GetTextSelection();
	if (str)
	{
		var
			it = 0,
			arTags = ['b', 'i', 'u', 's', 'color', 'font', 'size'],
			i, l = arTags.length;

		//[b]123[/b]  ==> 123
		while (it < 30)
		{
			str1 = str;
			for (i = 0; i < l; i++)
				str = str.replace(new RegExp('\\[(' + arTags[i] + ')[^\\]]*?\\]([\\s\\S]*?)\\[/\\1\\]', 'ig'), "$2");

			if (str == str1)
				break;
			it++;
		}

		this.WrapWith('', '', str);
	}
},

OnKeyDownBB: function(e)
{
	if(!e) e = window.event;

	var key = e.which || e.keyCode;
	if (e.ctrlKey && !e.shiftKey && !e.altKey)
	{
		switch (key)
		{
			case 66 : // B
			case 98 : // b
				this.FormatBB({tag: 'B'});
				return BX.PreventDefault(e);
			case 105 : // i
			case 73 : // I
				this.FormatBB({tag: 'I'});
				return BX.PreventDefault(e);
			case 117 : // u
			case 85 : // U
				this.FormatBB({tag: 'U'});
				return BX.PreventDefault(e);
			case 81 : // Q - quote
				this.FormatBB({tag: 'QUOTE'});
				return BX.PreventDefault(e);
		}
	}

	// Tab
	if (key == 9)
	{
		this.WrapWith('', '', "\t");
		return BX.PreventDefault(e);
	}

	// Ctrl + Enter
	if ((e.keyCode == 13 || e.keyCode == 10) && e.ctrlKey && this.ctrlEnterHandler)
	{
		this.SaveContent();
		this.ctrlEnterHandler();
	}
},

GetCutHTML: function(e)
{
	if (this.curCutId)
	{
		var pCut = this.pEditorDocument.getElementById(this.curCutId);
		if (pCut)
		{
			pCut.parentNode.insertBefore(BX.create("BR", {}, this.pEditorDocument), pCut);
			pCut.parentNode.removeChild(pCut);
		}
	}

	this.curCutId = this.SetBxTag(false, {tag: "cut"});
	return '<img src="' + this.oneGif+ '" class="bxed-cut" id="' + this.curCutId + '" title="' + BX.message.CutTitle + '"/>';
},

OnPaste: function()
{
	if (this.bOnPasteProcessing)
		return;

	this.bOnPasteProcessing = true;
	var _this = this;
	var scrollTop = this.pEditorDocument.body.scrollTop;
	setTimeout(function(){
		_this.bOnPasteProcessing = false;
		_this.InsertHTML('<span style="visibility: hidden;" id="' + _this.SetBxTag(false, {tag: "cursor"}) + '" ></span>');

		_this.SaveContent();
		setTimeout(function()
		{
			var content = _this.GetContent();

			if (/<\w[^>]*(( class="?MsoNormal"?)|(="mso-))/gi.test(content))
				content = _this.CleanWordText(content);

			_this.SetEditorContent(content);

			setTimeout(function()
			{
				try{
					var pCursor = _this.pEditorDocument.getElementById(_this.lastCursorId);
					if (pCursor && pCursor.parentNode)
					{
						var newScrollTop = pCursor.offsetTop - 30;
						if (newScrollTop > 0)
						{
							if (scrollTop > 0 && scrollTop + parseInt(_this.pFrame.offsetHeight) > newScrollTop)
								_this.pEditorDocument.body.scrollTop = scrollTop;
							else
								_this.pEditorDocument.body.scrollTop = newScrollTop;
						}

						_this.SelectElement(pCursor);
						pCursor.parentNode.removeChild(pCursor);
						_this.SetFocus();
					}
				}catch(e){}
			}, 100);

		}, 100);
	}, 100);
},

CleanWordText: function(text)
{
	text = text.replace(/<(P|B|U|I|STRIKE)>&nbsp;<\/\1>/g, ' ');
	text = text.replace(/<o:p>([\s\S]*?)<\/o:p>/ig, "$1");
	//text = text.replace(/<o:p>[\s\S]*?<\/o:p>/ig, "&nbsp;");

	text = text.replace(/<span[^>]*display:\s*?none[^>]*>([\s\S]*?)<\/span>/gi, ''); // Hide spans with display none

	text = text.replace(/<!--\[[\s\S]*?\]-->/ig, ""); //<!--[.....]--> <!--[if gte mso 9]>...<![endif]-->
	text = text.replace(/<!\[[\s\S]*?\]>/ig, ""); //	<! [if !vml]>
	text = text.replace(/<\\?\?xml[^>]*>/ig, ""); //<xml...>, </xml...>

	text = text.replace(/<o:p>\s*<\/o:p>/ig, "");

	text = text.replace(/<\/?[a-z1-9]+:[^>]*>/gi, "");	//<o:p...>, </o:p>
	text = text.replace(/<([a-z1-9]+[^>]*) class=([^ |>]*)(.*?>)/gi, "<$1$3");
	text = text.replace(/<([a-z1-9]+[^>]*) [a-z]+:[a-z]+=([^ |>]*)(.*?>)/gi, "<$1$3"); //	xmlns:v="urn:schemas-microsoft-com:vml"

	text = text.replace(/&nbsp;/ig, ' ');
	text = text.replace(/\s+?/gi, ' ');

	// Remove mso-xxx styles.
	text = text.replace(/\s*mso-[^:]+:[^;"]+;?/gi, "");

	// Remove margin styles.
	text = text.replace(/\s*margin: 0cm 0cm 0pt\s*;/gi, "");
	text = text.replace(/\s*margin: 0cm 0cm 0pt\s*"/gi, "\"");

	text = text.replace(/\s*TEXT-INDENT: 0cm\s*;/gi, "");
	text = text.replace(/\s*TEXT-INDENT: 0cm\s*"/gi, "\"");


	text = text.replace(/\s*TEXT-ALIGN: [^\s;]+;?"/gi, "\"");
	text = text.replace(/\s*PAGE-BREAK-BEFORE: [^\s;]+;?"/gi, "\"");
	text = text.replace(/\s*FONT-VARIANT: [^\s;]+;?"/gi, "\"");
	text = text.replace(/\s*tab-stops:[^;"]*;?/gi, "");
	text = text.replace(/\s*tab-stops:[^"]*/gi, "");

	text = text.replace(/<FONT[^>]*>([\s\S]*?)<\/FONT>/gi, '$1');
	text = text.replace(/\s*face="[^"]*"/gi, "");
	text = text.replace(/\s*face=[^ >]*/gi, "");
	text = text.replace(/\s*FONT-FAMILY:[^;"]*;?/gi, "");

	// Remove Class attributes
	text = text.replace(/<(\w[^>]*) class=([^ |>]*)([^>]*)/gi, "<$1$3");

	// Remove styles.
	text = text.replace(/<(\w[^>]*) style="([^\"]*)"([^>]*)/gi, "<$1$3");

	// Remove empty styles.
	text = text.replace(/\s*style="\s*"/gi, '');

	// Remove Lang attributes
	text = text.replace(/<(\w[^>]*) lang=([^ |>]*)([^>]*)/gi, "<$1$3");

	var iter = 0;
	while (text.toLowerCase().indexOf('<span') != -1 && text.toLowerCase().indexOf('</span>') != -1 && iter++ < 20)
		text = text.replace(/<span[^>]*?>([\s\S]*?)<\/span>/gi, '$1');

	var
		_text,
		i, tag, arFormatTags = ['b', 'strong', 'i', 'u', 'font', 'span', 'strike'];

	while (true)
	{
		_text = text;
		for (i in arFormatTags)
		{
			tag = arFormatTags[i];
			text = text.replace(new RegExp('<' + tag + '[^>]*?>(\\s*?)<\\/' + tag + '>', 'gi'), '$1');
			text = text.replace(new RegExp('<\\/' + tag + '[^>]*?>(\\s*?)<' + tag + '>', 'gi'), '$1');
		}

		if (_text == text)
			break;
	}

	// Remove empty tags
	text = text.replace(/<(?:[^\s>]+)[^>]*>([\s\n\t\r]*)<\/\1>/g, "$1");
	text = text.replace(/<(?:[^\s>]+)[^>]*>(\s*)<\/\1>/g, "$1");
	text = text.replace(/<(?:[^\s>]+)[^>]*>(\s*)<\/\1>/g, "$1");

	//text = text.replace(/<\/?xml[^>]*>/gi, "");	//<xml...>, </xml...>
	text = text.replace(/<xml[^>]*?(?:>\s*?<\/xml)?(?:\/?)?>/ig, '');
	text = text.replace(/<meta[^>]*?(?:>\s*?<\/meta)?(?:\/?)?>/ig, '');
	text = text.replace(/<link[^>]*?(?:>\s*?<\/link)?(?:\/?)?>/ig, '');
	text = text.replace(/<style[\s\S]*?<\/style>/ig, '');

	text = text.replace(/<table([\s\S]*?)>/gi, "<table>");
	text = text.replace(/<tr([\s\S]*?)>/gi, "<tr>");
	text = text.replace(/(<td[\s\S]*?)width=("|')[\s\S]*?\2([\s\S]*?>)/gi, "$1$3");
	text = text.replace(/(<td[\s\S]*?)height=("|')[\s\S]*?\2([\s\S]*?>)/gi, "$1$3");
	text = text.replace(/(<td[\s\S]*?)style=("|')[\s\S]*?\2([\s\S]*?>)/gi, "$1$3");
	text = text.replace(/(<td[\s\S]*?)valign=("|')[\s\S]*?\2([\s\S]*?>)/gi, "$1$3");
	text = text.replace(/(<td[\s\S]*?)nowrap=("|')[\s\S]*?\2([\s\S]*?>)/gi, "$1$3");
	text = text.replace(/(<td[\s\S]*?)nowrap([\s\S]*?>)/gi, "$1$3");

	text = text.replace(/(<col[\s\S]*?)width=("|')[\s\S]*?\2([\s\S]*?>)/gi, "$1$3");
	text = text.replace(/(<col[\s\S]*?)style=("|')[\s\S]*?\2([\s\S]*?>)/gi, "$1$3");

	// For Opera (12.10+) only when in text we have reference links.
	if (BX.browser.IsOpera())
		text = text.replace(/REF\s+?_Ref\d+?[\s\S]*?MERGEFORMAT\s([\s\S]*?)\s[\s\S]*?<\/xml>/gi, " $1 ");

	return text;
}
};

BXLEditorUtils = function()
{
	this.oTune = {};
	this.setCurrentEditorId('default');
};
BXLEditorUtils.prototype = {
	setCurrentEditorId: function(id)
	{
		this.curId = id;
	},

	prepare : function()
	{
		if (!this.oTune[this.curId])
			this.oTune[this.curId] =
			{
				buttons: [],
				ripButtons: {}
			};
	},

	addButton : function(pBut, ind)
	{
		if (!pBut || !pBut.id)
			return false;
		if (typeof ind == 'undefined')
			ind = -1;

		this.prepare();
		this.oTune[this.curId].buttons.push({but: pBut, ind: ind});

		return true;
	},

	removeButton: function(id)
	{
		this.prepare();
		this.oTune[this.curId].ripButtons[id] = true;
	}
};
oBXLEditorUtils = new BXLEditorUtils();

function BXFindParentElement(pElement1, pElement2)
{
	var p, arr1 = [], arr2 = [];
	while((pElement1 = pElement1.parentNode) != null)
		arr1[arr1.length] = pElement1;
	while((pElement2 = pElement2.parentNode) != null)
		arr2[arr2.length] = pElement2;

	var min, diff1 = 0, diff2 = 0;
	if(arr1.length<arr2.length)
	{
		min = arr1.length;
		diff2 = arr2.length - min;
	}
	else
	{
		min = arr2.length;
		diff1 = arr1.length - min;
	}

	for(var i=0; i<min-1; i++)
	{
		if(BXElementEqual(arr1[i+diff1], arr2[i+diff2]))
			return arr1[i+diff1];
	}
	return arr1[0];
}

window.BXFindParentByTagName = function (pElement, tagName)
{
	tagName = tagName.toUpperCase();
	while(pElement && (pElement.nodeType !=1 || pElement.tagName.toUpperCase() != tagName))
		pElement = pElement.parentNode;
	return pElement;
}


function SetAttr(pEl, attr, val)
{
	if(attr=='className' && !BX.browser.IsIE())
		attr = 'class';

	if(val.length <= 0)
		pEl.removeAttribute(attr);
	else
		pEl.setAttribute(attr, val);
}

function BXCutNode(pNode)
{
	while(pNode.childNodes.length > 0)
		pNode.parentNode.insertBefore(pNode.childNodes[0], pNode);

	pNode.parentNode.removeChild(pNode);
}

/* End */
;