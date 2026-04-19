import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEdit } from '../context/EditContext';
import AnimatedButton from '../components/AnimatedButton';
import Footer from '../components/Footer';
import './About.css';
import './HomePublishBar.css';

gsap.registerPlugin(ScrollTrigger);

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
    return localStorage.getItem('aboutProfileImage') || '';
  });
  const [publishStatus, setPublishStatus] = useState('');

  const about = content.about || {};
  const skills = about.skills || [];
  const experience = about.experience || [];

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


  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const imageData = event.target?.result;
        setProfileImage(imageData);
        localStorage.setItem('aboutProfileImage', imageData);
        try {
          const ext = file.name.split('.').pop() || 'jpg';
          const base64data = imageData.split(',')[1];
          await fetch('/api/save-about-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: `profile.${ext}`, base64data }),
          });
          const filePath = `/about/profile.${ext}`;
          setProfileImage(filePath);
          localStorage.setItem('aboutProfileImage', filePath);
        } catch (err) {
          console.warn('[About] Could not save image to filesystem:', err);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    if (editMode) {
      fileInputRef.current?.click();
    }
  };

  const saveAboutToCode = async () => {
    const res = await fetch('/api/save-about-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profileImage: profileImage,
        about: content.about,
      }),
    });
    const json = await res.json();
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
      const tl = gsap.timeline();
      tl.fromTo(labelRef.current, { y: 18, opacity: 0, filter: 'blur(4px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.6, ease: 'power2.out' })
        .fromTo(line1Ref.current, { y: 60, opacity: 0, filter: 'blur(4px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.8, ease: 'back.out(1.4)' }, '-=0.3')
        .fromTo(line2Ref.current, { y: 60, opacity: 0, filter: 'blur(4px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.8, ease: 'back.out(1.4)' }, '-=0.5');

      ScrollTrigger.create({
        trigger: heroRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5,
        onUpdate: (self) => {
          const progress = self.progress;
          gsap.to(labelRef.current, { y: progress * 30, opacity: 1 - progress * 0.6, filter: `blur(${progress * 4}px)`, duration: 0.1 });
          gsap.to(line1Ref.current, { y: progress * 60, opacity: 1 - progress * 0.7, filter: `blur(${progress * 4}px)`, duration: 0.1 });
          gsap.to(line2Ref.current, { y: progress * 80, opacity: 1 - progress * 0.7, filter: `blur(${progress * 4}px)`, duration: 0.1 });
        }
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const el = skillsRef.current;
    if (!el) return;
    const cards = el.querySelectorAll('.skill-card');
    if (!cards.length) return;
    gsap.set(cards, { y: 50, opacity: 0 });
    const st = ScrollTrigger.create({
      trigger: el, start: 'top 82%', once: true,
      onEnter: () => { gsap.to(cards, { y: 0, opacity: 1, duration: 0.75, stagger: 0.1, ease: 'power3.out' }); },
    });
    return () => st.kill();
  }, []);

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
                <span className="serif"><Editable value={about.title2 || 'experiences'} onChange={(v) => updateAbout('title2', v)} /></span>
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
            <div className={`about-image ${editMode ? 'editable' : ''}`} onClick={handleImageClick}>
              {profileImage ? (
                <>
                  <img src={profileImage} alt="Profile" />
                  {editMode && <div className="image-edit-overlay">Click to change</div>}
                </>
              ) : (
                <div className="image-placeholder">
                  <span>{editMode ? 'Click to upload' : 'Your Photo'}</span>
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" style={{ display: 'none' }} />
            <div className="image-decoration" />
          </motion.div>

          <motion.div
            className="about-bio"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
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
              <AnimatedButton href={content.hero?.cvLink || '/resume.pdf'} variant="primary" icon="↓">
                Download CV
              </AnimatedButton>
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
              </div>
            )}
          </motion.div>
        </div>

        {/* Skills Section */}
        <div className="skills-section">
          <Editable tag="h2" className="section-heading" value={about.skillsTitle || 'Skills & Expertise'} onChange={(v) => updateAbout('skillsTitle', v)} />
          <div className="skills-grid" ref={skillsRef}>
            {skills.map((skillGroup, gi) => (
              <div key={gi} className="skill-card">
                <div className="skill-card-header">
                  <Editable tag="h3" className="skill-category" value={skillGroup.category} onChange={(v) => updateSkillCategory(gi, v)} />
                  {editMode && (
                    <button className="about-remove-btn small" onClick={() => removeSkillGroup(gi)} title="Remove category">&times;</button>
                  )}
                </div>
                <ul className="skill-list">
                  {skillGroup.items.map((skill, si) => (
                    <li key={si} className="skill-item">
                      <Editable value={skill} onChange={(v) => updateSkillItem(gi, si, v)} placeholder="Skill name" />
                      {editMode && (
                        <button className="about-remove-btn small inline" onClick={() => removeSkillItem(gi, si)} title="Remove skill">&times;</button>
                      )}
                    </li>
                  ))}
                </ul>
                {editMode && (
                  <button className="about-add-btn small" onClick={() => addSkillItem(gi)}>+ Add Skill</button>
                )}
              </div>
            ))}
          </div>
          {editMode && (
            <button className="about-add-btn" onClick={addSkillGroup}>+ Add Skill Group</button>
          )}
        </div>

        {/* Experience Section */}
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
