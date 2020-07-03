/* global App qq */
//app.js
const sys = qq.getSystemInfoSync();
App({
  onLaunch: function () {
    qq.cloud.init({
      env: this.globalData.cloudEnv,
      traceUser: true
    })

    this.globalData.cloudDB = qq.cloud.database({
      env: this.globalData.cloudEnv
    });
  },
  globalData: {
    systemInfo: sys,
    cloudEnv: 'env-tvsohgde',
    cloudDB: null
  }
})