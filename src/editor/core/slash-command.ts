import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

export interface SlashCommandState {
  isOpen: boolean;
  query: string;
  position: { top: number; left: number } | null;
  range: { from: number; to: number } | null;
}

export const slashCommandPluginKey = new PluginKey<SlashCommandState>('slashCommand');

/**
 * Extension to track slash command state
 * Triggers when "/" is typed and tracks the query text
 */
export const SlashCommandExtension = Extension.create({
  name: 'slashCommand',

  addStorage() {
    return {
      isOpen: false,
      query: '',
      position: null,
      range: null,
      onStateChange: null as ((state: SlashCommandState) => void) | null,
    };
  },

  addProseMirrorPlugins() {
    const extension = this;

    return [
      new Plugin({
        key: slashCommandPluginKey,

        state: {
          init(): SlashCommandState {
            return {
              isOpen: false,
              query: '',
              position: null,
              range: null,
            };
          },

          apply(tr, value, _oldState, newState): SlashCommandState {
            const { selection } = newState;
            const { $from } = selection;

            // Only check in empty selection (cursor)
            if (!selection.empty) {
              return { isOpen: false, query: '', position: null, range: null };
            }

            // Get text before cursor in current text block
            const textBefore = $from.parent.textContent.slice(0, $from.parentOffset);

            // Find "/" at start of line or after whitespace
            const slashMatch = textBefore.match(/(?:^|\s)(\/[^\s]*)$/);

            if (slashMatch) {
              const fullMatch = slashMatch[1];
              const query = fullMatch.slice(1); // Remove the "/"
              const matchStart = $from.pos - fullMatch.length;

              return {
                isOpen: true,
                query,
                position: null, // Will be calculated by component
                range: { from: matchStart, to: $from.pos },
              };
            }

            return { isOpen: false, query: '', position: null, range: null };
          },
        },

        props: {
          handleKeyDown(view, event) {
            const state = slashCommandPluginKey.getState(view.state);

            if (!state?.isOpen) {
              return false;
            }

            // Let the component handle these keys
            if (
              event.key === 'ArrowUp' ||
              event.key === 'ArrowDown' ||
              event.key === 'Enter' ||
              event.key === 'Escape'
            ) {
              // We'll handle this in the React component
              return false;
            }

            return false;
          },
        },

        view() {
          return {
            update(view) {
              const state = slashCommandPluginKey.getState(view.state);
              if (state && extension.storage.onStateChange) {
                // Calculate position for the menu
                const { from } = view.state.selection;
                const coords = view.coordsAtPos(from);
                const editorRect = view.dom.getBoundingClientRect();

                const position = {
                  top: coords.bottom - editorRect.top + 4,
                  left: coords.left - editorRect.left,
                };

                extension.storage.onStateChange({
                  ...state,
                  position,
                });
              }
            },
          };
        },
      }),
    ];
  },

  addCommands() {
    return {
      setSlashCommandCallback:
        (callback: (state: SlashCommandState) => void) =>
        () => {
          this.storage.onStateChange = callback;
          return true;
        },
      clearSlashCommand:
        () =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            // Optionally clear the "/" from the editor
            const state = slashCommandPluginKey.getState(tr);
            if (state?.range) {
              tr.delete(state.range.from, state.range.to);
            }
          }
          return true;
        },
    };
  },
});

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    slashCommand: {
      setSlashCommandCallback: (callback: (state: SlashCommandState) => void) => ReturnType;
      clearSlashCommand: () => ReturnType;
    };
  }
}
