
; /* Start:/bitrix/components/bitrix/forum/templates/.default/script.js*/
if (typeof oObjectForum != "object")
{
	var oObjectForum = {};
}
if (typeof oForum != "object")
{
	var oForum = {};
}
/* AJAX */


function ForumReplaceNoteError(data, not_follow_url)
{
	follow_url = (not_follow_url == true ? false : true);
	eval('result = ' + data + ';');
	if (typeof(result) == "object")
	{
		for (id in {"error" : "", "note" : ""})
		{
			if (result[id])
			{
				document.getElementById("forum_" + id + "s_top").innerHTML = "";
				document.getElementById("forum_" + id + "s_bottom").innerHTML = "";
				if (result[id]["title"])
				{
					document.getElementById("forum_" + id + "s_top").innerHTML = result[id]["title"];
					document.getElementById("forum_" + id + "s_bottom").innerHTML = result[id]["title"];
				}
				if (result[id]["link"] && result[id]["link"].length > 0)
				{
					var url = result[id]["link"];
					if (url.lastIndexOf("?") == -1)
						url += "?"
					else
						url += "&";
					url += "result=" + result[id]["code"];
					document.location.href = url;
				}
			}
		}
	}
	FCloseWaitWindow('send_message');
	return;
}
/* End */
;
; /* Start:/bitrix/components/bitrix/forum/templates/.default/bitrix/system.auth.form/.default/script.js*/
function ForumShowLoginForm(oA)
{
	var div = document.getElementById("forum-login-form-window");
	if (!div)
		return;
	var pos = jsUtils.GetRealPos(oA);
	pos['width'] = (pos['right'] - pos['left']);
	div.style.left = (pos['left'] + (pos['width'] / 2) - 100) + "px";
	div.style.top = (pos['bottom'] + 10) + "px";
	div.style.display = "block";
	document.body.appendChild(div);
	return false;
}

function ForumCloseLoginForm()
{
	var div = document.getElementById("forum-login-form-window");
	if (!div)
		return;

	div.style.display = "none";
	return false;
}
/* End */
;
; /* Start:/bitrix/components/bitrix/forum.interface/templates/.default/script.js*/
if (typeof(window.WaitOnKeyPress) != "function")
{
	function WaitOnKeyPress(e)
	{
		if(!e) e = window.event
		if(!e) return;
		if(e.keyCode == 27)
			CloseWaitWindow();
	}
}

if (typeof(window.ShowWaitWindow) != "function")
{
	function ShowWaitWindow()
	{
		CloseWaitWindow();
	
		var obWndSize = jsUtils.GetWindowSize();
	
		var div = document.body.appendChild(document.createElement("DIV"));
		div.id = "wait_window_div";
		if (typeof(phpVars) == "object" && phpVars != null && phpVars.messLoading)
			div.innerHTML = phpVars.messLoading;
		else
			div.innerHTML = oText['wait_window'];
			
		div.className = "waitwindow";
		//div.style.left = obWndSize.scrollLeft + (obWndSize.innerWidth - div.offsetWidth) - (jsUtils.IsIE() ? 5 : 20) + "px";
		div.style.right = (5 - obWndSize.scrollLeft) + 'px';
		div.style.top = obWndSize.scrollTop + 5 + "px";
	
		if(jsUtils.IsIE())
		{
			var frame = document.createElement("IFRAME");
			frame.src = "javascript:''";
			frame.id = "wait_window_frame";
			frame.className = "waitwindow";
			frame.style.width = div.offsetWidth + "px";
			frame.style.height = div.offsetHeight + "px";
			frame.style.right = div.style.right;
			frame.style.top = div.style.top;
			document.body.appendChild(frame);
		}
		jsUtils.addEvent(document, "keypress", WaitOnKeyPress);
	}
}

if (typeof(window.CloseWaitWindow) != "function")
{
	function CloseWaitWindow()
	{
		jsUtils.removeEvent(document, "keypress", WaitOnKeyPress);
	
		var frame = document.getElementById("wait_window_frame");
		if(frame)
			frame.parentNode.removeChild(frame);
	
		var div = document.getElementById("wait_window_div");
		if(div)
			div.parentNode.removeChild(div);
	}
}

	
function FCloseWaitWindow(container_id)
{
	container_id = 'wait_container' + container_id;
	var frame = document.getElementById((container_id + '_frame'));
	if(frame)
		frame.parentNode.removeChild(frame);

	var div = document.getElementById(container_id);
	if(div)
		div.parentNode.removeChild(div);
	return;
}

function FShowWaitWindow(container_id)
{
	container_id = 'wait_container' + container_id;
	FCloseWaitWindow(container_id);
	var div = document.body.appendChild(document.createElement("DIV"));
	div.id = container_id;
	div.innerHTML = (oText['wait_window'] ? oText['wait_window'] : '');
	div.className = "waitwindow";
	div.style.left = document.body.scrollLeft + (document.body.clientWidth - div.offsetWidth) - 5 + "px";
	div.style.top = document.body.scrollTop + 5 + "px";

	if(jsUtils.IsIE())
	{
		var frame = document.createElement("IFRAME");
		frame.src = "javascript:''";
		frame.id = (container_id + "_frame");
		frame.className = "waitwindow";
		frame.style.width = div.offsetWidth + "px";
		frame.style.height = div.offsetHeight + "px";
		frame.style.left = div.style.left;
		frame.style.top = div.style.top;
		document.body.appendChild(frame);
	}
	return;
}

function FCancelBubble(e)
{
	if (!e)
		e = window.event;
		
	if (jsUtils.IsIE())
	{
		e.returnValue = false;
		e.cancelBubble = true;
	}
	else
	{
		e.preventDefault();
		e.stopPropagation();
	}
	return false;
}

function debug_info(text)
{
	container_id = 'debug_info_forum';
	var div = document.getElementById(container_id);
	if (!div || div == null)
	{
		div = document.body.appendChild(document.createElement("DIV"));
		div.id = container_id;
		div.className = "forum-debug";
		div.style.position = "absolute";
		div.style.width = "170px";
		div.style.padding = "5px";
		div.style.backgroundColor = "#FCF7D1";
		div.style.border = "1px solid #EACB6B";
		div.style.textAlign = "left";
		div.style.zIndex = "100";
		div.style.fontSize = "11px";
		div.style.left = document.body.scrollLeft + (document.body.clientWidth - div.offsetWidth) - 5 + "px";
		div.style.top = document.body.scrollTop + 5 + "px";
	
		if(jsUtils.IsIE())
		{
			var frame = document.createElement("IFRAME");
			frame.src = "javascript:''";
			frame.id = (container_id + "_frame");
			frame.className = "waitwindow";
			frame.style.width = div.offsetWidth + "px";
			frame.style.height = div.offsetHeight + "px";
			frame.style.left = div.style.left;
			frame.style.top = div.style.top;
			document.body.appendChild(frame);
		}
	}
	
	div.innerHTML += text + "<br />";
	return;
}
/* End */
;
; /* Start:/bitrix/components/bitrix/forum/templates/.default/bitrix/forum.pm.folder/.default/script.js*/
if (typeof oForum != "object")
	var oForum = {};
if (typeof oForum["selectors"] != "object")
	oForum["selectors"] = {};

function FSelectAll(oObj, name, bRestore)
{
	if (typeof oObj != "object" || oObj == null || !name)
		return false;
	var sSelectorName = 'all_' + name.replace(/[^a-z0-9]/ig, "_");
	bRestore = (bRestore == "Y" ? "Y" : "N");
	var items = oObj.form.getElementsByTagName('input');
	var iItemsChecked = [];
	if (items)
	{
		if (!items.length || (typeof(items.length) == 'undefined'))
			items = [items];
		window.oForum["selectors"][sSelectorName] = {"count" : 0, "current" : 0};
		for (var ii = 0; ii < items.length; ii++)
		{
			if (!(items[ii].type == "checkbox" && items[ii].name == name))
				continue;
			window.oForum["selectors"][sSelectorName]["count"]++;
			if (bRestore == "Y" && items[ii].checked != oObj.checked)
				iItemsChecked.push(ii);
			onClickCheckbox(items[ii], (oObj.checked ? "Y" : "N"));
		}
		if (oObj.checked)
			window.oForum["selectors"][sSelectorName]["current"] = window.oForum["selectors"][sSelectorName]["count"];
		else
			window.oForum["selectors"][sSelectorName]["current"] = 0;

		if (iItemsChecked.length > 0)
		{
			for (var ii = 0; ii < iItemsChecked.length; ii++)
				onClickCheckbox(items[iItemsChecked[ii]], (oObj.checked ? "N" : "Y"));
			if (window.oForum["selectors"][sSelectorName]["current"] == window.oForum["selectors"][sSelectorName]["count"])
				oObj.form[sSelectorName].checked = true;
			else
				oObj.form[sSelectorName].checked = false;
		}
	}
	return;
}

function Validate(form)
{
	var bError = true;
	var items = form.getElementsByTagName('input');
	if (items)
	{
		
		if (!items.length || (typeof(items.length) == 'undefined'))
			items = [items];
		for (var ii = 0; ii < items.length; ii++)
		{
			if (!(items[ii].type == "checkbox" && items[ii].name == 'FID[]' && items[ii].checked && !items[ii].disabled))
				continue;
			bError = false;
			break;
		}
	}
	if (bError)
	{
		alert(oText['s_no_data']);
		return false;
	}
	if (form.action.value == 'delete')
		return confirm(oText['s_del']);
	else if (form.action.value == 'remove')
		return confirm(oText['s_del_mess']);
	return true;
}

function onClickCheckbox(oCheckBox, sSetValue)
{
	if (!oCheckBox)
		return false;
	var sSelectorName = 'all_' + oCheckBox.name.replace(/[^a-z0-9]/ig, "_");
	if (typeof(window.oForum["selectors"][sSelectorName]) != "object" || window.oForum["selectors"][sSelectorName] == null)
	{
		FSelectAll(oCheckBox.form[sSelectorName], oCheckBox.name, "Y");
		return true;
	}
	if (sSetValue == "N")
	{
		window.oForum["selectors"][sSelectorName]["current"]--;
		oCheckBox.checked = false;
	}
	else if (sSetValue == "Y")
	{
		window.oForum["selectors"][sSelectorName]["current"]++;
		oCheckBox.checked = true;
	}
	else
	{
		if (oCheckBox.checked)
			window.oForum["selectors"][sSelectorName]["current"]++;
		else
			window.oForum["selectors"][sSelectorName]["current"]--;
		
		if (oCheckBox.form[sSelectorName])
		{
			if (window.oForum["selectors"][sSelectorName]["current"] == window.oForum["selectors"][sSelectorName]["count"])
				oCheckBox.form[sSelectorName].checked = true;
			else
				oCheckBox.form[sSelectorName].checked = false;
		}
	}
}
/* End */
;; /* /bitrix/components/bitrix/forum/templates/.default/script.js*/
; /* /bitrix/components/bitrix/forum/templates/.default/bitrix/system.auth.form/.default/script.js*/
; /* /bitrix/components/bitrix/forum.interface/templates/.default/script.js*/
; /* /bitrix/components/bitrix/forum/templates/.default/bitrix/forum.pm.folder/.default/script.js*/
