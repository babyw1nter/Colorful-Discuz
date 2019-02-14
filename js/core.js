"use strict";
chrome.runtime.onMessage.addListener(function (request, sender, sendMessage) {
  switch (request.greeting) {
    case "getTextareaSelect":
      let text = "";
      if ($("#e_switchercheck").is(":checked")) { // 判断编辑器模式
        text = window.getSelection().toString();
      } else {
        text = document.getElementById("e_iframe").contentWindow.getSelection().toString();
      }
      sendMessage(text);
      break;
    default:
      sendMessage("hello!");
      break;
  }
});