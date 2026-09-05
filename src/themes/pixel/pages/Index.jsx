import PixelShell from '../PixelShell.jsx';
import WorkCarousel from '../WorkCarousel.jsx';
import HeroHead from '../HeroHead.jsx';
import { PixelEditable, PixelPublishBar } from '../PixelEdit.jsx';
import { useEdit } from '../../../context/EditContext';
import './Index.css';

/* Index — hero, point of view, selected work.
 *
 * Content comes from EditContext, which seeds itself from the same file the
 * default site reads (src/data/home-content.json) and layers the local edit
 * copy on top. Reading it here (rather than importing the JSON) is what makes
 * both edit surfaces live: the EditPanel sidebar AND the in-place fields below.
 *
 * The hero's two-line splits are editorial, so each line is its own field
 * (hero.pixelLine1/2, hero.pixelDesc1/2) rather than one string the layout
 * would have to guess a break for. They fall back to the shipped copy.
 */
const Index = () => {
  const { content, updateContent, updateNestedContent, saveHomeToCode } = useEdit();
  const hero = content.hero || {};
  const projects = content.projects || {};
  const items = projects.items || [];

  const setHero = (key, value) => updateContent('hero', key, value);

  return (
    <PixelShell
      fade={1}
      band="42vh"
      head={(
        <HeroHead
          name={[
            <PixelEditable key="n1" value={hero.pixelLine1 ?? 'Lior'}
                           onChange={(v) => setHero('pixelLine1', v)} placeholder="First name" />,
            <PixelEditable key="n2" value={hero.pixelLine2 ?? 'Baum.'}
                           onChange={(v) => setHero('pixelLine2', v)} placeholder="Last name" />,
          ]}
          desc={[
            <PixelEditable key="d1" value={hero.pixelDesc1 ?? 'A product designer for'}
                           onChange={(v) => setHero('pixelDesc1', v)} placeholder="Line one" />,
            <PixelEditable key="d2" value={hero.pixelDesc2 ?? 'platforms & complex products'}
                           onChange={(v) => setHero('pixelDesc2', v)} placeholder="Line two" />,
          ]}
          tagline={(
            <PixelEditable
              value={hero.tagline ?? 'Clinical and enterprise platforms, designed in systems and built with code and AI.'}
              onChange={(v) => setHero('tagline', v)}
              multiline
              placeholder="Tagline"
            />
          )}
        />
      )}
    >
      {/* data-trail-end: past this section neither the brush nor the Pac-Man
          leaves a tail — see heat-field.js `trailStrength`. */}
      <section className="ix-pov" data-trail-end>
        <PixelEditable
          tag="h2" className="ix-rule-label" value={hero.povLabel ?? 'Point of view'}
          onChange={(v) => setHero('povLabel', v)} placeholder="Section label"
        />
        <PixelEditable
          tag="p" className="ix-lede" value={hero.description ?? ''} multiline
          onChange={(v) => setHero('description', v)} placeholder="What you do, in a couple of sentences"
        />
      </section>

      <WorkCarousel
        items={items}
        title={(
          <PixelEditable
            value={projects.sectionTitle ?? 'Selected work'}
            onChange={(v) => updateContent('projects', 'sectionTitle', v)}
            placeholder="Section title"
          />
        )}
        hint="Drag, scroll, or use the arrows"
        onItemChange={(i, key, value) => updateNestedContent('projects', i, key, value)}
      />

      <PixelPublishBar save={saveHomeToCode} />
    </PixelShell>
  );
};

export default Index;
