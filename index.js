;
(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['prefix-umd'], factory)
  } else if (typeof module === 'object' && module.exports) {
    // Node/CommonJS
    module.exports = factory(require('prefix-umd'))
  } else {
    // Browser globals
    window.SimpleForeignObject = factory(window.Prefix)
  }
})(function (Prefix) {
  //includes方法兼容
  if (!Array.prototype.includes) {
    Object.defineProperty(Array.prototype, 'includes', {
      value: function (valueToFind, fromIndex) {
        var o = Object(this);
        var len = o.length >>> 0;
        if (len === 0) {
          return false;
        }

        var n = fromIndex | 0;
        var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

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

  var dashTransform = Prefix.dash('transform')
  var dashOrigin = Prefix.dash('transformOrigin')
  var URL_REGEX = /url\(['"]?([^'"]+?)['"]?\)/g

  function SimpleForeignObject(params) {
    params = params || {}

    this.debug = params.debug || false //调试模式
    this.devicePixelRatio = params.devicePixelRatio || 1 //设备像素比
    this.pagePath = this.getPathPath() //页面路径（不包括 window.location.origin 和 页面名称）

    this.ready =
      function () {
        console.log('--- simple-foreignobject ready ---')
        if (this.debug) {
          console.log(this.resource)
        }
        setTimeout(function () {
          //默认加入延迟
          if (params.ready != null) {
            params.ready()
          }
        })
      } //准备完成回调

    /**
     * 忽略部分属性，比如：
     * -webkit-locale 会导致生成图片异常
     * font-family 外部资源需要单独处理
     * background-image 外部资源需要单独处理
     */
    this.ignoreProperty = ['-webkit-locale', 'font-family', 'background-image']


    /**
     * 最外层元素 margin 以及 当为绝对定位或者固定定位时 top、bottom、left、right 必须为0，否则会因为偏移导致错位
     */
    this.rootOffsetProperty = ['margin', 'margin-top', 'margin-left', 'margin-bottom', 'margin-right', 'top', 'bottom', 'left', 'right'];

    this._rootCss = null; //当前最外层元素css属性列表

    this.resource = [] //资源列表
    this.parseStyleSheets()
  }

  /**
   * 处理元素伪类
   */
  SimpleForeignObject.prototype.pseudoClass = function ($node, type) {
    var html = '';
    var nodeType = $node.nodeType;
    var $dom = document.createElement('span');
    $dom.style.display = 'none';
    if ([':before', '::before', ':after', '::after'].includes(type) && nodeType == Node.ELEMENT_NODE) {
      var css = window.getComputedStyle($node, type);
      var content = css.getPropertyValue('content');
      if (content != 'none') {
        var obj = this.parseCss(css, false);

        var style = obj.style;
        var inlineCssText = obj.inlineCssText;

        if (inlineCssText != '') {
          var inlineStyle = document.createElement('style')
          inlineStyle.appendChild(document.createTextNode(inlineCssText))
          $dom.appendChild(inlineStyle)
        }
        $dom.style = style;
        $dom.innerText = content.substring(1, content.length - 1); //去掉首页默认双引号字符

        html += new XMLSerializer().serializeToString($dom);
        html = this.forcePrefix(html, css, $dom)

        return html
      }
    }

    return new XMLSerializer().serializeToString($dom);
  }

  /**
   * 解析 Css
   */
  SimpleForeignObject.prototype.parseCss = function (css, isRoot) {
    var style = ''
    var inlineCssText = ''
    if (isRoot) {
      this._rootCss = css;
    }
    for (var i = 0; i < css.length; i++) {
      var name = css[i]
      var value = css.getPropertyValue(name);
      if (!isRoot) {
        var _rcValue = this._rootCss.getPropertyValue(name);
        if (_rcValue == value) { //属性相同值相等为重复样式代码
          continue;
        }
      }
      if (/^[\d]+/.exec(name) == null) {
        //排除数字属性
        if (isRoot && this.isMargin(name)) {
          style += name + ': 0;' //最外层元素的 margin 必须为0，否则会因为偏移导致错位

        } else if (isRoot && this.isPosition(css) && (['top', 'bottom', 'left', 'right'].includes(name))) {
          style += name + ': 0;' //最外层元素为绝对定位或者固定定位时，top、bottom、left、right 必须为0，否则会因为定位偏移导致错位

        } else if (name == 'font-family') {
          //处理字体资源
          inlineCssText = this.inlineFont(value, inlineCssText)
          style += name + ':' + value + ';'
        } else if (name == 'background-image') {
          //处理图片资源
          URL_REGEX.lastIndex = 0 //重置正则对象
          var matches = URL_REGEX.exec(value) //匹配url值
          if (matches != null) {
            var url = matches[1]
            var origin = window.location.origin
            var no = url.indexOf(origin)
            if (no != -1) {
              url = url.substring(no + origin.length, url.length)
            }
            value = this.getResource(url)
          }
          style += name + ':' + value + ';'

        } else if (this.ignoreProperty.includes(name)) {
          //部分属性不处理
        } else {
          style += name + ':' + value + ';'
        }
      }
    }

    if (isRoot) { //以最外层元素的css属性充当公共css属性，防止结构复杂时重复样式代码过多导致体积太大。
      inlineCssText += '*{' + style + '}';
    }

    return {
      style: style,
      inlineCssText: inlineCssText
    }
  }

  /**
   * dom节点转换为html代码
   */
  SimpleForeignObject.prototype.toHtml = function ($node, isRoot) {
    var inner = ''

    //处理before伪类
    inner += this.pseudoClass($node, ':before');

    //解析子元素
    var childs = $node.childNodes
    for (var i = 0; i < childs.length; i++) {
      inner += this.toHtml(childs[i], false)
    }

    //处理after伪类
    inner += this.pseudoClass($node, ':after');

    //解析自身
    var html = ''
    var $clone = $node.cloneNode(false) //浅克隆
    var nodeType = $clone.nodeType
    if (nodeType == Node.ELEMENT_NODE) { //元素
      var tagName = $clone.tagName.toLowerCase()
      var css = window.getComputedStyle($node)
      var obj = this.parseCss(css, isRoot);

      var style = obj.style;
      var inlineCssText = obj.inlineCssText;

      if (inlineCssText != '') {
        var inlineStyle = document.createElement('style')
        inlineStyle.appendChild(document.createTextNode(inlineCssText))
        $clone.appendChild(inlineStyle)
      }
      $clone.style = style
      html = new XMLSerializer().serializeToString($clone)
      html = this.forcePrefix(html, css, $clone)
      var end = '</' + tagName + '>'
      var no = html.indexOf(end)
      html = html.substring(0, no) + inner + html.substring(no, html.length)
    } else if (nodeType == Node.TEXT_NODE) { //文字
      html = $node.wholeText
    }

    return html
  }

  /**
   * 根据关键字获取资源
   */
  SimpleForeignObject.prototype.getResource = function (key) {
    if (this.resource != null) {
      for (var i = 0; i < this.resource.length; i++) {
        var item = this.resource[i]
        if (item.key.indexOf(key) != -1) {
          return item.src
        }
      }
    }
    return null
  }

  /**
   * 内联字体资源
   */
  SimpleForeignObject.prototype.inlineFont = function (font, inlineCssText) {
    if (this.resource != null) {
      for (var i = 0; i < this.resource.length; i++) {
        var item = this.resource[i]
        if (font.indexOf(item.key) != -1) {
          inlineCssText +=
            '@font-face { font-family:' + item.key + ' ; src:' + item.src + ';}'
        }
      }
    }

    return inlineCssText
  }

  /**
   * 加载外部资源
   */
  SimpleForeignObject.prototype.loadResource = function (url, success, end) {
    var self = this
    var xhr = new XMLHttpRequest()
    xhr.responseType = 'blob'
    xhr.timeout = 30000
    xhr.open('GET', url, true)
    xhr.onerror = function () {
      console.log('load ' + url + ' error') //异常
      if (end) {
        end();
      }
    }
    xhr.ontimeout = function () {
      console.log('load ' + url + ' timeout') //超时
      if (end) {
        end();
      }
    }
    xhr.onload = function () {
      if (self.debug) {
        console.log('load ' + url + ' success')
      }
      var reader = new FileReader()
      reader.onload = function () {
        success(reader.result)
        if (end) {
          end();
        }
      }
      reader.readAsDataURL(xhr.response)
    }
    xhr.send()
  }

  /**
   * 获取当前页面路径
   */
  SimpleForeignObject.prototype.getPathPath = function () {
    var href = window.location.href
    var origin = window.location.origin
    var pathname = window.location.pathname
    var pageName = pathname.split('/').pop()
    var start = href.indexOf(origin) + origin.length
    var end = href.indexOf(pageName)
    return href.substring(start, end)
  }

  /**
   * 拼接路径
   */
  SimpleForeignObject.prototype.pathJoin = function (array) {
    // Split the inputs into a list of path commands.
    var parts = []
    for (var i = 0, l = array.length; i < l; i++) {
      parts = parts.concat(array[i].split('/'))
    }
    // Interpret the path commands to get the new resolved path.
    var newParts = []
    for (i = 0, l = parts.length; i < l; i++) {
      var part = parts[i]
      // Remove leading and trailing slashes
      // Also remove "." segments
      if (!part || part === '.') continue
      // Interpret ".." to pop the last segment
      if (part === '..') newParts.pop()
      // Push new path segments.
      else newParts.push(part)
    }
    // Preserve the initial slash if there was one.
    if (parts[0] === '') newParts.unshift('')
    // Turn back into a single string path.
    return newParts.join('/') || (newParts.length ? '/' : '.')
  }

  /**
   * 解析 cssRules
   */
  SimpleForeignObject.prototype.parseCSSRules = function (cssRules) {
    var self = this
    var count = 0
    var finished = 0
    self.resource = []

    for (var i = 0; i < cssRules.length; i++) {
      var rule = cssRules[i]
      if (rule.type == CSSRule.FONT_FACE_RULE) {
        //字体样式
        var fontFamily = rule.style.getPropertyValue('font-family')
        var src = rule.style.getPropertyValue('src')
        URL_REGEX.lastIndex = 0 //重置正则对象
        var matches = URL_REGEX.exec(src) //匹配url值
        if (matches != null) {
          var url = matches[1]
          if (url.search(/^(data:)/) == -1) {
            //非 dataurl
            count++;
            (function (key) {
              self.loadResource(url, function (dataurl) {
                self.resource.push({
                  key: key,
                  src: 'url("' + dataurl + '")'
                })
              }, function () {
                finished++
                if (finished == count) {
                  self.ready()
                }
              })
            })(fontFamily)
          } else {
            self.resource.push({
              key: fontFamily,
              src: src
            })
          }
        }
      } else {
        var cssText = rule.cssText
        var matches = cssText.match(URL_REGEX) //匹配url值
        if (matches != null) {
          for (var j = 0; j < matches.length; j++) {
            var url = matches[j]
            URL_REGEX.lastIndex = 0
            var value = URL_REGEX.exec(url)[1] //匹配url值
            if (value.search(/^(data:)/) == -1) {
              //非 dataurl
              count++;
              (function (key) {
                self.loadResource(value, function (dataurl) {
                  self.resource.push({
                    key: self.pathJoin([self.pagePath, key.trim()]),
                    src: 'url("' + dataurl + '")'
                  })
                }, function () {
                  finished++
                  if (finished == count) {
                    self.ready()
                  }
                })
              })(value)
            }
          }
        }
      }
    }

    if (count <= 0) {
      self.ready()
    }
  }

  /**
   * 解析 styleSheets
   */
  SimpleForeignObject.prototype.parseStyleSheets = function () {
    var self = this;
    self.getAllCssRules(function (cssRules) {
      self.parseCSSRules(cssRules);
    }, true)
  }

  /**
   * 从 document.styleSheets 中获取全部 cssRule
   */
  SimpleForeignObject.prototype.getAllCssRules = function (callback, isAgain) {
    var crossOriginCss = [];
    var styleSheets = document.styleSheets
    var cssRules = []
    for (var i = 0; i < styleSheets.length; i++) {
      try {
        var list = styleSheets[i].cssRules
        for (var j = 0; j < list.length; j++) {
          cssRules.push(list[j])
        }
      } catch (e) {
        //css 跨域时直接获取 cssRules 属性报错
        crossOriginCss.push(styleSheets[i].href);
      }
    }

    if (crossOriginCss.length <= 0 || !isAgain) {
      if (this.debug) {
        console.log(cssRules);
      }
      callback(cssRules);
    } else {
      //把跨域 css 当成外部文件加载，然后转换成 本地加载 dataurl（资源文件需要设置为可以跨域）
      var self = this;
      var count = 0;
      for (var i = 0; i < crossOriginCss.length; i++) {
        (function (href) {
          self.loadResource(href, function (dataurl) {
            var $head = document.getElementsByTagName('head')[0];
            var $link = document.createElement('link');
            $link.rel = 'stylesheet';
            $link.type = 'text/css';
            $link.href = dataurl;
            $head.appendChild($link);
            $link.onload = function () {
              count++;
              if (count == crossOriginCss.length) {
                self.getAllCssRules(callback, false)
              }
            }
          })
        })(crossOriginCss[i])
      }
    }


  }

  /**
   * 父元素的部分属性对子元素有影响，但是并不会被子元素继承，比如：
   * opacity、transform、filter
   * 
   */
  SimpleForeignObject.prototype.calcParentProperty = function ($node) {
    var list = [{
      name: 'opacity',
      value: 1,
    }, {
      name: dashTransform, //因为是给子元素截图，父元素的 transform-origin 等属性可以不考虑
      value: '',
    }, {
      name: 'filter',
      value: '',
    }];

    var $target = $node.parentElement;

    while ($target != null) {
      var css = window.getComputedStyle($target);

      for (var i = 0; i < list.length; i++) {
        var property = list[i];
        var value = css.getPropertyValue(property.name);
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

  /**
   * dom节点转换为svg
   */
  SimpleForeignObject.prototype.toSvg = function ($node) {
    var rect = $node.getBoundingClientRect($node)
    var width = rect.width * this.devicePixelRatio
    var height = rect.height * this.devicePixelRatio
    var html = this.toHtml($node, true)
    var css = window.getComputedStyle($node);
    var parentCss = this.calcParentProperty($node);

    var svg = '';
    svg += '<svg xmlns="http://www.w3.org/2000/svg"';
    svg += ' width="' + width + '"';
    svg += ' height="' + height + '"';
    svg += '>';
    svg += '<foreignObject width="100%" height="100%">';
    svg += '<div xmlns="http://www.w3.org/1999/xhtml" style="';
    if (css.getPropertyValue('display') == 'inline-block') { //防止行内元素的布局被空白字符挤乱
      svg += 'font-size : 0 ;';
    }
    for (var i = 0; i < parentCss.length; i++) {
      var property = parentCss[i];
      property.value = property.value == null ? '' : (property.value + '').trim();
      if (property.name == dashTransform) {
        property.value += ' scale(' + this.devicePixelRatio + ');' //考虑设备像素比
      }
      if (property.value != '') {
        svg += property.name + ' : ' + property.value + ' ;';
      }
    }
    svg += dashOrigin + ':0 0;">'
    svg += html;
    svg += '</div>';
    svg += '</foreignObject>';
    svg += '</svg>';

    if (this.debug) {
      console.log(svg)
    }
    return svg
  }

  /**
   * dom节点转换为canvas
   */
  SimpleForeignObject.prototype.toCanvas = function ($node, func) {
    var svg = 'data:image/svg+xml;charset=utf-8,' + this.toSvg($node)
    var img = new Image()
    img.src = svg
    img.setAttribute('crossorigin', 'anonymous');
    img.onload = function () {
      var canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      var ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      if (func) {
        func(canvas)
      }
    }
  }

  /**
   * 判断是否是外间距
   */
  SimpleForeignObject.prototype.isMargin = function (name) {
    if (
      name == 'margin' ||
      name == 'margin-bottom' ||
      name == 'margin-top' ||
      name == 'margin-right' ||
      name == 'margin-left'
    ) {
      return true
    }
    return false
  }

  /**
   * 判断是否是绝对或者固定定位
   */
  SimpleForeignObject.prototype.isPosition = function (css) {
    var position = css.getPropertyValue('position');
    if (position == 'absolute' || position == 'fixed') {
      return true;
    }
    return false;
  }

  /**
   * $clone.style = style 赋值时会出现因为兼容性问题丢失部分css属性的情况；
   * 比如：background-clip 等
   * 因此需要强行补充，而且补充时还需要考虑全部浏览器前缀。
   */
  SimpleForeignObject.prototype.forcePrefix = function (html, css, $clone) {
    var prefixes = ['-o-', '-ms-', '-moz-', '-webkit-']
    var tag = 'style="'
    var start = html.indexOf(tag)
    var style = ''

    for (var i = 0; i < css.length; i++) {
      var name = css[i]
      if (!this.rootOffsetProperty.includes(name)) { //因为最外层元素位置偏移问题重置过的属性可以排除
        var v1 = css.getPropertyValue(name)
        var v2 = $clone.style[Prefix.prefix(name)]
        if (v1 != v2) {
          style += name + ':' + v1 + ';'
          if (!this.isContainPrefix(name)) {
            //不包含浏览器前缀
            for (var j = 0; j < prefixes.length; j++) {
              style += prefixes[j] + name + ':' + v1 + ';'
            }
          }
        }
      }
    }

    var no = start + tag.length
    html = html.substring(0, no) + style + html.substring(no, html.length)
    return html
  }

  /**
   * 是否包含浏览器前缀
   */
  SimpleForeignObject.prototype.isContainPrefix = function (name) {
    var prefixes = ['-o-', '-ms-', '-moz-', '-webkit-']
    for (var i = 0; i < prefixes.length; i++) {
      if (name.indexOf(prefixes[i]) != -1) {
        return true
      }
    }
    return false
  }

  /**
   * 下载 canvas png
   */
  SimpleForeignObject.prototype.downloadCanvasPng = function ($canvas, name) {
    var aLink = document.createElement('a')
    aLink.download = name + '.png'
    var blob = this.canvasToBlob($canvas, 'image/png')
    aLink.href = URL.createObjectURL(blob)
    var evt = new MouseEvent('click') //创建鼠标事件
    aLink.dispatchEvent(evt) //触发鼠标事件
  }

  /**
   * canvas 转换为 blob
   */
  SimpleForeignObject.prototype.canvasToBlob = function (canvas, type) {
    var dataurl = canvas.toDataURL(type)
    return this.dataurlToBlob(dataurl)
  }

  /**
   * dataurl 转换为 blob
   */
  SimpleForeignObject.prototype.dataurlToBlob = function (dataurl) {
    var arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1]
    var u8arr = this.dataurlToUint8(dataurl)
    return new Blob([u8arr], {
      type: mime
    })
  }

  /**
   * dataurl 转换为 uint8
   */
  SimpleForeignObject.prototype.dataurlToUint8 = function (dataurl) {
    var arr = dataurl.split(','),
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return u8arr
  }

  return SimpleForeignObject
})