/* Full-circuit framing and inset map layout. */
window.PortfolioCamera = function (stage, persistTitle) {
  "use strict";
  var CAM = window.PortfolioCircuit.CAM;

  function frame(i, vw, vh) {
    var mobile = vw <= 860;
    var nwp = CAM[i];
    var scale;
    var margin = 6;
    var chromeBottom = 52;
    var chromeTop = 34;
    if (mobile) {
      scale = Math.max(0.44, Math.min(0.62, vw / 720));
    } else {
      scale = Math.min((vw - margin * 2) / 1200, (vh - chromeTop - chromeBottom) / 740, 1.65);
      if (vw >= 1100) scale = Math.max(1.12, scale);
      else scale = Math.max(1.02, scale);
    }
    var ax = 0.5;
    var ay = mobile ? 0.42 : 0.49;
    var cx = mobile ? nwp[0] * 0.65 + 560 * 0.35 : nwp[0] * 0.6 + 600 * 0.4;
    var cy = mobile ? nwp[1] * 0.65 + 370 * 0.35 : nwp[1] * 0.74 + 370 * 0.26;
    var tx = vw * ax - cx * scale;
    var ty = vh * ay - cy * scale;
    if (!mobile) {
      var sw = 1200 * scale;
      var sh = 740 * scale;
      tx = Math.max(vw - margin - sw, Math.min(margin, tx));
      ty = Math.max(vh - chromeBottom - sh, Math.min(chromeTop, ty));
    }
    stage.style.transform =
      "translate(" + tx.toFixed(1) + "px," + ty.toFixed(1) + "px) scale(" + scale.toFixed(3) + ")";
  }

  function safeBottom() {
    var probe = document.createElement("div");
    probe.style.cssText =
      "position:fixed;left:0;bottom:0;padding-bottom:env(safe-area-inset-bottom);visibility:hidden;pointer-events:none;";
    document.body.appendChild(probe);
    var h = probe.offsetHeight || 0;
    probe.remove();
    return h;
  }

  function insetBox(vw, vh) {
    var mobile = vw <= 860;
    var gap = mobile ? 10 : 24;
    var width;
    var height;
    if (mobile) {
      width = Math.max(160, vw - gap * 2);
      height = vh < 520 ? 156 : 184;
    } else {
      width = Math.min(560, Math.max(460, Math.round(vw * 0.36)));
      height = Math.round(width * 0.66);
    }
    var safe = mobile ? safeBottom() : 0;
    var top;
    var left;
    if (mobile) {
      top = Math.max(0, Math.round(vh - height - gap - safe));
      left = Math.max(gap, Math.round(vw - width - gap));
    } else {
      var topChrome = 16;
      top = topChrome;
      left = Math.max(gap, Math.round(vw - width - gap));
    }
    return {
      mobile: mobile,
      gap: gap,
      safe: safe,
      top: top,
      left: left,
      width: width,
      height: height,
      header: 32,
      footer: mobile ? 44 : 0
    };
  }

  function applyBox(viewport, box) {
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
    stage.style.transform =
      "translate(" + tx.toFixed(1) + "px," + ty.toFixed(1) + "px) scale(" + scale.toFixed(4) + ")";
  }

  function snapStage(fn) {
    stage.classList.add("is-morphing");
    fn();
    void stage.offsetWidth;
    requestAnimationFrame(function () {
      stage.classList.remove("is-morphing");
    });
  }

  function applyFull(viewport) {
    viewport.style.top = "0";
    viewport.style.left = "0";
    viewport.style.width = "100%";
    viewport.style.height = "100%";
  }

  function layoutPage(box) {
    var root = document.documentElement.style;
    root.setProperty("--inset-w", box.width + "px");
    root.setProperty("--inset-gap", box.gap + "px");
    if (box.mobile) {
      root.setProperty("--page-top", "0px");
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

  return {
    frame: frame,
    insetBox: insetBox,
    applyBox: applyBox,
    fitStage: fitStage,
    snapStage: snapStage,
    layoutPage: layoutPage,
    clearPageVars: clearPageVars,
    applyFull: applyFull
  };
};
