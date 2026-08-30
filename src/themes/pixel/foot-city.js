import { makeRandom } from './noise.js';
import { RAMP } from './ramp.js';

/* ═══════════════════════════════════════════════════════════════════════
   FOOT CITY — a pixel skyline that becomes a Tetris board
   ═══════════════════════════════════════════════════════════════════════

   One canvas, two modes, as the reference does it (their CSS comments give
   the concept away: "windows behind the skyline" and "on play it fills the
   footer and becomes the full-width board").

     city  — a seeded skyline on the --cell grid, windows twinkling
     play  — the footer expands and a board drops in over the skyline

   The skyline is NOT the play surface: a full-width board would need ~50
   cells filled to clear a line, which is unplayable. The board is a fixed 12
   columns centred over the city, which keeps the game real while the city
   stays the backdrop.
   ═══════════════════════════════════════════════════════════════════════ */

const TWINKLE_MS = 420;
const CITY_ROWS = 9;              // the strip is calc(--cell * 9) tall
/* The board shares the skyline's grid exactly: one tetromino block IS one city
   cell, so the falling pieces are the same size as the pixels they land on.
   Columns and rows therefore come from the canvas, not from a fixed board size.
   A full-width line clear is rare by design — the point is a skyline being
   built, not a game you are meant to win. */
const DPR_CAP = 2;

/* Tetrominoes, each as rotation states of [x,y] offsets. */
const PIECES = [
  { c: 2, r: [[[0,1],[1,1],[2,1],[3,1]], [[2,0],[2,1],[2,2],[2,3]]] },                 // I
  { c: 3, r: [[[0,0],[0,1],[1,1],[2,1]], [[1,0],[2,0],[1,1],[1,2]], [[0,1],[1,1],[2,1],[2,2]], [[1,0],[1,1],[0,2],[1,2]]] }, // J
  { c: 4, r: [[[2,0],[0,1],[1,1],[2,1]], [[1,0],[1,1],[1,2],[2,2]], [[0,1],[1,1],[2,1],[0,2]], [[0,0],[1,0],[1,1],[1,2]]] }, // L
  { c: 5, r: [[[1,0],[2,0],[1,1],[2,1]]] },                                            // O
  { c: 1, r: [[[1,0],[2,0],[0,1],[1,1]], [[1,0],[1,1],[2,1],[2,2]]] },                 // S
  { c: 2, r: [[[1,0],[0,1],[1,1],[2,1]], [[1,0],[1,1],[2,1],[1,2]], [[0,1],[1,1],[2,1],[1,2]], [[1,0],[0,1],[1,1],[1,2]]] }, // T
  { c: 4, r: [[[0,0],[1,0],[1,1],[2,1]], [[2,0],[1,1],[2,1],[1,2]]] },                 // Z
];

export function mountFootCity(canvas, { onScore, onGameOver } = {}) {
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let cell = 9, W = 0, H = 0, dpr = 1;
  let heights = [], windows = null, cityCols = 0;
  let mode = 'city';
  let rafId = 0, running = false, lastTwinkle = 0, tick = 0;

  // Tetris state. COLS is derived from the width on every resize, so the board
  // genuinely fills the footer rather than sitting in a fixed-width panel.
  let COLS = 14, ROWS = 9, BLOCK = 9;
  /* Gravity is per ROW, and a 9px block in a 390px footer means ~43 rows — at a
     classic ~600ms step a piece takes almost half a minute to land and the game
     looks broken. The step has to scale with the row count, not with tradition. */
  let board = [], piece = null, px = 0, py = 0, rot = 0, score = 0, dropAt = 0, gravity = 130;

  const readCell = () => {
    const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cell'));
    return Number.isFinite(v) && v > 0 ? v : 9;
  };

  /** Seeded skyline: building heights per column, plus a lit-window mask. */
  const buildCity = () => {
    const rnd = makeRandom(0x5ca1ab1e);
    cityCols = Math.ceil(W / cell);
    heights = new Array(cityCols);
    let h = 4;
    for (let x = 0; x < cityCols; x++) {
      // Hold a height for a run of columns so buildings read as blocks, not noise.
      if (x % (2 + ((rnd() * 4) | 0)) === 0) h = 2 + ((rnd() * (CITY_ROWS - 2)) | 0);
      heights[x] = h;
    }
    windows = new Uint8Array(cityCols * CITY_ROWS);
    for (let i = 0; i < windows.length; i++) windows[i] = rnd() < 0.28 ? 1 : 0;
  };

  const resize = () => {
    const r = canvas.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width));
    H = Math.max(1, Math.round(r.height));
    cell = readCell();
    dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildCity();

    // Re-fit the board to the new grid, preserving what is already stacked.
    // BOTH dimensions have to be remapped: the footer expands from 126px to
    // 390px on play, so ROWS changes as well as COLS. Remapping only columns
    // leaves board.length at the old row count and every access past it is
    // undefined.
    const prevCols = COLS, prevRows = ROWS, prev = board;
    measureBoard();
    if (prev.length) {
      board = Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
      // Bottom-aligned: the stack sits on the floor, so copy up from the base.
      const rows = Math.min(prevRows, ROWS);
      const colsN = Math.min(prevCols, COLS);
      for (let y = 0; y < rows; y++) {
        const src = prev[prevRows - 1 - y];
        if (!src) continue;
        for (let x = 0; x < colsN; x++) board[ROWS - 1 - y][x] = src[x];
      }
      if (px > COLS - 4) px = Math.max(0, COLS - 4);
      if (py >= ROWS) py = ROWS - 1;
    }
  };

  /* ── City ───────────────────────────────────────────────────────────── */
  const drawCity = (t) => {
    const baseY = H;                       // skyline sits on the bottom edge
    const paint = cell - 1;
    if (!reduceMotion && t - lastTwinkle > TWINKLE_MS) {
      lastTwinkle = t;
      const rnd = makeRandom((t / TWINKLE_MS) | 0);
      for (let k = 0; k < cityCols; k++) {
        const i = (rnd() * windows.length) | 0;
        windows[i] = windows[i] ? 0 : 1;
      }
    }
    for (let x = 0; x < cityCols; x++) {
      const hh = heights[x];
      for (let y = 0; y < hh; y++) {
        const lit = windows[x * CITY_ROWS + y];
        ctx.fillStyle = lit ? (y % 3 === 0 ? RAMP[3] : RAMP[2]) : RAMP[1];
        ctx.fillRect(x * cell + 1, baseY - (y + 1) * cell + 1, paint, paint);
      }
    }
  };

  /* ── Tetris ─────────────────────────────────────────────────────────── */
  // Sized off the height, leaving a row's worth of headroom for the score.
  /* One block = one cell — the same 9px module as the page's background grid,
     so the falling pieces line up with it exactly. On play the section clears:
     the skyline is not drawn and the floor is the base of the canvas, so the
     board sits on the page grid with nothing else in it. */
  /* Blocks stay one page-grid cell, but the PLAY AREA is a centred column, not
     the full width. At 9px across 1440px the board would be ~160 columns: a
     line could never clear, pieces would land scattered metres apart, and the
     game reads as broken however fast it runs. 24 columns against ~43 rows is
     roughly classic Tetris proportions. */
  const PLAY_COLS = 24;
  const measureBoard = () => {
    BLOCK = cell;
    COLS = Math.max(8, Math.min(PLAY_COLS, Math.floor(W / BLOCK)));
    ROWS = Math.max(6, Math.floor(H / BLOCK));
  };
  const originX = () => Math.round((W - COLS * BLOCK) / 2);
  const originY = () => H - ROWS * BLOCK;

  const spawn = () => {
    piece = PIECES[(Math.random() * PIECES.length) | 0];
    rot = 0;
    px = ((Math.random() * Math.max(1, COLS - 4)) | 0);
    py = -1;
    if (collides(px, py, rot)) { stopGame(true); return false; }
    return true;
  };

  const cellsOf = (r) => piece.r[r % piece.r.length];

  const collides = (nx, ny, nr) => {
    for (const [ox, oy] of cellsOf(nr)) {
      const x = nx + ox, y = ny + oy;
      if (x < 0 || x >= COLS || y >= ROWS) return true;
      if (y >= 0 && board[y][x]) return true;
    }
    return false;
  };

  const lock = () => {
    for (const [ox, oy] of cellsOf(rot)) {
      const y = py + oy;
      if (y >= 0) board[y][px + ox] = piece.c;
    }
    let cleared = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
      if (board[y].every(Boolean)) {
        board.splice(y, 1);
        board.unshift(new Array(COLS).fill(0));
        cleared++; y++;
      }
    }
    if (cleared) {
      score += [0, 100, 300, 500, 800][cleared];
      gravity = Math.max(60, gravity - cleared * 6);
      onScore?.(score);
    }
    spawn();
  };

  const move = (dx) => { if (!collides(px + dx, py, rot)) px += dx; };
  const rotate = () => {
    const nr = (rot + 1) % piece.r.length;
    // Basic wall kick: try in place, then one step either way.
    for (const k of [0, -1, 1, -2, 2]) if (!collides(px + k, py, nr)) { px += k; rot = nr; return; }
  };
  const softDrop = () => { if (!collides(px, py + 1, rot)) { py += 1; return true; } lock(); return false; };
  const hardDrop = () => { while (!collides(px, py + 1, rot)) py += 1; lock(); };

  const drawBoard = () => {
    const b = BLOCK, ox = originX(), oy = originY();
    const paint = b - 1;
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (!board[y][x]) continue;
        ctx.fillStyle = RAMP[board[y][x]];
        ctx.fillRect(ox + x * b + 1, oy + y * b + 1, paint, paint);
      }
    }
    if (piece) {
      ctx.fillStyle = RAMP[piece.c];
      for (const [dx, dy] of cellsOf(rot)) {
        const y = py + dy;
        if (y < 0) continue;
        ctx.fillRect(ox + (px + dx) * b + 1, oy + y * b + 1, paint, paint);
      }
    }
  };

  /* ── Loop ───────────────────────────────────────────────────────────── */
  const frame = (t) => {
    if (!running) return;
    rafId = requestAnimationFrame(frame);
    tick = t;
    ctx.clearRect(0, 0, W, H);
    // The skyline is the idle state only — starting the game clears it.
    if (mode !== 'play') drawCity(t);
    if (mode === 'play') {
      if (t > dropAt) { dropAt = t + gravity; softDrop(); }
      drawBoard();
    }
  };

  const start = () => { if (running) return; running = true; rafId = requestAnimationFrame(frame); };
  const stop = () => { running = false; if (rafId) cancelAnimationFrame(rafId); rafId = 0; };

  const stopGame = (over) => {
    mode = 'city';
    piece = null;
    if (over) onGameOver?.(score);
  };

  const onKey = (e) => {
    if (mode !== 'play') return;
    const k = e.key;
    if (k === 'ArrowLeft') move(-1);
    else if (k === 'ArrowRight') move(1);
    else if (k === 'ArrowUp') rotate();
    else if (k === 'ArrowDown') softDrop();
    else if (k === ' ') hardDrop();
    else return;
    e.preventDefault();
  };
  window.addEventListener('keydown', onKey);

  const ro = new ResizeObserver(() => { resize(); });
  ro.observe(canvas);
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) start(); else stop(); }, { threshold: 0 });
  io.observe(canvas);

  resize();
  start();

  return {
    play() {
        measureBoard();
      board = Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
      score = 0; gravity = 130; dropAt = tick + gravity;
      mode = 'play';
      onScore?.(0);
      resize();
      spawn();
      start();
    },
    quit() { stopGame(false); },
    input(k) {
      if (mode !== 'play') return;
      if (k === 'left') move(-1);
      else if (k === 'right') move(1);
      else if (k === 'rot') rotate();
      else if (k === 'drop') hardDrop();
    },
    isPlaying: () => mode === 'play',
    destroy() {
      stop();
      ro.disconnect(); io.disconnect();
      window.removeEventListener('keydown', onKey);
    },
  };
}


/* ═══════════════════════════════════════════════════════════════════════
   TT PIECES — the little block ticker inside the "play" label
   ═══════════════════════════════════════════════════════════════════════
   The reference renders a 40x32 canvas at 20x16 CSS beside the word "play".
   It cycles tetrominoes so the button reads as a game before you press it. */
export function mountPieces(canvas, { cell = 8, ms = 620 } = {}) {
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
  const W = 40, H = 32;
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  let i = 0, timer = 0;
  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    const piece = PIECES[i % PIECES.length];
    const cells = piece.r[0];
    // Centre the shape in the 5x4 grid.
    let minX = 9, minY = 9, maxX = -9, maxY = -9;
    for (const [x, y] of cells) {
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
    const ox = Math.round((W / cell - (maxX - minX + 1)) / 2) - minX;
    const oy = Math.round((H / cell - (maxY - minY + 1)) / 2) - minY;
    ctx.fillStyle = RAMP[piece.c];
    for (const [x, y] of cells) ctx.fillRect((x + ox) * cell, (y + oy) * cell, cell - 1, cell - 1);
  };
  draw();
  timer = setInterval(() => { i++; draw(); }, ms);
  return { destroy() { clearInterval(timer); } };
}
