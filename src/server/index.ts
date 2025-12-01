import express from 'express';
import cors from 'cors';
import type { Request, Response } from 'express';
import type { JSONContent } from '@tiptap/core';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// In-memory storage (replace with database in production)
interface Document {
  id: string;
  content: JSONContent;
  draft?: JSONContent;
  createdAt: Date;
  updatedAt: Date;
}

const documents = new Map<string, Document>();

// Create a default document
documents.set('default', {
  id: 'default',
  content: {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: 'Welcome to the Editor' }],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'This is a ' },
          { type: 'text', marks: [{ type: 'bold' }], text: 'rich text editor' },
          { type: 'text', text: ' powered by Tiptap.' },
        ],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Try typing ' },
          { type: 'text', marks: [{ type: 'code' }], text: '/' },
          { type: 'text', text: ' to see available commands!' },
        ],
      },
    ],
  },
  createdAt: new Date(),
  updatedAt: new Date(),
});

/**
 * GET /api/documents/:id
 * Load a document by ID
 */
app.get('/api/documents/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const doc = documents.get(id);

  if (!doc) {
    res.status(404).json({ error: 'Document not found' });
    return;
  }

  res.json({
    id: doc.id,
    content: doc.content,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  });
});

/**
 * PUT /api/documents/:id
 * Save a document
 */
app.put('/api/documents/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const content = req.body as JSONContent;

  if (!content || typeof content !== 'object') {
    res.status(400).json({ error: 'Invalid content' });
    return;
  }

  const existingDoc = documents.get(id);
  const now = new Date();

  const doc: Document = {
    id,
    content,
    createdAt: existingDoc?.createdAt || now,
    updatedAt: now,
  };

  documents.set(id, doc);

  res.json({
    id: doc.id,
    updatedAt: doc.updatedAt,
    message: 'Document saved successfully',
  });
});

/**
 * POST /api/documents/:id/draft
 * Auto-save draft
 */
app.post('/api/documents/:id/draft', (req: Request, res: Response) => {
  const { id } = req.params;
  const content = req.body as JSONContent;

  if (!content || typeof content !== 'object') {
    res.status(400).json({ error: 'Invalid content' });
    return;
  }

  const existingDoc = documents.get(id);

  if (existingDoc) {
    existingDoc.draft = content;
    existingDoc.updatedAt = new Date();
    documents.set(id, existingDoc);
  } else {
    // Create new document with draft
    const now = new Date();
    documents.set(id, {
      id,
      content: { type: 'doc', content: [] },
      draft: content,
      createdAt: now,
      updatedAt: now,
    });
  }

  res.json({
    id,
    message: 'Draft saved successfully',
  });
});

/**
 * POST /api/upload
 * Handle image uploads
 * In production, this would save to a file storage service
 */
app.post('/api/upload', (_req: Request, res: Response) => {
  // For demo purposes, we'll just return a placeholder URL
  // In production, implement actual file upload logic
  const timestamp = Date.now();
  const placeholderUrl = `https://picsum.photos/800/400?random=${timestamp}`;

  res.json({
    url: placeholderUrl,
    message: 'File uploaded successfully',
  });
});

/**
 * Health check endpoint
 */
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log(`  GET  /api/documents/:id    - Load document`);
  console.log(`  PUT  /api/documents/:id    - Save document`);
  console.log(`  POST /api/documents/:id/draft - Auto-save draft`);
  console.log(`  POST /api/upload           - Upload image`);
  console.log(`  GET  /api/health           - Health check`);
});
