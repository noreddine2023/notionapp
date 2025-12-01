"use client";

import * as React from "react";
import { FileText, Star, Tag } from "lucide-react";

import {
  DataTable,
  DataTableColumnHeader,
  DataTableRowActions,
  type ColumnDef,
} from "@/components/dashboard";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

/**
 * Note Type for Table
 */
interface Note {
  id: string;
  title: string;
  tags: string[];
  updatedAt: string;
  createdAt: string;
  isFavorite: boolean;
}

/**
 * Mock Notes Data
 * In production, this would come from server actions or API calls.
 */
const mockNotes: Note[] = [
  {
    id: "1",
    title: "Machine Learning Research Notes",
    tags: ["ML", "Research"],
    updatedAt: "2024-01-15",
    createdAt: "2024-01-01",
    isFavorite: true,
  },
  {
    id: "2",
    title: "Weekly Team Standup Notes",
    tags: ["Team", "Agile"],
    updatedAt: "2024-01-14",
    createdAt: "2023-12-15",
    isFavorite: false,
  },
  {
    id: "3",
    title: "Product Roadmap 2024",
    tags: ["Planning", "Product"],
    updatedAt: "2024-01-13",
    createdAt: "2024-01-02",
    isFavorite: true,
  },
  {
    id: "4",
    title: "API Design Guidelines",
    tags: ["Engineering", "Documentation"],
    updatedAt: "2024-01-12",
    createdAt: "2023-11-20",
    isFavorite: false,
  },
  {
    id: "5",
    title: "User Interview Findings",
    tags: ["UX", "Research"],
    updatedAt: "2024-01-11",
    createdAt: "2024-01-05",
    isFavorite: false,
  },
  {
    id: "6",
    title: "Sprint Retrospective - January",
    tags: ["Team", "Agile"],
    updatedAt: "2024-01-10",
    createdAt: "2024-01-10",
    isFavorite: false,
  },
  {
    id: "7",
    title: "Competitive Analysis",
    tags: ["Strategy", "Research"],
    updatedAt: "2024-01-09",
    createdAt: "2023-12-28",
    isFavorite: true,
  },
  {
    id: "8",
    title: "Performance Optimization Notes",
    tags: ["Engineering", "Performance"],
    updatedAt: "2024-01-08",
    createdAt: "2024-01-03",
    isFavorite: false,
  },
];

/**
 * Table Columns Definition
 * 
 * Architecture Decision: TanStack Table column definitions are type-safe
 * and support sorting, filtering, and custom cell rendering.
 */
const columns: ColumnDef<Note, unknown>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => {
      const note = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950">
            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium">{note.title}</span>
            <span className="text-xs text-muted-foreground">
              Created {note.createdAt}
            </span>
          </div>
          {note.isFavorite && (
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ row }) => {
      const tags = row.original.tags;
      return (
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              <Tag className="mr-1 h-3 w-3" />
              {tag}
            </Badge>
          ))}
        </div>
      );
    },
    filterFn: (row, _id, value) => {
      const tags = row.original.tags;
      return tags.some((tag) =>
        tag.toLowerCase().includes(value.toLowerCase())
      );
    },
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Updated" />
    ),
    cell: ({ row }) => {
      return (
        <span className="text-muted-foreground">{row.original.updatedAt}</span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <DataTableRowActions
          onView={() => console.log("View", row.original.id)}
          onEdit={() => console.log("Edit", row.original.id)}
          onDelete={() => console.log("Delete", row.original.id)}
        />
      );
    },
  },
];

/**
 * Notes Table Component
 * 
 * A fully featured data table with filtering, sorting, and pagination.
 */
export function NotesTable() {
  return (
    <DataTable
      columns={columns}
      data={mockNotes}
      searchKey="title"
      searchPlaceholder="Search notes..."
    />
  );
}
