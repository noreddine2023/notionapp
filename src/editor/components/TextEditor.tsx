import { forwardRef, useImperativeHandle, useCallback, useState, useEffect } from 'react';
import { EditorContent, BubbleMenu } from '@tiptap/react';
import type { Editor } from '@tiptap/core';
import { useTextEditor } from '../hooks/useTextEditor';
import { TopToolbar } from './TopToolbar';
import { BubbleMenuToolbar } from './BubbleMenuToolbar';
import { SlashCommandMenu } from './SlashCommandMenu';
import type { TextEditorProps, TextEditorRef, MentionItem } from '../types/editor';
import type { SlashCommandState } from '../core/slash-command';
import '../styles/editor.css';

/**
 * Main TextEditor component
 * A rich text editor powered by Tiptap with Notion-style block editing
 */
export const TextEditor = forwardRef<TextEditorRef, TextEditorProps>(
  (props, ref) => {
    const {
      value,
      initialValue,
      onChange,
      readOnly = false,
      className = '',
      placeholder = "Type '/' for commands...",
      autoFocus = false,
      debounceMs = 300,
      onImageUpload,
      onMentionSearch,
      hideToolbar = false,
      minHeight = '200px',
      maxHeight,
    } = props;

    // Slash command state
    const [slashCommandState, setSlashCommandState] = useState<SlashCommandState>({
      isOpen: false,
      query: '',
      position: null,
      range: null,
    });

    // Initialize editor
    const {
      editor,
      getJSON,
      getHTML,
      getText,
      focus,
      clear,
      isEmpty,
    } = useTextEditor({
      initialValue,
      value,
      onChange,
      readOnly,
      placeholder,
      autoFocus,
      debounceMs,
      onMentionSearch,
    });

    // Set up slash command callback
    useEffect(() => {
      if (editor) {
        editor.commands.setSlashCommandCallback(setSlashCommandState);
      }
    }, [editor]);

    // Block handle is now simpler - no automatic tracking needed

    // Expose ref methods
    useImperativeHandle(ref, () => ({
      getEditor: () => editor,
      getJSON,
      getHTML,
      getText,
      focus,
      clear,
      isEmpty,
    }), [editor, getJSON, getHTML, getText, focus, clear, isEmpty]);

    // Handle image upload
    const handleImageUpload = useCallback(async () => {
      if (!editor || !onImageUpload) return;

      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async () => {
        const file = input.files?.[0];
        if (file) {
          try {
            const url = await onImageUpload(file);
            editor.chain().focus().setImage({ src: url }).run();
          } catch (error) {
            console.error('Image upload failed:', error);
          }
        }
      };
      input.click();
    }, [editor, onImageUpload]);

    // Handle slash command execution
    const handleSlashCommand = useCallback((action: (ed: Editor) => void) => {
      if (!editor) return;

      // Remove the slash query text
      if (slashCommandState.range) {
        editor.chain()
          .focus()
          .deleteRange(slashCommandState.range)
          .run();
      }

      // Execute the command
      action(editor);

      // Reset state
      setSlashCommandState({
        isOpen: false,
        query: '',
        position: null,
        range: null,
      });
    }, [editor, slashCommandState.range]);

    // Handle slash menu close
    const handleSlashMenuClose = useCallback(() => {
      setSlashCommandState({
        isOpen: false,
        query: '',
        position: null,
        range: null,
      });
    }, []);

    if (!editor) {
      return null;
    }

    return (
      <div 
        className={`editor-container ${className}`}
        style={{ 
          minHeight,
          maxHeight,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Top Toolbar */}
        {!hideToolbar && !readOnly && (
          <TopToolbar 
            editor={editor} 
            onImageUpload={onImageUpload ? handleImageUpload : undefined}
          />
        )}

        {/* Editor Content */}
        <div className="editor-wrapper" style={{ minHeight, flex: 1 }}>
          {/* Main Editor */}
          <EditorContent editor={editor} />

          {/* Bubble Menu (appears on text selection) */}
          {!readOnly && editor && (
            <BubbleMenu 
              editor={editor}
              tippyOptions={{ 
                duration: 100,
                placement: 'top',
              }}
            >
              <BubbleMenuToolbar editor={editor} />
            </BubbleMenu>
          )}

          {/* Slash Command Menu */}
          {!readOnly && slashCommandState.isOpen && slashCommandState.position && (
            <SlashCommandMenu
              query={slashCommandState.query}
              position={slashCommandState.position}
              onSelect={handleSlashCommand}
              onClose={handleSlashMenuClose}
            />
          )}
        </div>
      </div>
    );
  }
);

TextEditor.displayName = 'TextEditor';

// Default mention search (for demo purposes)
export const defaultMentionSearch = async (query: string): Promise<MentionItem[]> => {
  const users: MentionItem[] = [
    { id: '1', label: 'John Doe', email: 'john@example.com' },
    { id: '2', label: 'Jane Smith', email: 'jane@example.com' },
    { id: '3', label: 'Bob Wilson', email: 'bob@example.com' },
  ];

  return users.filter((user) =>
    user.label.toLowerCase().includes(query.toLowerCase())
  );
};
