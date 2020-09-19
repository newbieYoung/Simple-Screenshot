/* global define module wx */
(function (factory) {
  if (typeof define === "function" && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory);
  } else if (typeof module === "object" && module.exports) {
    // Node/CommonJS
    module.exports = factory();
  } else {
    // Browser globals
    window.SimpleScreenshot = factory();
  }
})(function () {
  /**
   * 小程序目前无法处理以下情况：
   * 1、after、before 等伪类元素；
   * 2、加载项目内资源文件；
   */

  let URL_REGEX = /url\(['"]?([^'"]+?)['"]?\)/g;
  let RESOURCE_NAME = [];
  let RESOURCE_DATA = [];

  function isFunction(obj) {
    // 判断对象是否是function
    return obj && {}.toString.call(obj) === "[object Function]";
  }

  /**
   * window.getComputedStyle 去掉 animation、transition
   */
  const COMPUTED_STYLE = [
    //使用小程序 size 属性代替 computedStyle 中的 width、height
    //"width",
    //"height",
    "background-attachment",
    "background-blend-mode",
    "background-clip",
    "background-color",
    "background-image",
    "background-origin",
    "background-position",
    "background-repeat",
    "background-size",
    "border-bottom-color",
    "border-bottom-left-radius",
    "border-bottom-right-radius",
    "border-bottom-style",
    "border-bottom-width",
    "border-collapse",
    "border-image-outset",
    "border-image-repeat",
    "border-image-slice",
    "border-image-source",
    "border-image-width",
    "border-left-color",
    "border-left-style",
    "border-left-width",
    "border-right-color",
    "border-right-style",
    "border-right-width",
    "border-top-color",
    "border-top-left-radius",
    "border-top-right-radius",
    "border-top-style",
    "border-top-width",
    "bottom",
    "box-shadow",
    "box-sizing",
    "break-after",
    "break-before",
    "break-inside",
    "caption-side",
    "clear",
    "clip",
    "color",
    "content",
    "cursor",
    "direction",
    "display",
    "empty-cells",
    "float",
    "font-family",
    "font-kerning",
    "font-optical-sizing",
    "font-size",
    "font-stretch",
    "font-style",
    "font-variant",
    "font-variant-ligatures",
    "font-variant-caps",
    "font-variant-numeric",
    "font-variant-east-asian",
    "font-weight",
    "image-rendering",
    "isolation",
    "justify-items",
    "justify-self",
    "left",
    "letter-spacing",
    "line-height",
    "list-style-image",
    "list-style-position",
    "list-style-type",
    "margin-bottom",
    "margin-left",
    "margin-right",
    "margin-top",
    "max-height",
    "max-width",
    "min-height",
    "min-width",
    "mix-blend-mode",
    "object-fit",
    "object-position",
    "offset-distance",
    "offset-path",
    "offset-rotate",
    "opacity",
    "orphans",
    "outline-color",
    "outline-offset",
    "outline-style",
    "outline-width",
    "overflow-anchor",
    "overflow-wrap",
    "overflow-x",
    "overflow-y",
    "padding-bottom",
    "padding-left",
    "padding-right",
    "padding-top",
    "pointer-events",
    "position",
    "resize",
    "right",
    "scroll-behavior",
    "speak",
    "table-layout",
    "tab-size",
    "text-align",
    "text-align-last",
    "text-decoration",
    "text-decoration-line",
    "text-decoration-style",
    "text-decoration-color",
    "text-decoration-skip-ink",
    "text-underline-position",
    "text-indent",
    "text-rendering",
    "text-shadow",
    "text-size-adjust",
    "text-overflow",
    "text-transform",
    "top",
    "touch-action",
    "unicode-bidi",
    "vertical-align",
    "visibility",
    "white-space",
    "widows",
    "will-change",
    "word-break",
    "word-spacing",
    "z-index",
    "zoom",
    "-webkit-appearance",
    "backface-visibility",
    "-webkit-border-horizontal-spacing",
    "-webkit-border-image",
    "-webkit-border-vertical-spacing",
    "-webkit-box-align",
    "-webkit-box-decoration-break",
    "-webkit-box-direction",
    "-webkit-box-flex",
    "-webkit-box-ordinal-group",
    "-webkit-box-orient",
    "-webkit-box-pack",
    "-webkit-box-reflect",
    "column-count",
    "column-gap",
    "column-rule-color",
    "column-rule-style",
    "column-rule-width",
    "column-span",
    "column-width",
    "backdrop-filter",
    "align-content",
    "align-items",
    "align-self",
    "flex-basis",
    "flex-grow",
    "flex-shrink",
    "flex-direction",
    "flex-wrap",
    "justify-content",
    "-webkit-font-smoothing",
    "grid-auto-columns",
    "grid-auto-flow",
    "grid-auto-rows",
    "grid-column-end",
    "grid-column-start",
    "grid-template-areas",
    "grid-template-columns",
    "grid-template-rows",
    "grid-row-end",
    "grid-row-start",
    "row-gap",
    "-webkit-highlight",
    "hyphens",
    "-webkit-hyphenate-character",
    "-webkit-line-break",
    "-webkit-line-clamp",
    "-webkit-locale",
    "-webkit-margin-before-collapse",
    "-webkit-margin-after-collapse",
    "-webkit-mask-box-image",
    "-webkit-mask-box-image-outset",
    "-webkit-mask-box-image-repeat",
    "-webkit-mask-box-image-slice",
    "-webkit-mask-box-image-source",
    "-webkit-mask-box-image-width",
    "-webkit-mask-clip",
    "-webkit-mask-composite",
    "-webkit-mask-image",
    "-webkit-mask-origin",
    "-webkit-mask-position",
    "-webkit-mask-repeat",
    "-webkit-mask-size",
    "order",
    "perspective",
    "perspective-origin",
    "-webkit-print-color-adjust",
    "-webkit-rtl-ordering",
    "shape-outside",
    "shape-image-threshold",
    "shape-margin",
    "-webkit-tap-highlight-color",
    "-webkit-text-combine",
    "-webkit-text-decorations-in-effect",
    "-webkit-text-emphasis-color",
    "-webkit-text-emphasis-position",
    "-webkit-text-emphasis-style",
    "-webkit-text-fill-color",
    "-webkit-text-orientation",
    "-webkit-text-security",
    "-webkit-text-stroke-color",
    "-webkit-text-stroke-width",
    "transform",
    "transform-origin",
    "transform-style",
    "-webkit-user-drag",
    "-webkit-user-modify",
    "user-select",
    "-webkit-writing-mode",
    "-webkit-app-region",
    "buffered-rendering",
    "clip-path",
    "clip-rule",
    "mask",
    "filter",
    "flood-color",
    "flood-opacity",
    "lighting-color",
    "stop-color",
    "stop-opacity",
    "color-interpolation",
    "color-interpolation-filters",
    "color-rendering",
    "fill",
    "fill-opacity",
    "fill-rule",
    "marker-end",
    "marker-mid",
    "marker-start",
    "mask-type",
    "shape-rendering",
    "stroke",
    "stroke-dasharray",
    "stroke-dashoffset",
    "stroke-linecap",
    "stroke-linejoin",
    "stroke-miterlimit",
    "stroke-opacity",
    "stroke-width",
    "alignment-baseline",
    "baseline-shift",
    "dominant-baseline",
    "text-anchor",
    "writing-mode",
    "vector-effect",
    "paint-order",
    "d",
    "cx",
    "cy",
    "x",
    "y",
    "r",
    "rx",
    "ry",
    "caret-color",
    "line-break",
  ];

  function SimpleScreenshot(params) {
    this.devicePixelRatio = params.devicePixelRatio || 1;

    this.error = params.error || function () {};
    this.log = params.log || console.log;
    this.puppeteerServer = params.puppeteerServer; // puppeteer 截屏服务
    this.puppeteerGlobalFont = params.puppeteerGlobalFont; // puppeteer 截屏服务全局字体
    this.pupServerCanModifyFont = params.pupServerCanModifyFont ? params.pupServerCanModifyFont : true; // puppeteer 截屏服务是否支持配置字体
    this.imgType = params.imgType || 'jpeg'; //图片类型
    this.imgQuality = parseInt(params.imgQuality) || 80; //图片质量
    this.distWidth = params.distWidth; //目标尺寸
    this.distHeight = params.distHeight;
    this.debug = !params.debug ? false : true; // 调试模式

    //小程序目前并不支持客户端渲染 svg foreignobject
    this.supportForeignObject = false;
    this.forceScreenshotType = 'server';

    this._isLoading = false; // 是否正在加载资源
    this._wholeTexts = ""; // 全部文字

    //字体列表
    this.fontList = [];
    let fontList = params.fontList || [];
    for (let i = 0; i < fontList.length; i++) {
      this.fontList.push({
        name: fontList[i],
        texts: "",
      });
    }

    this.globalInlineFont = params.globalInlineFont || "";

    //预加载资源
    this.preLoadResource = params.preLoadResource || [];
    for (let i = 0; i < this.preLoadResource.length; i++) {
      let name = this.preLoadResource[i].name;
      let data = this.preLoadResource[i].data;
      if (data && data != "") {
        RESOURCE_NAME.push(name);
        RESOURCE_DATA.push(data);
      }
    }

    /**
     * 父元素的部分属性对子元素有影响，但是并不会被子元素继承，比如：opacity、transform、filter；
     * 但是小程序中没办法获取父节点元素，目前的解决办法是手动计算，然后通过参数传递。
     */
    this.parentCSS = params.parentCSS || [{
        name: "opacity",
        value: 1,
      },
      {
        name: "transform", // 因为是给子元素截图，父元素的 transform-origin 等属性可以不考虑
        value: "",
      },
      {
        name: "filter",
        value: "",
      },
    ];

    //自定义 css 解析过滤器
    this.parseCSSFilter = params.parseCSSFilter || [];

    /**
     * 特殊规则
     * autoRenderWidth 自适应渲染宽度，在小程序中因为字体原因，某些文字元素 fields size 并不精确，导致文字超出容器，从而溢出换行。
     */
    this.rules = {
      autoRenderWidth: false,
    };
  }

  SimpleScreenshot.prototype.toSVG = function (selector, callback) {
    let self = this;
    self._wholeTexts = "";
    wx.createSelectorQuery()
      .selectAll(selector)
      .fields({
          dataset: true,
          size: true,
          computedStyle: COMPUTED_STYLE,
        },
        function (nodes) {
          self.nodes = nodes;
          self.parseCSSRules(function () {
            self.root = self.getNodeByLevel("0");
            let width = parseFloat(self.root.width) * self.devicePixelRatio;
            let height = parseFloat(self.root.height) * self.devicePixelRatio;
            let html = self.toHTML(self.root, true);

            let svg = "";
            svg += "<svg xmlns='http://www.w3.org/2000/svg'";
            svg += " width='" + width + "'";
            svg += " height='" + height + "'";
            svg += ">";
            svg += "<foreignObject width='100%' height='100%'>";
            svg += "<div xmlns='http://www.w3.org/1999/xhtml' style='";
            if (self.root.display == "inline-block") {
              // 防止行内元素的布局被空白字符挤乱
              svg += "font-size : 0 ;";
            }

            for (let i = 0; i < self.parentCSS.length; i++) {
              let pCSS = self.parentCSS[i];
              pCSS.value = pCSS.value == null ? "" : (pCSS.value + "").trim();
              if (pCSS.name == "transform") {
                pCSS.value += " scale(" + self.devicePixelRatio + ")"; //考虑设备像素比
              }
              if (pCSS.value != "") {
                svg += pCSS.name + " : " + pCSS.value + " ;";
              }
            }

            svg += "transform-origin:0 0;'>";
            svg += html;
            svg += "</div>";
            svg += "</foreignObject>";
            svg += "</svg>";

            callback({
              svg: svg,
              width: self.root.width,
              height: self.root.height,
              fonts: self.fontList,
              devicePixelRatio: self.devicePixelRatio,
              distWidth: self.distWidth ? self.distWidth : self.root.width * self.devicePixelRatio, // 默认两倍图
              distHeight: self.distHeight ? self.distHeight : self.root.height * self.devicePixelRatio,
              imgType: self.imgType,
              imgQuality: self.imgQuality
            });
          });
        }
      )
      .exec();
  };

  SimpleScreenshot.prototype.toIMG = function (selector, callback) {
    let self = this;
    self.toSVG(selector, function (svg) {
      if (self.puppeteerGlobalFont) {
        if (!self.pupServerCanModifyFont) {
          self.fontList.push({
            name: self.puppeteerGlobalFont,
            texts: self._wholeTexts
          })
        }
        svg.globalFont = self.puppeteerGlobalFont; // 全局字体
      }
      self.debug && self.log(svg) // log
      wx.request({
        url: self.puppeteerServer,
        method: 'post',
        data: svg,
        success(res) {
          callback(res.data);
        },
        fail(err) {
          self.error(err)
        }
      })
    })
  }

  //元素转换为 html 代码
  SimpleScreenshot.prototype.toHTML = function (node, isRoot) {
    let self = this;
    let html = "";
    let inner = "";

    //解析自身
    let tagName = this.getNodeName(node.dataset.name);
    let style = this.parseCSS(node, isRoot);

    //伪类

    //解析子元素
    let curLevel = node.dataset.level;
    let childLen = node.dataset.len;
    let textChilds = [];
    try {
      if (node.dataset.texts != null) {
        textChilds = JSON.parse(node.dataset.texts.replace(/'/g, '"'));
      }
      /**
       * 拼接 xml 时如果文本节点中存在条件分割符 & 应该写成 &amp; 否则会报错 EntityRef: expecting ';'
       */
      for (let m = 0; m < textChilds.length; m++) {
        textChilds[m].text = textChilds[m].text.replace(/&/g, "&amp;");
      }
    } catch (err) {
      self.debug && self.log({
        msg: `${node.dataset.texts} json parse error`,
        err: err,
      });
    }
    for (let i = 0; i < childLen; i++) {
      let childLevel = curLevel + "-" + i;
      let isText = false;
      for (let j = 0; j < textChilds.length; j++) {
        if (childLevel == textChilds[j].level) {
          let fontFamily = node["font-family"];
          for (let z = 0; z < this.fontList.length; z++) {
            let fontItem = this.fontList[z];
            if (fontFamily.includes(fontItem.name)) {
              for (let k = 0; k < textChilds[j].text.length; k++) {
                //文字去重
                if (!fontItem.texts.includes(textChilds[j].text[k])) {
                  fontItem.texts += textChilds[j].text[k];
                }
              }
            }
          }
          for (let k = 0; k < textChilds[j].text.length; k++) { //全部文字
            if (!this._wholeTexts.includes(textChilds[j].text[k])) {
              this._wholeTexts += textChilds[j].text[k];
            }
          }
          inner += textChilds[j].text;
          isText = true;
        }
      }

      if (!isText) {
        let child = this.getNodeByLevel(curLevel + "-" + i);
        if (child) {
          inner += this.toHTML(child, false);
        }
      }
    }

    //拼装
    html += "<" + tagName + " xmlns='http://www.w3.org/1999/xhtml'";
    if (node.dataset.src) {
      var index = RESOURCE_NAME.indexOf(node.dataset.src);
      if (index != -1) {
        html += " src='" + RESOURCE_DATA[index] + "'";
      } else {
        html += " src='" + node.dataset.src + "'";
      }
    }
    if (!isRoot) {
      html += " style='" + style + "'>";
    } else {
      html += " id='simple-screenshot'>";
      html += "<style>";
      html +=
        "#simple-screenshot,#simple-screenshot *:not(style){" +
        style +
        "} " +
        this.globalInlineFont;
      html += "</style>";
    }
    html += inner;
    html += "</" + tagName + ">";

    return html;
  };

  //解析 css
  SimpleScreenshot.prototype.parseCSS = function (node, isRoot) {
    let style = "";

    node._rules = {
      autoRenderWidth: this.rules.autoRenderWidth,
    };

    for (let i = 0; i < this.parseCSSFilter.length; i++) {
      //自定义 css 解析过滤器
      let filter = this.parseCSSFilter[i];
      if (isFunction(filter)) {
        filter(node);
      }
    }

    let matches = null;
    for (let i = 0; i < COMPUTED_STYLE.length; i++) {
      let name = COMPUTED_STYLE[i];
      if (isRoot) {
        //根节点
        if (
          [
            "margin-top",
            "margin-left",
            "margin-bottom",
            "margin-right",
          ].includes(name)
        ) {
          node[name] = 0; //最外层元素的 margin 必须为 0，否则会因为偏移导致错位
        } else if (
          (node["position"] == "absolute" || node["position"] == "fixed") && ["top", "bottom", "left", "right"].includes(name)
        ) {
          node[name] = 0; //最外层元素为绝对定位或者固定定位时，top、bottom、left、right 必须为 0，否则会因为定位偏移导致错位
        }
      } else {
        //非根节点
        if (node[name] == this.root[name]) {
          continue;
        }
      }

      if (name == "background-image") {
        //背景图片
        let isReplaceResource = false;
        URL_REGEX.lastIndex = 0; //重置正则对象
        matches = URL_REGEX.exec(node[name]); //匹配url值
        if (matches != null) {
          var url = matches[1];
          if (node[name] && url && url.search(/^(data:)/) == -1) {
            //非dataurl
            var index = RESOURCE_NAME.indexOf(url);
            isReplaceResource = true;
            if (index != -1) {
              style += name + ": url(" + RESOURCE_DATA[index] + ");";
            } else {
              /**
               * 拼接 xml 时如果 url 中存在条件分割符 &，应该写成 &amp; 否则会报错 EntityRef: expecting ';'
               * 可以用 encodeURIComponent 编码来避免这个问题。
               */
              style += name + ": url(" + encodeURIComponent(url) + ");";
            }
          }
        }
        if (!isReplaceResource) {
          style += name + ":" + node[name] + ";";
        }
      } else {
        style += name + ":" + node[name] + ";";
      }
    }

    //size
    let realWidth = node.width;
    let realHeight = node.height;

    //微信小程序、QQ小程序中 fields size 包含 border、padding
    let borderBottomWidth = parseFloat(node["border-bottom-width"]);
    let borderTopWidth = parseFloat(node["border-top-width"]);
    let borderLeftWidth = parseFloat(node["border-left-width"]);
    let borderRightWidth = parseFloat(node["border-right-width"]);
    borderLeftWidth = borderLeftWidth >= 0 ? borderLeftWidth : 0; // 负数 border-width 无效
    borderRightWidth = borderRightWidth >= 0 ? borderRightWidth : 0;
    borderTopWidth = borderTopWidth >= 0 ? borderTopWidth : 0;
    borderBottomWidth = borderBottomWidth >= 0 ? borderBottomWidth : 0;
    realWidth -= borderLeftWidth + borderRightWidth;
    realHeight -= borderTopWidth + borderBottomWidth;

    if (node["box-sizing"] != "border-box") {
      //计算非 border-box 元素 width、height
      let paddingTop = parseFloat(node["padding-top"]);
      let paddingLeft = parseFloat(node["padding-left"]);
      let paddingBottom = parseFloat(node["padding-bottom"]);
      let paddingRight = parseFloat(node["padding-right"]);
      paddingTop = paddingTop >= 0 ? paddingTop : 0; // 负数 padding 无效
      paddingLeft = paddingLeft >= 0 ? paddingLeft : 0;
      paddingBottom = paddingBottom >= 0 ? paddingBottom : 0;
      paddingRight = paddingRight >= 0 ? paddingRight : 0;
      realWidth -= paddingLeft + paddingRight;
      realHeight -= paddingTop + paddingBottom;
    }

    if (node._rules.autoRenderWidth && !isRoot) {
      style += "width: auto;";
    } else {
      style += "width:" + realWidth + "px;";
    }
    style += "height:" + realHeight + "px;";

    return style;
  };

  //根据级别获取节点
  SimpleScreenshot.prototype.getNodeByLevel = function (level) {
    for (let i = 0; i < this.nodes.length; i++) {
      if (this.nodes[i].dataset.level == level) {
        return this.nodes[i];
      }
    }
    return null;
  };

  //解析 cssRules
  SimpleScreenshot.prototype.parseCSSRules = function (finished) {
    let count = 0;
    let self = this;
    self._isLoading = false;
    let add = function () {
      self._isLoading = true;
      count++;
    };
    let del = function () {
      count--;
      if (count == 0) {
        self._isLoading = true;
        finished();
      }
    };
    for (let i = 0; i < this.nodes.length; i++) {
      let node = this.nodes[i];
      if (
        node.dataset.name == "image" &&
        node.dataset.canvasid &&
        (node.dataset.src == "" || !node.dataset.src)
      ) {
        //以 canvas 充当图片内容
        (function (node) {
          let canvasWidth = node.dataset.canvaswidth;
          let canvasHeight = node.dataset.canvasheight;
          let canvasId = node.dataset.canvasid;
          add();
          wx.canvasToTempFilePath({
            width: canvasWidth,
            height: canvasHeight,
            destWidth: canvasWidth,
            destHeight: canvasHeight,
            canvasId: canvasId,
            success(res) {
              try {
                let base64 = qq
                  .getFileSystemManager()
                  .readFileSync(res.tempFilePath, "base64");
                node.dataset.src = "data:image/png;base64," + base64;
                del();
              } catch (err) {
                //可能存在内存不足报错的情况
                self.error({
                  msg: "canvas to base64 error",
                  err: err,
                });
              }
            },
            fail(err) {
              self.error({
                msg: "canvas to tempfilepath fail",
                err: err,
              });
            },
          });
        })(node);
      } else {
        if (node.src && node.src.length > 0) {
          this.loadResource("url(" + node.src + ")", add, del);
        }
        if (node.dataset.src && node.dataset.src.length > 0) {
          this.loadResource("url(" + node.dataset.src + ")", add, del);
        }
        let bgImg = node["background-image"];
        if (bgImg && bgImg.length > 0 && bgImg != "none") {
          this.loadResource(node["background-image"], add, del);
        }
      }
    }

    if (!this._isLoading) {
      finished();
    }
  };

  //加载外部资源
  SimpleScreenshot.prototype.loadResource = function (resource, add, del) {
    URL_REGEX.lastIndex = 0; //重置正则对象
    let matches = URL_REGEX.exec(resource); //匹配url值
    let self = this;
    if (matches != null) {
      let url = matches[1];
      if (
        resource &&
        url &&
        url.search(/^(data:)/) == -1 &&
        !RESOURCE_NAME.includes(url)
      ) {
        //非 dataurl
        let type = this.getType(url);
        if (type != null) {
          RESOURCE_NAME.push(url);
          add();
          wx.request({
            url: url,
            method: "GET",
            responseType: "arraybuffer",
            success: function (res) {
              try {
                let base64 = wx.arrayBufferToBase64(res.data);
                let index = RESOURCE_NAME.indexOf(url);
                RESOURCE_DATA[index] = "data:" + type + ";base64," + base64;
                del();
              } catch (err) {
                //可能存在内存不足报错的情况
                self.error({
                  msg: `${url} to base64 error`,
                  err: err,
                });
              }
            },
            fail: function (err) {
              self.error({
                msg: `${url} request fail`,
                err: err,
              });
            },
          });
        }
      }
    }
  };

  //小程序 nodeName 和 html dom nodeName 相互转换
  SimpleScreenshot.prototype.getNodeName = function (name) {
    let nodeName = "div"; //默认 div
    switch (name) {
      case "image":
        nodeName = "img";
        break;
      case "view":
      default:
        break;
    }

    return nodeName;
  };

  //根据 url 获取 data 名称
  SimpleScreenshot.prototype.getType = function (url) {
    let types = [".png", ".jpg", ".jpeg"];
    let names = ["image/png", "image/jpg", "image/jpg"];
    for (let i = 0; i < types.length; i++) {
      if (url.lastIndexOf(types[i]) + types[i].length == url.length) {
        return names[i];
      }
    }
    return names[0];
  };

  //清空资源缓存
  SimpleScreenshot.prototype.clearResourceCache = function () {
    RESOURCE_NAME = [];
    RESOURCE_DATA = [];
  };

  return SimpleScreenshot;
});