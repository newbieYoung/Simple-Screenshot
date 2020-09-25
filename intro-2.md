# SimpleScreenshot 前端“截屏”终极方案

## 背景

“截屏”是指把小程序或者 H5 页面转换成图片，从而方便用户转发或者分享。截屏分享相对于普通的结构化分享（链接分享）具有更丰富的视觉表现、更多的信息承载等优势，在很多项目中均有应用，举例来说：

![](https://newbieyoung.github.io/images/simple-screenshot-0.gif)![](https://newbieyoung.github.io/images/simple-screenshot-1.gif)

## 相关技术

目前流行的“截屏”实现方案按生成图片的方式可以分为客户端截屏和服务端截屏两种。

服务端截屏一般做法是使用 [Puppeteer](https://github.com/puppeteer/puppeteer) 或者其它 Headless 浏览器渲染页面生成图片，这种方式规避了目前繁多浏览器以及终端导致的前端兼容性问题，但是会消耗大量的服务器资源（启动 Headless 浏览器需要消耗系统资源，页面渲染需要加载外部资源），而且在弱网络环境中性能较低；另外如果采用由前端组织待渲染页面内容然后传输给服务器的方式，那么还可能存在一定的安全风险。

![](https://newbieyoung.github.io/images/simple-screenshot-2.jpg)

客户端截屏一般是使用客户端提供的图形 API （Canvas、SVG 等）重新绘制页面生成图片，这种方式不需要依赖服务器，资源消耗较少；但是使用客户端提供的图形 API 重新绘制页面，相当于重新实现浏览器的渲染过程，毫无疑问是比较复杂且麻烦的事情；因此当前的客户端截屏组件往往会选择仅支持部分 CSS 属性，从而降低复杂度同时尽可能避免目前繁多的浏览器和终端导致的兼容性问题。

### html2canvas

以目前最流行的 [html2canvas](https://github.com/niklasvh/html2canvas) 组件为例（截止到 2020 年 9 月，该库在 Github 上有 21.6k star），
其官网 [Features](https://html2canvas.hertzen.com/features) 上声明了目前并不支持的 CSS 属性如下：

![](https://newbieyoung.github.io/images/simple-screenshot-3.jpg)

然而当我们使用那些所谓已经支持的 CSS 属性时，html2canvas 的表现依然不容乐观。

- html2canvas 文字渲染存在偏移；

![](https://newbieyoung.github.io/images/simple-screenshot-4.jpg)

[文字渲染 DEMO](https://newbieyoung.github.io/Simple-Screenshot/examples/compare/compare1.html)

在上图中可以很明显的看到和原页面文字（图中第一个）相比 html2canvas 截屏后的文字（图中第三个被红框包裹）存在向下偏移。

- html2canvas 不支持文字渐变；

![](https://newbieyoung.github.io/images/simple-screenshot-5.jpg)

[文字渐变 DEMO](https://newbieyoung.github.io/Simple-Screenshot/examples/compare/compare5.html)

上图中第一个为原页面文字渐变效果，第三个被红框包裹的为 html2canvas 对页面渐变文字截屏后的效果。

- html2canvas 对部分 CSS 属性（transform、opacity、filter）的继承关系处理并不完善；

![](https://newbieyoung.github.io/images/simple-screenshot-6.jpg)

[属性继承 DEMO](https://newbieyoung.github.io/Simple-Screenshot/examples/compare/compare6.html)

页面中 p 元素 具有三个父元素，分别设置有 opacity、transform、filter 等属性，在这些父元素属性和 p 元素自身属性的共同作用下，最终渲染到页面效果如图中第一个所示；而 html2canvas 对 p 元素截屏后的效果为图中第三个，其效果仅仅考虑了 p 元素自身 CSS 属性的影响。

上面仅仅只是简单的举了一些例子，当我们真正去使用 html2canvas 时可能还会遇到更多坑点、更多的注意事项；可以说是 html2canvas 想要完全重新实现浏览器渲染过程这一思路所不能避免的问题；甚至随着 CSS 标准的更新而这种思路的组件跟不上进度，问题就会越来越多。

另外在小程序中有一套和浏览器类似的 Canvas API，但是一些不大的差异导致 html2canvas 并不能在小程序中使用；因此就有了小程序组件 [wxml-to-canvas](https://github.com/wechat-miniprogram/wxml-to-canvas)、[Painter](https://github.com/Kujiale-Mobile/Painter) 等；这些组件其实可以看成是弱化版 html2canvas 在小程序上的实现，支持的 CSS 属性更少，学习使用成本反而增加了不少。

### dom-to-image

那么客户端截屏有没有稍简单一点的思路呢？比如说要是浏览器提供 `html+css` 直接生成图片的方法就好了！

答案是有的！

首先得从 SVG 的命名空间开始说起：

```
<svg xmlns="http://www.w3.org/2000/svg"></svg>
```
