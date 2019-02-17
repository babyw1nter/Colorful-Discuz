"use strict";
var vm = new Vue({
  el: "#colorful-app",
  data: {
    url: null,
    plan: 0,
    collapseActiveName: "0",
    colorOptions: {
      colorStart: "#FC4040",
      colorEnd: "#6A2BFF",
      colorMode: 0,
      colorTextMode: 0
    },
    fontOptions: {
      size: 5,
      b: true,
      i: false,
      u: false,
      line: 6
    },
    settingOptions: {
      plan: {
        isActive: 0,
        plans: [{
          value: 0,
          label: '默认方案',
          colorOptions: {
            colorStart: "#FC4040",
            colorEnd: "#6A2BFF",
            colorMode: 0,
            colorTextMode: 0
          },
          fontOptions: {
            size: 5,
            b: true,
            i: false,
            u: false,
            line: 6
          }
        }]
      }
    },
    colorModes: [{
      value: 0,
      label: '线性插值渐变'
    }, {
      value: 1,
      label: '范围随机颜色'
    }],
    colorTextModes: [{
      value: 0,
      label: '普通文字'
    }, {
      value: 1,
      label: '残影文字'
    }],
    colorText: "欢迎使用炫彩字体特效",
    textAreaMode: false,
    isViewChangePlan: false,
    isViewTextCode: false,
    isError: false,
    errorMsg: ""
  },
  computed: {
    colorTextView: function () {
      let textComputed = this.colorText;
      let errorArray = [];
      if (!this.textAreaMode) { // 判断编辑器模式
        errorArray.push({
          type: "mode error",
          msg: "请将编辑器模式切换到'纯文本'后再使用"
        });
      }
      if (!this.colorText || this.colorText.length < 4) { // 判断长度
        errorArray.push({
          type: "length error",
          msg: "至少需要4个以上字符才可以生成炫彩字"
        });
        textComputed = "欢迎使用炫彩字体特效";
      }
      if (this.url != null) {
        if (this.url.indexOf("forum.php?mod=post") <= -1) {
          errorArray.push({
            type: "url error",
            msg: "当前页面不是 Discuz! 的发帖页面"
          });
        }
      }
      if (errorArray.length != 0) { // 判断是否有错误
        this.isError = true;
        this.errorMsg = errorArray[errorArray.length - 1].msg;
      } else {
        this.isError = false;
        this.errorMsg = "";
      }
      return textComputed;
    },
    colorStartRgb: function () {
      return hex2rgb(this.colorOptions.colorStart);
    },
    colorEndRgb: function () {
      return hex2rgb(this.colorOptions.colorEnd);
    },
    colorTextComputed: function () { // 计算&显示预览文本
      let str = this.colorTextView;
      let strArray = [],
          strArrayTextDiscuz = "",
          strArrayTextHtml = [];
      strArray = str.split(""); // 将文本逐字分割
      let rgbStart = this.colorStartRgb;
      let rgbEnd = this.colorEndRgb;
      switch (this.colorOptions.colorTextMode) { // 判断文字模式
        case 0: // 普通文本
          switch (this.colorOptions.colorMode) {
            case 0: // 线性插值渐变
              let _colorCalcValue = { // 颜色差值计算
                r: (rgbEnd.r - rgbStart.r) / strArray.length,
                g: (rgbEnd.g - rgbStart.g) / strArray.length,
                b: (rgbEnd.b - rgbStart.b) / strArray.length,
              }
              for (let i = 0; i < strArray.length; i++) { // 遍历计算每个字的颜色
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
              strArrayTextHtml[0].color = rgb2hex(rgbStart.rgb); // 设置起始色
              strArrayTextHtml[strArrayTextHtml.length - 1].color = rgb2hex(rgbStart.rgb); // 设置结尾色
              break;
            case 1: // 范围随机色
              for (let i = 0; i < strArray.length; i++) {
                let colorCalcObject = {
                  r: randomNum(rgbStart.r, rgbEnd.r),
                  g: randomNum(rgbStart.g, rgbEnd.g),
                  b: randomNum(rgbStart.b, rgbEnd.b)
                };
                strArrayTextHtml.push({
                  text: strArray[i],
                  color: colorCalcObject
                });
                let colorHex = "rgb(" + strArrayTextHtml[i].color.r + "," + strArrayTextHtml[i].color.g + "," + strArrayTextHtml[i].color.b + ")";
                strArrayTextHtml[i].colorHex = rgb2hex(colorHex);
              }
              break;
            default:
              break;
          }
          for (let i = 0; i < strArrayTextHtml.length; i++) {
            strArrayTextDiscuz = strArrayTextDiscuz + "[color=" + strArrayTextHtml[i].colorHex + "]" + strArrayTextHtml[i].text + "[/color]";
          }
          break;
        case 1: // 残影文本
          switch (this.colorOptions.colorMode) {
            case 0:
              let _colorCalcValue = { // 颜色差值计算
                r: (rgbEnd.r - rgbStart.r) / strArray.length,
                g: (rgbEnd.g - rgbStart.g) / strArray.length,
                b: (rgbEnd.b - rgbStart.b) / strArray.length,
              }
              for (let i = 0; i < strArray.length; i++) { // 遍历计算每个字的颜色
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
              strArrayTextHtml[0].color = rgb2hex(rgbStart.rgb); // 设置起始色
              strArrayTextHtml[strArrayTextHtml.length - 1].color = rgb2hex(rgbStart.rgb); // 设置结尾色
              break;
            case 1:
              for (let i = 0; i < strArray.length; i++) {
                let colorCalcObject = {
                  r: randomNum(rgbStart.r, rgbEnd.r),
                  g: randomNum(rgbStart.g, rgbEnd.g),
                  b: randomNum(rgbStart.b, rgbEnd.b)
                };
                strArrayTextHtml.push({
                  text: strArray[i],
                  color: colorCalcObject
                });
                let colorHex = "rgb(" + strArrayTextHtml[i].color.r + "," + strArrayTextHtml[i].color.g + "," + strArrayTextHtml[i].color.b + ")";
                strArrayTextHtml[i].colorHex = rgb2hex(colorHex);
              }
              break;
            default:
              break;
          }
          for (let i = 0; i < strArrayTextHtml.length; i++) {
            strArrayTextDiscuz = strArrayTextDiscuz + "[color=" + strArrayTextHtml[i].colorHex + "]" + strArrayTextHtml[i].text + "[/color]";
          }
          strArrayTextDiscuz = "[p=3, 0, left]" + strArrayTextDiscuz + "[/p]"; // 添加p标签包围
          let _discuzCode = strArrayTextDiscuz;
          for (let i = 0; i < this.fontOptions.line - 1; i++) {
            strArrayTextDiscuz += _discuzCode;
          }
          break;
        default:
          break;
      }
      let _codeHead = {
        size: "[size=" + this.fontOptions.size +  "]",
        b: this.fontOptions.b ? "[b]" : "",
        i: this.fontOptions.i ? "[i]" : "",
        u: this.fontOptions.u ? "[u]" : ""
      },
      _codeFoot = {
        size: "[/size]",
        b: this.fontOptions.b ? "[/b]" : "",
        i: this.fontOptions.i ? "[/b]" : "",
        u: this.fontOptions.u ? "[/b]" : ""
      };
      return {
        discuz: _codeHead.size + _codeHead.b + _codeHead.i + _codeHead.u + strArrayTextDiscuz + _codeFoot.size + _codeFoot.b + _codeFoot.i + _codeFoot.u, // TUDO: 自定义字号&粗细
        html: strArrayTextHtml
      };
    }
  },
  watch: { // 深度监听设置项的变化并写入本地储存
    colorOptions: {
      deep: true,
      handler: function () {
        this.settingOptions.plan.plans.find(item => item.value === this.settingOptions.plan.isActive).colorOptions = this.colorOptions;
        localStorage.setItem("settingOptions", JSON.stringify(this.settingOptions));
      }
    },
    fontOptions: {
      deep: true,
      handler: function () {
        this.settingOptions.plan.plans.find(item => item.value === this.settingOptions.plan.isActive).fontOptions = this.fontOptions;
        localStorage.setItem("settingOptions", JSON.stringify(this.settingOptions));
      }
    },
    'settingOptions.plan.isActive': { // 方案被改变
      handler: function () {
        this.colorOptions = this.settingOptions.plan.plans.find(item => item.value === this.settingOptions.plan.isActive).colorOptions;
        this.fontOptions = this.settingOptions.plan.plans.find(item => item.value === this.settingOptions.plan.isActive).fontOptions;
      },
    },
    'settingOptions.plan.plans': {
      deep: true,
      handler: function () {
        localStorage.setItem("settingOptions", JSON.stringify(this.settingOptions));
      }
    }
  },
  methods: {
    postTextToTextarea: function () { // 投送至编辑框
      chrome.tabs.query({
        active: true,
        currentWindow: true
      }, function (tab) {
        if (tab[0].url.indexOf("forum.php?mod=post") <= -1) return;
        chrome.tabs.sendMessage(tab[0].id, {
          greeting: "postTextToTextarea",
          text: vm.colorTextComputed.discuz
        }, function (response) {
          // 此处返回被选择的起始位置和结束位置
        });
      });
    },
    copySuccess: function () { // 复制成功
      this.$message({
        message: '复制到剪辑版成功！',
        type: 'success',
        showClose: true
      });
    },
    copyError: function () { // 复制失败
      this.$message({
        message: '复制到剪辑版失败！',
        type: 'error',
        showClose: true
      });
    },
    settingChangePlan: function () { // 更改方案
      this.isViewChangePlan = this.isViewChangePlan ? false : true;
    },
    settingAllDefault: function () { // 恢复默认
      this.$confirm('恢复默认色彩和文本样式, 是否继续?', '恢复默认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.colorOptions = {
          colorStart: "#FC4040",
          colorEnd: "#6A2BFF",
          colorText: "欢迎使用炫彩字体特效",
          colorMode: 0,
          colorTextMode: 0
        };
        this.fontOptions = {
          size: 5,
          b: true,
          i: false,
          u: false,
          line: 6
        };
        this.$message({
          type: 'success',
          showClose: true,
          message: '恢复成功!'
        });
      });
    },
    planAdd: function () {
      this.$prompt('请输入方案名称', '添加方案', {
        confirmButtonText: '添加',
        cancelButtonText: '取消',
        inputValidator: (value) => {
          if (!value) return "方案名称不能为空";
          if (this.settingOptions.plan.plans.find(item => item.label === value)) return "该方案名称已存在";
          return true;
        }
      }).then(({ value }) => {
        this.settingOptions.plan.plans.push({
          value: value,
          label: value,
          colorOptions: {
            colorStart: "#FC4040",
            colorEnd: "#6A2BFF",
            colorMode: 0,
            colorTextMode: 0
          },
          fontOptions: {
            size: 5,
            b: true,
            i: false,
            u: false,
            line: 6
          }
        });
        this.settingOptions.plan.isActive = this.settingOptions.plan.plans[this.settingOptions.plan.plans.length - 1].value;
        this.$message({
          type: 'success',
          showClose: true,
          message: '添加新方案"' + value + '"成功!'
        });
      });
    },
    planDel: function () {
      let index = this.settingOptions.plan.plans.indexOf(this.settingOptions.plan.plans.find(item => item.value === this.settingOptions.plan.isActive));
      let name = this.settingOptions.plan.plans[index].label;
      if (this.settingOptions.plan.isActive == 0 && name == "默认方案") {
        this.$message({
          type: 'warning',
          showClose: true,
          message: '默认方案不能删除!'
        });
        return;
      }
      this.$confirm('删除方案"' + name + '", 是否继续?', '删除方案', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message({
          type: 'success',
          showClose: true,
          message: '已删除方案"' + name + '"!'
        });
        this.settingOptions.plan.plans.splice(index, 1);
        this.settingOptions.plan.isActive = this.settingOptions.plan.plans[this.settingOptions.plan.plans.length - 1].value;
      });
    },
    planRename: function () {
      let name = this.settingOptions.plan.plans.find(item => item.value === this.settingOptions.plan.isActive).label;
      if (this.settingOptions.plan.isActive == 0 && name == "默认方案") {
        this.$message({
          type: 'warning',
          showClose: true,
          message: '默认方案不能重命名!'
        });
        return;
      }
      this.$prompt('请输入方案"' + name + '"的新名称', '重命名方案', {
          confirmButtonText: '重命名',
          cancelButtonText: '取消',
          inputValidator: (value) => {
            if (!value) return "方案名称不能为空";
            let item = this.settingOptions.plan.plans.find(item => item.label === value);
            if (item && item.value != this.settingOptions.plan.isActive) return "该方案名称已存在";
            return true;
          }
      }).then(({ value }) => {
        this.settingOptions.plan.plans.find(item => item.value === this.settingOptions.plan.isActive).label = value;
        this.$message({
          type: 'success',
          showClose: true,
          message: '已重命名为"' + value + '"!'
        });
      });
    }
  },
  mounted () { // 挂载mounted事件
    chrome.tabs.query({ // 寻找Discuz!的tabs并与页面注入的脚本通信, 以获取当前被选中的文本
      active: true,
      currentWindow: true
    }, function (tab) {
      vm.url = tab[0].url; // 获取页面url
      if (tab[0].url.indexOf("forum.php?mod=post") <= -1) return;
      chrome.tabs.sendMessage(tab[0].id, {
        greeting: "getTextareaSelect"
      }, function (response) {
        if (typeof (response.mode) == "undefined") {
          vm.textAreaMode = false;
        } else {
          vm.textAreaMode = response.mode;
        }
        if (!response.text) return;
        vm.colorText = response.text;
      });
    });
    let localSettingOptions = JSON.parse(localStorage.getItem("settingOptions")); // 读取设置项
    if (localSettingOptions) {
      let localSettingOptionsColorOptions = localSettingOptions.plan.plans.find(item => item.value === localSettingOptions.plan.isActive).colorOptions,
          localSettingOptionsFontOptions = localSettingOptions.plan.plans.find(item => item.value === localSettingOptions.plan.isActive).fontOptions;
      if (localSettingOptionsColorOptions && localSettingOptionsFontOptions) {
        this.settingOptions = localSettingOptions;
        this.colorOptions = localSettingOptionsColorOptions;
        this.fontOptions = localSettingOptionsFontOptions;
      } else {
        localStorage.setItem("settingOptions", JSON.stringify(this.settingOptions));
      }
    } else {
      localStorage.setItem("settingOptions", JSON.stringify(this.settingOptions));
    }
  }
});
// ---------- 下面是一些杂项代码 ---------- //
function hex2rgb (hex) { // hex -> rgb by Sara
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
function rgb2hex (color) { // rgb -> hex by gossip
  if (typeof (color) == "undefined") return;
  if (color.indexOf("NaN") != -1) return;
  let rgb = color.split(',');
  let r = parseInt(rgb[0].split('(')[1]);
  let g = parseInt(rgb[1]);
  let b = parseInt(rgb[2].split(')')[0]);
  let hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  return hex;
}
function randomNum (minNum, maxNum) { // [n, m] randomNum by starof
  if (minNum > maxNum) [minNum, maxNum] = [maxNum, minNum];
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