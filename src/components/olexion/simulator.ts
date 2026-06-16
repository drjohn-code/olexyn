/* ============================================================
   OLEXION — simulator
   Ported from the design bundle's js/simulator.js. Logic preserved; wrapped
   as an init function returning a cleanup for client-side use.
   ============================================================ */

export function initSimulator(): () => void {
  const $ = <T extends Element = Element>(s: string, r: ParentNode = document) =>
    r.querySelector<T>(s);
  const $$ = <T extends Element = Element>(s: string, r: ParentNode = document) =>
    Array.from(r.querySelectorAll<T>(s));

  const form = $<HTMLFormElement>("#simForm");
  const stats = $$<HTMLElement>(".stat");
  const savVol = $<HTMLElement>("#savVol");
  const savCost = $<HTMLElement>("#savCost");
  const volInput = $<HTMLInputElement>("#f-volume");
  const priceInput = $<HTMLInputElement>("#f-price");

  if (!form || !savVol || !savCost || !volInput || !priceInput) {
    return () => {};
  }

  let disposed = false;
  const FUEL_SAVE = 0.15; // 15% less fuel

  function animateCount(el: HTMLElement) {
    const target = parseFloat(el.dataset.target || "0");
    const dec = parseInt(el.dataset.decimals || "0", 10);
    const suffix = el.dataset.suffix || "";
    const dur = 1100;
    const t0 = performance.now();
    function step(t: number) {
      if (disposed) return;
      const k = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      const val = (target * e).toFixed(dec);
      el.textContent = val + suffix;
      if (k < 1) requestAnimationFrame(step);
      else el.textContent = target.toFixed(dec) + suffix;
    }
    requestAnimationFrame(step);
  }

  const fmtInt = (n: number) => Math.round(n).toLocaleString("en-US");

  function computeSavings() {
    const vol = parseFloat(volInput!.value) || 0; // m³ / year
    const price = parseFloat(priceInput!.value) || 0; // € / litre
    const litres = vol * 1000;
    const litresSaved = litres * FUEL_SAVE;
    const m3Saved = vol * FUEL_SAVE;
    const costSaved = litresSaved * price;
    savVol!.textContent = fmtInt(m3Saved) + " m³";
    savCost!.textContent = "€ " + fmtInt(costSaved);
  }

  let hasRun = false;
  function run() {
    stats.forEach((s, i) => {
      s.classList.add("run");
      const val = $<HTMLElement>(".stat-val", s);
      if (val) setTimeout(() => animateCount(val), i * 110);
    });
    computeSavings();
    hasRun = true;
  }

  const onSubmit = (e: Event) => { e.preventDefault(); run(); };
  form.addEventListener("submit", onSubmit);

  const onInput = () => { if (hasRun) computeSavings(); };
  [volInput, priceInput].forEach((el) => el.addEventListener("input", onInput));

  // auto-run once the panel scrolls into view (first time)
  const panel = $<HTMLElement>(".sim-results");
  let io: IntersectionObserver | null = null;
  if (panel && "IntersectionObserver" in window) {
    io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting && !hasRun) { run(); io?.disconnect(); }
      });
    }, { threshold: 0.4 });
    io.observe(panel);
  }

  return () => {
    disposed = true;
    form.removeEventListener("submit", onSubmit);
    [volInput, priceInput].forEach((el) => el.removeEventListener("input", onInput));
    io?.disconnect();
  };
}
