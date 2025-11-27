import React, { useState } from 'react';
import type { TocHeading } from '../types/editor';

/**
 * Outline data structure for sidebar
 */
interface OutlineItem {
  id: string;
  title: string;
  expanded?: boolean;
  active?: boolean;
  children?: OutlineItem[];
}

// Default outline data matching the reference design
const INITIAL_OUTLINE: OutlineItem[] = [
  {
    id: 'ch1',
    title: 'Chapter 1: Awakening',
    expanded: true,
    children: [
      { id: 'p1', title: 'Part 1: Androids' },
      { id: 'p2', title: 'Part 2: Electric Sheeps' },
      { id: 'p3', title: 'Part 3: Encounter', active: true },
      { id: 'p4', title: 'Part 4: Arrival' },
      { id: 'p5', title: 'Part 5: Friendship' },
      { id: 'p6', title: 'Part 6: Death' },
      { id: 'p7', title: 'Part 7: Greed' },
      { id: 'p8', title: 'Part 8: The Last Chapter' },
    ],
  },
  { id: 'ch2', title: 'Chapter 2: Reborn', expanded: false, children: [] },
  { id: 'ch3', title: 'Chapter 3: Death', expanded: false, children: [] },
  { id: 'ch4', title: 'Chapter 4: Legends', expanded: false, children: [] },
  { id: 'ch5', title: 'Chapter 5: The End', expanded: false, children: [] },
];

// Icons
const ArrowLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

interface TableOfContentsProps {
  headings: TocHeading[];
  onHeadingClick: (heading: TocHeading) => void;
  activeHeadingId?: string;
}

/**
 * Modern outline sidebar component matching the reference design
 */
export const TableOfContents: React.FC<TableOfContentsProps> = ({
  headings,
  onHeadingClick,
}) => {
  const [outline, setOutline] = useState<OutlineItem[]>(INITIAL_OUTLINE);
  const [activePartId, setActivePartId] = useState<string>('p3');

  // Toggle section expand/collapse
  const toggleSection = (id: string) => {
    setOutline((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, expanded: !item.expanded } : item
      )
    );
  };

  // Handle part click
  const handlePartClick = (partId: string) => {
    setActivePartId(partId);
    // Find corresponding heading and scroll to it
    const partIndex = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'].indexOf(partId);
    if (partIndex >= 0 && headings[partIndex]) {
      onHeadingClick(headings[partIndex]);
    }
  };

  return (
    <aside className="outline-sidebar">
      <div className="outline-content">
        {/* Back button */}
        <button className="back-button" title="Go Back">
          <ArrowLeftIcon />
        </button>

        {/* Document title */}
        <h2 className="document-title">Legend Of X</h2>

        {/* Outline tree */}
        <div className="outline-tree">
          {outline.map((chapter) => (
            <div key={chapter.id} className="outline-chapter">
              <button
                className="chapter-header"
                onClick={() => toggleSection(chapter.id)}
              >
                <span className="chapter-toggle">
                  {chapter.expanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
                </span>
                <span className="chapter-title">{chapter.title}</span>
              </button>

              {chapter.expanded && chapter.children && chapter.children.length > 0 && (
                <div className="chapter-parts">
                  {chapter.children.map((part) => (
                    <div
                      key={part.id}
                      className={`part-item ${activePartId === part.id ? 'active' : ''}`}
                      onClick={() => handlePartClick(part.id)}
                    >
                      {part.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .outline-sidebar {
          width: 16rem;
          background: #ffffff;
          border-right: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          height: 100%;
          flex-shrink: 0;
          overflow-y: auto;
        }

        .outline-content {
          padding: 1rem;
        }

        .back-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.5rem;
          height: 2.5rem;
          padding: 0;
          background: transparent;
          border: 1px solid #e2e8f0;
          border-radius: 9999px;
          color: #475569;
          cursor: pointer;
          margin-bottom: 1rem;
          transition: all 0.2s;
        }

        .back-button:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }

        .document-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 1rem 0;
        }

        .outline-tree {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .outline-chapter {
          display: flex;
          flex-direction: column;
        }

        .chapter-header {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 0.375rem 0.5rem;
          background: transparent;
          border: none;
          border-radius: 0.25rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #475569;
          cursor: pointer;
          text-align: left;
          transition: background 0.15s;
        }

        .chapter-header:hover {
          background: #f8fafc;
        }

        .chapter-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 1rem;
          margin-right: 0.25rem;
          color: #94a3b8;
        }

        .chapter-title {
          flex: 1;
        }

        .chapter-parts {
          margin-left: 1rem;
          padding-left: 0.5rem;
          border-left: 1px solid #e2e8f0;
          margin-top: 0.25rem;
          margin-bottom: 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }

        .part-item {
          padding: 0.25rem 0.75rem;
          font-size: 0.875rem;
          color: #64748b;
          border-radius: 0.25rem;
          cursor: pointer;
          transition: all 0.15s;
        }

        .part-item:hover {
          color: #1e293b;
          background: #f8fafc;
        }

        .part-item.active {
          color: #2563eb;
          background: #eff6ff;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .outline-sidebar {
            display: none;
          }
        }
      `}</style>
    </aside>
  );
};

export default TableOfContents;
