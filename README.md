# 基于 SVG ForeignObject 的网页截图组件

`Simple-ForeignObject` [https://github.com/newbieYoung/Simple-ForeignObject](https://github.com/newbieYoung/Simple-ForeignObject) 是基于 SVG ForeignObject 的网页截图组件，部分实现参考了 `dom-to-image` [https://github.com/tsayen/dom-to-image](https://github.com/tsayen/dom-to-image)；

聊到网页截图大家首先就会想到目前比较流行的两个库：

- [html2canvas](https://github.com/niklasvh/html2canvas/)
- [dom-to-image](https://github.com/tsayen/dom-to-image)

`html2canvas`原理是先对页面进行解析，然后根据解析的结果绘制到 Canvas 中；这种方式由于只需要浏览器支持 Canvas 因此兼容性较好，可以满足大部分场景的要求；

但是由于是解析再绘制的实现方式，解析过程中的误差、CSS 和 Canvas 的渲染差异以及浏览器的支持程度都会导致截图的结果和网页中实际看起来有一些差异；当你对截图结果的相似度要求很高时 html2canvas 就有点差强人意了。

在其[官方网站](http://html2canvas.hertzen.com/documentation/)上也说明了这一点：

<img src="https://raw.githubusercontent.com/newbieYoung/NewbieWebArticles/master/images/simple-foreignobject-0.jpg">

而`dom-to-image`虽说在 Github 上 star 数很多，但是由于缺乏维护以及作者的一些实现并不合理，导致其问题很多；

耳听为虚，眼见为实！以下将给出一些简单的示例比较来进行说明。

<!-- more -->

## 示例比较

### 示例一

```css
.demo1 {
  font-size: 20px;
  color: #000;
  background-color: gray;
}
```

```html
<p class="demo1">demo1</p>
```

截图结果为：

<img src="https://raw.githubusercontent.com/newbieYoung/NewbieWebArticles/master/images/simple-foreignobject-1.jpg">

从结果中可以很明显的看出 dom-to-image 截图模糊，html2canvas 截图文字偏下，simple-foreignobject 的截图和浏览器渲染的 DOM 元素几乎一模一样。

### 示例二

```css
.demo2 {
  font-size: 20px;
  color: #000;
  background-color: pink;
  margin-top: 10px;
}
```

```html
<p class="demo2">demo2</p>
```

截图结果为：

<img src="https://raw.githubusercontent.com/newbieYoung/NewbieWebArticles/master/images/simple-foreignobject-2.jpg">

示例二只是在示例一的基础上增加了 `margin` ，html2canvas 依旧是同样的问题，但是 dom-to-image 除了模糊之外还出现了部分被裁切的问题，simple-foreignobject 正常。

### 示例三

```css
.demo3 {
  font-size: 20px;
  color: #000;
  background-color: lightblue;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
}
```

```html
<p class="demo3">demo3</p>
```

截图结果为：

<img src="https://raw.githubusercontent.com/newbieYoung/NewbieWebArticles/master/images/simple-foreignobject-3.jpg">

示例三采用绝对定位，dom-to-image 截图空白，html2canvas 还是老问题，simple-foreignobject 正常。

### 示例四

```css
.demo4 {
  font-size: 20px;
  background-image: -webkit-linear-gradient(top, blue, red);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 700;
  border: 1px solid #000;
  font-family: TTTGB-Medium;
}
```

```html
<p class="demo4">demo4</p>
```

截图结果为：

<img src="https://raw.githubusercontent.com/newbieYoung/NewbieWebArticles/master/images/simple-foreignobject-4.jpg">

示例四是字体结合文字渐变，dom-to-image 文字消失且渐变色变成了背景，html2canvas 虽然文字没有消失但是渐变色也变成了背景，simple-foreignobject 正常。

### 示例五

```css
.demo5 {
  font-size: 20px;
  color: blue;
  background-color: lightgreen;
}

.demo5-3 {
  filter: grayscale(1);
}

.demo5-2 {
  transform: scale(0.885);
}

.demo5-1 {
  opacity: 0.5;
}
```

```html
<div class="demo5-3">
  <div class="demo5-2">
    <div class="demo5-1">
      <p class="demo5">demo5</p>
    </div>
  </div>
</div>
```

截图结果为：

<img src="https://raw.githubusercontent.com/newbieYoung/NewbieWebArticles/master/images/simple-foreignobject-5.jpg">

示例五使用了一些特殊的属性，比如 opacity、transform、filter；这些属性特殊的地方在于`如果设置在父元素上虽然不会被子元素继承但是却会对子元素造成影响`，因此这个例子主要是为了测试当对子元素截图时是否考虑了父元素上的这些特殊属性的影响；从截图结果来看 dom-to-image 和 html2canvas 均未考虑，但是 simple-foreignobject 正常。

上述所有示例的完整代码在 [https://newbieyoung.github.io/Simple-ForeignObject/test/text.html](https://newbieyoung.github.io/Simple-ForeignObject/test/text.html)

## 兼容性

Simple-ForeignObject 的兼容性可以简单理解和 SVG ForeignObject 的兼容性一样；

<img src="https://raw.githubusercontent.com/newbieYoung/NewbieWebArticles/master/images/simple-foreignobject-6.jpg">

当然并不排除代码中的其它特性的影响，如果有问题欢迎大家提到 issue 里边。

## 安装和使用

```bash
npm install simple-foreignobjec
```

```javascript
var simpleFO = new SimpleForeignObject({
  devicePixelRatio: window.devicePixelRatio,
  ready: function() {
    var $demo = document.querySelector('#demo')
    simpleFO.toCanvas($demo, function(canvas) {})
  }
})
```

<table style="word-break: normal;">
	<tr>
		<td>参数</td>
		<td>说明</td>
	</tr>
	<tr>
		<td>devicePixelRatio</td>
		<td>设备像素比，如果不设置那么截图会比较模糊</td>
	</tr>
  <tr>
		<td>ready</td>
		<td>准备就绪回调函数，截图操作需要在此回调函数中执行</td>
	</tr>
  <tr>
		<td>toCanvas</td>
		<td>截图函数，会把指定的 DOM 元素绘制到 Canvas 中</td>
	</tr>
</table>
