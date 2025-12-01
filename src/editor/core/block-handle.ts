import { Extension } from '@tiptap/core';

export interface BlockHandleState {
  visible: boolean;
  position: { top: number; left: number };
  nodePos: number;
  nodeType: string;
}

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
      lastNodePos: -1,
    };
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
        ({ editor }) => {
          const { state } = editor;
          const node = state.schema.nodes[nodeType]?.create();
          if (node) {
            const tr = state.tr.insert(pos, node);
            editor.view.dispatch(tr);
          }
          return true;
        },

      deleteBlockAt:
        (pos: number) =>
        ({ editor }) => {
          const { state } = editor;
          const node = state.doc.nodeAt(pos);
          if (node) {
            const tr = state.tr.delete(pos, pos + node.nodeSize);
            editor.view.dispatch(tr);
          }
          return true;
        },

      showBlockHandle:
        (state: BlockHandleState) =>
        () => {
          // Only update if position changed
          if (this.storage.lastNodePos !== state.nodePos) {
            this.storage.lastNodePos = state.nodePos;
            this.storage.state = state;
            this.storage.onStateChange?.(state);
          }
          return true;
        },

      hideBlockHandle:
        () =>
        () => {
          if (this.storage.state.visible) {
            this.storage.lastNodePos = -1;
            this.storage.state = {
              visible: false,
              position: { top: 0, left: 0 },
              nodePos: 0,
              nodeType: '',
            };
            this.storage.onStateChange?.(this.storage.state);
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
