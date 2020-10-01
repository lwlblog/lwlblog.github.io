(function () {
  CanvasRenderingContext2D.prototype.draw = function (x, y, radius) {
    this.beginPath();
    this.arc(x, y, radius, 0, Math.PI * 2, false);
    this.closePath();
    this.fill();
  }
  class MathUtil extends Object {
    constructor() {
      super();
    }
    BezierEllipse2(ctx, x, y, a, b) {
      let k = .5522848,
        ox = a * k, // 水平控制点偏移量
        oy = b * k; // 垂直控制点偏移量
      ctx.beginPath();
      //左端点开始,顺时针
      ctx.moveTo(x - a, y);
      ctx.bezierCurveTo(x - a, y - oy, x - ox, y - b, x, y - b);
      ctx.bezierCurveTo(x + ox, y - b, x + a, y - oy, x + a, y);
      ctx.bezierCurveTo(x + a, y + oy, x + ox, y + b, x, y + b);
      ctx.bezierCurveTo(x - ox, y + b, x - a, y + oy, x - a, y);
      ctx.fill();
    }
    distance(obj, tag) {
      let dx = Math.pow(obj.x - tag.x, 2);
      let dy = Math.pow(obj.y - tag.y, 2);
      let d = Math.pow(obj.radius + tag.radius, 2);
      return dx + dy - d;
    }
    generateUUID() {
      let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
      let uuid = new Array(36);
      let rnd = 0,
        r;
      return function generateUUID() {
        for (let i = 0; i < 36; i++) {
          if (i === 8 || i === 13 || i === 18 || i === 23) {
            uuid[i] = '-';
          } else if (i === 14) {
            uuid[i] = '4';
          } else {
            if (rnd <= 0x02)
              rnd = 0x2000000 + (Math.random() * 0x1000000) | 0;
            r = rnd & 0xf;
            rnd = rnd >> 4;
            uuid[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r];
          }
        }
        return uuid.join('');
      }();
    }
  }
  class Color {
    constructor() {
      this.mode = "HSLA";
      this.hue = Math.floor(Math.random() * 354) + 1;
      this.saturation = Math.floor(50 + Math.random() * 50) + "%";
      this.lightness = Math.floor(30 + Math.random() * 20) + "%";
      this.alpha = "1";
    }
    get instance() {
      return "hsla(" + this.hue + "," + this.saturation + "," + this.lightness + "," + this.alpha + ")";
    }
    update() {
      this.hue += .2
    }
  }
  //global varibles
  var $bg = {
    canvas: document.getElementById("myCanvas"),
    context: document.getElementById("myCanvas").getContext("2d"),
    Math: new MathUtil(),
    config: {
      number: 10,
      speed: 10,
      lose: .8,
      size: 100
    }
  }
  $bg.Math.impactDetection = (obj) => {
    let border_top = 0,
      border_left = 0,
      border_right = $bg.canvas.width,
      border_bottom = $bg.canvas.height;
    let reduce = - $bg.config.lose
    for (let i = 0; i < $bg.asteroids.length; i++) {
      let tag = $bg.asteroids[i];
      if (tag.name == obj.name)
        continue;
      let dx = Math.pow(obj.x - tag.x, 2);
      let dy = Math.pow(obj.y - tag.y, 2);
      let d = Math.pow(obj.radius + tag.radius, 2);
      if ($bg.Math.distance(obj, tag) <= 0.1) {
        obj.vX = obj.vX * reduce;
        obj.vY = obj.vY * reduce;
        if (obj.x - tag.x > 0) {
          obj.x = Math.abs(Math.sqrt(d - dy) + tag.x) + 2;
        } else {
          obj.x = tag.x - Math.abs(Math.sqrt(d - dy)) - 2;
        }
        tag.vX = tag.vX * reduce;
        tag.vY = tag.vY * reduce;
      }
    }
    //============================================
    //上下
    let totop = (obj.y - obj.radius),
      tobottom = (obj.y + obj.radius);
    if (totop < border_top) {
      obj.y = obj.radius;
      obj.vY = obj.vY * reduce;
    } else if (tobottom > border_bottom) {
      obj.y = border_bottom - obj.radius;
      obj.vY = obj.vY * reduce;
    }
    //左右
    let toleft = (obj.x - obj.radius),
      toright = (obj.x + obj.radius);
    if (toleft < border_left) {
      obj.x = obj.radius;
      obj.vX = obj.vX * reduce;
    } else if (toright > border_right) {
      obj.x = border_right - obj.radius;
      obj.vX = obj.vX * reduce;
    }
  }
  $bg.bubble = class {
    constructor(x, y, radius, vX, vY) {
      this.name = $bg.Math.generateUUID();
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.vX = vX;
      this.vY = vY;
      this.color = new Color();
    }
  }
  $bg.draw = function (x, y, r, context, color) {
    //外切球体
    context.save();
    grident = context.createRadialGradient(x, y, r, x, y, r - 30);
    grident.addColorStop(0, color.instance);
    //此颜色和背景颜色相同
    grident.addColorStop(1, "rgba(4,78,140,0)");
    context.fillStyle = grident;
    context.strokeStyle = "#ffffff"
    context.shadowBlur = 0;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
    context.shadowColor = "#f79be7";
    context.globalCompositeOperation = "destination-over";
    context.draw(x, y, r - 5)
    context.restore();
  }
  $bg.loop = function () {
    $bg.clear.call();
    let asteroidsLength = $bg.asteroids.length;
    for (let i = 0; i < asteroidsLength; i++) {
      let tmpAsteroid = $bg.asteroids[i];
      tmpAsteroid.x += tmpAsteroid.vX;
      tmpAsteroid.y += tmpAsteroid.vY;
      tmpAsteroid.color.update();
      $bg.draw(tmpAsteroid.x, tmpAsteroid.y, tmpAsteroid.radius, $bg.context, tmpAsteroid.color)
      $bg.Math.impactDetection(tmpAsteroid)
    };
    requestAnimationFrame(arguments.callee);
  }
  $bg.init = function (param) {
    $bg.resize.call($bg, null).configure(param);
    $bg.asteroids = new Array();
    for (let i = 0; i < $bg.config.number; i++) {
      const radius = $bg.config.size
      let x = Math.random() * ($bg.canvas.width - 2 * radius) + radius;
      let y = Math.random() * ($bg.canvas.height - 2 * radius) + radius;
      let vX = (Math.random() * 2 - 1) * $bg.config.speed;
      let vY = (Math.random() * 2 - 1) * $bg.config.speed;
      $bg.asteroids.push(new $bg.bubble(x, y, radius, vX, vY));
      $bg.loop.call()
    };
  }
  $bg.clear = function () {
    $bg.context.clearRect(0, 0, $bg.canvas.width, $bg.canvas.height);
  }
  $bg.resize = function () {
    $bg.canvas.width = window.innerWidth;
    $bg.canvas.height = window.innerHeight;
    return this
  }
  $bg.configure = function (...para) {
    return (function () {
      $bg.config = Object.assign($bg.config, para[0]);
    })()
  }
  window.onresize = $bg.resize
  window.$bg = $bg;
}())