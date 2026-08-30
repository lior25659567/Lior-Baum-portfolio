import homeContent from '../../../data/home-content.json';
import PixelShell from '../PixelShell.jsx';
import WorkCarousel from '../WorkCarousel.jsx';
import HeroHead from '../HeroHead.jsx';
import './Index.css';

/* Index — hero, point of view, selected work.
 *
 * Content is imported from the same source the default site reads
 * (src/data/home-content.json). Nothing is copied into the theme. */
const Index = () => {
  const { hero, projects } = homeContent.content;
  const items = projects?.items || [];

  return (
    <PixelShell
      fade={1}
      band="42vh"
      head={(
        <HeroHead
          name={['Lior', 'Baum.']}
          desc={['A product designer for', 'platforms & complex products']}
          tagline="Clinical and enterprise platforms, designed in systems and built with code and AI."
        />
      )}
    >
      {/* data-trail-end: past this section neither the brush nor the Pac-Man
          leaves a tail — see heat-field.js `trailStrength`. */}
      <section className="ix-pov" data-trail-end>
        <h2 className="ix-rule-label">Point of view</h2>
        <p className="ix-lede">{hero.description}</p>
      </section>

      <WorkCarousel
        items={items}
        title={projects?.sectionTitle || 'Selected work'}
        hint="Drag, scroll, or use the arrows"
      />

    </PixelShell>
  );
};

export default Index;
