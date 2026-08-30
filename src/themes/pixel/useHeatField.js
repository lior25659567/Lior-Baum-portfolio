import { useEffect, useRef } from 'react';
import { mountHeatField } from './heat-field.js';

/* React binding for the heat field. The field itself is framework-agnostic
 * vanilla JS — this only handles mount/unmount and exposes the instance so
 * controls can call setBrush/setCell. */
/* `useBand: false` means the canvas IS the field's extent — used where the
 * canvas is positioned inside its own section (the footer). Band masking only
 * makes sense for the viewport-fixed hero canvas, because the mask is measured
 * in viewport coordinates; a section-local canvas has section-local rows, and
 * mixing the two silently clamps the whole field to zero. */
export const useHeatField = ({ fade = 1, invertFade = false, useBand = true } = {}) => {
  const canvasRef = useRef(null);
  const bandRef = useRef(null);
  const fieldRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return undefined;
    const field = mountHeatField(canvasRef.current, { fade, invertFade, bandEl: useBand ? bandRef.current : null });
    fieldRef.current = field;
    // Exposed for the Phase 2 acceptance checks (frame-diff, band count).
    if (import.meta.env.DEV) window.__pixelField = field;
    return () => {
      field.destroy();
      fieldRef.current = null;
      if (import.meta.env.DEV && window.__pixelField === field) delete window.__pixelField;
    };
  }, [fade, invertFade, useBand]);

  return { canvasRef, bandRef, fieldRef };
};
