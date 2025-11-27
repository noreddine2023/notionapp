import { Extension } from '@tiptap/core';
import type { Editor, EditorOptions } from '@tiptap/core';

// Note: This file provides the architecture for Yjs collaboration
// Actual Yjs dependencies would need to be installed:
// - yjs
// - y-prosemirror
// - y-webrtc or y-websocket

export interface CollaborationOptions {
  /** Document identifier for collaboration */
  documentId: string;
  /** User information */
  user: CollaborationUser;
  /** Collaboration provider type */
  provider: 'webrtc' | 'websocket';
  /** WebSocket URL (for websocket provider) */
  websocketUrl?: string;
  /** WebRTC signaling server URLs */
  signalingServers?: string[];
  /** Callback when users change */
  onUsersChange?: (users: CollaborationUser[]) => void;
}

export interface CollaborationUser {
  id: string;
  name: string;
  color: string;
  avatar?: string;
}

/**
 * Placeholder extension for collaboration setup
 * This provides the architecture without the actual Yjs dependencies
 */
export const CollaborationPlaceholder = Extension.create({
  name: 'collaborationPlaceholder',

  addStorage() {
    return {
      users: [] as CollaborationUser[],
      provider: null as unknown,
      ydoc: null as unknown,
    };
  },
});

/**
 * Create collaboration extensions (Yjs integration)
 * This is a factory function that would set up Yjs collaboration
 * 
 * Usage (when Yjs is installed):
 * ```ts
 * import * as Y from 'yjs';
 * import { WebsocketProvider } from 'y-websocket';
 * import { WebrtcProvider } from 'y-webrtc';
 * import Collaboration from '@tiptap/extension-collaboration';
 * import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
 * 
 * const extensions = createCollaborationExtensions({
 *   documentId: 'my-doc',
 *   user: { id: '1', name: 'John', color: '#ff0000' },
 *   provider: 'websocket',
 *   websocketUrl: 'ws://localhost:1234',
 * });
 * ```
 */
export function createCollaborationExtensions(options: CollaborationOptions): Extension[] {
  const {
    documentId,
    user,
    provider,
    websocketUrl,
    signalingServers,
    onUsersChange,
  } = options;

  // This is a placeholder implementation
  // Real implementation would look like:
  /*
  const ydoc = new Y.Doc();
  
  let providerInstance;
  if (provider === 'websocket' && websocketUrl) {
    providerInstance = new WebsocketProvider(websocketUrl, documentId, ydoc);
  } else if (provider === 'webrtc') {
    providerInstance = new WebrtcProvider(documentId, ydoc, {
      signaling: signalingServers || ['ws://localhost:4444'],
    });
  }

  return [
    Collaboration.configure({
      document: ydoc,
    }),
    CollaborationCursor.configure({
      provider: providerInstance,
      user: {
        name: user.name,
        color: user.color,
      },
    }),
  ];
  */

  // Return placeholder extension for now
  console.log('Collaboration setup placeholder:', {
    documentId,
    user,
    provider,
    websocketUrl,
    signalingServers,
  });

  return [CollaborationPlaceholder];
}

/**
 * Configuration for collaboration cursor colors
 */
export const cursorColors = [
  '#958DF1', // Purple
  '#F98181', // Red
  '#FBBC88', // Orange
  '#FAF594', // Yellow
  '#70CFF8', // Blue
  '#94FADB', // Teal
  '#B9F18D', // Green
  '#C9B1FF', // Lavender
];

/**
 * Get a random cursor color
 */
export function getRandomCursorColor(): string {
  return cursorColors[Math.floor(Math.random() * cursorColors.length)];
}

/**
 * Get cursor color by user ID (consistent color for same user)
 */
export function getCursorColorByUserId(userId: string): string {
  // Simple hash function to get consistent color
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return cursorColors[Math.abs(hash) % cursorColors.length];
}

/**
 * Types for collaboration awareness
 */
export interface AwarenessState {
  user: CollaborationUser;
  cursor?: {
    anchor: number;
    head: number;
  };
  selection?: {
    from: number;
    to: number;
  };
}

/**
 * Collaboration status
 */
export type CollaborationStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

/**
 * Collaboration state
 */
export interface CollaborationState {
  status: CollaborationStatus;
  users: CollaborationUser[];
  error?: Error;
}
