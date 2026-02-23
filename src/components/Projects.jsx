import { Link, useNavigate } from 'react-router-dom';
import { useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEdit } from '../context/EditContext';
import './Projects.css';

gsap.registerPlugin(ScrollTrigger);

// Default projects - used as fallback
const defaultProjects = [
  {
    id: 'align-technology',
    title: 'iTero Toolbar',
    category: 'UI Unification & Efficiency',
    image: '/case-studies/align/slide-1.png',
    year: '2024',
  },
  {
    id: 'itero-scan-view',
    title: 'iTero Scan & View',
    category: 'MedTech / Clinical UX',
    image: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=800&h=600&fit=crop',
    year: '2024',
  },
  {
    id: 'wizecare',
    title: 'WizeCare',
    category: 'B2B Complex System',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop',
    year: '2023',
  },
  {
    id: 'webflow',
    title: 'Webflow',
    category: 'Web Design',
    image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&h=600&fit=crop',
    year: '2023',
  },
  {
    id: 'shenkar',
    title: 'Shenkar',
    category: 'Brand Identity',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop',
    year: '2022',
  },
];

const ProjectCard = ({ project, index, editMode, onImageChange, onRemove }) => {
  const fileInputRef = useRef(null);
  const fileInputId = `project-image-${project.id}`;

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Compress and convert to data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxWidth = 800;
        const maxHeight = 600;
        let { width, height } = img;
        if (width > maxWidth) { height = (maxWidth / width) * height; width = maxWidth; }
        if (height > maxHeight) { width = (maxHeight / height) * width; height = maxHeight; }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        onImageChange(project.id, dataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, [project.id, onImageChange]);

  return (
    <article className="project-card work-grid-project">
      <Link to={`/project/${project.id}`} className="project-link" aria-label={project.title} />
      <div className="project-media">
        <div className="project-image-wrapper media-wrapper">
          <div className="project-image media-inner" style={{ backgroundImage: project.image ? `url(${project.image})` : undefined }} />
          {!project.image && <div className="project-image-placeholder" />}
        </div>
      </div>
      {/* Content overlay: visible on hover (hidden in edit mode so Change Image takes over) */}
      {!editMode && (
        <div className="project-content">
          <h3 className="project-content-title">{project.title}</h3>
          <p className="project-content-meta">
            <span className="project-content-category">{project.category}</span>
            <span className="project-content-year">{project.year}</span>
          </p>
        </div>
      )}
      {editMode && (
        <div className="project-image-overlay">
          <label htmlFor={fileInputId} className="project-image-overlay-label">
            <span className="image-overlay-icon">📷</span>
            <span className="image-overlay-text">Change Image</span>
          </label>
          <input
            id={fileInputId}
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="project-image-file-input"
          />
        </div>
      )}
      {editMode && onRemove && (
        <button className="project-remove-btn" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(project.id); }} title="Remove project">×</button>
      )}
    </article>
  );
};

const Projects = () => {
  const { content, setContent, editMode } = useEdit();
  const navigate = useNavigate();
  const titleRef = useRef(null);
  const gridRef = useRef(null);

  // GSAP scroll animation for project cards (smoother entrance)
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const cards = grid.querySelectorAll('.work-grid-project');
    if (!cards.length) return;
    gsap.set(cards, { y: 56, opacity: 0 });
    const st = ScrollTrigger.create({
      trigger: grid,
      start: 'top 82%',
      once: true,
      onEnter: () => {
        gsap.to(cards, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
        });
      },
    });
    return () => st.kill();
  }, []);

  // Word-stagger scroll animation for section title (same as Services)
  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    const words = el.querySelectorAll('.section-title-word');
    if (!words.length) return;

    gsap.set(words, { y: 28, opacity: 0 });
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 82%',
      once: true,
      onEnter: () => {
        gsap.to(words, {
          y: 0,
          opacity: 1,
          duration: 0.55,
          stagger: 0.055,
          ease: 'power3.out',
        });
      },
    });
    return () => st.kill();
  }, [content.projects?.sectionTitle]);

  // Merge default projects with saved content, and include any extra saved projects
  const projects = (() => {
    const savedItems = content.projects?.items || [];
    // Start with defaults merged with saved overrides
    const merged = defaultProjects.map(defaultProject => {
      const savedItem = savedItems.find(item => item.id === defaultProject.id);
      return savedItem ? { ...defaultProject, ...savedItem } : defaultProject;
    });
    // Add any saved items that aren't in defaults (user-created projects)
    const defaultIds = defaultProjects.map(p => p.id);
    const extras = savedItems.filter(item => !defaultIds.includes(item.id));
    return [...merged, ...extras];
  })();

  const handleImageChange = useCallback((projectId, imageDataUrl) => {
    setContent(prev => {
      const items = prev.projects?.items || defaultProjects.map(p => ({ ...p }));
      const existingIdx = items.findIndex(item => item.id === projectId);
      if (existingIdx >= 0) {
        items[existingIdx] = { ...items[existingIdx], image: imageDataUrl };
      } else {
        const defaultProject = defaultProjects.find(p => p.id === projectId);
        if (defaultProject) items.push({ ...defaultProject, image: imageDataUrl });
      }
      return { ...prev, projects: { ...prev.projects, items } };
    });
  }, [setContent]);

  const handleAddProject = useCallback(() => {
    const id = 'project-' + Date.now();
    const newProject = {
      id,
      title: 'New Project',
      category: 'Case Study',
      image: '',
      year: new Date().getFullYear().toString(),
    };
    
    setContent(prev => {
      const items = prev.projects?.items || defaultProjects.map(p => ({ ...p }));
      return { ...prev, projects: { ...prev.projects, items: [...items, newProject] } };
    });

    // Navigate to the new case study page
    setTimeout(() => navigate(`/project/${id}`), 100);
  }, [setContent, navigate]);

  const handleRemoveProject = useCallback((projectId) => {
    if (!window.confirm('Remove this project from the portfolio?')) return;
    setContent(prev => {
      const items = (prev.projects?.items || []).filter(item => item.id !== projectId);
      return { ...prev, projects: { ...prev.projects, items } };
    });
    // Also clean up saved case study data
    localStorage.removeItem(`caseStudy_${projectId}`);
    localStorage.removeItem(`caseStudy_${projectId}_minimal`);
    localStorage.removeItem(`caseStudy_${projectId}_idb`);
  }, [setContent]);

  // Only allow removal of user-created projects (not defaults)
  const defaultIds = defaultProjects.map(p => p.id);

  return (
    <section className={`projects ${editMode ? 'edit-mode-active' : ''}`} id="projects">
      <div className="projects-container">
        <motion.div
          className="projects-header"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        >
          <motion.span
            className="section-label"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {content.projects?.sectionLabel || 'Portfolio'}
          </motion.span>
          <h2 ref={titleRef} className="section-title cta-text serif highlight">
            {((content.projects?.sectionTitle) || 'Selected Projects').split(/\s+/).map((word, i) => (
              <span key={i} className="section-title-word">
                {word}{' '}
              </span>
            ))}
          </h2>
        </motion.div>
        
        <div className="projects-grid" ref={gridRef}>
          {projects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              editMode={editMode}
              onImageChange={handleImageChange}
              onRemove={!defaultIds.includes(project.id) ? handleRemoveProject : null}
            />
          ))}
          {editMode && (
            <motion.article
              className="project-card project-card--add"
              initial={{ opacity: 0, y: 48 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              onClick={handleAddProject}
            >
              <div className="add-project-content">
                <span className="add-project-icon">+</span>
                <span className="add-project-label">Add New Case Study</span>
                <span className="add-project-hint">Create a new project and build it from scratch</span>
              </div>
            </motion.article>
          )}
        </div>
      </div>
    </section>
  );
};

export default Projects;
