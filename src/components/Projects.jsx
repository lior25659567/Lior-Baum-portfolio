import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEdit } from '../context/EditContext';
import './Projects.css';

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

const ProjectCard = ({ project, index }) => {
  return (
    <motion.article
      className="project-card"
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <Link to={`/project/${project.id}`} className="project-link">
        <div className="project-image-wrapper">
          <div
            className="project-image"
            style={{ backgroundImage: `url(${project.image})` }}
          />
        </div>
        
        <div className="project-info">
          <h3 className="project-title">{project.title}</h3>
          <div className="project-meta">
            <span className="project-category">{project.category}</span>
            <span className="project-year">{project.year}</span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
};

const Projects = () => {
  const { content, editMode } = useEdit();
  
  // Always use defaultProjects as base, merge with saved content by ID if available
  const projects = defaultProjects.map(defaultProject => {
    const savedItem = content.projects?.items?.find(item => item.id === defaultProject.id);
    return savedItem ? { ...defaultProject, ...savedItem } : defaultProject;
  });

  return (
    <section className={`projects ${editMode ? 'edit-mode-active' : ''}`} id="projects">
      <div className="projects-container">
        <motion.div
          className="projects-header"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-label">{content.projects?.sectionLabel || 'Portfolio'}</span>
          <h2 className="section-title serif">
            {content.projects?.sectionTitle || 'Selected Projects'}
          </h2>
        </motion.div>
        
        <div className="projects-grid">
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
