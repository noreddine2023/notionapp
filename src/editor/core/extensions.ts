import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import HardBreak from '@tiptap/extension-hard-break';
import History from '@tiptap/extension-history';
import Dropcursor from '@tiptap/extension-dropcursor';
import Gapcursor from '@tiptap/extension-gapcursor';
import Typography from '@tiptap/extension-typography';
import Placeholder from '@tiptap/extension-placeholder';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import Code from '@tiptap/extension-code';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Heading from '@tiptap/extension-heading';
import TextAlign from '@tiptap/extension-text-align';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Blockquote from '@tiptap/extension-blockquote';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Image from '@tiptap/extension-image';
import { common, createLowlight } from 'lowlight';

import { SlashCommandExtension } from './slash-command';
import { BlockHandleExtension } from './block-handle';
import { CommentMark } from './comment';
import { MentionExtension } from './mention';
import { EmojiExtension } from './emoji';
import { ImageWithCaption } from './image-caption';
import type { MentionItem } from '../types/editor';

// Create lowlight instance with common languages
const lowlight = createLowlight(common);

export interface ExtensionOptions {
  placeholder?: string;
  onMentionSearch?: (query: string) => Promise<MentionItem[]>;
  enableCollaboration?: boolean;
}

/**
 * Get all configured Tiptap extensions
 */
export function getExtensions(options: ExtensionOptions = {}) {
  const { placeholder = 'Type \'/\' for commands...', onMentionSearch } = options;

  return [
    // Core
    Document,
    Paragraph,
    Text,
    HardBreak,
    History.configure({
      depth: 100,
    }),
    Dropcursor.configure({
      color: 'var(--editor-dropcursor-color, #3b82f6)',
      width: 2,
    }),
    Gapcursor,
    Typography,
    Placeholder.configure({
      placeholder,
      emptyEditorClass: 'is-editor-empty',
      emptyNodeClass: 'is-empty',
    }),

    // Text formatting
    Bold,
    Italic,
    Underline,
    Strike,
    Code,
    TextStyle,
    Color,
    Highlight.configure({
      multicolor: true,
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        rel: 'noopener noreferrer',
        target: '_blank',
      },
    }),

    // Block types
    Heading.configure({
      levels: [1, 2, 3, 4, 5, 6],
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
      alignments: ['left', 'center', 'right', 'justify'],
    }),
    BulletList,
    OrderedList,
    ListItem,
    TaskList,
    TaskItem.configure({
      nested: true,
    }),
    Blockquote,
    CodeBlockLowlight.configure({
      lowlight,
      defaultLanguage: 'plaintext',
    }),
    HorizontalRule,

    // Tables
    Table.configure({
      resizable: true,
      HTMLAttributes: {
        class: 'editor-table',
      },
    }),
    TableRow,
    TableCell,
    TableHeader,

    // Images
    Image.configure({
      inline: false,
      allowBase64: true,
    }),
    ImageWithCaption,

    // Custom extensions
    SlashCommandExtension,
    BlockHandleExtension,
    CommentMark,
    EmojiExtension,

    // Mentions (if search handler provided)
    ...(onMentionSearch
      ? [
          MentionExtension.configure({
            HTMLAttributes: {
              class: 'mention',
            },
            suggestion: {
              items: async ({ query }: { query: string }) => {
                return onMentionSearch(query);
              },
            },
          }),
        ]
      : []),
  ];
}

/**
 * Get minimal extensions for simple text editing
 */
export function getMinimalExtensions(placeholder = 'Start typing...') {
  return [
    Document,
    Paragraph,
    Text,
    HardBreak,
    History.configure({ depth: 50 }),
    Placeholder.configure({
      placeholder,
      emptyEditorClass: 'is-editor-empty',
    }),
    Bold,
    Italic,
    Code,
    Link.configure({ openOnClick: false }),
    BulletList,
    OrderedList,
    ListItem,
  ];
}

export { lowlight };
