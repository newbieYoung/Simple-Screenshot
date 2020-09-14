/* global getApp Page require qq */
const app = getApp()
const sys = qq.getSystemInfoSync()
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
      puppeteerServer: 'https://ue.qzone.qq.com/tool/dom2img/simple-screenshot', // docker puppeteer 截屏服务
      puppeteerGlobalFont: "PingFang", // puppeteer 截屏服务全局字体
      forceScreenshotType: "server", //强制使用 puppeteer 截屏服务
      imgType: this.customData.imgType,
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
      devicePixelRatio: sys.pixelRatio,
      log: function (msg) {
        console.log(msg);
      },
      error: function (err) {
        console.log(err);
      },
    });
  },
  saveImg: function () {
    let self = this;
    if(this.customData.localFilePath){
      qq.saveImageToPhotosAlbum({
        filePath: this.customData.localFilePath,
        success: ()=>{
          qq.showToast({
            title: '保存成功'
          })
        },
        fail: (err)=>{
          console.log(err);
        }
      })
    }else{
      let timestamp = [];
      timestamp.push(new Date().getTime());
      this.customData.sssComponent.toIMG('.screenshot', function (data) {
        timestamp.push(new Date().getTime());
        console.log(timestamp[1] - timestamp[0]);
        self.saveBase64ToPhotosAlbum(data);
      })
    }
  },
  saveBase64ToPhotosAlbum: function(base64){
    let self = this;
    let fsm = qq.getFileSystemManager();
    let fName = `simplescreenshot-${new Date().getTime()}`;
    let fPath = `${qq.env.USER_DATA_PATH}/${fName}.${this.customData.imgType}`;
    let tag = ';base64,';
    let index = base64.indexOf(tag);
    let data = base64.substring(index+tag.length, base64.length);
    fsm.writeFile({
      filePath: fPath,
      data: data,
      encoding:'base64',
      success: (res)=>{
        self.customData.localFilePath = fPath;
        qq.saveImageToPhotosAlbum({
          filePath: fPath,
          success: ()=>{
            qq.showToast({
              title: '保存成功'
            })
          },
          fail: (err)=>{
            console.log(err);
          }
        })
      },
      fail: (err)=>{
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