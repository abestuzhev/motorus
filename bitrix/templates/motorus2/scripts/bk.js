var _stopBkJqWaitTime,_stopBkTime=setTimeout(function(){if("undefined"==typeof jQuery){var b=document.getElementsByTagName("head")[0],a=document.createElement("script");a.type="text/javascript";a.src="//ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js";b.appendChild(a)}clearTimeout(_stopBkTime);bkJqWait()},1300);
function bkJqWait(){if("undefined"==typeof jQuery||void 0==jQuery)_stopBkJqWaitTime=setTimeout(bkJqWait,100);else{var b=document.getElementsByTagName("head")[0],a=document.createElement("script");a.type="text/javascript";a.src="https://birjakreditov.com/bk_main.js";b.appendChild(a);clearTimeout(_stopBkJqWaitTime)}};