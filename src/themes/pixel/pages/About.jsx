import { useState } from 'react';
import savedAbout from '../../../data/about-content.json';
import PixelShell from '../PixelShell.jsx';
import DitherPlate from '../DitherPlate.jsx';
import { PixelEditable, PixelAddBtn, PixelRemoveBtn, PixelPublishBar } from '../PixelEdit.jsx';
import { useEdit } from '../../../context/EditContext';
import './About.css';

/* About — asymmetric hero with a portrait plate, hairline record rows for
 * experience.
 *
 * Content comes from EditContext (`content.about`), which merges
 * src/data/about-content.json over home-content.json over the defaults — so
 * the in-place fields here and the EditPanel edit one store. Saving writes
 * about-content.json, the file that wins on the next load.
 *
 * The portrait is NOT edited here: it is a file on disk (public/about/…) whose
 * path is published in about-content.json, and the save below carries that
 * path through untouched rather than re-deriving it.
 */
const About = () => {
  const { content, editMode, updateContent, saveAboutContent } = useEdit();
  const a = content.about || {};

  // The committed JSON is the published source of truth and wins; localStorage
  // is only the fallback for an in-app upload that has not been saved to code
  // yet. An in-session upload sets state directly, so the plate updates at once.
  const [portrait, setPortrait] = useState(
    () => savedAbout.profileImage || localStorage.getItem('aboutProfileImage') || a.profileImage || ''
  );
  const [portraitBusy, setPortraitBusy] = useState(false);

  const setAbout = (key, value) => updateContent('about', key, value);

  // List helpers. `content.about` holds four arrays (bio, valueWords, skills,
  // experience); these are the only mutations the page needs, so they stay
  // local rather than growing EditContext's API.
  const list = (key) => a[key] || [];
  const setAt = (key, i, value) => setAbout(key, list(key).map((x, ix) => (ix === i ? value : x)));
  const setField = (key, i, field, value) =>
    setAbout(key, list(key).map((x, ix) => (ix === i ? { ...x, [field]: value } : x)));
  const removeAt = (key, i) => setAbout(key, list(key).filter((_, ix) => ix !== i));
  const append = (key, value) => setAbout(key, [...list(key), value]);

  // Re-encode to WebP before upload — a phone photo is several MB, and the
  // save endpoint takes the image as base64 inside a JSON body. Falls back to
  // the original on any failure (no encoder, decode error, animated source).
  const toWebp = (dataUrl) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve({ dataUrl, isWebp: false });
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (!blob?.size) return resolve({ dataUrl, isWebp: false });
          const r = new FileReader();
          r.onload = () => resolve({ dataUrl: String(r.result || dataUrl), isWebp: true });
          r.onerror = () => resolve({ dataUrl, isWebp: false });
          r.readAsDataURL(blob);
        }, 'image/webp', 0.85);
      } catch {
        resolve({ dataUrl, isWebp: false });
      }
    };
    img.onerror = () => resolve({ dataUrl, isWebp: false });
    img.src = dataUrl;
  });

  const handlePortraitFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // SVG is vector and GIF is animated — rasterising either would wreck it.
    const skipWebp = file.type === 'image/svg+xml' || file.type === 'image/gif'
      || file.name.toLowerCase().endsWith('.svg');
    const reader = new FileReader();
    reader.onload = async (ev) => {
      setPortraitBusy(true);
      const source = String(ev.target?.result || '');
      const { dataUrl, isWebp } = skipWebp ? { dataUrl: source, isWebp: false } : await toWebp(source);
      // Render from the data URL for the rest of the session: it always works,
      // and skips the race where the browser requests the path before the API
      // has written it (a cached 404 shows as a broken image).
      setPortrait(dataUrl);
      try {
        const ext = isWebp ? 'webp' : (file.name.split('.').pop() || 'jpg').toLowerCase();
        const res = await fetch('/api/save-about-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: `profile.${ext}`, base64data: dataUrl.split(',')[1] }),
        });
        if (!res.ok) throw new Error(`save failed (${res.status})`);
        localStorage.setItem('aboutProfileImage', `/about/profile.${ext}`);
      } catch (err) {
        console.warn('[About] portrait not written to disk:', err);
      } finally {
        setPortraitBusy(false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handlePortraitUrl = () => {
    const url = window.prompt('Paste an image URL (any host):');
    const trimmed = url?.trim();
    if (!trimmed) return;
    if (!/^https?:\/\/.+/i.test(trimmed)) return window.alert('Needs to start with http:// or https://');
    setPortrait(trimmed);
    localStorage.setItem('aboutProfileImage', trimmed);
  };

  // `portrait` is a data URL in-session, so persist the disk path (written by
  // the upload) instead — a data URL in the JSON would bloat the file.
  const saveAboutToCode = () =>
    saveAboutContent({
      profileImage: localStorage.getItem('aboutProfileImage') || savedAbout.profileImage || '',
      about: content.about,
    });

  return (
    <PixelShell fade={1} band="22vh">
      <section className="ab-hero">
        <div className="ab-hero-text">
          <PixelEditable
            tag="p" className="ab-eyebrow" value={a.label ?? 'About'}
            onChange={(v) => setAbout('label', v)} placeholder="Label"
          />
          <h1 className="ab-title">
            <PixelEditable tag="span" value={a.title1 ?? ''} onChange={(v) => setAbout('title1', v)} placeholder="Line one" />
            <PixelEditable tag="span" value={a.title2 ?? ''} onChange={(v) => setAbout('title2', v)} placeholder="Line two" />
            <PixelEditable tag="span" value={a.title3 ?? ''} onChange={(v) => setAbout('title3', v)} placeholder="Line three" />
          </h1>
        </div>
        <div className="ab-hero-plate">
          <DitherPlate src={portrait} seed={41} contrast={1.05} ratio="3 / 4" caption={null} />
          {editMode ? (
            <div className="ab-plate-edit">
              <label className="px-add" htmlFor="ab-portrait-file">
                {portraitBusy ? 'Saving…' : 'Change portrait'}
              </label>
              <input
                id="ab-portrait-file" type="file" accept="image/*" hidden
                onChange={handlePortraitFile}
              />
              <button type="button" className="px-add" onClick={handlePortraitUrl}>Paste URL</button>
            </div>
          ) : null}
        </div>
      </section>

      <section className="ab-bio">
        <h2 className="ab-rule-label">
          <PixelEditable value={a.bioHeading ?? 'Hello!'} onChange={(v) => setAbout('bioHeading', v)} placeholder="Heading" />
        </h2>
        <div className="ab-bio-body">
          {(a.bio || []).map((para, i) => (
            <p key={i} className="ab-bio-para">
              <PixelEditable
                tag="span" value={para} multiline
                onChange={(v) => setAt('bio', i, v)} placeholder="Write a paragraph…"
              />
              <PixelRemoveBtn onClick={() => removeAt('bio', i)} title="Remove paragraph" />
            </p>
          ))}
          <PixelAddBtn onClick={() => append('bio', '')}>+ Paragraph</PixelAddBtn>
          <p className="ab-mail">
            {editMode
              ? <PixelEditable value={a.email ?? ''} onChange={(v) => setAbout('email', v)} placeholder="Email" />
              : <a href={`mailto:${a.email}`}>{a.email}</a>}
          </p>
        </div>
      </section>

      {(a.valueWords?.length || editMode) ? (
        <section className="ab-values">
          <h2 className="ab-rule-label">
            <PixelEditable value={a.skillsTitle ?? ''} onChange={(v) => setAbout('skillsTitle', v)} placeholder="Heading" />
          </h2>
          <ul className="ab-words">
            {(a.valueWords || []).map((w, i) => (
              <li key={i}>
                <PixelEditable value={w} onChange={(v) => setAt('valueWords', i, v)} placeholder="Word" />
                <PixelRemoveBtn onClick={() => removeAt('valueWords', i)} title="Remove word" />
              </li>
            ))}
          </ul>
          <PixelAddBtn onClick={() => append('valueWords', '')}>+ Word</PixelAddBtn>
        </section>
      ) : null}

      {(a.skills?.length || editMode) ? (
        <section className="ab-skills">
          <h2 className="ab-rule-label">
            <PixelEditable value={a.skillsHeading ?? 'Practice'} onChange={(v) => setAbout('skillsHeading', v)} placeholder="Heading" />
          </h2>
          <dl className="ab-skill-rows">
            {(a.skills || []).map((group, i) => (
              <div key={i}>
                <dt>
                  <PixelEditable
                    value={group.category ?? ''}
                    onChange={(v) => setField('skills', i, 'category', v)} placeholder="Category"
                  />
                  <PixelRemoveBtn onClick={() => removeAt('skills', i)} title="Remove category" />
                </dt>
                <dd>
                  {/* Edited as the one line it renders as — split back on the
                      same separator, so the field reads exactly as it looks. */}
                  <PixelEditable
                    tag="span" multiline value={(group.items || []).join(' · ')}
                    onChange={(v) => setField('skills', i, 'items', v.split('·').map((s) => s.trim()).filter(Boolean))}
                    placeholder="Skill · skill · skill"
                  />
                </dd>
              </div>
            ))}
          </dl>
          <PixelAddBtn onClick={() => append('skills', { category: '', items: [] })}>+ Category</PixelAddBtn>
        </section>
      ) : null}

      {(a.experience?.length || editMode) ? (
        <section className="ab-exp">
          <h2 className="ab-rule-label">
            <PixelEditable value={a.experienceTitle ?? 'Experience'} onChange={(v) => setAbout('experienceTitle', v)} placeholder="Heading" />
            <span className="ab-count">{String((a.experience || []).length).padStart(2, '0')}</span>
          </h2>
          <ol className="ab-records">
            {(a.experience || []).map((job, i) => (
              <li key={i}>
                <PixelEditable
                  tag="span" className="ab-year" value={job.year ?? ''}
                  onChange={(v) => setField('experience', i, 'year', v)} placeholder="Dates"
                />
                <span className="ab-role">
                  <PixelEditable
                    value={job.role ?? ''}
                    onChange={(v) => setField('experience', i, 'role', v)} placeholder="Role"
                  />
                </span>
                <span className="ab-co">
                  <PixelEditable
                    value={job.company ?? ''}
                    onChange={(v) => setField('experience', i, 'company', v)} placeholder="Company"
                  />
                  <PixelRemoveBtn onClick={() => removeAt('experience', i)} title="Remove role" />
                </span>
                {job.description || editMode ? (
                  <PixelEditable
                    tag="p" className="ab-desc" value={job.description ?? ''} multiline
                    onChange={(v) => setField('experience', i, 'description', v)} placeholder="What you did there…"
                  />
                ) : null}
              </li>
            ))}
          </ol>
          <PixelAddBtn onClick={() => append('experience', { year: '', role: '', company: '', description: '' })}>
            + Role
          </PixelAddBtn>
        </section>
      ) : null}

      <PixelPublishBar save={saveAboutToCode} />
    </PixelShell>
  );
};

export default About;
