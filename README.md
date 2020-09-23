# SimpleScreenshot

基于 [foreignObject](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/foreignObject) 和 [puppeteer](https://github.com/puppeteer/puppeteer) 的小程序、H5 截屏组件。

## 特性及优势

- 支持全部 CSS 属性；
- 所见即所得，简单方便；
- 支持客户端、服务器两种渲染方式，成本低，兼容性高。

## 示例

### 微信小程序示例

### QQ 小程序示例

## 目录

```
├── examples                 // 示例项目
│   ├── qq-app
│   └── wechat-app
├── tools                    // 辅助工具
│   └── format_xml.html
├── index-qq.js              // QQ 小程序 SimpleScreenshot 代码
└── index-wechat.js          // 微信小程序 SimpleScreenshot 代码
```

## 教程

## 应用

<table style="word-break: normal;">
  <tr>
    <td>名称</td>
    <td>类型</td>
    <td>小程序码</td>
  </tr>
</table>

## 兼容性自测

<table style="word-break: normal;">
  <tr>
    <td>浏览器</td>
    <td>版本</td>
  </tr>
  <tr>
    <td>Chrome</td>
    <td>84</td>
  </tr>
  <tr>
    <td>QQ浏览器</td>
    <td>8.9.3</td>
  </tr>
</table>

## TodoList

<table style="word-break: normal;">
  <tr>
    <td>类型</td>
    <td>描述</td>
    <td>状态</td>
  </tr>
  <tr>
    <td>bug</td>
    <td>【Web、QQ、Wechat】CSS 属性 默认继承和默认不继承</td>
    <td></td>
  </tr>
  <tr>
    <td>bug</td>
    <td>【Web】QQ 浏览器中元素不存在伪类，但是 getComputedStyle 获取其伪类时 content 不为 none，导致伪类判断异常 </td>
    <td></td>
  </tr>
  <tr>
    <td>bug</td>
    <td>【Web、QQ、Wechat】拼接 xml 时如果文本节点中存在条件分割符 & 应该写成 &amp; 否则会报错 EntityRef: expecting ';'</td>
    <td>fixed</td>
  </tr>
  <tr>
    <td>feature</td>
    <td>【Web】分析 document.styleSheets 筛选出那些未设置固定宽度的元素，自动应用 autoRenderWidth 规则，从而避免在初始化时通过参数设置该规则，降低使用门槛</td>
    <td>done</td>
  </tr>
</table>
