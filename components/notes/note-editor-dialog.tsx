"use client";

import * as React from "react";
import { FileText, Save, Star, Tag, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Textarea,
  Badge,
  ScrollArea,
} from "@/components/ui";
import { useNotesStore, type Note } from "@/lib/stores";
import { cn } from "@/lib/utils";

interface NoteEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  noteId?: string | null;
  mode: "view" | "edit" | "create";
}

/**
 * Note Editor Dialog Component
 *
 * A full-featured note editor with view, edit, and create modes.
 */
export function NoteEditorDialog({
  open,
  onOpenChange,
  noteId,
  mode: initialMode,
}: NoteEditorDialogProps) {
  const { addNote, updateNote, toggleFavorite, getNoteById } =
    useNotesStore();

  const note = noteId ? getNoteById(noteId) : null;

  const [mode, setMode] = React.useState<"view" | "edit" | "create">(
    initialMode
  );
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [tags, setTags] = React.useState<string[]>([]);
  const [newTag, setNewTag] = React.useState("");
  const [isFavorite, setIsFavorite] = React.useState(false);

  // Reset form when dialog opens or note changes
  React.useEffect(() => {
    if (open) {
      setMode(initialMode);
      if (note && (initialMode === "view" || initialMode === "edit")) {
        setTitle(note.title);
        setContent(note.content);
        setTags([...note.tags]);
        setIsFavorite(note.isFavorite);
      } else if (initialMode === "create") {
        setTitle("");
        setContent("");
        setTags([]);
        setIsFavorite(false);
      }
    }
  }, [open, note, initialMode]);

  const handleSave = () => {
    if (!title.trim()) return;

    if (mode === "create") {
      addNote({
        title: title.trim(),
        content: content.trim(),
        tags,
        isFavorite,
      });
      onOpenChange(false);
    } else if (mode === "edit" && noteId) {
      updateNote(noteId, {
        title: title.trim(),
        content: content.trim(),
        tags,
        isFavorite,
      });
      onOpenChange(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const isViewMode = mode === "view";
  const dialogTitle =
    mode === "create"
      ? "Create New Note"
      : mode === "edit"
      ? "Edit Note"
      : "View Note";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <DialogTitle>{dialogTitle}</DialogTitle>
            </div>
            <div className="flex items-center gap-2">
              {isViewMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMode("edit")}
                >
                  Edit
                </Button>
              )}
              {!isViewMode && (
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={!title.trim()}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (mode === "create" || mode === "edit") {
                    setIsFavorite(!isFavorite);
                  } else if (noteId) {
                    toggleFavorite(noteId);
                    setIsFavorite(!isFavorite);
                  }
                }}
              >
                <Star
                  className={cn(
                    "h-5 w-5",
                    isFavorite
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  )}
                />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden px-6 py-4">
          <div className="space-y-4 h-full flex flex-col">
            {/* Title */}
            <div>
              {isViewMode ? (
                <h2 className="text-2xl font-bold">{title}</h2>
              ) : (
                <Input
                  placeholder="Note title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-xl font-semibold border-none px-0 focus-visible:ring-0"
                />
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                  {!isViewMode && (
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              ))}
              {!isViewMode && (
                <div className="flex items-center gap-1">
                  <Input
                    placeholder="Add tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="h-7 w-24 text-xs"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAddTag}
                    className="h-7 px-2"
                  >
                    <Tag className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>

            {/* Content */}
            <ScrollArea className="flex-1">
              {isViewMode ? (
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                  {content || (
                    <span className="text-muted-foreground italic">
                      No content
                    </span>
                  )}
                </div>
              ) : (
                <Textarea
                  placeholder="Start writing your note..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[300px] resize-none border-none focus-visible:ring-0"
                />
              )}
            </ScrollArea>

            {/* Metadata */}
            {note && (
              <div className="text-xs text-muted-foreground pt-2 border-t">
                <span>Created: {note.createdAt}</span>
                <span className="mx-2">•</span>
                <span>Last updated: {note.updatedAt}</span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
