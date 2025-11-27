import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import type { Editor } from '@tiptap/core';
import {
  defaultSlashCommands,
  filterCommands,
  groupCommandsByCategory,
  commandCategories,
  type SlashCommand,
} from '../types/commands';

interface SlashCommandMenuProps {
  query: string;
  position: { top: number; left: number };
  onSelect: (action: (editor: Editor) => void) => void;
  onClose: () => void;
}

/**
 * Slash command menu component
 * Shows when typing "/" and allows quick block insertion
 */
export const SlashCommandMenu: React.FC<SlashCommandMenuProps> = ({
  query,
  position,
  onSelect,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Filter commands based on query
  const filteredCommands = useMemo(() => {
    return filterCommands(defaultSlashCommands, query);
  }, [query]);

  // Group commands by category
  const groupedCommands = useMemo(() => {
    return groupCommandsByCategory(filteredCommands);
  }, [filteredCommands]);

  // Flatten for keyboard navigation
  const flatCommands = useMemo(() => {
    const flat: SlashCommand[] = [];
    const sortedCategories = [...commandCategories].sort((a, b) => a.order - b.order);
    
    for (const category of sortedCategories) {
      const commands = groupedCommands.get(category.id);
      if (commands) {
        flat.push(...commands);
      }
    }
    
    return flat;
  }, [groupedCommands]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % flatCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + flatCommands.length) % flatCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selectedCommand = flatCommands[selectedIndex];
        if (selectedCommand) {
          onSelect(selectedCommand.action);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [flatCommands, selectedIndex, onSelect, onClose]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Scroll selected item into view
  useEffect(() => {
    const selectedEl = menuRef.current?.querySelector('.slash-command-item.selected');
    selectedEl?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  // Handle item click
  const handleItemClick = useCallback(
    (command: SlashCommand) => {
      onSelect(command.action);
    },
    [onSelect]
  );

  // Get index in flat list
  const getFlatIndex = (command: SlashCommand): number => {
    return flatCommands.indexOf(command);
  };

  if (flatCommands.length === 0) {
    return (
      <div
        ref={menuRef}
        className="slash-command-menu"
        style={{
          top: position.top,
          left: position.left,
        }}
      >
        <div className="slash-command-empty">No commands found</div>
        <style>{slashMenuStyles}</style>
      </div>
    );
  }

  const sortedCategories = [...commandCategories].sort((a, b) => a.order - b.order);

  return (
    <div
      ref={menuRef}
      className="slash-command-menu"
      style={{
        top: position.top,
        left: position.left,
      }}
      role="listbox"
      aria-label="Slash commands"
    >
      {sortedCategories.map((category) => {
        const commands = groupedCommands.get(category.id);
        if (!commands || commands.length === 0) return null;

        return (
          <div key={category.id} className="slash-command-category">
            <div className="slash-command-category-title">{category.title}</div>
            {commands.map((command) => {
              const flatIndex = getFlatIndex(command);
              const isSelected = flatIndex === selectedIndex;

              return (
                <button
                  key={command.id}
                  className={`slash-command-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleItemClick(command)}
                  onMouseEnter={() => setSelectedIndex(flatIndex)}
                  role="option"
                  aria-selected={isSelected}
                >
                  <span className="slash-command-icon">{command.icon}</span>
                  <div className="slash-command-content">
                    <span className="slash-command-title">{command.title}</span>
                    <span className="slash-command-description">{command.description}</span>
                  </div>
                </button>
              );
            })}
          </div>
        );
      })}
      <style>{slashMenuStyles}</style>
    </div>
  );
};

const slashMenuStyles = `
  .slash-command-menu {
    position: absolute;
    z-index: 50;
    max-height: 360px;
    min-width: 300px;
    max-width: 360px;
    overflow-y: auto;
    background: var(--editor-menu-bg);
    border: 1px solid var(--editor-border);
    border-radius: var(--editor-radius-lg);
    box-shadow: var(--editor-menu-shadow);
    padding: 0.625rem;
  }

  .slash-command-empty {
    padding: 1.25rem;
    text-align: center;
    color: var(--editor-text-muted);
    font-size: 0.9375rem;
  }

  .slash-command-category {
    margin-bottom: 0.625rem;
  }

  .slash-command-category:last-child {
    margin-bottom: 0;
  }

  .slash-command-category-title {
    padding: 0.375rem 0.625rem;
    font-size: 0.6875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--editor-text-muted);
  }

  .slash-command-item {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    width: 100%;
    padding: 0.625rem 0.75rem;
    border: none;
    border-radius: var(--editor-radius-md);
    background: transparent;
    color: var(--editor-text);
    cursor: pointer;
    text-align: left;
    transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .slash-command-item:hover,
  .slash-command-item.selected {
    background: var(--editor-primary-light);
  }

  .slash-command-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border-radius: var(--editor-radius-sm);
    background: var(--editor-code-bg);
    font-size: 15px;
    flex-shrink: 0;
  }

  .slash-command-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .slash-command-title {
    font-size: 0.9375rem;
    font-weight: 600;
    line-height: 1.3;
  }

  .slash-command-description {
    font-size: 0.8125rem;
    color: var(--editor-text-muted);
    line-height: 1.3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;
