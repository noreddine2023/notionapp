import type { JSONContent } from '@tiptap/core';

/**
 * Content format types supported by the editor
 */
export type ContentFormat = 'json' | 'html' | 'markdown' | 'text';

/**
 * Export options for content conversion
 */
export interface ExportOptions {
  /** Include document metadata */
  includeMetadata?: boolean;
  /** Pretty print output */
  prettyPrint?: boolean;
}

/**
 * Import options for content conversion
 */
export interface ImportOptions {
  /** Source format of the content */
  format: ContentFormat;
  /** Preserve unknown attributes */
  preserveUnknown?: boolean;
}

/**
 * Default empty document content
 */
export const emptyDocument: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
    },
  ],
};

/**
 * Sample document for testing
 */
export const sampleDocument: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'Welcome to the Editor' }],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'This is a ' },
        { type: 'text', marks: [{ type: 'bold' }], text: 'rich text editor' },
        { type: 'text', text: ' powered by ' },
        { type: 'text', marks: [{ type: 'italic' }], text: 'Tiptap' },
        { type: 'text', text: '.' },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Features' }],
    },
    {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Block-based editing with drag and drop' }],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Slash commands for quick insertion' }],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Rich formatting toolbar' }],
            },
          ],
        },
      ],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Try typing ' },
        { type: 'text', marks: [{ type: 'code' }], text: '/' },
        { type: 'text', text: ' to see available commands!' },
      ],
    },
  ],
};

/**
 * Validate JSON content structure
 */
export function isValidJSONContent(content: unknown): content is JSONContent {
  if (typeof content !== 'object' || content === null) {
    return false;
  }
  
  const obj = content as Record<string, unknown>;
  
  if (typeof obj.type !== 'string') {
    return false;
  }
  
  if (obj.content !== undefined && !Array.isArray(obj.content)) {
    return false;
  }
  
  return true;
}

/**
 * Get text content from JSON (simple extraction)
 */
export function getTextFromJSON(content: JSONContent): string {
  const texts: string[] = [];
  
  function traverse(node: JSONContent): void {
    if (node.text) {
      texts.push(node.text);
    }
    if (node.content) {
      for (const child of node.content) {
        traverse(child);
      }
    }
  }
  
  traverse(content);
  return texts.join(' ');
}

/**
 * Count words in JSON content
 */
export function countWords(content: JSONContent): number {
  const text = getTextFromJSON(content);
  return text.split(/\s+/).filter((word) => word.length > 0).length;
}

/**
 * Count characters in JSON content
 */
export function countCharacters(content: JSONContent): number {
  const text = getTextFromJSON(content);
  return text.length;
}
