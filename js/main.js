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
  var NAMES = ["About", "Experience", "Skills", "Projects", "Honors", "Contact"];
  var HASH = ["about", "experience", "skills", "projects", "honors", "contact"];

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
  var viewport = document.getElementById("viewport");
  var insetHome = document.getElementById("inset-home");
  var insetCaption = document.getElementById("inset-caption");
  var insetJumps = document.getElementById("inset-jumps");
  var resetBtn = document.getElementById("reset-btn");
  var symReset = document.getElementById("sym-reset");
  var resetBlade = document.getElementById("reset-blade");
  var ctx = canvas.getContext("2d");

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var TRACE_DATA = buildTraces();
  var FULL_TRACE = TRACE_DATA.pts;
  var TRACE_STOP = TRACE_DATA.stops;

  var index = 0;
  var pageMode = false;
  var trip = 0;
  var animTimer = null;
  var cachedSafe = null;
  var reveal = TRACE_STOP[0];
  var traceToken = 0;
  var wheelAcc = 0;
  var wheelLock = 0;
  var resetTimer = null;

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
      ? Math.max(0.44, Math.min(0.62, vw / 720))
      : Math.min(1.22, Math.max(0.86, (vw - 400) / 860));
    var ax = mobile ? 0.5 : 0.52;
    var ay = mobile ? 0.42 : 0.44;
    var cx = mobile ? nwp[0] * 0.65 + 560 * 0.35 : nwp[0] * 0.78 + 560 * 0.22;
    var cy = mobile ? nwp[1] * 0.65 + 370 * 0.35 : nwp[1] * 0.82 + 390 * 0.18;
    var tx = vw * ax - cx * scale;
    var ty = vh * ay - cy * scale;
    stage.style.transform = "translate(" + tx.toFixed(1) + "px," + ty.toFixed(1) + "px) scale(" + scale.toFixed(3) + ")";
  }

  function show(i) {
    var panels = sections.querySelectorAll("section");
    for (var p = 0; p < panels.length; p++) {
      panels[p].classList.toggle("is-on", p === i);
    }
    for (var s = 0; s < MAP.length; s++) {
      var sym = document.getElementById("sym-" + s);
      if (sym) sym.classList.toggle("is-hot", s === i);
    }
    var buttons = minimap.querySelectorAll("button");
    for (var b = 0; b < buttons.length; b++) {
      if (b === i) buttons[b].setAttribute("aria-current", "true");
      else buttons[b].removeAttribute("aria-current");
    }
    markCurrent(insetJumps, i);
    for (var h = 0; h < MAP.length; h++) {
      var hot = document.querySelector('.hotspot[data-i="' + h + '"]');
      if (!hot) continue;
      if (h === i) hot.setAttribute("aria-current", "true");
      else hot.removeAttribute("aria-current");
    }
    prevBtn.disabled = i === 0;
    nextBtn.disabled = i === MAP.length - 1;
    stepEl.textContent = "0" + (i + 1) + " / 06 · " + NAMES[i];
    flow.setAttribute("d", pathThrough(0, MAP[i]));
    setCaption(i);
  }

  function markCurrent(root, i) {
    if (!root) return;
    var nodes = root.querySelectorAll("button");
    for (var n = 0; n < nodes.length; n++) {
      if (n === i) nodes[n].setAttribute("aria-current", "true");
      else nodes[n].removeAttribute("aria-current");
    }
  }

  function setCaption(i) {
    if (!insetCaption) return;
    insetCaption.textContent = "0" + (i + 1) + " · " + NAMES[i];
  }

  function safeBottom() {
    if (cachedSafe != null) return cachedSafe;
    var probe = document.createElement("div");
    probe.style.cssText = "position:fixed;left:0;bottom:0;padding-bottom:env(safe-area-inset-bottom);visibility:hidden;pointer-events:none;";
    document.body.appendChild(probe);
    cachedSafe = probe.offsetHeight || 0;
    probe.remove();
    return cachedSafe;
  }

  function insetBox() {
    var vw = document.documentElement.clientWidth || window.innerWidth;
    var vh = window.innerHeight;
    var mobile = vw <= 860;
    var gap = mobile ? 10 : 20;
    var width = mobile ? Math.max(160, vw - gap * 2) : 360;
    var height = mobile ? (vh < 520 ? 150 : 178) : 250;
    var safe = mobile ? safeBottom() : 0;
    return {
      mobile: mobile,
      gap: gap,
      safe: safe,
      top: Math.max(0, Math.round(vh - height - gap - safe)),
      left: Math.max(gap, Math.round(vw - width - gap)),
      width: width,
      height: height,
      header: 32,
      footer: mobile ? 44 : 0
    };
  }

  function applyBox(box) {
    viewport.style.top = box.top + "px";
    viewport.style.left = box.left + "px";
    viewport.style.width = box.width + "px";
    viewport.style.height = box.height + "px";
  }

  function fitStage(box) {
    var pad = 10;
    var innerW = box.width - pad * 2;
    var innerH = box.height - box.header - box.footer - pad;
    if (innerW < 40 || innerH < 40) return;
    var scale = Math.min(innerW / 1200, innerH / 740);
    var tx = (box.width - 1200 * scale) / 2;
    var availH = box.height - box.header - box.footer;
    var ty = box.header + Math.max(0, (availH - 740 * scale) / 2);
    stage.style.transform = "translate(" + tx.toFixed(1) + "px," + ty.toFixed(1) + "px) scale(" + scale.toFixed(4) + ")";
  }

  function snapStage(fn) {
    stage.style.transition = "none";
    fn();
    void stage.offsetWidth;
    stage.style.transition = "";
  }

  function layoutPage(box) {
    if (!pageMode) return;
    box = box || insetBox();
    var root = document.documentElement.style;
    root.setProperty("--inset-w", box.width + "px");
    root.setProperty("--inset-gap", box.gap + "px");
    if (box.mobile) {
      var h = persistTitle ? persistTitle.offsetHeight : 64;
      root.setProperty("--page-top", h + "px");
      root.setProperty("--inset-stack", (box.height + box.gap + box.safe + 8) + "px");
    } else {
      root.removeProperty("--page-top");
      root.removeProperty("--inset-stack");
    }
  }

  function clearPageVars() {
    var root = document.documentElement.style;
    root.removeProperty("--page-top");
    root.removeProperty("--inset-stack");
    root.removeProperty("--inset-w");
    root.removeProperty("--inset-gap");
  }

  function settleAnim() {
    if (animTimer) clearTimeout(animTimer);
    animTimer = setTimeout(function () {
      viewport.classList.remove("is-animating");
      animTimer = null;
    }, 940);
  }

  function writeHash(hash, push) {
    var desired = hash ? "#" + hash : "";
    if ((location.hash || "") === desired) return;
    var url = hash ? "#" + hash : (location.pathname + location.search);
    if (push) history.pushState(null, "", url);
    else history.replaceState(null, "", url);
  }

  function syncSkip() {
    var skip = document.querySelector(".skip");
    if (!skip) return;
    skip.setAttribute("href", pageMode ? "#sections" : "#minimap");
  }

  function scrollPageTop() {
    var root = document.documentElement;
    var prev = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    if (window.innerWidth <= 860) sections.scrollTop = 0;
    root.scrollTop = 0;
    root.scrollLeft = 0;
    document.body.scrollTop = 0;
    document.body.scrollLeft = 0;
    root.style.scrollBehavior = prev;
  }

  function isShown(el) {
    var node = el;
    while (node && node !== document.body) {
      var style = window.getComputedStyle(node);
      if (style.display === "none" || style.visibility === "hidden") return false;
      node = node.parentElement;
    }
    return true;
  }

  function focusIfLost(target) {
    if (!target) return;
    var active = document.activeElement;
    if (!active || active === document.body || active === document.documentElement) return;
    if (!isShown(active)) target.focus({ preventScroll: true });
  }

  function enterPage(i, animate, writeHistory) {
    i = clamp(i);
    if (pageMode && i === index) return;
    var from = index;
    var moved = i !== index;
    index = i;
    pageMode = true;
    document.body.classList.remove("circuit-on");
    document.body.classList.add("page-mode");
    syncSkip();
    var motion = !!animate && !reduce.matches;
    if (motion) {
      viewport.classList.add("is-animating");
      void viewport.offsetWidth;
    }
    var box = insetBox();
    if (motion) {
      applyBox(box);
      fitStage(box);
      settleAnim();
    } else {
      snapStage(function () {
        applyBox(box);
        fitStage(box);
      });
    }
    layoutPage(box);
    show(i);
    if (writeHistory !== false) writeHash(HASH[i], !!animate);
    var navHint = document.getElementById("nav-hint");
    if (navHint) navHint.classList.add("is-hidden");
    if (moved) {
      travel(from, i);
      setTrace(i);
    }
    scrollPageTop();
    focusIfLost(insetHome);
    requestAnimationFrame(function () {
      if (!pageMode) return;
      var next = insetBox();
      layoutPage(next);
      if (!motion) snapStage(function () { fitStage(next); });
      scrollPageTop();
    });
  }

  function enterCircuit(animate, writeHistory) {
    if (!pageMode) return;
    pageMode = false;
    document.body.classList.add("circuit-on");
    document.body.classList.remove("page-mode");
    clearPageVars();
    syncSkip();
    if (writeHistory !== false) writeHash("", !!animate);
    var motion = !!animate && !reduce.matches;
    if (motion) {
      viewport.classList.add("is-animating");
      void viewport.offsetWidth;
      viewport.style.top = "0";
      viewport.style.left = "0";
      viewport.style.width = "100%";
      viewport.style.height = "100%";
      frame(index);
      settleAnim();
    } else {
      viewport.classList.remove("is-animating");
      snapStage(function () {
        viewport.style.top = "0";
        viewport.style.left = "0";
        viewport.style.width = "100%";
        viewport.style.height = "100%";
        frame(index);
      });
    }
    requestAnimationFrame(function () { drawScope(); });
    var hot = document.querySelector('.hotspot[data-i="' + index + '"]');
    focusIfLost(hot);
  }

  function resolveHash(hash) {
    var raw = (hash || "").replace(/^#/, "");
    if (!raw || raw === "circuit") return -1;
    var legacy = ["current", "charge", "leak", "threshold", "spike", "synapse", "highlights"];
    var start = HASH.indexOf(raw);
    if (start < 0) start = Math.min(5, legacy.indexOf(raw));
    if (raw === "highlights") start = 4;
    if (start < 0 || start > 5) return -1;
    return start;
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
    var dur = Math.max(580, Math.min(1150, 440 + Math.abs(to - from) * 180));
    var t0 = performance.now();
    function tick(now) {
      if (my !== trip) {
        path.remove();
        return;
      }
      var t = Math.min(1, (now - t0) / dur);
      var e = 0.5 - 0.5 * Math.cos(Math.PI * t);
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

    // 01 · About (I(t)): Resting membrane potential V_rest = -65 mV
    pushCurve(pts, -65, -65, 12, 1);
    stops.push(pts.length);

    // 02 · Experience (C): Exponential RC charging toward -55 mV
    pushCurve(pts, -65, -55, 18, 2.2);
    stops.push(pts.length);

    // 03 · Skills (R): Subthreshold leak decay toward V_rest (-58 mV)
    pushCurve(pts, -55, -58, 14, 1.8);
    stops.push(pts.length);

    // 04 · Projects (V >= V_th): Depolarization reaches threshold V_th = -50 mV
    pushCurve(pts, -58, -50, 14, 1.5);
    stops.push(pts.length);

    // 05 · Highlights (Spike): Rapid action potential upstroke to +30 mV peak
    pushCurve(pts, -50, 30, 8, -2.2);
    stops.push(pts.length);

    // 06 · Contact (Synapses): Repolarization & reset to V_reset = -70 mV
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
      var t = Math.min(1, (now - t0) / 760);
      var ease = 0.5 - 0.5 * Math.cos(Math.PI * t);
      reveal = start + (target - start) * ease;
      drawScope();
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function triggerResetSwitch() {
    if (!symReset || !resetBlade) return;
    if (resetTimer) clearTimeout(resetTimer);
    symReset.classList.add("is-hot");
    resetBlade.setAttribute("d", "M442 462 L442 500");
    resetTimer = setTimeout(function () {
      symReset.classList.remove("is-hot");
      resetBlade.setAttribute("d", "M442 462 L460 496");
    }, 650);
  }

  function resetMembrane() {
    triggerResetSwitch();
    if (index !== 0) {
      go(0);
    } else {
      reveal = TRACE_STOP[1];
      setTrace(0);
    }
  }

  function go(i) {
    i = clamp(i);
    if (pageMode) {
      enterPage(i, true);
      return;
    }
    if (i === index) return;
    var from = index;
    index = i;
    var navHint = document.getElementById("nav-hint");
    if (navHint) navHint.classList.add("is-hidden");
    if (i === 0 || (from >= 3 && i < 3)) {
      triggerResetSwitch();
    }
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
      btn.addEventListener("click", function () { enterPage(i, true); });
      minimap.appendChild(btn);
    });
  }

  function buildJumps() {
    NAMES.forEach(function (name, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "inset-jump";
      btn.textContent = "0" + (i + 1);
      btn.setAttribute("aria-label", "0" + (i + 1) + " " + name);
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        enterPage(i, true);
      });
      btn.addEventListener("mouseenter", function () { setCaption(i); });
      btn.addEventListener("focus", function () { setCaption(i); });
      btn.addEventListener("mouseleave", function () { setCaption(index); });
      btn.addEventListener("blur", function () { setCaption(index); });
      insetJumps.appendChild(btn);
    });
  }

  function onWheel(e) {
    if (pageMode) return;
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
    if (Math.abs(wheelAcc) < 85) return;
    wheelAcc = 0;
    wheelLock = performance.now() + 680;
    go(index + (e.deltaY > 0 ? 1 : -1));
  }

  var touchX = null;
  var touchY = null;
  var touchTarget = null;
  var lastTapTime = 0;

  function onTouchStart(e) {
    if (e.touches.length !== 1) return;
    touchX = e.touches[0].clientX;
    touchY = e.touches[0].clientY;
    touchTarget = e.target;
  }

  function handleStageTap(clientX, clientY) {
    var rect = stage.getBoundingClientRect();
    if (!rect.width || !rect.height) return false;
    var sx = ((clientX - rect.left) / rect.width) * 1200;
    var sy = ((clientY - rect.top) / rect.height) * 740;

    // Check reset switch region first (around x: 420..525, y: 445..590)
    var rdx = sx - 462;
    var rdy = sy - 512;
    var resetDist = Math.sqrt(rdx * rdx + rdy * rdy);

    var bestIdx = -1;
    var bestDist = pageMode ? 72 : 125;
    for (var i = 0; i < CAM.length; i++) {
      var dx = sx - CAM[i][0];
      var dy = sy - CAM[i][1];
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }

    if (!pageMode && resetDist < 95 && resetDist <= bestDist) {
      lastTapTime = performance.now();
      resetMembrane();
      return true;
    }
    if (bestIdx >= 0) {
      lastTapTime = performance.now();
      enterPage(bestIdx, true);
      return true;
    }
    if (pageMode) {
      lastTapTime = performance.now();
      enterCircuit(true);
      return true;
    }
    return false;
  }

  function onTouchEnd(e) {
    if (touchY == null || touchX == null) return;
    var x = e.changedTouches[0].clientX;
    var y = e.changedTouches[0].clientY;
    var dx = touchX - x;
    var dy = touchY - y;
    var startEl = touchTarget;
    touchX = null;
    touchY = null;
    touchTarget = null;

    if (pageMode) {
      if (!startEl || !viewport.contains(startEl)) return;
      if (Math.abs(dx) > 22 || Math.abs(dy) > 22) return;
      if (startEl.closest && startEl.closest(".inset-home, .inset-jump, .hotspot")) return;
      handleStageTap(x, y);
      return;
    }

    if (Math.abs(dx) < 22 && Math.abs(dy) < 22) {
      if (viewport && viewport.contains(e.target)) {
        handleStageTap(x, y);
      }
      return;
    }

    if (Math.abs(dy) < 42 && Math.abs(dx) < 42) return;
    if (sections.contains(e.target) && sections.scrollHeight > sections.clientHeight + 4) {
      var atTop = sections.scrollTop <= 0;
      var atBot = sections.scrollTop + sections.clientHeight >= sections.scrollHeight - 2;
      if ((dy < 0 && !atTop) || (dy > 0 && !atBot)) return;
    }
    var delta = Math.abs(dx) > Math.abs(dy) ? dx : dy;
    go(index + (delta > 0 ? 1 : -1));
  }

  buildMinimap();
  buildJumps();

  var persistTitle = document.querySelector(".persist");
  if (persistTitle) {
    persistTitle.style.cursor = "pointer";
    persistTitle.addEventListener("click", function () {
      if (performance.now() - lastTapTime < 350) return;
      if (pageMode) enterCircuit(true);
      else resetMembrane();
    });
  }

  if (insetHome) {
    insetHome.addEventListener("click", function (e) {
      e.stopPropagation();
      enterCircuit(true);
    });
  }

  viewport.addEventListener("click", function (e) {
    if (!pageMode) return;
    if (performance.now() - lastTapTime < 350) return;
    if (e.target.closest(".hotspot, .inset-home, .inset-jump, .sym")) return;
    enterCircuit(true);
  });

  document.querySelectorAll(".hotspot[data-i]").forEach(function (btn) {
    var idx = Number(btn.dataset.i);
    var sym = document.getElementById("sym-" + idx);
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (performance.now() - lastTapTime < 350) return;
      enterPage(idx, true);
    });
    btn.addEventListener("mouseenter", function () {
      if (sym) sym.classList.add("is-hover");
      if (pageMode) setCaption(idx);
    });
    btn.addEventListener("mouseleave", function () {
      if (sym) sym.classList.remove("is-hover");
      if (pageMode) setCaption(index);
    });
    btn.addEventListener("focus", function () {
      if (sym) sym.classList.add("is-hover");
      if (pageMode) setCaption(idx);
    });
    btn.addEventListener("blur", function () {
      if (sym) sym.classList.remove("is-hover");
      if (pageMode) setCaption(index);
    });
    if (sym) {
      sym.addEventListener("click", function (e) {
        e.stopPropagation();
        if (performance.now() - lastTapTime < 350) return;
        enterPage(idx, true);
      });
      sym.addEventListener("mouseenter", function () { sym.classList.add("is-hover"); });
      sym.addEventListener("mouseleave", function () { sym.classList.remove("is-hover"); });
    }
  });

  if (resetBtn && symReset) {
    resetBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (performance.now() - lastTapTime < 350) return;
      if (!pageMode) resetMembrane();
    });
    resetBtn.addEventListener("mouseenter", function () { symReset.classList.add("is-hover"); });
    resetBtn.addEventListener("mouseleave", function () { symReset.classList.remove("is-hover"); });
    resetBtn.addEventListener("focus", function () { symReset.classList.add("is-hover"); });
    resetBtn.addEventListener("blur", function () { symReset.classList.remove("is-hover"); });
    symReset.addEventListener("click", function (e) {
      e.stopPropagation();
      if (performance.now() - lastTapTime < 350) return;
      if (pageMode) enterCircuit(true);
      else resetMembrane();
    });
    symReset.addEventListener("mouseenter", function () { symReset.classList.add("is-hover"); });
    symReset.addEventListener("mouseleave", function () { symReset.classList.remove("is-hover"); });
  }

  prevBtn.addEventListener("click", function () { go(index - 1); });
  nextBtn.addEventListener("click", function () { go(index + 1); });

  document.addEventListener("keydown", function (e) {
    var tag = e.target && e.target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      go(index + 1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      go(index - 1);
    } else if (e.key === "Escape" && pageMode) {
      e.preventDefault();
      enterCircuit(true);
    } else if (e.key === "Enter" && !pageMode && tag !== "BUTTON" && tag !== "A") {
      e.preventDefault();
      enterPage(index, true);
    } else if (!pageMode && e.key === "Home") {
      e.preventDefault();
      go(0);
    } else if (!pageMode && e.key === "End") {
      e.preventDefault();
      go(MAP.length - 1);
    }
  });

  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("touchend", onTouchEnd, { passive: true });
  window.addEventListener("resize", function () {
    if (pageMode) {
      var box = insetBox();
      snapStage(function () {
        applyBox(box);
        fitStage(box);
      });
      layoutPage(box);
    } else {
      frame(index);
    }
    drawScope();
  });
  window.addEventListener("hashchange", function () {
    var next = resolveHash(location.hash);
    if (next < 0) {
      if (pageMode) enterCircuit(true, false);
      return;
    }
    enterPage(next, true, false);
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      if (pageMode) {
        var box = insetBox();
        layoutPage(box);
        snapStage(function () { fitStage(box); });
      } else {
        frame(index);
        drawScope();
      }
    });
  }

  var start = resolveHash(location.hash);
  if (start >= 0) {
    index = start;
    placeSpike(MAP[index]);
    reveal = TRACE_STOP[index];
    enterPage(start, false);
  } else {
    document.body.classList.add("circuit-on");
    syncSkip();
    index = 0;
    placeSpike(MAP[0]);
    frame(0);
    show(0);
    reveal = TRACE_STOP[0];
  }
  app.hidden = false;
  drawScope();
  if (pageMode) {
    requestAnimationFrame(function () {
      var box = insetBox();
      layoutPage(box);
      snapStage(function () { fitStage(box); });
    });
  }
})();
