/* global getApp Page require wx */
const app = getApp()
const sys = wx.getSystemInfoSync()
const SimpleScreenshot = require('../../libs/simple-screenshot.js');

const {
  log
} = require('../../utils/util.js');

Page({
  data: {},
  customData: {
    sssComponent: null,
    cloudFileId: null,
    localFilePath: null
  },
  onLoad: function () {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });

    this.customData.sssComponent = new SimpleScreenshot({
      parseCSSFilter: [function (node) {
        let level = node.dataset.level;
        let autoRenderWidthList = ['0-1-0-1-0-0', '0-1-0-1-2-0', '0-1-0-1-2-0-1', '0-1-0-1-2-1', '0-1-0-1-2-2', '0-1-1-1-2-0', '0-1-1-1-2-0-1', '0-1-1-1-2-1', '0-1-1-1-2-2', '0-1-2-1-2-0', '0-1-2-1-2-0-1', '0-1-2-1-1-0', '0-1-1-1-1-0'];
        if (autoRenderWidthList.includes(level)) {
          node._rules.autoRenderWidth = true;
        }
      }],
      devicePixelRatio: sys.pixelRatio,
      globalInlineFont: "@font-face{ font-family:'TTTGB'; src:url(data:application/x-font-ttf;charset=utf-8;base64,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); }",
      log: function (msg) {
        log('error', 'screenshot', 'client screenshot log', msg);
      },
      error: function (err) {
        log('error', 'test1', 'client screenshot error', err);
        wx.hideLoading();
        wx.showModal({
          content: '系统异常！',
          showCancel: false
        })
      },
    });

    let self = this;
    this.screenshot(function () {
      self.downCloudFile()
    });
  },
  screenshot: function (callback) {
    let self = this;
    if (!this.customData.localFilePath) {
      this.customData.sssComponent.toSVG('.screenshot', function (screenshot) {
        log('console', 'test1', 'client screenshot success', screenshot);
        wx.cloud.callFunction({ // 暂时不支持客户端生成图片，调用云函数在服务端生成
          name: 'simpleScreenshot',
          data: screenshot,
          success: function (res) {
            log('console', 'test1', 'server screenshot success', res);
            if (res.result && res.result.fileID) {
              self.customData.cloudFileId = res.result.fileID;
              callback();
            } else {
              wx.hideLoading();
              wx.showModal({
                content: '生成图片异常！',
                showCancel: false
              });
            }
          },
          fail: function (err) {
            log('console', 'test1', 'server screenshot fail', err);
            wx.hideLoading();
            wx.showModal({
              content: '生成图片异常！',
              showCancel: false
            });
          }
        });
      })
    }
  },
  downCloudFile: function () { //从云存储中下载云函数生成的图片
    let self = this;
    wx.cloud.downloadFile({
      fileID: this.customData.cloudFileId,
      success: function (tmp) {
        log('console', 'test1', 'downloadFile success', tmp)
        wx.hideLoading();
        self.customData.localFilePath = tmp.tempFilePath;
      },
      fail: function (err) {
        log('error', 'test1', 'downloadFile fail', err)
        wx.hideLoading();
        wx.showModal({
          content: '下载图片异常！',
          showCancel: false
        });
      }
    })
  },
  onShareAppMessage: function (res) {
    //console.log(res);
    return {
      title: "SimpleScreenshot DEMO",
      imageUrl: this.customData.localFilePath,
      success: function (res) {},
      fail: function (err) {},
    }
  },
  saveImg: function () {
    wx.showLoading({
      title: '加载中...',
      mask: true,
    })

    let self = this;
    wx.saveImageToPhotosAlbum({
      filePath: this.customData.localFilePath,
      success: function (res) {
        log('console', 'test1', 'saveImg success', res)
        wx.hideLoading();
        wx.showModal({
          content: '保存成功！',
          showCancel: false
        });
      },
      fail: function (err) {
        log('error', 'test1', 'saveImg fail', err)
        wx.hideLoading();
        wx.showModal({
          content: '保存图片异常，请重试！',
          showCancel: false
        });
      }
    })
  }
})