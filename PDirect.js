function PDirect( par ){
  var formula = par.formula, Xmid = par.Xmid, Ymid = par.Ymid, DX = par.DX, par1 = par.par1,
    par2 = par.par2, maxIt = par.maxIt, maxCol = par.maxCol, max = par.maxZ2,
    label = par.label, square = par.square
  var func = []
  var rTouch, xOffs, yOffs, drag = 0,  Xnew, Ynew, scale
  if (!max) max = 4

func["HenonJ"] = function(a, b, Xo,Yo) {
    var b2 = (1-b)*.5, Xs,Ys
    if (a < 0) Xs = 0
    else if (Xo > 0)  Xs = -b2 + Math.sqrt(b2*b2 + a) + .000000001
    else  Xs = -b2 - Math.sqrt(b2*b2 + a) + .000000001
    Ys = Xs
    var X= a - Xs*Xs + b*Ys, X2=X*X, X1, Y=Ys,   n=0
    do{
      X1 = a - X2 + b*Y;  Y = X
      X = X1;  X2 = X*X;   n++
    } while ((X2 < 1000.) && (n < maxIt) )
    if (n < maxIt) return maxCol+1
    Xo = X; Yo = Y;  n = -1
    do{
      X1 = a - X*X + b*Y;  Y = X;  X = X1;  n++
    } while ((Math.abs(X - Xo) + Math.abs(Y - Yo) > .00000001) && (n < 64) )
    if (n == 64) return maxCol
    return -n
}
func["HenonH"] = function(a, b, Xo,Yo) {
    var b1 = (1-b)*.5, d=b1*b1-a, Xs,Ys
    if (d < 0) Xs = 0
    else if (Xo > 0)  Xs = b1 + Math.sqrt(d) + .000000001
    else  Xs = b1 - Math.sqrt(d) + .000000001
    Ys = Xs
    var X = a + Xs*Xs + b*Ys, X2=X*X, X1, Y=Ys,   n=0
    do{
      X1 = a + X2 + b*Y;  Y = X
      X = X1;  X2 = X*X;   n++
    } while ((X2 < 1000.) && (n < maxIt) )
    if (n < maxIt) return maxCol+1
    Xo = X; Yo = Y;  n = -1
    do{
      X1 = a + X*X + b*Y;  Y = X;  X = X1;  n++
    } while ((Math.abs(X - Xo) + Math.abs(Y - Yo) > .00000001) && (n < 64) )
    if (n == 64) return maxCol
    return -n
}
func["Circle"] = function(A, B, C,Ci) {
    var X = .5, Xo, B1=25.13*B,   n=0
    do{  X = X + A + B1*X*(X-.5)*(X-1.); X -= Math.floor(X);  n++
    } while (n < maxIt)
    Xo = X;  n = -1
    do{  X = X + A + B1*X*(X-.5)*(X-1.); X -= Math.floor(X);  n++
    } while ((Math.abs(X - Xo) > .00000001) && (n < 64) )
    if (n == 64) return maxCol
    return -n
}
func["PBiquadH"] = function(A,B, C,Ci) {
    var X, X2=0, Xo, n=0
    if (C > 0){
     if(A > 0) return maxCol
     X = Math.sqrt(-A); X2 = X*X;}
    do{  X2 += A; X = X2*X2+B; X2 = X*X;  n++
    } while ((X2 < 1000.) && (n < maxIt) )
    if (n < maxIt) return maxCol+1
    Xo = X;  n = -1
    do{  X2 += A; X = X2*X2+B; X2 = X*X;  n++
    } while ((Math.abs(X - Xo) > .00000001) && (n < 64) )
    if (n == 64) return maxCol
    return -n
}
  var div = document.getElementById(par.divId)
  var canvas = document.createElement("canvas")
  canvas.addEventListener('mouseup', ev_mouseup, false)
  canvas.addEventListener('touchstart', startTouch, false)
  canvas.addEventListener('touchmove', continueTouch, false)
  canvas.addEventListener('touchend', stopTouch, false)

  var w = canvas.width =  Math.round(window.innerWidth * par.scX)
  var h = canvas.height = Math.round(window.innerWidth * par.scY)
  div.appendChild(canvas)
  var ctx = canvas.getContext("2d")
  var txt = document.createElement("div")
  div.appendChild(txt)
  ctx.lineWidth = 2
  setFontHeight()

  var cnv = document.createElement("canvas")
  cnv.width = w;  cnv.height = h
  var img = cnv.getContext("2d")
  var imgd = ctx.createImageData(w, h)
  var imgArr = imgd.data
  var img32 = new Uint32Array(imgArr.buffer)

  var M = maxCol/3, M2 = 2*M, M4 = M*M*M*M;  maxCol = 3*M     // maxCol is 3*int
  var cm = new Uint32Array(maxCol + 2)
  var cmb = new Uint8Array(cm.buffer)
  for (var i = 0; i < M2; i++){                   // set Color Map
    var dum = M - i;  dum *=dum;  dum *=dum
    cmb[4*((i+M2) % maxCol)] = cmb[4*i + 1] =  cmb[4*((i+M) % maxCol) + 2] = (255 - (255*dum)/M4)}
  for (var i = 3; i < cmb.length; i += 4) cmb[i] = 255
  cmb[4*maxCol] = cmb[4*maxCol+1] = cmb[4*maxCol+2] = 0;  cmb[4*maxCol+3] = 255
  cmb[4*maxCol+4] = cmb[4*maxCol+5] = cmb[4*maxCol+6] = 200
  cmb[4*maxCol+7] = 255
  paint()

function paint() {
  txt.innerHTML = "wait"
  var time = new Date().getTime()
  var Step = DX/w, pix = 0
  for (var iy = 0, Y = Ymid + Step*h/2; iy < h; iy++, Y -= Step)
   for (var ix = 0, X = Xmid - Step*w/2; ix < w; ix++, X += Step){
     var t = func[formula](X, Y, par1, par2)
     if(t < 0) t = (-t) % maxCol
     img32[pix++] = cm[ t ]}
  img.putImageData(imgd, 0, 0)
  ctx.drawImage(cnv, 0,0)
  time = new Date().getTime() - time
  txt.innerHTML = form(Xmid) +"&nbsp; "+ form(Ymid) +"&nbsp; "+ form(DX) +" &nbsp; "+ time +"ms"

  ctx.font = " " + Math.round(.5*txt.clientHeight) + "pt sans-serif"
  ctx.textBaseline = "ideographic"
  ctx.fillStyle = "white"
  var StZ = DX/w
  if(label)
    for (var i = 0; i < label.length; i++)
      ctx.fillText(label[i][0], w/2 + (label[i][1] - Xmid)/StZ, h/2 + (Ymid - label[i][2])/StZ)
  if(square){
    ctx.strokeStyle = "white"
    var sqr = square[2]/StZ,
      x = (w - sqr)/2 + (square[0] - Xmid)/StZ,
      y = (h - sqr)/2 + (Ymid - square[1])/StZ
    ctx.strokeRect(x,y, sqr,sqr)
  }
}
function form(x) {
  return Math.round(x*100000)/100000
}
function ev_mouseup (ev) {
  var x, y
//  if (ev.button != 0) return
  if (ev.layerX || ev.layerY == 0) {
    x = ev.layerX;  y = ev.layerY
  } else if (ev.offsetX || ev.offsetY == 0) {
    x = ev.offsetX; y = ev.offsetY
  }
  x = Xmid + (x - w/2)*DX/w;  y = Ymid - (y - h/2)*DX/w
  if ( ev.ctrlKey ) {
    if ( ev.shiftKey )  DX *=4;  else  DX *=2}
  else if ( ev.altKey ){
    if ( ev.shiftKey )  DX /=4;  else  DX /=2}
  else{
    var t = func[formula](x, y, par1, par2)
    if(t <= 0) txt.innerHTML = "n="+(-t+1)
    else txt.innerHTML = "inf"
    return}
  Xmid = x;  Ymid = y
  paint()
}
function startTouch(evt) {
  var evList = evt.touches
  if(evList.length == 2){
    Xnew = Xmid;  Ynew = Ymid;  scale = 1
    xOffs = (evList[0].pageX + evList[1].pageX)*.5
    yOffs = (evList[0].pageY + evList[1].pageY)*.5
    var dx = evList[1].pageX - evList[0].pageX
    var dy = evList[1].pageY - evList[0].pageY
    rTouch = Math.sqrt(dx*dx + dy*dy)
    drag = 2
    evt.preventDefault()
  }
}
function stopTouch(e) {
  if(drag == 2){
    Xmid = Xnew;  Ymid = Ynew
    DX /= scale
    paint()
    drag = 0
    evt.preventDefault()
  }
}
function continueTouch(evt) {
  if(drag == 2){
    var x = (evt.touches[0].pageX + evt.touches[1].pageX)*.5
    var y = (evt.touches[0].pageY + evt.touches[1].pageY)*.5
    var d = DX/(w*scale)
    Xnew -= (x - xOffs)*d;  Ynew += (y - yOffs)*d
    xOffs = x;  yOffs = y
    var dx = evt.touches[1].pageX - evt.touches[0].pageX
    var dy = evt.touches[1].pageY - evt.touches[0].pageY
    var r = Math.sqrt(dx*dx + dy*dy)
    scale *= r/rTouch
    var d = DX/(w*scale)
    var shX = -(Xnew - Xmid)/d - (scale - 1)*w*.5
    var shY =  (Ynew - Ymid)/d - (scale - 1)*h*.5
    ctx.clearRect(0,0,w,h)
    ctx.drawImage(cnv, shX,shY, scale*w,scale*h)
    rTouch = r
    evt.preventDefault()
  }
}
function setFontHeight(){
   var parent = document.createElement("span")
   parent.appendChild(document.createTextNode("height"));
   document.body.appendChild(parent);
   parent.style.cssText = "font-family: sans-serif; white-space: nowrap; display: inline;";
   ctx.font = "bold " + Math.round(.5*parent.offsetHeight) + "pt sans-serif";
   ctx.textBaseline = "ideographic";
   document.body.removeChild(parent);
}
}