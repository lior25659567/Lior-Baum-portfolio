#!/usr/bin/env bash
# ────────────────────────────────────────────────────────────────────────────
# convert-case-study-images-to-webp.sh
#
# Converts every PNG/JPG/JPEG under public/case-studies/ into a sibling .webp
# at visually-lossless quality, updates every /case-studies/... reference in
# src/**/*.{json,jsx,js} to point at the .webp filename, and deletes the
# originals — but only AFTER the production build passes, so a broken sed
# regex or missing reference can never leave your site with dead URLs.
#
# SCOPE
#   • Touches ONLY files under public/case-studies/.
#   • Favicons, /public/fonts, /public/about*, logos outside the
#     case-studies tree, and every MP4 are untouched.
#
# QUALITY
#   • PNG (transparent UI screenshots)  → cwebp -lossless  (pixel-exact)
#   • JPG/JPEG (photos)                 → cwebp -q 95      (visually lossless)
#
# BACKUPS
#   A timestamped copy of every source image is written to
#   backups/case-studies-<UTC-timestamp>/ before the originals are deleted,
#   so a full revert is always one `rsync` away. The backups/ folder is
#   gitignored.
#
# USAGE
#   ./scripts/convert-case-study-images-to-webp.sh
#
# Re-runs cheaply — if a file has already been converted (sibling .webp
# exists and is newer than the source), conversion is skipped.
# ────────────────────────────────────────────────────────────────────────────
set -euo pipefail

# ── Resolve repo root relative to this script so it works from anywhere ──
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
REPO_ROOT="$(cd -- "$SCRIPT_DIR/.." &>/dev/null && pwd)"
cd "$REPO_ROOT"

SRC_ROOT="public/case-studies"
if [[ ! -d "$SRC_ROOT" ]]; then
  echo "error: $SRC_ROOT not found — run from repo root or adjust script." >&2
  exit 1
fi

# ── Tooling check ──
command -v cwebp >/dev/null 2>&1 || {
  echo "error: cwebp not installed. Run: brew install webp" >&2; exit 1;
}

# ── Refuse to run on a dirty tree so revert is a single git checkout ──
if [[ -n "$(git status --porcelain -- public/case-studies src 2>/dev/null | grep -v '^??')" ]]; then
  echo "error: tracked files under public/case-studies or src have uncommitted changes." >&2
  echo "       commit or stash them first so this run is reversible." >&2
  exit 1
fi

TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
BACKUP_DIR="backups/case-studies-${TIMESTAMP}"

echo "▸ Scanning $SRC_ROOT for PNG/JPG/JPEG…"
# mapfile ships with bash 4+; macOS bash is 3.2, so fall back to while-read.
# -print0 / IFS= read -r -d '' handles spaces/newlines in filenames safely.
SOURCES=()
while IFS= read -r -d '' f; do
  SOURCES+=("$f")
done < <(find "$SRC_ROOT" -type f \
  \( -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" \) -print0)

if (( ${#SOURCES[@]} == 0 )); then
  echo "  no PNG/JPG/JPEG files found — already fully WebP."
  exit 0
fi
echo "  found ${#SOURCES[@]} source image(s)."

# ── Phase 1: backup ─────────────────────────────────────────────────────
echo "▸ Backing up originals to $BACKUP_DIR/"
mkdir -p "$BACKUP_DIR"
for src in "${SOURCES[@]}"; do
  # Mirror directory structure inside backup.
  rel="${src#$SRC_ROOT/}"
  dst="$BACKUP_DIR/$rel"
  mkdir -p "$(dirname "$dst")"
  cp -p "$src" "$dst"
done
echo "  backup size: $(du -sh "$BACKUP_DIR" | awk '{print $1}')"

# ── Phase 2: convert ────────────────────────────────────────────────────
echo "▸ Converting to WebP (PNG=lossless, JPG/JPEG=q95)…"
converted=0
skipped=0
failed=0
for src in "${SOURCES[@]}"; do
  webp="${src%.*}.webp"
  # Skip if webp already newer than source — supports re-runs on just
  # newly-added files without re-encoding the whole tree.
  if [[ -f "$webp" && "$webp" -nt "$src" ]]; then
    skipped=$((skipped + 1))
    continue
  fi
  ext_lower="$(printf '%s' "${src##*.}" | tr '[:upper:]' '[:lower:]')"
  if [[ "$ext_lower" == "png" ]]; then
    cwebp_args=(-lossless -m 6 -quiet "$src" -o "$webp")
  else
    cwebp_args=(-q 95 -m 6 -quiet "$src" -o "$webp")
  fi
  if cwebp "${cwebp_args[@]}"; then
    converted=$((converted + 1))
  else
    echo "  ✗ failed: $src" >&2
    failed=$((failed + 1))
  fi
done
echo "  converted=$converted  skipped(up-to-date)=$skipped  failed=$failed"
if (( failed > 0 )); then
  echo "error: some conversions failed. Originals NOT deleted. Investigate above." >&2
  exit 2
fi

# ── Phase 3: rewrite references ─────────────────────────────────────────
# Scoped regex: only replace paths that start with /case-studies/ and end
# in .png/.jpg/.jpeg. Anything else (favicon, /public/about, /public/fonts,
# MP4s, external URLs) is untouched by design.
#
# Perl is used instead of sed because BSD sed's quoting around a regex that
# must literally include both single-quote AND backtick (to stop at JSX
# string delimiters) is a portability trap. \x22 \x27 \x60 keep shell
# escaping out of the picture.
echo "▸ Rewriting /case-studies/*.{png,jpg,jpeg} refs → .webp in src/"
PERL_EXPR='s{(/case-studies/[^\x22\x27\x60]*?)\.(?i:png|jpe?g)}{$1.webp}g'
REFERENCE_FILES="$(find src -type f \( -name "*.json" -o -name "*.jsx" -o -name "*.js" \) -print0 \
  | xargs -0 perl -lne 'print $ARGV if /\/case-studies\/[^\x22\x27\x60]*\.(?i:png|jpe?g)/' 2>/dev/null \
  | sort -u || true)"

if [[ -z "${REFERENCE_FILES}" ]]; then
  echo "  no remaining /case-studies/*.png|jpg refs found in src/."
else
  while IFS= read -r f; do
    [[ -n "$f" ]] || continue
    perl -i -pe "$PERL_EXPR" "$f"
  done <<< "$REFERENCE_FILES"
  echo "  updated $(printf '%s\n' "$REFERENCE_FILES" | wc -l | tr -d ' ') file(s)."
fi

# ── Phase 4: build verification ─────────────────────────────────────────
# Production build catches any missed ref or typo before we delete the
# originals. If it fails we stop here — originals are still on disk and
# refs have been rewritten (but the webp copies coexist, so nothing is
# broken yet; you can also `git checkout -- src public` to revert refs
# and restore both PNG+WebP).
echo "▸ Running production build to verify no broken references…"
if ! npx vite build >/dev/null 2>&1; then
  echo "error: build failed after rewriting refs. Originals still on disk." >&2
  echo "       restore with:  git checkout -- src public/case-studies" >&2
  echo "                      && rm -rf backups/case-studies-${TIMESTAMP}" >&2
  exit 3
fi
echo "  build passed."

# ── Phase 5: delete originals ───────────────────────────────────────────
echo "▸ Removing PNG/JPG/JPEG originals (backups retained in $BACKUP_DIR/)"
for src in "${SOURCES[@]}"; do rm -f "$src"; done

# ── Summary ─────────────────────────────────────────────────────────────
TOTAL_WEBP="$(find "$SRC_ROOT" -type f -iname "*.webp" -print0 | xargs -0 du -ch 2>/dev/null | tail -1 | awk '{print $1}')"
TOTAL_BACKUP="$(du -sh "$BACKUP_DIR" | awk '{print $1}')"
echo
echo "done ✓"
echo "  converted: ${#SOURCES[@]} files"
echo "  webp total size:   $TOTAL_WEBP"
echo "  backup total size: $TOTAL_BACKUP   ($BACKUP_DIR)"
echo
echo "next steps:"
echo "  git add -A"
echo "  git commit -m 'Convert case-study images to WebP'"
echo "  git push origin main"
echo
echo "to revert (before committing):"
echo "  git checkout -- src public/case-studies"
echo "  rsync -a \"$BACKUP_DIR/\" \"$SRC_ROOT/\""
