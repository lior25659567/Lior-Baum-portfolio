import { useHeatField } from './useHeatField.js';
import PixelControls from './PixelControls.jsx';
import PixelFooter from './PixelFooter.jsx';
import PixelNav from './PixelNav.jsx';

/* The shell every pixel-theme page shares.
 *
 * Layer order is fixed and load-bearing:
 *   z0  background rule at --cell pitch
 *   z1  heat field canvas
 *   z2  content
 *   z3  topbar / controls, mix-blend-mode: difference so they invert over both
 *       white space and painted cells without needing a background of their own
 *
 * The canvas is fixed to the viewport, but the FIELD is masked to the band
 * spacer's document position — so the mass starts after the head, scrolls away
 * with the page, and never sits behind the hero. The BRUSH is not masked: it
 * keeps working past the band with no seam. `band` is the field's height;
 * `fade` is where within it heat reaches zero.
 */
const PixelShell = ({ fade = 1, band = '42vh', head, children, controls = true, footer = true }) => {
  const { canvasRef, bandRef, fieldRef } = useHeatField({ fade });
  return (
    <>
      <div className="pixel-rule" aria-hidden="true" />
      <canvas className="pixel-field" ref={canvasRef} aria-hidden="true" />

      <PixelNav />

      {head}

      {/* Spacer reserving the field's height. The fixed canvas masks its field
          to this element's live position, so the mass scrolls with the page
          while the brush carries on beyond it. */}
      <div className="pixel-field-band" ref={bandRef}
           style={{ '--field-band': band }} aria-hidden="true" />
      <main className={`pixel-content${head ? ' has-head' : ''}`}>
        {children}
        {footer ? <PixelFooter /> : null}
      </main>

      {controls ? <PixelControls fieldRef={fieldRef} /> : null}
    </>
  );
};

export default PixelShell;
