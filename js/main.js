(function () {
  "use strict";

  var CFG = window.PortfolioCircuit;
  var WAY = CFG.WAY;
  var MAP = CFG.MAP;
  var CAM = CFG.CAM;
  var NAMES = CFG.NAMES;
  var HASH = CFG.HASH;
  var MORPH_MS = CFG.MORPH_MS;
  var PANEL_MS = 540;

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
  var persistTitle = document.querySelector(".persist");

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var scope = window.PortfolioScope(canvas, vread, reduce);
  var cam = window.PortfolioCamera(stage, persistTitle);
  var TRACE_STOP = scope.TRACE_STOP;

  var index = 0;
  var pageMode = false;
  var trip = 0;
  var animTimer = null;
  var morphLock = false;
  var settleEnd = null;
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

  function isMobileViewport() {
    return (document.documentElement.clientWidth || window.innerWidth) <= 860;
  }

  function allowChromeMotion(animate) {
    return !!animate && !reduce.matches && !isMobileViewport();
  }

  function allowPanelSwap(animate) {
    return !!animate && !reduce.matches && !isMobileViewport();
  }

  function frame(i) {
    var vw = viewport.clientWidth || document.documentElement.clientWidth || window.innerWidth;
    var vh = viewport.clientHeight || window.innerHeight;
    cam.frame(i, vw, vh);
  }

  function clearPanelMotion() {
    var panels = sections.querySelectorAll("section");
    var clear = [
      "is-panel-active",
      "panel-motion",
      "panel-pre-enter",
      "panel-exit-left",
      "panel-exit-right",
      "panel-enter-left",
      "panel-enter-right"
    ];
    for (var n = 0; n < panels.length; n++) {
      for (var c = 0; c < clear.length; c++) {
        panels[n].classList.remove(clear[c]);
      }
    }
  }

  function show(i, motion) {
    var panels = sections.querySelectorAll("section");
    var opts = motion || {};
    var prevIdx = -1;
    for (var q = 0; q < panels.length; q++) {
      if (panels[q].classList.contains("is-on")) prevIdx = q;
    }
    var swap =
      pageMode &&
      allowPanelSwap(opts.animate) &&
      typeof opts.from === "number" &&
      prevIdx >= 0 &&
      prevIdx !== i;
    if (swap) {
      var dir = i > opts.from ? 1 : -1;
      var prev = panels[prevIdx];
      var next = panels[i];
      clearPanelMotion();
      prev.classList.remove("is-on");
      var exitCls = dir > 0 ? "panel-exit-left" : "panel-exit-right";
      var enterCls = dir > 0 ? "panel-enter-right" : "panel-enter-left";
      prev.classList.add("is-panel-active", "panel-motion", exitCls);
      next.classList.add("is-on", "is-panel-active", "panel-pre-enter", enterCls);
      sections.style.minHeight = Math.max(prev.offsetHeight, next.offsetHeight) + "px";
      void next.offsetWidth;
      next.classList.remove("panel-pre-enter", enterCls);
      next.classList.add("panel-motion");
      var ended = false;
      function settle() {
        if (ended) return;
        ended = true;
        sections.style.minHeight = "";
        prev.classList.remove("is-panel-active", "panel-motion", exitCls);
        next.classList.remove("panel-motion");
      }
      prev.addEventListener("transitionend", function (e) {
        if (e.target === prev && (e.propertyName === "transform" || e.propertyName === "opacity")) settle();
      });
      setTimeout(settle, PANEL_MS + 80);
    } else {
      clearPanelMotion();
      for (var p = 0; p < panels.length; p++) {
        panels[p].classList.toggle("is-on", p === i);
      }
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

  function viewportMetrics() {
    return {
      vw: document.documentElement.clientWidth || window.innerWidth,
      vh: window.innerHeight
    };
  }

  function insetBox() {
    var m = viewportMetrics();
    return cam.insetBox(m.vw, m.vh);
  }

  function layoutPage(box) {
    if (!pageMode) return;
    cam.layoutPage(box || insetBox());
  }

  function cancelMorph() {
    if (!morphLock && !viewport.classList.contains("is-animating")) return;
    if (animTimer) {
      clearTimeout(animTimer);
      animTimer = null;
    }
    if (settleEnd) {
      viewport.removeEventListener("transitionend", settleEnd);
      settleEnd = null;
    }
    morphLock = false;
    viewport.classList.remove("is-animating");
  }

  function settleAnim(onDone) {
    if (animTimer) clearTimeout(animTimer);
    if (settleEnd) {
      viewport.removeEventListener("transitionend", settleEnd);
      settleEnd = null;
    }
    var finished = false;
    function done() {
      if (finished) return;
      finished = true;
      morphLock = false;
      viewport.classList.remove("is-animating");
      animTimer = null;
      settleEnd = null;
      if (onDone) onDone();
    }
    function onEnd(e) {
      if (e.target !== viewport) return;
      if (e.propertyName !== "width" && e.propertyName !== "height") return;
      done();
    }
    settleEnd = onEnd;
    viewport.addEventListener("transitionend", onEnd);
    animTimer = setTimeout(done, MORPH_MS + 120);
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
    if (pageMode) {
      show(i, { animate: !!animate, from: from });
      if (writeHistory !== false) writeHash(HASH[i], !!animate);
      if (moved) {
        travel(from, i);
        scope.setTrace(i);
      }
      scrollPageTop();
      return;
    }
    if (morphLock) cancelMorph();
    pageMode = true;
    document.body.classList.remove("circuit-on");
    document.body.classList.add("page-mode");
    if (allowChromeMotion(animate)) {
      document.body.classList.add("page-chrome-enter");
    } else {
      document.body.classList.add("page-chrome-visible");
    }
    syncSkip();
    var motion = !!animate && !reduce.matches;
    var box = insetBox();
    if (motion) {
      morphLock = true;
      if (animTimer) clearTimeout(animTimer);
      viewport.classList.remove("is-animating");
      cam.snapStage(function () { cam.fitStage(box); });
      viewport.classList.add("is-animating");
      void viewport.offsetWidth;
      cam.applyBox(viewport, box);
      settleAnim(function () {
        var next = insetBox();
        cam.snapStage(function () { cam.fitStage(next); });
        layoutPage(next);
        document.body.classList.remove("page-chrome-enter", "page-chrome-visible");
      });
    } else {
      cam.snapStage(function () {
        cam.applyBox(viewport, box);
        cam.fitStage(box);
      });
    }
    layoutPage(box);
    show(i, { animate: false, from: from });
    void sections.offsetWidth;
    if (motion) {
      requestAnimationFrame(function () {
        if (!pageMode) return;
        document.body.classList.add("page-chrome-visible");
      });
    }
    if (writeHistory !== false) writeHash(HASH[i], !!animate);
    var navHint = document.getElementById("nav-hint");
    if (navHint) navHint.classList.add("is-hidden");
    if (moved) {
      travel(from, i);
      scope.setTrace(i);
    }
    scrollPageTop();
    focusIfLost(insetHome);
    requestAnimationFrame(function () {
      if (!pageMode) return;
      var next = insetBox();
      layoutPage(next);
      if (!motion) cam.snapStage(function () { cam.fitStage(next); });
      scrollPageTop();
    });
  }

  function enterCircuit(animate, writeHistory) {
    if (!pageMode) return;
    if (morphLock) cancelMorph();
    if (writeHistory !== false) writeHash("", !!animate);
    var motion = !!animate && !reduce.matches;
    function leavePageMode() {
      pageMode = false;
      document.documentElement.classList.add("chrome-instant");
      document.body.classList.add("circuit-on");
      document.body.classList.remove(
        "page-mode",
        "page-chrome-enter",
        "page-chrome-visible",
        "page-chrome-exit"
      );
      document.documentElement.classList.remove("chrome-instant");
      cam.clearPageVars();
      syncSkip();
    }
    if (motion) {
      morphLock = true;
      if (animTimer) clearTimeout(animTimer);
      if (allowChromeMotion(animate)) {
        document.body.classList.add("page-chrome-exit");
        document.body.classList.remove("page-chrome-enter", "page-chrome-visible");
      }
      viewport.classList.remove("is-animating");
      var inset = insetBox();
      cam.snapStage(function () { cam.fitStage(inset); });
      viewport.classList.add("is-animating");
      void viewport.offsetWidth;
      cam.applyFull(viewport);
      settleAnim(function () {
        leavePageMode();
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            cam.snapStage(function () { frame(index); });
            scope.draw();
          });
        });
      });
    } else {
      leavePageMode();
      viewport.classList.remove("is-animating");
      cam.snapStage(function () {
        cam.applyFull(viewport);
        frame(index);
      });
      scope.draw();
    }
    var hot = document.querySelector('.hotspot[data-i="' + index + '"]');
    focusIfLost(hot);
  }

  function resolveHash(hash) {
    var raw = (hash || "").replace(/^#/, "");
    if (!raw || raw === "circuit") return -1;
    var legacy = CFG.LEGACY_HASH;
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
      scope.setReveal(TRACE_STOP[1]);
      scope.setTrace(0);
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
    scope.setTrace(i);
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
      if (startEl && startEl.closest && startEl.closest("#sections, .persist, .inset-jumps")) return;
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
      cam.snapStage(function () {
        cam.applyBox(viewport, box);
        cam.fitStage(box);
      });
      layoutPage(box);
    } else {
      frame(index);
    }
    scope.draw();
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
        cam.snapStage(function () { cam.fitStage(box); });
      } else {
        frame(index);
        scope.draw();
      }
    });
  }

  var start = resolveHash(location.hash);
  if (start >= 0) {
    index = start;
    placeSpike(MAP[index]);
    scope.setReveal(TRACE_STOP[index]);
    enterPage(start, false);
  } else {
    document.body.classList.add("circuit-on");
    syncSkip();
    index = 0;
    placeSpike(MAP[0]);
    frame(0);
    show(0);
    scope.setReveal(TRACE_STOP[0]);
  }
  app.hidden = false;
  scope.draw();
  if (pageMode) {
    requestAnimationFrame(function () {
      var box = insetBox();
      layoutPage(box);
      cam.snapStage(function () { cam.fitStage(box); });
    });
  }
})();
