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
  var prefixTransform = Prefix.prefix('transform');
  var dashOrigin = Prefix.dash('transformOrigin');

  function SimpleForeignObject(params) {
    params = params || {};
    this.devicePixelRatio = params.devicePixelRatio || 1; //设备像素比
  }

  /**
   * dom节点转换为html代码
   */
  SimpleForeignObject.prototype.toHtml = function ($node) {
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
      var end = '</' + tagName + '>';
      var style = '';
      for (var i = 0; i < css.length; i++) {
        var name = css[i];
        if (/^[\d]+/.exec(name) == null) { //排除数字属性
          if (name == 'font-family') {
            //字体单独处理
          } else if (name == '-webkit-locale') {
            //部分属性不处理
          } else {
            style += name + ':' + css.getPropertyValue(name) + ';'
          }
        }
      }
      $clone.style = style;
      html = new XMLSerializer().serializeToString($clone);
      var no = html.indexOf(end);
      html = html.substring(0, no) + inner + html.substring(no, html.length);
    } else if (nodeType == Node.TEXT_NODE) { //文字
      html = $node.wholeText;
    }

    return html;
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
      '<div xmlns="http://www.w3.org/1999/xhtml" style="transform:scale(' + this.devicePixelRatio + ');transform-origin:0 0;">' + //额外加入容器并通过放大解决设备像素比问题
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