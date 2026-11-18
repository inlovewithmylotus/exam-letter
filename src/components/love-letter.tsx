import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { letter } from "@/lib/letter";

type Phase = "bloom" | "gather" | "sealed" | "open";

type Rose = {
  src: string;
  x: string;
  y: string;
  w: string;
  rot: number;
  delay: string;
  z: number;
};

type Petal = {
  src: string;
  sx: number;
  sy: number;
  ex: number;
  ey: number;
  rot: number;
  arc: number;
  w: string;
};

const ROSES: Rose[] = [
  { src: "blue", x: "-10%", y: "-8%", w: "74%", rot: -8, delay: "0.05s", z: 2 },
  { src: "pink", x: "34%", y: "-12%", w: "76%", rot: 10, delay: "0.16s", z: 3 },
  { src: "black", x: "-20%", y: "14%", w: "70%", rot: 7, delay: "0.32s", z: 4 },
  { src: "scarlet", x: "38%", y: "16%", w: "72%", rot: -6, delay: "0.46s", z: 3 },
  { src: "soft", x: "6%", y: "34%", w: "60%", rot: 14, delay: "0.62s", z: 2 },
  { src: "indigo", x: "46%", y: "36%", w: "66%", rot: -12, delay: "0.78s", z: 5 },
  { src: "wine", x: "-18%", y: "50%", w: "68%", rot: -4, delay: "0.9s", z: 3 },
  { src: "sky", x: "36%", y: "52%", w: "70%", rot: 8, delay: "1.04s", z: 4 },
  { src: "red", x: "-12%", y: "68%", w: "66%", rot: 12, delay: "1.16s", z: 2 },
  { src: "blush", x: "32%", y: "70%", w: "72%", rot: -8, delay: "1.28s", z: 3 },
  { src: "pink", x: "60%", y: "78%", w: "54%", rot: 16, delay: "1.4s", z: 4 },
  { src: "blue", x: "-24%", y: "82%", w: "58%", rot: -10, delay: "1.5s", z: 2 },
];

const PETALS: Petal[] = [
  { src: "soft", sx: 0.5, sy: 0.1, ex: 0.5, ey: -0.06, rot: 0, arc: 30, w: "3.8rem" },
  { src: "blue", sx: 0.84, sy: 0.06, ex: 0.62, ey: 0.04, rot: 28, arc: -46, w: "3.5rem" },
  { src: "scarlet", sx: 0.92, sy: 0.2, ex: 0.78, ey: 0.14, rot: 42, arc: 36, w: "3.6rem" },
  { src: "indigo", sx: 0.78, sy: 0.32, ex: 0.96, ey: 0.26, rot: 52, arc: -28, w: "3.5rem" },
  { src: "sky", sx: 0.94, sy: 0.46, ex: 1.04, ey: 0.44, rot: 90, arc: 40, w: "3.6rem" },
  { src: "wine", sx: 0.88, sy: 0.6, ex: 1.04, ey: 0.64, rot: 94, arc: -34, w: "3.5rem" },
  { src: "red", sx: 0.72, sy: 0.76, ex: 1.04, ey: 0.84, rot: 86, arc: 48, w: "3.6rem" },
  { src: "blush", sx: 0.64, sy: 0.9, ex: 0.86, ey: 1.06, rot: 180, arc: -30, w: "3.5rem" },
  { src: "pink", sx: 0.42, sy: 0.88, ex: 0.64, ey: 1.1, rot: 184, arc: 42, w: "3.7rem" },
  { src: "scarlet", sx: 0.24, sy: 0.92, ex: 0.42, ey: 1.1, rot: 180, arc: -20, w: "3.8rem" },
  { src: "black", sx: 0.08, sy: 0.74, ex: 0.2, ey: 1.06, rot: 176, arc: 38, w: "3.5rem" },
  { src: "wine", sx: 0.04, sy: 0.56, ex: 0.02, ey: 0.98, rot: 180, arc: -44, w: "3.5rem" },
  { src: "indigo", sx: 0.02, sy: 0.4, ex: -0.04, ey: 0.8, rot: -94, arc: 26, w: "3.6rem" },
  { src: "blue", sx: 0.1, sy: 0.26, ex: -0.04, ey: 0.6, rot: -86, arc: -36, w: "3.5rem" },
  { src: "pink", sx: 0.18, sy: 0.12, ex: -0.02, ey: 0.42, rot: -90, arc: 32, w: "3.6rem" },
  { src: "soft", sx: 0.14, sy: 0.18, ex: 0.06, ey: 0.26, rot: -52, arc: -24, w: "3.5rem" },
  { src: "red", sx: 0.3, sy: 0.08, ex: 0.24, ey: 0.14, rot: -42, arc: 40, w: "3.6rem" },
  { src: "blush", sx: 0.44, sy: 0.04, ex: 0.4, ey: 0.08, rot: -28, arc: -18, w: "3.7rem" },
];

function reduceMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function endTransform(el: HTMLImageElement, box: DOMRect, petal: Petal) {
  const w = el.offsetWidth || 70;
  const h = el.offsetHeight || 80;
  const x = box.left + box.width * petal.ex - w / 2;
  const y = box.top + box.height * petal.ey - h / 2;
  return `translate3d(${x}px, ${y}px, 0) rotate(${petal.rot}deg)`;
}

export function LoveLetter() {
  const [phase, setPhase] = useState<Phase>("bloom");
  const [run, setRun] = useState(0);
  const timers = useRef<number[]>([]);
  const petalRefs = useRef<(HTMLImageElement | null)[]>([]);
  const envelopeRef = useRef<HTMLButtonElement>(null);
  const sealRef = useRef<HTMLSpanElement>(null);
  const paperRef = useRef<HTMLElement>(null);

  function clearTimers() {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }

  useLayoutEffect(() => {
    clearTimers();
    if (reduceMotion()) {
      setPhase("sealed");
      return;
    }
    setPhase("bloom");
    timers.current = [
      window.setTimeout(() => setPhase("gather"), 2500),
      window.setTimeout(() => setPhase("sealed"), 5600),
    ];
    return clearTimers;
  }, [run]);

  const boxCache = useRef<DOMRect | null>(null);

  useLayoutEffect(() => {
    const live = envelopeRef.current?.getBoundingClientRect();
    if (live && live.width > 0) boxCache.current = live;
    const box = boxCache.current;

    if (box && sealRef.current) {
      sealRef.current.style.left = `${box.left + box.width * 0.5}px`;
      sealRef.current.style.top = `${box.top + box.height * 0.56}px`;
    }

    PETALS.forEach((petal, i) => {
      const el = petalRefs.current[i];
      if (!el) return;
      el.getAnimations().forEach((anim) => anim.cancel());

      if (phase === "bloom" || !box) {
        el.style.opacity = "0";
        return;
      }

      const w = el.offsetWidth || 70;
      const h = el.offsetHeight || 80;
      const end = endTransform(el, box, petal);

      if (phase === "gather" && !reduceMotion()) {
        const sx = window.innerWidth * petal.sx - w / 2;
        const sy = window.innerHeight * petal.sy - h / 2;
        const ex = box.left + box.width * petal.ex;
        const ey = box.top + box.height * petal.ey;
        const mx = (window.innerWidth * petal.sx + ex) / 2 + petal.arc;
        const my = Math.min(window.innerHeight * petal.sy, ey) - 96;
        el.style.opacity = "1";
        el.animate(
          [
            {
              transform: `translate3d(${sx}px, ${sy}px, 0) rotate(${petal.rot - 36}deg) scale(0.45)`,
              opacity: 0,
            },
            {
              transform: `translate3d(${mx - w / 2}px, ${my - h / 2}px, 0) rotate(${petal.rot + 18}deg) scale(1)`,
              opacity: 1,
              offset: 0.52,
            },
            { transform: end, opacity: 1 },
          ],
          {
            duration: 1500,
            delay: i * 46,
            easing: "cubic-bezier(0.16, 0.8, 0.22, 1)",
            fill: "forwards",
          },
        );
        return;
      }

      if (phase === "open" && !reduceMotion()) {
        const cx = box.left + box.width / 2;
        const cy = box.top + box.height / 2;
        const ex = box.left + box.width * petal.ex;
        const ey = box.top + box.height * petal.ey;
        const dx = ex - cx;
        const dy = ey - cy;
        const len = Math.hypot(dx, dy) || 1;
        const ox = ex + (dx / len) * 72 - w / 2;
        const oy = ey + (dy / len) * 56 - h / 2;
        el.animate(
          [
            { transform: end, opacity: 1 },
            {
              transform: `translate3d(${ox}px, ${oy}px, 0) rotate(${petal.rot + 20}deg) scale(0.8)`,
              opacity: 0,
            },
          ],
          {
            duration: 720,
            delay: (i % 8) * 18,
            easing: "cubic-bezier(0.4, 0, 0.2, 1)",
            fill: "forwards",
          },
        );
        return;
      }

      el.style.opacity = "1";
      el.style.transform = end;
    });
  }, [phase, run]);

  useEffect(() => {
    if (phase === "open") paperRef.current?.focus();
  }, [phase]);

  useEffect(() => {
    function onResize() {
      if (phase !== "sealed") return;
      const box = envelopeRef.current?.getBoundingClientRect();
      if (!box) return;
      if (sealRef.current) {
        sealRef.current.style.left = `${box.left + box.width * 0.5}px`;
        sealRef.current.style.top = `${box.top + box.height * 0.56}px`;
      }
      PETALS.forEach((petal, i) => {
        const el = petalRefs.current[i];
        if (!el) return;
        el.getAnimations().forEach((anim) => anim.cancel());
        el.style.opacity = "1";
        el.style.transform = endTransform(el, box, petal);
      });
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [phase]);

  function skip() {
    clearTimers();
    setPhase("sealed");
  }

  function open() {
    clearTimers();
    setPhase("open");
  }

  function fold() {
    setPhase("sealed");
  }

  function replay() {
    setPhase("bloom");
    setRun((n) => n + 1);
  }

  const status =
    phase === "open"
      ? "The letter is open."
      : phase === "sealed"
        ? "The letter is ready. Tap it to open."
        : "Roses are blooming.";

  return (
    <main className="stage" data-phase={phase}>
      <h1 className="sr-only">A letter for you</h1>
      <p className="sr-only" aria-live="polite">
        {status}
      </p>

      <div className="garden" key={run} aria-hidden="true">
        {ROSES.map((rose) => (
          <div
            key={`${rose.src}-${rose.x}-${rose.y}`}
            className="rose-slot"
            style={{
              ["--x" as string]: rose.x,
              ["--y" as string]: rose.y,
              ["--w" as string]: rose.w,
              ["--z" as string]: String(rose.z),
            }}
          >
            <img
              className="rose"
              src={`/roses/${rose.src}.webp`}
              alt=""
              draggable={false}
              style={{
                ["--rot" as string]: `${rose.rot}deg`,
                ["--delay" as string]: rose.delay,
              }}
            />
          </div>
        ))}
      </div>

      <div className="glow" aria-hidden="true" />

      {PETALS.map((petal, i) => (
        <img
          key={`${run}-${petal.src}-${i}`}
          ref={(el) => {
            petalRefs.current[i] = el;
          }}
          className="petal"
          src={`/petals/${petal.src}.webp`}
          alt=""
          draggable={false}
          style={{ ["--w" as string]: petal.w }}
        />
      ))}

      {phase !== "open" ? (
        <span className="seal" ref={sealRef} aria-hidden="true">
          <img src="/petals/seal.webp" alt="" draggable={false} />
        </span>
      ) : null}

      <div className="center">
        {phase === "open" ? (
          <article className="paper" ref={paperRef} tabIndex={-1}>
            <img className="ornament ornament-tl" src="/petals/pink.webp" alt="" />
            <img className="ornament ornament-tr" src="/petals/blue.webp" alt="" />
            <p className="kicker">{letter.kicker}</p>
            <p className="greeting">{letter.greeting}</p>
            {letter.lines.map((line) => (
              <p className="line" key={line}>
                {line}
              </p>
            ))}
            <p className="signoff">{letter.signoff}</p>
            <p className="signature">{letter.signature}</p>
            <div className="actions">
              <button type="button" onClick={fold}>
                Fold it closed
              </button>
              <button type="button" onClick={replay}>
                Watch again
              </button>
            </div>
          </article>
        ) : (
          <button
            ref={envelopeRef}
            type="button"
            className="letter-btn"
            disabled={phase !== "sealed"}
            aria-label="Open the letter"
            onClick={open}
          >
            <span className="ghost" />
            <span className="flap" />
          </button>
        )}
        <p className="hint" aria-hidden="true">
          tap to open
        </p>
      </div>

      {phase === "bloom" || phase === "gather" ? (
        <button type="button" className="skip" onClick={skip}>
          skip
        </button>
      ) : null}
    </main>
  );
}
