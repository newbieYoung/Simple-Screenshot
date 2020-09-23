/* global define module require */
(function (factory) {
  if (typeof define === "function" && define.amd) {
    // AMD. Register as an anonymous module.
    define(['prefix-umd'], factory);
  } else if (typeof module === "object" && module.exports) {
    // Node/CommonJS
    module.exports = factory(require('prefix-umd'));
  } else {
    // Browser globals
    window.SimpleScreenshot = factory(window.Prefix);
  }
})(function (Prefix) {

  //includes方法兼容
  if (!Array.prototype.includes) {
    Object.defineProperty(Array.prototype, 'includes', {
      value: function (valueToFind, fromIndex) {
        let o = Object(this);
        let len = o.length >>> 0;
        if (len === 0) {
          return false;
        }

        let n = fromIndex | 0;
        let k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

        function sameValueZero(x, y) {
          return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
        }
        while (k < len) {
          if (sameValueZero(o[k], valueToFind)) {
            return true;
          }
          k++;
        }
        return false;
      }
    });
  }

  let dashTransform = Prefix.dash("transform");
  let dashOrigin = Prefix.dash("transformOrigin");
  let URL_REGEX = /url\(['"]?([^'"]+?)['"]?\)/g;

  // 根据 computedStyle 判断伪类是否存在，此外还可以通过遍历 styleSheets 来判断。
  let contentExit = function (computedStyle) {
    let content = computedStyle['content'];
    let display = computedStyle['display'];
    let exist = true;
    if (content != null) {
      content = content.trim();
      if (content == 'none' || (content == '' && display == 'inline')) {
        exist = false;
      }
    } else {
      exist = false;
    }

    if (!display || display == 'none') {
      exist = false;
    }

    return exist;
  }

  let RESOURCE_NAME = [];
  let RESOURCE_DATA = [];

  function isFunction(obj) { // 判断对象是否是function
    return obj && {}.toString.call(obj) === "[object Function]";
  }

  const COMPUTED_STYLE = [
    "width",
    "height",
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
    "line-break"
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

    this.supportForeignObject = false; //是否支持 svg foreignobject 渲染
    this.forceScreenshotType = params.forceScreenshotType; //强制截屏方式 server、client
    this.checkForeignObject();

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
        name: dashTransform, // 因为是给子元素截图，父元素的 transform-origin 等属性可以不考虑
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

    this.analysisStyleSheets();
  }

  //解析 stylesheets
  SimpleScreenshot.prototype.analysisStyleSheets = function () {
    this._hasWidthNodes = [];
    this._hasHeightNodes = [];
    try {
      let styleSheets = document.styleSheets;
      for (let i = 0; i < styleSheets.length; i++) {
        let sheet = styleSheets[i]
        for (let j = 0; j < sheet.cssRules.length; j++) {
          let rule = sheet.cssRules[j];
          if (rule.type == 1) { // CSSStyleRule
            if (rule.style.width) { // 找出样式中设置了固定宽度的元素
              let nodes = document.querySelectorAll(rule.selectorText);
              for (let z = 0; z < nodes.length; z++) {
                if (rule.style.width) {
                  if (!this._hasWidthNodes.includes[nodes[z]]) {
                    this._hasWidthNodes.push(nodes[z]);
                  }
                }
              }
            }
          } else if (rule.type == 3) { // CSSImportRule
            //
          } else if (rule.type == 4) { // CSSMediaRule
            //
          }
        }
      }
    } catch (err) {
      //
    }
  }

  //判断浏览器是否支持 foreignobject 渲染
  SimpleScreenshot.prototype.checkForeignObject = function () {
    let svg = "";
    svg += "<svg xmlns='http://www.w3.org/2000/svg'";
    svg += " width='1'";
    svg += " height='1'";
    svg += ">";
    svg += "<foreignObject width='100%' height='100%'>";
    svg += "<div xmlns='http://www.w3.org/1999/xhtml' style='width:100%;height:100%;background-color:red;' >";
    svg += "</div>";
    svg += "</foreignObject>";
    svg += "</svg>"

    let self = this;
    let img = new Image();
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    img.onload = function () {
      let canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      let ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, 1, 1);
      let imgData = ctx.getImageData(0, 0, 1, 1).data;
      if (imgData[0] == 255 && imgData[1] == 0 && imgData[2] == 0 && imgData[3] == 255) { // rgba(255, 0, 0, 255) 红色
        self.supportForeignObject = true;
      }
    }
  }

  SimpleScreenshot.prototype.nodeItem = function (node, level) {
    if (node.nodeType != Node.ELEMENT_NODE) {
      return;
    }

    //获取元素信息
    let tagName = node.tagName.toLowerCase();
    let $node = {
      node: node,
      dataset: {
        level: level,
        name: tagName
      },
      style: {}, //自定义样式
      after: null, //伪类样式
      before: null
    }
    if (tagName == "img") {
      $node.dataset.src = node.getAttribute("src");
    }
    $node.computedStyle = window.getComputedStyle(node);
    //伪类
    let after = window.getComputedStyle(node, ":after");
    if (contentExit(after)) {
      $node.after = after;
    }
    let before = window.getComputedStyle(node, ":before");
    if (contentExit(before)) {
      $node.before = before;
    }
    this.nodes.push($node);

    //子元素
    let start = 0;
    let childs = node.childNodes;
    for (let i = 0; i < childs.length; i++) {
      let child = childs[i];
      if (child.nodeType == Node.ELEMENT_NODE) { //元素
        this.nodeItem(child, level + '-' + start);
        start++;
      }
    }
  }

  SimpleScreenshot.prototype.toSVG = function (selector, callback) {
    this._wholeTexts = "";
    this.nodes = [];

    let $first = document.querySelector(selector);
    this.nodeItem($first, 0);

    let self = this;
    this.parseCSSRules(function () {
      self.root = self.getNodeByLevel("0");
      let rect = self.root.node.getBoundingClientRect();
      let width = parseFloat(rect.width) * self.devicePixelRatio;
      let height = parseFloat(rect.height) * self.devicePixelRatio;
      let html = self.toHTML(self.root, true);

      let svg = "";
      svg += "<svg xmlns='http://www.w3.org/2000/svg'";
      svg += " width='" + width + "'";
      svg += " height='" + height + "'";
      svg += ">";
      svg += "<foreignObject width='100%' height='100%'>";
      svg += "<div xmlns='http://www.w3.org/1999/xhtml' style='";
      if (self.root.display == "inline-block") { // 防止行内元素的布局被空白字符挤乱
        svg += "font-size : 0 ;"
      }

      self.parentCSS = self.calcParentProperty(self.root)
      for (let i = 0; i < self.parentCSS.length; i++) {
        let pCSS = self.parentCSS[i];
        pCSS.value = pCSS.value == null ? "" : (pCSS.value + "").trim();
        if (pCSS.name == dashTransform) {
          pCSS.value += " scale(" + self.devicePixelRatio + ")" //考虑设备像素比
        }
        if (pCSS.value != "") {
          svg += pCSS.name + " : " + pCSS.value + " ;";
        }
      }

      svg += dashOrigin + ":0 0;'>";
      svg += html;
      svg += "</div>";
      svg += "</foreignObject>";
      svg += "</svg>"

      callback({
        svg: svg,
        width: rect.width,
        height: rect.height,
        devicePixelRatio: self.devicePixelRatio,
        distWidth: self.distWidth ? self.distWidth : rect.width * self.devicePixelRatio, // 默认显示尺寸乘以设备像素比
        distHeight: self.distHeight ? self.distHeight : rect.height * self.devicePixelRatio,
        fonts: self.fontList,
        imgType: self.imgType,
        imgQuality: self.imgQuality
      });

    })
  };

  //父元素的部分属性对子元素有影响，但是并不会被子元素继承，比如：opacity、transform、filter
  SimpleScreenshot.prototype.calcParentProperty = function ($node) {
    let list = [{
      name: "opacity",
      value: 1,
    }, {
      name: dashTransform, //因为是给子元素截图，父元素的 transform-origin 等属性可以不考虑
      value: "",
    }, {
      name: "filter",
      value: "",
    }];

    let $target = $node.node.parentElement;

    while ($target != null) {
      let css = window.getComputedStyle($target);

      for (let i = 0; i < list.length; i++) {
        let property = list[i];
        let value = css.getPropertyValue(property.name);
        switch (property.name) {
          case 'opacity':
            value = value == null ? 1 : parseFloat(value);
            property.value *= value;
            break;
          case 'filter':
          case dashTransform:
            value = (value == null || value == 'none') ? '' : (' ' + value);
            property.value += value;
            break;
          default:
            break;
        }
      }

      $target = $target.parentElement;
    }

    return list;
  }

  SimpleScreenshot.prototype.toIMG = function (selector, callback) {
    let self = this;
    self.toSVG(selector, function (svg) {
      if (self.supportForeignObject && self.forceScreenshotType != 'server') {
        self.debug && self.log(svg) // log
        let base64 = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg.svg);
        self.toCanvas(base64, svg, function (canvas) {
          callback({
            canvas: canvas,
            base64: canvas.toDataURL(`image/${svg.imgType}`, svg.imgQuality / 100)
          });
        })
      } else {
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
        let xhr = new XMLHttpRequest();
        xhr.open("POST", self.puppeteerServer);
        // xhr.responseType = "blob"; // blob api、URL.createObjectURL 存在兼容性问题，返回数据类型使用 base64
        xhr.onerror = function (err) {
          self.error(err)
        };
        xhr.ontimeout = function (err) {
          self.error(err)
        };
        xhr.onload = function () {
          self.toCanvas(xhr.response, svg, function (canvas) {
            callback({
              canvas: canvas,
              base64: xhr.response
            });
          })
        };
        xhr.send(JSON.stringify(svg));
      }
    })
  }

  SimpleScreenshot.prototype.toCanvas = function (base64, svg, callback) {
    let img = new Image();
    img.width = parseInt(svg.distWidth);
    img.height = parseInt(svg.distHeight);
    img.onload = function () {
      let canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      let ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, img.width, img.height);
      if (isFunction(callback)) {
        callback(canvas)
      }
    }
    img.src = base64;
  }

  //元素转换为 html 代码
  SimpleScreenshot.prototype.toHTML = function (node, isRoot) {
    let html = "";
    let inner = "";

    //解析自身
    let cssTexts = this.parseCSS(node, isRoot);

    //伪类
    if (node.after) {
      inner += "<span style='" + cssTexts.after + "'></span>";
    }
    if (node.before) {
      inner += "<span style='" + cssTexts.before + "'></span>"
    }

    //解析子元素
    let childs = node.node.childNodes;
    let start = 0;
    for (let i = 0; i < childs.length; i++) {
      let child = childs[i];
      if (child.nodeType == Node.ELEMENT_NODE) { //元素
        let level = node.dataset.level + "-" + start;
        let curNode = this.getNodeByLevel(level);
        if (curNode) {
          inner += this.toHTML(curNode, false);
          start++;
        }
      } else {
        let fontFamily = this.getNodeStyle(node, "font-family");
        for (let z = 0; z < this.fontList.length; z++) { // 根据字体拆分文字
          let fontItem = this.fontList[z];
          if (fontFamily.includes(fontItem.name)) {
            for (let k = 0; k < child.wholeText.length; k++) {
              if (!fontItem.texts.includes(child.wholeText[k])) { //去重
                fontItem.texts += child.wholeText[k];
              }
            }
          }
        }
        for (let k = 0; k < child.wholeText.length; k++) { //全部文字
          if (!this._wholeTexts.includes(child.wholeText[k])) {
            this._wholeTexts += child.wholeText[k];
          }
        }

        /**
         * 拼接 xml 时如果文本节点中存在条件分割符 & 应该写成 &amp; 否则会报错 EntityRef: expecting ';'
         */
        inner += child.wholeText.replace(/[\r\n]/g, "").replace(/&/g, "&amp;"); //去掉换行符
      }
    }

    //拼装
    let tagName = node.dataset.name;
    html += "<" + tagName + " xmlns='http://www.w3.org/1999/xhtml'";
    if (node.dataset.src) {
      let index = RESOURCE_NAME.indexOf(node.dataset.src);
      if (index != -1) {
        html += " src='" + RESOURCE_DATA[index] + "'";
      } else {
        html += " src='" + node.dataset.src + "'";
      }
    }
    if (!isRoot) {
      html += " style='" + cssTexts.style + "'>";
    } else {
      html += " id='simple-screenshot'>";
      html += "<style>";
      html += "#simple-screenshot,#simple-screenshot *:not(style){" + cssTexts.style + "} " + this.globalInlineFont;
      html += "</style>";
    }
    html += inner;
    html += "</" + tagName + ">";

    return html;
  }

  //解析 cssRules
  SimpleScreenshot.prototype.parseCSS = function (node, isRoot) {
    let style = "";
    let after = "";
    let before = "";

    node._rules = {
      autoRenderWidth: this.rules.autoRenderWidth
    }

    for (let i = 0; i < this.parseCSSFilter.length; i++) { //自定义 css 解析过滤器
      let filter = this.parseCSSFilter[i];
      if (isFunction(filter)) {
        filter(node)
      }
    }

    for (let i = 0; i < COMPUTED_STYLE.length; i++) {
      let name = COMPUTED_STYLE[i];
      if (isRoot) { //根节点
        if (["margin-top", "margin-left", "margin-bottom", "margin-right"].includes(name)) {
          this.setNodeStyle(node, name, 0); //最外层元素的 margin 必须为 0，否则会因为偏移导致错位
        } else if (["absolute", "fixed"].includes(this.getNodeStyle(node, "position")) && ["top", "bottom", "left", "right"].includes(name)) {
          this.setNodeStyle(node, name, 0); //最外层元素为绝对定位或者固定定位时，top、bottom、left、right 必须为 0，否则会因为定位偏移导致错位
        }
      } else { //非根节点
        if (this.getNodeStyle(node, name) == this.getNodeStyle(this.root, name)) {
          continue;
        }
      }

      if (name == "background-image") { //背景图片
        style += this.parseBackgroundImage(this.getNodeStyle(node, name));
        if (node.after) {
          after += this.parseBackgroundImage(node.after[name]);
        }
        if (node.before) {
          before += this.parseBackgroundImage(node.before[name]);
        }
      } else {
        style += name + ":" + this.getNodeStyle(node, name) + ";";
        if (node.after) {
          after += name + ":" + node.after[name] + ";";
        }
        if (node.before) {
          before += name + ":" + node.before[name] + ";";
        }
      }
    }

    if ((node._rules.autoRenderWidth || !this._hasWidthNodes.includes(node.node)) && !isRoot) {
      style += "width: auto;";
    }

    return {
      style: style,
      after: after,
      before: before
    }
  }

  //解析
  SimpleScreenshot.prototype.parseBackgroundImage = function (bgValue) {
    let matches = null;
    let style = "";
    let isReplaceResource = false;
    URL_REGEX.lastIndex = 0 //重置正则对象
    matches = URL_REGEX.exec(bgValue) //匹配url值
    if (matches != null) {
      let url = matches[1];
      if (bgValue && url && url.search(/^(data:)/) == -1) { //非dataurl
        let index = RESOURCE_NAME.indexOf(url);
        isReplaceResource = true;
        if (index != -1) {
          style += "background-image : url(" + RESOURCE_DATA[index] + ");";
        } else {
          /**
           * 拼接 xml 时如果 url 中存在条件分割符 &，应该写成 &amp; 否则会报错 EntityRef: expecting ';'
           * 可以用 encodeURIComponent 编码来避免这个问题。
           */
          style += "background-image : url(" + encodeURIComponent(url) + ");";
        }
      }
    }
    if (!isReplaceResource) {
      style += "background-image :" + bgValue + ";";
    }

    return style;
  }

  //设置节点样式
  SimpleScreenshot.prototype.setNodeStyle = function (node, name, value) {
    node.style[name] = value;
  }

  //获取节点样式
  SimpleScreenshot.prototype.getNodeStyle = function (node, name) {

    return (node.style[name] != null) ? node.style[name] : node.computedStyle[name];
  }

  //根据级别获取节点
  SimpleScreenshot.prototype.getNodeByLevel = function (level) {
    for (let i = 0; i < this.nodes.length; i++) {
      if (this.nodes[i].dataset.level == level) {
        return this.nodes[i];
      }
    }
    return null;
  }

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

      // img src
      if (node.dataset.src && node.dataset.src.length > 0) {
        this.loadResource("url(" + node.dataset.src + ")", add, del);
      }

      // background-image
      let bgImg = node.computedStyle['background-image'];
      if (bgImg && bgImg.length > 0 && bgImg != 'none') {
        this.loadResource(bgImg, add, del);
      }

      if (node.after) {
        let afterImg = node.after['background-image']
        if (afterImg && afterImg.length > 0 && afterImg != 'none') {
          this.loadResource(afterImg, add, del);
        }
      }

      if (node.before) {
        let beforeImg = node.before['background-image']
        if (beforeImg && beforeImg.length > 0 && beforeImg != 'none') {
          this.loadResource(beforeImg, add, del);
        }
      }
    }

    if (count == 0) {
      finished();
    }
  };

  //根据 url 获取 data 名称
  SimpleScreenshot.prototype.getType = function (url) {
    let types = [".png", ".jpg", ".jpeg"];
    let names = ["image/png", "image/jpg", "image/jpg"];
    for (let i = 0; i < types.length; i++) {
      if (url.lastIndexOf(types[i]) + types[i].length == url.length) {
        return names[i]
      }
    }
    return names[0];
  }

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

          let xhr = new XMLHttpRequest();
          xhr.responseType = "blob";
          xhr.timeout = 3000;
          xhr.open("GET", url, true);
          xhr.onerror = function (err) {
            self.error({
              msg: `${url} request error`,
              err: err,
            });
          };
          xhr.ontimeout = function (err) {
            self.error({
              msg: `${url} request timeout`,
              err: err,
            });
          };
          xhr.onload = function () {
            let reader = new FileReader();
            reader.onload = function () {
              let index = RESOURCE_NAME.indexOf(url);
              RESOURCE_DATA[index] = reader.result;
              del();
            };
            reader.readAsDataURL(xhr.response);
          };
          xhr.send();
        }
      }
    }
  };

  return SimpleScreenshot;
});