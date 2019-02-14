"use strict";
var vm = new Vue({
  el: "#colorful-app",
  data: {
    colorStart: "#FC4040",
    colorEnd: "#6A2BFF",
    colorText: "欢迎使用炫彩字体特效",
    isViewTextCode: false,
    isError: false,
    errorMsg: ""
  },
  computed: {
    colorTextView: function () {
      if (!this.colorText || this.colorText.length < 4) {
        this.isError = true;
        this.errorMsg = "至少需要4个以上字符才可以生成渐变字";
        return "欢迎使用炫彩字体特效"
      } else {
        this.isError = false;
        return this.colorText;
      }
    },
    colorStartRgb: function () {
      return hex2rgb(this.colorStart);
    },
    colorEndRgb: function () {
      return hex2rgb(this.colorEnd);
    },
    colorTextComputed: function () {
      let str = this.colorTextView;
      let strArray = [],
          strArrayTextDiscuz = "",
          strArrayTextHtml = [];
      strArray = str.split("");
      let rgbStart = this.colorStartRgb;
      let rgbEnd = this.colorEndRgb;
      let _colorCalcValue = {
        r: (rgbEnd.r - rgbStart.r) / strArray.length,
        g: (rgbEnd.g - rgbStart.g) / strArray.length,
        b: (rgbEnd.b - rgbStart.b) / strArray.length,
      }
      for (let i = 0; i < strArray.length; i++) {
        let colorCalcObject = {
          r: Math.round(rgbStart.r + (_colorCalcValue.r * i)),
          g: Math.round(rgbStart.g + (_colorCalcValue.g * i)),
          b: Math.round(rgbStart.b + (_colorCalcValue.b * i))
        };
        strArrayTextHtml.push({
          text: strArray[i],
          color: colorCalcObject
        });
        let colorHex = "rgb(" + strArrayTextHtml[i].color.r + "," + strArrayTextHtml[i].color.g + "," + strArrayTextHtml[i].color.b + ")";
        strArrayTextHtml[i].colorHex = rgb2hex(colorHex); // rgb转16进制
      }
      strArrayTextHtml[0].color = rgb2hex(rgbStart.rgb); // 起始色
      strArrayTextHtml[strArrayTextHtml.length - 1].color = rgb2hex(rgbStart.rgb); // 结尾色
      for (let i = 0; i < strArrayTextHtml.length; i++) { // 生成Discuz!可用代码
        strArrayTextDiscuz = strArrayTextDiscuz + "[color=" + strArrayTextHtml[i].colorHex + "]" + strArrayTextHtml[i].text + "[/color]";
      }
      return {
        discuz: "[b][size=5]" + strArrayTextDiscuz + "[/size][/b]", // TUDO: 自定义字号&粗细
        html: strArrayTextHtml
      };
    },
  }
});

function hex2rgb (hex) { // by Sara
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

function rgb2hex(color) { // by gossip
  let rgb = color.split(',');
  let r = parseInt(rgb[0].split('(')[1]);
  let g = parseInt(rgb[1]);
  let b = parseInt(rgb[2].split(')')[0]);
  let hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  return hex;
}

chrome.tabs.query({ // 寻找mcbbs的tabs并与页面注入的脚本通信, 以获取当前被选中的文本
  active: true,
  currentWindow: true
}, function (tab) {
  if (tab[0].url.indexOf("forum.php?mod=post") <= -1) return;
  chrome.tabs.sendMessage(tab[0].id, {
    greeting: "getTextareaSelect"
  }, function (response) {
    if (!response) return;
    vm.colorText = response;
  });
});