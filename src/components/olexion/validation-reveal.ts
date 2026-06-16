/* ============================================================
   OLEXION — validation reveal
   Ported from the inline <script> at the bottom of Olexion.html: reveals the
   partner-logo wall (staggered flip-in) when it scrolls into view.
   ============================================================ */

export function initValidationReveal(): () => void {
  const sec = document.getElementById("validation");
  if (!sec) return () => {};

  if (!("IntersectionObserver" in window)) {
    sec.classList.add("is-revealed");
    return () => {};
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          sec.classList.add("is-revealed");
          io.unobserve(sec);
        }
      });
    },
    { threshold: 0.3 },
  );
  io.observe(sec);

  return () => io.disconnect();
}
