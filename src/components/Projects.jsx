import { Link, useNavigate } from 'react-router-dom';
import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEdit } from '../context/EditContext';
import { IFRAME_FILES } from '../iframes';
import './Projects.css';

// Add scheme to bare URLs so `google.com` works as an external link.
const normalizeExternalUrl = (u) => {
  if (!u || typeof u !== 'string') return '';
  const trimmed = u.trim();
  if (!trimmed) return '';
  if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith('mailto:') || trimmed.startsWith('tel:')) return trimmed;
  return `https://${trimmed}`;
};

// Same rules as the case-study media-slide embed input: accepts a full
// <iframe> tag, a URL, or a bare filename (routed into /iframes/ by
// convention). Bare domains get `https://` prepended.
const toIframeSrc = (input) => {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  const iframeMatch = trimmed.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  let src = (iframeMatch ? iframeMatch[1] : trimmed).trim();
  if (!src) return null;
  if (/^([a-z][a-z0-9+\-.]*:|\/\/)/i.test(src)) return src;
  if (src.startsWith('/')) return src;
  const firstSeg = src.split(/[/?#]/)[0];
  const looksLikeDomain = /^[a-z0-9][a-z0-9-]*(\.[a-z0-9-]+)+$/i.test(firstSeg);
  const isLocalFileExt = /\.(html?|pdf|svg|png|jpe?g|gif|webp|mp4|webm)$/i.test(firstSeg);
  if (looksLikeDomain && !isLocalFileExt) return 'https://' + src;
  const cleaned = src.replace(/^\.\//, '');
  if (!cleaned.includes('/')) return '/iframes/' + cleaned;
  return '/' + cleaned;
};

gsap.registerPlugin(ScrollTrigger);

const PROJECT_TAGS = [
  { id: 'all', label: 'All' },
  { id: 'work', label: 'Work' },
  { id: 'personal', label: 'Personal' },
];

// Default projects - used as fallback
const defaultProjects = [
  {
    id: 'align-technology',
    title: 'iTero Toolbar',
    category: 'UI Unification & Efficiency',
    image: '/case-studies/align/slide-1.png',
    year: '2024',
    tag: 'work',
    mediaMode: 'template',
  },
  {
    id: 'itero-scan-workflow',
    title: 'iTero Scan Experience',
    category: 'Clinical Workflow Redesign',
    image: '',
    year: '2024',
    tag: 'work',
    mediaMode: 'template',
  },
  {
    id: 'wizecare',
    title: 'WizeCare',
    category: 'B2B Complex System',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop',
    year: '2023',
    tag: 'work',
    mediaMode: 'template',
  },
];

const ProjectCard = ({ project, index, total, editMode, hideCardYear, onImageChange, onRemove, onUpdate, onMoveUp, onMoveDown }) => {
  // When the section-level hideCardYear flag is on, collapse the year to an
  // empty string so decorative strings like "$ build --year 2024" become
  // "$ build --year " and "Display · 2024" becomes "Display · ". The
  // standalone year flourishes (neon-year, broadsheet-year) are hidden via
  // the .projects--hide-card-year CSS modifier on the section.
  const cardYear = hideCardYear ? '' : (project.year || String(new Date().getFullYear()));
  const fileInputRef = useRef(null);
  const cardRef = useRef(null);
  const fileInputId = `project-image-${project.id}`;
  const [iframeDraft, setIframeDraft] = useState(null); // null = closed, string = open with this value

  const imageFit = project.imageFit === 'contain' ? 'contain' : 'cover';
  const iframeSrc = (project.iframeSrc || '').trim();

  const applyIframe = (raw) => {
    const src = toIframeSrc(raw);
    if (!src) { alert('Please paste an <iframe> tag, URL, or filename'); return; }
    onUpdate(project.id, { iframeSrc: src });
    setIframeDraft(null);
  };

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Compress and convert to data URL. Sized for 2× retina at the
    // largest card width (~800 CSS px), so the image stays sharp without
    // storing multi-MB data URLs in the home-content JSON.
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxWidth = 1920;
        const maxHeight = 1440;
        let { width, height } = img;
        const scale = Math.min(1, maxWidth / width, maxHeight / height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        // PNGs and source files with transparency shouldn't be flattened to
        // JPEG — detect the original MIME and keep PNG when it matters.
        const srcIsPng = typeof event.target.result === 'string' && event.target.result.startsWith('data:image/png');
        const dataUrl = srcIsPng
          ? canvas.toDataURL('image/png')
          : canvas.toDataURL('image/jpeg', 0.92);
        onImageChange(project.id, dataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, [project.id, onImageChange]);

  const externalUrl = normalizeExternalUrl(project.url);
  const mediaMode = project.mediaMode || 'template';
  const showcaseColor = ((index ?? 0) % 4 + 4) % 4;

  useEffect(() => {
    if (mediaMode !== 'animated') return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = cardRef.current;
    if (!el) return;
    const orbs = el.querySelectorAll('.project-media-fx-orb');
    if (!orbs.length) return;
    const media = el.querySelector('.project-media');
    const ctx = gsap.context(() => {
      orbs.forEach((orb, i) => {
        gsap.set(orb, { xPercent: -50, yPercent: -50, force3D: true });
        gsap.to(orb, {
          x: () => gsap.utils.random(-90, 90),
          y: () => gsap.utils.random(-60, 60),
          scale: () => gsap.utils.random(0.7, 1.35),
          rotation: () => gsap.utils.random(-25, 25),
          duration: () => gsap.utils.random(3.5, 6),
          repeat: -1,
          yoyo: true,
          repeatRefresh: true,
          ease: 'sine.inOut',
          delay: i * 0.35,
        });
        gsap.to(orb, {
          opacity: () => gsap.utils.random(0.55, 1),
          duration: () => gsap.utils.random(2, 3.5),
          repeat: -1,
          yoyo: true,
          repeatRefresh: true,
          ease: 'sine.inOut',
          delay: i * 0.5,
        });
      });
      if (media) {
        gsap.to(media, {
          backgroundPosition: '100% 100%',
          duration: 10,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      }
    }, el);
    return () => ctx.revert();
  }, [mediaMode]);

  /* GSAP: magnetic parallax, stencil gradient drift, ledger line draw, flux blobs, trace reveal,
     orbit rings, spotlight cursor, monolith bob, terminal typing, crystal facets */
  useEffect(() => {
    const modes = ['magnetic', 'stencil', 'ledger', 'flux', 'trace', 'orbit', 'spotlight', 'monolith', 'terminal', 'crystal', 'outline', 'contour', 'bauhaus', 'parallax', 'specimen', 'wireframe', 'stratum', 'mirror'];
    if (!modes.includes(mediaMode)) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const el = cardRef.current;
    if (!el) return;
    const media = el.querySelector('.project-media');
    if (!media) return;

    let scrollTrigger;
    let scrollTriggerTrace;
    let scrollTriggerTerminal;
    let scrollTriggerOutline;
    let scrollTriggerSpecimen;
    let scrollTriggerStratum;
    let cleanupMagnetic = () => {};
    let cleanupSpotlight = () => {};
    let cleanupParallax = () => {};
    let cleanupMirror = () => {};
    const ctx = gsap.context(() => {
      if (mediaMode === 'magnetic') {
        const layers = media.querySelectorAll('.project-media-magnetic-layer');
        const brackets = media.querySelectorAll('.project-media-magnetic-bracket');
        const depths = [0.16, 0.3, 0.48];
        const xTo = [...layers].map((layer) =>
          gsap.quickTo(layer, 'x', { duration: 0.65, ease: 'power3.out' })
        );
        const yTo = [...layers].map((layer) =>
          gsap.quickTo(layer, 'y', { duration: 0.65, ease: 'power3.out' })
        );
        const bxTo = [...brackets].map((b) =>
          gsap.quickTo(b, 'x', { duration: 0.65, ease: 'power3.out' })
        );
        const byTo = [...brackets].map((b) =>
          gsap.quickTo(b, 'y', { duration: 0.65, ease: 'power3.out' })
        );

        const onMove = (e) => {
          const rect = media.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;
          layers.forEach((_, i) => {
            xTo[i](x * 56 * depths[i]);
            yTo[i](y * 56 * depths[i]);
          });
          brackets.forEach((_, i) => {
            const d = 0.52 + (i % 2) * 0.06;
            bxTo[i](x * 48 * d);
            byTo[i](y * 48 * d);
          });
        };
        const onLeave = () => {
          layers.forEach((_, i) => {
            xTo[i](0);
            yTo[i](0);
          });
          brackets.forEach((_, i) => {
            bxTo[i](0);
            byTo[i](0);
          });
        };
        media.addEventListener('pointermove', onMove);
        media.addEventListener('pointerleave', onLeave);
        cleanupMagnetic = () => {
          media.removeEventListener('pointermove', onMove);
          media.removeEventListener('pointerleave', onLeave);
        };
      }

      if (mediaMode === 'stencil') {
        const grad = media.querySelector('.project-media-stencil-gradient');
        if (grad) {
          gsap.to(grad, {
            backgroundPosition: '120% 85%',
            duration: 11,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          });
          gsap.to(grad, {
            rotate: 360,
            duration: 90,
            repeat: -1,
            ease: 'none',
          });
        }
        const shards = media.querySelectorAll('.project-media-stencil-shard');
        if (shards.length) {
          gsap.to(shards, {
            y: -5,
            duration: 2.2,
            stagger: 0.14,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          });
        }
      }

      if (mediaMode === 'ledger') {
        const ticks = media.querySelectorAll('.project-media-ledger-tick');
        const spine = media.querySelector('.project-media-ledger-spine');
        gsap.set(ticks, { scaleX: 0, transformOrigin: '0% 50%' });
        if (spine) gsap.set(spine, { scaleY: 0, transformOrigin: '50% 0%' });

        scrollTrigger = ScrollTrigger.create({
          trigger: media,
          start: 'top 90%',
          once: true,
          onEnter: () => {
            if (spine) {
              gsap.to(spine, { scaleY: 1, duration: 0.85, ease: 'power2.inOut' });
            }
            gsap.to(ticks, {
              scaleX: 1,
              duration: 0.55,
              stagger: 0.07,
              ease: 'power2.out',
            });
            const label = media.querySelector('.project-media-ledger-label');
            if (label) {
              gsap.fromTo(
                label,
                { opacity: 0, x: -8 },
                { opacity: 1, x: 0, duration: 0.5, delay: 0.35, ease: 'power2.out' }
              );
            }
          },
        });
      }

      if (mediaMode === 'flux') {
        const blobs = media.querySelectorAll('.project-media-flux-blob');
        blobs.forEach((blob, i) => {
          gsap.to(blob, {
            x: () => gsap.utils.random(-28, 28),
            y: () => gsap.utils.random(-32, 32),
            scale: () => gsap.utils.random(0.88, 1.18),
            duration: () => gsap.utils.random(4.2, 7.5),
            repeat: -1,
            yoyo: true,
            repeatRefresh: true,
            ease: 'sine.inOut',
            delay: i * 0.45,
          });
        });
        const base = media.querySelector('.project-media-flux-base');
        if (base) {
          gsap.to(base, {
            backgroundPosition: '95% 75%',
            duration: 14,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          });
        }
        const sweep = media.querySelector('.project-media-flux-sweep');
        if (sweep) {
          gsap.to(sweep, {
            rotate: 360,
            duration: 42,
            repeat: -1,
            ease: 'none',
          });
        }
      }

      if (mediaMode === 'orbit') {
        const rings = media.querySelectorAll('.project-media-orbit-ring');
        rings.forEach((ring, i) => {
          gsap.set(ring, { transformOrigin: '50% 50%' });
          gsap.to(ring, {
            rotation: i % 2 === 0 ? 360 : -360,
            duration: 22 + i * 14,
            repeat: -1,
            ease: 'none',
          });
        });
        const markers = media.querySelectorAll('.project-media-orbit-marker');
        gsap.fromTo(
          markers,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.5, stagger: 0.12, delay: 0.2, ease: 'back.out(1.6)' }
        );
      }

      if (mediaMode === 'spotlight') {
        const light = media.querySelector('.project-media-spotlight-light');
        const cross = media.querySelector('.project-media-spotlight-cross');
        if (!light) return;
        gsap.set(light, { xPercent: -50, yPercent: -50, force3D: true });
        if (cross) gsap.set(cross, { xPercent: -50, yPercent: -50, force3D: true });
        const xTo = gsap.quickTo(light, 'x', { duration: 0.55, ease: 'power3.out' });
        const yTo = gsap.quickTo(light, 'y', { duration: 0.55, ease: 'power3.out' });
        const cxTo = cross ? gsap.quickTo(cross, 'x', { duration: 0.35, ease: 'power3.out' }) : null;
        const cyTo = cross ? gsap.quickTo(cross, 'y', { duration: 0.35, ease: 'power3.out' }) : null;

        const rect0 = media.getBoundingClientRect();
        xTo(rect0.width / 2);
        yTo(rect0.height / 2);
        cxTo && cxTo(rect0.width / 2);
        cyTo && cyTo(rect0.height / 2);

        let drift;
        const drifted = () => {
          drift = gsap.to({ t: 0 }, {
            t: 1,
            duration: 6,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            onUpdate: function () {
              const rect = media.getBoundingClientRect();
              const t = this.targets()[0].t;
              const ox = rect.width * (0.35 + 0.3 * t);
              const oy = rect.height * (0.4 + 0.2 * Math.sin(t * Math.PI));
              xTo(ox);
              yTo(oy);
              cxTo && cxTo(ox);
              cyTo && cyTo(oy);
            },
          });
        };
        drifted();

        const onMove = (e) => {
          drift?.kill();
          drift = null;
          const rect = media.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          xTo(x);
          yTo(y);
          cxTo && cxTo(x);
          cyTo && cyTo(y);
        };
        const onLeave = () => {
          if (!drift) drifted();
        };
        media.addEventListener('pointermove', onMove);
        media.addEventListener('pointerleave', onLeave);
        cleanupSpotlight = () => {
          media.removeEventListener('pointermove', onMove);
          media.removeEventListener('pointerleave', onLeave);
          drift?.kill();
        };
      }

      if (mediaMode === 'monolith') {
        const cols = media.querySelectorAll('.project-media-monolith-col');
        cols.forEach((col, i) => {
          gsap.fromTo(
            col,
            { yPercent: 100, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 0.85, delay: i * 0.08, ease: 'power3.out' }
          );
          gsap.to(col, {
            y: () => gsap.utils.random(-6, 6),
            duration: () => gsap.utils.random(3.6, 5.5),
            repeat: -1,
            yoyo: true,
            repeatRefresh: true,
            ease: 'sine.inOut',
            delay: 0.85 + i * 0.15,
          });
        });
      }

      if (mediaMode === 'terminal') {
        const lines = media.querySelectorAll('.project-media-terminal-line');
        gsap.set(lines, { opacity: 0, x: -6 });
        scrollTriggerTerminal = ScrollTrigger.create({
          trigger: media,
          start: 'top 90%',
          once: true,
          onEnter: () => {
            gsap.to(lines, {
              opacity: 1,
              x: 0,
              duration: 0.45,
              stagger: 0.3,
              ease: 'power2.out',
            });
          },
        });
      }

      if (mediaMode === 'crystal') {
        const facets = media.querySelectorAll('.project-media-crystal-facet');
        facets.forEach((f, i) => {
          gsap.set(f, { transformOrigin: '50% 50%' });
          gsap.to(f, {
            rotation: i % 2 === 0 ? 360 : -360,
            duration: 32 + i * 10,
            repeat: -1,
            ease: 'none',
          });
          gsap.to(f, {
            scale: () => gsap.utils.random(0.88, 1.12),
            duration: () => gsap.utils.random(4, 6.5),
            repeat: -1,
            yoyo: true,
            repeatRefresh: true,
            ease: 'sine.inOut',
            delay: i * 0.3,
          });
        });
        const ring = media.querySelector('.project-media-crystal-ring');
        if (ring) {
          gsap.to(ring, {
            rotation: 360,
            duration: 60,
            repeat: -1,
            ease: 'none',
            transformOrigin: '50% 50%',
          });
        }
      }

      if (mediaMode === 'outline') {
        const edges = media.querySelectorAll('.project-media-outline-edge');
        const hEdges = media.querySelectorAll(
          '.project-media-outline-edge--top, .project-media-outline-edge--bottom'
        );
        const vEdges = media.querySelectorAll(
          '.project-media-outline-edge--left, .project-media-outline-edge--right'
        );
        const ticks = media.querySelectorAll('.project-media-outline-tick');
        const cross = media.querySelector('.project-media-outline-cross');
        const dim = media.querySelector('.project-media-outline-dim');
        const label = media.querySelector('.project-media-outline-label');
        gsap.set(hEdges, { scaleX: 0, transformOrigin: '0% 50%' });
        gsap.set(vEdges, { scaleY: 0, transformOrigin: '50% 0%' });
        gsap.set(ticks, { opacity: 0, scale: 0.5 });
        if (cross) gsap.set(cross, { opacity: 0, scale: 0.6 });
        if (dim) gsap.set(dim, { opacity: 0, y: 6 });
        if (label) gsap.set(label, { opacity: 0, x: -6 });

        scrollTriggerOutline = ScrollTrigger.create({
          trigger: media,
          start: 'top 90%',
          once: true,
          onEnter: () => {
            const tl = gsap.timeline();
            tl.to(hEdges, {
              scaleX: 1,
              duration: 0.7,
              stagger: 0.08,
              ease: 'power3.inOut',
            });
            tl.to(vEdges, {
              scaleY: 1,
              duration: 0.7,
              stagger: 0.08,
              ease: 'power3.inOut',
            }, '-=0.5');
            tl.to(ticks, {
              opacity: 1,
              scale: 1,
              duration: 0.4,
              stagger: 0.06,
              ease: 'back.out(1.6)',
            }, '-=0.3');
            if (cross) tl.to(cross, { opacity: 1, scale: 1, duration: 0.35, ease: 'power2.out' }, '-=0.25');
            if (dim) tl.to(dim, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }, '-=0.2');
            if (label) tl.to(label, { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }, '-=0.25');
          },
        });
      }

      if (mediaMode === 'contour') {
        const a = media.querySelector('.project-media-contour-lines--a');
        const b = media.querySelector('.project-media-contour-lines--b');
        if (a) {
          gsap.to(a, {
            backgroundPosition: '180% 140%',
            duration: 22,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          });
        }
        if (b) {
          gsap.to(b, {
            backgroundPosition: '-120% -140%',
            duration: 28,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          });
        }
      }

      if (mediaMode === 'bauhaus') {
        const shapes = media.querySelectorAll('.project-media-bauhaus-shape');
        shapes.forEach((s, i) => {
          gsap.set(s, { transformOrigin: '50% 50%' });
          gsap.fromTo(
            s,
            { scale: 0, opacity: 0, rotation: -30 },
            { scale: 1, opacity: 1, rotation: 0, duration: 0.85, delay: 0.1 + i * 0.14, ease: 'back.out(1.5)' }
          );
          gsap.to(s, {
            rotation: i % 2 === 0 ? '+=360' : '-=360',
            duration: 70 + i * 20,
            repeat: -1,
            ease: 'none',
            delay: 1,
          });
          gsap.to(s, {
            y: () => gsap.utils.random(-6, 6),
            x: () => gsap.utils.random(-4, 4),
            duration: () => gsap.utils.random(4, 6),
            repeat: -1,
            yoyo: true,
            repeatRefresh: true,
            ease: 'sine.inOut',
            delay: 1 + i * 0.2,
          });
        });
      }

      if (mediaMode === 'parallax') {
        const layers = media.querySelectorAll('.project-media-parallax-layer');
        const wrapper = media.querySelector('.project-image-wrapper');
        const brackets = media.querySelectorAll('.project-media-parallax-bracket');
        if (!layers.length) return;

        const xTos = [...layers].map((l) => gsap.quickTo(l, 'x', { duration: 0.6, ease: 'power3.out' }));
        const yTos = [...layers].map((l) => gsap.quickTo(l, 'y', { duration: 0.6, ease: 'power3.out' }));
        const depths = [...layers].map((l) => parseFloat(l.dataset.depth || '0.3'));

        const wrapRotX = wrapper ? gsap.quickTo(wrapper, 'rotateX', { duration: 0.5, ease: 'power3.out' }) : null;
        const wrapRotY = wrapper ? gsap.quickTo(wrapper, 'rotateY', { duration: 0.5, ease: 'power3.out' }) : null;

        if (wrapper) gsap.set(wrapper, { transformPerspective: 800, transformOrigin: '50% 50%' });
        if (brackets.length) gsap.set(brackets, { transformOrigin: '50% 50%' });

        const onMove = (e) => {
          const rect = media.getBoundingClientRect();
          const nx = (e.clientX - rect.left) / rect.width - 0.5;
          const ny = (e.clientY - rect.top) / rect.height - 0.5;
          layers.forEach((_, i) => {
            xTos[i](-nx * 60 * depths[i]);
            yTos[i](-ny * 60 * depths[i]);
          });
          if (wrapRotY) wrapRotY(nx * 6);
          if (wrapRotX) wrapRotX(-ny * 6);
        };
        const onLeave = () => {
          layers.forEach((_, i) => {
            xTos[i](0);
            yTos[i](0);
          });
          if (wrapRotX) wrapRotX(0);
          if (wrapRotY) wrapRotY(0);
        };
        media.addEventListener('pointermove', onMove);
        media.addEventListener('pointerleave', onLeave);
        cleanupParallax = () => {
          media.removeEventListener('pointermove', onMove);
          media.removeEventListener('pointerleave', onLeave);
        };
      }

      if (mediaMode === 'specimen') {
        const glyph = media.querySelector('.project-media-specimen-glyph');
        const baseline = media.querySelector('.project-media-specimen-baseline');
        const metas = media.querySelectorAll('.project-media-specimen-meta');
        if (glyph) gsap.set(glyph, { opacity: 0, y: 40 });
        if (baseline) gsap.set(baseline, { scaleX: 0, transformOrigin: '0% 50%' });
        if (metas.length) gsap.set(metas, { opacity: 0, x: -6 });

        scrollTriggerSpecimen = ScrollTrigger.create({
          trigger: media,
          start: 'top 90%',
          once: true,
          onEnter: () => {
            const tl = gsap.timeline();
            if (baseline) tl.to(baseline, { scaleX: 1, duration: 0.8, ease: 'power3.inOut' });
            if (glyph) tl.to(glyph, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5');
            if (metas.length) tl.to(metas, { opacity: 1, x: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out' }, '-=0.3');
          },
        });
      }

      if (mediaMode === 'wireframe') {
        const cube = media.querySelector('.project-media-wireframe-cube');
        if (cube) {
          gsap.set(cube, { transformOrigin: '50% 50%' });
          gsap.to(cube, {
            rotation: 360,
            duration: 54,
            repeat: -1,
            ease: 'none',
          });
          gsap.fromTo(
            cube,
            { scale: 0.86, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.9, ease: 'power3.out' }
          );
        }
        const faces = media.querySelectorAll('.project-media-wireframe-face');
        gsap.fromTo(
          faces,
          { opacity: 0 },
          { opacity: 1, duration: 0.5, stagger: 0.12, delay: 0.25, ease: 'power2.out' }
        );
      }

      if (mediaMode === 'stratum') {
        const bands = media.querySelectorAll('.project-media-stratum-band');
        gsap.set(bands, { scaleX: 0, transformOrigin: '0% 50%' });
        scrollTriggerStratum = ScrollTrigger.create({
          trigger: media,
          start: 'top 90%',
          once: true,
          onEnter: () => {
            gsap.to(bands, {
              scaleX: 1,
              duration: 0.85,
              stagger: 0.07,
              ease: 'power3.out',
            });
          },
        });
      }

      if (mediaMode === 'mirror') {
        const wrapper = media.querySelector('.project-image-wrapper');
        const reflect = media.querySelector('.project-media-mirror-reflect');
        if (!wrapper || !reflect) return;
        const yTop = gsap.quickTo(wrapper, 'y', { duration: 0.6, ease: 'power3.out' });
        const yBot = gsap.quickTo(reflect, 'y', { duration: 0.8, ease: 'power3.out' });

        const onMove = (e) => {
          const rect = media.getBoundingClientRect();
          const ny = (e.clientY - rect.top) / rect.height - 0.5;
          yTop(-ny * 8);
          yBot(ny * 14);
        };
        const onLeave = () => {
          yTop(0);
          yBot(0);
        };
        media.addEventListener('pointermove', onMove);
        media.addEventListener('pointerleave', onLeave);
        cleanupMirror = () => {
          media.removeEventListener('pointermove', onMove);
          media.removeEventListener('pointerleave', onLeave);
        };
      }

      if (mediaMode === 'trace') {
        const marks = media.querySelectorAll('.project-media-trace-mark');
        const hEdges = media.querySelectorAll(
          '.project-media-trace-edge--top, .project-media-trace-edge--bottom'
        );
        const vEdges = media.querySelectorAll(
          '.project-media-trace-edge--left, .project-media-trace-edge--right'
        );
        gsap.set(marks, { opacity: 0, scale: 0.4 });
        gsap.set(hEdges, { scaleX: 0, transformOrigin: '50% 50%' });
        gsap.set(vEdges, { scaleY: 0, transformOrigin: '50% 0%' });
        scrollTriggerTrace = ScrollTrigger.create({
          trigger: media,
          start: 'top 90%',
          once: true,
          onEnter: () => {
            gsap.to(hEdges, {
              scaleX: 1,
              duration: 0.62,
              stagger: 0.07,
              ease: 'power2.out',
            });
            gsap.to(vEdges, {
              scaleY: 1,
              duration: 0.62,
              stagger: 0.07,
              delay: 0.08,
              ease: 'power2.out',
            });
            gsap.to(marks, {
              opacity: 1,
              scale: 1,
              duration: 0.45,
              stagger: 0.07,
              delay: 0.18,
              ease: 'back.out(1.4)',
            });
            const cross = media.querySelector('.project-media-trace-cross');
            if (cross) {
              gsap.fromTo(
                cross,
                { opacity: 0, scale: 0.6 },
                { opacity: 1, scale: 1, duration: 0.4, delay: 0.52, ease: 'power2.out' }
              );
            }
          },
        });
      }
    }, el);

    return () => {
      cleanupMagnetic();
      cleanupSpotlight();
      cleanupParallax();
      cleanupMirror();
      scrollTrigger?.kill();
      scrollTriggerTrace?.kill();
      scrollTriggerTerminal?.kill();
      scrollTriggerOutline?.kill();
      scrollTriggerSpecimen?.kill();
      scrollTriggerStratum?.kill();
      ctx.revert();
    };
  }, [mediaMode]);

  return (
    <article
      ref={cardRef}
      className={`project-card work-grid-project${project.hidden ? ' is-hidden-from-visitors' : ''}`}
      data-media-mode={mediaMode}
      data-showcase-color={showcaseColor}
    >
      {externalUrl ? (
        <a
          href={externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="project-link"
          aria-label={project.title}
        />
      ) : (
        <Link to={`/project/${project.id}`} className="project-link" aria-label={project.title} />
      )}

      {/* Image area */}
      <div
        className="project-media"
        data-media-mode={mediaMode}
        data-has-iframe={iframeSrc ? 'true' : undefined}
        data-fill-media={(iframeSrc || project.image) ? 'true' : undefined}
      >
        {mediaMode === 'animated' && (
          <div className="project-media-fx" aria-hidden="true">
            <span className="project-media-fx-orb project-media-fx-orb--1" />
            <span className="project-media-fx-orb project-media-fx-orb--2" />
            <span className="project-media-fx-orb project-media-fx-orb--3" />
          </div>
        )}
        {mediaMode === 'showcase' && (
          <div className="project-media-showcase-bg" aria-hidden="true" />
        )}
        {mediaMode === 'prism' && (
          <>
            <div className="project-media-prism-bg" aria-hidden="true" />
            <div className="project-media-prism-grain" aria-hidden="true" />
            <span className="project-media-prism-num" aria-hidden="true">
              <span className="project-media-prism-num-label">Case</span>
              <span className="project-media-prism-num-value">
                {String(((index ?? 0) % 99) + 1).padStart(2, '0')}
              </span>
            </span>
          </>
        )}
        {mediaMode === 'duotone' && (
          <span className="project-media-duotone-num" aria-hidden="true">
            {String(((index ?? 0) % 99) + 1).padStart(2, '0')}
          </span>
        )}
        {mediaMode === 'halftone' && (
          <>
            <span className="project-media-halftone-plate" aria-hidden="true">Plate</span>
            <span className="project-media-halftone-rule" aria-hidden="true" />
            <span className="project-media-halftone-tag" aria-hidden="true">
              {`\u2116 ${String(((index ?? 0) % 99) + 1).padStart(2, '0')}`}
            </span>
            <span className="project-media-halftone-caption" aria-hidden="true" />
          </>
        )}
        {mediaMode === 'marquee' && (
          <div className="project-media-marquee" aria-hidden="true">
            <div className="project-media-marquee-track">
              {Array.from({ length: 4 }).map((_, i) => (
                <span className="project-media-marquee-item" key={i}>
                  <span>Case Study</span>
                  <span className="project-media-marquee-dot" />
                  <span>{cardYear}</span>
                  <span className="project-media-marquee-dot" />
                  <span>View Project</span>
                  <span className="project-media-marquee-dot" />
                </span>
              ))}
            </div>
          </div>
        )}
        {mediaMode === 'broadsheet' && (
          <span className="project-media-broadsheet-year" aria-hidden="true">
            {String(((index ?? 0) % 99) + 1).padStart(2, '0')}
          </span>
        )}
        {mediaMode === 'risograph' && (
          <>
            <div className="project-media-riso-layer project-media-riso-layer--a" aria-hidden="true" />
            <div className="project-media-riso-layer project-media-riso-layer--b" aria-hidden="true" />
            <span className="project-media-riso-reg project-media-riso-reg--tl" aria-hidden="true" />
            <span className="project-media-riso-reg project-media-riso-reg--br" aria-hidden="true" />
          </>
        )}
        {mediaMode === 'aurora' && (
          <>
            <div className="project-media-aurora-blob project-media-aurora-blob--a" aria-hidden="true" />
            <div className="project-media-aurora-blob project-media-aurora-blob--b" aria-hidden="true" />
            <div className="project-media-aurora-blob project-media-aurora-blob--c" aria-hidden="true" />
            <div className="project-media-aurora-blob project-media-aurora-blob--d" aria-hidden="true" />
            <div className="project-media-aurora-sheen" aria-hidden="true" />
            <div className="project-media-aurora-vignette" aria-hidden="true" />
          </>
        )}
        {mediaMode === 'cinema' && (
          <>
            <div className="project-media-cinema-bar project-media-cinema-bar--top" aria-hidden="true" />
            <div className="project-media-cinema-bar project-media-cinema-bar--bottom" aria-hidden="true" />
            <div className="project-media-cinema-vignette" aria-hidden="true" />
            <div className="project-media-cinema-scan" aria-hidden="true" />
            <div className="project-media-cinema-grain" aria-hidden="true" />
            <span className="project-media-cinema-label" aria-hidden="true">REC</span>
            <span className="project-media-cinema-dot" aria-hidden="true" />
            <span className="project-media-cinema-code" aria-hidden="true">
              {`00:${String(((index ?? 0) * 7 + 12) % 60).padStart(2, '0')}:${String(((index ?? 0) * 23 + 31) % 60).padStart(2, '0')}`}
            </span>
            <span className="project-media-cinema-scene" aria-hidden="true">
              {`SCN ${String(((index ?? 0) % 99) + 1).padStart(2, '0')}`}
            </span>
          </>
        )}
        {mediaMode === 'neon' && (
          <>
            <div className="project-media-neon-grid" aria-hidden="true" />
            <span className="project-media-neon-label" aria-hidden="true">
              {`Case \u2022 ${String(((index ?? 0) % 99) + 1).padStart(2, '0')}`}
            </span>
            <span className="project-media-neon-year" aria-hidden="true">
              {cardYear}
            </span>
            <span className="project-media-neon-corner project-media-neon-corner--tl" aria-hidden="true" />
            <span className="project-media-neon-corner project-media-neon-corner--br" aria-hidden="true" />
          </>
        )}
        {mediaMode === 'magnetic' && (
          <>
            <div className="project-media-magnetic-layer project-media-magnetic-layer--grid" aria-hidden="true" />
            <div className="project-media-magnetic-layer project-media-magnetic-layer--orbit" aria-hidden="true" />
            <div className="project-media-magnetic-layer project-media-magnetic-layer--mesh" aria-hidden="true" />
            <span className="project-media-magnetic-bracket project-media-magnetic-bracket--tl" aria-hidden="true" />
            <span className="project-media-magnetic-bracket project-media-magnetic-bracket--tr" aria-hidden="true" />
            <span className="project-media-magnetic-bracket project-media-magnetic-bracket--bl" aria-hidden="true" />
            <span className="project-media-magnetic-bracket project-media-magnetic-bracket--br" aria-hidden="true" />
            <span className="project-media-magnetic-index" aria-hidden="true">
              {String(((index ?? 0) % 99) + 1).padStart(2, '0')}
            </span>
          </>
        )}
        {mediaMode === 'stencil' && (
          <>
            <div className="project-media-stencil-gradient" aria-hidden="true" />
            <div className="project-media-stencil-noise" aria-hidden="true" />
            <span className="project-media-stencil-shard project-media-stencil-shard--a" aria-hidden="true" />
            <span className="project-media-stencil-shard project-media-stencil-shard--b" aria-hidden="true" />
            <span className="project-media-stencil-shard project-media-stencil-shard--c" aria-hidden="true" />
            <span className="project-media-stencil-title" aria-hidden="true">Case</span>
            <span className="project-media-stencil-num" aria-hidden="true">
              {String(((index ?? 0) % 99) + 1).padStart(2, '0')}
            </span>
          </>
        )}
        {mediaMode === 'ledger' && (
          <>
            <div className="project-media-ledger-spine" aria-hidden="true" />
            <div className="project-media-ledger-guides" aria-hidden="true">
              <span className="project-media-ledger-tick" />
              <span className="project-media-ledger-tick" />
              <span className="project-media-ledger-tick" />
              <span className="project-media-ledger-tick" />
              <span className="project-media-ledger-tick" />
              <span className="project-media-ledger-tick" />
            </div>
            <span className="project-media-ledger-label" aria-hidden="true">Index</span>
            <span className="project-media-ledger-code" aria-hidden="true">
              {`No. ${String(((index ?? 0) % 99) + 1).padStart(2, '0')}`}
            </span>
          </>
        )}
        {mediaMode === 'flux' && (
          <>
            <div className="project-media-flux-base" aria-hidden="true" />
            <div className="project-media-flux-sweep" aria-hidden="true" />
            <div className="project-media-flux-blob project-media-flux-blob--a" aria-hidden="true" />
            <div className="project-media-flux-blob project-media-flux-blob--b" aria-hidden="true" />
            <div className="project-media-flux-blob project-media-flux-blob--c" aria-hidden="true" />
            <div className="project-media-flux-blob project-media-flux-blob--d" aria-hidden="true" />
            <div className="project-media-flux-vignette" aria-hidden="true" />
          </>
        )}
        {mediaMode === 'trace' && (
          <>
            <div className="project-media-trace-hatch" aria-hidden="true" />
            <span className="project-media-trace-edge project-media-trace-edge--top" aria-hidden="true" />
            <span className="project-media-trace-edge project-media-trace-edge--bottom" aria-hidden="true" />
            <span className="project-media-trace-edge project-media-trace-edge--left" aria-hidden="true" />
            <span className="project-media-trace-edge project-media-trace-edge--right" aria-hidden="true" />
            <span className="project-media-trace-mark project-media-trace-mark--tl" aria-hidden="true" />
            <span className="project-media-trace-mark project-media-trace-mark--tr" aria-hidden="true" />
            <span className="project-media-trace-mark project-media-trace-mark--bl" aria-hidden="true" />
            <span className="project-media-trace-mark project-media-trace-mark--br" aria-hidden="true" />
            <span className="project-media-trace-cross" aria-hidden="true" />
            <span className="project-media-trace-meta" aria-hidden="true">
              {`REF \u00b7 ${String(((index ?? 0) % 99) + 1).padStart(2, '0')}`}
            </span>
          </>
        )}
        {mediaMode === 'weave' && (
          <>
            <div className="project-media-weave-layer project-media-weave-layer--a" aria-hidden="true" />
            <div className="project-media-weave-layer project-media-weave-layer--b" aria-hidden="true" />
            <div className="project-media-weave-layer project-media-weave-layer--c" aria-hidden="true" />
            <div className="project-media-weave-fade" aria-hidden="true" />
          </>
        )}
        {mediaMode === 'orbit' && (
          <>
            <div className="project-media-orbit-backdrop" aria-hidden="true" />
            <div className="project-media-orbit-ring project-media-orbit-ring--xl" aria-hidden="true">
              <span className="project-media-orbit-marker" />
            </div>
            <div className="project-media-orbit-ring project-media-orbit-ring--lg" aria-hidden="true">
              <span className="project-media-orbit-marker" />
            </div>
            <div className="project-media-orbit-ring project-media-orbit-ring--md" aria-hidden="true">
              <span className="project-media-orbit-marker" />
            </div>
            <span className="project-media-orbit-core" aria-hidden="true" />
            <span className="project-media-orbit-label" aria-hidden="true">
              {`ORB \u00b7 ${String(((index ?? 0) % 99) + 1).padStart(2, '0')}`}
            </span>
          </>
        )}
        {mediaMode === 'spotlight' && (
          <>
            <div className="project-media-spotlight-base" aria-hidden="true" />
            <div className="project-media-spotlight-grid" aria-hidden="true" />
            <div className="project-media-spotlight-light" aria-hidden="true" />
            <span className="project-media-spotlight-cross" aria-hidden="true" />
            <span className="project-media-spotlight-code" aria-hidden="true">
              {`LUX \u00b7 ${String(((index ?? 0) % 99) + 1).padStart(2, '0')}`}
            </span>
          </>
        )}
        {mediaMode === 'monolith' && (
          <>
            <div className="project-media-monolith-stack" aria-hidden="true">
              <span className="project-media-monolith-col project-media-monolith-col--1" />
              <span className="project-media-monolith-col project-media-monolith-col--2" />
              <span className="project-media-monolith-col project-media-monolith-col--3" />
              <span className="project-media-monolith-col project-media-monolith-col--4" />
              <span className="project-media-monolith-col project-media-monolith-col--5" />
            </div>
            <span className="project-media-monolith-rule" aria-hidden="true" />
            <span className="project-media-monolith-index" aria-hidden="true">
              {String(((index ?? 0) % 99) + 1).padStart(2, '0')}
            </span>
            <span className="project-media-monolith-tag" aria-hidden="true">Monolith</span>
          </>
        )}
        {mediaMode === 'terminal' && (
          <>
            <div className="project-media-terminal-base" aria-hidden="true" />
            <div className="project-media-terminal-scan" aria-hidden="true" />
            <div className="project-media-terminal-bar" aria-hidden="true">
              <span className="project-media-terminal-dot" />
              <span className="project-media-terminal-dot" />
              <span className="project-media-terminal-dot" />
              <span className="project-media-terminal-title">~/case-study</span>
            </div>
            <div className="project-media-terminal-lines" aria-hidden="true">
              <span className="project-media-terminal-line">$ open project</span>
              <span className="project-media-terminal-line">$ build --year {cardYear}</span>
              <span className="project-media-terminal-line project-media-terminal-line--cursor">
                $ <span className="project-media-terminal-caret" />
              </span>
            </div>
          </>
        )}
        {mediaMode === 'crystal' && (
          <>
            <div className="project-media-crystal-bg" aria-hidden="true" />
            <div className="project-media-crystal-ring" aria-hidden="true" />
            <span className="project-media-crystal-facet project-media-crystal-facet--a" aria-hidden="true" />
            <span className="project-media-crystal-facet project-media-crystal-facet--b" aria-hidden="true" />
            <span className="project-media-crystal-facet project-media-crystal-facet--c" aria-hidden="true" />
            <span className="project-media-crystal-facet project-media-crystal-facet--d" aria-hidden="true" />
            <span className="project-media-crystal-core" aria-hidden="true" />
            <span className="project-media-crystal-mark" aria-hidden="true">
              {`\u25C8 ${String(((index ?? 0) % 99) + 1).padStart(2, '0')}`}
            </span>
          </>
        )}
        {mediaMode === 'outline' && (
          <>
            <span className="project-media-outline-edge project-media-outline-edge--top" aria-hidden="true" />
            <span className="project-media-outline-edge project-media-outline-edge--right" aria-hidden="true" />
            <span className="project-media-outline-edge project-media-outline-edge--bottom" aria-hidden="true" />
            <span className="project-media-outline-edge project-media-outline-edge--left" aria-hidden="true" />
            <span className="project-media-outline-tick project-media-outline-tick--tl" aria-hidden="true" />
            <span className="project-media-outline-tick project-media-outline-tick--tr" aria-hidden="true" />
            <span className="project-media-outline-tick project-media-outline-tick--bl" aria-hidden="true" />
            <span className="project-media-outline-tick project-media-outline-tick--br" aria-hidden="true" />
            <span className="project-media-outline-cross" aria-hidden="true" />
            <span className="project-media-outline-dim" aria-hidden="true">
              <span className="project-media-outline-dim-cap" />
              <span className="project-media-outline-dim-line" />
              <span className="project-media-outline-dim-cap" />
            </span>
            <span className="project-media-outline-label" aria-hidden="true">
              {`\u2014 ${String(((index ?? 0) % 99) + 1).padStart(2, '0')} / \u221E`}
            </span>
          </>
        )}
        {mediaMode === 'contour' && (
          <>
            <div className="project-media-contour-base" aria-hidden="true" />
            <div className="project-media-contour-lines project-media-contour-lines--a" aria-hidden="true" />
            <div className="project-media-contour-lines project-media-contour-lines--b" aria-hidden="true" />
            <div className="project-media-contour-fade" aria-hidden="true" />
            <span className="project-media-contour-label" aria-hidden="true">
              {`ELEV \u00b7 ${String(((index ?? 0) % 99) + 1).padStart(2, '0')}`}
            </span>
          </>
        )}
        {mediaMode === 'bauhaus' && (
          <>
            <div className="project-media-bauhaus-canvas" aria-hidden="true" />
            <span className="project-media-bauhaus-shape project-media-bauhaus-shape--circle" aria-hidden="true" />
            <span className="project-media-bauhaus-shape project-media-bauhaus-shape--square" aria-hidden="true" />
            <span className="project-media-bauhaus-shape project-media-bauhaus-shape--triangle" aria-hidden="true" />
            <span className="project-media-bauhaus-rule" aria-hidden="true" />
            <span className="project-media-bauhaus-index" aria-hidden="true">
              {String(((index ?? 0) % 99) + 1).padStart(2, '0')}
            </span>
            <span className="project-media-bauhaus-tag" aria-hidden="true">Form</span>
          </>
        )}
        {mediaMode === 'parallax' && (
          <>
            <div className="project-media-parallax-grid project-media-parallax-layer" data-depth="0.25" aria-hidden="true" />
            <div className="project-media-parallax-dots project-media-parallax-layer" data-depth="0.5" aria-hidden="true" />
            <div className="project-media-parallax-glow project-media-parallax-layer" data-depth="0.7" aria-hidden="true" />
            <span className="project-media-parallax-bracket project-media-parallax-bracket--tl" aria-hidden="true" />
            <span className="project-media-parallax-bracket project-media-parallax-bracket--br" aria-hidden="true" />
            <span className="project-media-parallax-mark" aria-hidden="true">
              {`\u25FB ${String(((index ?? 0) % 99) + 1).padStart(2, '0')}`}
            </span>
          </>
        )}
        {mediaMode === 'specimen' && (
          <>
            <div className="project-media-specimen-grid" aria-hidden="true" />
            <span className="project-media-specimen-glyph" aria-hidden="true">
              {String(((index ?? 0) % 99) + 1).padStart(2, '0')}
            </span>
            <span className="project-media-specimen-baseline" aria-hidden="true" />
            <span className="project-media-specimen-meta project-media-specimen-meta--top" aria-hidden="true">Type Specimen</span>
            <span className="project-media-specimen-meta project-media-specimen-meta--bottom" aria-hidden="true">
              {`Display \u00b7 ${cardYear}`}
            </span>
          </>
        )}
        {mediaMode === 'pulse' && (
          <>
            <div className="project-media-pulse-base" aria-hidden="true" />
            <span className="project-media-pulse-wave project-media-pulse-wave--1" aria-hidden="true" />
            <span className="project-media-pulse-wave project-media-pulse-wave--2" aria-hidden="true" />
            <span className="project-media-pulse-wave project-media-pulse-wave--3" aria-hidden="true" />
            <span className="project-media-pulse-wave project-media-pulse-wave--4" aria-hidden="true" />
            <span className="project-media-pulse-sweep" aria-hidden="true" />
            <span className="project-media-pulse-core" aria-hidden="true" />
            <span className="project-media-pulse-label" aria-hidden="true">
              {`SIG \u00b7 ${String(((index ?? 0) % 99) + 1).padStart(2, '0')}`}
            </span>
          </>
        )}
        {mediaMode === 'wireframe' && (
          <>
            <div className="project-media-wireframe-base" aria-hidden="true" />
            <div className="project-media-wireframe-cube" aria-hidden="true">
              <span className="project-media-wireframe-face project-media-wireframe-face--top" />
              <span className="project-media-wireframe-face project-media-wireframe-face--left" />
              <span className="project-media-wireframe-face project-media-wireframe-face--right" />
              <span className="project-media-wireframe-edge project-media-wireframe-edge--1" />
              <span className="project-media-wireframe-edge project-media-wireframe-edge--2" />
              <span className="project-media-wireframe-edge project-media-wireframe-edge--3" />
              <span className="project-media-wireframe-vertex project-media-wireframe-vertex--c" />
            </div>
            <span className="project-media-wireframe-axis project-media-wireframe-axis--x" aria-hidden="true">X</span>
            <span className="project-media-wireframe-axis project-media-wireframe-axis--y" aria-hidden="true">Y</span>
            <span className="project-media-wireframe-axis project-media-wireframe-axis--z" aria-hidden="true">Z</span>
            <span className="project-media-wireframe-mark" aria-hidden="true">
              {`CAD \u00b7 ${String(((index ?? 0) % 99) + 1).padStart(2, '0')}`}
            </span>
          </>
        )}
        {mediaMode === 'stratum' && (
          <>
            <div className="project-media-stratum-stack" aria-hidden="true">
              <span className="project-media-stratum-band project-media-stratum-band--1" />
              <span className="project-media-stratum-band project-media-stratum-band--2" />
              <span className="project-media-stratum-band project-media-stratum-band--3" />
              <span className="project-media-stratum-band project-media-stratum-band--4" />
              <span className="project-media-stratum-band project-media-stratum-band--5" />
              <span className="project-media-stratum-band project-media-stratum-band--6" />
            </div>
            <span className="project-media-stratum-rule" aria-hidden="true" />
            <span className="project-media-stratum-label project-media-stratum-label--top" aria-hidden="true">Strata</span>
            <span className="project-media-stratum-label project-media-stratum-label--bottom" aria-hidden="true">
              {`\u2116 ${String(((index ?? 0) % 99) + 1).padStart(2, '0')}`}
            </span>
          </>
        )}
        {mediaMode === 'mirror' && (
          <>
            <div className="project-media-mirror-base" aria-hidden="true" />
            <div
              className="project-media-mirror-reflect"
              aria-hidden="true"
              style={project.image ? { backgroundImage: `url(${project.image})` } : undefined}
            />
            <div className="project-media-mirror-fade" aria-hidden="true" />
            <span className="project-media-mirror-rule" aria-hidden="true" />
            <span className="project-media-mirror-label" aria-hidden="true">
              {`REFLECT \u00b7 ${String(((index ?? 0) % 99) + 1).padStart(2, '0')}`}
            </span>
          </>
        )}
        {mediaMode === 'kinetic' && (
          <>
            <div className="project-media-kinetic-base" aria-hidden="true" />
            <svg
              className="project-media-kinetic-svg project-media-kinetic-svg--outer"
              viewBox="0 0 200 200"
              aria-hidden="true"
            >
              <defs>
                <path
                  id={`kinetic-outer-${project.id}`}
                  d="M 100,100 m -82,0 a 82,82 0 1,1 164,0 a 82,82 0 1,1 -164,0"
                />
              </defs>
              <text>
                <textPath href={`#kinetic-outer-${project.id}`}>
                  {` CASE STUDY \u2022 ${cardYear} \u2022 VIEW PROJECT \u2022 PORTFOLIO \u2022`.repeat(2)}
                </textPath>
              </text>
            </svg>
            <svg
              className="project-media-kinetic-svg project-media-kinetic-svg--inner"
              viewBox="0 0 200 200"
              aria-hidden="true"
            >
              <defs>
                <path
                  id={`kinetic-inner-${project.id}`}
                  d="M 100,100 m -56,0 a 56,56 0 1,0 112,0 a 56,56 0 1,0 -112,0"
                />
              </defs>
              <text>
                <textPath href={`#kinetic-inner-${project.id}`}>
                  {` DESIGN \u25CB INDEX \u2116 ${String(((index ?? 0) % 99) + 1).padStart(2, '0')} \u25CB SELECTED \u25CB`.repeat(2)}
                </textPath>
              </text>
            </svg>
            <span className="project-media-kinetic-core" aria-hidden="true" />
          </>
        )}
        <div className="project-image-wrapper media-wrapper">
          {iframeSrc ? (
            <iframe
              className="project-iframe media-inner"
              src={iframeSrc}
              title={project.title || 'Embedded content'}
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          ) : (
            <>
              <div
                className="project-image media-inner"
                style={{
                  backgroundImage: project.image ? `url(${project.image})` : undefined,
                  backgroundSize: imageFit,
                }}
              />
              {!project.image && <div className="project-image-placeholder" />}
            </>
          )}
        </div>

        {/* Edit overlay scoped to image only */}
        {editMode && (
          <div className={`project-image-overlay${iframeDraft !== null ? ' project-image-overlay--pinned' : ''}`}>
            {iframeDraft !== null ? (
              <div className="project-image-iframe-input" onClick={(e) => e.stopPropagation()}>
                {IFRAME_FILES.length > 0 && (
                  <select
                    className="iframe-file-picker"
                    value=""
                    onChange={(e) => { if (e.target.value) applyIframe(e.target.value); }}
                  >
                    <option value="">Pick from /public/iframes…</option>
                    {IFRAME_FILES.map((f) => (
                      <option key={f.path} value={f.path}>{f.label}</option>
                    ))}
                  </select>
                )}
                <input
                  type="text"
                  className="iframe-url-input"
                  placeholder="Paste iframe tag, URL, or filename"
                  value={iframeDraft}
                  autoFocus
                  onChange={(e) => setIframeDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') applyIframe(iframeDraft); }}
                />
                <div className="project-image-overlay-actions">
                  <button type="button" className="project-overlay-btn" onClick={() => applyIframe(iframeDraft)}>Apply</button>
                  <button type="button" className="project-overlay-btn" onClick={() => setIframeDraft(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                {iframeSrc ? (
                  <div className="project-image-overlay-actions">
                    <button type="button" className="project-overlay-btn" onClick={() => setIframeDraft(iframeSrc)}>
                      ⚙ Edit iframe
                    </button>
                    <button type="button" className="project-overlay-btn" onClick={() => onUpdate(project.id, { iframeSrc: '' })}>
                      × Remove iframe
                    </button>
                  </div>
                ) : (
                  <>
                    <label htmlFor={fileInputId} className="project-image-overlay-label">
                      <span className="image-overlay-icon">📷</span>
                      <span className="image-overlay-text">Change Image</span>
                    </label>
                    <div className="project-image-overlay-actions">
                      <button
                        type="button"
                        className="project-overlay-btn"
                        onClick={() => onUpdate(project.id, { imageFit: imageFit === 'contain' ? 'cover' : 'contain' })}
                        title={imageFit === 'contain' ? 'Switch to fill (cover)' : 'Switch to fit (contain)'}
                      >
                        {imageFit === 'contain' ? '◱ Fit' : '▣ Fill'}
                      </button>
                      <button type="button" className="project-overlay-btn" onClick={() => setIframeDraft('')}>
                        ⧉ Embed iframe
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
            <input
              id={fileInputId}
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="project-image-file-input"
            />
          </div>
        )}
      </div>

      {/* Title always visible below the image */}
      <div className="project-content">
        {editMode ? (
          <>
            <h3 className="project-content-title">
              <input
                className="project-inline-edit"
                value={project.title || ''}
                onChange={(e) => onUpdate(project.id, { title: e.target.value })}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                placeholder="Project Title"
              />
            </h3>
            <p className="project-content-meta">
              <span className="project-content-category">
                <input
                  className="project-inline-edit project-inline-edit--small"
                  value={project.category || ''}
                  onChange={(e) => onUpdate(project.id, { category: e.target.value })}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  placeholder="Category"
                />
              </span>
              <span className="project-content-year">
                <input
                  className="project-inline-edit project-inline-edit--small"
                  value={project.year || ''}
                  onChange={(e) => onUpdate(project.id, { year: e.target.value })}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  placeholder="Year"
                  style={{ textAlign: 'right', width: '4rem' }}
                />
              </span>
            </p>
          </>
        ) : (
          <>
            <h3 className="project-content-title">{project.title}</h3>
            <p className="project-content-meta">
              <span className="project-content-category">{project.category}</span>
              <span className="project-content-year">{project.year}</span>
            </p>
          </>
        )}
      </div>

      {editMode && (
        <div className="project-edit-controls">
          <input
            type="text"
            className="project-inline-edit project-url-input"
            value={project.url || ''}
            onChange={(e) => onUpdate(project.id, { url: e.target.value })}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            placeholder="External URL (leave empty to link to case study)"
            title="If set, clicking the card opens this URL in a new tab instead of the case study"
          />
          <div className="project-tag-selector">
            {PROJECT_TAGS.filter(t => t.id !== 'all').map(t => (
              <button
                key={t.id}
                className={`project-tag-btn ${(project.tag || 'work') === t.id ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onUpdate(project.id, { tag: t.id }); }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <label className="project-media-mode-selector">
            <span>Media:</span>
            <select
              value={project.mediaMode || 'template'}
              onChange={(e) => { e.preventDefault(); e.stopPropagation(); onUpdate(project.id, { mediaMode: e.target.value }); }}
              onClick={(e) => { e.stopPropagation(); }}
            >
              <option value="template">Template frame</option>
              <option value="animated">Animated frame</option>
              <option value="showcase">Showcase pastel</option>
              <option value="image">Plain image</option>
              <option value="prism">Prism holographic</option>
              <option value="duotone">Duotone editorial</option>
              <option value="halftone">Halftone print</option>
              <option value="marquee">Marquee ticker</option>
              <option value="broadsheet">Broadsheet type</option>
              <option value="risograph">Risograph offset</option>
              <option value="aurora">Aurora glass</option>
              <option value="cinema">Cinematic</option>
              <option value="neon">Neon chrome</option>
              <option value="magnetic">Magnetic field</option>
              <option value="stencil">Stencil cut</option>
              <option value="ledger">Swiss ledger</option>
              <option value="flux">Flux gradient</option>
              <option value="trace">Vector trace</option>
              <option value="weave">Line weave</option>
              <option value="orbit">Orbit rings</option>
              <option value="spotlight">Spotlight beam</option>
              <option value="monolith">Monolith stack</option>
              <option value="terminal">Terminal</option>
              <option value="crystal">Crystal facets</option>
              <option value="outline">Outline hairline</option>
              <option value="contour">Contour topo</option>
              <option value="bauhaus">Bauhaus form</option>
              <option value="parallax">Parallax depth</option>
              <option value="specimen">Type specimen</option>
              <option value="pulse">Sonar pulse</option>
              <option value="wireframe">Isometric wireframe</option>
              <option value="stratum">Strata layers</option>
              <option value="mirror">Mirror reflect</option>
              <option value="kinetic">Kinetic type</option>
            </select>
          </label>
          <button
            className={`project-visibility-btn${project.hidden ? ' is-hidden' : ''}`}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onUpdate(project.id, { hidden: !project.hidden }); }}
            title={project.hidden ? 'Hidden from visitors — click to show' : 'Visible to visitors — click to hide'}
          >
            {project.hidden ? '🚫 Hidden' : '👁 Visible'}
          </button>
          <div className="project-reorder-controls">
            <button
              className="project-reorder-btn"
              disabled={index === 0}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onMoveUp(index); }}
              title="Move up"
            >&#8593;</button>
            <button
              className="project-reorder-btn"
              disabled={index === total - 1}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onMoveDown(index); }}
              title="Move down"
            >&#8595;</button>
          </div>
        </div>
      )}
      {editMode && onRemove && (
        <button className="project-remove-btn" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(project.id); }} title="Remove project">×</button>
      )}
    </article>
  );
};

const Projects = () => {
  const { content, setContent, editMode } = useEdit();
  const navigate = useNavigate();
  const titleRef = useRef(null);
  const gridRef = useRef(null);
  const [activeFilter, setActiveFilter] = useState('all');

  // GSAP scroll animation for project cards (smoother entrance)
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const cards = grid.querySelectorAll('.work-grid-project');
    if (!cards.length) return;
    gsap.set(cards, { y: 56, opacity: 0 });
    const st = ScrollTrigger.create({
      trigger: grid,
      start: 'top 82%',
      once: true,
      onEnter: () => {
        gsap.to(cards, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
        });
      },
    });
    return () => st.kill();
  }, []);

  // Word-stagger scroll animation for section title (same as Services)
  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    const words = el.querySelectorAll('.section-title-word');
    if (!words.length) return;

    gsap.set(words, { y: 28, opacity: 0 });
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 82%',
      once: true,
      onEnter: () => {
        gsap.to(words, {
          y: 0,
          opacity: 1,
          duration: 0.55,
          stagger: 0.055,
          ease: 'power3.out',
        });
      },
    });
    return () => st.kill();
  }, [content.projects?.sectionTitle]);

  // Merge default projects with saved content, respecting saved order
  const projects = (() => {
    const savedItems = content.projects?.items || [];
    const removedIds = content.projects?.removedIds || [];

    let all;
    if (savedItems.length > 0) {
      // Saved items define the order — merge defaults into them
      const savedIds = savedItems.map(p => p.id);
      all = savedItems
        .filter(p => !removedIds.includes(p.id))
        .map(saved => {
          const def = defaultProjects.find(d => d.id === saved.id);
          return def ? { ...def, ...saved } : saved;
        });
      // Append any defaults not yet in saved items (newly added defaults)
      defaultProjects.forEach(def => {
        if (!savedIds.includes(def.id) && !removedIds.includes(def.id)) {
          all.push(def);
        }
      });
    } else {
      // No saved items — use default order
      all = defaultProjects.filter(p => !removedIds.includes(p.id));
    }

    // In edit mode, add the template demo project if not already present
    if (editMode && !all.some(p => p.id === 'template-demo')) {
      all.push({
        id: 'template-demo',
        title: 'Template Demo',
        category: 'Template Reference',
        image: '',
        year: '2025',
        mediaMode: 'template',
      });
    }
    return all;
  })();

  const handleImageChange = useCallback((projectId, imageDataUrl) => {
    setContent(prev => {
      const items = prev.projects?.items || defaultProjects.map(p => ({ ...p }));
      const existingIdx = items.findIndex(item => item.id === projectId);
      if (existingIdx >= 0) {
        items[existingIdx] = { ...items[existingIdx], image: imageDataUrl };
      } else {
        const defaultProject = defaultProjects.find(p => p.id === projectId);
        if (defaultProject) items.push({ ...defaultProject, image: imageDataUrl });
      }
      return { ...prev, projects: { ...prev.projects, items } };
    });
  }, [setContent]);

  const handleAddProject = useCallback(() => {
    const id = 'project-' + Date.now();
    const newProject = {
      id,
      title: 'New Project',
      category: 'Case Study',
      image: '',
      year: new Date().getFullYear().toString(),
      tag: 'work',
      mediaMode: 'template',
    };
    
    setContent(prev => {
      const items = prev.projects?.items || defaultProjects.map(p => ({ ...p }));
      return { ...prev, projects: { ...prev.projects, items: [...items, newProject] } };
    });

    // Navigate to the new case study page
    setTimeout(() => navigate(`/project/${id}`), 100);
  }, [setContent, navigate]);

  const handleUpdateProject = useCallback((projectId, updates) => {
    setContent(prev => {
      const items = (prev.projects?.items || defaultProjects.map(p => ({ ...p }))).map(item =>
        item.id === projectId ? { ...item, ...updates } : item
      );
      // If not found in items (default project not yet saved), add it
      if (!items.find(item => item.id === projectId)) {
        const defaultProject = defaultProjects.find(p => p.id === projectId);
        if (defaultProject) items.push({ ...defaultProject, ...updates });
      }
      return { ...prev, projects: { ...prev.projects, items } };
    });
  }, [setContent]);

  const handleRemoveProject = useCallback((projectId) => {
    if (!window.confirm('Remove this project from the portfolio?')) return;
    setContent(prev => {
      const items = (prev.projects?.items || []).filter(item => item.id !== projectId);
      const removedIds = [...(prev.projects?.removedIds || [])];
      if (!removedIds.includes(projectId)) removedIds.push(projectId);
      return { ...prev, projects: { ...prev.projects, items, removedIds } };
    });
    // Also clean up saved case study data
    localStorage.removeItem(`caseStudy_${projectId}`);
    localStorage.removeItem(`caseStudy_${projectId}_minimal`);
    localStorage.removeItem(`caseStudy_${projectId}_idb`);
    // Delete from source files (dev only)
    fetch('/api/delete-case-study', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId }),
    }).catch(() => {}); // silently fail in production
  }, [setContent]);

  // Only allow removal of user-created projects (not defaults)
  const defaultIds = defaultProjects.map(p => p.id);

  // Filter projects by active tag. Hidden projects stay visible in edit mode
  // (so they can be toggled back on) but are stripped for public visitors.
  const filteredProjects = (activeFilter === 'all'
    ? projects
    : projects.filter(p => (p.tag || 'work') === activeFilter)
  ).filter(p => editMode || !p.hidden);

  const handleMoveUp = useCallback((filteredIdx) => {
    if (filteredIdx <= 0) return;
    const projectId = filteredProjects[filteredIdx]?.id;
    const prevProjectId = filteredProjects[filteredIdx - 1]?.id;
    if (!projectId || !prevProjectId) return;
    setContent(prev => {
      // Use the full merged projects list as source of truth for order
      const items = [...(prev.projects?.items?.length ? prev.projects.items : projects.map(p => ({ ...p })))];
      const idxA = items.findIndex(p => p.id === prevProjectId);
      const idxB = items.findIndex(p => p.id === projectId);
      if (idxA < 0 || idxB < 0) return prev;
      [items[idxA], items[idxB]] = [items[idxB], items[idxA]];
      return { ...prev, projects: { ...prev.projects, items } };
    });
  }, [setContent, filteredProjects, projects]);

  const handleMoveDown = useCallback((filteredIdx) => {
    if (filteredIdx >= filteredProjects.length - 1) return;
    const projectId = filteredProjects[filteredIdx]?.id;
    const nextProjectId = filteredProjects[filteredIdx + 1]?.id;
    if (!projectId || !nextProjectId) return;
    setContent(prev => {
      const items = [...(prev.projects?.items?.length ? prev.projects.items : projects.map(p => ({ ...p })))];
      const idxA = items.findIndex(p => p.id === projectId);
      const idxB = items.findIndex(p => p.id === nextProjectId);
      if (idxA < 0 || idxB < 0) return prev;
      [items[idxA], items[idxB]] = [items[idxB], items[idxA]];
      return { ...prev, projects: { ...prev.projects, items } };
    });
  }, [setContent, filteredProjects, projects]);

  return (
    <section
      className={[
        'projects',
        editMode ? 'edit-mode-active' : '',
        content.projects?.hideFilter ? 'projects--hide-filter' : '',
        content.projects?.hideCardYear ? 'projects--hide-card-year' : '',
        content.projects?.hideContentYear ? 'projects--hide-content-year' : '',
      ].filter(Boolean).join(' ')}
      id="projects"
    >
      <div className="projects-container">
        <motion.div
          className="projects-header"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        >
          <motion.span
            className="section-label"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {content.projects?.sectionLabel || 'Portfolio'}
          </motion.span>
          <h2 ref={titleRef} className="section-title cta-text serif highlight">
            {((content.projects?.sectionTitle) || 'Selected Projects').split(/\s+/).map((word, i) => (
              <span key={i} className="section-title-word">
                {word}{' '}
              </span>
            ))}
          </h2>
        </motion.div>

        {editMode && (
          <div className="projects-edit-toolbar no-print">
            <span className="projects-edit-toolbar-label">Section visibility</span>
            <label className="projects-edit-toolbar-check">
              <input
                type="checkbox"
                checked={!content.projects?.hideFilter}
                onChange={(e) => setContent(prev => ({ ...prev, projects: { ...prev.projects, hideFilter: !e.target.checked } }))}
              />
              <span>Filter bar</span>
            </label>
            <label className="projects-edit-toolbar-check">
              <input
                type="checkbox"
                checked={!content.projects?.hideCardYear}
                onChange={(e) => setContent(prev => ({ ...prev, projects: { ...prev.projects, hideCardYear: !e.target.checked } }))}
              />
              <span>Year on card media</span>
            </label>
            <label className="projects-edit-toolbar-check">
              <input
                type="checkbox"
                checked={!content.projects?.hideContentYear}
                onChange={(e) => setContent(prev => ({ ...prev, projects: { ...prev.projects, hideContentYear: !e.target.checked } }))}
              />
              <span>Year below title</span>
            </label>
          </div>
        )}

        {!content.projects?.hideFilter && (
          <div className="projects-filter-bar">
            {PROJECT_TAGS.map(tag => (
              <button
                key={tag.id}
                className={`projects-filter-chip ${activeFilter === tag.id ? 'active' : ''}`}
                onClick={() => setActiveFilter(tag.id)}
              >
                {tag.label}
              </button>
            ))}
          </div>
        )}

        <div className="projects-grid" ref={gridRef}>
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                <ProjectCard
                  project={project}
                  index={index}
                  total={filteredProjects.length}
                  editMode={editMode}
                  hideCardYear={!!content.projects?.hideCardYear}
                  onImageChange={handleImageChange}
                  onUpdate={handleUpdateProject}
                  onRemove={handleRemoveProject}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          {editMode && (
            <motion.article
              className="project-card project-card--add"
              layout
              initial={{ opacity: 0, y: 48 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              onClick={handleAddProject}
            >
              <div className="add-project-content">
                <span className="add-project-icon">+</span>
                <span className="add-project-label">Add New Case Study</span>
                <span className="add-project-hint">Create a new project and build it from scratch</span>
              </div>
            </motion.article>
          )}
        </div>
      </div>
    </section>
  );
};

export default Projects;
