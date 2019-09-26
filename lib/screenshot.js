//截图
function screenshot(selector) {
  var $demo = document.querySelector('.' + selector);

  //domtoimage
  domtoimage.toPng($demo)
    .then(function (png) {
      var $img = document.querySelector('#' + selector);
      $img.src = png;
    }).catch(function (error) {
      console.error('oops, something went wrong!', error);
    });

  //html2canvas
  html2canvas($demo, {
    dpi: window.devicePixelRatio, //设置设备像素比，防止模糊
    scrollX: window.scrollX, //设置 scrollX 和 scrollY 防止页面滚动之后出现错位的情况
    scrollY: window.screenY,
  }).then(function (canvas) {
    document.body.appendChild(canvas);
  });

  //simple-foreignobject
  simpleFO.toCanvas($demo, function (canvas) {
    var rect = $demo.getBoundingClientRect();
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    document.body.appendChild(canvas)
  });
}