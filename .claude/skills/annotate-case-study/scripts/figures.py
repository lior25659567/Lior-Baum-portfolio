#!/usr/bin/env python3
"""List a case study's article figures with the text around them.

Usage (from the repo root):
  python3 .claude/skills/annotate-case-study/scripts/figures.py <slug>

For each figure: block id, width tier, display mode, each media entry (src, caption,
status, video/embed flags, existing annotation count) and the preceding heading,
paragraphs and bullets — with bullets block ids so they can go in a plan's "trim".
"""
import json
import os
import sys

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", ".."))
WIDTHS = {"prose": 720, "wide": 1160, "full": 1400}


def text_of(it):
    if isinstance(it, str):
        return it
    return f"{it.get('title', '')}: {it.get('text', '')}".strip(": ")


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    slug = sys.argv[1]
    d = json.load(open(os.path.join(REPO, "src", "data", "case-studies", f"{slug}.json")))
    art = d.get("article")
    if not art:
        sys.exit(f"{slug}: no article (slides only) — annotations are article-only")
    print(f"{slug}: dataVersion {d.get('dataVersion')}")
    ctx = []
    for i, b in enumerate(art.get("blocks", [])):
        t = b.get("type")
        if t == "heading":
            ctx = [f"H [{b['id']}] {b.get('eyebrow', '')} / {b.get('text', '')}"]
        elif t in ("paragraph", "callout", "labelRow"):
            ctx.append(f"P [{b['id']}] {(b.get('text') or '')[:220]}")
        elif t == "bullets":
            items = " | ".join(text_of(it)[:110] for it in b.get("items", []))
            ctx.append(f"B [{b['id']}] {items}")
        elif t == "figure":
            width = b.get("width") or "wide"
            print(f"\n[{i}] FIGURE {b['id']}  width={width} (~{WIDTHS.get(width, 1160)}px)  display={b.get('display') or 'grid'}")
            for m in b.get("media", []) or []:
                src = m.get("src") or ""
                flags = []
                if m.get("isVideo") or src.endswith((".mp4", ".mov", ".webm")):
                    flags.append("VIDEO")
                if m.get("embedUrl") and not src:
                    flags.append("EMBED")
                if m.get("status"):
                    flags.append(f"status={m['status']}")
                if m.get("annotations"):
                    flags.append(f"{len(m['annotations'])} annotations")
                print(f"   - {src or m.get('embedUrl', '')}  {' '.join(flags)}")
                if m.get("caption"):
                    print(f"       caption: {m['caption'][:140]}")
            for line in ctx[-5:]:
                print(f"     ctx {line[:260]}")


main()
