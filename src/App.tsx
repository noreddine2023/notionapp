import React, { useCallback } from 'react';
import { BlockEditor } from './editor/components/BlockEditor';
import type { Block } from './editor/types/blocks';

// Sample content for the new block-based editor
const sampleBlocks: Block[] = [
  {
    id: '1',
    type: 'h1',
    content: 'Legend Of X',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    type: 'h2',
    content: 'Chapter 1: Awakening',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    type: 'text',
    content: 'Lorem ipsum dolor sit amet consectetur. In lorem varius non arcu eget. Odio odio placerat sit enim pretium sed risus vitae. Velit egestas montes convallis cras venenatis suspendisse consequat sit.',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    type: 'text',
    content: 'Facilisis fames commodo enim vivamus cursus eget eu. Tristique platea duis et tristique ultrices dui diam nunc. Mauris elementum sem lacus viverra suspendisse.',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    type: 'h3',
    content: 'Part 1: Androids',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '6',
    type: 'text',
    content: 'Lorem ipsum dolor sit amet consectetur. At feugiat ac placerat habitant nec sed ultrices. Rutrum massa ipsum bibendum ac at feugiat felis ante.',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '7',
    type: 'h3',
    content: 'Part 2: Electric Sheeps',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '8',
    type: 'bullet',
    content: 'First item in the list',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '9',
    type: 'bullet',
    content: 'Second item in the list',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '10',
    type: 'todo',
    content: 'Complete the editor implementation',
    props: { checked: true },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '11',
    type: 'todo',
    content: 'Add more features',
    props: { checked: false },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '12',
    type: 'quote',
    content: 'The best way to predict the future is to invent it.',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '13',
    type: 'code',
    content: 'const hello = "world";',
    props: { language: 'javascript' },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '14',
    type: 'divider',
    content: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '15',
    type: 'text',
    content: "Try typing '/' to see available commands, or drag blocks to reorder them!",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

/**
 * Main application component - Modern Document Editor
 */
const App: React.FC = () => {
  // Handle content change
  const handleChange = useCallback((blocks: Block[]) => {
    console.log('Content updated:', blocks);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-white text-slate-800 font-sans">
      {/* Simple header */}
      <header className="border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-800">Notion-Style Editor</h1>
        <span className="text-sm text-gray-500">Block-based editing</span>
      </header>

      {/* Editor */}
      <main className="flex-1 overflow-hidden">
        <BlockEditor
          initialContent={sampleBlocks}
          onChange={handleChange}
          autoFocus
        />
      </main>
    </div>
  );
};

export default App;
