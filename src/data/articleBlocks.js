// ─────────────────────────────────────────────────────────────────────────
// articleBlocks.js — pure data layer for the case-study ARTICLE document.
//
// Each case study can carry a top-level `article: { articleVersion, title,
// lede, blocks: [...] }` key, fully independent of `slides`. This module
// defines the block schema defaults (makeArticleBlock), the add-block
// picker categories, the **bold** markdown-lite splitter, and
// slidesToArticleBlocks / deriveArticleFromSlides — the transform that
// powers BOTH the public fallback for un-authored studies and the
// one-time "Seed from slides" action in the article editor.
//
// No JSX here — CaseStudyArticle.jsx renders these blocks.
// ─────────────────────────────────────────────────────────────────────────

export const hasText = (v) => typeof v === 'string' && v.trim().length > 0;
export const clean = (v) => (hasText(v) ? v.trim() : '');
export const oneLine = (v) => clean(v).replace(/\s*\n+\s*/g, ' ');
export const listOf = (v) => (Array.isArray(v) ? v.filter((x) => x != null && (typeof x !== 'string' || x.trim())) : []);

export const isVideoSrc = (src) => /\.(mp4|webm|mov)(\?|#|$)/i.test(src || '');

/* Slide `image` fields are polymorphic: a bare path string, a single entry
   object, or an array of { src, caption, embedUrl, isVideo, size }. Article
   figure blocks keep the SAME entry shape so extractAndSaveMedia (Save to
   Code) and the review script's media guards keep working unchanged. */
export const normalizeMedia = (image) => {
  if (!image) return [];
  const arr = Array.isArray(image) ? image : [image];
  return arr
    .map((e) => (typeof e === 'string' ? { src: e } : e))
    .filter((e) => e && (hasText(e.src) || hasText(e.embedUrl)))
    .map((e) => ({
      src: clean(e.src),
      caption: clean(e.caption),
      isVideo: !!e.isVideo || isVideoSrc(e.src),
      embedUrl: clean(e.embedUrl),
      ...(e.size ? { size: e.size } : {}),
    }));
};

export const sizeToTier = (entry, fallback = 'wide') => {
  if (entry?.size === 'small') return 'prose';
  if (entry?.size === 'full') return 'full';
  return fallback;
};

/* ── **bold** markdown-lite ───────────────────────────────────────────── */

// Splits "a **b** c" → [{bold:false,text:'a '},{bold:true,text:'b'},{bold:false,text:' c'}]
export const splitBold = (text) => {
  if (!hasText(text)) return [];
  return String(text)
    .split(/(\*\*[^*]+\*\*)/g)
    .filter((seg) => seg !== '')
    .map((seg) =>
      seg.startsWith('**') && seg.endsWith('**') && seg.length > 4
        ? { bold: true, text: seg.slice(2, -2) }
        : { bold: false, text: seg }
    );
};

/* ── Block factory ────────────────────────────────────────────────────── */

let idCounter = 0;
export const newBlockId = () =>
  `b${Date.now().toString(36)}${(idCounter++ % 1296).toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const BLOCK_DEFAULTS = {
  heading: () => ({ level: 2, eyebrow: '', text: 'New section' }),
  paragraph: () => ({ text: 'New paragraph. Use **bold** for emphasis.' }),
  bullets: () => ({ title: '', ordered: false, items: ['First point', 'Second point'] }),
  metaGrid: () => ({ items: [{ label: 'Role', value: '' }, { label: 'Timeline', value: '' }] }),
  labelRow: () => ({ label: 'Problem', text: '' }),
  problemSolutionImpact: () => ({
    items: [
      { label: 'Problem', text: '' },
      { label: 'Solution', text: '' },
      { label: 'Impact', text: '' },
    ],
  }),
  cards: () => ({
    variant: 'numbered',
    columns: 2,
    items: [{ number: '1', tone: 'neutral', title: 'Card title', description: 'Card description' }],
  }),
  figure: () => ({ width: 'wide', display: 'grid', interval: 3500, media: [{ src: '', caption: '', isVideo: false, embedUrl: '' }] }),
  quote: () => ({ text: 'Quote text', author: '', role: '' }),
  callout: () => ({ text: 'Highlight worth calling out.' }),
  checklist: () => ({
    workedTitle: 'What worked',
    worked: [''],
    failedTitle: "What didn't",
    failed: [''],
    differentlyTitle: "What I'd do differently",
    differently: [''],
  }),
  divider: () => ({}),
  chapter: () => ({ number: '01', title: 'Chapter title', subtitle: '' }),
};

export const ARTICLE_BLOCK_TYPES = Object.keys(BLOCK_DEFAULTS);

export const makeArticleBlock = (type) => {
  const defaults = BLOCK_DEFAULTS[type] ? BLOCK_DEFAULTS[type]() : { text: '' };
  return { id: newBlockId(), type, ...defaults };
};

/* ── Block type conversion ────────────────────────────────────────────────
   Best-effort content migration between block types so the editor can change,
   e.g. Cards → Bullets. Any block is normalized into a common shape
   { title, rows: [{ head, body }], text }, then the target type is rebuilt
   from it (each card ↔ each bullet ↔ each row). Media-carrying (figure) and
   empty (divider) blocks are intentionally left out of the convertible set. */
export const CONVERTIBLE_BLOCK_TYPES = [
  'heading', 'paragraph', 'quote', 'callout', 'bullets', 'cards',
  'checklist', 'metaGrid', 'labelRow', 'problemSolutionImpact', 'chapter',
];

const normalizeBlockContent = (block) => {
  const rows = [];
  let title = '';
  let text = '';
  switch (block.type) {
    case 'cards':
      listOf(block.items).forEach((it) => rows.push({ head: clean(it.title), body: clean(it.description || it.value) }));
      break;
    case 'bullets':
      title = clean(block.title);
      listOf(block.items).forEach((it) => {
        if (typeof it === 'string') rows.push({ head: clean(it), body: '' });
        else rows.push({ head: clean(it.title), body: clean(it.text) });
      });
      break;
    case 'checklist':
      [...listOf(block.worked), ...listOf(block.failed), ...listOf(block.differently)]
        .forEach((s) => { if (clean(s)) rows.push({ head: clean(s), body: '' }); });
      break;
    case 'metaGrid':
      listOf(block.items).forEach((it) => rows.push({ head: clean(it.label), body: clean(it.value) }));
      break;
    case 'problemSolutionImpact':
      listOf(block.items).forEach((it) => rows.push({ head: clean(it.label), body: clean(it.text) }));
      break;
    case 'labelRow':
      rows.push({ head: clean(block.label), body: clean(block.text) });
      break;
    case 'paragraph':
    case 'callout':
      text = clean(block.text);
      text.split(/\n+/).map((s) => s.trim()).filter(Boolean).forEach((line) => rows.push({ head: line, body: '' }));
      break;
    case 'quote': {
      const qs = (Array.isArray(block.quotes) && block.quotes.length)
        ? block.quotes
        : [{ text: block.text, author: block.author, role: block.role }];
      qs.forEach((q) => rows.push({ head: clean(q.text), body: [clean(q.author), clean(q.role)].filter(Boolean).join(', ') }));
      text = clean(qs[0] && qs[0].text);
      break;
    }
    case 'heading':
      title = clean(block.text);
      text = clean(block.text);
      break;
    case 'chapter':
      title = clean(block.title);
      if (clean(block.subtitle)) rows.push({ head: clean(block.subtitle), body: '' });
      break;
    default:
      text = clean(block.text);
  }
  if (!text) text = rows.map((r) => [r.head, r.body].filter(Boolean).join(' — ')).filter(Boolean).join('\n');
  return { title, rows, text };
};

const buildBlockFields = (toType, { title, rows, text }) => {
  const lines = () => (text ? text.split(/\n+/).map((s) => s.trim()).filter(Boolean) : []);
  const firstLine = (text.split('\n')[0] || '').trim();
  const joinedRows = () => rows.map((r) => [r.head, r.body].filter(Boolean).join(' — ')).filter(Boolean);
  switch (toType) {
    case 'bullets': {
      // Each bullet is { title, text }; a row's head becomes the bold title
      // only when it also has body text (so a card's title→bold lead-in, a
      // plain paragraph line→plain bullet text).
      const src = rows.length ? rows : lines().map((l) => ({ head: l, body: '' }));
      const bulletItems = src.map((r) => (r.body ? { title: r.head || '', text: r.body } : { title: '', text: r.head || '' }));
      return { title, ordered: false, items: bulletItems.length ? bulletItems : [{ title: '', text: '' }] };
    }
    case 'cards':
      return {
        variant: 'numbered', columns: 2,
        items: (rows.length ? rows : lines().map((l) => ({ head: l, body: '' }))).map((r, i) => ({
          number: String(i + 1), tone: 'neutral', title: r.head || '', description: r.body || '',
        })),
      };
    case 'checklist':
      return {
        workedTitle: 'What worked', worked: (rows.length ? rows.map((r) => r.head).filter(Boolean) : lines()).length ? (rows.length ? rows.map((r) => r.head).filter(Boolean) : lines()) : [''],
        failedTitle: "What didn't", failed: [''],
        differentlyTitle: "What I'd do differently", differently: [''],
      };
    case 'metaGrid':
      return { items: (rows.length ? rows : [{ head: 'Label', body: text }]).map((r) => ({ label: r.head || 'Label', value: r.body || '' })) };
    case 'problemSolutionImpact':
      return { items: (rows.length ? rows : [{ head: 'Label', body: text }]).map((r) => ({ label: r.head || 'Label', text: r.body || '' })) };
    case 'labelRow':
      return { label: title || rows[0]?.head || 'Label', text };
    case 'paragraph':
      return { text: text || joinedRows().join('\n') };
    case 'callout':
      return { text: text || joinedRows().join('\n') };
    case 'quote':
      return { variant: '', quotes: (rows.length ? rows : [{ head: firstLine || text, body: '' }]).map((r) => ({ text: r.head || '', author: '', role: '' })) };
    case 'heading':
      return { level: 2, eyebrow: '', text: title || rows[0]?.head || firstLine || 'Section' };
    case 'chapter':
      return { number: '01', title: title || rows[0]?.head || firstLine || 'Chapter', subtitle: '' };
    default:
      return null;
  }
};

export const convertArticleBlock = (block, toType) => {
  if (!block || block.type === toType) return block;
  const fields = buildBlockFields(toType, normalizeBlockContent(block));
  if (!fields) return { ...makeArticleBlock(toType), id: block.id };
  return { id: block.id, type: toType, ...fields };
};

// Add-block picker groups (mirrors templateCategories' shape for slides).
export const articleBlockCategories = {
  Text: [
    { type: 'heading', label: 'Heading', hint: 'Section title (H2/H3)' },
    { type: 'paragraph', label: 'Paragraph', hint: 'Body text, **bold** supported' },
    { type: 'quote', label: 'Quote', hint: 'Pull-quote with attribution' },
    { type: 'callout', label: 'Callout', hint: 'Accent highlight box' },
  ],
  Media: [
    { type: 'figure', label: 'Image / Video', hint: 'Media with caption, 3 widths' },
  ],
  'Cards & Lists': [
    { type: 'bullets', label: 'Bullet list', hint: 'Bullets or numbered list' },
    { type: 'cards', label: 'Cards', hint: 'Numbered / icon / stat cards' },
    { type: 'checklist', label: 'Checklist', hint: '✓ worked / ✕ didn’t / → next' },
    { type: 'metaGrid', label: 'Meta grid', hint: 'Role · Timeline · Team pairs' },
    { type: 'labelRow', label: 'Label row', hint: 'Single labelled row' },
    { type: 'problemSolutionImpact', label: 'Problem · Solution · Impact', hint: 'Three labelled rows in one section' },
  ],
  Structure: [
    { type: 'chapter', label: 'Chapter', hint: 'Numbered section divider' },
    { type: 'divider', label: 'Divider', hint: 'Horizontal rule' },
  ],
};

/* ── slides → blocks transform ────────────────────────────────────────── */

const block = (type, fields) => ({ id: newBlockId(), type, ...fields });

const headingFor = (slide, out) => {
  if (hasText(slide.title) || hasText(slide.label)) {
    out.push(block('heading', { level: 2, eyebrow: clean(slide.label), text: oneLine(slide.title) }));
  }
};

const paragraphIf = (text, out, { bold = false } = {}) => {
  if (!hasText(text)) return;
  out.push(block('paragraph', { text: bold ? `**${clean(text)}**` : clean(text) }));
};

const bulletsIf = (title, items, out, { ordered = false } = {}) => {
  const list = listOf(items).map((b) => (typeof b === 'string' ? b : clean(b.text) || clean(b.title)));
  if (!list.length) return;
  out.push(block('bullets', { title: clean(title), ordered, items: list }));
};

const calloutIf = (text, out) => {
  if (hasText(text)) out.push(block('callout', { text: clean(text) }));
};

const figuresFrom = (image, out, { firstCaption = '', width, carousel = false, interval } = {}) => {
  const entries = normalizeMedia(image);
  if (!entries.length) return;
  // Slides shown as a carousel stay a carousel in the article: one figure
  // block carrying every entry, cycled by the renderer.
  if (carousel && entries.length > 1) {
    const media = entries.map((entry, i) => {
      const m = { ...entry };
      if (i === 0 && hasText(firstCaption) && !hasText(m.caption)) m.caption = clean(firstCaption);
      return m;
    });
    out.push(block('figure', {
      width: width || 'wide',
      display: 'carousel',
      interval: Number(interval) || 3500,
      media,
    }));
    return;
  }
  entries.forEach((entry, i) => {
    const media = { ...entry };
    if (i === 0 && hasText(firstCaption) && !hasText(media.caption)) media.caption = clean(firstCaption);
    out.push(block('figure', { width: width || sizeToTier(entry), media: [media] }));
  });
};

const isCarouselSlide = (slide) => slide?.imageDisplayMode === 'carousel';

const statCardsFrom = (items, out, { columns = 3 } = {}) => {
  const list = listOf(items).filter((s) => hasText(s.value) || hasText(s.title) || hasText(s.description));
  if (!list.length) return;
  out.push(block('cards', {
    variant: 'stat',
    columns: Math.min(Math.max(list.length === 1 ? 1 : columns, 1), 3),
    items: list.map((s) => ({ value: clean(s.value), tone: 'neutral', title: clean(s.title), description: clean(s.description) })),
  }));
};

export const slidesToArticleBlocks = (slides) => {
  const out = [];
  for (const slide of listOf(slides)) {
    switch (slide.type) {
      case 'intro':
      case 'end':
        // Consumed by deriveArticleFromSlides (header / contact strip).
        break;

      case 'info': {
        headingFor(slide, out);
        paragraphIf(slide.intro, out);
        if (slide.headlineMetric) {
          statCardsFrom([{ value: slide.headlineMetric.value, title: slide.headlineMetric.label, description: slide.headlineMetric.context }], out, { columns: 1 });
        }
        listOf(slide.items).forEach((item) => {
          if (hasText(item.label) || hasText(item.value)) {
            out.push(block('labelRow', { label: clean(item.label), text: clean(item.value) }));
          }
        });
        const m = slide.methodology;
        if (m && (hasText(m.name) || listOf(m.phases).length)) {
          if (hasText(m.name)) out.push(block('heading', { level: 3, eyebrow: '', text: oneLine(m.name) }));
          bulletsIf('', listOf(m.phases).map((p) =>
            typeof p === 'string' ? p : [hasText(p.name) ? `**${clean(p.name)}**` : '', clean(p.description)].filter(Boolean).join(' — ')
          ), out, { ordered: true });
        }
        break;
      }

      case 'media':
      case 'image':
        headingFor(slide, out);
        figuresFrom(slide.image, out, { carousel: isCarouselSlide(slide), interval: slide.imageCarouselInterval });
        break;

      case 'textAndImage':
      case 'problem':
      case 'context':
      case 'feature':
      case 'testing': {
        headingFor(slide, out);
        paragraphIf(slide.content, out);
        bulletsIf(slide.issuesTitle, slide.issues, out);
        bulletsIf(slide.bullets2Title, slide.bullets2, out);
        const entries = normalizeMedia(slide.image);
        if (entries.length) {
          figuresFrom(slide.image, out, { firstCaption: slide.caption, carousel: isCarouselSlide(slide), interval: slide.imageCarouselInterval });
        } else if (hasText(slide.imageEmbedUrl)) {
          out.push(block('figure', { width: 'wide', media: [{ src: '', caption: clean(slide.caption), isVideo: false, embedUrl: clean(slide.imageEmbedUrl) }] }));
        }
        calloutIf(slide.highlight, out);
        paragraphIf(slide.conclusion, out, { bold: true });
        break;
      }

      case 'quotes':
        headingFor(slide, out);
        paragraphIf(slide.content, out);
        listOf(slide.quotes).forEach((q) => {
          if (hasText(q.text)) out.push(block('quote', { text: clean(q.text), author: clean(q.author), role: '' }));
        });
        bulletsIf(slide.bulletsTitle, slide.bullets, out);
        calloutIf(slide.highlight, out);
        break;

      case 'goals': {
        headingFor(slide, out);
        paragraphIf(slide.description, out);
        const goals = listOf(slide.goals);
        if (goals.length) {
          out.push(block('cards', {
            variant: 'numbered',
            columns: Math.min(Math.max(Number(slide.gridColumns) || 2, 1), 3),
            items: goals.map((g) => ({ number: clean(g.number), tone: 'neutral', title: clean(g.title), description: clean(g.description) })),
          }));
        }
        if (slide.showKpisSection !== false) bulletsIf(slide.kpisTitle || 'KPIs', slide.kpis, out);
        break;
      }

      case 'stats':
      case 'results':
        headingFor(slide, out);
        if (slide.headline) statCardsFrom([{ value: slide.headline.value, title: slide.headline.label, description: slide.headline.context }], out, { columns: 1 });
        statCardsFrom(listOf(slide.stats).map((s) => ({ value: s.value, description: s.label })), out, { columns: Math.min(Number(slide.gridColumns) || 3, 3) });
        paragraphIf(slide.linkbackToProblem, out, { bold: true });
        break;

      case 'outcomes':
        headingFor(slide, out);
        paragraphIf(slide.description, out);
        statCardsFrom(listOf(slide.outcomes).map((o) => ({ value: o.metric, title: o.title, description: o.description })), out, { columns: Math.min(Number(slide.gridColumns) || 3, 3) });
        calloutIf(slide.highlight, out);
        break;

      case 'comparison':
      case 'problemSolution': {
        headingFor(slide, out);
        paragraphIf(slide.description, out);
        const sides = [
          { chip: slide.beforeLabel || 'Before', description: slide.beforeDescription, bulletsTitle: slide.beforeBulletsTitle, bullets: slide.beforeBullets, image: slide.beforeImage, interval: slide.beforeImageCarouselInterval },
          { chip: slide.afterLabel || 'After', description: slide.afterDescription, bulletsTitle: slide.afterBulletsTitle, bullets: slide.afterBullets, image: slide.afterImage, interval: slide.afterImageCarouselInterval },
        ];
        sides.forEach((side) => {
          const hasContent = hasText(side.description) || listOf(side.bullets).length || normalizeMedia(side.image).length;
          if (!hasContent) return;
          out.push(block('heading', { level: 3, eyebrow: '', text: oneLine(side.chip) }));
          paragraphIf(side.description, out);
          bulletsIf(side.bulletsTitle, side.bullets, out);
          figuresFrom(side.image, out, { width: 'wide', carousel: isCarouselSlide(slide), interval: side.interval });
        });
        bulletsIf(slide.bulletsTitle, slide.bullets, out);
        calloutIf(slide.highlight, out);
        break;
      }

      case 'process': {
        headingFor(slide, out);
        const steps = listOf(slide.steps);
        if (steps.length) {
          out.push(block('cards', {
            variant: 'numbered',
            columns: 2,
            items: steps.map((s) => ({ number: clean(s.number), tone: 'neutral', title: clean(s.title), description: clean(s.description) })),
          }));
        }
        break;
      }

      case 'timeline':
        headingFor(slide, out);
        listOf(slide.events).forEach((e) => {
          const text = [hasText(e.title) ? `**${clean(e.title)}**` : '', clean(e.description)].filter(Boolean).join('\n');
          if (hasText(e.date) || text) out.push(block('labelRow', { label: clean(e.date), text }));
        });
        break;

      case 'issuesBreakdown': {
        headingFor(slide, out);
        paragraphIf(slide.subtitle, out);
        paragraphIf(slide.description, out);
        const issues = listOf(slide.issues);
        if (issues.length) {
          out.push(block('cards', {
            variant: 'numbered',
            columns: Math.min(Math.max(Number(slide.gridColumns) || 2, 1), 3),
            items: issues.map((iss) => ({ number: clean(iss.number), tone: 'negative', title: clean(iss.title), description: clean(iss.description) })),
          }));
        }
        break;
      }

      case 'splitList': {
        headingFor(slide, out);
        const items = listOf(slide.items);
        if (items.length) {
          out.push(block('cards', {
            variant: 'icon',
            columns: slide.layoutVariant === 'columns' ? 2 : 1,
            items: items.map((item) => ({ tone: 'neutral', title: clean(item.title), description: clean(item.description) })),
          }));
        }
        calloutIf(slide.highlight, out);
        break;
      }

      case 'achieveGoals':
        headingFor(slide, out);
        [slide.leftColumn, slide.rightColumn].filter(Boolean).forEach((col) => {
          if (hasText(col.title)) out.push(block('heading', { level: 3, eyebrow: '', text: oneLine(col.title) }));
          bulletsIf('', listOf(col.goals).map((g) => (typeof g === 'string' ? g : clean(g.text))), out, { ordered: true });
        });
        break;

      case 'tools': {
        headingFor(slide, out);
        const tools = listOf(slide.tools);
        if (tools.length) {
          out.push(block('cards', {
            variant: 'icon',
            columns: 2,
            items: tools.map((t) => ({ tone: 'neutral', title: clean(t.name), description: clean(t.description) })),
          }));
        }
        break;
      }

      case 'testimonial':
        if (hasText(slide.quote)) out.push(block('quote', { text: clean(slide.quote), author: clean(slide.author), role: clean(slide.role) }));
        paragraphIf(slide.context, out);
        break;

      case 'imageMosaic': {
        headingFor(slide, out);
        const entries = normalizeMedia(slide.images);
        if (entries.length) out.push(block('figure', { width: 'wide', media: entries }));
        break;
      }

      case 'chapter':
        out.push(block('chapter', { number: clean(slide.number), title: oneLine(slide.title), subtitle: clean(slide.subtitle) }));
        break;

      case 'directions': {
        headingFor(slide, out);
        paragraphIf(slide.description, out);
        const count = Math.min(Math.max(Number(slide.directionCount) || 3, 1), 3);
        for (let n = 1; n <= count; n++) {
          const desc = slide[`dir${n}Desc`];
          const image = slide[`dir${n}Image`];
          const status = clean(slide[`dir${n}Status`]).toLowerCase();
          const hideChip = !!slide[`dir${n}HideChip`];
          if (!hasText(desc) && !normalizeMedia(image).length) continue;
          figuresFrom(image, out, { width: 'wide' });
          const prefix = !hideChip && (status === 'accepted' || status === 'rejected')
            ? `**${status === 'accepted' ? 'Accepted' : 'Rejected'}** — `
            : '';
          if (hasText(desc)) out.push(block('paragraph', { text: `${prefix}${clean(desc)}` }));
        }
        calloutIf(slide.highlight, out);
        break;
      }

      case 'reflection': {
        headingFor(slide, out);
        paragraphIf(slide.subtitle, out);
        const hidden = listOf(slide.hiddenCols);
        const colItems = (descField, itemsField) => {
          const items = listOf(slide[itemsField]).map((i) => (typeof i === 'string' ? i : clean(i.text)));
          if (hasText(slide[descField])) items.unshift(`**${clean(slide[descField])}**`);
          return items;
        };
        const checklist = {
          workedTitle: clean(slide.workedTitle) || 'What worked',
          worked: hidden.includes('worked') ? [] : colItems('workedDesc', 'whatWorked'),
          failedTitle: clean(slide.failedTitle) || "What didn't",
          failed: hidden.includes('failed') ? [] : colItems('failedDesc', 'whatFailed'),
          differentlyTitle: clean(slide.differentlyTitle) || "What I'd do differently",
          differently: hidden.includes('differently') ? [] : colItems('differentlyDesc', 'whatYoudDoDifferently'),
        };
        if (checklist.worked.length || checklist.failed.length || checklist.differently.length) {
          out.push(block('checklist', checklist));
        }
        [
          { label: 'What I learned', text: slide.whatYouLearned },
          { label: "What I couldn't measure", text: slide.whatYouCouldntMeasure },
          { label: 'Next iteration', text: slide.nextIteration },
        ].forEach((n) => {
          if (hasText(n.text)) out.push(block('labelRow', { label: n.label, text: clean(n.text) }));
        });
        break;
      }

      case 'question':
        if (hasText(slide.question)) out.push(block('quote', { text: clean(slide.question), author: '', role: clean(slide.support) }));
        break;

      default:
        // Unknown/future slide types: keep whatever prose they carry;
        // never emit an "unknown slide" placeholder.
        headingFor(slide, out);
        paragraphIf(slide.content || slide.description, out);
        break;
    }
  }
  return out;
};

/* ── Full article derivation (fallback + seeding) ─────────────────────── */

export const deriveArticleFromSlides = (project) => {
  const slides = listOf(project?.slides);
  const intro = slides.find((s) => s.type === 'intro');
  const blocks = [];

  // Hero: a figure block at position 0 renders above the title (see renderer).
  // An intro carousel keeps cycling as the hero.
  const heroEntries = normalizeMedia(intro?.image);
  if (heroEntries.length > 1 && isCarouselSlide(intro)) {
    blocks.push(block('figure', {
      width: 'wide',
      display: 'carousel',
      interval: Number(intro.imageCarouselInterval) || 3500,
      media: heroEntries,
    }));
  } else if (heroEntries[0]) {
    blocks.push(block('figure', { width: 'wide', media: [heroEntries[0]] }));
  }

  // Meta grid from intro.metaItems (fallback: client/focus pairs).
  let metaItems = listOf(intro?.metaItems).filter((m) => m && hasText(m.value))
    .map((m) => ({ label: clean(m.label), value: clean(m.value) }));
  if (!metaItems.length && intro) {
    metaItems = [];
    if (hasText(intro.client)) metaItems.push({ label: intro.clientLabel || 'Client', value: clean(intro.client) });
    if (hasText(intro.focus)) metaItems.push({ label: intro.focusLabel || 'Focus', value: clean(intro.focus) });
  }
  if (metaItems.length) blocks.push(block('metaGrid', { items: metaItems }));

  if (intro?.headlineMetric && (hasText(intro.headlineMetric.value) || hasText(intro.headlineMetric.label))) {
    blocks.push(block('cards', {
      variant: 'stat',
      columns: 1,
      items: [{ value: clean(intro.headlineMetric.value), tone: 'neutral', title: clean(intro.headlineMetric.label), description: clean(intro.headlineMetric.context) }],
    }));
  }

  if (blocks.length) blocks.push(block('divider', {}));
  blocks.push(...slidesToArticleBlocks(slides));

  return {
    articleVersion: 1,
    title: oneLine(intro?.title) || oneLine(project?.title) || '',
    lede: [clean(intro?.subtitle), clean(intro?.description)].filter(Boolean).join('\n'),
    blocks,
  };
};
