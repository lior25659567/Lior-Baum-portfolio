import { Link, useNavigate } from 'react-router-dom';
import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEdit } from '../context/EditContext';
import './Projects.css';

// Add scheme to bare URLs so `google.com` works as an external link.
const normalizeExternalUrl = (u) => {
  if (!u || typeof u !== 'string') return '';
  const trimmed = u.trim();
  if (!trimmed) return '';
  if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith('mailto:') || trimmed.startsWith('tel:')) return trimmed;
  return `https://${trimmed}`;
};

gsap.registerPlugin(ScrollTrigger);

const PROJECT_TAGS = [
  { id: 'all', label: 'All' },
  { id: 'work', label: 'Work' },
  { id: 'personal', label: 'Personal' },
];

// Default projects - used as fallback
const defaultProjects = [
  {
    id: 'align-technology',
    title: 'iTero Toolbar',
    category: 'UI Unification & Efficiency',
    image: '/case-studies/align/slide-1.png',
    year: '2024',
    tag: 'work',
  },
  {
    id: 'itero-scan-workflow',
    title: 'iTero Scan Experience',
    category: 'Clinical Workflow Redesign',
    image: '',
    year: '2024',
    tag: 'work',
  },
  {
    id: 'wizecare',
    title: 'WizeCare',
    category: 'B2B Complex System',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop',
    year: '2023',
    tag: 'work',
  },
];

const ProjectCard = ({ project, index, total, editMode, onImageChange, onRemove, onUpdate, onMoveUp, onMoveDown }) => {
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

  const externalUrl = normalizeExternalUrl(project.url);

  return (
    <article className="project-card work-grid-project">
      {externalUrl ? (
        <a
          href={externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="project-link"
          aria-label={project.title}
        />
      ) : (
        <Link to={`/project/${project.id}`} className="project-link" aria-label={project.title} />
      )}

      {/* Image area */}
      <div className="project-media">
        <div className="project-image-wrapper media-wrapper">
          <div className="project-image media-inner" style={{ backgroundImage: project.image ? `url(${project.image})` : undefined }} />
          {!project.image && <div className="project-image-placeholder" />}
        </div>

        {/* Edit overlay scoped to image only */}
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
      </div>

      {/* Title always visible below the image */}
      <div className="project-content">
        {editMode ? (
          <>
            <h3 className="project-content-title">
              <input
                className="project-inline-edit"
                value={project.title || ''}
                onChange={(e) => onUpdate(project.id, { title: e.target.value })}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                placeholder="Project Title"
              />
            </h3>
            <p className="project-content-meta">
              <span className="project-content-category">
                <input
                  className="project-inline-edit project-inline-edit--small"
                  value={project.category || ''}
                  onChange={(e) => onUpdate(project.id, { category: e.target.value })}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  placeholder="Category"
                />
              </span>
              <span className="project-content-year">
                <input
                  className="project-inline-edit project-inline-edit--small"
                  value={project.year || ''}
                  onChange={(e) => onUpdate(project.id, { year: e.target.value })}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  placeholder="Year"
                  style={{ textAlign: 'right', width: '4rem' }}
                />
              </span>
            </p>
          </>
        ) : (
          <>
            <h3 className="project-content-title">{project.title}</h3>
            <p className="project-content-meta">
              <span className="project-content-category">{project.category}</span>
              <span className="project-content-year">{project.year}</span>
            </p>
          </>
        )}
      </div>

      {editMode && (
        <div className="project-edit-controls">
          <input
            type="text"
            className="project-inline-edit project-url-input"
            value={project.url || ''}
            onChange={(e) => onUpdate(project.id, { url: e.target.value })}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            placeholder="External URL (leave empty to link to case study)"
            title="If set, clicking the card opens this URL in a new tab instead of the case study"
          />
          <div className="project-tag-selector">
            {PROJECT_TAGS.filter(t => t.id !== 'all').map(t => (
              <button
                key={t.id}
                className={`project-tag-btn ${(project.tag || 'work') === t.id ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onUpdate(project.id, { tag: t.id }); }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="project-reorder-controls">
            <button
              className="project-reorder-btn"
              disabled={index === 0}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onMoveUp(index); }}
              title="Move up"
            >&#8593;</button>
            <button
              className="project-reorder-btn"
              disabled={index === total - 1}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onMoveDown(index); }}
              title="Move down"
            >&#8595;</button>
          </div>
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
  const [activeFilter, setActiveFilter] = useState('all');

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

  // Merge default projects with saved content, respecting saved order
  const projects = (() => {
    const savedItems = content.projects?.items || [];
    const removedIds = content.projects?.removedIds || [];

    let all;
    if (savedItems.length > 0) {
      // Saved items define the order — merge defaults into them
      const savedIds = savedItems.map(p => p.id);
      all = savedItems
        .filter(p => !removedIds.includes(p.id))
        .map(saved => {
          const def = defaultProjects.find(d => d.id === saved.id);
          return def ? { ...def, ...saved } : saved;
        });
      // Append any defaults not yet in saved items (newly added defaults)
      defaultProjects.forEach(def => {
        if (!savedIds.includes(def.id) && !removedIds.includes(def.id)) {
          all.push(def);
        }
      });
    } else {
      // No saved items — use default order
      all = defaultProjects.filter(p => !removedIds.includes(p.id));
    }

    // In edit mode, add the template demo project if not already present
    if (editMode && !all.some(p => p.id === 'template-demo')) {
      all.push({
        id: 'template-demo',
        title: 'Template Demo',
        category: 'Template Reference',
        image: '',
        year: '2025',
      });
    }
    return all;
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
      tag: 'work',
    };
    
    setContent(prev => {
      const items = prev.projects?.items || defaultProjects.map(p => ({ ...p }));
      return { ...prev, projects: { ...prev.projects, items: [...items, newProject] } };
    });

    // Navigate to the new case study page
    setTimeout(() => navigate(`/project/${id}`), 100);
  }, [setContent, navigate]);

  const handleUpdateProject = useCallback((projectId, updates) => {
    setContent(prev => {
      const items = (prev.projects?.items || defaultProjects.map(p => ({ ...p }))).map(item =>
        item.id === projectId ? { ...item, ...updates } : item
      );
      // If not found in items (default project not yet saved), add it
      if (!items.find(item => item.id === projectId)) {
        const defaultProject = defaultProjects.find(p => p.id === projectId);
        if (defaultProject) items.push({ ...defaultProject, ...updates });
      }
      return { ...prev, projects: { ...prev.projects, items } };
    });
  }, [setContent]);

  const handleRemoveProject = useCallback((projectId) => {
    if (!window.confirm('Remove this project from the portfolio?')) return;
    setContent(prev => {
      const items = (prev.projects?.items || []).filter(item => item.id !== projectId);
      const removedIds = [...(prev.projects?.removedIds || [])];
      if (!removedIds.includes(projectId)) removedIds.push(projectId);
      return { ...prev, projects: { ...prev.projects, items, removedIds } };
    });
    // Also clean up saved case study data
    localStorage.removeItem(`caseStudy_${projectId}`);
    localStorage.removeItem(`caseStudy_${projectId}_minimal`);
    localStorage.removeItem(`caseStudy_${projectId}_idb`);
    // Delete from source files (dev only)
    fetch('/api/delete-case-study', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId }),
    }).catch(() => {}); // silently fail in production
  }, [setContent]);

  // Only allow removal of user-created projects (not defaults)
  const defaultIds = defaultProjects.map(p => p.id);

  // Filter projects by active tag
  const filteredProjects = activeFilter === 'all'
    ? projects
    : projects.filter(p => (p.tag || 'work') === activeFilter);

  const handleMoveUp = useCallback((filteredIdx) => {
    if (filteredIdx <= 0) return;
    const projectId = filteredProjects[filteredIdx]?.id;
    const prevProjectId = filteredProjects[filteredIdx - 1]?.id;
    if (!projectId || !prevProjectId) return;
    setContent(prev => {
      // Use the full merged projects list as source of truth for order
      const items = [...(prev.projects?.items?.length ? prev.projects.items : projects.map(p => ({ ...p })))];
      const idxA = items.findIndex(p => p.id === prevProjectId);
      const idxB = items.findIndex(p => p.id === projectId);
      if (idxA < 0 || idxB < 0) return prev;
      [items[idxA], items[idxB]] = [items[idxB], items[idxA]];
      return { ...prev, projects: { ...prev.projects, items } };
    });
  }, [setContent, filteredProjects, projects]);

  const handleMoveDown = useCallback((filteredIdx) => {
    if (filteredIdx >= filteredProjects.length - 1) return;
    const projectId = filteredProjects[filteredIdx]?.id;
    const nextProjectId = filteredProjects[filteredIdx + 1]?.id;
    if (!projectId || !nextProjectId) return;
    setContent(prev => {
      const items = [...(prev.projects?.items?.length ? prev.projects.items : projects.map(p => ({ ...p })))];
      const idxA = items.findIndex(p => p.id === projectId);
      const idxB = items.findIndex(p => p.id === nextProjectId);
      if (idxA < 0 || idxB < 0) return prev;
      [items[idxA], items[idxB]] = [items[idxB], items[idxA]];
      return { ...prev, projects: { ...prev.projects, items } };
    });
  }, [setContent, filteredProjects, projects]);

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

        <div className="projects-filter-bar">
          {PROJECT_TAGS.map(tag => (
            <button
              key={tag.id}
              className={`projects-filter-chip ${activeFilter === tag.id ? 'active' : ''}`}
              onClick={() => setActiveFilter(tag.id)}
            >
              {tag.label}
            </button>
          ))}
        </div>

        <div className="projects-grid" ref={gridRef}>
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                <ProjectCard
                  project={project}
                  index={index}
                  total={filteredProjects.length}
                  editMode={editMode}
                  onImageChange={handleImageChange}
                  onUpdate={handleUpdateProject}
                  onRemove={handleRemoveProject}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          {editMode && (
            <motion.article
              className="project-card project-card--add"
              layout
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
