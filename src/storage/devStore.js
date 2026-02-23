import Dexie from 'dexie';

const IS_DEV = import.meta.env.DEV;

const db = new Dexie('PortfolioDev');

db.version(1).stores({
  keyval: 'key',
  caseStudies: 'id',
});

/**
 * Save a value by key. In production, falls back to localStorage.
 */
export async function saveData(key, value) {
  if (IS_DEV) {
    try {
      await db.keyval.put({ key, value, updatedAt: Date.now() });
      return true;
    } catch (e) {
      console.warn('[devStore] saveData failed:', e);
      return false;
    }
  }
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.warn('[devStore] localStorage fallback failed:', e);
    return false;
  }
}

/**
 * Retrieve a value by key. In production, falls back to localStorage.
 */
export async function getData(key) {
  if (IS_DEV) {
    try {
      const row = await db.keyval.get(key);
      return row?.value ?? null;
    } catch (e) {
      console.warn('[devStore] getData failed:', e);
      return null;
    }
  }
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn('[devStore] localStorage fallback failed:', e);
    return null;
  }
}

/**
 * Delete a value by key.
 */
export async function deleteData(key) {
  if (IS_DEV) {
    try {
      await db.keyval.delete(key);
      return true;
    } catch (e) {
      console.warn('[devStore] deleteData failed:', e);
      return false;
    }
  }
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

/**
 * Clear all dev-store data (both tables).
 */
export async function clearAll() {
  if (IS_DEV) {
    try {
      await db.keyval.clear();
      await db.caseStudies.clear();
      return true;
    } catch (e) {
      console.warn('[devStore] clearAll failed:', e);
      return false;
    }
  }
  return false;
}

/**
 * Case-study specific helpers — used by caseStudyData.js
 */
export async function saveCaseStudy(projectId, data) {
  if (IS_DEV) {
    try {
      await db.caseStudies.put({ id: projectId, data, updatedAt: Date.now() });
      return true;
    } catch (e) {
      console.warn('[devStore] saveCaseStudy failed:', e);
      return false;
    }
  }
  return false;
}

export async function getCaseStudy(projectId) {
  if (IS_DEV) {
    try {
      const row = await db.caseStudies.get(projectId);
      return row?.data ?? null;
    } catch (e) {
      console.warn('[devStore] getCaseStudy failed:', e);
      return null;
    }
  }
  return null;
}

/**
 * List all case studies stored in IndexedDB (dev only). Returns { id, slideCount, updatedAt }[].
 */
export async function listCaseStudies() {
  if (IS_DEV) {
    try {
      const rows = await db.caseStudies.toArray();
      return rows.map((row) => ({
        id: row.id,
        slideCount: row.data?.slides?.length ?? 0,
        updatedAt: row.updatedAt,
      }));
    } catch (e) {
      console.warn('[devStore] listCaseStudies failed:', e);
      return [];
    }
  }
  return [];
}

export async function deleteCaseStudy(projectId) {
  if (IS_DEV) {
    try {
      await db.caseStudies.delete(projectId);
      return true;
    } catch (e) {
      console.warn('[devStore] deleteCaseStudy failed:', e);
      return false;
    }
  }
  return false;
}

export { db };
