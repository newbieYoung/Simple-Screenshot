/* global App wx */
//app.js
const sys = wx.getSystemInfoSync();
App({
  onLaunch: function () {
  },
  globalData: {
    systemInfo: sys
  }
})