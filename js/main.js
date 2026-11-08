/* Leaky integrate-and-fire membrane, forward Euler.
   Keep these constants in sync with the annotation in index.html.
   τ dV/dt = -(V - V_rest) + R I
   R in MΩ, I in nA → R I in mV. τ = R C = 20 ms. */
(function () {
  "use strict";

  var P = {
    tau: 20,
    r: 10,
    vRest: -65,
    vTh: -50,
    vReset: -70,
    tRef: 2,
    iAmp: 2.5,
    iDur: 20,
    period: 100,
    windowMs: 100,
    sampleMs: 0.5,
    subMs: 0.05,
    vTop: 40,
    vBot: -80,
    vPeak: 30,
  };

  var N = Math.round(P.windowMs / P.sampleMs);
  var motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var reduce = motionQuery.matches;

  var canvas = document.getElementById("scope");
  var fallback = document.getElementById("scope-fallback");
  var vRead = document.getElementById("v-read");
  var spikeRead = document.getElementById("spike-read");
  var lamp = document.getElementById("lamp");
  var lampLabel = document.getElementById("lamp-label");
  var injectBtn = document.getElementById("inject");

  if (ctx) {
    canvas.removeAttribute("aria-hidden");
    canvas.setAttribute("role", "img");
    canvas.setAttribute(
      "aria-label",
      "Live oscilloscope of a leaky integrate-and-fire membrane. Voltage rises during each current pulse, crosses threshold, spikes, and resets. The lower strip is injected current."
    );
    if (fallback) {
      fallback.setAttribute("aria-hidden", "true");
      fallback.removeAttribute("role");
    }
  }

  var state = {
    v: P.vRest,
    t: 0,
    ref: 0,
    injLeft: 0,
    injAmp: 0,
    lastI: 0,
    spikes: 0,
    head: 0,
    live: false,
    volts: new Float32Array(N),
    flags: new Uint8Array(N),
    current: new Float32Array(N),
  };
  state.volts.fill(P.vRest);

  var ctx = canvas && canvas.getContext ? canvas.getContext("2d") : null;
  var view = { w: 0, h: 0 };
  var raf = 0;
  var lampTimer = 0;
  var running = false;

  function pushSample(voltage, spiked, current) {
    state.volts[state.head] = voltage;
    state.flags[state.head] = spiked ? 1 : 0;
    state.current[state.head] = current;
    state.head = (state.head + 1) % N;
  }

  function stepSample() {
    var spiked = false;
    var storedV = state.v;
    var sub = P.subMs;
    for (var acc = 0; acc < P.sampleMs - 1e-6; acc += sub) {
      var phase = state.t % P.period;
      var current = phase < P.iDur ? P.iAmp : 0;
      if (state.injLeft > 0) {
        current += state.injAmp;
        state.injLeft -= sub;
        if (state.injLeft < 0) state.injLeft = 0;
      }
      state.lastI = current;
      if (state.ref > 0) {
        state.ref -= sub;
        state.v = P.vReset;
        storedV = state.v;
      } else {
        state.v += (sub / P.tau) * (-(state.v - P.vRest) + P.r * current);
        if (state.v >= P.vTh) {
          spiked = true;
          storedV = P.vTh;
          state.v = P.vReset;
          state.ref = P.tRef;
          state.spikes += 1;
        } else {
          storedV = state.v;
        }
      }
      state.t += sub;
    }
    pushSample(storedV, spiked, state.lastI);
    if (spiked && state.live) onSpike();
  }

  function preroll() {
    var wasLive = state.live;
    state.live = false;
    var samples = Math.round(150 / P.sampleMs);
    for (var i = 0; i < samples; i += 1) stepSample();
    state.live = wasLive;
  }

  function inject(amp, dur) {
    if (dur >= state.injLeft) state.injAmp = amp;
    else state.injAmp = Math.max(state.injAmp, amp);
    state.injLeft = Math.max(state.injLeft, dur);
  }

  function formatMv(v) {
    var sign = v < 0 ? "−" : "";
    return sign + Math.abs(v).toFixed(1) + " mV";
  }

  function setLamp(mode) {
    if (!lamp || !lampLabel) return;
    lamp.classList.toggle("is-spike", mode === "spike");
    if (mode === "spike") lampLabel.textContent = "Spike";
    else if (mode === "still") lampLabel.textContent = "Reference sweep";
    else lampLabel.textContent = "Integrating";
  }

  function flashLamp() {
    setLamp("spike");
    window.clearTimeout(lampTimer);
    lampTimer = window.setTimeout(function () {
      setLamp(reduce ? "still" : "integrate");
    }, 320);
  }

  function updateReadout() {
    if (vRead) vRead.textContent = formatMv(state.v);
    if (spikeRead) spikeRead.textContent = String(state.spikes);
  }

  function yOf(v, plotY, plotH) {
    return plotY + ((P.vTop - v) / (P.vTop - P.vBot)) * plotH;
  }

  function resize() {
    if (!canvas || !ctx) return;
    var rect = canvas.getBoundingClientRect();
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var w = Math.max(10, rect.width);
    var h = Math.max(10, rect.height);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    view.w = w;
    view.h = h;
    draw();
  }

  function draw() {
    if (!ctx || view.w < 10) return;
    var w = view.w;
    var h = view.h;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#03110d";
    ctx.fillRect(0, 0, w, h);

    var padL = 46;
    var padR = 12;
    var padT = 12;
    var gap = 8;
    var curH = Math.max(28, Math.round(h * 0.16));
    var plotH = h - padT - gap - curH - 16;
    var plotW = w - padL - padR;
    var plotX = padL;
    var plotY = padT;
    var curY = plotY + plotH + gap;

    ctx.font = '11px "IBM Plex Mono", ui-monospace, monospace';
    ctx.textBaseline = "middle";
    ctx.lineWidth = 1;

    /* Voltage grid: 20 mV and 20 ms divisions. */
    ctx.strokeStyle = "rgba(140, 186, 166, 0.16)";
    ctx.fillStyle = "#9fbfb0";
    var volts = [40, 20, 0, -20, -40, -60, -80];
    for (var vi = 0; vi < volts.length; vi += 1) {
      var gy = yOf(volts[vi], plotY, plotH);
      ctx.beginPath();
      ctx.moveTo(plotX, gy);
      ctx.lineTo(plotX + plotW, gy);
      ctx.stroke();
      var label = volts[vi] === 0 ? "0" : String(volts[vi]);
      ctx.textAlign = "right";
      ctx.fillText(label, plotL(plotX), gy);
    }
    for (var d = 0; d <= 5; d += 1) {
      var gx = plotX + (d / 5) * plotW;
      ctx.beginPath();
      ctx.moveTo(gx, plotY);
      ctx.lineTo(gx, plotY + plotH);
      ctx.stroke();
    }

    /* Guides */
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "rgba(215, 230, 220, 0.45)";
    var yRest = yOf(P.vRest, plotY, plotH);
    ctx.beginPath();
    ctx.moveTo(plotX, yRest);
    ctx.lineTo(plotX + plotW, yRest);
    ctx.stroke();
    ctx.strokeStyle = "#ffc14d";
    var yTh = yOf(P.vTh, plotY, plotH);
    ctx.beginPath();
    ctx.moveTo(plotX, yTh);
    ctx.lineTo(plotX + plotW, yTh);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.textAlign = "right";
    ctx.fillStyle = "#d5e4da";
    ctx.fillText("V_rest", plotX + plotW - 8, Math.max(plotY + 12, yRest - 8));
    ctx.fillStyle = "#ffc14d";
    ctx.fillText("V_th", plotX + plotW - 8, Math.max(plotY + 12, yTh - 8));

    /* Membrane trace */
    ctx.beginPath();
    for (var i = 0; i < N; i += 1) {
      var idx = (state.head + i) % N;
      var x = plotX + (i / (N - 1)) * plotW;
      var y = yOf(state.volts[idx], plotY, plotH);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "rgba(138, 246, 212, 0.35)";
    ctx.lineWidth = 3.2;
    ctx.stroke();
    ctx.strokeStyle = "#d8fff4";
    ctx.lineWidth = 1.6;
    ctx.stroke();

    /* Phosphor tip */
    ctx.beginPath();
    var tip = 18;
    for (var t = N - tip; t < N; t += 1) {
      var tidx = (state.head + t) % N;
      var tx = plotX + (t / (N - 1)) * plotW;
      var ty = yOf(state.volts[tidx], plotY, plotH);
      if (t === N - tip) ctx.moveTo(tx, ty);
      else ctx.lineTo(tx, ty);
    }
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.8;
    ctx.stroke();

    /* Spike impulses */
    var yPeak = yOf(P.vPeak, plotY, plotH);
    for (var s = 0; s < N; s += 1) {
      var sidx = (state.head + s) % N;
      if (!state.flags[sidx]) continue;
      var sx = plotX + (s / (N - 1)) * plotW;
      ctx.strokeStyle = "#f4fffb";
      ctx.lineWidth = 1.7;
      ctx.beginPath();
      ctx.moveTo(sx, yTh);
      ctx.lineTo(sx, yPeak);
      ctx.stroke();
      ctx.fillStyle = "#8af6d4";
      ctx.beginPath();
      ctx.arc(sx, yPeak, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }

    /* Current strip */
    ctx.fillStyle = "rgba(140, 186, 166, 0.12)";
    ctx.fillRect(plotX, curY, plotW, curH);
    ctx.fillStyle = "#9fbfb0";
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.fillText("nA", plotL(plotX), curY + 2);
    ctx.textAlign = "left";
    ctx.fillText("I(t)", plotX + 4, curY + 2);

    var iMax = 6;
    var baseY = curY + curH - 4;
    ctx.beginPath();
    ctx.moveTo(plotX, baseY);
    var lastX = plotX;
    for (var c = 0; c < N; c += 1) {
      var cidx = (state.head + c) % N;
      var cx = plotX + (c / (N - 1)) * plotW;
      var norm = Math.max(0, Math.min(1, state.current[cidx] / iMax));
      var cy = baseY - norm * (curH - 16);
      ctx.lineTo(cx, cy);
      lastX = cx;
    }
    ctx.lineTo(lastX, baseY);
    ctx.closePath();
    ctx.fillStyle = "rgba(232, 196, 138, 0.28)";
    ctx.fill();
    ctx.beginPath();
    for (var c2 = 0; c2 < N; c2 += 1) {
      var cidx2 = (state.head + c2) % N;
      var cx2 = plotX + (c2 / (N - 1)) * plotW;
      var norm2 = Math.max(0, Math.min(1, state.current[cidx2] / iMax));
      var cy2 = baseY - norm2 * (curH - 16);
      if (c2 === 0) ctx.moveTo(cx2, cy2);
      else ctx.lineTo(cx2, cy2);
    }
    ctx.strokeStyle = "#e8c48a";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  function plotL(plotX) {
    return plotX - 6;
  }

  function onSpike() {
    flashLamp();
    propagate();
  }

  var TRAVEL = 1700;
  var RAIL = 700;

  function propagate() {
    if (reduce) return;
    var spine = document.querySelector(".spine");
    var spineOn = spine && window.getComputedStyle(spine).display !== "none";
    if (spineOn && spine.getBoundingClientRect().height > 40) {
      launchSpine(spine);
    } else {
      launchRail(document.querySelector("[data-rail='hero']"));
      launchRail(document.querySelector("[data-rail='projects']"));
    }
  }

  function launchRail(rail) {
    if (!rail) return;
    var dot = document.createElement("span");
    dot.className = "rail-dot";
    rail.appendChild(dot);
    window.setTimeout(function () {
      dot.remove();
    }, RAIL + 200);
  }

  function launchSpine(spine) {
    if (spine.querySelectorAll(".pulse").length >= 3) return;
    launchRail(document.querySelector("[data-rail='hero']"));
    var pulse = document.createElement("span");
    pulse.className = "pulse";
    spine.appendChild(pulse);
    window.setTimeout(function () {
      pulse.remove();
    }, TRAVEL + 200);

    var rect = spine.getBoundingClientRect();
    var height = rect.height || 1;
    document.querySelectorAll(".via").forEach(function (via) {
      var y = via.getBoundingClientRect().top + 6 - rect.top;
      var delay = Math.max(0, Math.min(1, y / height)) * TRAVEL;
      window.setTimeout(function () {
        heat(via);
        if (via.dataset.fireRail) {
          launchRail(document.querySelector("[data-rail='" + via.dataset.fireRail + "']"));
        }
      }, delay);
    });
  }

  function heat(via) {
    via.classList.add("hot");
    window.setTimeout(function () {
      via.classList.remove("hot");
    }, 360);
  }

  function glint(card) {
    card.classList.add("is-firing");
    window.setTimeout(function () {
      if (!card.matches(":hover") && !card.contains(document.activeElement)) {
        card.classList.remove("is-firing");
      }
    }, 420);
  }

  function revealInject() {
    if (!reduce) return;
    var guard = 0;
    while (state.injLeft > 0 && guard < 80) {
      stepSample();
      guard += 1;
    }
    draw();
    updateReadout();
    flashLamp();
  }

  function arm(card) {
    var now = performance.now();
    if (card._lock && now - card._lock < 650) return;
    card._lock = now;
    glint(card);
    inject(4, 16);
    revealInject();
  }

  function loop() {
    if (!running) return;
    stepSample();
    draw();
    if (state.head % 4 === 0) updateReadout();
    raf = window.requestAnimationFrame(loop);
  }

  function start() {
    if (running || reduce) return;
    running = true;
    state.live = true;
    setLamp("integrate");
    raf = window.requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    state.live = false;
    if (raf) window.cancelAnimationFrame(raf);
    raf = 0;
  }

  function applyMotion() {
    reduce = motionQuery.matches;
    document.documentElement.classList.toggle("reduce-motion", reduce);
    if (reduce) {
      stop();
      setLamp("still");
      draw();
      updateReadout();
    } else {
      start();
    }
  }

  preroll();
  state.spikes = 0;
  for (var n = 0; n < N; n += 1) {
    if (state.flags[n]) state.spikes += 1;
  }
  updateReadout();

  if (ctx) {
    resize();
    window.addEventListener("resize", resize);
    if (window.ResizeObserver) {
      new ResizeObserver(resize).observe(canvas);
    }
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(draw);
    }
  }

  applyMotion();
  if (motionQuery.addEventListener) {
    motionQuery.addEventListener("change", applyMotion);
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop();
    else applyMotion();
  });

  if (injectBtn) {
    injectBtn.addEventListener("click", function () {
      inject(4.5, 18);
      revealInject();
    });
  }

  document.querySelectorAll("[data-synapse]").forEach(function (card) {
    card.addEventListener("pointerenter", function () {
      arm(card);
    });
    card.addEventListener("focusin", function () {
      arm(card);
    });
    card.addEventListener("pointerleave", function () {
      if (!card.contains(document.activeElement)) card.classList.remove("is-firing");
    });
    card.addEventListener("focusout", function () {
      window.setTimeout(function () {
        if (!card.matches(":hover") && !card.contains(document.activeElement)) {
          card.classList.remove("is-firing");
        }
      }, 0);
    });
  });

  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".site-nav a"));
  var sections = navLinks
    .map(function (link) {
      var id = link.getAttribute("href");
      return id && id.charAt(0) === "#" ? document.querySelector(id) : null;
    })
    .filter(Boolean);

  function setCurrent(id) {
    navLinks.forEach(function (link) {
      if (link.getAttribute("href") === "#" + id) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setCurrent(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -48% 0px", threshold: 0.01 }
    );
    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  setCurrent("about");
})();
