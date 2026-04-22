// Auto-discovered list of HTML files in /public/iframes/.
// The Vite plugin `iframeManifestPlugin` (vite.config.js) populates the
// `virtual:iframe-manifest` module from the filesystem on dev server start,
// re-reads it when files are added/removed, and bakes the list into the build.
// Drop a new .html file into public/iframes/ — it appears in the dropdown.
import { IFRAME_FILES as discovered } from 'virtual:iframe-manifest';
export const IFRAME_FILES = discovered;
