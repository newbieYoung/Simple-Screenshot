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
  var transformProperty = Prefix.prefix('transform');

  function SimpleForeignObject(params) {
    params = params || {};
    this.devicePixelRatio = params.devicePixelRatio || 1;//设备像素比
  }

  /**
   * dom节点转换为html代码
   */
  SimpleForeignObject.prototype.toHtml = function ($node,isRoot) {
    //解析子元素
    var childs = $node.childNodes;
    var inner = '';
    for(var i=0;i<childs.length;i++){
      inner += this.toHtml(childs[i],false);
    }

    //解析自身
    var html = '';
    var $clone = $node.cloneNode(false); //浅克隆
    var nodeType = $clone.nodeType;
    if(nodeType==Node.ELEMENT_NODE){//元素
      var css = window.getComputedStyle($node);
      if(isRoot && this.devicePixelRatio > 1){//根节点通过放大来处理设备像素比
        $clone.style[transformProperty] = css.getPropertyValue('transform')+' scale('+this.devicePixelRatio+')';
      }
      var tagName = $clone.tagName.toLowerCase();
      var end = '</'+tagName+'>';
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
      html = html.substring(0,no)+inner+html.substring(no,html.length);
    }else if(nodeType==Node.TEXT_NODE){//文字
      html = $node.wholeText;
    }

    return html;
  }

  /**
   * dom节点转换为svg
   */
  SimpleForeignObject.prototype.toSvg = function($node){

  }

  return SimpleForeignObject;
}));