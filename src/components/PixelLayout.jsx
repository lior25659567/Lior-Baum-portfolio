import PixelShell from '../themes/pixel/PixelShell.jsx';

/* PixelLayout — thin wrapper over PixelShell for use by main-app browse routes.
 *
 * PixelShell already owns the full composition:
 *   · background grid rule  (z0)
 *   · heat-field canvas     (z1, fixed to viewport, masked to the band)
 *   · PixelNav              (z3, mix-blend-mode: difference)
 *   · pixel-field-band spacer
 *   · <main class="pixel-content">  ← children land here
 *   · PixelFooter           (inside <main>)
 *   · PixelControls         (z3, field tuner)
 *
 * `fade` (0–1) controls where within the band heat decays to zero.
 * It is forwarded directly to PixelShell → useHeatField.
 * All other PixelShell defaults are kept (controls=true, footer=true, head=undefined).
 */
const PixelLayout = ({ children, fade = 1 }) => (
  <PixelShell fade={fade}>
    {children}
  </PixelShell>
);

export default PixelLayout;
