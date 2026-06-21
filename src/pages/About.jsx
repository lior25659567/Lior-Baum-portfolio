import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEdit } from '../context/EditContext';
import AnimatedButton from '../components/AnimatedButton';
import AboutRotator, { DEFAULT_SKILLS as DEFAULT_VALUE_WORDS } from '../components/AboutRotator';
import Footer from '../components/Footer';
import './About.css';
import './HomePublishBar.css';

gsap.registerPlugin(ScrollTrigger);

let savedAboutData = null;
try {
  const mod = import.meta.glob('../data/about-content.json', { eager: true });
  const key = Object.keys(mod)[0];
  if (key) savedAboutData = mod[key].default || mod[key];
} catch { /* file doesn't exist yet */ }

const isPersistableImage = (v) => !!v && !v.startsWith('data:');

// The default portrait is webp-only now. Any older stored path that still
// points at /about/profile.png is remapped to the webp so the image never
// blanks out after the PNG was removed from the repo.
const normalizeProfilePath = (v) =>
  typeof v === 'string' ? v.replace('/about/profile.png', '/about/profile.webp') : v;

// A pasted media URL can point at a video as well as an image.
const isVideoSrc = (v) =>
  !!v && (/\.(mp4|webm|mov|m4v|ogv|ogg)(\?|#|$)/i.test(v) || /\/video\/upload\//i.test(v) || v.startsWith('data:video'));

// Append a timestamp so the browser won't reuse a cached 404 for the same
// path the API just wrote (common cause of the "upload → broken icon" flash
// when the <img> had tried the URL before the file existed).
const withCacheBuster = (url) => {
  if (!url || url.startsWith('data:')) return url;
  // Remote/hosted URLs (Cloudinary, etc.) are immutable and cacheable — never
  // bust them, or every navigation re-downloads and the image flashes blank
  // (e.g. arriving at About from the heavy Playground page). Only local paths
  // the save API may have just written need the timestamp.
  if (/^https?:\/\//i.test(url)) return url;
  return url.includes('?') ? url : `${url}?t=${Date.now()}`;
};

// Lightweight inline editable text for the About page
const Editable = ({ value, onChange, tag: Tag = 'span', className, multiline = false, placeholder = 'Edit...' }) => {
  const { editMode } = useEdit();
  const ref = useRef(null);

  const handleBlur = () => {
    const el = ref.current;
    if (!el) return;
    const newVal = multiline ? el.innerText : el.innerText.replace(/\n/g, ' ');
    if (newVal !== value) onChange(newVal);
  };

  const handleKeyDown = (e) => {
    if (!multiline && e.key === 'Enter') {
      e.preventDefault();
      e.target.blur();
    }
  };

  if (!editMode) {
    return <Tag className={className}>{value}</Tag>;
  }

  return (
    <Tag
      ref={ref}
      className={`${className || ''} about-editable`}
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      data-placeholder={placeholder}
    >
      {value}
    </Tag>
  );
};

const About = () => {
  const { content, editMode, updateContent, gitPush } = useEdit();
  const heroRef = useRef(null);
  const labelRef = useRef(null);
  const line1Ref = useRef(null);
  const line2Ref = useRef(null);
  const fileInputRef = useRef(null);
  const skillsRef = useRef(null);
  const experienceRef = useRef(null);
  const [profileImage, setProfileImage] = useState(() => {
    // The committed about-content.json is the published source of truth and
    // wins, so changing the photo via git (the actual workflow) always shows —
    // a stale localStorage path from an old in-app upload can no longer mask it.
    // localStorage is only the fallback when the JSON has no image, and an
    // in-session upload still updates state immediately via setProfileImage.
    const fromJson = normalizeProfilePath(savedAboutData?.profileImage);
    if (isPersistableImage(fromJson)) return withCacheBuster(fromJson);
    const stored = normalizeProfilePath(localStorage.getItem('aboutProfileImage'));
    return isPersistableImage(stored) ? withCacheBuster(stored) : '';
  });
  const [publishStatus, setPublishStatus] = useState('');

  const about = content.about || {};
  const skills = about.skills || [];
  const experience = about.experience || [];
  // Rotator words ("what matters to me") — editable, falls back to the curated default list.
  const valueWords = about.valueWords?.length ? about.valueWords : DEFAULT_VALUE_WORDS;

  // Helpers to update nested about content
  const updateAbout = useCallback((key, value) => {
    updateContent('about', key, value);
  }, [updateContent]);

  const updateBioParagraph = useCallback((i, newText) => {
    const newBio = [...(about.bio || [])];
    newBio[i] = newText;
    updateAbout('bio', newBio);
  }, [about.bio, updateAbout]);

  const addBioParagraph = useCallback(() => {
    updateAbout('bio', [...(about.bio || []), 'New paragraph...']);
  }, [about.bio, updateAbout]);

  const removeBioParagraph = useCallback((i) => {
    updateAbout('bio', (about.bio || []).filter((_, idx) => idx !== i));
  }, [about.bio, updateAbout]);

  // Skills helpers
  const updateSkillCategory = useCallback((groupIndex, newCategory) => {
    const newSkills = skills.map((g, i) => i === groupIndex ? { ...g, category: newCategory } : g);
    updateAbout('skills', newSkills);
  }, [skills, updateAbout]);

  const updateSkillItem = useCallback((groupIndex, itemIndex, newValue) => {
    const newSkills = skills.map((g, gi) =>
      gi === groupIndex ? { ...g, items: g.items.map((s, si) => si === itemIndex ? newValue : s) } : g
    );
    updateAbout('skills', newSkills);
  }, [skills, updateAbout]);

  const addSkillItem = useCallback((groupIndex) => {
    const newSkills = skills.map((g, i) =>
      i === groupIndex ? { ...g, items: [...g.items, 'New Skill'] } : g
    );
    updateAbout('skills', newSkills);
  }, [skills, updateAbout]);

  const removeSkillItem = useCallback((groupIndex, itemIndex) => {
    const newSkills = skills.map((g, gi) =>
      gi === groupIndex ? { ...g, items: g.items.filter((_, si) => si !== itemIndex) } : g
    );
    updateAbout('skills', newSkills);
  }, [skills, updateAbout]);

  const addSkillGroup = useCallback(() => {
    updateAbout('skills', [...skills, { category: 'New Category', items: ['Skill 1'] }]);
  }, [skills, updateAbout]);

  const removeSkillGroup = useCallback((groupIndex) => {
    updateAbout('skills', skills.filter((_, i) => i !== groupIndex));
  }, [skills, updateAbout]);

  // Rotator value-word helpers — seed from the current list (defaults included)
  // on first edit so the user always edits the live 20.
  const updateValueWord = useCallback((i, text) => {
    updateAbout('valueWords', valueWords.map((w, idx) => (idx === i ? text : w)));
  }, [valueWords, updateAbout]);

  const addValueWord = useCallback(() => {
    updateAbout('valueWords', [...valueWords, 'New value']);
  }, [valueWords, updateAbout]);

  const removeValueWord = useCallback((i) => {
    updateAbout('valueWords', valueWords.filter((_, idx) => idx !== i));
  }, [valueWords, updateAbout]);

  // Experience helpers
  const updateExperienceField = useCallback((expIndex, field, value) => {
    const newExp = experience.map((e, i) => i === expIndex ? { ...e, [field]: value } : e);
    updateAbout('experience', newExp);
  }, [experience, updateAbout]);

  const addExperience = useCallback(() => {
    updateAbout('experience', [...experience, { year: '2024', role: 'Role', company: 'Company', description: 'Description...' }]);
  }, [experience, updateAbout]);

  const removeExperience = useCallback((expIndex) => {
    updateAbout('experience', experience.filter((_, i) => i !== expIndex));
  }, [experience, updateAbout]);


  // Re-encode an image data URL as WebP via canvas. Returns the original
  // data URL on any failure (decode error, browser without WebP encoder,
  // animated source) so the upload still works in the worst case.
  const reEncodeAsWebp = (sourceDataUrl, quality = 0.85) => new Promise((resolve) => {
    if (typeof document === 'undefined') return resolve({ dataUrl: sourceDataUrl, isWebp: false });
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve({ dataUrl: sourceDataUrl, isWebp: false });
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (!blob || blob.size === 0) return resolve({ dataUrl: sourceDataUrl, isWebp: false });
          const r = new FileReader();
          r.onload = () => resolve({ dataUrl: String(r.result || sourceDataUrl), isWebp: true });
          r.onerror = () => resolve({ dataUrl: sourceDataUrl, isWebp: false });
          r.readAsDataURL(blob);
        }, 'image/webp', quality);
      } catch {
        resolve({ dataUrl: sourceDataUrl, isWebp: false });
      }
    };
    img.onerror = () => resolve({ dataUrl: sourceDataUrl, isWebp: false });
    img.src = sourceDataUrl;
  });

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Skip the WebP step for SVG (vector — re-encoding to raster ruins it)
    // and GIF (animated — canvas would freeze the first frame).
    const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
    const isGif = file.type === 'image/gif';
    const reader = new FileReader();
    reader.onload = async (event) => {
      const sourceDataUrl = event.target?.result;
      const { dataUrl: imageData, isWebp } = (isSvg || isGif)
        ? { dataUrl: sourceDataUrl, isWebp: false }
        : await reEncodeAsWebp(sourceDataUrl);
      // Keep the data URL in state for the rest of the session — always
      // renders, and skips the race where the browser requests the file
      // path before the API has finished writing it (which caches a 404
      // that then shows as a broken icon).
      setProfileImage(imageData);
      try {
        const sourceExt = (file.name.split('.').pop() || 'jpg').toLowerCase();
        const ext = isWebp ? 'webp' : sourceExt;
        const base64data = imageData.split(',')[1];
        const res = await fetch('/api/save-about-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: `profile.${ext}`, base64data }),
        });
        if (!res.ok) throw new Error(`save failed (${res.status})`);
        // localStorage holds the disk path so next page load can render
        // straight from the URL without re-reading the data URL.
        localStorage.setItem('aboutProfileImage', `/about/profile.${ext}`);
      } catch (err) {
        console.warn('[About] Could not save image to filesystem:', err);
      }
    };
    reader.readAsDataURL(file);
  };

  // Paste a hosted image or video URL (Cloudinary, etc.) instead of uploading
  // a file. A remote URL is persistable as-is (it's not a data: URL), so we
  // skip the filesystem save and store the link straight into state + localStorage.
  const handleImageUrl = () => {
    const url = window.prompt('Paste an image or video URL (Cloudinary, Imgur, any host):');
    if (url === null) return;
    const trimmed = url.trim();
    if (!trimmed) return;
    if (!/^https?:\/\/.+/i.test(trimmed)) {
      alert('Please paste a URL starting with http:// or https://');
      return;
    }
    setProfileImage(trimmed);
    localStorage.setItem('aboutProfileImage', trimmed);
  };

  const saveAboutToCode = async () => {
    // `profileImage` state is a data URL in-session, so read the persisted
    // disk path (set after a successful upload) from localStorage instead.
    const storedPath = localStorage.getItem('aboutProfileImage') || '';
    const pathOnly = storedPath.split('?')[0];
    const res = await fetch('/api/save-about-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profileImage: isPersistableImage(pathOnly) ? pathOnly : '',
        about: content.about,
      }),
    });
    const json = await res.json().catch(() => ({ ok: false, error: `HTTP ${res.status} (no API on this host)` }));
    if (!json.ok) throw new Error(json.error || 'Save failed');
    return json;
  };

  const handleSaveToCode = async () => {
    setPublishStatus('saving');
    try {
      await saveAboutToCode();
      setPublishStatus('saved');
      setTimeout(() => setPublishStatus(''), 2500);
    } catch (err) {
      console.error(err);
      setPublishStatus('error');
      setTimeout(() => setPublishStatus(''), 3000);
    }
  };

  const handlePushToGit = async () => {
    setPublishStatus('pushing');
    try {
      await saveAboutToCode();
      await gitPush();
      setPublishStatus('pushed');
      setTimeout(() => setPublishStatus(''), 3000);
    } catch (err) {
      console.error(err);
      setPublishStatus('error');
      setTimeout(() => setPublishStatus(''), 3000);
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Intro timeline — same shape/timing/easing as the home hero: label
      // fades in with a slight blur, title lines rise from below with a
      // gentle overshoot, slightly overlapped so they feel connected.
      const tl = gsap.timeline({ delay: 0.15 });
      tl.fromTo(labelRef.current,
        { y: 18, opacity: 0, filter: 'blur(4px)' },
        // Settle at 0.65 (not 1) so the eyebrow stays muted — matches the
        // Playground hero label; full opacity here overrode the CSS .65.
        { y: 0, opacity: 0.65, filter: 'blur(0px)', duration: 0.6, ease: 'power2.out' }
      );
      if (line1Ref.current) {
        tl.fromTo(line1Ref.current,
          { yPercent: 120, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.8, ease: 'back.out(1.4)' },
          '-=0.35'
        );
      }
      if (line2Ref.current) {
        tl.fromTo(line2Ref.current,
          { yPercent: 120, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.8, ease: 'back.out(1.4)' },
          '-=0.55'
        );
      }

      // Scroll-away / scroll-back — mirrors the home hero exactly:
      // discrete in/out on threshold crossings instead of a scrubbed blur,
      // so the motion feels identical in both places.
      const lineEls = [line1Ref, line2Ref].map(r => r.current).filter(Boolean);
      const elements = [labelRef.current, ...lineEls].filter(Boolean);
      ScrollTrigger.create({
        trigger: heroRef.current,
        start: 'top top',
        end: 'bottom 20%',
        onLeave: () =>
          gsap.to(elements, { y: -50, opacity: 0, duration: 0.35, stagger: 0.025, ease: 'power2.in' }),
        onEnterBack: () => {
          // Title lines return to full opacity; the label stays muted at 0.65.
          gsap.to(lineEls, { y: 0, opacity: 1, duration: 0.5, stagger: 0.04, ease: 'power3.out' });
          gsap.to(labelRef.current, { y: 0, opacity: 0.65, duration: 0.5, ease: 'power3.out' });
        },
      });
    }, heroRef);
    const t = setTimeout(() => ScrollTrigger.refresh(), 100);
    return () => { clearTimeout(t); ctx.revert(); };
  }, []);

  useEffect(() => {
    const el = skillsRef.current;
    if (!el) return;
    // Edit mode → grid cards; view mode → rotator stage root.
    const targets = el.querySelectorAll('.skill-card, .about-rotator-stage > *');
    if (!targets.length) return;
    gsap.set(targets, { y: 50, opacity: 0 });
    const st = ScrollTrigger.create({
      trigger: el, start: 'top 82%', once: true,
      onEnter: () => { gsap.to(targets, { y: 0, opacity: 1, duration: 0.75, stagger: 0.1, ease: 'power3.out' }); },
    });
    return () => st.kill();
  }, [editMode]);

  useEffect(() => {
    const el = experienceRef.current;
    if (!el) return;
    const items = el.querySelectorAll('.experience-item');
    if (!items.length) return;
    gsap.set(items, { y: 50, opacity: 0 });
    const st = ScrollTrigger.create({
      trigger: el, start: 'top 82%', once: true,
      onEnter: () => { gsap.to(items, { y: 0, opacity: 1, duration: 0.75, stagger: 0.1, ease: 'power3.out' }); },
    });
    return () => st.kill();
  }, []);

  return (
    <section className={`about-page ${editMode ? 'edit-mode-active' : ''}`}>
      <div className="about-container">
        {/* Hero Section */}
        <div className="about-hero" ref={heroRef}>
          <div className="title-line-wrapper">
            <span className="section-label" ref={labelRef}>
              <Editable value={about.label || 'About Me'} onChange={(v) => updateAbout('label', v)} placeholder="Label" />
            </span>
          </div>
          <h1 className="about-title">
            <div className="title-line-wrapper">
              <div className="title-line" ref={line1Ref}>
                <span className="sans"><Editable value={about.title1 || 'Designing'} onChange={(v) => updateAbout('title1', v)} /></span>
                {' '}
                <span className="sans"><Editable value={about.title2 || 'experiences'} onChange={(v) => updateAbout('title2', v)} /></span>
              </div>
            </div>
            <div className="title-line-wrapper">
              <div className="title-line" ref={line2Ref}>
                <span className="serif accent"><Editable value={about.title3 || 'that matter'} onChange={(v) => updateAbout('title3', v)} /></span>
              </div>
            </div>
          </h1>
        </div>

        {/* Bio Section */}
        <div className="about-content">
          <motion.div
            className="about-image-wrapper"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {editMode ? (
              <label htmlFor="about-profile-image-input" className="about-image editable">
                {profileImage ? (
                  <>
                    {isVideoSrc(profileImage) ? (
                      <video src={profileImage} autoPlay muted loop playsInline />
                    ) : (
                      <img src={profileImage} alt="Profile" />
                    )}
                    <div className="image-edit-overlay">Click to change</div>
                  </>
                ) : (
                  <div className="image-placeholder">
                    <span>Click to upload</span>
                  </div>
                )}
              </label>
            ) : (
              <div className="about-image">
                {profileImage ? (
                  isVideoSrc(profileImage) ? (
                    <video src={profileImage} autoPlay muted loop playsInline />
                  ) : (
                    <img src={profileImage} alt="Profile" />
                  )
                ) : (
                  <div className="image-placeholder">
                    <span>Your Photo</span>
                  </div>
                )}
              </div>
            )}
            <input
              id="about-profile-image-input"
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="about-image-file-input"
            />
            {editMode && (
              <button type="button" className="about-image-url-btn" onClick={handleImageUrl}>
                🔗 Paste image URL
              </button>
            )}
            <div className="image-decoration" />
          </motion.div>

          <motion.div
            className="about-bio"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{ alignSelf: about.bioAlign === 'center' ? 'center' : 'start' }}
          >
            <Editable tag="h2" className="bio-heading" value={about.bioHeading || 'Hello!'} onChange={(v) => updateAbout('bioHeading', v)} />
            {(about.bio || []).map((text, i) => (
              <div key={i} className="bio-paragraph-wrapper">
                <Editable tag="p" className="bio-text" value={text} onChange={(v) => updateBioParagraph(i, v)} multiline placeholder="Write a paragraph..." />
                {editMode && (
                  <button className="about-remove-btn" onClick={() => removeBioParagraph(i)} title="Remove paragraph">&times;</button>
                )}
              </div>
            ))}
            {editMode && (
              <button className="about-add-btn" onClick={addBioParagraph}>+ Add Paragraph</button>
            )}

            <div className="bio-cta">
              <AnimatedButton href={`mailto:${about.email || 'lior@example.com'}`} variant="outline" icon="→">
                Get in touch
              </AnimatedButton>
            </div>
            {editMode && (
              <div className="about-email-edit">
                <label>
                  Email:
                  <input type="text" value={about.email || ''} onChange={(e) => updateAbout('email', e.target.value)} className="about-inline-input" />
                </label>
                <div className="about-align-toggle" role="group" aria-label="Bio vertical alignment">
                  <span className="about-align-label">Align bio:</span>
                  <button
                    type="button"
                    className={`about-align-btn${(about.bioAlign || 'start') === 'start' ? ' is-active' : ''}`}
                    onClick={() => updateAbout('bioAlign', 'start')}
                  >
                    Top
                  </button>
                  <button
                    type="button"
                    className={`about-align-btn${about.bioAlign === 'center' ? ' is-active' : ''}`}
                    onClick={() => updateAbout('bioAlign', 'center')}
                  >
                    Center
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Skills Section — rotator in view mode, editable grid in edit mode.
            The section heading lives above the rotator in both modes. */}
        <div className="skills-section">
          <Editable tag="h2" className="section-heading" value={about.skillsTitle || 'What Matters to Me as a Designer'} onChange={(v) => updateAbout('skillsTitle', v)} />
          {editMode ? (
            <>
              {/* Rotator words — the list shown spinning in view mode. */}
              <div className="rotator-word-editor">
                <p className="rotator-word-editor-label">Wheel words (shown in the spinning circle)</p>
                <div className="rotator-word-chips">
                  {valueWords.map((word, i) => (
                    <span key={i} className="rotator-word-chip">
                      <Editable value={word} onChange={(v) => updateValueWord(i, v)} placeholder="Value" />
                      <button className="about-remove-btn small inline" onClick={() => removeValueWord(i)} title="Remove word">&times;</button>
                    </span>
                  ))}
                </div>
                <button className="about-add-btn small" onClick={addValueWord}>+ Add word</button>
              </div>

              <div className="skills-grid" ref={skillsRef}>
                {skills.map((skillGroup, gi) => (
                  <div key={gi} className="skill-card">
                    <div className="skill-card-header">
                      <Editable tag="h3" className="skill-category" value={skillGroup.category} onChange={(v) => updateSkillCategory(gi, v)} />
                      <button className="about-remove-btn small" onClick={() => removeSkillGroup(gi)} title="Remove category">&times;</button>
                    </div>
                    <ul className="skill-list">
                      {skillGroup.items.map((skill, si) => (
                        <li key={si} className="skill-item">
                          <Editable value={skill} onChange={(v) => updateSkillItem(gi, si, v)} placeholder="Skill name" />
                          <button className="about-remove-btn small inline" onClick={() => removeSkillItem(gi, si)} title="Remove skill">&times;</button>
                        </li>
                      ))}
                    </ul>
                    <button className="about-add-btn small" onClick={() => addSkillItem(gi)}>+ Add Skill</button>
                  </div>
                ))}
              </div>
              <button className="about-add-btn" onClick={addSkillGroup}>+ Add Skill Group</button>
            </>
          ) : (
            <div className="about-rotator-stage" ref={skillsRef}>
              {/* Words come from about.valueWords (editable in edit mode),
                  falling back to the curated default list. */}
              <AboutRotator items={valueWords} />
            </div>
          )}
        </div>

        {/* Experience Section — hidden on the public page; still visible/editable in edit mode */}
        {editMode && (
        <div className="experience-section">
          <Editable tag="h2" className="section-heading" value={about.experienceTitle || 'Experience'} onChange={(v) => updateAbout('experienceTitle', v)} />
          <div className="experience-timeline" ref={experienceRef}>
            {experience.map((exp, index) => (
              <div key={index} className="experience-item">
                <Editable tag="div" className="experience-year" value={exp.year} onChange={(v) => updateExperienceField(index, 'year', v)} placeholder="Year" />
                <div className="experience-content">
                  <Editable tag="h3" className="experience-role" value={exp.role} onChange={(v) => updateExperienceField(index, 'role', v)} placeholder="Role" />
                  <Editable tag="p" className="experience-company" value={exp.company} onChange={(v) => updateExperienceField(index, 'company', v)} placeholder="Company" />
                  <Editable tag="p" className="experience-description" value={exp.description} onChange={(v) => updateExperienceField(index, 'description', v)} multiline placeholder="Description..." />
                </div>
                {editMode && (
                  <button className="about-remove-btn" onClick={() => removeExperience(index)} title="Remove experience">&times;</button>
                )}
              </div>
            ))}
          </div>
          {editMode && (
            <button className="about-add-btn" onClick={addExperience}>+ Add Experience</button>
          )}
        </div>
        )}

      </div>

      {editMode && (
        <div className="home-publish-bar">
          <button className="home-publish-btn save-btn" onClick={handleSaveToCode} disabled={publishStatus === 'saving' || publishStatus === 'pushing'}>
            {publishStatus === 'saving' ? 'Saving...' : publishStatus === 'saved' ? '\u2713 Saved' : '\uD83D\uDCBE Save to Code'}
          </button>
          <button className="home-publish-btn push-btn" onClick={handlePushToGit} disabled={publishStatus === 'saving' || publishStatus === 'pushing'}>
            {publishStatus === 'pushing' ? 'Pushing...' : publishStatus === 'pushed' ? '\u2713 Pushed & Deployed' : '\u2191 Push to Git'}
          </button>
          {publishStatus === 'error' && <span className="home-publish-error">Failed — check console</span>}
        </div>
      )}

      <Footer />
    </section>
  );
};

export default About;
