import './HeroHead.css';

/* Hero head — the white band above the field.
 *
 * Structure and CSS are taken from the reference's own markup: a 1.6fr/1fr
 * grid, an uppercase display lockup on the left, and a right column holding a
 * justified two-line positioning statement above a logo + tagline footer.
 * Every line is wrapped in .ln > span so it can be masked and stepped up.
 *
 * The COPY is Lior's. The two-line splits are editorial — they are where the
 * lines break, not data — so they live here rather than in home-content.json.
 */
const HeroHead = ({ name = ['Lior', 'Baum.'], desc, tagline }) => (
  <div className="hhead">
    <div className="hgrid">
      <h1 className="hl">
        {name.map((line, i) => (
          <span className="ln" key={i}><span>{line}</span></span>
        ))}
      </h1>

      <div className="hcol">
        <p className="hdesc">
          {desc.map((line, i) => (
            <span className="ln" key={i}><span>{line}</span></span>
          ))}
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
