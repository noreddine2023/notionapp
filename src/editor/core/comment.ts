import { Mark, mergeAttributes } from '@tiptap/core';

export interface CommentMarkAttributes {
  commentId: string;
  resolved?: boolean;
}

/**
 * Custom mark for inline comment highlights
 * Highlights text that has comments attached to it
 */
export const CommentMark = Mark.create<{ HTMLAttributes: Record<string, unknown> }>({
  name: 'comment',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      commentId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-comment-id'),
        renderHTML: (attributes) => {
          if (!attributes.commentId) {
            return {};
          }
          return {
            'data-comment-id': attributes.commentId,
          };
        },
      },
      resolved: {
        default: false,
        parseHTML: (element) => element.getAttribute('data-resolved') === 'true',
        renderHTML: (attributes) => {
          return {
            'data-resolved': attributes.resolved ? 'true' : 'false',
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-comment-id]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: `comment-highlight ${HTMLAttributes['data-resolved'] === 'true' ? 'resolved' : ''}`,
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setComment:
        (commentId: string) =>
        ({ commands }) => {
          return commands.setMark(this.name, { commentId, resolved: false });
        },

      unsetComment:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },

      resolveComment:
        (commentId: string) =>
        ({ editor, dispatch }) => {
          if (dispatch) {
            const { state } = editor;
            const { tr, doc } = state;

            doc.descendants((node, pos) => {
              if (!node.isText) return;

              const marks = node.marks;
              for (const mark of marks) {
                if (mark.type.name === this.name && mark.attrs.commentId === commentId) {
                  tr.removeMark(pos, pos + node.nodeSize, mark);
                  tr.addMark(
                    pos,
                    pos + node.nodeSize,
                    this.type.create({ commentId, resolved: true })
                  );
                }
              }
            });

            editor.view.dispatch(tr);
          }
          return true;
        },

      unresolveComment:
        (commentId: string) =>
        ({ editor, dispatch }) => {
          if (dispatch) {
            const { state } = editor;
            const { tr, doc } = state;

            doc.descendants((node, pos) => {
              if (!node.isText) return;

              const marks = node.marks;
              for (const mark of marks) {
                if (mark.type.name === this.name && mark.attrs.commentId === commentId) {
                  tr.removeMark(pos, pos + node.nodeSize, mark);
                  tr.addMark(
                    pos,
                    pos + node.nodeSize,
                    this.type.create({ commentId, resolved: false })
                  );
                }
              }
            });

            editor.view.dispatch(tr);
          }
          return true;
        },

      removeComment:
        (commentId: string) =>
        ({ editor, dispatch }) => {
          if (dispatch) {
            const { state } = editor;
            const { tr, doc } = state;

            doc.descendants((node, pos) => {
              if (!node.isText) return;

              const marks = node.marks;
              for (const mark of marks) {
                if (mark.type.name === this.name && mark.attrs.commentId === commentId) {
                  tr.removeMark(pos, pos + node.nodeSize, mark);
                }
              }
            });

            editor.view.dispatch(tr);
          }
          return true;
        },
    };
  },
});

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    comment: {
      setComment: (commentId: string) => ReturnType;
      unsetComment: () => ReturnType;
      resolveComment: (commentId: string) => ReturnType;
      unresolveComment: (commentId: string) => ReturnType;
      removeComment: (commentId: string) => ReturnType;
    };
  }
}
