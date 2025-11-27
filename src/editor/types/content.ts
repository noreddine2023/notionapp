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
 * Sample document for testing - Legend of X
 */
export const sampleDocument: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'Legend Of X' }],
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [
        { type: 'text', text: 'Chapter 1: ' },
        { type: 'text', marks: [{ type: 'highlight', attrs: { color: '#bfdbfe' } }], text: 'Awakening' },
      ],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Lorem ipsum dolor sit amet consectetur. In lorem varius non arcu eget. Odio odio placerat sit enim pretium sed risus vitae. Velit egestas montes convallis cras venenatis suspendisse consequat sit. Tristique et a cras risus lorem nunc leo. Non lorem viverra vitae lectus malesuada cursus. Aenean consequat congue ullamcorper vitae in cras eget placerat et.' },
      ],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Facilisis fames commodo enim vivamus cursus eget eu. Tristique platea duis et tristique ultrices dui diam nunc. Mauris elementum sem lacus viverra suspendisse. Amet blandit egestas urna quis cursus velit ut. Quis fermentum tristique ultrices eleifend tincidunt et. Volutpat elementum hendrerit faucibus lectus orci in tortor amet. Nisi convallis tortor in sed. Fermentum et quisque elit imperdiet id.' },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 3 },
      content: [{ type: 'text', text: 'Part 1: Androids' }],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Lorem ipsum dolor sit amet consectetur. At feugiat ac placerat habitant nec sed ultrices. Rutrum massa ipsum bibendum ac at feugiat felis ante. Purus leo volutpat nulla ut faucibus duis at purus. Sed pretium ut at enim.' },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 3 },
      content: [{ type: 'text', text: 'Part 2: Electric Sheeps' }],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Lorem ipsum dolor sit amet consectetur. At feugiat ac placerat habitant nec sed ultrices. Rutrum massa ipsum bibendum ac at feugiat felis ante. Purus leo volutpat nulla ut faucibus duis at purus. Sed pretium ut at enim.' },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 3 },
      content: [{ type: 'text', text: 'Part 3: Encounter' }],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Try typing ' },
        { type: 'text', marks: [{ type: 'code' }], text: '/' },
        { type: 'text', text: ' to see available commands, or drag blocks to reorder them!' },
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
