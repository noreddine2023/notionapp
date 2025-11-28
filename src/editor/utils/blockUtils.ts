import type { Block, BlockType } from '../types/blocks';
import { generateBlockId } from './idGenerator';

/**
 * Create a new block with default values
 */
export function createBlock(type: BlockType = 'text', content: string = ''): Block {
  const now = new Date();
  return {
    id: generateBlockId(),
    type,
    content,
    props: type === 'todo' ? { checked: false } : undefined,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Get placeholder text for a block type
 */
export function getBlockPlaceholder(type: BlockType): string {
  switch (type) {
    case 'h1':
      return 'Heading 1';
    case 'h2':
      return 'Heading 2';
    case 'h3':
      return 'Heading 3';
    case 'bullet':
      return 'List item';
    case 'numbered':
      return 'List item';
    case 'todo':
      return 'To-do';
    case 'quote':
      return 'Quote';
    case 'code':
      return 'Code';
    case 'text':
    default:
      return "Type '/' for commands...";
  }
}

/**
 * Check if the block type is a heading
 */
export function isHeading(type: BlockType): boolean {
  return type === 'h1' || type === 'h2' || type === 'h3';
}

/**
 * Check if the block type is a list item
 */
export function isListItem(type: BlockType): boolean {
  return type === 'bullet' || type === 'numbered' || type === 'todo';
}

// Define types for the old JSON format
interface OldContentNode {
  type: string;
  text?: string;
  content?: OldContentNode[];
  attrs?: {
    level?: number;
    language?: string;
    checked?: boolean;
  };
}

interface OldContent {
  type: string;
  content?: OldContentNode[];
}

/**
 * Extract text from nested content nodes
 */
function extractText(nodes: OldContentNode[] | undefined): string {
  if (!nodes) return '';
  return nodes.map((node) => {
    if (node.text) return node.text;
    if (node.content) return extractText(node.content);
    return '';
  }).join('');
}

/**
 * Convert old JSON content format to new Block[] format
 */
export function convertFromOldFormat(content: OldContent): Block[] {
  const blocks: Block[] = [];

  if (!content.content) {
    return [createBlock('text', '')];
  }

  for (const node of content.content) {
    let blockType: BlockType = 'text';
    let blockContent = '';
    const props: Block['props'] = {};

    // Get text content from node
    blockContent = extractText(node.content);

    // Map node type to block type
    switch (node.type) {
      case 'heading':
        if (node.attrs?.level === 1) blockType = 'h1';
        else if (node.attrs?.level === 2) blockType = 'h2';
        else if (node.attrs?.level === 3) blockType = 'h3';
        else blockType = 'h1';
        break;
      case 'paragraph':
        blockType = 'text';
        break;
      case 'bulletList':
        // For lists, we need to flatten the list items
        if (node.content) {
          for (const li of node.content) {
            const liContent = extractText(li.content);
            blocks.push(createBlock('bullet', liContent));
          }
        }
        continue; // Skip adding the parent list node
      case 'orderedList':
        if (node.content) {
          for (const li of node.content) {
            const liContent = extractText(li.content);
            blocks.push(createBlock('numbered', liContent));
          }
        }
        continue;
      case 'taskList':
        if (node.content) {
          for (const li of node.content) {
            const liContent = extractText(li.content);
            const block = createBlock('todo', liContent);
            block.props = { checked: li.attrs?.checked || false };
            blocks.push(block);
          }
        }
        continue;
      case 'blockquote':
        blockType = 'quote';
        break;
      case 'codeBlock':
        blockType = 'code';
        props.language = node.attrs?.language || 'plaintext';
        break;
      case 'horizontalRule':
        blockType = 'divider';
        blockContent = '';
        break;
      default:
        blockType = 'text';
    }

    const block = createBlock(blockType, blockContent);
    if (Object.keys(props).length > 0) {
      block.props = { ...block.props, ...props };
    }
    blocks.push(block);
  }

  // Ensure at least one block exists
  if (blocks.length === 0) {
    blocks.push(createBlock('text', ''));
  }

  return blocks;
}
