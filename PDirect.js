function PDirect(par) {
  var Xmid = par.Xmid,
    Ymid = par.Ymid,
    DX = par.DX,
    par1 = par.par1,
    par2 = par.par2,
    maxIterations = par.maxIt,
    maxCol = par.maxCol,
    max = par.maxZ2,
    labels = par.labels,
    square = par.square;
  const precision = 6;
  var rTouch,
    xOffs,
    yOffs,
    drag = 0,
    Xnew,
    Ynew,
    scale;
  if (!max) max = 4;

  var henonJ = function (a, b, Xo, Yo) {
    var b2 = (1 - b) * 0.5,
      Xs,
      Ys;
    if (a < 0) Xs = 0;
    else if (Xo > 0) Xs = -b2 + Math.sqrt(b2 * b2 + a) + 0.000000001;
    else Xs = -b2 - Math.sqrt(b2 * b2 + a) + 0.000000001;
    Ys = Xs;
    var X = a - Xs * Xs + b * Ys,
      xSquared = X * X,
      X1,
      Y = Ys,
      n = 0;
    do {
      X1 = a - xSquared + b * Y;
      Y = X;
      X = X1;
      xSquared = X * X;
      n++;
    } while (xSquared < 1000 && n < maxIterations);
    if (n < maxIterations) return maxCol + 1;
    Xo = X;
    Yo = Y;
    n = -1;
    do {
      X1 = a - X * X + b * Y;
      Y = X;
      X = X1;
      n++;
    } while (Math.abs(X - Xo) + Math.abs(Y - Yo) > 0.00000001 && n < 64);
    if (n === 64) return maxCol;
    return -n;
  };

  var div = document.getElementById(par.divId);
  var canvas = document.createElement("canvas");
  canvas.id = 'canvas'
  canvas.addEventListener("mouseup", ev_mouseup, false);
  canvas.addEventListener("touchstart", startTouch, false);
  canvas.addEventListener("touchmove", continueTouch, false);
  canvas.addEventListener("touchend", stopTouch, false);

  var width = (canvas.width = Math.round(window.innerWidth * par.scX));
  var height = (canvas.height = Math.round(window.innerWidth * par.scY));
  div.appendChild(canvas);
  var ctx = canvas.getContext("2d");
  var txt = document.createElement("div");
  div.appendChild(txt);
  ctx.lineWidth = 2;
  setFontHeight();

  var cnv = document.createElement("canvas");
  cnv.id = 'canvas-cnv'
  cnv.width = width;
  cnv.height = height;
  var img = cnv.getContext("2d");
  var imgd = ctx.createImageData(width, height);
  var imgArr = imgd.data;
  var img32 = new Uint32Array(imgArr.buffer);

  var M = maxCol / 3,
    M2 = 2 * M,
    M4 = M * M * M * M;
  maxCol = 3 * M; // maxCol is 3*int
  var cm = new Uint32Array(maxCol + 2);
  var cmb = new Uint8Array(cm.buffer);
  for (var i = 0; i < M2; i++) {
    // set Color Map
    var dum = M - i;
    dum *= dum;
    dum *= dum;
    cmb[4 * ((i + M2) % maxCol)] = cmb[4 * i + 1] = cmb[
      4 * ((i + M) % maxCol) + 2
    ] = 255 - (255 * dum) / M4;
  }
  for (var i = 3; i < cmb.length; i += 4) cmb[i] = 255;
  cmb[4 * maxCol] = cmb[4 * maxCol + 1] = cmb[4 * maxCol + 2] = 0;
  cmb[4 * maxCol + 3] = 255;
  cmb[4 * maxCol + 4] = cmb[4 * maxCol + 5] = cmb[4 * maxCol + 6] = 200;
  cmb[4 * maxCol + 7] = 255;
  paint();

  function paint() {
    txt.innerHTML = "wait";
    var time = new Date().getTime();
    var Step = DX / width,
      pix = 0;
    for (var iy = 0, Y = Ymid + (Step * height) / 2; iy < height; iy++, Y -= Step)
      for (var ix = 0, X = Xmid - (Step * width) / 2; ix < width; ix++, X += Step) {
        var t = henonJ(X, Y, par1, par2);
        if (t < 0) t = -t % maxCol;
        img32[pix++] = cm[t];
      }
    img.putImageData(imgd, 0, 0);
    ctx.drawImage(cnv, 0, 0);

    time = new Date().getTime() - time;
    txt.innerHTML =
      "Centre point: a=" + form(Xmid) + ", b=" + form(Ymid) + "; zoom factor " + form(DX) + "; Time to render " + time + "ms";

    ctx.font = " " + Math.round(0.5 * txt.clientHeight) + "pt sans-serif";
    ctx.textBaseline = "ideographic";
    ctx.fillStyle = "white";
    var StZ = DX / width;
    if (labels) {
      for (var label of labels) {
        var shouldShow = !label.dx || (label.dx < 0 && DX >= Math.abs(label.dx)) || (label.dx > 0 && DX <= label.dx)
        if (shouldShow) {
          ctx.fillText(
              label.label,
              width / 2 + (label.a - Xmid) / StZ,
              height / 2 + (Ymid - label.b) / StZ
          );
        }
      }
    }
    if (square) {
      ctx.strokeStyle = "white";
      var sqr = square[2] / StZ,
        x = (width - sqr) / 2 + (square[0] - Xmid) / StZ,
        y = (height - sqr) / 2 + (Ymid - square[1]) / StZ;
      ctx.strokeRect(x, y, sqr, sqr);
    }

    // drawLine()
  }
  function form(x) {
    return Math.round(x * 100000) / 100000;
  }

  function drawLine() {
    //0.9 - 1.4 Xmid + ((a - width / 2) * DX) / width;
    var xStart = Xmid + ((0.91 - width / 2) * DX) / width;
    var xEnd = Xmid + ((1.41 - width / 2) * DX) / width;
    var lineYStart = height / 2 + (Ymid - 0.3035) / width;
    ctx.beginPath();
    ctx.lineWidth = 10;
    ctx.moveTo(xStart, lineYStart);
    ctx.lineTo(xEnd, lineYStart);
    ctx.stroke();
  }

  function ev_mouseup(ev) {
    var a, b;
    //  if (ev.button != 0) return
    if (ev.layerX || ev.layerY == 0) {
      a = ev.layerX;
      b = ev.layerY;
    } else if (ev.offsetX || ev.offsetY == 0) {
      a = ev.offsetX;
      b = ev.offsetY;
    }
    a = Xmid + ((a - width / 2) * DX) / width;
    b = Ymid - ((b - height / 2) * DX) / width;
    if (ev.shiftKey) {
      DX *= 2;
    } else if (ev.altKey) {
      DX /= 2;
    } else {
      var t = henonJ(a, b, par1, par2);
      var period = (t <= 0) ? "Period: " + (-t + 1) : "inf";
      var aMin = Xmid - ((width / 2) * DX) / width;
      var aMax = Xmid + ((width / 2) * DX) / width;
      var bMin = Ymid - ((height / 2) * DX) / width;
      var bMax = Ymid + ((height / 2) * DX) / width;
      txt.innerHTML = `${period}<br />a=${a.toFixed(precision)} b=${b.toFixed(precision)}<br />Image shows values of a between ${aMin.toFixed(precision)} and ${aMax.toFixed(precision)}, and values of b between ${bMin.toFixed(precision)} and ${bMax.toFixed(precision)}`
      return;
    }
    Xmid = a;
    Ymid = b;
    paint();
  }
  function startTouch(evt) {
    var evList = evt.touches;
    if (evList.length === 2) {
      Xnew = Xmid;
      Ynew = Ymid;
      scale = 1;
      xOffs = (evList[0].pageX + evList[1].pageX) * 0.5;
      yOffs = (evList[0].pageY + evList[1].pageY) * 0.5;
      var dx = evList[1].pageX - evList[0].pageX;
      var dy = evList[1].pageY - evList[0].pageY;
      rTouch = Math.sqrt(dx * dx + dy * dy);
      drag = 2;
      evt.preventDefault();
    }
  }
  function stopTouch(e) {
    if (drag == 2) {
      Xmid = Xnew;
      Ymid = Ynew;
      DX /= scale;
      paint();
      drag = 0;
      evt.preventDefault();
    }
  }
  function continueTouch(evt) {
    if (drag == 2) {
      var x = (evt.touches[0].pageX + evt.touches[1].pageX) * 0.5;
      var y = (evt.touches[0].pageY + evt.touches[1].pageY) * 0.5;
      var d = DX / (width * scale);
      Xnew -= (x - xOffs) * d;
      Ynew += (y - yOffs) * d;
      xOffs = x;
      yOffs = y;
      var dx = evt.touches[1].pageX - evt.touches[0].pageX;
      var dy = evt.touches[1].pageY - evt.touches[0].pageY;
      var r = Math.sqrt(dx * dx + dy * dy);
      scale *= r / rTouch;
      var d = DX / (width * scale);
      var shX = -(Xnew - Xmid) / d - (scale - 1) * width * 0.5;
      var shY = (Ynew - Ymid) / d - (scale - 1) * height * 0.5;
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(cnv, shX, shY, scale * width, scale * height);
      rTouch = r;
      evt.preventDefault();
    }
  }
  function setFontHeight() {
    var parent = document.createElement("span");
    parent.appendChild(document.createTextNode("height"));
    document.body.appendChild(parent);
    parent.style.cssText =
      "font-family: sans-serif; white-space: nowrap; display: inline;";
    ctx.font =
      "bold " + Math.round(0.5 * parent.offsetHeight) + "pt sans-serif";
    ctx.textBaseline = "ideographic";
    document.body.removeChild(parent);
  }
}
