# SimpleScreenshot Puppeteer Server

这是一个基于 [Koa](https://koa.bootcss.com/) 框架搭建的 SimpleScreenshot [Puppeteer](https://github.com/puppeteer/puppeteer) 截屏服务。

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

## 部署

- 本地服务

```
docker image build -t pup-shot-server .
docker container run --rm -p 8000:3000 -it pup-shot-server
```

- 远程示例服务

```
http://dom2img.lione.me/simple-screenshot
https://dom2img.lione.me/simple-screenshot
```
