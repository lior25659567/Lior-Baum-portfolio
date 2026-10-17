#!/usr/bin/env python3
"""Apply (or remove) auto-annotations on a case study's article images.

Usage (from the repo root):
  python3 .claude/skills/annotate-case-study/scripts/annotate.py <slug> <plan.json> [--trim] [--bump] [--dry]
  python3 .claude/skills/annotate-case-study/scripts/annotate.py <slug> --remove [--bump]

plan.json:
  {
    "media": { "<media src>": [ <annotation>, ... ] },    # every id MUST start with "auto-"
    "trim":  { "<bullets block id>": ["**Bold lead-in**", ...] }   # items whose point now lives on an image
  }

Guarantees:
- Refuses to run unless the JSON round-trips byte-identically (so the write can't reformat the file).
- Replaces only `auto-` annotations on the planned media; anything the designer drew is kept.
- `--trim` removes only the listed bullet items (never whole blocks).
- Verifies before writing that nothing else in the file changed.
- Idempotent: re-running with the same plan is a no-op apart from --bump.
- `--remove` strips every `auto-` annotation in the study (bullets are NOT restored — use git for that).
- `--bump` raises dataVersion so browsers drop their cached edit-mode copy and load the file.
"""
import json
import os
import sys

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", ".."))


def die(msg):
    sys.exit(f"annotate.py: {msg}")


def load(slug):
    path = os.path.join(REPO, "src", "data", "case-studies", f"{slug}.json")
    if not os.path.exists(path):
        die(f"no case study at {path}")
    raw = open(path).read()
    data = json.loads(raw)
    if json.dumps(data, indent=2, ensure_ascii=False) != raw:
        die("JSON does not round-trip byte-identically — refusing to rewrite it")
    return path, data


def item_text(it):
    return it if isinstance(it, str) else (it.get("text") or "")


def strip_for_compare(data, trim_ids):
    d = json.loads(json.dumps(data))
    d.pop("dataVersion", None)
    for b in d.get("article", {}).get("blocks", []):
        for m in b.get("media", []) or []:
            m.pop("annotations", None)
        if b.get("id") in trim_ids:
            b["items"] = None
    return d


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    flags = {a for a in sys.argv[1:] if a.startswith("--")}
    if not args:
        die(__doc__)
    slug = args[0]
    path, data = load(slug)
    before = json.loads(json.dumps(data))
    plan = {"media": {}, "trim": {}}
    if "--remove" not in flags:
        if len(args) < 2:
            die("missing plan.json")
        plan = json.load(open(args[1]))
        for src, anns in plan.get("media", {}).items():
            bad = [a.get("id") for a in anns if not str(a.get("id", "")).startswith("auto-")]
            if bad:
                die(f"annotation ids must start with 'auto-': {bad} on {src}")

    media_hits = 0
    for b in data.get("article", {}).get("blocks", []):
        for m in b.get("media", []) or []:
            own = [a for a in (m.get("annotations") or []) if not str(a.get("id", "")).startswith("auto-")]
            if "--remove" in flags:
                if len(own) != len(m.get("annotations") or []):
                    media_hits += 1
                    if own:
                        m["annotations"] = own
                    else:
                        m.pop("annotations", None)
                continue
            anns = plan["media"].get(m.get("src"))
            if anns is not None:
                m["annotations"] = own + anns
                media_hits += 1

    trimmed = []
    if "--trim" in flags:
        for b in data.get("article", {}).get("blocks", []):
            prefixes = plan.get("trim", {}).get(b.get("id"))
            if not prefixes or b.get("type") != "bullets":
                continue
            keep = []
            for it in b.get("items", []):
                if any(item_text(it).startswith(p) for p in prefixes):
                    trimmed.append(f"{b['id']}: {item_text(it)[:70]}")
                else:
                    keep.append(it)
            b["items"] = keep

    missing = [src for src in plan.get("media", {}) if not any(
        m.get("src") == src for b in data.get("article", {}).get("blocks", []) for m in (b.get("media") or []))]
    if missing:
        die(f"plan targets media not in the article: {missing}")

    if strip_for_compare(before, set(plan.get("trim", {}))) != strip_for_compare(data, set(plan.get("trim", {}))):
        die("something other than annotations / trimmed bullets would change — aborting")

    if "--bump" in flags:
        data["dataVersion"] = (data.get("dataVersion") or 0) + 1

    verb = "removed auto-annotations from" if "--remove" in flags else "annotated"
    print(f"{slug}: {verb} {media_hits} media entries; dataVersion {data.get('dataVersion')}")
    for t in trimmed:
        print("  trimmed bullet:", t)
    if "--dry" in flags:
        print("  (dry run — nothing written)")
        return
    out = json.dumps(data, indent=2, ensure_ascii=False)
    json.loads(out)
    open(path, "w").write(out)


main()
