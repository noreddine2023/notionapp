import React from 'react';
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';

/**
 * Custom node view component for images with captions
 */
export const ImageBlock: React.FC<NodeViewProps> = ({
  node,
  updateAttributes,
  selected,
}) => {
  const { src, alt, width, alignment } = node.attrs;

  // Handle width change
  const handleWidthChange = (newWidth: string) => {
    updateAttributes({ width: newWidth });
  };

  // Handle alignment change
  const handleAlignmentChange = (newAlignment: 'left' | 'center' | 'right') => {
    updateAttributes({ alignment: newAlignment });
  };

  return (
    <NodeViewWrapper
      className={`image-block-wrapper ${selected ? 'selected' : ''}`}
      data-alignment={alignment}
      style={{ textAlign: alignment }}
    >
      <figure
        className="image-with-caption"
        style={{ width, margin: alignment === 'center' ? '0 auto' : undefined }}
      >
        <img src={src} alt={alt || ''} draggable={false} />
        
        {/* Caption */}
        <NodeViewContent as="figcaption" className="image-caption" />
      </figure>

      {/* Image controls (shown when selected) */}
      {selected && (
        <div className="image-controls">
          {/* Alignment controls */}
          <div className="image-control-group">
            <button
              type="button"
              className={`image-control-btn ${alignment === 'left' ? 'active' : ''}`}
              onClick={() => handleAlignmentChange('left')}
              title="Align left"
              aria-label="Align left"
            >
              ⬅
            </button>
            <button
              type="button"
              className={`image-control-btn ${alignment === 'center' ? 'active' : ''}`}
              onClick={() => handleAlignmentChange('center')}
              title="Align center"
              aria-label="Align center"
            >
              ↔
            </button>
            <button
              type="button"
              className={`image-control-btn ${alignment === 'right' ? 'active' : ''}`}
              onClick={() => handleAlignmentChange('right')}
              title="Align right"
              aria-label="Align right"
            >
              ➡
            </button>
          </div>

          {/* Width controls */}
          <div className="image-control-group">
            <button
              type="button"
              className={`image-control-btn ${width === '50%' ? 'active' : ''}`}
              onClick={() => handleWidthChange('50%')}
              title="Half width"
              aria-label="Half width"
            >
              50%
            </button>
            <button
              type="button"
              className={`image-control-btn ${width === '75%' ? 'active' : ''}`}
              onClick={() => handleWidthChange('75%')}
              title="Three-quarter width"
              aria-label="Three-quarter width"
            >
              75%
            </button>
            <button
              type="button"
              className={`image-control-btn ${width === '100%' ? 'active' : ''}`}
              onClick={() => handleWidthChange('100%')}
              title="Full width"
              aria-label="Full width"
            >
              100%
            </button>
          </div>
        </div>
      )}

      <style>{imageBlockStyles}</style>
    </NodeViewWrapper>
  );
};

const imageBlockStyles = `
  .image-block-wrapper {
    position: relative;
    margin: 1em 0;
  }

  .image-block-wrapper.selected figure {
    outline: 2px solid var(--editor-primary);
    outline-offset: 2px;
  }

  .image-block-wrapper figure {
    margin: 0;
    border-radius: 4px;
    overflow: hidden;
  }

  .image-block-wrapper img {
    display: block;
    width: 100%;
    height: auto;
    border-radius: 4px;
  }

  .image-block-wrapper .image-caption {
    padding: 0.5em;
    text-align: center;
    color: var(--editor-text-muted);
    font-size: 0.875em;
    border: none;
    outline: none;
  }

  .image-block-wrapper .image-caption:empty::before {
    content: 'Add a caption...';
    color: var(--editor-placeholder);
  }

  .image-controls {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 0.5rem;
    padding: 0.5rem;
    background: var(--editor-menu-bg);
    border: 1px solid var(--editor-border);
    border-radius: 8px;
    box-shadow: var(--editor-menu-shadow);
    margin-bottom: 0.5rem;
  }

  .image-control-group {
    display: flex;
    gap: 2px;
  }

  .image-control-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    height: 28px;
    padding: 0 0.5rem;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: var(--editor-text);
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .image-control-btn:hover {
    background: var(--editor-code-bg);
  }

  .image-control-btn.active {
    background: var(--editor-selection);
    color: var(--editor-primary);
  }
`;

export default ImageBlock;
