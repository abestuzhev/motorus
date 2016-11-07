
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
; /* Start:/bitrix/components/bitrix/forum/templates/.default/bitrix/forum.pm.edit/.default/script.js*/
function ValidateForm(form)
{
	if (typeof form != "object" || !window.oLHE)
		return false;
	window.oLHE.SaveContent();

	var
		errors = "",
		Message = window.oLHE.GetContent(),
		MessageMax = 64000,
		MessageLength = form.POST_MESSAGE.value.length;

	if (form.POST_SUBJ && (form.POST_SUBJ.value.length < 2))
		errors += window["oErrors"]['no_topic_name'];

	if (MessageLength < 2)
		errors += window["oErrors"]['no_message'];
	else if ((MessageMax !== 0) && (MessageLength > MessageMax))
		errors += window["oErrors"]['max_len'].replace("#MAX_LENGTH#", MessageMax).replace("#LENGTH#", MessageLength);

	if (errors !== "")
	{
		alert(errors);
		return false;
	}
	
	var arr = form.getElementsByTagName("input");
	for (var i=0; i < arr.length; i++)
	{
		var butt = arr[i];
		if (butt.getAttribute("type") == "submit")
			butt.disabled = true;
	}
	return true;
}

/* End */
;; /* /bitrix/components/bitrix/forum/templates/.default/script.js*/
; /* /bitrix/components/bitrix/forum/templates/.default/bitrix/system.auth.form/.default/script.js*/
; /* /bitrix/components/bitrix/forum.interface/templates/.default/script.js*/
; /* /bitrix/components/bitrix/forum/templates/.default/bitrix/forum.pm.edit/.default/script.js*/
