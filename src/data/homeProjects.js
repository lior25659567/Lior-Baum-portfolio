// The home grid's project list — the default (fallback) projects and the merge
// that turns saved content into the ordered list Projects.jsx renders. Lives
// outside the component file so other surfaces (the case-study article) can
// derive facts about a study's home card — e.g. its gradient tone — from the
// exact same list, without importing the Projects component.

// Default projects - used as fallback
export const defaultProjects = [
  {
    id: 'project-1780418394707',
    title: 'ResponsiveView Extension',
    category: 'Developer Tools · Education',
    image: '',
    year: '2026',
    tag: 'work',
    mediaMode: 'template',
  },
  {
    id: 'align-technology',
    title: 'iTero Toolbar',
    category: 'UI Unification & Efficiency',
    image: '/case-studies/align/slide-1.webp',
    year: '2024',
    tag: 'work',
    mediaMode: 'template',
  },
  {
    id: 'itero-scan-workflow',
    title: 'iTero Scan Experience',
    category: 'Clinical Workflow Redesign',
    image: '',
    year: '2024',
    tag: 'work',
    mediaMode: 'template',
  },
  {
    id: 'wizecare',
    title: 'WizeCare',
    category: 'B2B Complex System',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop',
    year: '2023',
    tag: 'work',
    mediaMode: 'template',
  },
];

// The home grid's project list: saved items (in saved order) merged over the
// defaults, minus removedIds. In edit mode the "Template Demo" card is appended.
export const mergeHomeProjects = (content, editMode = false) => {
  const savedItems = content?.projects?.items || [];
  const removedIds = content?.projects?.removedIds || [];

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
      mediaMode: 'template',
    });
  }
  return all;
};

// Gradient tone (0–4) of a study's card as a visitor sees it on the home grid:
// its index among the non-hidden projects % 5 — the same formula ProjectCard
// uses for data-card-tone. null when the study has no home card.
export const getHomeCardTone = (content, projectId) => {
  const visible = mergeHomeProjects(content, false).filter(p => !p.hidden);
  const i = visible.findIndex(p => p.id === projectId);
  return i < 0 ? null : i % 5;
};
