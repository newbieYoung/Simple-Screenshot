/* global getApp Page require wx */
const app = getApp()
const sys = wx.getSystemInfoSync()
const SimpleScreenshot = require('../../libs/simple-screenshot.js');

Page({
  data: {},
  customData: {
    sssComponent: null,
    localFilePath: null,
    imgType: 'jpeg' // png jpeg
  },
  onLoad: function () {
    this.customData.sssComponent = new SimpleScreenshot({
      debug: true, // 调试模式，组件代码中会执行 log 函数
      puppeteerServer: 'https://dom2img.lione.me/simple-screenshot', // docker puppeteer 截屏服务
      puppeteerGlobalFont: "PingFang", // puppeteer 截屏服务全局字体
      forceScreenshotType: "server", //小程序目前并不支持渲染 svg foreignobject，因此强制使用 puppeteer 截屏服务
      imgType: this.customData.imgType, // 图片类型
      parseCSSFilter: [
        function (node) {
          let level = node.dataset.level;
          let autoRenderWidthList = [
            "0-1-0-1-0-0",
            "0-1-0-1-2-0",
            "0-1-0-1-2-0-1",
            "0-1-1-1-2-0",
            "0-1-1-1-2-0-1",
            "0-1-2-1-2-0",
            "0-1-2-1-2-0-1",
            "0-1-2-1-1-0",
            "0-1-2-1-2-1",
            "0-1-1-1-1-0",
            "0-1-1-1-0-0",
            "0-1-2-1-0-0",
          ];
          if (autoRenderWidthList.includes(level)) {
            node._rules.autoRenderWidth = true;
          }
        },
      ],
      devicePixelRatio: sys.pixelRatio, // 设备像素比
      log: function (msg) {
        console.log(msg);
      },
      error: function (err) {
        wx.hideLoading();
        console.log(err);
      },
    });
  },
  saveImg: function () {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    let self = this;
    if(this.customData.localFilePath){
      self.saveImageToPhotosAlbum(this.customData.localFilePath);
    }else{
      let timestamp = [];
      timestamp.push(new Date().getTime());
      this.customData.sssComponent.toIMG('.screenshot', function (img) {
        timestamp.push(new Date().getTime());
        console.log(timestamp[1] - timestamp[0]);
        self.saveBase64ToFile(img.base64);
      })
    }
  },
  saveImageToPhotosAlbum: function(fPath){
    wx.saveImageToPhotosAlbum({
      filePath: fPath,
      success: ()=>{
        wx.hideLoading(); // wx.showLoading 和 wx.showToast 同时只能显示一个
        wx.showToast({
          icon: 'none',
          title: '保存成功'
        })
      },
      fail: (err)=>{
        console.log(err);
        wx.hideLoading();
        wx.showToast({
          icon: 'none',
          title: '保存失败'
        })
      }
    })
  },
  saveBase64ToFile: function(base64){
    let self = this;
    let fsm = wx.getFileSystemManager();
    let fName = `simplescreenshot-${new Date().getTime()}`;
    let fPath = `${wx.env.USER_DATA_PATH}/${fName}.${this.customData.imgType}`;
    let tag = ';base64,';
    let index = base64.indexOf(tag);
    let data = base64.substring(index+tag.length, base64.length);
    fsm.writeFile({
      filePath: fPath,
      data: data,
      encoding:'base64',
      success: (res)=>{
        self.customData.localFilePath = fPath;
        self.saveImageToPhotosAlbum(fPath);
      },
      fail: (err)=>{
        wx.hideLoading();
        console.log(err);
      }
    })
  },
  onShareAppMessage: function (res) {
    return {
      shareType: "picture",
      imageUrl: this.customData.localFilePath
    }
  }
})