import type { Editor } from '@tiptap/core';

/**
 * Command definition for slash command menu
 */
export interface SlashCommand {
  /** Unique identifier */
  id: string;
  /** Display title */
  title: string;
  /** Short description */
  description: string;
  /** Icon component or emoji */
  icon: string;
  /** Command category */
  category: CommandCategory;
  /** Keywords for search filtering */
  keywords?: string[];
  /** Execute the command */
  action: (editor: Editor) => void;
}

/**
 * Command categories for grouping in slash menu
 */
export type CommandCategory = 'basic' | 'lists' | 'media' | 'advanced';

/**
 * Command category metadata
 */
export interface CommandCategoryInfo {
  id: CommandCategory;
  title: string;
  order: number;
}

/**
 * Slash command extension state
 */
export interface SlashCommandState {
  /** Whether the menu is open */
  isOpen: boolean;
  /** Current query text after "/" */
  query: string;
  /** Position for the menu */
  position: { top: number; left: number } | null;
  /** Range to replace when executing command */
  range: { from: number; to: number } | null;
}

/**
 * Default slash commands configuration
 */
export const defaultSlashCommands: SlashCommand[] = [
  // Basic
  {
    id: 'paragraph',
    title: 'Text',
    description: 'Just start writing with plain text',
    icon: '📝',
    category: 'basic',
    keywords: ['text', 'paragraph', 'plain'],
    action: (editor) => editor.chain().focus().setParagraph().run(),
  },
  {
    id: 'heading1',
    title: 'Heading 1',
    description: 'Large section heading',
    icon: 'H1',
    category: 'basic',
    keywords: ['h1', 'heading', 'title', 'large'],
    action: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    id: 'heading2',
    title: 'Heading 2',
    description: 'Medium section heading',
    icon: 'H2',
    category: 'basic',
    keywords: ['h2', 'heading', 'subtitle', 'medium'],
    action: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    id: 'heading3',
    title: 'Heading 3',
    description: 'Small section heading',
    icon: 'H3',
    category: 'basic',
    keywords: ['h3', 'heading', 'small'],
    action: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    id: 'quote',
    title: 'Quote',
    description: 'Capture a quote',
    icon: '❝',
    category: 'basic',
    keywords: ['quote', 'blockquote', 'cite'],
    action: (editor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    id: 'divider',
    title: 'Divider',
    description: 'Visual divider line',
    icon: '—',
    category: 'basic',
    keywords: ['divider', 'hr', 'line', 'separator'],
    action: (editor) => editor.chain().focus().setHorizontalRule().run(),
  },
  // Lists
  {
    id: 'bulletList',
    title: 'Bullet List',
    description: 'Create a simple bullet list',
    icon: '•',
    category: 'lists',
    keywords: ['bullet', 'list', 'unordered', 'ul'],
    action: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    id: 'orderedList',
    title: 'Numbered List',
    description: 'Create a numbered list',
    icon: '1.',
    category: 'lists',
    keywords: ['numbered', 'list', 'ordered', 'ol'],
    action: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    id: 'todoList',
    title: 'To-do List',
    description: 'Track tasks with a to-do list',
    icon: '☑',
    category: 'lists',
    keywords: ['todo', 'task', 'list', 'checkbox', 'check'],
    action: (editor) => editor.chain().focus().toggleTaskList().run(),
  },
  // Media
  {
    id: 'image',
    title: 'Image',
    description: 'Upload or embed an image',
    icon: '🖼',
    category: 'media',
    keywords: ['image', 'picture', 'photo', 'img'],
    action: (editor) => {
      const url = window.prompt('Enter image URL:');
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    },
  },
  {
    id: 'codeBlock',
    title: 'Code Block',
    description: 'Add a code snippet with syntax highlighting',
    icon: '</>',
    category: 'media',
    keywords: ['code', 'block', 'snippet', 'programming'],
    action: (editor) => editor.chain().focus().toggleCodeBlock().run(),
  },
  // Advanced
  {
    id: 'table',
    title: 'Table',
    description: 'Add a table with rows and columns',
    icon: '▦',
    category: 'advanced',
    keywords: ['table', 'grid', 'rows', 'columns'],
    action: (editor) => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
  },
];

/**
 * Command categories info
 */
export const commandCategories: CommandCategoryInfo[] = [
  { id: 'basic', title: 'Basic', order: 1 },
  { id: 'lists', title: 'Lists', order: 2 },
  { id: 'media', title: 'Media', order: 3 },
  { id: 'advanced', title: 'Advanced', order: 4 },
];

/**
 * Filter commands by query
 */
export function filterCommands(commands: SlashCommand[], query: string): SlashCommand[] {
  if (!query) return commands;
  
  const lowerQuery = query.toLowerCase();
  return commands.filter((cmd) => {
    const matchesTitle = cmd.title.toLowerCase().includes(lowerQuery);
    const matchesDescription = cmd.description.toLowerCase().includes(lowerQuery);
    const matchesKeywords = cmd.keywords?.some((k) => k.toLowerCase().includes(lowerQuery));
    return matchesTitle || matchesDescription || matchesKeywords;
  });
}

/**
 * Group commands by category
 */
export function groupCommandsByCategory(commands: SlashCommand[]): Map<CommandCategory, SlashCommand[]> {
  const grouped = new Map<CommandCategory, SlashCommand[]>();
  
  for (const cmd of commands) {
    const existing = grouped.get(cmd.category) || [];
    existing.push(cmd);
    grouped.set(cmd.category, existing);
  }
  
  return grouped;
}
