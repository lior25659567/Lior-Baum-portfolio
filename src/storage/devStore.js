import Dexie from 'dexie';

const db = new Dexie('PortfolioDev');

db.version(1).stores({
  keyval: 'key',
  caseStudies: 'id',
});

/**
 * Save a value by key.
 */
export async function saveData(key, value) {
  try {
    await db.keyval.put({ key, value, updatedAt: Date.now() });
    return true;
  } catch (e) {
    console.warn('[devStore] saveData failed, falling back to localStorage:', e);
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (lsErr) {
      console.warn('[devStore] localStorage fallback also failed:', lsErr);
      return false;
    }
  }
}

/**
 * Retrieve a value by key.
 */
export async function getData(key) {
  try {
    const row = await db.keyval.get(key);
    if (row?.value != null) return row.value;
  } catch (e) {
    console.warn('[devStore] getData failed, falling back to localStorage:', e);
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
  try {
    await db.keyval.delete(key);
  } catch (e) {
    console.warn('[devStore] deleteData failed:', e);
  }
  try {
    localStorage.removeItem(key);
  } catch {}
  return true;
}

/**
 * Clear all stored data (both tables + localStorage keys managed by this app).
 */
export async function clearAll() {
  try {
    await db.keyval.clear();
    await db.caseStudies.clear();
  } catch (e) {
    console.warn('[devStore] clearAll IndexedDB failed:', e);
  }
  return true;
}

/**
 * Case-study specific helpers — used by caseStudyData.js
 */
export async function saveCaseStudy(projectId, data) {
  try {
    await db.caseStudies.put({ id: projectId, data, updatedAt: Date.now() });
    return true;
  } catch (e) {
    console.warn('[devStore] saveCaseStudy failed:', e);
    return false;
  }
}

export async function getCaseStudy(projectId) {
  try {
    const row = await db.caseStudies.get(projectId);
    return row?.data ?? null;
  } catch (e) {
    console.warn('[devStore] getCaseStudy failed:', e);
    return null;
  }
}

/**
 * List all case studies stored in IndexedDB. Returns { id, slideCount, updatedAt }[].
 */
export async function listCaseStudies() {
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

export async function deleteCaseStudy(projectId) {
  try {
    await db.caseStudies.delete(projectId);
    return true;
  } catch (e) {
    console.warn('[devStore] deleteCaseStudy failed:', e);
    return false;
  }
}

export { db };
