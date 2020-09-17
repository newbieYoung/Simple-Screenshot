/* global require __dirname module */
const Koa = require("koa");
const app = new Koa();
const views = require("koa-views");
const json = require("koa-json");
const onerror = require("koa-onerror");
const bodyparser = require("koa-bodyparser");
const logger = require("koa-logger");
const cors = require("koa2-cors");
const config = require("./config/config");

const index = require("./routes/index");
const users = require("./routes/users");
const screenshot = require("./routes/screenshot");

// error handler
onerror(app);

//跨域
app.use(
  cors({
    origin: function (ctx) {
      let reqOrigin = ctx.request.headers.origin;
      if(config.cors && config.cors.length > 0){
        if (config.cors.includes(reqOrigin)) {
          return reqOrigin;
        }else{
          return false; // 不允许跨域
        }
      }
      return '*'; //跨域列表为空，则表示所有域名均可跨域访问
    },
  })
);

// middlewares
app.use(
  bodyparser({
    enableTypes: ["json", "form", "text"],
  })
);
app.use(json());
app.use(logger());
app.use(require("koa-static")(__dirname + "/public"));

app.use(
  views(__dirname + "/views", {
    extension: "pug",
  })
);

// logger
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

// routes
app.use(index.routes(), index.allowedMethods());
app.use(users.routes(), users.allowedMethods());
app.use(screenshot.routes(), screenshot.allowedMethods());

// error-handling
app.on("error", (err, ctx) => {
  console.error("server error", err, ctx);
});

module.exports = app;