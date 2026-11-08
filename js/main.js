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
    [380, 520],
    [390, 235],
    [585, 390],
    [812, 385],
    [1070, 390]
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
  var TRACE_DATA = buildTraces();
  var FULL_TRACE = TRACE_DATA.pts;
  var TRACE_STOP = TRACE_DATA.stops;

  var index = 0;
  var trip = 0;
  var reveal = TRACE_STOP[0];
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
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var mobile = vw <= 860;
    var nwp = CAM[i];
    var scale = mobile
      ? Math.max(0.85, Math.min(1.25, vw / 420))
      : Math.min(1.55, Math.max(1.05, (vw - 400) / 720));
    var panelW = mobile ? 0 : Math.min(384, vw - 40) + 20;
    var ax = mobile ? 0.5 : Math.max(0.28, ((vw - panelW) * 0.52) / vw);
    var ay = mobile ? 0.27 : 0.44;
    var tx = vw * ax - nwp[0] * scale;
    var ty = vh * ay - nwp[1] * scale;
    stage.style.transform = "translate(" + tx.toFixed(1) + "px," + ty.toFixed(1) + "px) scale(" + scale.toFixed(3) + ")";
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
      if (done) done();
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
      if (done) done();
      return;
    }
    var dur = Math.max(260, Math.min(680, 220 + Math.abs(to - from) * 140));
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
        if (done) done();
      }
    }
    requestAnimationFrame(tick);
  }

  function pushCurve(pts, a, b, n, pow) {
    var p = pow || 1;
    for (var i = 1; i <= n; i++) {
      var t = i / n;
      var eased = p > 0 ? 1 - Math.pow(1 - t, p) : Math.pow(t, -p);
      pts.push(a + (b - a) * eased);
    }
  }

  function buildTraces() {
    var pts = [-65];
    var stops = [];

    // 01 · Current (I(t)): Resting membrane potential V_rest = -65 mV
    pushCurve(pts, -65, -65, 12, 1);
    stops.push(pts.length);

    // 02 · Charge (C): Exponential RC charging toward -55 mV
    pushCurve(pts, -65, -55, 18, 2.2);
    stops.push(pts.length);

    // 03 · Leak (R): Subthreshold leak decay toward V_rest (-58 mV)
    pushCurve(pts, -55, -58, 14, 1.8);
    stops.push(pts.length);

    // 04 · Threshold (V >= V_th): Depolarization reaches threshold V_th = -50 mV
    pushCurve(pts, -58, -50, 14, 1.5);
    stops.push(pts.length);

    // 05 · Spike: Rapid action potential upstroke to +30 mV peak
    pushCurve(pts, -50, 30, 8, -2.2);
    stops.push(pts.length);

    // 06 · Synapse: Repolarization & reset to V_reset = -70 mV
    pushCurve(pts, 30, -72, 9, 1.6);
    pushCurve(pts, -72, -70, 9, 1.5);
    stops.push(pts.length);

    return { pts: pts, stops: stops };
  }

  function formatMv(v) {
    var rounded = Math.round(v);
    if (rounded < 0) return "−" + Math.abs(rounded) + " mV";
    if (rounded > 0) return "+" + rounded + " mV";
    return "0 mV";
  }

  function drawScope() {
    var w = canvas.clientWidth;
    var h = canvas.clientHeight;
    if (!w || !h) return;
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.max(1, Math.floor(w * dpr));
    canvas.height = Math.max(1, Math.floor(h * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    var top = 42;
    var bot = -80;
    function yOf(v) {
      return 7 + ((top - v) / (top - bot)) * (h - 14);
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

    var total = FULL_TRACE.length;
    var count = Math.max(2, Math.min(total, Math.round(reveal)));
    function xOf(idx) {
      return (idx / (total - 1)) * (w - 14) + 7;
    }

    ctx.beginPath();
    for (var i = 0; i < count; i++) {
      var x = xOf(i);
      var y = yOf(FULL_TRACE[i]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "#141311";
    ctx.lineWidth = 1.65;
    ctx.lineJoin = "round";
    ctx.stroke();

    // Highlight suprathreshold action potential segment (V >= -50 mV) in spike red
    var spikeStart = TRACE_STOP[3] - 1;
    var spikeEnd = -1;
    for (var k = spikeStart; k < count; k++) {
      if (FULL_TRACE[k] >= -50) spikeEnd = k;
      else if (spikeEnd >= spikeStart) {
        spikeEnd = k;
        break;
      }
    }
    if (spikeEnd > spikeStart) {
      ctx.beginPath();
      for (var s = spikeStart; s <= spikeEnd; s++) {
        var sx = xOf(s);
        var sy = yOf(FULL_TRACE[s]);
        if (s === spikeStart) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.strokeStyle = "#b42318";
      ctx.lineWidth = 2.1;
      ctx.lineJoin = "round";
      ctx.stroke();
    }

    var last = FULL_TRACE[count - 1];
    var headX = xOf(count - 1);
    var headY = yOf(last);
    ctx.beginPath();
    ctx.arc(headX, headY, 2.8, 0, Math.PI * 2);
    ctx.fillStyle = last >= -50 ? "#b42318" : "#141311";
    ctx.fill();

    vread.textContent = formatMv(last);
    canvas.setAttribute(
      "aria-label",
      "Membrane voltage trace, currently " + formatMv(last) + (last >= -50 ? ", at or above threshold" : ", below threshold")
    );
  }

  function setTrace(i) {
    var target = TRACE_STOP[i];
    var my = ++traceToken;
    if (reduce.matches || Math.abs(reveal - target) < 0.5) {
      reveal = target;
      drawScope();
      return;
    }
    var start = reveal;
    var t0 = performance.now();
    function step(now) {
      if (my !== traceToken) return;
      var t = Math.min(1, (now - t0) / 460);
      var ease = 1 - Math.pow(1 - t, 3);
      reveal = start + (target - start) * ease;
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
    show(i);
    travel(from, i);
    setTrace(i);
    sections.scrollTop = 0;
  }

  function buildMinimap() {
    NAMES.forEach(function (name, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = "0" + (i + 1) + " " + name;
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
    var idx = Number(btn.dataset.i);
    var sym = document.getElementById("sym-" + idx);
    btn.addEventListener("click", function () { go(idx); });
    if (sym) {
      btn.addEventListener("mouseenter", function () { sym.classList.add("is-hover"); });
      btn.addEventListener("mouseleave", function () { sym.classList.remove("is-hover"); });
      btn.addEventListener("focus", function () { sym.classList.add("is-hover"); });
      btn.addEventListener("blur", function () { sym.classList.remove("is-hover"); });
    }
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
  reveal = TRACE_STOP[index];
  drawScope();
})();
