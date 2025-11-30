/**
 * Whiteboard Component - Main whiteboard canvas using React Flow
 */

import React, { useState, useCallback, useEffect, useRef, useMemo, createContext, useContext } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import { X, ArrowLeft } from 'lucide-react';
import { PaperNode } from './nodes/PaperNode';
import { StickyNode } from './nodes/StickyNode';
import { TextNode } from './nodes/TextNode';
import { ShapeNode } from './nodes/ShapeNode';
import { WhiteboardToolbar, WhiteboardTool } from './WhiteboardToolbar';
import { PaperSelector } from './PaperSelector';
import { whiteboardStorageService } from '../../services/whiteboardStorageService';
import { generateBlockId } from '../../../editor/utils/idGenerator';
import type { 
  WhiteboardState, 
  WhiteboardNodeSerialized,
  WhiteboardEdgeSerialized,
  PaperNodeData,
  StickyNodeData,
  TextNodeData,
  ShapeNodeData,
  Paper,
} from '../../types/paper';

import 'reactflow/dist/style.css';

// Context for node data changes
type NodeDataChangeHandler = (nodeId: string, data: Record<string, unknown>) => void;
const NodeDataChangeContext = createContext<NodeDataChangeHandler | null>(null);

export const useNodeDataChange = () => {
  const context = useContext(NodeDataChangeContext);
  return context;
};

const nodeTypes = {
  paper: PaperNode,
  sticky: StickyNode,
  text: TextNode,
  shape: ShapeNode,
};

interface WhiteboardProps {
  projectId: string;
  projectName: string;
  onClose: () => void;
}

const WhiteboardContent: React.FC<WhiteboardProps> = ({ projectId, projectName, onClose }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [activeTool, setActiveTool] = useState<WhiteboardTool>('select');
  const [showGrid, setShowGrid] = useState(true);
  const [showPaperSelector, setShowPaperSelector] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [whiteboardId, setWhiteboardId] = useState<string | null>(null);
  
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { getViewport, setViewport, fitView, zoomIn, zoomOut, getZoom, project } = useReactFlow();

  // History for undo/redo
  const [history, setHistory] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isUndoRedoing = useRef(false);

  // Get existing paper IDs on whiteboard
  const existingPaperIds = useMemo(() => {
    return nodes
      .filter(n => n.type === 'paper')
      .map(n => (n.data as PaperNodeData).paperId);
  }, [nodes]);

  // Load whiteboard state
  useEffect(() => {
    async function loadWhiteboard() {
      try {
        const state = await whiteboardStorageService.getOrCreateWhiteboard(projectId);
        setWhiteboardId(state.id);
        
        // Convert serialized nodes/edges to React Flow format
        const loadedNodes = state.nodes.map((n: WhiteboardNodeSerialized) => ({
          id: n.id,
          type: n.type,
          position: n.position,
          data: n.data,
          width: n.width,
          height: n.height,
        }));
        
        const loadedEdges = state.edges.map((e: WhiteboardEdgeSerialized) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          type: e.type || 'default',
          label: e.label,
          style: e.style,
          markerEnd: e.markerEnd ? { type: MarkerType.ArrowClosed } : undefined,
        }));
        
        setNodes(loadedNodes);
        setEdges(loadedEdges);
        
        // Restore viewport
        if (state.viewport) {
          setTimeout(() => {
            setViewport(state.viewport);
          }, 100);
        }
        
        // Initialize history
        setHistory([{ nodes: loadedNodes, edges: loadedEdges }]);
        setHistoryIndex(0);
      } catch (error) {
        console.error('Failed to load whiteboard:', error);
      }
    }
    
    loadWhiteboard();
  }, [projectId, setNodes, setEdges, setViewport]);

  // Save whiteboard state
  const saveWhiteboard = useCallback(async () => {
    if (!whiteboardId) return;
    
    setIsSaving(true);
    try {
      const viewport = getViewport();
      
      const serializedNodes: WhiteboardNodeSerialized[] = nodes.map(n => ({
        id: n.id,
        type: n.type || 'default',
        position: n.position,
        data: n.data,
        width: n.width ?? undefined,
        height: n.height ?? undefined,
      }));
      
      const serializedEdges = edges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: e.type,
        label: typeof e.label === 'string' ? e.label : undefined,
        style: e.style ? {
          strokeDasharray: typeof e.style.strokeDasharray === 'string' ? e.style.strokeDasharray : undefined,
          stroke: typeof e.style.stroke === 'string' ? e.style.stroke : undefined,
        } : undefined,
        markerEnd: e.markerEnd ? 'arrow' : undefined,
      }));
      
      const state: WhiteboardState = {
        id: whiteboardId,
        projectId,
        nodes: serializedNodes,
        edges: serializedEdges,
        viewport,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await whiteboardStorageService.saveWhiteboard(state);
    } catch (error) {
      console.error('Failed to save whiteboard:', error);
    } finally {
      setIsSaving(false);
    }
  }, [whiteboardId, projectId, nodes, edges, getViewport]);

  // Auto-save on changes
  useEffect(() => {
    if (whiteboardId && !isUndoRedoing.current) {
      const timer = setTimeout(() => {
        saveWhiteboard();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [nodes, edges, whiteboardId, saveWhiteboard]);

  // Add to history
  useEffect(() => {
    if (!isUndoRedoing.current && historyIndex >= 0) {
      const currentState = history[historyIndex];
      const hasChanges = 
        JSON.stringify(currentState?.nodes) !== JSON.stringify(nodes) ||
        JSON.stringify(currentState?.edges) !== JSON.stringify(edges);
      
      if (hasChanges && nodes.length > 0) {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({ nodes: [...nodes], edges: [...edges] });
        setHistory(newHistory.slice(-50)); // Keep last 50 states
        setHistoryIndex(newHistory.length - 1);
      }
    }
    isUndoRedoing.current = false;
  }, [nodes, edges]);

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      isUndoRedoing.current = true;
      const prevState = history[historyIndex - 1];
      setNodes(prevState.nodes);
      setEdges(prevState.edges);
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex, setNodes, setEdges]);

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isUndoRedoing.current = true;
      const nextState = history[historyIndex + 1];
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex, setNodes, setEdges]);

  // Handle connections
  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge({
      ...params,
      type: 'smoothstep',
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: '#6B7280' },
    }, eds));
  }, [setEdges]);

  // Handle canvas click for creating nodes
  const onPaneClick = useCallback((event: React.MouseEvent) => {
    if (activeTool === 'select' || activeTool === 'pan') return;
    
    const bounds = reactFlowWrapper.current?.getBoundingClientRect();
    if (!bounds) return;
    
    const position = project({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    });
    
    let newNode: Node | null = null;
    const id = generateBlockId();
    
    switch (activeTool) {
      case 'text':
        newNode = {
          id,
          type: 'text',
          position,
          data: { content: '', fontSize: 'medium' } as TextNodeData,
        };
        break;
      case 'sticky':
        newNode = {
          id,
          type: 'sticky',
          position,
          data: { content: '', color: 'yellow' } as StickyNodeData,
          style: { width: 200, height: 150 },
        };
        break;
      case 'rectangle':
        newNode = {
          id,
          type: 'shape',
          position,
          data: { shapeType: 'rectangle', fillColor: '#3B82F6', borderColor: '#1D4ED8' } as ShapeNodeData,
          style: { width: 120, height: 80 },
        };
        break;
      case 'circle':
        newNode = {
          id,
          type: 'shape',
          position,
          data: { shapeType: 'circle', fillColor: '#10B981', borderColor: '#059669' } as ShapeNodeData,
          style: { width: 100, height: 100 },
        };
        break;
      case 'triangle':
        newNode = {
          id,
          type: 'shape',
          position,
          data: { shapeType: 'triangle', fillColor: '#F59E0B', borderColor: '#D97706' } as ShapeNodeData,
          style: { width: 100, height: 100 },
        };
        break;
    }
    
    if (newNode) {
      setNodes((nds) => [...nds, newNode as Node]);
      setActiveTool('select');
    }
  }, [activeTool, project, setNodes]);

  // Handle adding paper to whiteboard
  const handleAddPaper = useCallback((paper: Paper) => {
    const id = generateBlockId();
    const position = project({
      x: window.innerWidth / 2 - 140,
      y: window.innerHeight / 2 - 100,
    });
    
    const paperNode: Node<PaperNodeData> = {
      id,
      type: 'paper',
      position,
      data: {
        paperId: paper.id,
        title: paper.title,
        authors: paper.authors.map(a => a.name),
        year: paper.year,
        doi: paper.doi,
        citationCount: paper.citationCount,
        comments: [],
      },
    };
    
    setNodes((nds) => [...nds, paperNode]);
  }, [project, setNodes]);

  // Handle node data change (for updating comments, content, etc.)
  const handleNodeDataChange = useCallback((nodeId: string, data: Record<string, unknown>) => {
    setNodes((nds) => nds.map((node) => {
      if (node.id === nodeId) {
        return {
          ...node,
          data: {
            ...node.data,
            ...data,
          },
        };
      }
      return node;
    }));
  }, [setNodes]);

  // Handle delete selected nodes
  const handleDelete = useCallback(() => {
    setNodes((nds) => nds.filter((node) => !node.selected));
    setEdges((eds) => eds.filter((edge) => !edge.selected));
  }, [setNodes, setEdges]);

  // Handle duplicate selected nodes
  const handleDuplicate = useCallback(() => {
    const selectedNodes = nodes.filter((node) => node.selected);
    if (selectedNodes.length === 0) return;

    const newNodes = selectedNodes.map((node) => ({
      ...node,
      id: generateBlockId(),
      position: {
        x: node.position.x + 20,
        y: node.position.y + 20,
      },
      selected: true,
      data: { ...node.data },
    }));

    // Deselect original nodes and add new ones
    setNodes((nds) => [
      ...nds.map((n) => ({ ...n, selected: false })),
      ...newNodes,
    ]);
  }, [nodes, setNodes]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'v' || e.key === 'V') setActiveTool('select');
      if (e.key === 'h' || e.key === 'H') setActiveTool('pan');
      if (e.key === 't' || e.key === 'T') setActiveTool('text');
      if (e.key === 'n' || e.key === 'N') setActiveTool('sticky');
      if (e.key === 'r' || e.key === 'R') setActiveTool('rectangle');
      if (e.key === 'c' || e.key === 'C') setActiveTool('circle');
      if (e.key === 'a' || e.key === 'A') setActiveTool('arrow');
      if (e.key === 'p' || e.key === 'P') setShowPaperSelector(true);
      if (e.key === 'g' || e.key === 'G') setShowGrid((g) => !g);
      if (e.key === 'Delete' || e.key === 'Backspace') handleDelete();
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault();
        handleRedo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveWhiteboard();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        handleDuplicate();
      }
      if (e.key === 'Escape') {
        setActiveTool('select');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDelete, handleUndo, handleRedo, saveWhiteboard, handleDuplicate]);

  // Check if any nodes are selected
  const hasSelection = nodes.some((n) => n.selected) || edges.some((e) => e.selected);

  return (
    <div className="h-full w-full flex flex-col bg-gray-100">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Back to projects"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="font-semibold text-gray-800">{projectName}</h1>
            <p className="text-xs text-gray-500">Whiteboard</p>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Close"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      
      {/* Canvas */}
      <div ref={reactFlowWrapper} className="flex-1">
        <NodeDataChangeContext.Provider value={handleNodeDataChange}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            panOnDrag={activeTool === 'pan'}
            selectionOnDrag={activeTool === 'select'}
            panOnScroll
            zoomOnScroll
            fitView
            fitViewOptions={{ padding: 0.2 }}
            className={activeTool === 'pan' ? 'cursor-grab' : ''}
            defaultEdgeOptions={{
              type: 'smoothstep',
              markerEnd: { type: MarkerType.ArrowClosed },
            }}
          >
            {showGrid && <Background color="#e5e7eb" gap={20} />}
            <MiniMap 
              className="!bg-white !rounded-lg !shadow-lg !border !border-gray-200"
              nodeColor={(node) => {
                switch (node.type) {
                  case 'paper': return '#3B82F6';
                  case 'sticky': return '#FCD34D';
                  case 'text': return '#6B7280';
                  case 'shape': return '#10B981';
                  default: return '#9CA3AF';
                }
              }}
            />
            <Controls className="!bg-white !rounded-lg !shadow-lg !border !border-gray-200" />
            
            <WhiteboardToolbar
              activeTool={activeTool}
              onToolChange={setActiveTool}
              zoom={getZoom()}
              onZoomIn={zoomIn}
              onZoomOut={zoomOut}
              onZoomFit={() => fitView({ padding: 0.2 })}
              showGrid={showGrid}
              onToggleGrid={() => setShowGrid((g) => !g)}
              canUndo={historyIndex > 0}
              canRedo={historyIndex < history.length - 1}
              onUndo={handleUndo}
              onRedo={handleRedo}
              onSave={saveWhiteboard}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              hasSelection={hasSelection}
            onAddPaper={() => setShowPaperSelector(true)}
            isSaving={isSaving}
          />
          </ReactFlow>
        </NodeDataChangeContext.Provider>
      </div>
      
      {/* Paper Selector Modal */}
      <PaperSelector
        isOpen={showPaperSelector}
        onClose={() => setShowPaperSelector(false)}
        onSelectPaper={handleAddPaper}
        existingPaperIds={existingPaperIds}
      />
    </div>
  );
};

// Wrap with ReactFlowProvider
export const Whiteboard: React.FC<WhiteboardProps> = (props) => (
  <ReactFlowProvider>
    <WhiteboardContent {...props} />
  </ReactFlowProvider>
);
