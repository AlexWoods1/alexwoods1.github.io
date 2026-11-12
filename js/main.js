(function () {
  "use strict";

  var CFG = window.PortfolioCircuit;
  var WAY = CFG.WAY;
  var MAP = CFG.MAP;
  var CAM = CFG.CAM;
  var NAMES = CFG.NAMES;
  var HASH = CFG.HASH;
  var TIMING = CFG.TIMING;
  var BP = CFG.BREAKPOINTS;
  var SCHEM = CFG.SCHEMATIC;

  // Cached DOM Elements
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
  var insetBar = document.getElementById("inset-bar");
  var insetHome = document.getElementById("inset-home");
  var insetCaption = document.getElementById("inset-caption");
  var insetJumps = document.getElementById("inset-jumps");
  var controlsEl = document.querySelector(".controls");
  var resetBtn = document.getElementById("reset-btn");
  var symReset = document.getElementById("sym-reset");
  var resetBlade = document.getElementById("reset-blade");
  var persistTitle = document.querySelector(".persist");
  var navHint = document.getElementById("nav-hint");
  var skipLink = document.querySelector(".skip");
  var schematicEl = document.querySelector(".schematic");
  var lightbox = document.getElementById("schematic-lightbox");
  var lightboxImg = document.getElementById("schematic-lightbox-img");
  var lightboxTitle = document.getElementById("schematic-lightbox-title");
  var lightboxClose = document.getElementById("schematic-lightbox-close");
  var panelElements = sections.querySelectorAll("section");
  var hotspotEls = Array.prototype.slice.call(document.querySelectorAll(".hotspot[data-i]"));
  var symEls = MAP.map(function (_, s) { return document.getElementById("sym-" + s); });

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var scope = window.PortfolioScope(canvas, vread, reduce);
  var cam = window.PortfolioCamera(stage, persistTitle);
  var TRACE_STOP = scope.TRACE_STOP;

  // Application State
  var index = 0;
  var pageMode = false;
  var trip = 0;
  var wheelAcc = 0;
  var wheelLock = 0;
  var resetTimer = null;
  var lastTapTime = 0;
  var lastInputWasKeyboard = false;

  function canFineHover() {
    return !!(window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches);
  }

  function preventPointerFocus(el) {
    if (!el) return;
    el.addEventListener("mousedown", function (e) {
      e.preventDefault();
    });
  }

  function clearStaleControlFocus() {
    var active = document.activeElement;
    if (!active || !active.closest) return;
    if (active.closest(".hotspot, #inset-home, .inset-jump, #minimap, .controls")) {
      active.blur();
    }
  }

  // Unified Transition Controller
  var transition = {
    isMorphing: false,
    isExiting: false,
    animTimer: null,
    unclipTimer: null,
    settleListener: null,

    cancel: function () {
      if (this.animTimer) {
        clearTimeout(this.animTimer);
        this.animTimer = null;
      }
      if (this.unclipTimer) {
        clearTimeout(this.unclipTimer);
        this.unclipTimer = null;
      }
      if (this.settleListener) {
        viewport.removeEventListener("transitionend", this.settleListener);
        this.settleListener = null;
      }
      this.isMorphing = false;
      this.isExiting = false;
      viewport.classList.remove("is-animating", "is-unclipped");
    },

    startMorph: function () {
      this.cancel();
      this.isMorphing = true;
      viewport.classList.add("is-animating");
      void viewport.offsetWidth;
    },

    scheduleUnclip: function (delayMs) {
      var self = this;
      if (self.unclipTimer) clearTimeout(self.unclipTimer);
      self.unclipTimer = setTimeout(function () {
        self.unclipTimer = null;
        if (self.isMorphing && self.isExiting) {
          viewport.classList.add("is-unclipped");
        }
      }, delayMs);
    },

    settle: function (onComplete) {
      var self = this;
      var settled = false;
      function complete() {
        if (settled) return;
        settled = true;
        self.cancel();
        if (onComplete) onComplete();
      }
      self.settleListener = function (e) {
        if (e.target !== viewport) return;
        if (
          e.propertyName === "width" ||
          e.propertyName === "height" ||
          e.propertyName === "top" ||
          e.propertyName === "left"
        ) {
          complete();
        }
      };
      viewport.addEventListener("transitionend", self.settleListener);
      self.animTimer = setTimeout(complete, TIMING.MORPH_MS + TIMING.SETTLE_BUFFER_MS);
    }
  };

  // Helper Functions
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
    return (document.documentElement.clientWidth || window.innerWidth) <= BP.MOBILE_WIDTH;
  }

  function allowChromeMotion(animate) {
    return !!animate && !reduce.matches;
  }

  function allowPanelSwap(animate) {
    return !!animate && !reduce.matches && !isMobileViewport();
  }

  function viewportMetrics() {
    var rootW = document.documentElement.clientWidth || window.innerWidth;
    var bodyW = document.body ? document.body.clientWidth : 0;
    var vw = (document.documentElement.classList.contains("page-gutter") && bodyW > 0)
      ? Math.min(rootW, bodyW)
      : rootW;
    return {
      vw: vw,
      vh: window.innerHeight
    };
  }

  function frame(i) {
    var m = viewportMetrics();
    cam.frame(i, m.vw, m.vh);
  }

  function insetBox() {
    var m = viewportMetrics();
    return cam.insetBox(m.vw, m.vh);
  }

  function layoutPage(box) {
    if (!pageMode) return;
    cam.layoutPage(box || insetBox());
  }

  function syncMinimapGeometry(box) {
    var b = box || insetBox();
    cam.snapStage(function () {
      cam.applyBox(viewport, b);
      cam.fitStage(b);
    });
    layoutPage(b);
    return b;
  }

  function syncViewportState() {
    if (transition.isMorphing && transition.isExiting) {
      var fullVw = window.innerWidth || document.documentElement.clientWidth;
      var fullVh = window.innerHeight;
      cam.applyFullPx(viewport, fullVw, fullVh);
      cam.frame(index, fullVw, fullVh);
      return;
    }
    if (transition.isMorphing && pageMode) {
      var b = insetBox();
      layoutPage(b);
      var bAfter = insetBox();
      if (
        bAfter.width !== b.width ||
        bAfter.height !== b.height ||
        bAfter.left !== b.left ||
        bAfter.top !== b.top
      ) {
        b = bAfter;
        layoutPage(b);
      }
      cam.applyBox(viewport, b);
      cam.fitStage(b);
      return;
    }
    if (pageMode) {
      syncMinimapGeometry();
    } else {
      frame(index);
    }
  }

  function captureChromeStyles() {
    var vpStyle = window.getComputedStyle(viewport);
    return {
      bg: vpStyle.backgroundColor,
      shadow: vpStyle.boxShadow,
      barOp: insetBar ? window.getComputedStyle(insetBar).opacity : "",
      jumpsOp: insetJumps ? window.getComputedStyle(insetJumps).opacity : ""
    };
  }

  function applyInlineChrome(snapshot) {
    if (!snapshot) return;
    viewport.style.backgroundColor = snapshot.bg;
    viewport.style.boxShadow = snapshot.shadow;
    if (insetBar) insetBar.style.opacity = snapshot.barOp;
    if (insetJumps) insetJumps.style.opacity = snapshot.jumpsOp;
  }

  function clearInlineChrome() {
    viewport.style.backgroundColor = "";
    viewport.style.boxShadow = "";
    if (insetBar) insetBar.style.opacity = "";
    if (insetJumps) insetJumps.style.opacity = "";
  }

  function clearChromeMotionStyles() {
    sections.style.transform = "";
    sections.style.opacity = "";
    sections.style.top = "";
    clearInlineChrome();
    if (controlsEl) {
      controlsEl.style.transition = "";
      controlsEl.style.right = "";
      controlsEl.style.bottom = "";
    }
  }

  function hideNavHint() {
    if (navHint) navHint.classList.add("is-hidden");
  }

  function isTapThrottled() {
    return performance.now() - lastTapTime < TIMING.TAP_COOLDOWN_MS;
  }

  function toggleSectionOrCircuit(idx) {
    lastTapTime = performance.now();
    if (pageMode && !transition.isExiting && idx === index) {
      enterCircuit(true);
    } else {
      enterPage(idx, true);
    }
  }

  function clearPanelMotion() {
    var clear = [
      "is-panel-active",
      "panel-motion",
      "panel-pre-enter",
      "panel-exit-left",
      "panel-exit-right",
      "panel-enter-left",
      "panel-enter-right"
    ];
    for (var n = 0; n < panelElements.length; n++) {
      for (var c = 0; c < clear.length; c++) {
        panelElements[n].classList.remove(clear[c]);
      }
    }
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

  function writeHash(hash, push) {
    var desired = hash ? "#" + hash : "";
    if ((location.hash || "") === desired) return;
    var url = hash ? "#" + hash : (location.pathname + location.search);
    if (push) history.pushState(null, "", url);
    else history.replaceState(null, "", url);
  }

  function syncSkip() {
    if (!skipLink) return;
    if (pageMode) {
      skipLink.setAttribute("href", "#sections");
    } else if (isMobileViewport()) {
      skipLink.setAttribute("href", "#prev");
    } else {
      skipLink.setAttribute("href", "#minimap");
    }
  }

  function scrollPageTop() {
    var root = document.documentElement;
    var prev = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    if (isMobileViewport()) sections.scrollTop = 0;
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

  // Section Display & Transition Logic
  function show(i, motion) {
    updateSectionPanels(i, motion);
    syncNavIndicators(i);
  }

  function updateSectionPanels(i, motion) {
    var opts = motion || {};
    var prevIdx = -1;
    for (var q = 0; q < panelElements.length; q++) {
      if (panelElements[q].classList.contains("is-on")) prevIdx = q;
    }
    var swap =
      pageMode &&
      allowPanelSwap(opts.animate) &&
      typeof opts.from === "number" &&
      prevIdx >= 0 &&
      prevIdx !== i;
    if (swap) {
      var dir = i > opts.from ? 1 : -1;
      var prev = panelElements[prevIdx];
      var next = panelElements[i];
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
        next.classList.remove("is-panel-active", "panel-motion");
      }
      prev.addEventListener("transitionend", function (e) {
        if (e.target === prev && (e.propertyName === "transform" || e.propertyName === "opacity")) settle();
      });
      setTimeout(settle, TIMING.PANEL_MS + TIMING.PANEL_SETTLE_BUFFER_MS);
    } else {
      clearPanelMotion();
      for (var p = 0; p < panelElements.length; p++) {
        panelElements[p].classList.toggle("is-on", p === i);
      }
    }
  }

  function syncNavIndicators(i) {
    var active = document.activeElement;
    var buttons = minimap.querySelectorAll("button");
    var jumps = insetJumps ? insetJumps.querySelectorAll("button") : [];

    if (active && active !== document.body && active !== document.documentElement) {
      var hotIdx = hotspotEls.indexOf(active);
      if (hotIdx >= 0 && hotIdx !== i) {
        if (lastInputWasKeyboard && hotspotEls[i]) hotspotEls[i].focus({ preventScroll: true });
        else active.blur();
      } else if (active === resetBtn) {
        if (lastInputWasKeyboard && !pageMode && hotspotEls[i]) hotspotEls[i].focus({ preventScroll: true });
        else active.blur();
      } else if (minimap && minimap.contains(active) && active !== buttons[i]) {
        if (lastInputWasKeyboard && buttons[i]) buttons[i].focus({ preventScroll: true });
        else active.blur();
      } else if (insetJumps && insetJumps.contains(active) && active !== jumps[i]) {
        if (lastInputWasKeyboard && jumps[i]) jumps[i].focus({ preventScroll: true });
        else active.blur();
      }
      active = document.activeElement;
    }

    var fineHover = canFineHover() && !lastInputWasKeyboard;
    for (var s = 0; s < MAP.length; s++) {
      if (!symEls[s]) continue;
      symEls[s].classList.toggle("is-hot", s === i);
      var keepHover =
        (lastInputWasKeyboard && active === hotspotEls[s]) ||
        (fineHover && (
          (hotspotEls[s] && hotspotEls[s].matches(":hover")) ||
          symEls[s].matches(":hover")
        ));
      if (!keepHover) symEls[s].classList.remove("is-hover");
    }
    if (
      symReset &&
      !(lastInputWasKeyboard && active === resetBtn) &&
      !(fineHover && ((resetBtn && resetBtn.matches(":hover")) || symReset.matches(":hover")))
    ) {
      symReset.classList.remove("is-hover");
    }

    for (var b = 0; b < buttons.length; b++) {
      if (b === i) buttons[b].setAttribute("aria-current", "true");
      else buttons[b].removeAttribute("aria-current");
    }
    markCurrent(insetJumps, i);
    for (var h = 0; h < hotspotEls.length; h++) {
      if (h === i) hotspotEls[h].setAttribute("aria-current", "true");
      else hotspotEls[h].removeAttribute("aria-current");
    }
    prevBtn.disabled = i === 0;
    nextBtn.disabled = i === MAP.length - 1;
    stepEl.textContent = "0" + (i + 1) + " / 06 · " + NAMES[i];
    flow.setAttribute("d", pathThrough(0, MAP[i]));
    setCaption(i);
  }

  // Mode Routers & State Transitions
  function enterPage(i, animate, writeHistory) {
    i = clamp(i);
    var isExiting = transition.isExiting || document.body.classList.contains("page-chrome-exit");
    if (pageMode && !isExiting) {
      if (i === index) return;
      switchSectionInPage(i, animate, writeHistory);
    } else {
      transitionCircuitToPage(i, animate, writeHistory);
    }
  }

  function switchSectionInPage(targetIndex, animate, writeHistory) {
    var from = index;
    var moved = targetIndex !== index;
    var vwBefore = viewportMetrics().vw;
    index = targetIndex;
    show(targetIndex, { animate: !!animate, from: from });
    if (writeHistory !== false) writeHash(HASH[targetIndex], !!animate);
    if (moved) {
      travel(from, targetIndex);
      scope.setTrace(targetIndex);
    }
    scrollPageTop();
    if (!transition.isMorphing && viewportMetrics().vw !== vwBefore) {
      syncMinimapGeometry();
    }
  }

  function transitionCircuitToPage(targetIndex, animate, writeHistory) {
    var from = index;
    var moved = targetIndex !== index;
    index = targetIndex;

    var wasAnimating = viewport.classList.contains("is-animating");
    var startRect = wasAnimating ? viewport.getBoundingClientRect() : null;
    var startTransform = wasAnimating ? window.getComputedStyle(stage).transform : null;
    var startChrome = wasAnimating ? captureChromeStyles() : null;
    var desktopEnter = !isMobileViewport();
    var prevCtrlRect = (desktopEnter && controlsEl) ? controlsEl.getBoundingClientRect() : null;
    var fullStartVw = window.innerWidth || document.documentElement.clientWidth;
    var fullStartVh = window.innerHeight;
    transition.cancel();
    clearChromeMotionStyles();

    var motion = allowChromeMotion(animate);

    if (motion) {
      cam.snapStage(function () {
        if (startRect && startRect.width > 0 && startRect.height > 0) {
          viewport.style.top = startRect.top + "px";
          viewport.style.left = startRect.left + "px";
          viewport.style.width = startRect.width + "px";
          viewport.style.height = startRect.height + "px";
          if (startTransform && startTransform !== "none") {
            stage.style.transform = startTransform;
          }
        } else {
          cam.applyFullPx(viewport, fullStartVw, fullStartVh);
        }
        if (startChrome) applyInlineChrome(startChrome);
        if (prevCtrlRect && prevCtrlRect.width > 0) {
          controlsEl.style.transition = "none";
        }
      });
    } else {
      document.documentElement.classList.add("chrome-instant");
    }

    pageMode = true;
    document.documentElement.classList.add("page-gutter");
    document.body.classList.remove("circuit-on", "page-chrome-exit", "page-chrome-visible");
    document.body.classList.add("page-mode");

    if (motion) {
      document.body.classList.add("page-chrome-enter");
    }

    syncSkip();
    show(targetIndex, { animate: false, from: from });
    scrollPageTop();

    var m = viewportMetrics();
    var box = cam.insetBox(m.vw, m.vh);
    layoutPage(box);
    var mAfter = viewportMetrics();
    if (mAfter.vw !== m.vw || mAfter.vh !== m.vh) {
      box = cam.insetBox(mAfter.vw, mAfter.vh);
      layoutPage(box);
    }

    if (motion) {
      if (prevCtrlRect && prevCtrlRect.width > 0) {
        controlsEl.style.right = Math.max(0, mAfter.vw - prevCtrlRect.right) + "px";
        controlsEl.style.bottom = Math.max(0, mAfter.vh - prevCtrlRect.bottom) + "px";
      }
      void sections.offsetWidth;
      void viewport.offsetWidth;
      transition.startMorph();
      if (controlsEl && controlsEl.style.transition) {
        void controlsEl.offsetWidth;
        controlsEl.style.transition = "";
        void controlsEl.offsetWidth;
        controlsEl.style.right = "";
        controlsEl.style.bottom = "";
      }
      clearInlineChrome();
      cam.applyBox(viewport, box);
      cam.fitStage(box);
      document.body.classList.add("page-chrome-visible");

      transition.settle(function () {
        if (!pageMode) return;
        syncMinimapGeometry();
        document.body.classList.remove("page-chrome-enter", "page-chrome-visible");
        clearChromeMotionStyles();
      });
    } else {
      cam.snapStage(function () {
        cam.applyBox(viewport, box);
        cam.fitStage(box);
      });
      document.body.classList.remove("page-chrome-enter", "page-chrome-visible");
      void viewport.offsetWidth;
      document.documentElement.classList.remove("chrome-instant");
    }

    if (writeHistory !== false) writeHash(HASH[targetIndex], !!animate);
    hideNavHint();
    if (moved) {
      travel(from, targetIndex);
      scope.setTrace(targetIndex);
    }
    focusIfLost(insetHome);

    if (!motion) {
      requestAnimationFrame(function () {
        if (!pageMode || transition.isMorphing) return;
        syncMinimapGeometry();
        scrollPageTop();
      });
    }
  }

  function enterCircuit(animate, writeHistory) {
    if (!pageMode) return;
    var wasAnimating = viewport.classList.contains("is-animating");
    var startRect = viewport.getBoundingClientRect();
    var startTransform = wasAnimating ? window.getComputedStyle(stage).transform : null;
    var startChrome = captureChromeStyles();
    var desktopExit = !isMobileViewport();
    var prevCtrlRect = (desktopExit && controlsEl) ? controlsEl.getBoundingClientRect() : null;
    var startScrollY = desktopExit ? (window.scrollY || document.documentElement.scrollTop || 0) : 0;

    transition.cancel();
    clearChromeMotionStyles();
    if (writeHistory !== false) writeHash("", !!animate);
    var motion = allowChromeMotion(animate);

    if (motion) {
      var m = viewportMetrics();
      var inset = cam.insetBox(m.vw, m.vh);
      var fullVw = window.innerWidth || m.vw;
      var fullVh = window.innerHeight || m.vh;

      cam.snapStage(function () {
        if (startRect && startRect.width > 0 && startRect.height > 0) {
          viewport.style.top = startRect.top + "px";
          viewport.style.left = startRect.left + "px";
          viewport.style.width = startRect.width + "px";
          viewport.style.height = startRect.height + "px";
        } else {
          cam.applyBox(viewport, inset);
        }
        if (wasAnimating && startTransform && startTransform !== "none") {
          stage.style.transform = startTransform;
        } else {
          cam.fitStage(inset);
        }
        applyInlineChrome(startChrome);
        if (prevCtrlRect && prevCtrlRect.width > 0) {
          controlsEl.style.transition = "none";
          controlsEl.style.right = Math.max(0, fullVw - prevCtrlRect.right) + "px";
          controlsEl.style.bottom = Math.max(0, fullVh - prevCtrlRect.bottom) + "px";
        }
        if (startScrollY > 0) {
          sections.style.top = (-startScrollY) + "px";
        }
      });

      document.documentElement.classList.remove("page-gutter");
      document.body.classList.add("page-chrome-exit");
      document.body.classList.remove("page-chrome-enter", "page-chrome-visible");
      transition.startMorph();
      transition.isExiting = true;
      transition.scheduleUnclip(75);

      if (controlsEl && controlsEl.style.transition) {
        void controlsEl.offsetWidth;
        controlsEl.style.transition = "";
        void controlsEl.offsetWidth;
        controlsEl.style.right = "";
        controlsEl.style.bottom = "";
      }
      clearInlineChrome();

      cam.applyFullPx(viewport, fullVw, fullVh);
      cam.frame(index, fullVw, fullVh);
      transition.settle(function () {
        leavePageMode();
        cam.snapStage(function () {
          cam.applyFull(viewport);
          frame(index);
        });
        scope.draw();
        focusIfLost(hotspotEls[index]);
      });
    } else {
      leavePageMode();
      viewport.classList.remove("is-animating", "is-unclipped");
      cam.snapStage(function () {
        cam.applyFull(viewport);
        frame(index);
      });
      scope.draw();
    }
    var hot = document.querySelector('.hotspot[data-i="' + index + '"]');
    focusIfLost(hot);
  }

  function leavePageMode() {
    pageMode = false;
    transition.isExiting = false;
    document.documentElement.classList.add("chrome-instant");
    document.documentElement.classList.remove("page-gutter");
    document.body.classList.add("circuit-on");
    document.body.classList.remove("page-mode", "page-chrome-enter", "page-chrome-visible", "page-chrome-exit");
    void document.body.offsetWidth;
    document.documentElement.classList.remove("chrome-instant");
    clearChromeMotionStyles();
    cam.clearPageVars();
    syncSkip();
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
    schematicEl.appendChild(path);
    var len = path.getTotalLength();
    if (!len) {
      path.remove();
      placeSpike(b);
      if (done) done();
      return;
    }
    var dur = Math.max(
      TIMING.TRAVEL_MIN_MS,
      Math.min(TIMING.TRAVEL_MAX_MS, TIMING.TRAVEL_BASE_MS + Math.abs(to - from) * TIMING.TRAVEL_STEP_MS)
    );
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
    }, TIMING.RESET_SWITCH_MS);
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
    hideNavHint();
    if (i === 0 || (from >= 3 && i < 3)) {
      triggerResetSwitch();
    }
    frame(i);
    show(i);
    travel(from, i);
    scope.setTrace(i);
    sections.scrollTop = 0;
  }

  // Builder Functions
  function buildMinimap() {
    NAMES.forEach(function (name, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = "0" + (i + 1) + " " + name;
      preventPointerFocus(btn);
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
      preventPointerFocus(btn);
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        enterPage(i, true);
      });
      btn.addEventListener("mouseenter", function () { if (canFineHover()) setCaption(i); });
      btn.addEventListener("focus", function () { if (lastInputWasKeyboard) setCaption(i); });
      btn.addEventListener("mouseleave", function () { setCaption(index); });
      btn.addEventListener("blur", function () { setCaption(index); });
      insetJumps.appendChild(btn);
    });
  }

  // Input Handlers
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
    wheelLock = performance.now() + TIMING.WHEEL_COOLDOWN_MS;
    go(index + (e.deltaY > 0 ? 1 : -1));
  }

  var touchX = null;
  var touchY = null;
  var touchTarget = null;

  function onTouchStart(e) {
    if (e.touches.length !== 1) return;
    touchX = e.touches[0].clientX;
    touchY = e.touches[0].clientY;
    touchTarget = e.target;
  }

  function handleStageTap(clientX, clientY) {
    var rect = stage.getBoundingClientRect();
    if (!rect.width || !rect.height) return false;
    var sx = ((clientX - rect.left) / rect.width) * SCHEM.WIDTH;
    var sy = ((clientY - rect.top) / rect.height) * SCHEM.HEIGHT;

    var rdx = sx - SCHEM.RESET_SWITCH.X;
    var rdy = sy - SCHEM.RESET_SWITCH.Y;
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

    if (!pageMode && resetDist < SCHEM.RESET_SWITCH.RADIUS && resetDist <= bestDist) {
      lastTapTime = performance.now();
      resetMembrane();
      return true;
    }
    if (bestIdx >= 0) {
      toggleSectionOrCircuit(bestIdx);
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
      if (startEl.closest && startEl.closest(".inset-home, .inset-jump, .hotspot, .sym")) return;
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

  function bindEventListeners() {
    if (persistTitle) {
      persistTitle.style.cursor = "pointer";
      persistTitle.addEventListener("click", function () {
        if (isTapThrottled()) return;
        if (pageMode) enterCircuit(true);
        else resetMembrane();
      });
    }

    document.addEventListener("mousedown", function () {
      lastInputWasKeyboard = false;
      clearStaleControlFocus();
    }, true);

    document.addEventListener("touchstart", function () {
      lastInputWasKeyboard = false;
      clearStaleControlFocus();
    }, { capture: true, passive: true });

    if (insetHome) {
      preventPointerFocus(insetHome);
      insetHome.addEventListener("click", function (e) {
        e.stopPropagation();
        enterCircuit(true);
      });
    }

    viewport.addEventListener("click", function (e) {
      if (!pageMode) return;
      if (isTapThrottled()) return;
      if (e.target.closest(".hotspot, .inset-home, .inset-jump, .sym")) return;
      enterCircuit(true);
    });

    hotspotEls.forEach(function (btn) {
      var idx = Number(btn.dataset.i);
      var sym = symEls[idx];
      preventPointerFocus(btn);
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        if (isTapThrottled()) return;
        toggleSectionOrCircuit(idx);
      });
      btn.addEventListener("mouseenter", function () {
        if (!canFineHover()) return;
        if (sym) sym.classList.add("is-hover");
        if (pageMode) setCaption(idx);
      });
      btn.addEventListener("mouseleave", function () {
        if (sym && !(lastInputWasKeyboard && document.activeElement === btn)) {
          sym.classList.remove("is-hover");
        }
        if (pageMode) setCaption(index);
      });
      btn.addEventListener("focus", function () {
        var visible = lastInputWasKeyboard || (btn.matches && btn.matches(":focus-visible"));
        if (visible && sym) sym.classList.add("is-hover");
        if (visible && pageMode) setCaption(idx);
      });
      btn.addEventListener("blur", function () {
        if (sym && !(canFineHover() && (btn.matches(":hover") || sym.matches(":hover")))) {
          sym.classList.remove("is-hover");
        }
        if (pageMode) setCaption(index);
      });
      if (sym) {
        sym.addEventListener("click", function (e) {
          e.stopPropagation();
          if (isTapThrottled()) return;
          toggleSectionOrCircuit(idx);
        });
        sym.addEventListener("mouseenter", function () {
          if (canFineHover()) sym.classList.add("is-hover");
        });
        sym.addEventListener("mouseleave", function () {
          if (!(lastInputWasKeyboard && document.activeElement === btn)) {
            sym.classList.remove("is-hover");
          }
        });
      }
    });

    if (resetBtn && symReset) {
      preventPointerFocus(resetBtn);
      resetBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        if (isTapThrottled()) return;
        hideNavHint();
        if (!pageMode) resetMembrane();
      });
      resetBtn.addEventListener("mouseenter", function () {
        if (canFineHover()) symReset.classList.add("is-hover");
      });
      resetBtn.addEventListener("mouseleave", function () {
        if (!(lastInputWasKeyboard && document.activeElement === resetBtn)) {
          symReset.classList.remove("is-hover");
        }
      });
      resetBtn.addEventListener("focus", function () {
        var visible = lastInputWasKeyboard || (resetBtn.matches && resetBtn.matches(":focus-visible"));
        if (visible) symReset.classList.add("is-hover");
        hideNavHint();
      });
      resetBtn.addEventListener("blur", function () { symReset.classList.remove("is-hover"); });
      symReset.addEventListener("click", function (e) {
        e.stopPropagation();
        if (isTapThrottled()) return;
        if (pageMode) enterCircuit(true);
        else resetMembrane();
      });
      symReset.addEventListener("mouseenter", function () {
        if (canFineHover()) symReset.classList.add("is-hover");
      });
      symReset.addEventListener("mouseleave", function () {
        if (!(lastInputWasKeyboard && document.activeElement === resetBtn)) {
          symReset.classList.remove("is-hover");
        }
      });
    }

    preventPointerFocus(prevBtn);
    preventPointerFocus(nextBtn);
    prevBtn.addEventListener("click", function () { go(index - 1); });
    nextBtn.addEventListener("click", function () { go(index + 1); });

    if (lightbox && lightboxImg) {
      sections.addEventListener("click", function (e) {
        var zoomBtn = e.target.closest && e.target.closest(".schematic-zoom");
        if (!zoomBtn) return;
        var src = zoomBtn.getAttribute("data-schematic-src");
        if (!src) return;
        var innerImg = zoomBtn.querySelector("img");
        lightboxImg.src = src;
        lightboxImg.alt = innerImg ? innerImg.alt : "";
        if (lightboxTitle) {
          lightboxTitle.textContent = zoomBtn.getAttribute("data-schematic-title") || "Schematic";
        }
        if (typeof lightbox.showModal === "function") lightbox.showModal();
        else lightbox.setAttribute("open", "");
      });
      if (lightboxClose) {
        lightboxClose.addEventListener("click", function () {
          if (typeof lightbox.close === "function") lightbox.close();
          else lightbox.removeAttribute("open");
        });
      }
      lightbox.addEventListener("click", function (e) {
        if (e.target === lightbox) {
          if (typeof lightbox.close === "function") lightbox.close();
          else lightbox.removeAttribute("open");
        }
      });
    }

    document.addEventListener("keydown", function (e) {
      if (lightbox && lightbox.open) return;
      var tag = e.target && e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (
        e.key === "Tab" ||
        e.key === "ArrowRight" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.key === "Home" ||
        e.key === "End" ||
        e.key === "Enter" ||
        e.key === "Escape" ||
        e.key === " "
      ) {
        lastInputWasKeyboard = true;
      }
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
      syncViewportState();
      syncSkip();
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
        syncViewportState();
        if (!pageMode) scope.draw();
      });
    }
  }

  // Application Bootstrap
  buildMinimap();
  buildJumps();
  bindEventListeners();

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
      if (pageMode && !transition.isMorphing) syncMinimapGeometry();
    });
  }
})();
