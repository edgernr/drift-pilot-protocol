/* ==========================================================================
   VOID HUNTER — interactions
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- Nav scroll state ---------- */
  const nav = document.getElementById("nav");
  function onScroll() {
    if (window.scrollY > 30) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Corner brackets injection ---------- */
  document.querySelectorAll("[data-bracket]").forEach((el) => {
    ["tl", "tr", "bl", "br2"].forEach((c) => {
      const s = document.createElement("span");
      s.className = "br " + c;
      el.appendChild(s);
    });
  });

  /* ---------- Gate particles (rising embers) ---------- */
  const pLayer = document.getElementById("gateParticles");
  if (pLayer) {
    const COUNT = 26;
    for (let i = 0; i < COUNT; i++) {
      const p = document.createElement("span");
      p.className = "p";
      const left = 18 + Math.random() * 64; // keep within the core column
      const dur = 4 + Math.random() * 5;
      const delay = Math.random() * 6;
      const size = 2 + Math.random() * 2.5;
      p.style.left = left + "%";
      p.style.width = size + "px";
      p.style.height = size + "px";
      p.style.animationDuration = dur + "s";
      p.style.animationDelay = "-" + delay + "s";
      // gold embers occasionally
      if (Math.random() > 0.82) {
        p.style.background = "var(--gold-bright)";
        p.style.boxShadow = "0 0 8px rgba(245,196,83,0.9)";
      }
      pLayer.appendChild(p);
    }
  }

  /* ---------- Scroll reveal + bar/track fills ---------- */
  const revealEls = document.querySelectorAll(".reveal, [data-fill]");
  function fillBars(el) {
    el.querySelectorAll("[data-fill]").forEach((bar) => {
      const i = bar.querySelector("i");
      if (i) requestAnimationFrame(() => { i.style.width = bar.getAttribute("data-fill") + "%"; });
    });
    if (el.matches("[data-fill]")) {
      const i = el.querySelector("i");
      if (i) requestAnimationFrame(() => { i.style.width = el.getAttribute("data-fill") + "%"; });
    }
  }
  if (!("IntersectionObserver" in window)) {
    revealEls.forEach((el) => { el.classList.add("in"); fillBars(el); });
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target;
          el.classList.add("in");
          fillBars(el);
          io.unobserve(el);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
    /* Failsafe: if anything is still hidden well after load (e.g. odd scroll
       container), reveal it so content is never permanently invisible. */
    window.addEventListener("load", () => {
      setTimeout(() => {
        document.querySelectorAll(".reveal:not(.in)").forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.top < window.innerHeight) { el.classList.add("in"); fillBars(el); }
        });
      }, 600);
    });
  }

  /* ---------- Journey track fill ---------- */
  const track = document.getElementById("journeyTrack");
  if (track) {
    const trackIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const i = track.querySelector("i");
            if (i) requestAnimationFrame(() => { i.style.width = "100%"; });
            trackIO.unobserve(track);
          }
        });
      },
      { threshold: 0.4 }
    );
    trackIO.observe(track);
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq-q").forEach((q) => {
    q.addEventListener("click", () => {
      const item = q.closest(".faq-item");
      const isOpen = item.classList.contains("open");
      // close siblings
      item.parentElement.querySelectorAll(".faq-item.open").forEach((o) => {
        if (o !== item) o.classList.remove("open");
      });
      item.classList.toggle("open", !isOpen);
    });
  });
})();
