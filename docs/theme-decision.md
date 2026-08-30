# Theme decision

Both systems are complete and reachable. This is the comparison; the call is
yours.

```
/pixel.html          the pixel theme
/index.html          the default theme
/pixel.html#/compare both, live, side by side
```

Nothing is deleted until you decide. `git checkout main` still returns the
current site with no trace of this work.

---

## Where each one is stronger

**The pixel theme is stronger on the index and the playground.** Its whole
argument is the field: a hero that reacts, a work carousel whose cards come
apart under the cursor, a footer you can play. Those are pages where the visitor
is browsing rather than reading, and where "this person builds things" is the
message. The playground in particular is better served — a live, drivable module
beats a screenshot of one.

**The default theme is stronger on the case study and about.** Long-form reading
is the one thing the pixel system actively fights: it runs a 9px module, an
uppercase utility tier and a hard-edged surface, none of which help someone read
2,000 words about clinical workflow. The default theme's serif display and
generous measure are simply better suited, and the case-study slide system
already lives there.

**Neither is obviously better on the home hero**, and that is the real question.
The pixel hero is more memorable and more likely to be remembered a week later.
It is also louder, and it makes a specific claim about the kind of designer you
are — technical, systems-minded, a bit playful. If that claim is true, it works
in your favour. If the rooms you want to be in are more conservative, it works
against you.

---

## Performance — measured, not estimated

Field cost per rendered frame, driven deterministically via the `_step()` hook:

| Viewport | Grid | Field | Budget |
|---|---|---|---|
| 1440×900 | 160×100 | **1.5 ms** | 6 ms |
| 2560×1440 | 183×103 | **1.8 ms** | 6 ms |
| 3840×2160 | 275×155 | **4.4 ms** | 6 ms |
| 1440 + 8 plates | — | **8.3 ms** | 10 ms |

Everything is inside budget. Notes worth carrying into the decision:

- **4K needed a fix.** At the 9px module a 4K viewport is >100k cells and the
  field cost ~10ms. `--cell` now steps up to Cell M above 2400px, cutting the
  count ~2.4×. Without that it would still hold 30fps but with no headroom.
- **No per-frame allocation.** Draw buckets are reused via `length = 0`; ~1MB
  heap growth over 120 frames is GC noise.
- **It stops when it should.** 0 frames render while the tab is hidden, and
  every canvas is behind an `IntersectionObserver`.
- **One pointer listener** for the whole theme, sampled during render rather
  than subscribed to.

The honest caveat: this is measured on your machine in headless Chrome. **iOS
Safari has not been tested** — canvas fill performance differs enough there to
matter, and the theme leans entirely on canvas fills.

---

## Accessibility

Comparable, with one real advantage each way.

| | Pixel | Default |
|---|---|---|
| Keyboard reach | 21 focusable, nothing unreachable | equivalent |
| Focus ring | 2px/3px offset, neon over dark media | browser default in places |
| `prefers-reduced-motion` | field freezes, plates static, easing instant | fewer moving parts to begin with |
| Canvas semantics | `aria-hidden`, except the marquee (`role="img"` + label) | n/a |
| Long-form reading | **weaker** — uppercase utility tier, tight tracking | **stronger** |

The pixel theme's accessibility work is more deliberate because it had to be —
it puts animation and canvas everywhere. The default theme is safer by having
less surface.

---

## Maintenance cost

**42 files, 5,384 lines**, split roughly:

- **~1,940 lines of engine** — `heat-field`, `dither-plate`, `card-mosaic`,
  `foot-city`, `pixel-type`, `noise`, `ramp`, `motifs`, `pointer`. This is the
  part with real complexity and the part a future change is most likely to
  break. It is heavily commented for exactly that reason.
- **~3,300 lines of presentation** — pages and CSS. Ordinary work.

**Content is shared, components are not.** The theme imports
`home-content.json`, `about-content.json` and `case-studies/index.js` directly,
so copy is written once and both systems show it. But every presentational
component is re-implemented: nav, hero, cards, case-study prose, about,
playground, footer. That was forced — `Projects.css` alone has **179 hardcoded
colour values** bypassing the token layer (see `docs/theme-audit.md`), so those
components cannot be re-skinned by swapping tokens.

**Keeping both alive means:** every new case study works in both for free; every
new *layout* or *component* is built twice. Copy changes propagate; design
changes do not.

---

## Recommendation

**Keep both, with the pixel theme on the index and the playground, and the
default theme for case studies and about.**

The pixel theme earns its place where it does something the default cannot —
the hero and the work carousel are genuinely better, and the playground is
better by a wide margin. It does not earn its place in long-form reading, and
forcing it there would mean fighting its own type system.

That split also costs the least: the pages the pixel theme would serve are
exactly the pages with the least content churn, so the duplicate-component tax
falls on the parts that change least.

### If you pick pixel-only

Cut the case-study prose page and rebuild it on the default theme's typography,
or accept that long reads are harder. Budget a mobile pass — it has not been
designed for phones. Add the one line to `vite.config.js` so `pixel.html` ships.

### If you pick default-only

Delete `src/themes/`, `pixel.html` and `vite.pixel.config.mjs` and you are back
to the current site exactly — the whole point of the additive constraint. Worth
keeping `docs/theme-audit.md` regardless: the token-coverage numbers and the
`EditContext` / `ThemeContext` findings are true of the default theme too, and
the 179 hardcoded colours in `Projects.css` are a real debt independent of any
of this.

---

## Still open

- **`src/pages/CVBuilder.css` and `src/pages/CaseStudy.css` are modified**
  (`max-height: 60vh → 42vh` in each). I could not attribute these and left them
  rather than reverting someone else's work. They are the only two files in the
  repo that break the additive constraint.
- **Placeholder copy** in the pixel footer: the muted paragraph and
  "Tel Aviv, Israel" under the email are mine, not yours.
- **iOS Safari** untested.
- **Mobile layout** not designed.
