"use strict";
chrome.runtime.onMessage.addListener(function (request, sender, sendMessage) {
  let tMode = document.getElementById('e_switchercheck').checked;
  switch (request.greeting) {
    case "getPageUrl": // 获取 dz 页面的 url
      sendMessage({
        url: window.location.href
      });
      break;
    case "getTextareaSelect": // 获取 textarea 被选中的文本
      let text = "";
      if (tMode) { // 判断编辑器模式
        text = window.getSelection().toString();
      } else {
        text = document.getElementById("e_iframe").contentWindow.getSelection().toString();
      }
      sendMessage({
        text: text,
        mode: tMode
      });
      break;
    case "postTextToTextarea": // 投送处理后的代码至 textarea
      if (tMode) {
        let textarea = document.getElementById('e_textarea');
        let se = {
          start: textarea.selectionStart,
          end: textarea.selectionEnd
        };
        let tValue = textarea.value;
        let tValueStart = tValue.substring(0, se.start);
        let tValueEnd = tValue.substring(se.end, tValue.length);
        let tValueComputed = tValueStart + request.data.text + tValueEnd;
        textarea.value = tValueComputed;
        sendMessage({
          tValue: tValue,
          tValueStart: tValueStart,
          tValueEnd: tValueEnd
        });
      } else {
        sendMessage("mode error");
      }
      break;
    default:
      sendMessage("ok");
      break;
  }
});