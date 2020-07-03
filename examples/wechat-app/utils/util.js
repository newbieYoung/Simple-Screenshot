/* global getApp wx module */
const app = getApp();

const formatNumber = (n) => {
  let num = n;
  num = num.toString();
  return num[1] ? num : `0${num}`;
};

const formatTime = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  const msecond = date.getTime() % 1000;

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')} ${msecond}`;
};

const log = function (type, page, msg, data) { //日志
  console.log(`--- ${type} ${page} ${msg} ---`);
  console.log(data);
  if (type == 'console') { //console 暂时不上报的云数据库
    return;
  }
  if (!app.globalData.cloudDB) {
    app.globalData.cloudDB = wx.cloud.database({
      env: app.globalData.cloudEnv
    });
  }
  let db = app.globalData.cloudDB;
  db.collection('log_' + type).add({
    data: {
      systemInfo: app.globalData.systemInfo,
      date: formatTime(new Date()),
      page: page,
      msg: msg,
      data: (data instanceof Error ? data.message : data),
    }
  })
}

module.exports = {
  formatTime: formatTime,
  log: log,
};