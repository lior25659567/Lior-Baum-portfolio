import { useParams, Link } from 'react-router-dom';
import { savedCaseStudies } from '../../../data/case-studies/index.js';
import homeContent from '../../../data/home-content.json';
import PixelShell from '../PixelShell.jsx';
import './CaseStudy.css';

/* Case study — sticky section label left, prose right at 62ch, hairline facts
 * strip. Reads the SAME `article` projection the default site uses, so the
 * prose lives in one place. Nothing is copied into the theme.
 *
 * Blocks are grouped into sections at each eyebrowed heading, so the left
 * column can hold that section's label while its prose scrolls past. */

const groupIntoSections = (blocks) => {
  const sections = [];
  let current = { eyebrow: null, blocks: [] };
  for (const block of blocks) {
    if (block.type === 'heading' && block.eyebrow) {
      if (current.blocks.length) sections.push(current);
      current = { eyebrow: block.eyebrow, blocks: [block] };
    } else {
      current.blocks.push(block);
    }
  }
  if (current.blocks.length) sections.push(current);
  return sections;
};

const Figure = ({ block }) => {
  // Some entries carry an empty src (an embed slot, or an image never filled
  // in). An <img src=""> makes the browser re-request the whole page, so drop
  // them rather than rendering an empty element.
  const media = (block.media || []).filter((m) => m && m.src);
  if (!media.length) return null;
  return (
    <figure className={`cs-figure${block.width === 'wide' ? ' is-wide' : ''}`}>
      <div className={media.length > 1 ? 'cs-figure-row' : ''}>
        {media.map((m, i) =>
          m.isVideo
            ? <video key={i} src={m.src} autoPlay loop muted playsInline preload="metadata" />
            : <img key={i} src={m.src} alt={m.caption || ''} loading="lazy" />
        )}
      </div>
      {media[0]?.caption ? <figcaption>{media[0].caption}</figcaption> : null}
    </figure>
  );
};

const Block = ({ block }) => {
  switch (block.type) {
    case 'heading': {
      const Tag = block.level === 3 ? 'h3' : 'h2';
      return <Tag className="cs-heading">{block.text}</Tag>;
    }
    case 'paragraph':
      return <p className="cs-para">{block.text}</p>;
    case 'callout':
      return <p className="cs-callout">{block.text}</p>;
    case 'divider':
      return <hr className="cs-divider" />;
    case 'figure':
      return <Figure block={block} />;
    case 'quote':
      return (
        <blockquote className="cs-quote">
          <p>{block.text}</p>
          {block.author ? <cite>{block.author}{block.role ? ` · ${block.role}` : ''}</cite> : null}
        </blockquote>
      );
    case 'bullets':
      return (
        <ul className="cs-bullets">
          {(block.items || []).map((it, i) => (
            <li key={i}>
              {it.title ? <span className="cs-bullet-title">{it.title}</span> : null}
              {it.text ? <span className="cs-bullet-text">{it.text}</span> : null}
            </li>
          ))}
        </ul>
      );
    case 'cards':
      return (
        <ol className="cs-cards">
          {(block.items || []).map((it, i) => (
            <li key={i}>
              <span className="cs-card-i">{String(i + 1).padStart(2, '0')}</span>
              <span className="cs-card-t">{it.title}</span>
              <span className="cs-card-d">{it.description}</span>
            </li>
          ))}
        </ol>
      );
    case 'problemSolutionImpact':
      return (
        <dl className="cs-psi">
          {(block.items || []).map((it, i) => (
            <div key={i}>
              <dt>{it.label}</dt>
              <dd>{it.text}</dd>
            </div>
          ))}
        </dl>
      );
    case 'checklist':
      return (
        <div className="cs-checklist">
          <div>
            <h4>{block.workedTitle || 'What worked'}</h4>
            <ul>{(block.worked || []).map((t, i) => <li key={i}>{t}</li>)}</ul>
          </div>
          <div>
            <h4>{block.failedTitle || "What didn't"}</h4>
            <ul>{(block.failed || []).map((t, i) => <li key={i}>{t}</li>)}</ul>
          </div>
        </div>
      );
    case 'metaGrid':
      return null;   // hoisted into the facts strip
    default:
      return null;
  }
};

const CaseStudy = () => {
  const { slug } = useParams();
  const study = savedCaseStudies[slug];
  const meta = homeContent.content.projects?.items?.find((p) => p.id === slug);

  if (!study?.article) {
    return (
      <PixelShell fade={1} band="26vh">
        <h1 className="cs-title">Not found</h1>
        <p className="cs-lede">
          No case study for <code>{slug}</code>. <Link to="/">Back to the index</Link>.
        </p>
      </PixelShell>
    );
  }

  const { article } = study;
  const facts = article.blocks.find((b) => b.type === 'metaGrid')?.items || [];
  const sections = groupIntoSections(article.blocks);

  return (
    <PixelShell fade={1} band="26vh" label={meta?.title || article.title}>
      <header className="cs-head">
        <h1 className="cs-title">{article.title}</h1>
        {article.lede ? <p className="cs-lede">{article.lede}</p> : null}
      </header>

      {facts.length ? (
        <dl className="cs-facts">
          {facts.map((f, i) => (
            <div key={i}>
              <dt>{f.label}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {sections.map((section, i) => (
        <section className="cs-section" key={i}>
          <div className="cs-label">
            {section.eyebrow ? <span>{section.eyebrow}</span> : null}
          </div>
          <div className="cs-prose">
            {section.blocks.map((block, j) => <Block block={block} key={block.id || j} />)}
          </div>
        </section>
      ))}

      <p className="cs-back"><Link to="/">← All work</Link></p>
    </PixelShell>
  );
};

export default CaseStudy;
