/* global App wx */
//app.js
const sys = wx.getSystemInfoSync();
App({
  onLaunch: function () {
    wx.cloud.init({
      env: this.globalData.cloudEnv,
      traceUser: true
    })

    this.globalData.cloudDB = wx.cloud.database({
      env: this.globalData.cloudEnv
    });
  },
  globalData: {
    systemInfo: sys,
    cloudEnv: 'simplescreenshot-0tqah',
    cloudDB: null
  }
})