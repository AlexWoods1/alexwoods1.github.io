(function () {
  "use strict";

  var WAY = [
    [150, 390],
    [380, 390],
    [380, 500],
    [380, 390],
    [380, 330],
    [380, 390],
    [530, 390],
    [640, 390],
    [770, 390],
    [798, 300],
    [826, 470],
    [854, 390],
    [1020, 390]
  ];
  var MAP = [0, 2, 4, 7, 9, 12];
  var CAM = [
    [150, 390],
    [380, 530],
    [400, 230],
    [590, 390],
    [820, 380],
    [1060, 400]
  ];
  var NAMES = ["Current", "Charge", "Leak", "Threshold", "Spike", "Synapse"];
  var HASH = ["current", "charge", "leak", "threshold", "spike", "synapse"];

  var app = document.getElementById("app");
  var stage = document.getElementById("stage");
  var spike = document.getElementById("spike");
  var flow = document.getElementById("flow");
  var sections = document.getElementById("sections");
  var canvas = document.getElementById("scope");
  var vread = document.getElementById("vread");
  var stepEl = document.getElementById("step");
  var prevBtn = document.getElementById("prev");
  var nextBtn = document.getElementById("next");
  var minimap = document.getElementById("minimap");
  var ctx = canvas.getContext("2d");

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var index = 0;
  var trip = 0;
  var goal = [];
  var reveal = 0;
  var traceToken = 0;
  var wheelAcc = 0;
  var wheelLock = 0;

  function clamp(i) {
    return Math.max(0, Math.min(MAP.length - 1, i));
  }

  function pathThrough(fromWp, toWp) {
    var step = fromWp <= toWp ? 1 : -1;
    var d = "M " + WAY[fromWp][0] + " " + WAY[fromWp][1];
    for (var i = fromWp; i !== toWp; i += step) {
      var n = WAY[i + step];
      d += " L " + n[0] + " " + n[1];
    }
    return d;
  }

  function placeSpike(wp) {
    spike.style.left = WAY[wp][0] + "px";
    spike.style.top = WAY[wp][1] + "px";
  }

  function frame(i) {
    var mobile = window.innerWidth <= 800;
    var nwp = CAM[i];
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var scale = mobile
      ? Math.max(1.05, Math.min(1.45, vw / 380))
      : Math.min(1.7, Math.max(1.22, vw / 980));
    var ax = mobile ? 0.5 : 0.3;
    var ay = mobile ? 0.2 : 0.46;
    var tx = vw * ax - nwp[0] * scale;
    var ty = vh * ay - nwp[1] * scale;
    stage.style.transform = "translate(" + tx + "px," + ty + "px) scale(" + scale + ")";
  }

  function show(i) {
    var panels = sections.querySelectorAll("section");
    for (var p = 0; p < panels.length; p++) {
      panels[p].classList.toggle("is-on", p === i);
    }
    var syms = document.querySelectorAll(".sym");
    for (var s = 0; s < syms.length; s++) {
      syms[s].classList.toggle("is-hot", s === i);
    }
    var buttons = minimap.querySelectorAll("button");
    for (var b = 0; b < buttons.length; b++) {
      if (b === i) buttons[b].setAttribute("aria-current", "true");
      else buttons[b].removeAttribute("aria-current");
    }
    prevBtn.disabled = i === 0;
    nextBtn.disabled = i === MAP.length - 1;
    stepEl.textContent = "0" + (i + 1) + " / 06 · " + NAMES[i];
    flow.setAttribute("d", pathThrough(0, MAP[i]));
    if (location.hash !== "#" + HASH[i]) {
      history.replaceState(null, "", "#" + HASH[i]);
    }
  }

  function travel(from, to, done) {
    var my = ++trip;
    var a = MAP[from];
    var b = MAP[to];
    if (reduce.matches || from === to) {
      placeSpike(b);
      done();
      return;
    }
    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathThrough(a, b));
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "none");
    document.querySelector(".schematic").appendChild(path);
    var len = path.getTotalLength();
    if (!len) {
      path.remove();
      placeSpike(b);
      done();
      return;
    }
    var dur = Math.max(260, Math.min(880, 220 + Math.abs(to - from) * 180));
    var t0 = performance.now();
    function tick(now) {
      if (my !== trip) {
        path.remove();
        return;
      }
      var t = Math.min(1, (now - t0) / dur);
      var e = 1 - Math.pow(1 - t, 3);
      var pt = path.getPointAtLength(Math.max(0, Math.min(len, len * e)));
      spike.style.left = pt.x + "px";
      spike.style.top = pt.y + "px";
      if (t < 1) requestAnimationFrame(tick);
      else {
        path.remove();
        done();
      }
    }
    requestAnimationFrame(tick);
  }

  function pushRamp(pts, a, b, n) {
    for (var i = 1; i <= n; i++) pts.push(a + (b - a) * (i / n));
  }

  function buildTrace(i) {
    var pts = [-65];
    var levels = [-62, -56, -53];
    var prev = -65;
    var last = Math.min(i, 2);
    for (var k = 0; k <= last; k++) {
      pushRamp(pts, prev, levels[k], 16);
      prev = levels[k];
    }
    if (i >= 3) {
      pushRamp(pts, prev, -50, 12);
      pushRamp(pts, -50, 32, 5);
      pushRamp(pts, 32, -64, 7);
      prev = -64;
    }
    if (i >= 5) pushRamp(pts, prev, -70, 14);
    return pts;
  }

  function formatMv(v) {
    var sign = v < 0 ? "−" : "";
    return sign + Math.abs(v).toFixed(0) + " mV";
  }

  function drawScope() {
    var w = canvas.clientWidth;
    var h = canvas.clientHeight;
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.max(1, Math.floor(w * dpr));
    canvas.height = Math.max(1, Math.floor(h * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    var top = 40;
    var bot = -80;
    function yOf(v) {
      return 8 + ((top - v) / (top - bot)) * (h - 16);
    }
    ctx.strokeStyle = "rgba(20,19,17,0.18)";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    [-50, -65].forEach(function (v) {
      ctx.beginPath();
      ctx.moveTo(0, yOf(v));
      ctx.lineTo(w, yOf(v));
      ctx.stroke();
    });
    ctx.setLineDash([]);
    var n = Math.max(1, Math.floor(reveal));
    var count = Math.min(goal.length, n);
    if (count < 2) return;
    function strokeRange(pred, color) {
      ctx.beginPath();
      var drawing = false;
      for (var i = 0; i < count; i++) {
        var x = (i / (goal.length - 1)) * (w - 8) + 4;
        var y = yOf(goal[i]);
        if (pred(goal[i])) {
          if (!drawing) {
            ctx.moveTo(x, y);
            drawing = true;
          } else ctx.lineTo(x, y);
        } else if (drawing) {
          ctx.lineTo(x, y);
          drawing = false;
        }
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }
    strokeRange(function (v) { return v < -20; }, "#141311");
    strokeRange(function (v) { return v >= -20; }, "#b42318");
    var last = goal[count - 1];
    vread.textContent = formatMv(last);
    canvas.setAttribute(
      "aria-label",
      "Membrane voltage trace, currently " + formatMv(last) + (last >= -50 ? ", at or above threshold" : ", below threshold")
    );
  }

  function setTrace(i) {
    goal = buildTrace(i);
    var my = ++traceToken;
    if (reduce.matches || reveal >= goal.length) {
      reveal = goal.length;
      drawScope();
      return;
    }
    var start = reveal;
    var t0 = performance.now();
    function step(now) {
      if (my !== traceToken) return;
      var t = Math.min(1, (now - t0) / 520);
      reveal = start + (goal.length - start) * (1 - Math.pow(1 - t, 2));
      drawScope();
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function go(i) {
    i = clamp(i);
    if (i === index) return;
    var from = index;
    index = i;
    frame(i);
    if (!reduce.matches) {
      sections.querySelectorAll("section").forEach(function (s) { s.classList.remove("is-on"); });
    }
    travel(from, i, function () { show(i); });
    setTrace(i);
    sections.scrollTop = 0;
  }

  function buildMinimap() {
    NAMES.forEach(function (name, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = name;
      btn.addEventListener("click", function () { go(i); });
      minimap.appendChild(btn);
    });
  }

  function onWheel(e) {
    var panel = sections;
    if (panel.contains(e.target) && panel.scrollHeight > panel.clientHeight + 4) {
      var dy = e.deltaY;
      var atTop = panel.scrollTop <= 0;
      var atBot = panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 2;
      if ((dy < 0 && !atTop) || (dy > 0 && !atBot)) return;
    }
    e.preventDefault();
    if (performance.now() < wheelLock) return;
    wheelAcc += e.deltaY;
    if (Math.abs(wheelAcc) < 70) return;
    wheelAcc = 0;
    wheelLock = performance.now() + 420;
    go(index + (e.deltaY > 0 ? 1 : -1));
  }

  var touchY = null;
  function onTouchStart(e) {
    if (e.touches.length !== 1) return;
    touchY = e.touches[0].clientY;
  }
  function onTouchEnd(e) {
    if (touchY == null) return;
    var y = e.changedTouches[0].clientY;
    var dy = touchY - y;
    touchY = null;
    if (Math.abs(dy) < 48) return;
    if (sections.contains(e.target) && sections.scrollHeight > sections.clientHeight + 4) {
      var atTop = sections.scrollTop <= 0;
      var atBot = sections.scrollTop + sections.clientHeight >= sections.scrollHeight - 2;
      if ((dy < 0 && !atTop) || (dy > 0 && !atBot)) return;
    }
    go(index + (dy > 0 ? 1 : -1));
  }

  app.hidden = false;
  document.body.classList.add("circuit-on");
  buildMinimap();

  document.querySelectorAll(".hotspot").forEach(function (btn) {
    btn.addEventListener("click", function () { go(Number(btn.dataset.i)); });
  });
  prevBtn.addEventListener("click", function () { go(index - 1); });
  nextBtn.addEventListener("click", function () { go(index + 1); });

  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      go(index + 1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      go(index - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      go(0);
    } else if (e.key === "End") {
      e.preventDefault();
      go(MAP.length - 1);
    }
  });

  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("touchend", onTouchEnd, { passive: true });
  window.addEventListener("resize", function () {
    frame(index);
    drawScope();
  });

  var start = HASH.indexOf((location.hash || "").replace("#", ""));
  if (start < 0) start = 0;
  index = start;
  placeSpike(MAP[index]);
  frame(index);
  show(index);
  reveal = 0;
  setTrace(index);
  if (reduce.matches) reveal = goal.length;
  drawScope();
})();
