import React, { useState, useCallback } from 'react';
import type { Page } from '../types/editor';

// Icons
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
  </svg>
);

const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
  </svg>
);

const DocumentIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14,2 14,8 20,8"/>
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14"/><path d="M5 12h14"/>
  </svg>
);

const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>
  </svg>
);

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6"/>
  </svg>
);

// Sample pages data
const SAMPLE_PAGES: Page[] = [
  {
    id: '1',
    title: 'Getting Started',
    icon: '📚',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    children: [
      {
        id: '1-1',
        title: 'Introduction',
        icon: '📝',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-18'),
      },
      {
        id: '1-2',
        title: 'Quick Start Guide',
        icon: '🚀',
        createdAt: new Date('2024-01-16'),
        updatedAt: new Date('2024-01-19'),
      },
    ],
  },
  {
    id: '2',
    title: 'Project Notes',
    icon: '📋',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-22'),
    children: [
      {
        id: '2-1',
        title: 'Meeting Notes',
        icon: '📅',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-22'),
      },
      {
        id: '2-2',
        title: 'Action Items',
        icon: '✅',
        createdAt: new Date('2024-01-11'),
        updatedAt: new Date('2024-01-21'),
      },
    ],
  },
  {
    id: '3',
    title: 'Research',
    icon: '🔬',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-25'),
  },
  {
    id: '4',
    title: 'Ideas',
    icon: '💡',
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-23'),
  },
];

interface PagesSidebarProps {
  pages?: Page[];
  activePageId?: string;
  onPageSelect?: (page: Page) => void;
  onNewPage?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface PageItemProps {
  page: Page;
  level: number;
  isActive: boolean;
  expandedIds: Set<string>;
  onToggleExpand: (pageId: string) => void;
  onSelect: (page: Page) => void;
}

const PageItem: React.FC<PageItemProps> = ({
  page,
  level,
  isActive,
  expandedIds,
  onToggleExpand,
  onSelect,
}) => {
  const hasChildren = page.children && page.children.length > 0;
  const isExpanded = expandedIds.has(page.id);

  return (
    <div className="page-item-wrapper">
      <div
        className={`page-item ${isActive ? 'active' : ''}`}
        style={{ paddingLeft: `${0.75 + level * 1}rem` }}
        onClick={() => onSelect(page)}
      >
        {hasChildren && (
          <button
            className="page-expand-btn"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(page.id);
            }}
          >
            {isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
          </button>
        )}
        {!hasChildren && <span className="page-expand-placeholder" />}
        <span className="page-icon">{page.icon || <DocumentIcon />}</span>
        <span className="page-title">{page.title}</span>
      </div>
      {hasChildren && isExpanded && (
        <div className="page-children">
          {page.children!.map((child) => (
            <PageItem
              key={child.id}
              page={child}
              level={level + 1}
              isActive={isActive}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Pages navigation sidebar component - Notion-style left sidebar
 * Displays a list of pages with hierarchical navigation
 */
export const PagesSidebar: React.FC<PagesSidebarProps> = ({
  pages = SAMPLE_PAGES,
  activePageId,
  onPageSelect,
  onNewPage,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['1', '2']));
  const [localActivePageId, setLocalActivePageId] = useState<string>(activePageId || '1');

  const handleToggleExpand = useCallback((pageId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(pageId)) {
        next.delete(pageId);
      } else {
        next.add(pageId);
      }
      return next;
    });
  }, []);

  const handlePageSelect = useCallback(
    (page: Page) => {
      setLocalActivePageId(page.id);
      onPageSelect?.(page);
    },
    [onPageSelect]
  );

  const handleNewPage = useCallback(() => {
    onNewPage?.();
  }, [onNewPage]);

  if (isCollapsed) {
    return (
      <aside className="pages-sidebar collapsed">
        <button
          className="pages-sidebar-toggle"
          onClick={onToggleCollapse}
          title="Expand sidebar"
        >
          <MenuIcon />
        </button>
        <style>{pagesSidebarStyles}</style>
      </aside>
    );
  }

  return (
    <aside className="pages-sidebar">
      {/* Header with workspace name */}
      <div className="pages-header">
        <div className="workspace-info">
          <div className="workspace-icon">W</div>
          <span className="workspace-name">Workspace</span>
        </div>
        <button
          className="collapse-btn"
          onClick={onToggleCollapse}
          title="Collapse sidebar"
        >
          <ChevronLeftIcon />
        </button>
      </div>

      {/* Quick access links */}
      <div className="quick-links">
        <button className="quick-link-item">
          <SearchIcon />
          <span>Search</span>
        </button>
        <button className="quick-link-item">
          <SettingsIcon />
          <span>Settings</span>
        </button>
        <button className="quick-link-item">
          <TrashIcon />
          <span>Trash</span>
        </button>
      </div>

      {/* Pages section */}
      <div className="pages-section">
        <div className="pages-section-header">
          <span className="pages-section-title">Pages</span>
        </div>
        <div className="pages-list">
          {pages.map((page) => (
            <PageItem
              key={page.id}
              page={page}
              level={0}
              isActive={localActivePageId === page.id}
              expandedIds={expandedIds}
              onToggleExpand={handleToggleExpand}
              onSelect={handlePageSelect}
            />
          ))}
        </div>
      </div>

      {/* New page button */}
      <div className="new-page-wrapper">
        <button className="new-page-btn" onClick={handleNewPage}>
          <PlusIcon />
          <span>New Page</span>
        </button>
      </div>

      <style>{pagesSidebarStyles}</style>
    </aside>
  );
};

const pagesSidebarStyles = `
  .pages-sidebar {
    width: 15rem;
    background: #f8fafc;
    border-right: 1px solid #e2e8f0;
    display: flex;
    flex-direction: column;
    height: 100%;
    flex-shrink: 0;
    overflow: hidden;
    transition: width 0.2s ease;
  }

  .pages-sidebar.collapsed {
    width: 3rem;
    align-items: center;
    padding-top: 0.75rem;
  }

  .pages-sidebar-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    padding: 0;
    background: transparent;
    border: none;
    border-radius: 0.375rem;
    color: #64748b;
    cursor: pointer;
    transition: all 0.15s;
  }

  .pages-sidebar-toggle:hover {
    background: #e2e8f0;
    color: #1e293b;
  }

  .pages-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .workspace-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .workspace-icon {
    width: 1.5rem;
    height: 1.5rem;
    background: #2563eb;
    border-radius: 0.375rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    font-size: 0.75rem;
    font-weight: 700;
  }

  .workspace-name {
    font-size: 0.875rem;
    font-weight: 600;
    color: #1e293b;
  }

  .collapse-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    padding: 0;
    background: transparent;
    border: none;
    border-radius: 0.25rem;
    color: #94a3b8;
    cursor: pointer;
    transition: all 0.15s;
  }

  .collapse-btn:hover {
    background: #e2e8f0;
    color: #475569;
  }

  .quick-links {
    display: flex;
    flex-direction: column;
    padding: 0.5rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .quick-link-item {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    width: 100%;
    padding: 0.5rem 0.75rem;
    background: transparent;
    border: none;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    color: #64748b;
    cursor: pointer;
    text-align: left;
    transition: all 0.15s;
  }

  .quick-link-item:hover {
    background: #e2e8f0;
    color: #1e293b;
  }

  .pages-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .pages-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 0.75rem 0.5rem;
  }

  .pages-section-title {
    font-size: 0.75rem;
    font-weight: 600;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .pages-list {
    flex: 1;
    overflow-y: auto;
    padding: 0 0.375rem;
  }

  .page-item-wrapper {
    margin-bottom: 0.125rem;
  }

  .page-item {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.75rem;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: all 0.15s;
    user-select: none;
  }

  .page-item:hover {
    background: #e2e8f0;
  }

  .page-item.active {
    background: #dbeafe;
    color: #2563eb;
  }

  .page-expand-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1rem;
    height: 1rem;
    padding: 0;
    background: transparent;
    border: none;
    border-radius: 0.25rem;
    color: #94a3b8;
    cursor: pointer;
    flex-shrink: 0;
    transition: all 0.15s;
  }

  .page-expand-btn:hover {
    background: #cbd5e1;
    color: #475569;
  }

  .page-expand-placeholder {
    width: 1rem;
    flex-shrink: 0;
  }

  .page-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.25rem;
    height: 1.25rem;
    font-size: 0.875rem;
    flex-shrink: 0;
    color: #64748b;
  }

  .page-item.active .page-icon {
    color: #2563eb;
  }

  .page-title {
    flex: 1;
    font-size: 0.875rem;
    color: #475569;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .page-item.active .page-title {
    color: #2563eb;
    font-weight: 500;
  }

  .page-children {
    margin-left: 0;
  }

  .new-page-wrapper {
    padding: 0.75rem;
    border-top: 1px solid #e2e8f0;
  }

  .new-page-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.5rem 0.75rem;
    background: transparent;
    border: 1px dashed #cbd5e1;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    color: #64748b;
    cursor: pointer;
    transition: all 0.15s;
  }

  .new-page-btn:hover {
    background: #e2e8f0;
    border-color: #94a3b8;
    color: #1e293b;
  }

  @media (max-width: 768px) {
    .pages-sidebar {
      display: none;
    }
  }
`;

export default PagesSidebar;
