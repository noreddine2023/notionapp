import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { PluginKey } from '@tiptap/pm/state';
import Suggestion, { SuggestionOptions } from '@tiptap/suggestion';
import type { MentionItem } from '../types/editor';

export interface MentionOptions {
  HTMLAttributes: Record<string, unknown>;
  suggestion: Omit<SuggestionOptions<MentionItem>, 'editor'>;
}

export const mentionPluginKey = new PluginKey('mention');

/**
 * Mention extension for @mentions with autocomplete
 */
export const MentionExtension = Node.create<MentionOptions>({
  name: 'mention',

  addOptions() {
    return {
      HTMLAttributes: {},
      suggestion: {
        char: '@',
        pluginKey: mentionPluginKey,
        command: ({ editor, range, props }) => {
          // Increase the range by one to include the space after
          const nodeAfter = editor.view.state.selection.$to.nodeAfter;
          const overrideSpace = nodeAfter?.text?.startsWith(' ');

          if (overrideSpace) {
            range.to += 1;
          }

          editor
            .chain()
            .focus()
            .insertContentAt(range, [
              {
                type: this.name,
                attrs: props,
              },
              {
                type: 'text',
                text: ' ',
              },
            ])
            .run();

          window.getSelection()?.collapseToEnd();
        },
        allow: ({ state, range }) => {
          const $from = state.doc.resolve(range.from);
          const type = state.schema.nodes[this.name];
          const allow = !!$from.parent.type.contentMatch.matchType(type);

          return allow;
        },
      },
    };
  },

  group: 'inline',

  inline: true,

  selectable: false,

  atom: true,

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-id'),
        renderHTML: (attributes) => {
          if (!attributes.id) {
            return {};
          }

          return {
            'data-id': attributes.id,
          };
        },
      },

      label: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-label'),
        renderHTML: (attributes) => {
          if (!attributes.label) {
            return {};
          }

          return {
            'data-label': attributes.label,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: `span[data-type="${this.name}"]`,
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(
        { 'data-type': this.name },
        this.options.HTMLAttributes,
        HTMLAttributes
      ),
      `@${node.attrs.label}`,
    ];
  },

  renderText({ node }) {
    return `@${node.attrs.label}`;
  },

  addKeyboardShortcuts() {
    return {
      Backspace: () =>
        this.editor.commands.command(({ tr, state }) => {
          let isMention = false;
          const { selection } = state;
          const { empty, anchor } = selection;

          if (!empty) {
            return false;
          }

          state.doc.nodesBetween(anchor - 1, anchor, (node, pos) => {
            if (node.type.name === this.name) {
              isMention = true;
              tr.insertText('', pos, pos + node.nodeSize);

              return false;
            }
          });

          return isMention;
        }),
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

/**
 * Default mention suggestion rendering
 * This should be implemented by the component using the extension
 */
export function createMentionSuggestion(
  onSearch: (query: string) => Promise<MentionItem[]>
): Partial<SuggestionOptions<MentionItem>> {
  return {
    items: async ({ query }) => {
      return onSearch(query);
    },
    render: () => {
      let popup: HTMLElement | null = null;
      let selectedIndex = 0;

      return {
        onStart: (props) => {
          popup = document.createElement('div');
          popup.className = 'mention-suggestions';
          document.body.appendChild(popup);

          // Position and render will be handled by onUpdate
        },

        onUpdate: (props) => {
          if (!popup) return;

          selectedIndex = 0;
          const items = props.items as MentionItem[];

          popup.innerHTML = items
            .map(
              (item, index) =>
                `<button class="mention-item ${index === selectedIndex ? 'selected' : ''}" data-index="${index}">
                  ${item.avatar ? `<img src="${item.avatar}" alt="" class="mention-avatar" />` : ''}
                  <span class="mention-label">${item.label}</span>
                </button>`
            )
            .join('');

          // Position the popup
          const rect = props.clientRect?.();
          if (rect) {
            popup.style.position = 'absolute';
            popup.style.top = `${rect.bottom + window.scrollY}px`;
            popup.style.left = `${rect.left + window.scrollX}px`;
          }

          // Add click handlers
          popup.querySelectorAll('.mention-item').forEach((el) => {
            el.addEventListener('click', () => {
              const index = parseInt(el.getAttribute('data-index') || '0');
              const item = items[index];
              if (item) {
                props.command(item);
              }
            });
          });
        },

        onKeyDown: (props) => {
          if (!popup) return false;

          const items = (props as unknown as { items: MentionItem[] }).items;

          if (props.event.key === 'ArrowDown') {
            selectedIndex = (selectedIndex + 1) % items.length;
            updateSelection(popup, selectedIndex);
            return true;
          }

          if (props.event.key === 'ArrowUp') {
            selectedIndex = (selectedIndex - 1 + items.length) % items.length;
            updateSelection(popup, selectedIndex);
            return true;
          }

          if (props.event.key === 'Enter') {
            const item = items[selectedIndex];
            if (item) {
              (props as unknown as { command: (item: MentionItem) => void }).command(item);
            }
            return true;
          }

          if (props.event.key === 'Escape') {
            popup.remove();
            popup = null;
            return true;
          }

          return false;
        },

        onExit: () => {
          if (popup) {
            popup.remove();
            popup = null;
          }
        },
      };
    },
  };
}

function updateSelection(popup: HTMLElement, selectedIndex: number) {
  popup.querySelectorAll('.mention-item').forEach((el, index) => {
    if (index === selectedIndex) {
      el.classList.add('selected');
    } else {
      el.classList.remove('selected');
    }
  });
}
