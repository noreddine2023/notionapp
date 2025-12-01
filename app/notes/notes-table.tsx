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
import { NoteEditorDialog } from "@/components/notes";
import { useNotesStore, type Note } from "@/lib/stores";

/**
 * Notes Table Component
 *
 * A fully featured data table with filtering, sorting, and pagination.
 * Now connected to Zustand store for real data management.
 */
export function NotesTable() {
  const { notes, deleteNote } = useNotesStore();
  const [selectedNoteId, setSelectedNoteId] = React.useState<string | null>(
    null
  );
  const [dialogMode, setDialogMode] = React.useState<"view" | "edit" | "create">(
    "view"
  );
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const handleView = (id: string) => {
    setSelectedNoteId(id);
    setDialogMode("view");
    setDialogOpen(true);
  };

  const handleEdit = (id: string) => {
    setSelectedNoteId(id);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this note?")) {
      deleteNote(id);
    }
  };

  const handleCreate = () => {
    setSelectedNoteId(null);
    setDialogMode("create");
    setDialogOpen(true);
  };

  /**
   * Table Columns Definition
   *
   * Architecture Decision: TanStack Table column definitions are type-safe
   * and support sorting, filtering, and custom cell rendering.
   */
  const columns: ColumnDef<Note, unknown>[] = React.useMemo(
    () => [
      {
        accessorKey: "title",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Title" />
        ),
        cell: ({ row }) => {
          const note = row.original;
          return (
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => handleView(note.id)}
            >
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
          return tags.some((tag: string) =>
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
            <span className="text-muted-foreground">
              {row.original.updatedAt}
            </span>
          );
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          return (
            <DataTableRowActions
              onView={() => handleView(row.original.id)}
              onEdit={() => handleEdit(row.original.id)}
              onDelete={() => handleDelete(row.original.id)}
            />
          );
        },
      },
    ],
    []
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={notes}
        searchKey="title"
        searchPlaceholder="Search notes..."
        onAddNew={handleCreate}
      />

      <NoteEditorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        noteId={selectedNoteId}
        mode={dialogMode}
      />
    </>
  );
}
