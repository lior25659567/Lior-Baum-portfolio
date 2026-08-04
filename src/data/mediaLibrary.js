// ─────────────────────────────────────────────────────────────────────────
// mediaLibrary.js — pure helpers for the per-case-study media bin.
//
// The bin (project.mediaLibrary) is a curated, persistent collection of every
// image/video/embed used across a study's slides + article. It is auto-collected
// by a VALUE-BASED walk (matching how extractAndSaveMedia detects media), so it
// is immune to the slides' polymorphic shapes and namespaced keys. No React/DOM
// imports here — this module is unit-tested with `node --test`.
// ─────────────────────────────────────────────────────────────────────────
import { isVideoSrc } from './articleBlocks.js';

// A string is a stored/inline media SOURCE if it's a data image/video URI, a
// blob URL, or a repo asset path under one of our public media trees.
const MEDIA_SRC_RE = /^(data:(image|video)\/|blob:|\/(case-studies|home|playground|about)\/)/i;
const isMediaSrc = (v) => typeof v === 'string' && MEDIA_SRC_RE.test(v.trim());
const isEmbedKey = (k) => k === 'embedUrl' || /EmbedUrl$/.test(k);
const isHttpUrl = (v) => typeof v === 'string' && /^https?:\/\//i.test(v.trim());

export const libraryItemRef = (item) =>
  item && (item.src || item.embedUrl) ? String(item.src || item.embedUrl).trim() : '';

const hashRef = (s) => {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(36);
};
export const newLibraryItemId = (ref) => `ml-${hashRef(ref || '')}`;

export const classifyMediaItem = (item) => {
  if (item && item.embedUrl) {
    let host = '';
    try { host = new URL(item.embedUrl).host.replace(/^www\./, ''); } catch { host = ''; }
    if (host.includes('figma')) return 'figma';
    if (host === 'youtube.com' || host === 'youtu.be' || host.endsWith('.youtube.com')) return 'youtube';
    return 'embed';
  }
  if (item && (item.isVideo || isVideoSrc(item.src))) return 'video';
  return 'image';
};

// Deep-walk any node collecting media items; caption is best-effort from the
// enclosing object. Deduped by ref within one call.
export const collectStudyMedia = (project) => {
  const out = [];
  const seen = new Set();
  const push = (item) => {
    const ref = libraryItemRef(item);
    if (!ref || seen.has(ref)) return;
    seen.add(ref);
    out.push(item);
  };
  const walk = (node) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) { node.forEach(walk); return; }
    const caption = typeof node.caption === 'string' ? node.caption.trim() : '';
    for (const [k, v] of Object.entries(node)) {
      if (isMediaSrc(v)) {
        const src = v.trim();
        push({ src, isVideo: /^data:video\//i.test(src) || isVideoSrc(src), caption });
      } else if (isEmbedKey(k) && isHttpUrl(v)) {
        // Carry the sibling embedType (figma/youtube/site/iframe) when present
        // so a picked embed renders with the right iframe treatment on slides.
        const et = typeof node.embedType === 'string' && node.embedType ? node.embedType : '';
        push(et ? { embedUrl: v.trim(), embedType: et } : { embedUrl: v.trim() });
      } else if (v && typeof v === 'object') {
        walk(v);
      }
    }
  };
  walk(project && project.slides);
  if (project && project.article && Array.isArray(project.article.blocks)) walk(project.article.blocks);
  return out;
};

export const mergeIntoLibrary = (project, nowMs) => {
  const existing = Array.isArray(project.mediaLibrary) ? project.mediaLibrary : [];
  const removed = Array.isArray(project.mediaLibraryRemoved) ? project.mediaLibraryRemoved : [];
  const have = new Set(existing.map(libraryItemRef));
  const tomb = new Set(removed);
  const additions = collectStudyMedia(project)
    .filter((item) => {
      const ref = libraryItemRef(item);
      return ref && !have.has(ref) && !tomb.has(ref);
    })
    .map((item) => ({ id: newLibraryItemId(libraryItemRef(item)), addedAt: nowMs, ...item }));
  return additions.length ? [...existing, ...additions] : existing;
};

export const usageCount = (project, ref) => {
  if (!ref) return 0;
  let n = 0;
  const target = String(ref).trim();
  const walk = (node) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) { node.forEach(walk); return; }
    for (const v of Object.values(node)) {
      if (typeof v === 'string') { if (v.trim() === target) n++; }
      else if (v && typeof v === 'object') walk(v);
    }
  };
  walk(project && project.slides);
  if (project && project.article && Array.isArray(project.article.blocks)) walk(project.article.blocks);
  return n;
};
