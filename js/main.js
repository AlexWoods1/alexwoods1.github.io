(function () {
  "use strict";

  var plate = document.getElementById("plate");
  var svg = document.getElementById("circuit");
  var NS = "http://www.w3.org/2000/svg";
  var mobileQuery = window.matchMedia("(max-width: 900px)");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var sparkAnim = null;

  function point(el) {
    var p = plate.getBoundingClientRect();
    var r = el.getBoundingClientRect();
    return {
      x: r.left - p.left + r.width / 2,
      y: r.top - p.top + r.height / 2,
    };
  }

  function visibleNodes(selector) {
    return Array.prototype.filter.call(document.querySelectorAll(selector), function (el) {
      return el.getClientRects().length > 0;
    });
  }

  function clearSvg() {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
  }

  function addPath(d, className) {
    var path = document.createElementNS(NS, "path");
    path.setAttribute("d", d);
    path.setAttribute("class", className);
    svg.appendChild(path);
    return path;
  }

  function labelEnd(node) {
    var label = node.parentElement.querySelector(".label");
    var p = plate.getBoundingClientRect();
    var r = label.getBoundingClientRect();
    return r.left - p.left - 16;
  }

  function layout() {
    if (!plate || !svg) return;
    var rect = plate.getBoundingClientRect();
    svg.setAttribute("viewBox", "0 0 " + rect.width + " " + rect.height);
    clearSvg();

    var terminals = visibleNodes(".terminal .node");
    if (!terminals.length) return;
    var synapses = visibleNodes(".synapse .node");
    var mobile = mobileQuery.matches;
    var parts = [];
    var spineX = point(terminals[0]).x;
    var top;
    var bottom = 0;

    if (mobile) {
      var soma = document.querySelector(".soma").getBoundingClientRect();
      top = soma.bottom - rect.top + 18;
    } else {
      top = point(terminals[0]).y;
    }

    bottom = top;
    terminals.forEach(function (node) {
      bottom = Math.max(bottom, point(node).y);
    });
    synapses.forEach(function (node) {
      bottom = Math.max(bottom, point(node).y);
    });

    if (bottom > top) parts.push("M " + spineX + " " + top + " V " + bottom);

    if (!mobile) {
      terminals.forEach(function (node) {
        var n = point(node);
        var endX = labelEnd(node);
        if (endX > n.x + 8) parts.push("M " + n.x + " " + n.y + " H " + endX);
      });
    }

    addPath(parts.join(" "), "wire");
  }

  function pathToTerminal(node) {
    var n = point(node);
    var mobile = mobileQuery.matches;
    if (mobile) {
      var rect = plate.getBoundingClientRect();
      var soma = document.querySelector(".soma").getBoundingClientRect();
      var top = soma.bottom - rect.top + 18;
      return "M " + n.x + " " + top + " V " + n.y;
    }
    var first = point(document.querySelector(".terminal .node"));
    var endX = labelEnd(node);
    return "M " + first.x + " " + first.y + " V " + n.y + " H " + endX;
  }

  function pathToSynapse(node) {
    var proj = document.querySelector('[data-node="projects"]');
    var p0 = point(proj);
    var s = point(node);
    return "M " + p0.x + " " + p0.y + " V " + s.y;
  }

  function stopSpark() {
    if (sparkAnim) {
      sparkAnim.cancel();
      sparkAnim = null;
    }
    var old = svg.querySelector(".spark");
    if (old) old.remove();
  }

  function travel(d, done) {
    stopSpark();
    if (reduce.matches || !d) {
      done();
      return;
    }
    var path = addPath(d, "spark");
    var len = path.getTotalLength();
    if (!len) {
      path.remove();
      done();
      return;
    }
    var dash = Math.max(22, Math.min(48, len * 0.14));
    path.style.strokeDasharray = dash + " " + len;
    var ms = Math.max(170, Math.min(380, len * 0.42));
    sparkAnim = path.animate(
      [
        { strokeDashoffset: len + dash },
        { strokeDashoffset: 0 },
      ],
      { duration: ms, easing: "cubic-bezier(0.15, 0.7, 0.15, 1)", fill: "forwards" }
    );
    sparkAnim.onfinish = function () {
      stopSpark();
      done();
    };
  }

  function setOpen(button, body, open) {
    button.setAttribute("aria-expanded", open ? "true" : "false");
    body.classList.toggle("is-open", open);
  }

  function syncPlate() {
    var open = !!document.querySelector(".trace-body.is-open");
    plate.classList.toggle("is-open", open);
    layout();
  }

  function closeSynapses(exceptNote) {
    document.querySelectorAll(".synapse").forEach(function (button) {
      var note = document.getElementById(button.getAttribute("aria-controls"));
      if (note && note !== exceptNote) setOpen(button, note, false);
    });
  }

  function closeBranches(exceptBody) {
    document.querySelectorAll(".terminal").forEach(function (button) {
      var body = document.getElementById(button.getAttribute("aria-controls"));
      if (body && body !== exceptBody) {
        setOpen(button, body, false);
        button.closest(".branch").classList.remove("is-open");
      }
    });
    if (!exceptBody || exceptBody.id !== "projects-trace") closeSynapses(null);
  }

  function openBranch(button) {
    var body = document.getElementById(button.getAttribute("aria-controls"));
    var branch = button.closest(".branch");
    var node = button.querySelector(".node");
    var already = button.getAttribute("aria-expanded") === "true";

    if (already) {
      setOpen(button, body, false);
      branch.classList.remove("is-open");
      if (body.id === "projects-trace") closeSynapses(null);
      syncPlate();
      return;
    }

    closeBranches(body);
    syncPlate();
    var d = pathToTerminal(node);
    travel(d, function () {
      setOpen(button, body, true);
      branch.classList.add("is-open");
      syncPlate();
    });
  }

  function openSynapse(button) {
    var note = document.getElementById(button.getAttribute("aria-controls"));
    var node = button.querySelector(".node");
    var already = button.getAttribute("aria-expanded") === "true";
    if (already) {
      setOpen(button, note, false);
      syncPlate();
      return;
    }
    closeSynapses(note);
    syncPlate();
    var d = pathToSynapse(node);
    travel(d, function () {
      setOpen(button, note, true);
      syncPlate();
    });
  }

  document.querySelectorAll(".terminal").forEach(function (button) {
    button.addEventListener("click", function () {
      openBranch(button);
    });
  });

  document.querySelectorAll(".synapse").forEach(function (button) {
    button.addEventListener("click", function () {
      openSynapse(button);
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    closeBranches(null);
    closeSynapses(null);
    syncPlate();
  });

  window.addEventListener("resize", layout);
  if (window.ResizeObserver) new ResizeObserver(layout).observe(plate);
  mobileQuery.addEventListener("change", layout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  layout();
})();
