"use strict";
var api = chrome.extension.getBackgroundPage().api();
var vm = new Vue({
  el: "#colorful-app",
  data: {
    url: null,
    plan: 0,
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
      align: 'center',
      line: 6
    },
    defaultOptions: {
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
        align: 'center',
        line: 6
      },
      collapseActiveName: "",
      colorText: "欢迎使用炫彩字体特效"
    },
    settingOptions: {
      collapseActiveName: "",
      plan: {
        isActive: '默认方案',
        plans: [{
          value: '默认方案',
          label: '默认方案',
          colorOptions: {},
          fontOptions: {}
        }]
      }
    },
    colorModes: [{
      value: 0,
      label: '线性插值渐变'
    }, {
      value: 1,
      label: '范围随机颜色'
    }, {
      value: 2,
      label: '彩虹渐变色',
      disabled: false
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
        textComputed = this.defaultOptions.colorText;
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
      return api.hex2rgb(this.colorOptions.colorStart);
    },
    colorEndRgb: function () {
      return api.hex2rgb(this.colorOptions.colorEnd);
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
          switch (this.colorOptions.colorMode) { // 判断颜色模式
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
                strArrayTextHtml[i].colorHex = api.rgb2hex(colorHex); // rgb转16进制
              }
              strArrayTextHtml[0].color = api.rgb2hex(rgbStart.rgb); // 设置起始色
              strArrayTextHtml[strArrayTextHtml.length - 1].color = api.rgb2hex(rgbStart.rgb); // 设置结尾色
              break;
            case 1: // 范围随机色
              for (let i = 0; i < strArray.length; i++) {
                let colorCalcObject = {
                  r: api.randomNum(rgbStart.r, rgbEnd.r),
                  g: api.randomNum(rgbStart.g, rgbEnd.g),
                  b: api.randomNum(rgbStart.b, rgbEnd.b)
                };
                strArrayTextHtml.push({
                  text: strArray[i],
                  color: colorCalcObject
                });
                let colorHex = "rgb(" + strArrayTextHtml[i].color.r + "," + strArrayTextHtml[i].color.g + "," + strArrayTextHtml[i].color.b + ")";
                strArrayTextHtml[i].colorHex = api.rgb2hex(colorHex);
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
                strArrayTextHtml[i].colorHex = api.rgb2hex(colorHex);
              }
              strArrayTextHtml[0].color = api.rgb2hex(rgbStart.rgb);
              strArrayTextHtml[strArrayTextHtml.length - 1].color = api.rgb2hex(rgbStart.rgb);
              break;
            case 1:
              for (let i = 0; i < strArray.length; i++) {
                let colorCalcObject = {
                  r: api.randomNum(rgbStart.r, rgbEnd.r),
                  g: api.randomNum(rgbStart.g, rgbEnd.g),
                  b: api.randomNum(rgbStart.b, rgbEnd.b)
                };
                strArrayTextHtml.push({
                  text: strArray[i],
                  color: colorCalcObject
                });
                let colorHex = "rgb(" + strArrayTextHtml[i].color.r + "," + strArrayTextHtml[i].color.g + "," + strArrayTextHtml[i].color.b + ")";
                strArrayTextHtml[i].colorHex = api.rgb2hex(colorHex);
              }
              break;
            default:
              break;
          }
          for (let i = 0; i < strArrayTextHtml.length; i++) {
            strArrayTextDiscuz = strArrayTextDiscuz + "[color=" + strArrayTextHtml[i].colorHex + "]" + strArrayTextHtml[i].text + "[/color]";
          }
          strArrayTextDiscuz = "[p=3, 0, " + this.fontOptions.align + "]" + strArrayTextDiscuz + "[/p]"; // 添加p标签包围
          let _discuzCode = strArrayTextDiscuz;
          for (let i = 0; i < this.fontOptions.line - 1; i++) {
            strArrayTextDiscuz += _discuzCode;
          }
          break;
        default:
          break;
      }
      let _codeHead = {
          align: "[align=" + this.fontOptions.align + "]",
          size: "[size=" + this.fontOptions.size + "]",
          b: this.fontOptions.b ? "[b]" : "",
          i: this.fontOptions.i ? "[i]" : "",
          u: this.fontOptions.u ? "[u]" : ""
        },
        _codeFoot = {
          size: "[/size]",
          align: "[/align]",
          b: this.fontOptions.b ? "[/b]" : "",
          i: this.fontOptions.i ? "[/i]" : "",
          u: this.fontOptions.u ? "[/u]" : ""
        };
      return { // 给文字添加样式标签, 并输出最终 bbcode
        discuz: _codeHead.align + _codeHead.size + _codeHead.b + _codeHead.i + _codeHead.u + strArrayTextDiscuz + _codeFoot.u + _codeFoot.i + _codeFoot.b + _codeFoot.size + _codeFoot.align,
        html: strArrayTextHtml
      };
    }
  },
  watch: { // 深度监听设置项的变化并写入本地储存
    colorOptions: {
      deep: true,
      handler: function () {
        this.settingOptions.plan.plans.find(item => item.value === this.settingOptions.plan.isActive).colorOptions = this.colorOptions;
      }
    },
    fontOptions: {
      deep: true,
      handler: function () {
        this.settingOptions.plan.plans.find(item => item.value === this.settingOptions.plan.isActive).fontOptions = this.fontOptions;
      }
    },
    'settingOptions.plan.isActive': { // 方案被改变
      deep: true,
      handler: function () {
        this.colorOptions = this.settingOptions.plan.plans.find(item => item.value === this.settingOptions.plan.isActive).colorOptions;
        this.fontOptions = this.settingOptions.plan.plans.find(item => item.value === this.settingOptions.plan.isActive).fontOptions;
        this.settingOptionsSave();
      },
    },
    'settingOptions.plan.plans': { // 方案被添加、删除、重命名
      deep: true,
      handler: function () {
        this.settingOptionsSave();
      }
    },
    'settingOptions.collapseActiveName': { // 选项面板展开被改变
      deep: true,
      handler: function () {
        this.settingOptionsSave();
      }
    }
  },
  methods: {
    postTextToTextarea: function () { // 投送至编辑框
      api.sendMessage("postTextToTextarea", {
        text: this.colorTextComputed.discuz
      }, (response) => {
        if (!response) return;
        // 此处返回被选择的起始位置和结束位置
      });
    },
    copySuccess: function () { // 复制成功
      this.$message({
        message: '复制到剪贴板成功！',
        type: 'success',
        showClose: true
      });
    },
    copyError: function () { // 复制失败
      this.$message({
        message: '复制到剪贴板失败！',
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
        this.colorOptions = this.defaultOptions.colorOptions;
        this.fontOptions = this.defaultOptions.fontOptions;
        this.colorText = this.defaultOptions.colorText;
        this.$message({
          type: 'success',
          showClose: true,
          message: '恢复成功!'
        });
      }).catch(() => {});
    },
    settingOptionsSave: function () { // 储存设置项
      localStorage.setItem("settingOptions", JSON.stringify(this.settingOptions));
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
      }).then(({
        value
      }) => {
        this.settingOptions.plan.plans.push({
          value: value,
          label: value,
          colorOptions: this.defaultOptions.colorOptions,
          fontOptions: this.defaultOptions.fontOptions
        });
        this.settingOptions.plan.isActive = value;
        this.$message({
          type: 'success',
          showClose: true,
          message: '添加新方案"' + value + '"成功!'
        });
      }).catch(() => {});
    },
    planDel: function () {
      let index = this.settingOptions.plan.plans.indexOf(this.settingOptions.plan.plans.find(item => item.value === this.settingOptions.plan.isActive));
      let name = this.settingOptions.plan.plans[index].label;
      if (this.settingOptions.plan.isActive == "默认方案" && name == "默认方案") {
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
        this.settingOptions.plan.plans.splice(index, 1);
        this.settingOptions.plan.isActive = this.settingOptions.plan.plans[index - 1].value;
        this.$message({
          type: 'success',
          showClose: true,
          message: '已删除方案"' + name + '"!'
        });
      }).catch(() => {});
    },
    planRename: function () {
      let name = this.settingOptions.plan.plans.find(item => item.value === this.settingOptions.plan.isActive).label;
      if (this.settingOptions.plan.isActive == "默认方案" && name == "默认方案") {
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
      }).then(({
        value
      }) => {
        this.settingOptions.plan.plans.find(item => item.value === this.settingOptions.plan.isActive).label = value;
        this.$message({
          type: 'success',
          showClose: true,
          message: '已重命名为"' + value + '"!'
        });
      }).catch(() => {});
    },
    randomColor: function () { // 生成随机颜色
      let rgbStart = "rgb(" + api.randomNum(0, 255) + "," + api.randomNum(0, 255) + "," + api.randomNum(0, 255) + ")";
      let rgbEnd = "rgb(" + api.randomNum(0, 255) + "," + api.randomNum(0, 255) + "," + api.randomNum(0, 255) + ")";
      let rgbHex = {
        start: api.rgb2hex(rgbStart).toUpperCase(),
        end: api.rgb2hex(rgbEnd).toUpperCase()
      }
      this.colorOptions.colorStart = rgbHex.start;
      this.colorOptions.colorEnd = rgbHex.end;
    }
  },
  mounted() { // 挂载 mounted 事件, 执行一些初始化操作
    api.getPageUrl((url) => {
      this.url = url;
    });
    api.sendMessage("getTextareaSelect", {}, (response) => { // 获取 textarea 被选中的文本和编辑器模式
      if (!response) return;
      this.textAreaMode = response.mode;
      if (response.text) {
        this.colorText = response.text;
      }
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
        this.settingOptions.plan.plans[0].colorOptions = this.defaultOptions.colorOptions;
        this.settingOptions.plan.plans[0].fontOptions = this.defaultOptions.fontOptions;
        this.settingOptionsSave();
      }
    } else {
      this.settingOptions.plan.plans[0].colorOptions = this.defaultOptions.colorOptions;
      this.settingOptions.plan.plans[0].fontOptions = this.defaultOptions.fontOptions;
      this.settingOptionsSave();
    }
  }
});