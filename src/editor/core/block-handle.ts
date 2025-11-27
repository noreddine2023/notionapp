import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

export interface BlockHandleState {
  visible: boolean;
  position: { top: number; left: number };
  nodePos: number;
  nodeType: string;
}

export const blockHandlePluginKey = new PluginKey<BlockHandleState>('blockHandle');

/**
 * Extension to manage block handle (drag handle + plus button) state
 * Shows controls on the left side of each block on hover
 */
export const BlockHandleExtension = Extension.create({
  name: 'blockHandle',

  addStorage() {
    return {
      state: {
        visible: false,
        position: { top: 0, left: 0 },
        nodePos: 0,
        nodeType: '',
      } as BlockHandleState,
      onStateChange: null as ((state: BlockHandleState) => void) | null,
    };
  },

  addProseMirrorPlugins() {
    const extension = this;

    return [
      new Plugin({
        key: blockHandlePluginKey,

        props: {
          handleDOMEvents: {
            mousemove(view, event) {
              const target = event.target as HTMLElement;
              const editorDom = view.dom;
              const editorRect = editorDom.getBoundingClientRect();

              // Find the nearest block node
              const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });
              if (!pos) {
                if (extension.storage.state.visible) {
                  extension.storage.state = {
                    visible: false,
                    position: { top: 0, left: 0 },
                    nodePos: 0,
                    nodeType: '',
                  };
                  extension.storage.onStateChange?.(extension.storage.state);
                }
                return false;
              }

              // Get the resolved position and find the block node
              const $pos = view.state.doc.resolve(pos.pos);
              const depth = $pos.depth;

              // Find the top-level block node
              let blockPos = $pos.before(1);
              let node = view.state.doc.nodeAt(blockPos);

              // If we're inside a nested structure, get the outermost block
              if (depth > 1) {
                for (let d = 1; d <= depth; d++) {
                  const nodeAtDepth = view.state.doc.nodeAt($pos.before(d));
                  if (nodeAtDepth && nodeAtDepth.isBlock) {
                    blockPos = $pos.before(d);
                    node = nodeAtDepth;
                    break;
                  }
                }
              }

              if (!node) {
                return false;
              }

              // Get the DOM node and its position
              const domNode = view.nodeDOM(blockPos);
              if (!domNode || !(domNode instanceof HTMLElement)) {
                return false;
              }

              const blockRect = domNode.getBoundingClientRect();
              
              const newState: BlockHandleState = {
                visible: true,
                position: {
                  top: blockRect.top - editorRect.top,
                  left: -40, // Position to the left of the block
                },
                nodePos: blockPos,
                nodeType: node.type.name,
              };

              // Only update if state changed
              if (
                extension.storage.state.visible !== newState.visible ||
                extension.storage.state.nodePos !== newState.nodePos
              ) {
                extension.storage.state = newState;
                extension.storage.onStateChange?.(newState);
              }

              return false;
            },

            mouseleave(view, event) {
              // Check if we're leaving to outside the editor
              const relatedTarget = event.relatedTarget as HTMLElement;
              if (!relatedTarget || !view.dom.contains(relatedTarget)) {
                // Delay hiding to allow hovering over the handle
                setTimeout(() => {
                  if (extension.storage.state.visible) {
                    extension.storage.state = {
                      visible: false,
                      position: { top: 0, left: 0 },
                      nodePos: 0,
                      nodeType: '',
                    };
                    extension.storage.onStateChange?.(extension.storage.state);
                  }
                }, 100);
              }
              return false;
            },
          },
        },
      }),
    ];
  },

  addCommands() {
    return {
      setBlockHandleCallback:
        (callback: (state: BlockHandleState) => void) =>
        () => {
          this.storage.onStateChange = callback;
          return true;
        },

      insertBlockAt:
        (pos: number, nodeType: string) =>
        ({ editor, dispatch }) => {
          if (dispatch) {
            const { state } = editor;
            const node = state.schema.nodes[nodeType]?.create();
            if (node) {
              const tr = state.tr.insert(pos, node);
              editor.view.dispatch(tr);
            }
          }
          return true;
        },

      deleteBlockAt:
        (pos: number) =>
        ({ editor, dispatch }) => {
          if (dispatch) {
            const { state } = editor;
            const node = state.doc.nodeAt(pos);
            if (node) {
              const tr = state.tr.delete(pos, pos + node.nodeSize);
              editor.view.dispatch(tr);
            }
          }
          return true;
        },
    };
  },
});

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    blockHandle: {
      setBlockHandleCallback: (callback: (state: BlockHandleState) => void) => ReturnType;
      insertBlockAt: (pos: number, nodeType: string) => ReturnType;
      deleteBlockAt: (pos: number) => ReturnType;
    };
  }
}
