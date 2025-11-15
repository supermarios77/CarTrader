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
  return api.get<Make[]>(`/catalog/makes?categoryId=${categoryId}`);
}

/**
 * Get models for a specific make
 */
export async function getModels(makeId: string): Promise<Model[]> {
  return api.get<Model[]>(`/catalog/models?makeId=${makeId}`);
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

