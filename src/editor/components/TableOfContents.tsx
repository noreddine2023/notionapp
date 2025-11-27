import React, { useState, useMemo } from 'react';
import type { TocHeading } from '../types/editor';

interface TableOfContentsProps {
  headings: TocHeading[];
  onHeadingClick: (heading: TocHeading) => void;
  activeHeadingId?: string;
}

/**
 * Table of Contents sidebar component
 * Auto-generated from document headings
 */
export const TableOfContents: React.FC<TableOfContentsProps> = ({
  headings,
  onHeadingClick,
  activeHeadingId,
}) => {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [isMinimized, setIsMinimized] = useState(false);

  // Group headings by top-level sections
  const sections = useMemo(() => {
    const result: Array<{
      heading: TocHeading;
      children: TocHeading[];
    }> = [];

    let currentSection: { heading: TocHeading; children: TocHeading[] } | null = null;

    for (const heading of headings) {
      if (heading.level === 1) {
        // Start a new top-level section
        if (currentSection) {
          result.push(currentSection);
        }
        currentSection = { heading, children: [] };
      } else if (currentSection) {
        // Add to current section
        currentSection.children.push(heading);
      } else {
        // No top-level section yet, create a section for this heading
        currentSection = { heading, children: [] };
      }
    }

    if (currentSection) {
      result.push(currentSection);
    }

    return result;
  }, [headings]);

  // Toggle section collapse
  const toggleSection = (sectionId: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  if (isMinimized) {
    return (
      <div className="toc-sidebar minimized">
        <div className="toc-header">
          <button
            type="button"
            className="toc-collapse-btn"
            onClick={() => setIsMinimized(false)}
            title="Expand Table of Contents"
            aria-label="Expand Table of Contents"
          >
            →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="toc-sidebar">
      <div className="toc-header">
        <h3>Contents</h3>
        <button
          type="button"
          className="toc-collapse-btn"
          onClick={() => setIsMinimized(true)}
          title="Minimize Table of Contents"
          aria-label="Minimize Table of Contents"
        >
          ←
        </button>
      </div>

      <div className="toc-content">
        {sections.length === 0 ? (
          <div className="toc-empty">
            <p>No headings yet</p>
            <p>Add headings to your document to see the table of contents</p>
          </div>
        ) : (
          <ul className="toc-list" role="tree">
            {sections.map((section) => {
              const isCollapsed = collapsed.has(section.heading.id);
              const hasChildren = section.children.length > 0;

              return (
                <li key={section.heading.id} className="toc-item">
                  {hasChildren ? (
                    // Collapsible section
                    <div className="toc-section">
                      <button
                        type="button"
                        className="toc-section-header"
                        onClick={() => toggleSection(section.heading.id)}
                        aria-expanded={!isCollapsed}
                      >
                        <span className={`toc-section-toggle ${isCollapsed ? 'collapsed' : ''}`}>
                          ▼
                        </span>
                        <span className="toc-section-title">{section.heading.text}</span>
                        <span className="toc-section-count">{section.children.length + 1}</span>
                      </button>

                      <div className={`toc-section-items ${isCollapsed ? 'collapsed' : ''}`}>
                        {/* Top-level heading link */}
                        <button
                          type="button"
                          className={`toc-link level-${section.heading.level} ${
                            activeHeadingId === section.heading.id ? 'active' : ''
                          }`}
                          onClick={() => onHeadingClick(section.heading)}
                        >
                          <span className="toc-text">{section.heading.text}</span>
                        </button>

                        {/* Child headings */}
                        <ul className="toc-list">
                          {section.children.map((child) => (
                            <li key={child.id} className="toc-item">
                              <button
                                type="button"
                                className={`toc-link level-${child.level} ${
                                  activeHeadingId === child.id ? 'active' : ''
                                }`}
                                onClick={() => onHeadingClick(child)}
                              >
                                <span className="toc-level-indicator">H{child.level}</span>
                                <span className="toc-text">{child.text}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    // Single heading without children
                    <button
                      type="button"
                      className={`toc-link level-${section.heading.level} ${
                        activeHeadingId === section.heading.id ? 'active' : ''
                      }`}
                      onClick={() => onHeadingClick(section.heading)}
                    >
                      <span className="toc-level-indicator">H{section.heading.level}</span>
                      <span className="toc-text">{section.heading.text}</span>
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TableOfContents;
