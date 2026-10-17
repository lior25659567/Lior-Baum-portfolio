# Redesign rollback

The visual redesign (inspired by itsoffbrand.com) lives on the branch
`redesign/offbrand-inspired`. The original design is preserved in two places,
both pushed to `origin`:

| What | Ref |
|---|---|
| Git tag (immutable snapshot) | `pre-redesign-backup` |
| Branch (same commit, can receive hotfixes) | `backup/original-design` |

Both point at commit `1ae5f04` ("chore: commit in-progress work before visual
redesign"), which is also where `main` sits at the time of writing.

## Look at the original design

```bash
git checkout backup/original-design     # or: git checkout pre-redesign-backup
npm run dev
```

Switch back to the redesign with `git checkout redesign/offbrand-inspired`.

## Abandon the redesign entirely

`main` was never modified by the redesign, so the simplest rollback is to just
keep using `main` and delete the redesign branch:

```bash
git checkout main
git branch -D redesign/offbrand-inspired
git push origin --delete redesign/offbrand-inspired   # optional
```

## If the redesign was already merged into main

Reset `main` to the backup tag (rewrites history, so force-push):

```bash
git checkout main
git reset --hard pre-redesign-backup
git push --force-with-lease origin main
```

Or, without rewriting history, revert the merge commit:

```bash
git revert -m 1 <merge-commit-sha>
```

## Dependencies

The redesign adds npm packages (Three.js / React Three Fiber, Lenis). After
checking out the original, run `npm install` so `node_modules` matches the
original `package-lock.json`.
