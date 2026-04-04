// Auto-sync utility: introspects slideTemplates at runtime to derive field info
// This ensures documentation stays in sync when templates are added or modified.

import { slideTemplates, templateCategories } from './caseStudyData';
import { slideTemplateDocs } from './slideTemplateDocs';

/**
 * Classify a template field by its JS type and semantic role.
 * Uses key-name heuristics + value inspection.
 */
function classifyField(key, value) {
  if (value === null || value === undefined) {
    return { jsType: 'null', semantic: 'unknown', itemShape: null };
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return { jsType: 'array', semantic: 'empty-array', itemShape: null };
    }
    const first = value[0];
    if (typeof first === 'string') {
      return { jsType: 'array', semantic: 'string-list', itemShape: 'string' };
    }
    if (typeof first === 'object' && first !== null) {
      return { jsType: 'array', semantic: 'object-list', itemShape: Object.keys(first) };
    }
    return { jsType: 'array', semantic: 'mixed', itemShape: typeof first };
  }

  if (typeof value === 'object') {
    return { jsType: 'object', semantic: 'nested', shape: Object.keys(value) };
  }

  if (typeof value === 'number') {
    return {
      jsType: 'number',
      semantic: key.toLowerCase().includes('ratio') ? 'ratio'
        : key.toLowerCase().includes('column') ? 'grid-columns'
        : 'numeric',
    };
  }

  if (typeof value === 'boolean') {
    return { jsType: 'boolean', semantic: 'toggle' };
  }

  if (typeof value === 'string') {
    const lk = key.toLowerCase();
    if (lk.includes('image') || lk.includes('logo') || lk === 'src') {
      return { jsType: 'string', semantic: 'image-url' };
    }
    if (lk.includes('url') || lk.includes('link')) {
      return { jsType: 'string', semantic: 'url' };
    }
    if (lk.includes('color')) {
      return { jsType: 'string', semantic: 'color' };
    }
    return { jsType: 'string', semantic: 'text' };
  }

  return { jsType: typeof value, semantic: 'unknown' };
}

/**
 * Format a default value for display (truncate long strings, summarise arrays/objects).
 */
function formatDefault(value) {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'string') {
    if (value === '') return '""  (empty)';
    return value.length > 60 ? `"${value.slice(0, 57)}..."` : `"${value}"`;
  }
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]  (empty array)';
    return `Array[${value.length}]`;
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value);
    return `{ ${keys.join(', ')} }`;
  }
  return String(value);
}

/**
 * Build reverse category lookup: template key -> category name.
 */
function buildCategoryMap() {
  const map = {};
  for (const [cat, keys] of Object.entries(templateCategories)) {
    for (const k of keys) map[k] = cat;
  }
  return map;
}

/**
 * Known block types for the `dynamic` template.
 * Kept here so the docs page can display them.
 */
export const dynamicBlockTypes = [
  {
    type: 'label',
    description: 'Section label (small uppercase text above the title)',
    fields: [{ name: 'value', type: 'string', note: 'The label text' }],
  },
  {
    type: 'title',
    description: 'Main headline. Supports line breaks with Shift+Enter.',
    fields: [{ name: 'value', type: 'string', note: 'Title text (supports \\n)' }],
  },
  {
    type: 'subtitle',
    description: 'Secondary headline below the title.',
    fields: [{ name: 'value', type: 'string', note: 'Subtitle text' }],
  },
  {
    type: 'paragraph',
    description: 'Body text paragraph. Supports multiline content.',
    fields: [{ name: 'value', type: 'string', note: 'Paragraph text (multiline)' }],
  },
  {
    type: 'bullets',
    description: 'Bullet list with optional section title and per-bullet titles.',
    fields: [
      { name: 'items', type: 'string[]', note: 'Array of bullet strings' },
      { name: 'title', type: 'string', note: 'Optional section title above bullets' },
    ],
  },
  {
    type: 'image',
    description: 'Image gallery block. Supports multiple images with captions.',
    fields: [
      { name: 'images', type: 'array', note: 'Array of { src, caption, fit, position }' },
      { name: 'gridColumns', type: 'number', note: 'Number of columns (1-4)' },
    ],
  },
  {
    type: 'stats',
    description: 'Statistics grid with large values and labels.',
    fields: [
      { name: 'items', type: 'array', note: 'Array of { value, label, suffix }' },
      { name: 'gridColumns', type: 'number', note: 'Number of columns (1-4)' },
    ],
  },
  {
    type: 'quote',
    description: 'Quote cards with text and author.',
    fields: [
      { name: 'items', type: 'array', note: 'Array of { text, author }' },
      { name: 'gridColumns', type: 'number', note: 'Number of columns (1-4)' },
    ],
  },
  {
    type: 'divider',
    description: 'Horizontal divider line between blocks.',
    fields: [],
  },
  {
    type: 'cta',
    description: 'Call-to-action button.',
    fields: [
      { name: 'text', type: 'string', note: 'Button label' },
      { name: 'link', type: 'string', note: 'Button URL' },
      { name: 'variant', type: 'string', note: '"primary" or "outline"' },
    ],
  },
];

/**
 * Build full documentation data for every template.
 * Combines auto-derived field info with human-authored docs.
 */
export function buildTemplateDocumentation() {
  const allKeys = Object.keys(slideTemplates);
  const categoryMap = buildCategoryMap();

  return allKeys.map((key) => {
    const template = slideTemplates[key];
    const docs = slideTemplateDocs[key] || null;

    // Auto-derive field inventory (skip internal 'type' field)
    const fields = {};
    for (const [fieldKey, fieldValue] of Object.entries(template)) {
      if (fieldKey === 'type') continue;
      fields[fieldKey] = {
        ...classifyField(fieldKey, fieldValue),
        defaultValue: fieldValue,
        defaultDisplay: formatDefault(fieldValue),
      };
    }

    return {
      key,
      type: template.type,
      category: categoryMap[key] || docs?.category || 'Uncategorized',
      fields,
      fieldCount: Object.keys(fields).length,
      hasDocumentation: !!docs,
      docs,
    };
  });
}

/**
 * Return template keys that exist in slideTemplates but have no entry in slideTemplateDocs.
 */
export function getUndocumentedTemplates() {
  return Object.keys(slideTemplates).filter((k) => !slideTemplateDocs[k]);
}
