import type { JSONContent, Editor } from '@tiptap/core';
import { generateHTML, generateJSON } from '@tiptap/core';
import { getExtensions } from '../core/extensions';

/**
 * Convert JSON content to HTML string
 */
export function jsonToHtml(content: JSONContent): string {
  const extensions = getExtensions();
  return generateHTML(content, extensions);
}

/**
 * Convert HTML string to JSON content
 */
export function htmlToJson(html: string): JSONContent {
  const extensions = getExtensions();
  return generateJSON(html, extensions);
}

/**
 * Convert JSON content to Markdown string
 */
export function jsonToMarkdown(content: JSONContent): string {
  const lines: string[] = [];

  function processNode(node: JSONContent, indent = ''): void {
    switch (node.type) {
      case 'doc':
        node.content?.forEach((child) => processNode(child, indent));
        break;

      case 'paragraph':
        const text = getTextContent(node);
        lines.push(text);
        lines.push('');
        break;

      case 'heading':
        const level = node.attrs?.level || 1;
        const headingText = getTextContent(node);
        lines.push('#'.repeat(level) + ' ' + headingText);
        lines.push('');
        break;

      case 'bulletList':
        node.content?.forEach((item) => processNode(item, indent));
        lines.push('');
        break;

      case 'orderedList':
        node.content?.forEach((item, index) => {
          const itemText = getTextContent(item);
          lines.push(`${indent}${index + 1}. ${itemText}`);
        });
        lines.push('');
        break;

      case 'listItem':
        const itemText = getTextContent(node);
        lines.push(`${indent}- ${itemText}`);
        break;

      case 'taskList':
        node.content?.forEach((item) => processNode(item, indent));
        lines.push('');
        break;

      case 'taskItem':
        const checked = node.attrs?.checked ? 'x' : ' ';
        const taskText = getTextContent(node);
        lines.push(`${indent}- [${checked}] ${taskText}`);
        break;

      case 'blockquote':
        const quoteText = getTextContent(node);
        lines.push(`> ${quoteText}`);
        lines.push('');
        break;

      case 'codeBlock':
        const lang = node.attrs?.language || '';
        const code = getTextContent(node);
        lines.push('```' + lang);
        lines.push(code);
        lines.push('```');
        lines.push('');
        break;

      case 'horizontalRule':
        lines.push('---');
        lines.push('');
        break;

      case 'image':
        const alt = node.attrs?.alt || '';
        const src = node.attrs?.src || '';
        lines.push(`![${alt}](${src})`);
        lines.push('');
        break;

      case 'table':
        // Simple table conversion
        node.content?.forEach((row, rowIndex) => {
          const cells =
            row.content?.map((cell) => getTextContent(cell)).join(' | ') || '';
          lines.push(`| ${cells} |`);
          if (rowIndex === 0) {
            const separator = row.content?.map(() => '---').join(' | ') || '';
            lines.push(`| ${separator} |`);
          }
        });
        lines.push('');
        break;

      default:
        // Handle other node types by extracting text
        if (node.content) {
          node.content.forEach((child) => processNode(child, indent));
        }
    }
  }

  processNode(content);
  return lines.join('\n').trim();
}

/**
 * Convert Markdown string to JSON content
 * Note: This is a simplified converter. For production, use a proper markdown parser.
 */
export function markdownToJson(markdown: string): JSONContent {
  const lines = markdown.split('\n');
  const content: JSONContent[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      content.push({
        type: 'heading',
        attrs: { level: headingMatch[1].length },
        content: [{ type: 'text', text: headingMatch[2] }],
      });
      i++;
      continue;
    }

    // Horizontal rule
    if (line.match(/^(-{3,}|\*{3,}|_{3,})$/)) {
      content.push({ type: 'horizontalRule' });
      i++;
      continue;
    }

    // Code block
    if (line.startsWith('```')) {
      const rawLang = line.slice(3).trim();
      // Sanitize language: only allow alphanumeric, plus, sharp, and dash
      const lang = rawLang.match(/^[a-zA-Z0-9+#-]+$/) ? rawLang : 'plaintext';
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      content.push({
        type: 'codeBlock',
        attrs: { language: lang || 'plaintext' },
        content: [{ type: 'text', text: codeLines.join('\n') }],
      });
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      content.push({
        type: 'blockquote',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: line.slice(2) }],
          },
        ],
      });
      i++;
      continue;
    }

    // Task list item
    const taskMatch = line.match(/^-\s+\[([ x])\]\s+(.+)$/);
    if (taskMatch) {
      const items: JSONContent[] = [];
      while (i < lines.length && lines[i].match(/^-\s+\[([ x])\]\s+/)) {
        const match = lines[i].match(/^-\s+\[([ x])\]\s+(.+)$/);
        if (match) {
          items.push({
            type: 'taskItem',
            attrs: { checked: match[1] === 'x' },
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: match[2] }],
              },
            ],
          });
        }
        i++;
      }
      content.push({ type: 'taskList', content: items });
      continue;
    }

    // Bullet list
    const bulletMatch = line.match(/^[-*]\s+(.+)$/);
    if (bulletMatch) {
      const items: JSONContent[] = [];
      while (i < lines.length && lines[i].match(/^[-*]\s+/)) {
        const match = lines[i].match(/^[-*]\s+(.+)$/);
        if (match) {
          items.push({
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: match[1] }],
              },
            ],
          });
        }
        i++;
      }
      content.push({ type: 'bulletList', content: items });
      continue;
    }

    // Ordered list
    const orderedMatch = line.match(/^\d+\.\s+(.+)$/);
    if (orderedMatch) {
      const items: JSONContent[] = [];
      while (i < lines.length && lines[i].match(/^\d+\.\s+/)) {
        const match = lines[i].match(/^\d+\.\s+(.+)$/);
        if (match) {
          items.push({
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: match[1] }],
              },
            ],
          });
        }
        i++;
      }
      content.push({ type: 'orderedList', content: items });
      continue;
    }

    // Image
    const imageMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imageMatch) {
      content.push({
        type: 'image',
        attrs: { alt: imageMatch[1], src: imageMatch[2] },
      });
      i++;
      continue;
    }

    // Paragraph (or empty line)
    if (line.trim()) {
      content.push({
        type: 'paragraph',
        content: parseInlineMarks(line),
      });
    }
    i++;
  }

  return { type: 'doc', content };
}

/**
 * Get text content from a node recursively
 */
function getTextContent(node: JSONContent): string {
  if (node.text) {
    return node.text;
  }
  if (node.content) {
    return node.content.map(getTextContent).join('');
  }
  return '';
}

/**
 * Parse inline markdown marks (bold, italic, code, etc.)
 * Note: This is a simplified parser
 */
function parseInlineMarks(text: string): JSONContent[] {
  const content: JSONContent[] = [];

  // For simplicity, just return the text as-is
  // A proper implementation would parse inline marks
  if (text) {
    content.push({ type: 'text', text: text });
  }

  return content;
}

/**
 * Export editor content in specified format
 */
export function exportContent(
  editor: Editor,
  format: 'json' | 'html' | 'markdown' | 'text'
): string {
  switch (format) {
    case 'json':
      return JSON.stringify(editor.getJSON(), null, 2);
    case 'html':
      return editor.getHTML();
    case 'markdown':
      return jsonToMarkdown(editor.getJSON());
    case 'text':
      return editor.getText();
    default:
      return '';
  }
}

/**
 * Import content into editor
 */
export function importContent(
  editor: Editor,
  content: string,
  format: 'json' | 'html' | 'markdown'
): void {
  switch (format) {
    case 'json':
      editor.commands.setContent(JSON.parse(content));
      break;
    case 'html':
      editor.commands.setContent(content);
      break;
    case 'markdown':
      editor.commands.setContent(markdownToJson(content));
      break;
  }
}
