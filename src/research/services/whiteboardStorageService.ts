/**
 * Whiteboard Storage Service using IndexedDB
 * Stores whiteboard state for research projects
 */

import { openDB, IDBPDatabase } from 'idb';
import type { WhiteboardState } from '../types/paper';

const DB_NAME = 'research-whiteboard-storage';
const DB_VERSION = 1;
const WHITEBOARD_STORE = 'whiteboards';

type WhiteboardDB = {
  [WHITEBOARD_STORE]: {
    key: string;
    value: WhiteboardState;
    indexes: { 'by-project': string; 'by-date': Date };
  };
};

let dbPromise: Promise<IDBPDatabase<WhiteboardDB>> | null = null;

/**
 * Initialize and get database connection
 */
async function getDB(): Promise<IDBPDatabase<WhiteboardDB>> {
  if (!dbPromise) {
    dbPromise = openDB<WhiteboardDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(WHITEBOARD_STORE)) {
          const store = db.createObjectStore(WHITEBOARD_STORE, { keyPath: 'id' });
          store.createIndex('by-project', 'projectId');
          store.createIndex('by-date', 'updatedAt');
        }
      },
    });
  }
  return dbPromise;
}

/**
 * Whiteboard Storage Service
 */
export const whiteboardStorageService = {
  /**
   * Save whiteboard state
   */
  async saveWhiteboard(state: WhiteboardState): Promise<WhiteboardState> {
    const db = await getDB();
    const updatedState = {
      ...state,
      updatedAt: new Date(),
    };
    await db.put(WHITEBOARD_STORE, updatedState);
    return updatedState;
  },

  /**
   * Get whiteboard by ID
   */
  async getWhiteboard(id: string): Promise<WhiteboardState | undefined> {
    const db = await getDB();
    return db.get(WHITEBOARD_STORE, id);
  },

  /**
   * Get whiteboard by project ID
   */
  async getWhiteboardByProject(projectId: string): Promise<WhiteboardState | undefined> {
    const db = await getDB();
    const tx = db.transaction(WHITEBOARD_STORE, 'readonly');
    const index = tx.store.index('by-project');
    return index.get(projectId);
  },

  /**
   * Create a new whiteboard for a project
   */
  async createWhiteboard(projectId: string): Promise<WhiteboardState> {
    const db = await getDB();
    const id = `wb_${projectId}_${Date.now()}`;
    const now = new Date();
    
    const whiteboard: WhiteboardState = {
      id,
      projectId,
      nodes: [],
      edges: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      createdAt: now,
      updatedAt: now,
    };
    
    await db.put(WHITEBOARD_STORE, whiteboard);
    return whiteboard;
  },

  /**
   * Get or create whiteboard for a project
   */
  async getOrCreateWhiteboard(projectId: string): Promise<WhiteboardState> {
    const existing = await this.getWhiteboardByProject(projectId);
    if (existing) {
      return existing;
    }
    return this.createWhiteboard(projectId);
  },

  /**
   * Delete whiteboard
   */
  async deleteWhiteboard(id: string): Promise<void> {
    const db = await getDB();
    await db.delete(WHITEBOARD_STORE, id);
  },

  /**
   * Delete whiteboards for a project
   */
  async deleteWhiteboardsByProject(projectId: string): Promise<void> {
    const db = await getDB();
    const tx = db.transaction(WHITEBOARD_STORE, 'readwrite');
    const index = tx.store.index('by-project');
    
    let cursor = await index.openCursor(IDBKeyRange.only(projectId));
    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }
    
    await tx.done;
  },

  /**
   * Get all whiteboards (for debugging/admin)
   */
  async getAllWhiteboards(): Promise<WhiteboardState[]> {
    const db = await getDB();
    return db.getAll(WHITEBOARD_STORE);
  },
};
