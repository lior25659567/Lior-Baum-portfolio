import aboutContent from '../../../data/about-content.json';
import PixelShell from '../PixelShell.jsx';
import DitherPlate from '../DitherPlate.jsx';
import './About.css';

/* About — asymmetric hero with a portrait plate, hairline record rows for
 * experience. Content from src/data/about-content.json, the same file the
 * default site reads. */
const About = () => {
  const a = aboutContent.about;
  const portrait = aboutContent.profileImage || a.profileImage;

  return (
    <PixelShell fade={1} band="22vh">
      <section className="ab-hero">
        <div className="ab-hero-text">
          <p className="ab-eyebrow">{a.label}</p>
          <h1 className="ab-title">
            <span>{a.title1}</span>
            <span>{a.title2}</span>
            <span>{a.title3}</span>
          </h1>
        </div>
        <div className="ab-hero-plate">
          <DitherPlate src={portrait} seed={41} contrast={1.05} ratio="3 / 4" caption={null} />
        </div>
      </section>

      <section className="ab-bio">
        <h2 className="ab-rule-label">{a.bioHeading}</h2>
        <div className="ab-bio-body">
          {(a.bio || []).map((para, i) => <p key={i}>{para}</p>)}
          <p className="ab-mail">
            <a href={`mailto:${a.email}`}>{a.email}</a>
          </p>
        </div>
      </section>

      {a.valueWords?.length ? (
        <section className="ab-values">
          <h2 className="ab-rule-label">{a.skillsTitle}</h2>
          <ul className="ab-words">
            {a.valueWords.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </section>
      ) : null}

      {a.skills?.length ? (
        <section className="ab-skills">
          <h2 className="ab-rule-label">Practice</h2>
          <dl className="ab-skill-rows">
            {a.skills.map((group, i) => (
              <div key={i}>
                <dt>{group.category}</dt>
                <dd>{(group.items || []).join(' · ')}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {a.experience?.length ? (
        <section className="ab-exp">
          <h2 className="ab-rule-label">
            <span>{a.experienceTitle}</span>
            <span className="ab-count">{String(a.experience.length).padStart(2, '0')}</span>
          </h2>
          <ol className="ab-records">
            {a.experience.map((job, i) => (
              <li key={i}>
                <span className="ab-year">{job.year}</span>
                <span className="ab-role">{job.role}</span>
                <span className="ab-co">{job.company}</span>
                {job.description ? <p className="ab-desc">{job.description}</p> : null}
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </PixelShell>
  );
};

export default About;
