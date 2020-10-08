# SimpleScreenshot 前后端混合式“截屏”方案

## 背景

“截屏”是指把小程序或者 H5 页面转换成图片，从而方便用户转发或者分享。截屏分享相对于普通的结构化分享（链接分享）具有更丰富的视觉表现、更多的信息承载等优势，在很多项目中均有应用，举例来说：

![](https://newbieyoung.github.io/images/simple-screenshot-0.gif)![](https://newbieyoung.github.io/images/simple-screenshot-1.gif)

## 相关技术

目前流行的“截屏”实现方案按生成图片的方式可以分为客户端截屏和服务端截屏两种。

服务端截屏一般做法是使用 [Puppeteer](https://github.com/puppeteer/puppeteer) 或者其它 Headless 浏览器渲染页面生成图片，这种方式规避了目前繁多浏览器以及终端导致的前端兼容性问题，但是会消耗大量的服务器资源（启动 Headless 浏览器需要消耗系统资源，页面渲染需要加载外部资源），而且在弱网络环境中性能较低；另外如果采用由前端组织待渲染页面内容然后传输给服务器的方式，那么还可能存在一定的安全风险。

![](https://newbieyoung.github.io/images/simple-screenshot-2.jpg)

客户端截屏一般是使用客户端提供的图形 API （Canvas、SVG 等）重新绘制页面生成图片，这种方式不需要依赖服务器，资源消耗较少；但是使用客户端提供的图形 API 重新绘制页面，相当于重新实现浏览器的渲染过程，毫无疑问是比较复杂且麻烦的事情；因此当前的客户端截屏组件往往会选择仅支持部分 CSS 属性，从而降低复杂度同时尽可能避免目前繁多的浏览器和终端导致的兼容性问题。

### html2canvas

以目前最流行的 [html2canvas](https://github.com/niklasvh/html2canvas) 组件为例（截止到 2020 年 9 月 在 Github 上有 21.6k star），
其官网 [Features](https://html2canvas.hertzen.com/features) 上声明了目前并不支持的 CSS 属性如下：

![](https://newbieyoung.github.io/images/simple-screenshot-3.jpg)

然而当我们使用那些所谓已经支持的 CSS 属性时，html2canvas 的表现依然不容乐观。

- html2canvas 文字渲染存在偏移；

![](https://newbieyoung.github.io/images/simple-screenshot-4.jpg)

[文字渲染 DEMO](https://newbieyoung.github.io/Simple-Screenshot/examples/compare/compare1.html)

在上图中可以很明显的看到和原页面文字（图中第一个）相比 html2canvas 截屏后的文字（图中第三个红框部分）存在向下偏移。

- html2canvas 不支持文字渐变；

![](https://newbieyoung.github.io/images/simple-screenshot-5.jpg)

[文字渐变 DEMO](https://newbieyoung.github.io/Simple-Screenshot/examples/compare/compare5.html)

上图中第一个为原页面文字渐变效果，第三个红框部分的为 html2canvas 对页面渐变文字截屏后的效果。

- html2canvas 对部分 CSS 属性（transform、opacity、filter）的继承关系处理并不完善；

![](https://newbieyoung.github.io/images/simple-screenshot-6.jpg)

[属性继承 DEMO](https://newbieyoung.github.io/Simple-Screenshot/examples/compare/compare6.html)

页面中 p 元素 具有三个父元素，分别设置有 opacity、transform、filter 等属性，在这些父元素属性和 p 元素自身属性的共同作用下，最终渲染到页面效果如图中第一个所示；而 html2canvas 对 p 元素截屏后的效果为图中第三个，其效果仅仅考虑了 p 元素自身 CSS 属性的影响。

上面仅仅只是简单的举了一些例子，当我们真正去使用 html2canvas 时可能还会遇到更多坑点；这也是 html2canvas 想要完全重新实现浏览器渲染过程这一思路很难避免的问题；甚至随着 CSS 标准的更新而这种思路的组件跟不上进度，问题就会越来越多。

另外在小程序中有一套和浏览器类似的 Canvas API，但是一些不大的差异导致 html2canvas 并不能在小程序中使用；因此就有了小程序组件 [wxml-to-canvas](https://github.com/wechat-miniprogram/wxml-to-canvas)、[Painter](https://github.com/Kujiale-Mobile/Painter) 等；这些组件其实可以看成是弱化版 html2canvas 在小程序上的实现，支持的 CSS 属性更少，学习使用的成本反而增加了不少。

### dom-to-image

那么客户端截屏有没有稍简单一点的思路呢？比如说要是浏览器提供 `html+css` 直接生成图片的方法就好了！

答案是有的！

在 SVG 的 `foreignobject` 元素中可以嵌入使用其它 XML 命名空间的元素，这也就意味着我们只需要指定其内部元素的命名空间为 `http://www.w3.org/1999/xhtml` 就可以在 SVG 中使用 html+css 了，举个简单例子：

```
<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'>
  <foreignObject width='100%' height='100%'>
    <div class='test' xmlns='http://www.w3.org/1999/xhtml' style='width:100px;height:100px;background-color:red;'>1😁1</div>
  </foreignObject>
</svg>
```

另外在浏览器中创建图片，然后指定其类型为 `svg+xml` 就可以直接通过 SVG 生成图片：

```
let svg = "";
svg += "<svg xmlns='http://www.w3.org/2000/svg' width='1' height='1'>";
svg += "<foreignObject width='100%' height='100%'>";
svg += "<div xmlns='http://www.w3.org/1999/xhtml' style='width:100%;height:100%;background-color:red;'></div>";
svg += "</foreignObject>";
svg += "</svg>"

let self = this;
let img = new Image();
img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
```

简单来说就是先把 html+css 转换为 SVG 然后再把 SVG 转换为图片，这样就间接的实现了通过 html+css 生成图片。

整个方案最大的工作量就在于如何把页面中待截屏元素转换到 SVG 的 foreignobject 元素中去；理论上来说只要是这个转换过程没有问题，然后客户端支持 foreignobject，那么最终的截屏效果肯定和原页面效果一模一样。

然而现实~~总是残酷的~~（有机可乘），就拿目前该方案的代表 [dom-to-image](https://github.com/tsayen/dom-to-image)（截止到 2020 年 9 月 在 Github 上有 6.5k star）组件来说，其转换过程存在很多问题；在上文中关于 html2canvas 问题说明的示例图中，也展示了 dom-to-image 截屏效果（最后一个蓝框部分）；表现出以下问题：

- 截屏效果模糊；
- 和 html2canvas 一样不支持文字渐变；
- 和 html2canvas 一样部分 CSS 属性的继承关系没有处理好；

更糟糕的是连 CSS 最基础的盒模型以及布局都有问题：

- dom-to-image 盒模型截屏异常；

![](https://newbieyoung.github.io/images/simple-screenshot-7.jpg)

[盒模型 DEMO](https://newbieyoung.github.io/Simple-Screenshot/examples/compare/compare3.html)

上图中第一个为原页面 margin 盒模型效果，第四个蓝框部分为 dom-to-image 对 margin 盒模型截屏后的效果，可以明显的看到截屏后的效果存在向下偏移。

- dom-to-image 布局截屏异常；

![](https://newbieyoung.github.io/images/simple-screenshot-8.jpg)

[布局 DEMO](https://newbieyoung.github.io/Simple-Screenshot/examples/compare/compare4.html)

上图中第四个为原页面绝对定位布局效果，第三个蓝框部分为 dom-to-image 对绝对定位布局截屏后的效果，可以明显的看到截屏后的效果存在空白异常的情况。

除了 dom-to-image 本身的实现问题以外，还存在一些方案本身的问题；比如 foreignobject 和 data:image/svg+xml 存在兼容性问题，某些情况下可能客户端并不支持这些特性（小程序以及部分浏览器）。

![](https://newbieyoung.github.io/images/simple-screenshot-9.jpg)

## SimpleScreenshot

[SimpleScreenshot](https://github.com/newbieYoung/Simple-Screenshot) 是一种`前后端混合式`的截屏方案，结合了前端截屏简单方便以及后端截屏稳定可靠的优点；具体流程如下：

![](https://newbieyoung.github.io/images/simple-screenshot-10.jpg)

项目核心代码包括两部分：

```
├── build                    // 打包构建代码
├── examples                 // 示例项目
│   ├── web
│   ├── qq-app
│   └── wechat-app
├── server                   // 截屏服务
├── tools                    // 辅助工具
│   └── format_xml.html
├── index-web.js             // Web SimpleScreenshot 代码
├── index-qq.js              // QQ 小程序 SimpleScreenshot 代码
└── index-wechat.js          // 微信小程序 SimpleScreenshot 代码
```

`server` 目录为截屏服务需要单独部署（支持 Docker 镜像部署），`build` 目录为打包构建后的客户端代码，在实际项目中使用时需要引入。

SimpleScreenshot 支持全部 CSS 属性，所见即所得，简单方便；开发人员只需要正常编写页面代码，然后进行简单的初始化即可：

```
let screenshot = new SimpleScreenshot({
  debug: isPub ? false : true, // 调试模式，组件代码中会执行 log 函数
  imgType: imgType, // 图片类型
  puppeteerServer: "https://dom2img.lione.me/simple-screenshot",// 截屏服务
  puppeteerGlobalFont: "PingFang", // 截屏服务全局字体
  devicePixelRatio: window.devicePixelRatio, // 设备像素比
  log: function (msg) {
    console.log(msg);
    console.log(msg.svg);
  },
  error: function (err) {
    console.log(err);
  },
});
```

> https://dom2img.lione.me/simple-screenshot 为部署在云服务器上的示例服务，请不要在生产环境中使用！！！

初始化完成之后，传入待截屏元素选择器执行组件的 `toIMG` 方法即可完成截屏：

```
screenshot.toIMG(".mps-content", function (img) {
  // img.base64
  // img.canvas
});
```

截屏完成在回调函数中可以获得截屏结果，客户端截屏可以获得 base64 图片以及 canvas 元素，但是服务端截屏仅仅能获得 base64 图片。

[Web 示例](https://demo.lione.me/simple-screenshot/test-1.html?pub)

![](https://newbieyoung.github.io/images/simple-screenshot-11.png)

另外 SimpleScreenShot 还支持小程序截屏，使用方式和 Web 基本类似，唯一的区别在于编写完小程序页面代码之后还需要把待截屏元素的代码复制到 SimpleScreenshot 提供的[格式化工具](https://newbieyoung.github.io/Simple-Screenshot//tools/format_xml.html)中进行格式化：

![](https://newbieyoung.github.io/images/simple-screenshot-12.png)

小程序截屏之所以需要进行这一步操作，主要是因为小程序提供的 API 功能有限，通过选择器选取元素节点之后，没有办法获得该元素节点的类型、子节点信息以及部分关键属性（比如 image 元素的 src 属性、内联文本等）；这会导致生成的 svg 代码缺失关键信息，最终得到的截屏图片异常。

为了解决上述问题，本技术方案提供了一个格式化工具，使用该工具可以对小程序页面代码进行解析，把生成 svg 代码所需要的相关信息提前设置到元素的自定义属性中，这样在运行代码时就可以直接获取了。

其中 `data-name` 表示元素类型，`data-level` 表示元素级别（ 0 表示根节点、0-0 表示根节点的第一个子节点、0-1 表示根节点的第二个子节点以此类推 ），`data-len` 表示当前元素的子元素数量（ 包含内联文本 ），`data-texts` 表示当前元素内联文本信息（ 小程序中并没有内联文本的概念 ）；最后为了一次性选取全部生成图片的元素节点，还需要对每个元素节点加入特定的 class 类名进行标注。

最后用格式化之后的代码替换原有代码即可。

小程序示例：

![](https://newbieyoung.github.io/images/simple-screenshot-11.png)
