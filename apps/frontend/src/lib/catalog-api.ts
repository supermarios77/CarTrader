import { api } from './api-client';

/**
 * Catalog API Client
 * Handles categories, makes, and models
 */

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  order: number;
}

export interface Make {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
}

export interface Model {
  id: string;
  name: string;
  slug: string;
}

/**
 * Get all active categories
 */
export async function getCategories(): Promise<Category[]> {
  return api.get<Category[]>('/catalog/categories');
}

/**
 * Get makes for a specific category
 */
export async function getMakes(categoryId: string): Promise<Make[]> {
  const params = new URLSearchParams({ categoryId });
  return api.get<Make[]>(`/catalog/makes?${params.toString()}`);
}

/**
 * Get all makes across categories (robust helper)
 * - Tries /catalog/makes with no params (if backend supports it)
 * - Falls back to fetching categories and aggregating makes per category
 */
export async function getAllMakes(): Promise<Make[]> {
  try {
    const direct = await api.get<Make[]>('/catalog/makes');
    if (Array.isArray(direct) && direct.length) {
      // Deduplicate by slug/name in case API returns overlaps
      const byKey = new Map<string, Make>();
      for (const m of direct) {
        const key = (m.slug || m.name || '').trim().toLowerCase();
        if (!key) continue;
        if (!byKey.has(key)) byKey.set(key, m);
      }
      // Sort alphabetically by name
      return Array.from(byKey.values()).sort((a, b) =>
        a.name.localeCompare(b.name),
      );
    }
  } catch {
    // ignore; try by categories
  }
  const categories = await getCategories();
  const results: Make[] = [];
  for (const cat of categories) {
    try {
      const makes = await getMakes(cat.id);
      results.push(...makes);
    } catch {
      // ignore a single category failure
    }
  }
  // Deduplicate by slug/name (ids may differ across categories)
  const byKey = new Map<string, Make>();
  for (const m of results) {
    const key = (m.slug || m.name || '').trim().toLowerCase();
    if (!key) continue;
    if (!byKey.has(key)) byKey.set(key, m);
  }
  // Stable alphabetical sort
  return Array.from(byKey.values()).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get models for a specific make
 */
export async function getModels(makeId: string): Promise<Model[]> {
  const params = new URLSearchParams({ makeId });
  return api.get<Model[]>(`/catalog/models?${params.toString()}`);
}

/**
 * Get a single category by ID
 */
export async function getCategoryById(id: string): Promise<Category> {
  return api.get<Category>(`/catalog/categories/${id}`);
}

/**
 * Get a single make by ID
 */
export async function getMakeById(id: string): Promise<Make> {
  return api.get<Make>(`/catalog/makes/${id}`);
}

/**
 * Get a single model by ID
 */
export async function getModelById(id: string): Promise<Model> {
  return api.get<Model>(`/catalog/models/${id}`);
}

