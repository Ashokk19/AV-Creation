import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

export interface SketchbookSpreadItem {
  id: string;
  title: string;
  subtitle: string;
  render: (passiveSnapshot?: boolean) => React.ReactNode;
}

export interface MengToSketchbookAdapterProps {
  spreads: SketchbookSpreadItem[];
  activeIndex: number;
  onIndexChange: (nextIndex: number) => void;
  headingFont?: string;
  bodyFont?: string;
  headingWeight?: string;
  bodyWeight?: string;
  primaryColor?: string;
  headingSize?: number;
  bodySize?: number;
  headingLetterSpacing?: number;
}

const STRIP_COUNT = 14;
const SPAN = 0.5;
const BETA = 0.58;
const TILT_X = 4.5;
const TILT_Y = 7;
const ZOOM_MIN = 0.9;
const ZOOM_MAX = 1.5;

interface TurnState {
  dir: 'next' | 'prev';
  from: number;
  to: number;
  t: number;
}

/**
 * React/TS adapter implementing ThreeUI MengToSketchbookLandingPage:
 * - Configured typography & paper ground props
 * - 3D tilted book desk stage with multi-layer ambient/contact shadows
 * - 14-strip nested curved paper page-turn kinematics & dynamic edge shading
 * - Interactive zoom controls, keyboard arrow support, pointer drag peel, and touch swipe
 */
export const MengToSketchbookAdapter: React.FC<MengToSketchbookAdapterProps> = ({
  spreads,
  activeIndex,
  onIndexChange,
  headingFont = 'instrument-serif',
  bodyFont = 'newsreader',
  headingWeight = '400',
  bodyWeight = '400',
  primaryColor = '#2b2721',
  headingSize = 30,
  bodySize = 20,
  headingLetterSpacing = 0.01,
}) => {
  const total = Math.max(1, spreads.length);
  const safeIndex = ((activeIndex % total) + total) % total;

  const [turn, setTurn] = useState<TurnState | null>(null);
  const [zoomPercent, setZoomPercent] = useState(100);
  const [hintHidden, setHintHidden] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const sb3dRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<HTMLDivElement>(null);
  const paperSpreadRef = useRef<HTMLDivElement>(null);
  const stripRefs = useRef<(HTMLDivElement | null)[]>([]);

  const turnRef = useRef<TurnState | null>(null);
  turnRef.current = turn;
  const activeIdxRef = useRef(safeIndex);
  activeIdxRef.current = safeIndex;
  const onIndexChangeRef = useRef(onIndexChange);
  onIndexChangeRef.current = onIndexChange;

  const reducedMotionRef = useRef(false);
  useEffect(() => {
    reducedMotionRef.current =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Spring & RAF state stored outside React state for 60fps updates
  const springRef = useRef<{
    v: number;
    target: number;
    k: number;
    c: number;
    onDone?: () => void;
  } | null>(null);

  const viewRef = useRef({ rx: 0, ry: 0, z: 1, trx: 0, try_: 0, tz: 1 });
  const viewActiveRef = useRef(false);

  const dragRef = useRef<{
    dir: 'next' | 'prev';
    x0: number;
    w: number;
    moved: number;
    vel: number;
    tPrev: number;
  } | null>(null);

  const rafRef = useRef<number | null>(null);
  const lastNowRef = useRef(0);

  const measureBookLayout = useCallback(() => {
    const sb3d = sb3dRef.current;
    const spreadEl = paperSpreadRef.current;
    if (!sb3d || !spreadEl) return;
    sb3d.style.setProperty('--bw', `${spreadEl.clientWidth}px`);
  }, []);

  const applyTurnGeometry = useCallback((tVal: number) => {
    const sb3d = sb3dRef.current;
    if (!sb3d) return;
    const th = Math.PI * tVal;
    const beta = BETA * Math.sin(Math.PI * tVal);
    const D = 180 / Math.PI;
    const tt = th + beta;
    const td = (2 * beta) / STRIP_COUNT;
    sb3d.style.setProperty('--tt', `${(tt * D).toFixed(2)}deg`);
    sb3d.style.setProperty('--td', `${(td * D).toFixed(3)}deg`);
    sb3d.style.setProperty('--shade', Math.sin(Math.PI * tVal).toFixed(3));

    for (let i = 0; i < STRIP_COUNT; i++) {
      const sEl = stripRefs.current[i];
      if (!sEl) continue;
      const l1 = Math.abs(Math.cos(tt - i * td));
      const l2 = Math.abs(Math.cos(tt - (i + 1) * td));
      sEl.style.setProperty('--lit', l1.toFixed(3));
      sEl.style.setProperty('--a1', ((1 - l1) * 0.62).toFixed(3));
      sEl.style.setProperty('--a2', ((1 - l2) * 0.62).toFixed(3));
    }
  }, []);

  const applyViewTransform = useCallback(() => {
    const sb3d = sb3dRef.current;
    if (!sb3d) return;
    const v = viewRef.current;
    sb3d.style.setProperty('--rx', `${v.rx.toFixed(2)}deg`);
    sb3d.style.setProperty('--ry', `${v.ry.toFixed(2)}deg`);
    sb3d.style.setProperty('--zoom', v.z.toFixed(3));
  }, []);

  const kickLoop = useCallback(() => {
    if (rafRef.current !== null) return;
    lastNowRef.current = performance.now();

    const tick = (now: number) => {
      rafRef.current = null;
      const dt = Math.min(0.032, (now - lastNowRef.current) / 1000 || 0.016);
      lastNowRef.current = now;

      const sp = springRef.current;
      const curTurn = turnRef.current;
      if (sp && curTurn) {
        const x = curTurn.t - sp.target;
        sp.v += (-sp.k * x - sp.c * sp.v) * dt;
        curTurn.t += sp.v * dt;
        if (Math.abs(curTurn.t - sp.target) < 0.002 && Math.abs(sp.v) < 0.02) {
          curTurn.t = sp.target;
          const done = sp.onDone;
          springRef.current = null;
          applyTurnGeometry(curTurn.t);
          done?.();
        } else {
          applyTurnGeometry(curTurn.t);
        }
      }

      // View spring easing
      const v = viewRef.current;
      let viewMoved = false;
      const e = 0.14;
      for (const [k, t] of [
        ['rx', 'trx'],
        ['ry', 'try_'],
        ['z', 'tz'],
      ] as const) {
        const d = v[t] - v[k];
        if (Math.abs(d) > 0.0006) {
          v[k] += d * e;
          viewMoved = true;
        } else {
          v[k] = v[t];
        }
      }
      if (viewMoved) applyViewTransform();
      viewActiveRef.current = viewMoved;

      if ((springRef.current || viewActiveRef.current) && rafRef.current === null) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [applyTurnGeometry, applyViewTransform]);

  const setView = useCallback(
    (rx: number, ry: number, z: number) => {
      const clampedRx = reducedMotionRef.current ? 0 : Math.max(-TILT_X, Math.min(TILT_X, rx));
      const clampedRy = reducedMotionRef.current ? 0 : Math.max(-TILT_Y, Math.min(TILT_Y, ry));
      const clampedZ = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z));
      viewRef.current.trx = clampedRx;
      viewRef.current.try_ = clampedRy;
      viewRef.current.tz = clampedZ;
      viewActiveRef.current = true;
      setZoomPercent(Math.round(clampedZ * 100));
      kickLoop();
    },
    [kickLoop]
  );


  const commitTurn = useCallback(
    (explicitTurn?: TurnState) => {
      const activeT = explicitTurn || turnRef.current;
      if (!activeT) return;
      const isDesktopBook = typeof window !== 'undefined' && window.innerWidth >= 768;
      if (reducedMotionRef.current || !isDesktopBook) {
        onIndexChangeRef.current(activeT.to);
        setTurn(null);
        sb3dRef.current?.style.setProperty('--shade', '0');
        return;
      }
      springRef.current = {
        v: 0,
        target: 1,
        k: 170,
        c: 26,
        onDone: () => {
          const finalTo = turnRef.current?.to ?? activeT.to;
          onIndexChangeRef.current(finalTo);
          setTurn(null);
          sb3dRef.current?.style.setProperty('--shade', '0');
        },
      };
      kickLoop();
    },
    [kickLoop]
  );

  const cancelTurn = useCallback(() => {
    const activeT = turnRef.current;
    if (!activeT) return;
    springRef.current = {
      v: 0,
      target: 0,
      k: 150,
      c: 24,
      onDone: () => {
        setTurn(null);
        sb3dRef.current?.style.setProperty('--shade', '0');
      },
    };
    kickLoop();
  }, [kickLoop]);

  const startTurn = useCallback(
    (dir: 'next' | 'prev', initialT = 0, targetIndexOverride?: number): TurnState | null => {
      if (total <= 1) return null;
      springRef.current = null;
      const baseFrom = turnRef.current ? turnRef.current.to : activeIdxRef.current;
      const nextIdx =
        typeof targetIndexOverride === 'number'
          ? ((targetIndexOverride % total) + total) % total
          : dir === 'next'
            ? (baseFrom + 1) % total
            : (baseFrom - 1 + total) % total;

      const nextTurn: TurnState = { dir, from: baseFrom, to: nextIdx, t: initialT };
      turnRef.current = nextTurn;
      setTurn(nextTurn);
      requestAnimationFrame(() => {
        measureBookLayout();
        applyTurnGeometry(initialT);
      });
      return nextTurn;
    },
    [applyTurnGeometry, measureBookLayout, total]
  );

  const stepPage = useCallback(
    (dir: 'next' | 'prev') => {
      if (total <= 1) return;
      setHintHidden(true);
      const tState = startTurn(dir, 0);
      if (tState) {
        commitTurn(tState);
      }
    },
    [commitTurn, startTurn, total]
  );

  // Measure spread width and clean up RAF on unmount
  useEffect(() => {
    measureBookLayout();
    const onResize = () => {
      measureBookLayout();
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [measureBookLayout]);

  // Global cursor tilt & arrow keyboard navigation
  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || dragRef.current || reducedMotionRef.current) return;
      const book = bookRef.current;
      if (!book) return;
      const r = book.getBoundingClientRect();
      if (!r.width) return;
      const nx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width * 0.65)));
      const ny = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height * 0.9)));
      setView(-ny * TILT_X, nx * TILT_Y, viewRef.current.tz);
    };

    const onPointerOut = (e: PointerEvent) => {
      if (!e.relatedTarget) setView(0, 0, viewRef.current.tz);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }
      // Do not hijack arrow keys if a modal dialog is open
      if (document.querySelector('[role="dialog"]')) return;
      e.preventDefault();
      stepPage(e.key === 'ArrowRight' ? 'next' : 'prev');
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerout', onPointerOut);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerout', onPointerOut);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [setView, stepPage]);

  // Pointer drag-to-peel on non-interactive paper surfaces
  const handleStagePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (
      target.closest('[data-interactive="true"], button, a, input, select, textarea')
    ) {
      return;
    }
    const book = bookRef.current;
    if (!book || total <= 1) return;

    e.preventDefault();
    setHintHidden(true);
    const r = book.getBoundingClientRect();
    const isDesktop = window.innerWidth >= 768;
    const dir: 'next' | 'prev' = (e.clientX - r.left) / r.width > 0.5 ? 'next' : 'prev';

    if (isDesktop && !reducedMotionRef.current) {
      startTurn(dir, 0);
    }
    dragRef.current = {
      dir,
      x0: e.clientX,
      w: r.width,
      moved: 0,
      vel: 0,
      tPrev: performance.now(),
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleStagePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.x0;
    d.moved = Math.max(d.moved, Math.abs(dx));

    if (turnRef.current) {
      const raw = (d.dir === 'next' ? -dx : dx) / (d.w * 0.62);
      const t = Math.max(0, Math.min(1, raw));
      const now = performance.now();
      d.vel = (t - turnRef.current.t) / Math.max(0.001, (now - d.tPrev) / 1000);
      d.tPrev = now;
      turnRef.current.t = t;
      applyTurnGeometry(t);
    }
  };

  const handleStagePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d) return;
    dragRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore if not captured
    }

    const dx = e.clientX - d.x0;
    const isDesktop = window.innerWidth >= 768;

    if (!isDesktop || reducedMotionRef.current) {
      if (Math.abs(dx) > 40) {
        stepPage(dx < 0 ? 'next' : 'prev');
      } else if (d.moved < 8) {
        stepPage(d.dir);
      }
      return;
    }

    if (!turnRef.current) return;
    if (d.moved < 8) {
      // Single click on paper turns in that half's direction
      commitTurn();
      return;
    }
    const shouldCommit = turnRef.current.t > 0.42 || d.vel > 1.1;
    if (shouldCommit) commitTurn();
    else cancelTurn();
  };


  // Helper to build nested 14-strip curved curl JSX when `turn` is active
  const renderNestedCurlStrips = (tState: TurnState, index = 0): React.ReactNode => {
    if (index >= STRIP_COUNT) return null;
    const isNext = tState.dir === 'next';
    const gut = 'calc(var(--bw, 800px) * 0.5)';
    const sw = `calc(var(--bw, 800px) * ${SPAN} / ${STRIP_COUNT})`;
    const offsetA = `calc(-1 * (${gut} + ${index} * ${sw}))`;
    const offsetB = `calc(${index + 1} * ${sw} - ${gut})`;

    const frontSpread = spreads[tState.from];
    const backSpread = spreads[tState.to];

    return (
      <div
        key={`strip-${index}`}
        ref={(el) => {
          stripRefs.current[index] = el;
        }}
        className={`strip ${index === STRIP_COUNT - 1 ? 'edge' : ''}`}
      >
        <div className="face front">
          <div className="face-slice" style={{ left: isNext ? offsetA : offsetB }}>
            {frontSpread?.render(true)}
          </div>
          <div className="sh" />
          <div className="gl" />
        </div>
        <div className="face back">
          <div className="face-slice" style={{ left: isNext ? offsetB : offsetA }}>
            {backSpread?.render(true)}
          </div>
          <div className="sh" />
          <div className="gl" />
        </div>
        {renderNestedCurlStrips(tState, index + 1)}
      </div>
    );
  };

  const activeSpread = spreads[safeIndex];

  return (
    <div
      className="sb-wrap"
      data-heading-font={headingFont}
      data-body-font={bodyFont}
      style={
        {
          '--ink': primaryColor,
          '--sb-heading-weight': headingWeight,
          '--sb-body-weight': bodyWeight,
          '--sb-heading-size': `${headingSize}px`,
          '--sb-body-size': `${bodySize}px`,
          '--sb-heading-track': `${headingLetterSpacing}em`,
        } as React.CSSProperties
      }
    >
      <div
        ref={stageRef}
        className="sb-stage"
        onPointerDown={handleStagePointerDown}
        onPointerMove={handleStagePointerMove}
        onPointerUp={handleStagePointerUp}
        onPointerCancel={handleStagePointerUp}
        onDoubleClick={(e) => {
          if ((e.target as HTMLElement).closest('[data-interactive="true"], button, a')) return;
          setView(viewRef.current.trx, viewRef.current.try_, 1);
        }}
      >
        {/* Previous Spread Arrow */}
        <button
          type="button"
          className="sb-arrow left"
          onClick={() => stepPage('prev')}
          disabled={total <= 1}
          aria-label="Previous catalogue spread"
          title="Previous spread (Left Arrow)"
        >
          <ChevronLeft className="w-7 h-7 sm:w-8 sm:h-8 stroke-[1.2]" />
        </button>

        {/* 3D Tilted Open Book Frame */}
        <div ref={sb3dRef} className="sb-3d">
          <div className="sb-tilt">
            <div className="sb-cast ambient" aria-hidden="true" />
            <div className="sb-cast contact" aria-hidden="true" />
            <div className="sb-cast hair" aria-hidden="true" />

            <div ref={bookRef} className="sb-book">
              <div className="sb-volume">
                <div ref={paperSpreadRef} className="sb-paper-spread">
                  {!turn ? (
                    <div className="sb-full">{activeSpread?.render(false)}</div>
                  ) : (
                    <>
                      {/* Stationary Left Half */}
                      <div className="sb-half left">
                        <div className="sb-half-content">
                          {spreads[turn.dir === 'next' ? turn.from : turn.to]?.render(true)}
                        </div>
                        <div className="gutter-shade left" />
                      </div>

                      {/* Stationary Right Half */}
                      <div className="sb-half right">
                        <div className="sb-half-content">
                          {spreads[turn.dir === 'next' ? turn.to : turn.from]?.render(true)}
                        </div>
                        <div className="gutter-shade right" />
                      </div>

                      {/* Live 14-Strip Curved Turning Leaf */}
                      <div
                        className={`curl ${turn.dir}`}
                        style={
                          {
                            '--n': STRIP_COUNT,
                            '--span': SPAN,
                          } as React.CSSProperties
                        }
                      >
                        {renderNestedCurlStrips(turn, 0)}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Spread Arrow */}
        <button
          type="button"
          className="sb-arrow right"
          onClick={() => stepPage('next')}
          disabled={total <= 1}
          aria-label="Next catalogue spread"
          title="Next spread (Right Arrow)"
        >
          <ChevronRight className="w-7 h-7 sm:w-8 sm:h-8 stroke-[1.2]" />
        </button>
      </div>

      {/* Caption & Spread Counter */}
      <div className="text-center space-y-1">
        <p className="text-xs uppercase tracking-[0.22em] text-[rgba(43,39,33,0.72)] font-medium">
          Spread {String(safeIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          <span aria-hidden="true"> · </span>
          <span className="text-[#784f2b]">{activeSpread?.title}</span>
        </p>
      </div>

      {/* Sketchbook Zoom & Magnifier Controls */}
      <div className="sb-tools" role="group" aria-label="Catalogue view controls">
        <button
          type="button"
          className="sb-tool-btn"
          disabled={zoomPercent <= Math.round(ZOOM_MIN * 100)}
          onClick={() => {
            setHintHidden(true);
            setView(viewRef.current.trx, viewRef.current.try_, viewRef.current.tz / 1.16);
          }}
          aria-label="Zoom out"
          title="Zoom out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <span className="text-[11px] tracking-[0.08em] text-[rgba(43,39,33,0.65)] min-w-[42px] text-center tabular-nums">
          {zoomPercent}%
        </span>
        <button
          type="button"
          className="sb-tool-btn"
          disabled={zoomPercent >= Math.round(ZOOM_MAX * 100)}
          onClick={() => {
            setHintHidden(true);
            setView(viewRef.current.trx, viewRef.current.try_, viewRef.current.tz * 1.16);
          }}
          aria-label="Zoom in"
          title="Zoom in"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tactile Gesture Hint */}
      <p
        className={`text-[11px] uppercase tracking-[0.14em] text-[rgba(43,39,33,0.52)] text-center px-4 transition-opacity duration-300 ${
          hintHidden ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        Drag the page edge or use arrows to turn
      </p>
    </div>
  );
};
