import { makeSimplex } from './noise.js';
import { RAMP, STOPS, makeThresholds } from './ramp.js';
import { getPointer } from './pointer.js';

/* ═══════════════════════════════════════════════════════════════════════
   HEAT FIELD
   ═══════════════════════════════════════════════════════════════════════

   mountHeatField(canvasEl, { fade = 0.42 })
     → { setBrush(radiusInCells), setCell(px), destroy() }

   Five things here are load-bearing. Changing any of them changes the
   effect into a different effect:

   1. THE THRESHOLD FIELD IS STATIC. Generated once per resize from a seeded
      xorshift. Re-randomising per frame makes the whole field sizzle. This
      is the single most common way to get this wrong.
   2. 30fps, not 60. Throttled explicitly below. At 60 it reads as smooth
      video rather than a stepped, mechanical field.
   3. The pointer stamp is VELOCITY-STRETCHED into a capsule swept from the
      previous rendered frame's position to the current one. A fast sweep
      leaves a continuous comet tail whose LENGTH IS THE CURSOR'S SPEED —
      cool navy at the far end, chartreuse at the head. A stationary cursor
      degenerates to a round blob.

      This deliberately overrides the original measured spec, which called
      for a stamp at a single point per frame and an evenly spaced DOTTED
      trail. The live reference site shows a continuous tail, and the brief
      is explicit that where the spec and the live site disagree, the live
      site wins. Do not "restore" the dotted behaviour.
   4. Anisotropy: 0.100 in x, 0.050 in y. The lower y frequency stretches
      features vertically, which is what produces the drips along the
      lower edge.
   5. --cell is the single source of truth for geometry, read from CSS. The
      background rule uses the same property, so they cannot drift apart.
   6. The canvas is FIXED to the viewport, but the FIELD is masked to the
      document position of `bandEl` — measured every frame, so it scrolls with
      the page and never appears above the band. The BRUSH is deliberately not
      masked: it lives in viewport space and keeps working past the band, with
      no seam at the edge. Two different coordinate spaces on one canvas.
   ═══════════════════════════════════════════════════════════════════════ */

/* ── Measured field constants ─────────────────────────────────────────── */
const FREQ_X = 0.100;      // anisotropic — higher in x
const FREQ_Y = 0.050;      // lower in y stretches features vertically
const OCTAVES = 3;
const LACUNARITY = 2.0;
const GAIN = 0.5;
const DRIFT_CELLS_PER_SEC = 3.6;   // straight down; dx is zero
const CONTRAST_PIVOT = 0.34;
const CONTRAST_GAIN = 2.60;
const ZONE_FREQ = 0.006;           // the broad warm/cool layer
const ZONE_DRIFT = 0.35;           // drifts slowly, independently
const ZONE_AMOUNT = 0.22;
const FADE_POW = 0.85;
const BRUSH_GAIN = 1.55;           // flat-tops the core → solid centre
const MAX_TRAIL_CELLS = 52;        // cap, so a cursor jump can't streak the screen
/* Per-frame taper is deliberately MILD. A strong per-frame taper does not
   compose across frames — each capsule runs thin→thick, so a sweep reads as a
   row of bulges rather than one comet. The real gradient comes from DECAY:
   heat laid down earlier is cooler, and its outer ring drops below the paint
   threshold, so the tail cools AND narrows on its own. These two only stop a
   single very fast frame from reading as a flat bar. */
const TAIL_MIN = 0.80;             // heat at the tail end vs 1.0 at the head
const TAIL_R_MIN = 0.85;           // radius at the tail end vs 1.0 at the head
/* The comet tail belongs to the top of the page. It is gated on an element —
   whatever carries [data-trail-end] — rather than on a scroll fraction: once
   that section has been scrolled past, both the brush and the Pac-Man stop
   leaving a tail and the brush degrades to a plain round blob. Ramped over a
   fraction of the viewport so it eases out rather than snapping. */
const TRAIL_FADE_PX = 220;
/* Past that same section the brush also shrinks — the blob is a hero-scale
   gesture, and at full size it swamps the reading column below. Scaled on the
   same ramp so the size and the tail retract together rather than at two
   different moments. */
const BRUSH_MIN_SCALE = 0.5;

/* Settling is triggered by STOPPING, not by leaving the band. While the cursor
   is moving the blob is already in motion and needs no help; the moment it
   comes to rest its cells keep re-rolling and damp out over about a second, so
   it arrives rather than snapping still. */
const SETTLE_DECAY = 0.94;         // per rendered frame once the cursor stops
const SETTLE_JITTER = 0.22;
/* Only the blob's BODY re-rolls. `heat > 0` also covers the comet tail that is
   still decaying behind it, and jittering that made the dark trailing cells
   flicker — reading as a black trail crawling into the brush rather than the
   brush settling. Above this the cells are the blob proper. */
const SETTLE_MIN_HEAT = 0.45;
const SETTLE_MS = 130;             // ~7fps re-roll, matching the accent cadence
/* No scroll-based field fade any more: the canvas is a band in normal flow, so
   it scrolls off by itself. */
/* Brush decay. The measured spec says 1.4% per frame (0.986), but that cannot
   produce the reference's COOL tail: a path the cursor vacated 15 frames ago
   would still sit at 81% heat, so consecutive frames max() together into a hot
   slab instead of a comet. A stationary cursor still reads as a solid blob
   because it re-stamps at full strength every frame. One constant to change if
   the live site turns out slower. */
const DECAY = 0.82;
const FRAME_MS = 1000 / 30;        // 30fps. Not 60.

/* ── Idle Pac-Man ─────────────────────────────────────────────────────────
   Leave the cursor still and the blob turns into a Pac-Man that heads off in
   a straight line eating a row of pellets. Direction is decided by which half
   of the page the cursor rested in: on the left it runs right, on the right it
   runs left — so it always sets off across the page rather than immediately
   leaving it. Values from the reference's own `wander`/`pacman`. */
const IDLE_MS = 2000;              // how long the cursor must sit still
const PAC_SPEED = 5.2;             // px per rendered frame (2.6 at their 60fps)
/* Radius in CELLS, not tied to the brush. Deriving it from the brush meant
   dropping to Brush S shrank the character to ~5 cells across, which is too
   coarse to read as a face — the mouth wedge lands on one or two cells. At 7
   cells radius it is 14 across and the chomp is legible. */
/* Radius in CELLS — this is what sets how many squares the character is built
   from. Below ~6 the curve reads as chunky and the mouth lands on a couple of
   cells; much above ~9 it starts to dominate the copy it walks over. */
const PAC_RADIUS_CELLS = 4.5;
const PAC_FOOD_CELLS = 4;          // pellet spacing, in cells
/* 0.6 sits EXACTLY on a ramp stop (0.6 x 5 = 3.0), so the dither has no
   fraction to push around and the body quantises to solid amber. 0.72 lands
   mid-band and speckles between amber and red. */
const PAC_VALUE = 0.6;
/* The blue/navy outline is NOT drawn. The body is a uniform amber disc, and the
   outline is the motion trail: cells the character has just vacated still hold
   heat from the previous frames, stepping down 0.6 -> 0.46 (blue) -> 0.36 ->
   0.28 (navy) -> gone. That is why it appears only on the TRAILING edge and is
   about a cell wide — it is one frame's worth of movement per step. Drawing a
   rim explicitly puts it on all sides and reads as a ring, not a character. */
const PAC_CHOMP = 0.16;            // mouth cycle speed
const PELLETS = 80;
/* This is what shapes the trailing outline, and it is the whole tuning knob:
   0.6 -> 0.40 (blue) -> 0.26 (navy) -> gone, so the outline is ~2 cells at
   0.6 cells travelled per frame. Slower and it smears into a comet tail;
   faster and the outline disappears and the body reads as a flat disc. */
const PAC_DECAY = 0.66;
const DPR_CAP = 2;

/** Cheap deterministic hash → 0..1, for the settle jitter. */
const hsh = (a, b) => {
  const n = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return n - Math.floor(n);
};
const RESIZE_DEBOUNCE_MS = 120;

export function mountHeatField(canvas, { fade = 1, seed = 20260828, bandEl = null, invertFade = false } = {}) {
  const ctx = canvas.getContext('2d', { alpha: true });
  const simplex = makeSimplex(seed);
  const zoneNoise = makeSimplex(seed ^ 0x5bf03635);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let cell = 9;
  let cols = 0, rows = 0, width = 0, height = 0, dpr = 1;
  let thresholds = new Float32Array(0);   // STATIC per resize
  let brushHeat = new Float32Array(0);    // decays per frame
  let brushRadius = 7;    // Brush S

  let driftY = 0;
  let zoneY = 0;
  let lastTime = 0;
  let accumulator = 0;
  let rafId = 0;
  let running = false;
  let frameCount = 0;      // rendered frames, for the 30fps acceptance check

  // Last known pointer position, in cell coordinates. Written by the
  // listener at pointer rate; READ once per rendered frame.
  let pointerCol = -1, pointerRow = -1, pointerActive = false;
  // Set by the _setPointer test hook; suppresses sampling of the real pointer.
  let testPointer = false;
  // Where the brush was stamped on the PREVIOUS rendered frame. The segment
  // between that and the current position is the comet tail.
  let prevCol = -1, prevRow = -1;
  // Idle tracking + Pac-Man state.
  let nowMs = 0, lastMove = 0, settle = 0;
  // Previous frame's pointer cell, so a frame can tell moving from resting.
  let lastCol = -1, lastRow = -1, moving = false;
  let pacOn = false, pacX = 0, pacY = 0, pacDir = 1, pacStart = 0, pacAge = 0;

  // Reused per-frame draw buckets — one array of cell offsets per palette
  // index. Reset with length = 0, never reallocated (no per-frame garbage).
  const buckets = Array.from({ length: RAMP.length }, () => []);

  const readCell = () => {
    const v = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--cell')
    );
    return Number.isFinite(v) && v > 0 ? v : 9;
  };

  /** Rebuild geometry, the static threshold field, and remap existing heat. */
  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width || window.innerWidth));
    const h = Math.max(1, Math.round(rect.height || window.innerHeight));
    cell = readCell();
    dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);

    width = w; height = h;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const nextCols = Math.ceil(w / cell);
    const nextRows = Math.ceil(h / cell);

    // Static thresholds — regenerated ONLY here, never per frame.
    const nextThresholds = makeThresholds(nextCols, nextRows, seed);

    // Preserve brush heat across the resize rather than dropping it.
    const nextHeat = new Float32Array(nextCols * nextRows);
    if (cols && rows) {
      const cw = Math.min(cols, nextCols);
      const ch = Math.min(rows, nextRows);
      for (let y = 0; y < ch; y++) {
        const src = y * cols;
        const dst = y * nextCols;
        for (let x = 0; x < cw; x++) nextHeat[dst + x] = brushHeat[src + x];
      }
    }

    cols = nextCols; rows = nextRows;
    thresholds = nextThresholds;
    brushHeat = nextHeat;
  };

  /* ── fBm, 3 octaves, anisotropic ────────────────────────────────────── */
  const fbm = (x, y) => {
    let sum = 0, amp = 1, norm = 0, fx = FREQ_X, fy = FREQ_Y;
    for (let o = 0; o < OCTAVES; o++) {
      sum += simplex(x * fx, y * fy) * amp;
      norm += amp;
      amp *= GAIN;
      fx *= LACUNARITY; fy *= LACUNARITY;
    }
    return sum / norm;                       // -1..1
  };

  /* Cached, because this is read every frame. Re-queried while missing so it
     still binds if the section mounts after the field. */
  let trailEl = null;
  const trailStrength = () => {
    if (!trailEl || !trailEl.isConnected) trailEl = document.querySelector('[data-trail-end]');
    if (!trailEl) return 1;
    const bottom = trailEl.getBoundingClientRect().bottom;
    if (bottom >= 0) return 1;                     // still on screen
    const t = 1 + bottom / TRAIL_FADE_PX;          // eases out over the next 220px
    return t > 1 ? 1 : t < 0 ? 0 : t;
  };

  /** Stamp the brush as a capsule swept from the previous frame's position
   *  to the current one. The segment length IS the cursor speed, so the tail
   *  grows and shrinks with how fast you move. Intensity ramps from TAIL_MIN
   *  at the far end to 1.0 at the head, which is what makes the tail read
   *  navy/blue while the head stays chartreuse. */
  const stampPointer = () => {
    if (!pointerActive || pointerCol < 0) return;

    const bx = pointerCol, by = pointerRow;
    let ax = prevCol, ay = prevRow;
    // First stamp after entering / re-entering: no segment, just a blob.
    if (prevCol < 0) { ax = bx; ay = by; }

    // Trail strength follows the [data-trail-end] section: full while any of it
    // is still on screen, gone once it has scrolled past. The brush itself keeps
    // working everywhere — only the comet tail retracts.
    const trail = trailStrength();

    let dx = bx - ax, dy = by - ay;
    if (trail <= 0) { ax = bx; ay = by; dx = 0; dy = 0; }

    let len = Math.sqrt(dx * dx + dy * dy);
    if (len > MAX_TRAIL_CELLS) {
      const k = MAX_TRAIL_CELLS / len;
      ax = bx - dx * k; ay = by - dy * k;
      dx = bx - ax; dy = by - ay;
      len = MAX_TRAIL_CELLS;
    }
    // Ease the tail out as the hero leaves the screen.
    if (trail > 0 && trail < 1) {
      ax = bx - dx * trail; ay = by - dy * trail;
      dx = bx - ax; dy = by - ay;
    }

    const len2 = dx * dx + dy * dy;
    // Full size above the marked section, BRUSH_MIN_SCALE past it.
    const R = Math.max(2, brushRadius * (BRUSH_MIN_SCALE + (1 - BRUSH_MIN_SCALE) * trail));
    // Round AFTER applying the radius. R is fractional now that it scales, so
    // subtracting it from an already-floored value leaves a fractional bound —
    // the loop then indexes brushHeat[73.5], which is undefined, so every write
    // is silently skipped and the brush vanishes entirely instead of shrinking.
    const minX = Math.max(0, Math.floor(Math.min(ax, bx) - R));
    const maxX = Math.min(cols - 1, Math.ceil(Math.max(ax, bx) + R));
    const minY = Math.max(0, Math.floor(Math.min(ay, by) - R));
    const maxY = Math.min(rows - 1, Math.ceil(Math.max(ay, by) + R));

    for (let y = minY; y <= maxY; y++) {
      const row = y * cols;
      for (let x = minX; x <= maxX; x++) {
        // Distance to the SEGMENT, not to a point — this is what makes the
        // trail continuous instead of a row of separate dots.
        let t = 0;
        if (len2 > 0) {
          t = ((x - ax) * dx + (y - ay) * dy) / len2;
          t = t < 0 ? 0 : t > 1 ? 1 : t;
        }
        const px = ax + dx * t;
        const py = ay + dy * t;
        const ddx = x - px, ddy = y - py;
        const d = Math.sqrt(ddx * ddx + ddy * ddy);

        // t = 0 at the tail end, 1 at the head. BOTH the radius and the
        // intensity taper along it — radius alone gives a cold wedge, intensity
        // alone gives a fat slab. Together they make the comet.
        const Rt = len2 > 0 ? R * (TAIL_R_MIN + (1 - TAIL_R_MIN) * t) : R;
        if (d > Rt) continue;
        const along = len2 > 0 ? TAIL_MIN + (1 - TAIL_MIN) * t : 1;
        const v = Math.min(1, (1 - d / Rt) * BRUSH_GAIN * along);
        const i = row + x;
        if (v > brushHeat[i]) brushHeat[i] = v;
      }
    }

    prevCol = bx; prevRow = by;
  };

  /** A filled disk with a chomping wedge carved out of it, facing `ang`. */
  const pacman = (cx, cy, rad, ang, mouth) => {
    const c0 = Math.floor((cx - rad) / cell), c1 = Math.ceil((cx + rad) / cell);
    const r0 = Math.floor((cy - rad) / cell), r1 = Math.ceil((cy + rad) / cell);
    const rr = rad * rad;
    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        if (c < 0 || r < 0 || c >= cols || r >= rows) continue;
        const dx = (c + 0.5) * cell - cx, dy = (r + 0.5) * cell - cy;
        if (dx * dx + dy * dy > rr) continue;
        // Carve the mouth wedge out in the facing direction.
        const da = Math.abs(((((Math.atan2(dy, dx) - ang) % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI)) - Math.PI);
        if (da < mouth) continue;
        const i = r * cols + c;
        if (PAC_VALUE > brushHeat[i]) brushHeat[i] = PAC_VALUE;
      }
    }
  };

  /** Idle behaviour: set off across the page eating a row of pellets. */
  const wander = () => {
    // Radius and pellet spacing in PX, sized in cells so the character keeps
    // its resolution whatever the Brush control is set to.
    const R = PAC_RADIUS_CELLS * cell;
    const food = PAC_FOOD_CELLS * cell;
    if (!pacOn) {
      pacOn = true;
      // Which half of the page the cursor rested in decides the direction.
      pacDir = (pointerCol * cell) < width * 0.5 ? 1 : -1;
      pacX = pointerCol * cell;
      pacY = pointerRow * cell;
      pacStart = pacX;
      pacAge = 0;
    }
    pacAge++;
    pacX += pacDir * PAC_SPEED;
    if (pacX > width + R + 12 || pacX < -R - 12) {
      // Left the screen — cross back on a fresh row.
      pacDir = Math.random() < 0.5 ? 1 : -1;
      pacY = 70 + Math.random() * Math.max(1, height - 140);
      pacX = pacDir > 0 ? -R : width + R;
      pacStart = pacX;
      pacAge = 0;
    }

    // One-cell pellets on the row ahead; each vanishes as the mouth reaches it.
    const pr = Math.round(pacY / cell);
    for (let k = 1; k <= PELLETS; k++) {
      const x = pacStart + pacDir * food * k;
      if (x < -20 || x > width + 20) continue;
      if (pacDir * (x - pacX) <= R * 0.7) continue;
      const pc = Math.round(x / cell);
      if (pc < 0 || pr < 0 || pc >= cols || pr >= rows) continue;
      const i = pr * cols + pc;
      if (PAC_VALUE > brushHeat[i]) brushHeat[i] = PAC_VALUE;
    }

    const mouth = 0.05 + 0.6 * Math.abs(Math.sin(pacAge * PAC_CHOMP));
    pacman(pacX, pacY, R, pacDir > 0 ? 0 : Math.PI, mouth);
    // The comet tail has no meaning while wandering.
    prevCol = -1; prevRow = -1;
  };

  const render = () => {
    frameCount++;
    samplePointer();
    // Moving: recharge, but stay quiet — the blob is already in motion.
    // Resting: spend it, so the cells keep re-rolling and then come to rest.
    // Computed FIRST because the decay below depends on it.
    moving = pointerActive && (pointerCol !== lastCol || pointerRow !== lastRow);
    lastCol = pointerCol; lastRow = pointerRow;
    if (moving) settle = 1; else settle *= SETTLE_DECAY;
    // Decay, then stamp: the stamp is a direct response to input and should
    // land at full strength on the frame it is applied.
    const idling = pointerActive && nowMs - lastMove > IDLE_MS;
    // Past [data-trail-end] nothing leaves a tail — not the comet, not the
    // Pac-Man — so the residue is dropped almost immediately.
    const noTail = trailStrength() <= 0;
    const decay = noTail ? PAC_DECAY * 0.4 : (idling ? PAC_DECAY : DECAY);
    // Once the cursor stops, drop the comet tail fast. Left on the normal decay
    // it crawls away through blue and navy — which reads as a black trail
    // seeping into the brush, not as the brush settling. The blob itself is
    // re-stamped every frame, so only the abandoned tail is affected.
    const stopped = pointerActive && !moving;
    for (let i = 0; i < brushHeat.length; i++) {
      const h = brushHeat[i];
      brushHeat[i] = h * (stopped && h <= SETTLE_MIN_HEAT ? 0.2 : decay);
    }
    if (idling) wander();
    else { pacOn = false; stampPointer(); }

    for (let b = 0; b < buckets.length; b++) buckets[b].length = 0;

    // Field extent, in viewport rows, from the band's live document position.
    let bandTopRow = 0, bandRows = rows;
    if (bandEl) {
      const r = bandEl.getBoundingClientRect();
      bandTopRow = r.top / cell;
      bandRows = Math.max(1, r.height / cell);
    }
    const fadeRows = Math.max(1, bandRows * fade);
    const paint = cell - 1;                  // 8px fill inside a 9px cell

    const settleTick = Math.floor(nowMs / SETTLE_MS);


    for (let y = 0; y < rows; y++) {
      // Vertical fade across the band. Normally full at the top edge, zero
      // `fade` of the band's height below it. Inverted (the footer), it is full
      // at the BOTTOM edge and fades upward, so the mass rises into the footer
      // instead of falling through it. The drift direction does not change —
      // the field still falls; only the mask flips.
      let f = invertFade
        ? (y > bandTopRow + bandRows ? 0 : 1 - (bandTopRow + bandRows - y) / fadeRows)
        : (y < bandTopRow ? 0 : 1 - (y - bandTopRow) / fadeRows);
      if (f <= 0) f = 0; else f = Math.pow(f, FADE_POW);

      const row = y * cols;
      // MINUS, not plus. Sampling at (y + driftY) makes a feature at row y0
      // reappear at y0 - drift, i.e. the mass rises. Subtracting is what makes
      // it fall. Easy to get backwards and it looks plausible either way until
      // you correlate two frames.
      const ny = y - driftY;

      for (let x = 0; x < cols; x++) {
        const i = row + x;
        let value = 0;

        if (f > 0) {
          // Remap noise -1..1 → 0..1, then apply contrast about the pivot.
          const n = fbm(x, ny) * 0.5 + 0.5;
          let v = (n - CONTRAST_PIVOT) * CONTRAST_GAIN;
          // Broad warm/cool zones. Without this the field reads as uniform
          // texture rather than as a moving mass.
          v += zoneNoise(x * ZONE_FREQ, (y - zoneY) * ZONE_FREQ) * ZONE_AMOUNT;
          value = v * f;
        }

        const heat = brushHeat[i];
        value += heat;
        // Once the cursor stops, the brush's own cells keep re-rolling while
        // `settle` drains, so the blob comes to rest rather than snapping still.
        if (heat > SETTLE_MIN_HEAT && !moving && settle > 0.02) {
          // POSITIVE only. A symmetric jitter pushes blob cells DOWN a stop as
          // well as up, so navy appears inside the brush — dark cells creeping
          // in, which is exactly what should not happen. Brightening only.
          value += hsh(x + settleTick * 2.3, y - settleTick * 1.7) * SETTLE_JITTER * settle;
        }
        if (value <= 0) continue;
        if (value > 1) value = 1;

        // Quantise against the STATIC threshold for this cell. Deliberately
        // inlined rather than calling ramp.js `quantise()` — this runs 16k
        // times per frame and the hero is the one place that matters.
        const q = value * STOPS;
        let idx = q | 0;
        if (q - idx > thresholds[i]) idx++;
        if (idx <= 0) continue;              // index 0 is never painted
        if (idx > STOPS) idx = STOPS;

        buckets[idx].push(x * cell + 1, y * cell + 1);
      }
    }

    ctx.clearRect(0, 0, width, height);
    // One fillStyle assignment per colour, not per cell. Per-cell fillStyle
    // is far too slow at 9px on a 1440p viewport.
    for (let b = 1; b < buckets.length; b++) {
      const list = buckets[b];
      if (!list.length) continue;
      ctx.fillStyle = RAMP[b];
      for (let k = 0; k < list.length; k += 2) {
        ctx.fillRect(list[k], list[k + 1], paint, paint);
      }
    }
  };

  const loop = (now) => {
    if (!running) return;
    rafId = requestAnimationFrame(loop);

    nowMs = now;
    if (!lastTime) lastTime = now;
    if (!lastMove) lastMove = now;
    const dt = now - lastTime;
    lastTime = now;

    // Explicit 30fps throttle. Never run the field at 60.
    accumulator += dt;
    if (accumulator < FRAME_MS) return;
    const steps = Math.min(accumulator / FRAME_MS, 3);   // cap catch-up
    accumulator %= FRAME_MS;

    if (!reduceMotion) {
      const seconds = (steps * FRAME_MS) / 1000;
      driftY += DRIFT_CELLS_PER_SEC * seconds;   // straight down; dx is zero
      zoneY += ZONE_DRIFT * seconds;
    }
    render();
  };

  const start = () => {
    if (running) return;
    running = true;
    lastTime = 0;
    accumulator = FRAME_MS;        // render immediately on start
    rafId = requestAnimationFrame(loop);
  };

  const stop = () => {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
  };

  /* ── Listeners ──────────────────────────────────────────────────────── */
  /* Sampled from the shared pointer once per RENDERED frame rather than on
     every pointermove — the stamp only ever uses the latest position anyway. */
  const samplePointer = () => {
    if (testPointer) return;                 // a test hook is driving us
    const ptr = getPointer();
    if (!ptr.active) {
      if (pointerActive) { prevCol = -1; prevRow = -1; }   // no streak on re-entry
      pointerActive = false;
      return;
    }
    const nc = Math.floor(ptr.x / cell), nr = Math.floor(ptr.y / cell);
    if (nc !== pointerCol || nr !== pointerRow) { lastMove = nowMs; pacOn = false; }
    pointerCol = nc; pointerRow = nr;
    pointerActive = true;
  };

  let resizeTimer = 0;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { resize(); render(); }, RESIZE_DEBOUNCE_MS);
  };

  const onVisibility = () => {
    if (document.hidden) stop(); else start();
  };

  /* Scrolling is activity too — the Pac-Man stands down and the cursor brush
     takes back over, rather than continuing to march across a moving page. */
  const onScroll = () => { lastMove = nowMs; pacOn = false; };

  window.addEventListener('resize', onResize, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('scroll', onScroll, { passive: true });

  // A section-local canvas is laid out after mount and can change size without
  // the window resizing, so observe the element itself too.
  const ro = new ResizeObserver(() => { resize(); render(); });
  ro.observe(canvas);

  // Stop the loop when the canvas is scrolled out of view.
  const io = new IntersectionObserver(
    ([entry]) => { if (entry.isIntersecting) start(); else stop(); },
    { threshold: 0 }
  );
  io.observe(canvas);

  resize();
  start();

  return {
    setBrush(radiusInCells) { brushRadius = Math.max(1, radiusInCells | 0); },
    setCell() { resize(); render(); },
    /** Test hook — drives one deterministic frame without waiting on rAF. */
    _step(frames = 1) {
      for (let n = 0; n < frames; n++) {
        if (!reduceMotion) {
          driftY += DRIFT_CELLS_PER_SEC * (FRAME_MS / 1000);
          zoneY += ZONE_DRIFT * (FRAME_MS / 1000);
        }
        render();
      }
    },
    _debug() {
      return { cols, rows, cell, frames: frameCount, buckets: buckets.map((b) => b.length / 2) };
    },
    /** Test hook — set the trail origin WITHOUT stamping, so a single capsule
     *  can be measured in isolation (no anchor blob confusing the bounds). */
    _primeTrail(cx, cy) {
      prevCol = Math.floor(cx / cell);
      prevRow = Math.floor(cy / cell);
    },
    _setPointer(cx, cy, { keepTrail = true } = {}) {
      testPointer = true;
      pointerCol = Math.floor(cx / cell);
      pointerRow = Math.floor(cy / cell);
      pointerActive = true;
      lastMove = nowMs;
      pacOn = false;
      if (!keepTrail) { prevCol = -1; prevRow = -1; }
    },
    /** Test hook — pretend the cursor has been still for `ms`. */
    _idle(ms) { lastMove = nowMs - ms; },
    _pac() { return { on: pacOn, x: Math.round(pacX), y: Math.round(pacY), dir: pacDir }; },
    destroy() {
      stop();
      clearTimeout(resizeTimer);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('scroll', onScroll);
    },
  };
}
