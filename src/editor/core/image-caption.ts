import { Node, mergeAttributes } from '@tiptap/core';

export interface ImageWithCaptionOptions {
  HTMLAttributes: Record<string, unknown>;
  allowedMimeTypes: string[];
  maxSize: number; // in bytes
}

/**
 * Custom image node with caption, alignment, and width controls
 */
export const ImageWithCaption = Node.create<ImageWithCaptionOptions>({
  name: 'imageWithCaption',

  addOptions() {
    return {
      HTMLAttributes: {},
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
      maxSize: 10 * 1024 * 1024, // 10MB
    };
  },

  group: 'block',

  content: 'inline*',

  draggable: true,

  isolating: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: '',
      },
      title: {
        default: null,
      },
      width: {
        default: '100%',
      },
      alignment: {
        default: 'center',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'figure[data-type="image-with-caption"]',
        getAttrs: (element) => {
          const img = element.querySelector('img');
          return {
            src: img?.getAttribute('src'),
            alt: img?.getAttribute('alt') || '',
            title: img?.getAttribute('title'),
            width: element.getAttribute('data-width') || '100%',
            alignment: element.getAttribute('data-alignment') || 'center',
          };
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const { src, alt, title, width, alignment } = node.attrs;

    return [
      'figure',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'image-with-caption',
        'data-width': width,
        'data-alignment': alignment,
        class: `image-with-caption align-${alignment}`,
        style: `width: ${width}; margin: 0 auto;`,
      }),
      [
        'img',
        {
          src,
          alt,
          title,
          draggable: 'false',
        },
      ],
      ['figcaption', { class: 'image-caption' }, 0],
    ];
  },

  addCommands() {
    return {
      setImageWithCaption:
        (options: { src: string; alt?: string; title?: string }) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
            content: [{ type: 'text', text: options.alt || '' }],
          });
        },

      updateImageWithCaption:
        (attrs: Partial<{ src: string; alt: string; title: string; width: string; alignment: string }>) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, attrs);
        },

      setImageAlignment:
        (alignment: 'left' | 'center' | 'right') =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, { alignment });
        },

      setImageWidth:
        (width: string) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, { width });
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      // Delete the entire image block on backspace when at start
      Backspace: () => {
        const { selection } = this.editor.state;
        const { $anchor } = selection;
        
        // Check if we're at the start of an image caption
        if ($anchor.parent.type.name === this.name && $anchor.parentOffset === 0) {
          return this.editor.commands.deleteNode(this.name);
        }
        
        return false;
      },
    };
  },
});

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageWithCaption: {
      setImageWithCaption: (options: { src: string; alt?: string; title?: string }) => ReturnType;
      updateImageWithCaption: (attrs: Partial<{ src: string; alt: string; title: string; width: string; alignment: string }>) => ReturnType;
      setImageAlignment: (alignment: 'left' | 'center' | 'right') => ReturnType;
      setImageWidth: (width: string) => ReturnType;
    };
  }
}
