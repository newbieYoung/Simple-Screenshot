/* global App qq */
//app.js
const sys = qq.getSystemInfoSync();
App({
  onLaunch: function () {
  },
  globalData: {
    systemInfo: sys
  }
})