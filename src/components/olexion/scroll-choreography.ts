/* ============================================================
   OLEXION — scroll choreography
   Ported from the design bundle's js/scroll.js. The logic is preserved
   verbatim; it is wrapped as an init function that runs client-side after
   mount and returns a cleanup so React (incl. StrictMode dev double-mount)
   can tear down listeners / rAF loops cleanly.
   ============================================================ */

export function initScrollChoreography(): () => void {
  const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const smooth = (t: number) => t * t * (3 - 2 * t);
  const easeIO = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  // symmetric bell: 1 at center, 0 at center±halfWidth
  const bell = (p: number, center: number, halfW: number) => {
    const d = Math.abs(p - center) / halfW;
    return clamp(1 - smooth(clamp(d, 0, 1)), 0, 1);
  };
  const range = (p: number, a: number, b: number) => clamp((p - a) / (b - a), 0, 1);

  const $ = <T extends Element = Element>(s: string) => document.querySelector<T>(s);

  // ---- elements ----
  const body = document.body;
  const heroAct = $<HTMLElement>("#hero-act");
  const emAct = $<HTMLElement>("#emissions-act");
  const visionAct = $<HTMLElement>("#vision");
  const valSec = $<HTMLElement>("#validation");
  const simSec = $<HTMLElement>("#simulator");
  const footer = $<HTMLElement>(".footer");

  const video = $<HTMLVideoElement>("#heroVideo");
  const bgCanvas = $<HTMLCanvasElement>("#bgCanvas");
  const glass = $<HTMLElement>("#heroGlass");
  const heroCut = $<HTMLElement>("#heroCut");
  const heroBg = $<HTMLElement>("#heroBg");
  const scrollHint = $<HTMLElement>("#scrollHint");
  const revealFormula = $<HTMLElement>("#revealFormula");
  const revealIgnition = $<HTMLElement>("#revealIgnition");
  const revealEmissions = $<HTMLElement>("#revealEmissions");
  const heroDark = $<HTMLElement>("#heroDark");
  const vignette = $<HTMLElement>(".hero-vignette");
  const visionImg = $<HTMLImageElement>("#visionImg");

  // bail out (no-op cleanup) if the hero scaffolding isn't present
  if (
    !heroAct || !emAct || !visionAct || !video || !bgCanvas || !glass ||
    !heroCut || !heroBg || !scrollHint || !revealFormula || !revealIgnition ||
    !revealEmissions || !heroDark || !vignette || !visionImg
  ) {
    return () => {};
  }
  const bgCtx = bgCanvas.getContext("2d");
  if (!bgCtx) return () => {};

  const engines = Array.from(document.querySelectorAll<HTMLElement>(".engine"));
  const vtexts = Array.from(document.querySelectorAll<HTMLElement>(".vtext"));

  // ---- teardown registry ----
  let disposed = false;
  let rafId = 0;
  let safetyTimer: ReturnType<typeof setTimeout> | undefined;
  let objectUrl: string | null = null;
  const teardown: Array<() => void> = [];

  // ---- video → frame cache (scroll-scrubbed background) ----
  // Seeking a PAUSED <video> does not decode a new frame in some engines, so a
  // canvas fed by a seeking decoder would freeze on one frame. Instead we play the
  // clip through ONCE at load and cache decoded frames (via requestVideoFrameCallback),
  // then draw the NEAREST cached frame per scroll — smooth, seek-free, works everywhere.
  let VDUR = 9.86;
  const V_START = 10 / 30; // begin the scrub a few frames in
  const V_INTRO = 10 / 30; // frame shown during the glass intro
  const onLoadedMeta = () => { VDUR = video.duration || VDUR; };
  video.addEventListener("loadedmetadata", onLoadedMeta);
  teardown.push(() => video.removeEventListener("loadedmetadata", onLoadedMeta));

  const frames: Array<{ t: number; canvas: HTMLCanvasElement }> = []; // decoded frame cache (full 30fps)
  let framesReady = false, videoReady = false;
  const CAP_MAX_W = 640; // cache resolution (bg is blurred/stylised → downscale ok)
  const CAP_MIN_DT = 0.03; // ≈30fps cache cadence (captures every frame)
  let capDim: { w: number; h: number } | null = null;
  let lastCapT = -1;

  function storeFrame() {
    const vw = video!.videoWidth, vh = video!.videoHeight;
    if (!vw || !vh) return;
    if (!capDim) { const s = Math.min(1, CAP_MAX_W / vw); capDim = { w: Math.round(vw * s), h: Math.round(vh * s) }; }
    const c = document.createElement("canvas");
    c.width = capDim.w; c.height = capDim.h;
    c.getContext("2d")!.drawImage(video!, 0, 0, c.width, c.height);
    frames.push({ t: video!.currentTime, canvas: c });
    if (!videoReady) { videoReady = true; }
  }
  function captureFrame(now: number, meta?: VideoFrameCallbackMetadata) {
    if (disposed) return;
    const t = meta ? meta.mediaTime : video!.currentTime;
    if (frames.length === 0 || t - lastCapT >= CAP_MIN_DT) { lastCapT = t; storeFrame(); }
    if (!video!.paused && !video!.ended) video!.requestVideoFrameCallback(captureFrame);
    else finishCapture();
  }
  function fallbackCapture() {
    const onTU = () => {
      if (disposed) return;
      if (frames.length === 0 || video!.currentTime - lastCapT >= CAP_MIN_DT) { lastCapT = video!.currentTime; storeFrame(); }
      if (video!.ended) { video!.removeEventListener("timeupdate", onTU); finishCapture(); }
    };
    video!.addEventListener("timeupdate", onTU);
    teardown.push(() => video!.removeEventListener("timeupdate", onTU));
  }
  function finishCapture() {
    if (framesReady) return;
    framesReady = true;
    try { video!.pause(); } catch { /* ignore */ }
    frames.sort((a, b) => a.t - b.t);
  }
  function startCapture() {
    if (framesReady || frames.length) return;
    video!.muted = true;
    // play through at NATIVE 1× so requestVideoFrameCallback presents every 30fps frame
    try { video!.playbackRate = 1; } catch { /* ignore */ }
    const begin = () => {
      if ("requestVideoFrameCallback" in video!) video!.requestVideoFrameCallback(captureFrame);
      else fallbackCapture();
    };
    const p = video!.play();
    if (p && p.then) p.then(begin).catch(() => {}); else begin();
    video!.addEventListener("ended", finishCapture, { once: true });
    safetyTimer = setTimeout(finishCapture, 20000); // safety stop
  }
  video.addEventListener("loadeddata", startCapture, { once: true });
  teardown.push(() => video.removeEventListener("loadeddata", startCapture));
  // some engines need a gesture before play() is allowed
  function rePrime() { if (!frames.length && !framesReady) startCapture(); }
  (["pointerdown", "wheel", "touchstart", "keydown"] as const).forEach((e) => {
    window.addEventListener(e, rePrime, { once: true, passive: true });
    teardown.push(() => window.removeEventListener(e, rePrime));
  });

  // fetch as blob (direct mp4 src fails to load in some sandboxed origins)
  (function loadVideo() {
    const url = video!.dataset.src || "/assets/hero.mp4";
    fetch(url).then((r) => r.blob()).then((b) => {
      if (disposed) return;
      objectUrl = URL.createObjectURL(b);
      video!.src = objectUrl; video!.load();
    }).catch(() => { video!.src = url; video!.load(); });
  })();

  // cover-fit draw of a video/image source into a canvas context of size cw×ch
  function drawCover(ctx: CanvasRenderingContext2D, src: CanvasImageSource, cw: number, ch: number, sw: number, sh: number) {
    if (!sw || !sh) return;
    const scale = Math.max(cw / sw, ch / sh);
    const dw = sw * scale, dh = sh * scale;
    ctx.drawImage(src, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
  }

  // brand mark mode: false = knockout (letters reveal the video), true = solid white text
  const WHITE_BRAND = true;

  // continuous draw loop: paint the nearest cached frame onto the bg canvas
  function sizeCanvas() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    bgCanvas!.width = Math.round(window.innerWidth * dpr);
    bgCanvas!.height = Math.round(window.innerHeight * dpr);
  }
  function nearestFrame(t: number): HTMLCanvasElement | null {
    if (!frames.length) return null;
    let best = frames[0], bd = Math.abs(best.t - t);
    for (let i = 1; i < frames.length; i++) {
      const d = Math.abs(frames[i].t - t);
      if (d < bd) { bd = d; best = frames[i]; }
    }
    return best.canvas;
  }
  function drawLoop() {
    if (disposed) return;
    const hr = heroAct!.getBoundingClientRect();
    if (frames.length && hr.bottom > 0 && hr.top < window.innerHeight) {
      const f = nearestFrame(wantTime);
      if (f) drawCover(bgCtx!, f, bgCanvas!.width, bgCanvas!.height, f.width, f.height);
    }
    rafId = requestAnimationFrame(drawLoop);
  }
  rafId = requestAnimationFrame(drawLoop);

  // ---- scrubbing: just record the wanted time; the draw loop shows the nearest frame ----
  let wantTime = V_INTRO;
  function setVideoTime(t: number) { wantTime = clamp(t, 0, VDUR); }

  // ---- knockout mask (raster canvas; opaque letters reveal the sharp cut-video) ----
  function buildMask() {
    if (WHITE_BRAND) {
      // solid white DOM brand mark — no canvas/mask needed
      heroCut!.style.backgroundImage = "none";
      heroCut!.style.backgroundColor = "transparent";
      heroCut!.style.webkitMaskImage = "none";
      heroCut!.style.maskImage = "none";
      return;
    }
    const W = window.innerWidth, H = window.innerHeight;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const c = document.createElement("canvas");
    c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
    const x = c.getContext("2d")!;
    x.scale(dpr, dpr);
    x.clearRect(0, 0, W, H);
    x.fillStyle = "#fff";
    x.textAlign = "center";
    x.textBaseline = "alphabetic";
    const big = clamp(W * 0.135, 90, 230) * 1.15; // 15% larger word
    if ("letterSpacing" in x)
      (x as unknown as { letterSpacing: string }).letterSpacing = big * 0.03 + "px";
    x.font = `700 ${big}px Saira, system-ui, sans-serif`;
    const wordY = H * 0.46;
    x.fillText("OLEXION", W / 2, wordY);
    const url = c.toDataURL();
    heroCut!.style.backgroundColor = "var(--black)";
    heroCut!.style.webkitMaskImage = `url(${url})`;
    heroCut!.style.maskImage = `url(${url})`;
  }

  // ---- per-act progress helper ----
  function actProgress(el: HTMLElement) {
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const total = el.offsetHeight - vh;
    const scrolled = -r.top;
    return clamp(scrolled / total, 0, 1);
  }

  // ---- theme (toolbar light/dark) ----
  function applyTheme(dark: boolean) {
    body.classList.toggle("tb-dark", dark);
  }

  // =========================================================
  // MAIN RENDER
  // =========================================================
  function render() {
    if (disposed) return;
    const vh = window.innerHeight;

    // ---------- HERO ----------
    const hr = heroAct!.getBoundingClientRect();
    const heroInView = hr.top < vh && hr.bottom > 0;
    const p = actProgress(heroAct!);
    const A_END = 0.15; // glass-intro portion of the hero act
    const pA = range(p, 0, A_END); // 0..1 glass forming
    const pB = range(p, A_END, 1); // 0..1 video scrub

    // glass → fades away in place (no longer rises), revealing the sharpening video
    glass!.style.opacity = (1 - easeIO(pA)).toFixed(3);

    // hero sharpens as the glass lifts, then re-blurs + darkens for the emissions outro
    const outro = range(pB, 0.80, 0.97);
    heroBg!.style.setProperty("--hero-blur",
      (lerp(16, 0, easeIO(pA)) + easeIO(outro) * 26).toFixed(2) + "px");
    heroDark!.style.opacity = (easeIO(outro) * 0.82).toFixed(3);
    vignette!.style.opacity = String(range(pB, 0.0, 0.4) * 0.9);

    // scroll hint
    scrollHint!.style.opacity = String(1 - range(p, 0.01, 0.05));

    // video scrub
    if (heroInView) {
      if (pA < 1) setVideoTime(V_INTRO);
      else setVideoTime(lerp(V_START, VDUR - 0.03, pB));
    }

    // text reveals (centered on exploded-view & ignition frames)
    const fOp = bell(pB, 0.25, 0.225);
    revealFormula!.style.opacity = String(fOp);
    revealFormula!.style.transform = `translateY(${lerp(-38, -54, fOp)}%)`;
    const iOp = bell(pB, 0.66, 0.225);
    revealIgnition!.style.opacity = String(iOp);
    revealIgnition!.style.transform = `translateY(${lerp(-38, -54, iOp)}%)`;

    // emissions message — fades in over the deep-blur/dark hero, then holds (no fade-out)
    const eOp = range(pB, 0.84, 0.93);
    revealEmissions!.style.opacity = String(eOp);
    revealEmissions!.style.transform = `translateY(${lerp(-38, -54, eOp)}%)`;

    // ---------- EMISSIONS + ENGINES ----------
    const ep = actProgress(emAct!);

    // engines appear ONE AT A TIME on the right: each simply fades in, holds,
    // then fades out as the next one fades in. [enter, exitStart, exitEnd]
    const eWins = [
      [0.06, 0.32, 0.40],
      [0.36, 0.62, 0.70],
      [0.66, 1.00, 1.20],
    ];
    engines.forEach((fig, i) => {
      const w = eWins[i];
      // first engine is already visible on arrival (no fade-in); it only fades out
      const fadeIn = i === 0 ? 1 : range(ep, w[0], w[0] + 0.09);
      const fadeOut = 1 - range(ep, w[1], w[2]);
      const op = Math.min(fadeIn, fadeOut);
      fig.style.opacity = op.toFixed(3);
      fig.classList.toggle("lit", op > 0.5);
    });

    // ---------- VISION ----------
    const vp = actProgress(visionAct!);
    visionImg!.style.transform = `scale(${lerp(1.14, 1.42, easeIO(vp))})`;
    visionImg!.style.opacity = "1";
    const vWins = [[0.06, 0.20, 0.32], [0.30, 0.44, 0.56], [0.54, 0.66, 0.78]];
    vtexts.forEach((t, i) => {
      if (i < 3) {
        const [a, c, b] = vWins[i];
        const op = bell(vp, c, (b - a) / 2);
        t.style.opacity = String(op);
        t.style.transform = `translateY(${lerp(28, -28, range(vp, a, b))}px) scale(${lerp(1.04, 1.0, op)})`;
      } else {
        const op = range(vp, 0.80, 0.92);
        t.style.opacity = String(op);
        t.style.transform = `scale(${lerp(0.96, 1, op)})`;
        t.style.pointerEvents = op > 0.5 ? "auto" : "none";
      }
    });

    // ---------- TOOLBAR show + theme ----------
    const showTb = !(heroInView && p < A_END * 0.82);
    body.classList.toggle("tb-on", showTb);

    // theme: which act is under the toolbar?
    let dark = false;
    const y = 72;
    const within = (el: HTMLElement | null) => {
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return r.top <= y && r.bottom > y;
    };
    if (within(heroAct)) dark = p >= A_END * 0.9; // glass(light) → scrub(dark)
    else if (within(emAct)) dark = true; // engines on black
    else if (within(valSec) || within(simSec)) dark = false;
    else if (within(visionAct) || (footer && within(footer))) dark = true;
    applyTheme(dark);
  }

  // ---- rAF scroll loop ----
  let ticking = false;
  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(() => { render(); ticking = false; }); }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  teardown.push(() => window.removeEventListener("scroll", onScroll));

  const onResize = () => { sizeCanvas(); buildMask(); render(); };
  window.addEventListener("resize", onResize, { passive: true });
  teardown.push(() => window.removeEventListener("resize", onResize));

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => { if (!disposed) { buildMask(); render(); } });
  }
  sizeCanvas();
  buildMask();
  render();

  // ---- cleanup ----
  return () => {
    disposed = true;
    cancelAnimationFrame(rafId);
    if (safetyTimer) clearTimeout(safetyTimer);
    teardown.forEach((fn) => fn());
    try { video.pause(); } catch { /* ignore */ }
    if (objectUrl) { try { URL.revokeObjectURL(objectUrl); } catch { /* ignore */ } }
    body.classList.remove("tb-on", "tb-dark");
  };
}
