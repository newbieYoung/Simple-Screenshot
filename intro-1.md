# 基于 SVG 的小程序图片生成方案

前段时间开发 QQ 惠购小程序的过程产品提了一个生成图片并分享的功能，如下：

![QQ小程序示例](https://newbieyoung.github.io/images/simple-screenshot-1.gif)

目前小程序生成图片的一般做法是使用 Canvas 绘制，但是如果开发者直接使用小程序的 Canvas API 进行绘制则会有比较大的工作量；出于减少工作量的目的，Canvas 绘制方案组件都不约而同采用了类 CSS 语法配置的方式；比如微信小程序官方提供的扩展组件 [`wxml-to-canvas`](https://developers.weixin.qq.com/miniprogram/dev/extended/component-plus/wxml-to-canvas.html) 以及 Github 上标星 2.1k 的开源组件 [Painter](https://github.com/Kujiale-Mobile/Painter)。

就个人而言不管是 wxml-to-canvas 还是 Painter 支持的 CSS 属性还是太有限了，两个组件目前均只支持 20 余种，相对的 CSS 属性却多达上百种，另外 Painter 的配置语法并没有完全参照 CSS 语法，暂且不讨论这种做法的优劣，差异带来的学习和使用成本增加是肯定的。

基于以上原因在 QQ 惠购中我采用了另外的方案，该方案主要依赖于 SVG foreignobject 元素，支持全部 CSS 属性，所见即所得，学习、使用成本低，另外当客户端支持 SVG 渲染时可以不依赖后台服务。

项目地址如下：[SimpleScreenshot](https://git.code.oa.com/newyoungli/Simple-Screenshot)

具体使用以[微信小程序 DEMO](https://git.code.oa.com/newyoungli/Simple-Screenshot/tree/master/examples/wechat-app) 为例：

![微信小程序示例](https://newbieyoung.github.io/images/simple-screenshot-0.jpg)

首先正常开发小程序页面：

![](https://newbieyoung.github.io/images/simple-screenshot-4.jpg)

接着把小程序页面中需要生成图片的元素节点代码复制到 SimpleScreenshot 提供的[格式化工具](https://git.code.oa.com/newyoungli/Simple-Screenshot/blob/master/tools/format_xml.html)中进行格式化：

![](https://newbieyoung.github.io/images/simple-screenshot-5.jpg)

之所以需要进行这一步操作主要是因为小程序提供的 API 功能有限，通过选择器选取元素节点之后，没办法获得该元素节点的类型、子节点信息以及部分关键属性（比如 image 元素的 src 属性、内联文本等）；

![](https://newbieyoung.github.io/images/simple-screenshot-7.jpg)

为了解决上述问题，本技术方案提供了一个格式化工具，使用该工具可以对小程序页面代码进行解析，把生成图片所需要的相关信息提前设置到元素的自定义属性中，这样在运行代码生成图片时就可以直接获取了。

其中 `data-name` 表示元素类型，`data-level` 表示元素级别（ 0 表示根节点、0-0 表示根节点的第一个子节点、0-1 表示根节点的第二个子节点以此类推 ），`data-len` 表示当前元素的子元素数量（ 包含内联文本 ），`data-texts` 表示当前元素内联文本信息（ 小程序中并没有内联文本的概念 ）；最后为了一次性选取全部生成图片的元素节点，还需要对每个元素节点加入特定的 class 类名进行标注。

用格式化之后的代码替换原有代码，然后再在项目中引入组件代码，并传入相关参数进行初始化：

![](https://newbieyoung.github.io/images/simple-screenshot-6.jpg)

- devicePixelRatio 设备像素比；
- globalInlineFont 全局字体；
- error 错误回调；
- parseCSSFilter 自定义 CSS 解析过滤器；

上述初始化参数中需要注意自定义 CSS 解析过滤器 parseCSSFilter，在这个过滤器中可以对获取的元素节点的信息进行修改，以解决一些小程序的 BUG；比如在小程序中文本元素节点的实际渲染宽度往往会大于通过 API 获取的宽度，这时候就需要标识出这些元素，然后在生成 SVG 代码时不设置其宽度，防止文字显示不下从而换行。

初始化组件之后就可以执行组件的 `toSVG` 方法，该方法会选取页面中被标注的元素节点并获取其信息，最后生成 SVG 代码：

![](https://newbieyoung.github.io/images/simple-screenshot-8.jpg)

![](https://newbieyoung.github.io/images/simple-screenshot-9.jpg)

由于目前小程序的 Canvas 并不支持 SVG 渲染，因此通过 SVG 代码生成图片需要依赖后台服务，主要原理是借助 puppeteer 渲染 SVG，最后进行截屏生成图片。

![](https://newbieyoung.github.io/images/simple-screenshot-10.jpg)

以上即是使用 SimpleScreenshot 的主要流程了，在使用过程中如果有问题，欢迎大家提 [issues](https://git.code.oa.com/newyoungli/Simple-Screenshot/issues)。



































