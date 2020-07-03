/* global require exports Buffer */
const cloud = require('qq-server-sdk')
const puppeteer = require('puppeteer');
const Fontmin = require('fontmin');
const gm = require('gm').subClass({
  imageMagick: true
});
const fs = require('fs');

cloud.init({
	env: cloud.DYNAMIC_CURRENT_ENV
})

const compressImage = function (imgPath) {//压缩图片
  return new Promise((resolve, reject) => {
    gm(imgPath).quality(80).write(imgPath, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    })
  });
}

const getTextsFont = function (texts, font) {//精简字体
  let fontFilePath = './fonts/'+font+'.ttf';
  if(fs.existsSync(fontFilePath)){ //字体文件存在
    const fontmin = new Fontmin().src(fontFilePath).use(Fontmin.glyph({
      text: texts
    }))

    return {
      font: font,
      fontmin: fontmin
    }
  }

  return null;
}

const setFontList = async function(fonts, svgCode){//设置内联字体
  let pArray = [];
  for(let i=0;i<fonts.length;i++){
    let font = fonts[i];
    let textsFont = getTextsFont(font.texts, font.name);
    if(textsFont){
      (function(textsFont){
        let promise = new Promise((resolve, reject) => {//fontmin promise
          textsFont.fontmin.run((error, files) => {
            if (error) {
              return reject(error);
            }
            return resolve({
              font: textsFont.font,
              contents: files[0].contents
            })
          });
        });
        pArray.push(promise);
      })(textsFont)
    }
  }

  let cssCode = "";
  let inlineFonts = await Promise.all(pArray)

  for(let i=0;i<inlineFonts.length;i++){
    let name = inlineFonts[i].font;
    let buffer = inlineFonts[i].contents;
    let base64 = buffer.toString('base64');
    cssCode += "@font-face{ font-family:'"+name+"'; src:url(data:application/x-font-ttf;charset=utf-8;base64,"+base64+");}";
  }

  //console.log(cssCode);
  let index = svgCode.indexOf("</style>");
  svgCode = svgCode.substring(0,index)+cssCode+svgCode.substring(index,svgCode.length);

  return svgCode;
}

const getBase64ByteSize = function (base64) {
  let buffer = Buffer.from(base64.substring(base64.indexOf(',') + 1));
  return buffer.length / 1e+6;
}

// 云函数入口函数
exports.main = async (event, context) => {
  let name = 'simple_screenshot_' + new Date().getTime();
  let imgPath = '/tmp/' + name + '.jpg';
  let imgWidth = event.imgWidth || 800;//图片宽度

  console.log(name);
  console.log('MB : ' + getBase64ByteSize(event.svg)); //svg size
  let server_timestamps = [];
  server_timestamps.push(new Date().getTime()); //start

  let svgCode = await setFontList(event.fonts, event.svg);
  server_timestamps.push(new Date().getTime() - server_timestamps[0]); //fontmin

  //puppeteer
  const browser = await puppeteer.launch({
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({
    width: imgWidth,
    height: parseInt(imgWidth / event.width * event.height),
    deviceScaleFactor: 1,
  });
  server_timestamps.push(new Date().getTime() - server_timestamps[0]); //init puppeteer

  await page.evaluate(function (svgCode) {
    let body = document.querySelector('body'); // init body style
    body.style.backgroundColor = '#f4f4f4';
    body.style.padding = '0';
    body.style.margin = '0';
    let img = new Image();
    img.style.width = '100%;' //完全填满
    img.style.height = '100%';
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgCode);
    body.appendChild(img);
  }, svgCode);
  server_timestamps.push(new Date().getTime() - server_timestamps[0]); //render svg

  await page.screenshot({
    path: imgPath
  });
  await browser.close();
  server_timestamps.push(new Date().getTime() - server_timestamps[0]); //screenshot

  await compressImage(imgPath); //压缩图片
  server_timestamps.push(new Date().getTime() - server_timestamps[0]); //compress img

  //上传云存储
  let stream = fs.createReadStream(imgPath)
  let png = await cloud.uploadFile({
    cloudPath: name + '.jpg',
    fileContent: stream,
  })

  server_timestamps.push(new Date().getTime() - server_timestamps[0]); //upload img
  console.log(server_timestamps);

  return png;
}