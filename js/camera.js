/* Full-circuit framing and inset map layout. */
window.PortfolioCamera = function (stage, persistTitle) {
  "use strict";

  var CFG = window.PortfolioCircuit;
  var CAM = CFG.CAM;
  var BP = CFG.BREAKPOINTS;
  var SCHEM = CFG.SCHEMATIC;
  var INS = CFG.INSET;

  function calcMobileFrame(nwp, vw, vh) {
    var scale = Math.max(0.44, Math.min(0.62, vw / 720));
    var cx = nwp[0] * 0.65 + 560 * 0.35;
    var cy = nwp[1] * 0.65 + 370 * 0.35;
    return {
      scale: scale,
      tx: vw * 0.5 - cx * scale,
      ty: vh * 0.42 - cy * scale
    };
  }

  function calcDesktopFrame(nwp, vw, vh) {
    var margin = 6;
    var chromeBottom = 52;
    var chromeTop = 34;
    var scale = Math.min((vw - margin * 2) / SCHEM.WIDTH, (vh - chromeTop - chromeBottom) / SCHEM.HEIGHT, 1.65);
    if (vh >= BP.SHORT_DESKTOP_VH) {
      if (vw >= BP.WIDE_DESKTOP_VW) scale = Math.max(1.12, scale);
      else scale = Math.max(1.02, scale);
    }
    var cx = nwp[0] * 0.6 + 600 * 0.4;
    var cy = nwp[1] * 0.74 + 370 * 0.26;
    var tx = vw * 0.5 - cx * scale;
    var ty = vh * 0.49 - cy * scale;
    var sw = SCHEM.WIDTH * scale;
    var sh = SCHEM.HEIGHT * scale;
    tx = Math.max(vw - margin - sw, Math.min(margin, tx));
    ty = Math.max(vh - chromeBottom - sh, Math.min(chromeTop, ty));
    return {
      scale: scale,
      tx: tx,
      ty: ty
    };
  }

  function frame(i, vw, vh) {
    var mobile = vw <= BP.MOBILE_WIDTH;
    var f = mobile ? calcMobileFrame(CAM[i], vw, vh) : calcDesktopFrame(CAM[i], vw, vh);
    stage.style.transform =
      "translate(" + f.tx.toFixed(1) + "px," + f.ty.toFixed(1) + "px) scale(" + f.scale.toFixed(3) + ")";
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

  function calcMobileInset(vw, vh, gap) {
    var width = Math.max(160, vw - gap * 2);
    var height;
    var header;
    var footer;
    if (vh < BP.ULTRA_SHORT_MOBILE_VH) {
      header = INS.HEADER_ULTRA_SHORT;
      footer = INS.FOOTER_ULTRA_SHORT;
      height = Math.max(154, Math.min(188, Math.round(vh * 0.44)));
    } else if (vh < BP.SHORT_MOBILE_VH) {
      header = INS.HEADER_SHORT_MOBILE;
      footer = INS.FOOTER_SHORT_MOBILE;
      height = Math.min(220, Math.max(198, Math.round(vh * 0.39)));
    } else {
      header = INS.HEADER_DEFAULT;
      footer = INS.FOOTER_MOBILE;
      height = Math.min(256, Math.max(220, Math.round(vh * 0.29)));
    }
    return {
      width: width,
      height: height,
      header: header,
      footer: footer
    };
  }

  function calcDesktopInset(vw) {
    var width = Math.min(640, Math.max(440, Math.round(vw * 0.40)));
    var height = Math.round(width * 0.58);
    return {
      width: width,
      height: height,
      header: INS.HEADER_DEFAULT,
      footer: INS.FOOTER_DESKTOP
    };
  }

  function insetBox(vw, vh) {
    var mobile = vw <= BP.MOBILE_WIDTH;
    var gap = mobile ? INS.GAP_MOBILE : INS.GAP_DESKTOP;
    var metrics = mobile ? calcMobileInset(vw, vh, gap) : calcDesktopInset(vw);
    var safe = mobile ? safeBottom() : 0;
    return {
      mobile: mobile,
      gap: gap,
      safe: safe,
      top: Math.max(0, Math.round(vh - metrics.height - gap - safe)),
      left: Math.max(gap, Math.round(vw - metrics.width - gap)),
      width: metrics.width,
      height: metrics.height,
      header: metrics.header,
      footer: metrics.footer
    };
  }

  function applyBox(viewport, box) {
    viewport.style.top = box.top + "px";
    viewport.style.left = box.left + "px";
    viewport.style.width = box.width + "px";
    viewport.style.height = box.height + "px";
  }

  function fitStage(box) {
    var padX = box.mobile ? (box.width < 360 ? INS.PAD_X_MOBILE_NARROW : INS.PAD_X_MOBILE) : INS.PAD_X_DESKTOP;
    var padY = box.mobile ? (box.height < 210 ? INS.PAD_Y_MOBILE_SHORT : INS.PAD_Y_MOBILE) : INS.PAD_Y_DESKTOP;
    var innerW = box.width - padX * 2;
    var availH = box.height - box.header - box.footer;
    var innerH = availH - padY * 2;
    if (innerW < 40 || innerH < 40) return;
    var scale = Math.min(innerW / SCHEM.BOUNDS_W, innerH / SCHEM.BOUNDS_H);
    var tx = box.width * 0.5 - SCHEM.CENTER_X * scale;
    var ty = box.header + availH * 0.5 - SCHEM.CENTER_Y * scale;
    stage.style.setProperty("--minimap-stroke", (1.35 / scale).toFixed(3) + "px");
    stage.style.setProperty("--minimap-hot-stroke", (2.4 / scale).toFixed(3) + "px");
    stage.style.transform =
      "translate(" + tx.toFixed(1) + "px," + ty.toFixed(1) + "px) scale(" + scale.toFixed(4) + ")";
  }

  function snapStage(fn) {
    stage.classList.add("is-morphing");
    fn();
    void stage.offsetWidth;
    stage.classList.remove("is-morphing");
    void stage.offsetWidth;
  }

  function applyFull(viewport) {
    viewport.style.top = "0";
    viewport.style.left = "0";
    viewport.style.width = "100%";
    viewport.style.height = "100%";
  }

  function applyFullPx(viewport, vw, vh) {
    viewport.style.top = "0px";
    viewport.style.left = "0px";
    viewport.style.width = vw + "px";
    viewport.style.height = vh + "px";
  }

  function layoutPage(box) {
    var root = document.documentElement.style;
    root.setProperty("--inset-w", box.width + "px");
    root.setProperty("--inset-gap", box.gap + "px");
    root.setProperty("--inset-header", box.header + "px");
    root.setProperty("--inset-footer", box.footer + "px");
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
    root.removeProperty("--inset-header");
    root.removeProperty("--inset-footer");
  }

  return {
    frame: frame,
    insetBox: insetBox,
    applyBox: applyBox,
    fitStage: fitStage,
    snapStage: snapStage,
    layoutPage: layoutPage,
    clearPageVars: clearPageVars,
    applyFull: applyFull,
    applyFullPx: applyFullPx
  };
};
