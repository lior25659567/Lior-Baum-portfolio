import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEdit } from '../context/EditContext';
import AnimatedButton from '../components/AnimatedButton';
import './About.css';

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const { content, editMode } = useEdit();
  const heroRef = useRef(null);
  const labelRef = useRef(null);
  const line1Ref = useRef(null);
  const line2Ref = useRef(null);
  const fileInputRef = useRef(null);
  const [profileImage, setProfileImage] = useState(() => {
    return localStorage.getItem('aboutProfileImage') || '';
  });

  const skills = [
    { category: 'Design', items: ['UI/UX Design', 'Product Design', 'Design Systems', 'Prototyping', 'User Research'] },
    { category: 'Tools', items: ['Figma', 'Adobe Creative Suite', 'Sketch', 'Framer', 'Webflow'] },
    { category: 'Development', items: ['HTML/CSS', 'JavaScript', 'React', 'Motion Design', 'Responsive Design'] },
  ];

  const experience = [
    {
      year: '2023 - Present',
      role: 'Senior Product Designer',
      company: 'Company Name',
      description: 'Leading design initiatives for flagship products, establishing design systems, and mentoring junior designers.',
    },
    {
      year: '2021 - 2023',
      role: 'Product Designer',
      company: 'Previous Company',
      description: 'Designed end-to-end user experiences for web and mobile applications, conducted user research and usability testing.',
    },
    {
      year: '2019 - 2021',
      role: 'UI/UX Designer',
      company: 'Startup Name',
      description: 'Created visual designs and interactive prototypes for early-stage products, collaborated closely with development teams.',
    },
  ];

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result;
        setProfileImage(imageData);
        localStorage.setItem('aboutProfileImage', imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    if (editMode) {
      fileInputRef.current?.click();
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial animation on load
      const tl = gsap.timeline();
      
      tl.fromTo(
        labelRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
      )
      .fromTo(
        line1Ref.current,
        { y: 80, opacity: 0, skewY: 5 },
        { y: 0, opacity: 1, skewY: 0, duration: 0.8, ease: 'power3.out' },
        '-=0.2'
      )
      .fromTo(
        line2Ref.current,
        { y: 80, opacity: 0, skewY: 5 },
        { y: 0, opacity: 1, skewY: 0, duration: 0.8, ease: 'power3.out' },
        '-=0.5'
      );

      // Scroll-based parallax
      ScrollTrigger.create({
        trigger: heroRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5,
        onUpdate: (self) => {
          const progress = self.progress;
          gsap.to(labelRef.current, {
            y: progress * 30,
            opacity: 1 - progress * 0.6,
            duration: 0.1
          });
          gsap.to(line1Ref.current, {
            y: progress * 60,
            skewY: progress * 2,
            opacity: 1 - progress * 0.7,
            duration: 0.1
          });
          gsap.to(line2Ref.current, {
            y: progress * 80,
            skewY: progress * 2,
            opacity: 1 - progress * 0.7,
            duration: 0.1
          });
        }
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className={`about-page ${editMode ? 'edit-mode-active' : ''}`}>
      <div className="about-container">
        {/* Hero Section */}
        <div className="about-hero" ref={heroRef}>
          <div className="title-line-wrapper">
            <span className="section-label" ref={labelRef}>{content.about?.label || 'About Me'}</span>
          </div>
          <h1 className="about-title">
            <div className="title-line-wrapper">
              <div className="title-line" ref={line1Ref}>
                <span className="sans">{content.about?.title1 || 'Designing'}</span> <span className="serif">{content.about?.title2 || 'experiences'}</span>
              </div>
            </div>
            <div className="title-line-wrapper">
              <div className="title-line" ref={line2Ref}>
                <span className="serif accent">{content.about?.title3 || 'that matter'}</span>
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
            <div 
              className={`about-image ${editMode ? 'editable' : ''}`}
              onClick={handleImageClick}
            >
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
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <div className="image-decoration" />
          </motion.div>

          <motion.div
            className="about-bio"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <h2 className="bio-heading">{content.about?.bioHeading || 'Hello!'}</h2>
            {(content.about?.bio || [
              "I'm a product designer with a passion for creating digital experiences that are both beautiful and functional. With over 5 years of experience in the industry, I've had the privilege of working with startups and established companies alike.",
              "My approach combines user-centered design principles with a keen eye for aesthetics. I believe that great design should not only look good but also solve real problems and create meaningful connections between products and their users.",
              "When I'm not designing, you can find me exploring new places, experimenting with photography, or diving into the latest design trends and technologies.",
            ]).map((text, i) => (
              <p key={i} className="bio-text">{text}</p>
            ))}

            <div className="bio-cta">
              <AnimatedButton 
                href={content.hero?.cvLink || '/resume.pdf'} 
                variant="primary"
                icon="↓"
              >
                Download CV
              </AnimatedButton>
              <AnimatedButton 
                href={`mailto:${content.about?.email || 'lior@example.com'}`}
                variant="outline"
                icon="→"
              >
                Get in touch
              </AnimatedButton>
            </div>
          </motion.div>
        </div>

        {/* Skills Section */}
        <motion.div
          className="skills-section"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="section-heading">Skills & Expertise</h2>
          <div className="skills-grid">
            {skills.map((skillGroup, index) => (
              <motion.div
                key={skillGroup.category}
                className="skill-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <h3 className="skill-category">{skillGroup.category}</h3>
                <ul className="skill-list">
                  {skillGroup.items.map((skill) => (
                    <li key={skill} className="skill-item">{skill}</li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Experience Section */}
        <motion.div
          className="experience-section"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="section-heading">Experience</h2>
          <div className="experience-timeline">
            {experience.map((exp, index) => (
              <motion.div
                key={index}
                className="experience-item"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
              >
                <div className="experience-year">{exp.year}</div>
                <div className="experience-content">
                  <h3 className="experience-role">{exp.role}</h3>
                  <p className="experience-company">{exp.company}</p>
                  <p className="experience-description">{exp.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
