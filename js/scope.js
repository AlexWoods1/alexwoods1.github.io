/* Membrane oscilloscope trace (τ_m dV/dt = −(V − V_rest) + R·I). */
window.PortfolioScope = function (canvas, vread, reduce) {
  "use strict";
  var ctx = canvas.getContext("2d");
  var LIF = window.PortfolioCircuit.LIF;

  function pushCurve(pts, a, b, n, pow) {
    var p = pow || 1;
    for (var i = 1; i <= n; i++) {
      var t = i / n;
      var eased = p > 0 ? 1 - Math.pow(1 - t, p) : Math.pow(t, -p);
      pts.push(a + (b - a) * eased);
    }
  }

  function buildTraces() {
    var pts = [LIF.V_rest_mV];
    var stops = [];
    pushCurve(pts, LIF.V_rest_mV, LIF.V_rest_mV, 12, 1);
    stops.push(pts.length);
    pushCurve(pts, LIF.V_rest_mV, -55, 18, 2.2);
    stops.push(pts.length);
    pushCurve(pts, -55, -58, 14, 1.8);
    stops.push(pts.length);
    pushCurve(pts, -58, LIF.V_th_mV, 14, 1.5);
    stops.push(pts.length);
    pushCurve(pts, LIF.V_th_mV, LIF.V_spike_peak_mV, 8, -2.2);
    stops.push(pts.length);
    pushCurve(pts, LIF.V_spike_peak_mV, -72, 9, 1.6);
    pushCurve(pts, -72, LIF.V_reset_mV, 9, 1.5);
    stops.push(pts.length);
    return { pts: pts, stops: stops };
  }

  var data = buildTraces();
  var FULL_TRACE = data.pts;
  var TRACE_STOP = data.stops;
  var reveal = TRACE_STOP[0];
  var traceToken = 0;

  function formatMv(v) {
    var rounded = Math.round(v);
    if (rounded < 0) return "−" + Math.abs(rounded) + " mV";
    if (rounded > 0) return "+" + rounded + " mV";
    return "0 mV";
  }

  function draw() {
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
    [LIF.V_th_mV, LIF.V_rest_mV].forEach(function (v) {
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
    var spikeStart = TRACE_STOP[3] - 1;
    var spikeEnd = -1;
    for (var k = spikeStart; k < count; k++) {
      if (FULL_TRACE[k] >= LIF.V_th_mV) spikeEnd = k;
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
    ctx.beginPath();
    ctx.arc(xOf(count - 1), yOf(last), 2.8, 0, Math.PI * 2);
    ctx.fillStyle = last >= LIF.V_th_mV ? "#b42318" : "#141311";
    ctx.fill();
    vread.textContent = formatMv(last);
    canvas.setAttribute(
      "aria-label",
      "Membrane voltage trace, currently " + formatMv(last) +
        (last >= LIF.V_th_mV ? ", at or above threshold" : ", below threshold")
    );
  }

  function setTrace(i) {
    var target = TRACE_STOP[i];
    var my = ++traceToken;
    if (reduce.matches || Math.abs(reveal - target) < 0.5) {
      reveal = target;
      draw();
      return;
    }
    var start = reveal;
    var t0 = performance.now();
    function step(now) {
      if (my !== traceToken) return;
      var t = Math.min(1, (now - t0) / 760);
      var ease = 0.5 - 0.5 * Math.cos(Math.PI * t);
      reveal = start + (target - start) * ease;
      draw();
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  return {
    draw: draw,
    setTrace: setTrace,
    TRACE_STOP: TRACE_STOP,
    getReveal: function () { return reveal; },
    setReveal: function (v) {
      reveal = v;
      draw();
    }
  };
};
