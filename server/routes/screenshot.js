/* eslint-disable no-unused-vars */
/* global require __dirname module Buffer */
const router = require("koa-router")();
const mime = require("mime-types");
const puppeteer = require("puppeteer");
const Fontmin = require("fontmin");
const fs = require("fs");
const path = require('path');
const gm = require("gm").subClass({
  imageMagick: true,
});

router.prefix("/simple-screenshot");

router.post("/", async (ctx, next) => {
  let event = ctx.request.body;
  if (typeof event == "string") {
    event = JSON.parse(event);
  }
  let name = "simple_screenshot_" + new Date().getTime();

  console.log("MB : " + getBase64ByteSize(event.svg)); //svg size
  let server_timestamps = [];
  server_timestamps.push(new Date().getTime()); //start

  let svgCode = await setFontList(event.fonts, event.svg, event.globalFont);
  server_timestamps.push(new Date().getTime() - server_timestamps[0]); //fontmin

  //puppeteer
  const browser = await puppeteer.launch({
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();
  await page.setViewport({
    width: parseInt(event.distWidth),
    height: parseInt(event.distHeight),
    deviceScaleFactor: 1,
  });
  server_timestamps.push(new Date().getTime() - server_timestamps[0]); //init puppeteer

  await page.evaluate(function (svgCode) {
    let body = document.querySelector("body"); // init body style
    body.style.backgroundColor = "#f4f4f4";
    body.style.padding = "0";
    body.style.margin = "0";
    let img = new Image();
    img.style.width = "100%;"; //完全填满
    img.style.height = "100%";
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgCode);
    body.appendChild(img);
  }, svgCode);
  server_timestamps.push(new Date().getTime() - server_timestamps[0]); //render svg

  let sParams = {
    type: event.imgType,
    encoding: "base64"
  }
  if(event.imgType != 'png'){ // options.quality is unsupported for the png screenshots
    sParams.quality = event.imgQuality;
  }
  const screenshotBase64 = await page.screenshot(sParams);
  await browser.close();
  server_timestamps.push(new Date().getTime() - server_timestamps[0]); //screenshot

  console.log(server_timestamps);

  //返回
  ctx.body = `data:image/${event.imgType};base64,${screenshotBase64}`;
});

const getBase64ByteSize = function (base64) { //计算 base64 大小
  let buffer = Buffer.from(base64.substring(base64.indexOf(",") + 1));
  return buffer.length / 1e6;
};

const setFontList = async function (fonts, svgCode, globalFont) { //设置内联字体
  let pArray = [];
  for (let i = 0; i < fonts.length; i++) {
    let font = fonts[i];
    let textsFont = getTextsFont(font.texts, font.name);
    if (textsFont) {
      (function (textsFont) {
        let promise = new Promise((resolve, reject) => {
          //fontmin promise
          textsFont.fontmin.run((error, files) => {
            if (error) {
              return reject(error);
            }
            return resolve({
              font: textsFont.font,
              contents: files[0].contents,
            });
          });
        });
        pArray.push(promise);
      })(textsFont);
    }
  }
  let cssCode = "";
  let inlineFonts = await Promise.all(pArray);
  for (let i = 0; i < inlineFonts.length; i++) {
    let name = inlineFonts[i].font;
    let buffer = inlineFonts[i].contents;
    let base64 = buffer.toString("base64");
    cssCode +=
      "@font-face{ font-family:'" +
      name +
      "'; src:url(data:application/x-font-ttf;charset=utf-8;base64," +
      base64 +
      ");}";
  }
  //console.log(cssCode);

  let gFont = "";
  if (globalFont) {
    gFont = "#simple-screenshot,#simple-screenshot *:not(style){"
    gFont += " font-family: " + globalFont;
    gFont += "}"
  }
  let index = svgCode.indexOf("</style>");
  svgCode = svgCode.substring(0, index) + cssCode + gFont + svgCode.substring(index, svgCode.length);
  return svgCode;
};

const getTextsFont = function (texts, font) { //精简字体
  let fontFilePath = path.join(__dirname, "../", `/public/fonts/${font}.ttf`);
  if (fs.existsSync(fontFilePath)) {
    //字体文件存在
    const fontmin = new Fontmin().src(fontFilePath).use(
      Fontmin.glyph({
        text: texts,
      })
    );
    return {
      font: font,
      fontmin: fontmin,
    };
  }
  return null;
};

const compressImage = function (imgPath, imgQuality) { //压缩图片
  return new Promise((resolve, reject) => {
    gm(imgPath).quality(imgQuality).write(imgPath, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    })
  });
}

module.exports = router;