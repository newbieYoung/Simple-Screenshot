(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['prefix-umd'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node/CommonJS
    module.exports = factory(require('prefix-umd'));
  } else {
    // Browser globals
    window.SimpleForeignObject = factory(window.Prefix);
  }
}(function (Prefix) {

  var dashTransform = Prefix.dash('transform');
  var dashOrigin = Prefix.dash('transformOrigin');
  var URL_REGEX = /url\(['"]?([^'"]+?)['"]?\)/g;

  function SimpleForeignObject(params) {
    params = params || {};
    this.devicePixelRatio = params.devicePixelRatio || 1; //设备像素比
    this.ready = function () {
      setTimeout(function () { //默认加入延迟
        params.ready()
      })
    } || function () {}; //准备完成回调

    /**
     * 忽略部分属性，比如：
     * -webkit-locale 会导致生成图片异常
     * font-family 外部资源需要单独处理
     * 还要考虑部分属性对子元素有影响，但是并不会被子元素继承
     */
    this.ignoreProperty = ['-webkit-locale', 'font-family'];
    this.resource = []; //资源列表
    this.parseStyleSheets();
  }

  /**
   * dom节点转换为html代码
   */
  SimpleForeignObject.prototype.toHtml = function ($node, isRoot) {
    //解析子元素
    var childs = $node.childNodes;
    var inner = '';
    for (var i = 0; i < childs.length; i++) {
      inner += this.toHtml(childs[i], false);
    }

    //解析自身
    var html = '';
    var $clone = $node.cloneNode(false); //浅克隆
    var nodeType = $clone.nodeType;
    if (nodeType == Node.ELEMENT_NODE) { //元素
      var css = window.getComputedStyle($node);
      var tagName = $clone.tagName.toLowerCase();
      var style = '';
      var inlineCssText = '';
      for (var i = 0; i < css.length; i++) {
        var name = css[i];
        if (/^[\d]+/.exec(name) == null) { //排除数字属性
          if (isRoot && this.isMargin(name)) {
            style += name + ': 0;' //最外层元素的 margin 必须为0，否则会因为偏移导致错位
          } else if (name == 'font-family') { //处理字体资源
            var font = css.getPropertyValue('font-family');
            inlineCssText = this.inlineFont(font, inlineCssText);
            style += name + ':' + css.getPropertyValue(name) + ';'
          } else if (name == 'background-image') { //处理图片资源

          } else if (this.ignoreProperty.includes(name)) {
            //部分属性不处理
          } else {
            style += name + ':' + css.getPropertyValue(name) + ';'
          }
        }
      }
      if (inlineCssText != '') {
        var inlineStyle = document.createElement('style');
        inlineStyle.appendChild(document.createTextNode(inlineCssText));
        $clone.appendChild(inlineStyle);
      }
      $clone.style = style;
      html = new XMLSerializer().serializeToString($clone);
      html = this.forcePrefix(html, css, $clone);
      var end = '</' + tagName + '>';
      var no = html.indexOf(end);
      html = html.substring(0, no) + inner + html.substring(no, html.length);
    } else if (nodeType == Node.TEXT_NODE) { //文字
      html = $node.wholeText;
    }

    return html;
  }

  /**
   * 根据关键字获取资源
   */
  SimpleForeignObject.prototype.getResource = function (key) {
    if (this.resource != null) {
      for (var i = 0; i < this.resource.length; i++) {
        var item = this.resource[i];
        if (key == item.key) {
          return item.src;
        }
      }
    }
    return null;
  }

  /**
   * 内联字体资源
   */
  SimpleForeignObject.prototype.inlineFont = function (font, inlineCssText) {
    if (this.resource != null) {
      for (var i = 0; i < this.resource.length; i++) {
        var item = this.resource[i];
        if (font.indexOf(item.key) != -1) {
          inlineCssText += '@font-face { font-family:' + item.key + ' ; src:' + item.src + ';}';
        }
      }
    }

    return inlineCssText;
  }

  /**
   * 加载外部资源
   */
  SimpleForeignObject.prototype.loadResource = function (url, func) {
    var self = this;
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.timeout = 30000;
    xhr.open('GET', url, true);
    xhr.onerror = function () {
      console.log('load ' + url + ' error'); //异常
    };
    xhr.ontimeout = function () {
      console.log('load ' + url + ' timeout'); //超时
    }
    xhr.onload = function () {
      console.log('load ' + url + ' success');
      var reader = new FileReader();
      reader.onload = function () {
        func(reader.result);
      };
      reader.readAsDataURL(xhr.response);
    };
    xhr.send();
  }

  /**
   * 解析 styleSheets
   */
  SimpleForeignObject.prototype.parseStyleSheets = function () {
    var self = this;
    var count = 0;
    var finished = 0;
    self.resource = [];
    var cssRules = self.getAllCssRules();
    for (var i = 0; i < cssRules.length; i++) {
      var rule = cssRules[i];
      if (rule.type == CSSRule.FONT_FACE_RULE) { //字体样式
        var fontFamily = rule.style.getPropertyValue('font-family');
        var src = rule.style.getPropertyValue('src');
        var matches = URL_REGEX.exec(src); //匹配url值
        if (matches != null) {
          var url = matches[1];
          if (url.search(/^(data:)/) == -1) { //非 dataurl
            count++;
            self.loadResource(url, function (dataurl) {
              finished++;
              self.resource.push({
                key: fontFamily,
                src: 'url("' + dataurl + '")',
              })
              if (finished == count) {
                console.log('--- simple-foreignobject ready ---');
                self.ready();
              }
            })
          } else {
            self.resource.push({
              key: fontFamily,
              src: src
            })
          }
        }
      } else {
        var cssText = rule.cssText;
        var matches = cssText.match(URL_REGEX); //匹配url值
        if (matches != null) {
          for (var j = 0; j < matches.length; j++) {
            var url = matches[j];
            var value = URL_REGEX.exec(url)[1]; //匹配url值
            if (value.search(/^(data:)/) == -1) { //非 dataurl
              count++;
              self.loadResource(value, function (dataurl) {
                finished++;
                self.resource.push({
                  key: value.trim(),
                  src: 'url("' + dataurl + '")',
                })
                if (finished == count) {
                  console.log('--- simple-foreignobject ready ---');
                  self.ready();
                }
              })
            }
          }
        }
      }
    }

    if (count <= 0) {
      self.ready();
    }
  }

  /**
   * 从 document.styleSheets 中获取全部 cssRule
   */
  SimpleForeignObject.prototype.getAllCssRules = function () {
    var styleSheets = document.styleSheets;
    var cssRules = [];
    for (var i = 0; i < styleSheets.length; i++) {
      var list = styleSheets[i].cssRules;
      for (var j = 0; j < list.length; j++) {
        cssRules.push(list[j]);
      }
    }
    return cssRules;
  }

  /**
   * dom节点转换为svg
   */
  SimpleForeignObject.prototype.toSvg = function ($node) {
    var rect = $node.getBoundingClientRect($node);
    var width = rect.width * this.devicePixelRatio;
    var height = rect.height * this.devicePixelRatio;
    var html = this.toHtml($node, true);
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + width +
      '" height="' + height + '">' +
      '<foreignObject width="100%" height="100%">' +
      '<div xmlns="http://www.w3.org/1999/xhtml" style="' + dashTransform + ':scale(' + this.devicePixelRatio + ');' + dashOrigin + ':0 0;">' + //额外加入容器并通过放大解决设备像素比问题
      html +
      '</div>' +
      '</foreignObject>' +
      '</svg>';

    console.log(svg);
    return svg;
  }

  /**
   * dom节点转换为canvas
   */
  SimpleForeignObject.prototype.toCanvas = function ($node, func) {
    var svg = 'data:image/svg+xml;charset=utf-8,' + this.toSvg($node);
    var img = new Image();
    img.src = svg;
    img.onload = function () {
      var canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      if (func) {
        func(canvas)
      }
    }
  }

  /**
   * 判断是否是外间距
   */
  SimpleForeignObject.prototype.isMargin = function (name) {
    if (name == 'margin' || name == 'margin-bottom' || name == 'margin-top' || name == 'margin-right' || name == 'margin-left') {
      return true;
    }
    return false;
  }

  /**
   * 某些属性再赋值时会出现丢失的情况，因此需要强行补充，而且补充时还需要考虑全部浏览器前缀，比如：
   * background-clip
   */
  SimpleForeignObject.prototype.forcePrefix = function (html, css, $clone) {
    var prefixes = ['-o-', '-ms-', '-moz-', '-webkit-'];
    var tag = 'style="';
    var start = html.indexOf(tag);
    var style = '';

    for (var i = 0; i < css.length; i++) {
      var name = css[i];
      if (!this.ignoreProperty.includes(name)) {
        var v1 = css.getPropertyValue(name);
        var v2 = $clone.style[Prefix.prefix(name)];
        if (v1 != v2) {
          style += name + ':' + v1 + ';';
          if (!this.isContainPrefix(name)) { //不包含浏览器前缀
            for (var j = 0; j < prefixes.length; j++) {
              style += prefixes[j] + name + ':' + v1 + ';';
            }
          }
        }
      }
    }

    var no = start + tag.length;
    html = html.substring(0, no) + style + html.substring(no, html.length);
    return html;
  }

  /**
   * 是否包含浏览器前缀
   */
  SimpleForeignObject.prototype.isContainPrefix = function (name) {
    var prefixes = ['-o-', '-ms-', '-moz-', '-webkit-'];
    for (var i = 0; i < prefixes.length; i++) {
      if (name.indexOf(prefixes[i]) != -1) {
        return true;
      }
    }
    return false;
  }

  /**
   * 下载 canvas png
   */
  SimpleForeignObject.prototype.downloadCanvasPng = function ($canvas, name) {
    var aLink = document.createElement('a');
    aLink.download = name + '.png';
    var blob = this.canvasToBlob($canvas, 'image/png');
    aLink.href = URL.createObjectURL(blob);
    var evt = new MouseEvent('click'); //创建鼠标事件
    aLink.dispatchEvent(evt); //触发鼠标事件
  }

  /**
   * canvas 转换为 blob
   */
  SimpleForeignObject.prototype.canvasToBlob = function (canvas, type) {
    var dataurl = canvas.toDataURL(type);
    return this.dataurlToBlob(dataurl);
  }

  /**
   * dataurl 转换为 blob
   */
  SimpleForeignObject.prototype.dataurlToBlob = function (dataurl) {
    var arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1];
    var u8arr = this.dataurlToUint8(dataurl);
    return new Blob([u8arr], {
      type: mime
    });
  }

  /**
   * dataurl 转换为 uint8
   */
  SimpleForeignObject.prototype.dataurlToUint8 = function (dataurl) {
    var arr = dataurl.split(','),
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return u8arr;
  }

  return SimpleForeignObject;
}));