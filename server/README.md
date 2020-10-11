# SimpleScreenshot Puppeteer Server

这是一个基于 [Koa](https://koa.bootcss.com/) 框架搭建的 [SimpleScreenshot](https://github.com/newbieYoung/Simple-Screenshot) [Puppeteer](https://github.com/puppeteer/puppeteer) 截屏服务。

## 目录

```
├── bin
│   └── www                  // 启动入口
├── public
│   ├── fonts                // 自定义字体
│   ├── javascripts
│   │   └── config.js        // 配置参数（cors 跨域）
│   └── stylesheets
└── routes
    └── screenshot.js        // 截屏服务源代码
```

## 常用操作

- 新增字体

![](https://newbieyoung.github.io/images/simple-screenshot-14.jpg)

在 `public/fonts` 目录中放入字体文件即可，比如 `NotoColorEmoji.ttf` 是 Google 开源的 Emoji 字体。

- 设置域名跨域

![](https://newbieyoung.github.io/images/simple-screenshot-15.jpg)

在 `config/config.js` 文件中把允许跨域访问的域名加入到 cors 数组中即可；当数组为空时表示所有域名均可访问。

## 部署

- 本地服务

```
docker image build -t newbieyoung/pup-shot-server:0.0.1 .
docker container run --rm -p 8000:3000 -it newbieyoung/pup-shot-server:0.0.1
```

- [Docker Hub](https://hub.docker.com/repository/docker/newbieyoung/pup-shot-server)

```
docker image push newbieyoung/pup-shot-server:0.0.1
```

- 远程示例服务

```
http://dom2img.lione.me/simple-screenshot
https://dom2img.lione.me/simple-screenshot
```

> 云服务配置较低，请勿用于生产环境。
