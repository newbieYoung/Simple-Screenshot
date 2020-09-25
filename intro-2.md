# SimpleScreenshot 前端“截屏”方案

“截屏”是指把小程序或者 H5 页面转换成图片，从而方便用户转发或者分享。截屏分享相对于普通的结构化分享（链接分享）具有更丰富的视觉表现、更多的信息承载等优势，在很多项目中均有应用，举例来说：

![](https://newbieyoung.github.io/images/simple-screenshot-0.gif)![](https://newbieyoung.github.io/images/simple-screenshot-1.gif)

目前流行的“截屏”实现方案按生成图片的方式可以分为客户端截屏和服务端截屏两种。

服务端截屏一般做法是使用 [Puppeteer](https://github.com/puppeteer/puppeteer) 或者其它 Headless 浏览器渲染页面生成图片，这种方式规避了目前繁多浏览器以及终端导致的前端兼容性问题，但是会消耗大量的服务器资源（启动 Headless 浏览器需要消耗系统资源，页面渲染需要加载外部资源），而且在弱网络环境中性能较低；另外如果采用
由前端组织待渲染页面内容然后传输给服务器的方式，那么还可能存在一定的安全风险。

![](https://newbieyoung.github.io/images/simple-screenshot-2.jpg)

客户端截屏一般是使用客户端提供的图形 API （Canvas、SVG 等）重新绘制页面生成图片，这种方式不需要依赖服务器，资源消耗较少；但是使用客户端提供的图形 API 重新绘制页面，相当于重新实现浏览器的渲染过程，毫无疑问是比较复杂且麻烦的事情；因此当前的客户端截屏组件往往会选择仅支持部分 CSS 属性，从而降低复杂度同时尽可能避免目前繁多的浏览器和终端导致的兼容性问题。

以目前最流行的 [html2canvas](https://github.com/niklasvh/html2canvas) 组件为例（截止到 2020 年 9 月，该库在 Github 上有 21.6k star），
其官网 [Features](https://html2canvas.hertzen.com/features) 上声明了目前并不支持的 CSS 属性如下：

![](https://newbieyoung.github.io/images/simple-screenshot-3.jpg)

然而当我们使用那些所谓已经支持的 CSS 属性时，html2canvas 的表现依然不容乐观。

- 页面中的普通文字，html2canvas 截屏后存在偏移；

![](https://newbieyoung.github.io/images/simple-screenshot-4.jpg)

上图中第一个为页面渲染效果，第三个被红框包裹的为 html2canvas 对元素截屏后的效果。

- html2canvas 不支持文字渐变；

![](https://newbieyoung.github.io/images/simple-screenshot-5.jpg)

上图中第一个为页面渲染效果，第三个被红框包裹的为 html2canvas 对元素截屏后的效果。

- html2canvas 对部分 CSS 属性（transform、opacity、filter）的继承关系处理并不完善；

![](https://newbieyoung.github.io/images/simple-screenshot-5.jpg)

上图中第一个为页面渲染效果，第三个被红框包裹的为 html2canvas 对元素截屏后的效果。
