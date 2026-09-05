import './HeroHead.css';

/* Hero head — the white band above the field.
 *
 * Structure and CSS are taken from the reference's own markup: a 1.6fr/1fr
 * grid, an uppercase display lockup on the left, and a right column holding a
 * justified two-line positioning statement above a logo + tagline footer.
 * Every line is wrapped in .ln > span so it can be masked and stepped up.
 *
 * The two-line splits are editorial — they are where the lines break, so the
 * caller owns them. `name` / `desc` accept either plain strings or nodes: a
 * node is rendered AS the masked inner span (so `.ln > span` still matches it
 * and the step-up animation is unchanged), which is how the Index page passes
 * inline-editable fields through in edit mode.
 */
const Line = ({ children }) => (
  <span className="ln">
    {typeof children === 'string' ? <span>{children}</span> : children}
  </span>
);

const HeroHead = ({ name = ['Lior', 'Baum.'], desc, tagline }) => (
  <div className="hhead">
    <div className="hgrid">
      <h1 className="hl">
        {name.map((line, i) => <Line key={i}>{line}</Line>)}
      </h1>

      <div className="hcol">
        <p className="hdesc">
          {desc.map((line, i) => <Line key={i}>{line}</Line>)}
        </p>

        <div className="hfoot">
          <span className="wlogo">
            <img src="/logo/liorbaum-logo.svg" alt="Lior Baum" width="42" height="20" />
          </span>
          <p className="htag">{tagline}</p>
        </div>
      </div>
    </div>
  </div>
);

export default HeroHead;
