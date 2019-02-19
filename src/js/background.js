"use strict";
class apiClass {
  sendMessage(greeting, data, callback) { // 向 content_scripts 发送消息
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, (tab) => {
      if (tab[0].url.indexOf("forum.php?mod=post") <= -1) return;
      chrome.tabs.sendMessage(tab[0].id, {
        greeting: greeting,
        data: data
      }, (response) => {
        callback(response);
      });
    });
  }
  getPageUrl(callback) { // 获取当前激活页面 url
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, (tab) => {
      callback(tab[0].url);
    });
  }
  hex2rgb(hex) { // hex -> rgb by Sara
    if (typeof (hex) == "undefined") return;
    let sColor = hex.toLowerCase();
    if (sColor && /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/.test(sColor)) {
      if (sColor.length === 4) {
        let sColorNew = "#";
        for (let i = 1; i < 4; i += 1) {
          sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
        }
        sColor = sColorNew;
      }
      let sColorChange = [];
      for (let i = 1; i < 7; i += 2) {
        sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
      }
      return {
        r: sColorChange[0],
        g: sColorChange[1],
        b: sColorChange[2],
        rgb: "rgb(" + sColorChange.join(",") + ")"
      };
    } else {
      return sColor;
    }
  }
  rgb2hex(color) { // rgb -> hex by gossip
    if (typeof (color) == "undefined") return;
    if (color.indexOf("NaN") != -1) return;
    let rgb = color.split(',');
    let r = parseInt(rgb[0].split('(')[1]);
    let g = parseInt(rgb[1]);
    let b = parseInt(rgb[2].split(')')[0]);
    let hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    return hex;
  }
  rgb2hex(color) { // rgb -> hex by gossip
    if (typeof (color) == "undefined") return;
    if (color.indexOf("NaN") != -1) return;
    let rgb = color.split(',');
    let r = parseInt(rgb[0].split('(')[1]);
    let g = parseInt(rgb[1]);
    let b = parseInt(rgb[2].split(')')[0]);
    let hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    return hex;
  }
  randomNum(minNum, maxNum) { // [n, m] randomNum by starof
    if (minNum > maxNum)[minNum, maxNum] = [maxNum, minNum];
    switch (arguments.length) {
      case 1:
        return parseInt(Math.random() * minNum + 1, 10);
        break;
      case 2:
        return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
        break;
      default:
        return 0;
        break;
    }
  }
}
function api () { // 构造函数
  return new apiClass;
}